from __future__ import annotations

import json
import math
from collections import Counter
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

from rdkit import Chem
from rdkit.Chem import rdMolDescriptors

from .chemistry import load_sdf, with_explicit_hydrogens
from .contracts import BenchmarkCase, DEFAULT_WORK_DIR
from .artifact_contracts import sha256_file


EVALUATOR_LOADED_SOURCE_SHA256 = sha256_file(Path(__file__))


@dataclass(frozen=True)
class EvaluationResult:
    case_id: str
    passed: bool
    score: float
    formula_match: bool
    topology_match: bool
    anchor_max_displacement: float | None
    core_rmsd: float | None
    heavy_atom_rmsd: float | None
    severe_clashes: int
    disconnected_components: int
    failures: tuple[str, ...]
    diagnostics: tuple[str, ...]

    def to_json(self) -> dict[str, Any]:
        value = asdict(self)
        value["failures"] = list(self.failures)
        value["diagnostics"] = list(self.diagnostics)
        return value


def _position(molecule: Chem.Mol, atom_index: int) -> tuple[float, float, float]:
    point = molecule.GetConformer().GetAtomPosition(atom_index)
    return point.x, point.y, point.z


def _distance(left: tuple[float, float, float], right: tuple[float, float, float]) -> float:
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(left, right)))


def _rmsd(reference: Chem.Mol, candidate: Chem.Mol, mapping: tuple[int, ...], indices: list[int]) -> float:
    if not indices:
        return 0.0
    squared = [
        _distance(_position(reference, index), _position(candidate, mapping[index])) ** 2
        for index in indices
    ]
    return math.sqrt(sum(squared) / len(squared))


def _core_indices(molecule: Chem.Mol, anchor_indices: list[int], radius: int = 2) -> list[int]:
    result = set(anchor_indices)
    frontier = set(anchor_indices)
    for _ in range(radius):
        next_frontier = set()
        for index in frontier:
            atom = molecule.GetAtomWithIdx(index)
            next_frontier.update(neighbor.GetIdx() for neighbor in atom.GetNeighbors())
        result.update(next_frontier)
        frontier = next_frontier
    return sorted(index for index in result if molecule.GetAtomWithIdx(index).GetSymbol() != "H")


def _severe_clashes(molecule: Chem.Mol) -> int:
    table = Chem.GetPeriodicTable()
    bonded = {
        tuple(sorted((bond.GetBeginAtomIdx(), bond.GetEndAtomIdx())))
        for bond in molecule.GetBonds()
    }
    count = 0
    for left in range(molecule.GetNumAtoms()):
        for right in range(left + 1, molecule.GetNumAtoms()):
            if (left, right) in bonded:
                continue
            atom_left = molecule.GetAtomWithIdx(left)
            atom_right = molecule.GetAtomWithIdx(right)
            threshold = 0.55 * (
                table.GetRcovalent(atom_left.GetAtomicNum()) + table.GetRcovalent(atom_right.GetAtomicNum())
            )
            if _distance(_position(molecule, left), _position(molecule, right)) < threshold:
                count += 1
    return count


def candidate_anchor_indices(
    case: BenchmarkCase,
    candidate: Chem.Mol,
    candidate_metadata: Path | None,
) -> dict[str, int]:
    if candidate_metadata and candidate_metadata.exists():
        value = json.loads(candidate_metadata.read_text()).get("anchorAtomIndices", {})
        if isinstance(value, list):
            if len(value) != len(case.anchors):
                raise ValueError("anchorAtomIndices 数组长度必须与 task anchors 一致")
            value = {
                anchor.anchor_id: atom_index
                for anchor, atom_index in zip(case.anchors, value)
            }
        if not isinstance(value, dict):
            raise ValueError("anchorAtomIndices 必须是 1-based 数组或 anchor ID 映射")
        result = {str(key): int(index) - 1 for key, index in value.items()}
        for anchor in case.anchors:
            atom_index = result.get(anchor.anchor_id)
            if atom_index is None:
                raise ValueError(f"缺少锚点索引: {anchor.anchor_id}")
            if atom_index < 0 or atom_index >= candidate.GetNumAtoms():
                raise ValueError(f"锚点索引越界: {anchor.anchor_id}")
            if candidate.GetAtomWithIdx(atom_index).GetSymbol() != anchor.symbol:
                raise ValueError(f"锚点元素不匹配: {anchor.anchor_id}")
        return result
    result = {}
    for anchor in case.anchors:
        options = [
            atom.GetIdx() for atom in candidate.GetAtoms()
            if atom.GetSymbol() == anchor.symbol
        ]
        if options:
            result[anchor.anchor_id] = min(
                options,
                key=lambda index: _distance(_position(candidate, index), (
                    anchor.position.x, anchor.position.y, anchor.position.z,
                )),
            )
    return result


def evaluate_candidate(
    case: BenchmarkCase,
    candidate_path: Path,
    *,
    candidate_metadata: Path | None = None,
    work_dir: Path = DEFAULT_WORK_DIR,
    reference_sdf_path: Path | None = None,
) -> EvaluationResult:
    reference_dir = work_dir / "references" / case.case_id
    reference_sdf = reference_sdf_path or reference_dir / "reference.sdf"
    if not reference_sdf.exists():
        raise FileNotFoundError(f"Reference 3D SDF is not prepared: {reference_sdf}")
    reference = with_explicit_hydrogens(load_sdf(reference_sdf))
    candidate = with_explicit_hydrogens(load_sdf(candidate_path))
    formula_match = rdMolDescriptors.CalcMolFormula(reference) == rdMolDescriptors.CalcMolFormula(candidate)
    components = len(Chem.GetMolFrags(candidate))
    clashes = _severe_clashes(candidate)
    anchor_map = candidate_anchor_indices(case, candidate, candidate_metadata)

    mappings: tuple[tuple[int, ...], ...] = ()
    if reference.GetNumAtoms() == candidate.GetNumAtoms():
        mappings = candidate.GetSubstructMatches(
            reference,
            useChirality=False,
            uniquify=False,
            maxMatches=20000,
        )
    constrained = []
    for mapping in mappings:
        if all(
            anchor.anchor_id in anchor_map
            and mapping[anchor.atom_index - 1] == anchor_map[anchor.anchor_id]
            for anchor in case.anchors
        ):
            constrained.append(mapping)
    topology_match = bool(constrained)
    anchor_displacement = None
    core_rmsd = None
    heavy_rmsd = None
    diagnostics = []
    failures = []

    if not formula_match:
        failures.append("formula-mismatch")
        diagnostics.append("元素/氢数与隐藏参考不一致，先修正图像识别或补氢策略。")
    if not topology_match:
        failures.append("topology-mismatch")
        diagnostics.append("键连接、键级或锚点映射不一致，属于拓扑规划失败。")
    else:
        heavy = [atom.GetIdx() for atom in reference.GetAtoms() if atom.GetSymbol() != "H"]
        core = _core_indices(reference, [anchor.atom_index - 1 for anchor in case.anchors])
        mapping = min(constrained, key=lambda item: _rmsd(reference, candidate, item, heavy))
        heavy_rmsd = _rmsd(reference, candidate, mapping, heavy)
        core_rmsd = _rmsd(reference, candidate, mapping, core)
        anchor_displacement = max(
            _distance(
                _position(reference, anchor.atom_index - 1),
                _position(candidate, mapping[anchor.atom_index - 1]),
            )
            for anchor in case.anchors
        )
        if anchor_displacement > 1e-3:
            failures.append("anchor-drift")
            diagnostics.append("B/N 母核锚点发生移动；检查 fixedAtomIds 和几何命令约束。")
        if core_rmsd > 0.5:
            failures.append("core-geometry")
            diagnostics.append("母核附近几何偏差较大；检查并环、键级和初始构象。")
        if heavy_rmsd > 1.5:
            failures.append("peripheral-placement")
            diagnostics.append("外围片段位置偏差较大；优先调整片段模板、连接方向和二面角。")
    if components != 1:
        failures.append("disconnected-structure")
        diagnostics.append("候选结构包含未连接片段。")
    if clashes:
        failures.append("steric-clash")
        diagnostics.append(f"发现 {clashes} 个严重非键碰撞；改进初始放置或扭转角搜索。")

    score = 0.0
    score += 15.0 if formula_match else 0.0
    score += 35.0 if topology_match else 0.0
    score += 10.0 if components == 1 else 0.0
    score += 10.0 if clashes == 0 else max(0.0, 10.0 - clashes)
    if anchor_displacement is not None:
        score += 10.0 if anchor_displacement <= 1e-3 else max(0.0, 10.0 - 10.0 * anchor_displacement)
    if core_rmsd is not None:
        score += max(0.0, 10.0 * (1.0 - core_rmsd / 1.0))
    if heavy_rmsd is not None:
        score += max(0.0, 10.0 * (1.0 - heavy_rmsd / 3.0))
    passed = not failures
    return EvaluationResult(
        case_id=case.case_id,
        passed=passed,
        score=round(score, 3),
        formula_match=formula_match,
        topology_match=topology_match,
        anchor_max_displacement=anchor_displacement,
        core_rmsd=core_rmsd,
        heavy_atom_rmsd=heavy_rmsd,
        severe_clashes=clashes,
        disconnected_components=components,
        failures=tuple(failures),
        diagnostics=tuple(diagnostics),
    )
