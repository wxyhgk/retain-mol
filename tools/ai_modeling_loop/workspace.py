from __future__ import annotations

import json
import hashlib
import shutil
import subprocess
from pathlib import Path

from .chemistry import (
    embed_distance_geometry,
    optimize_with_xtb,
    write_sdf,
    write_xyz,
)
from .contracts import BenchmarkCase, DEFAULT_WORK_DIR


RETAINMOL_SDF_EXPORTER = Path(__file__).with_name("retainmol_sdf_export.mjs")


def _write_modeling_protocol(path: Path) -> None:
    commands = {
        "atom.add": {
            "required": ["commandId", "kind", "atomId", "symbol", "position"],
            "shape": {"position": {"x": "finite number", "y": "finite number", "z": "finite number"}},
        },
        "atom.replace": {"required": ["commandId", "kind", "atomId", "symbol"]},
        "atom.remove": {"required": ["commandId", "kind", "atomId"]},
        "atom.move": {
            "required": ["commandId", "kind", "atomId", "position"],
            "shape": {"position": {"x": "finite number", "y": "finite number", "z": "finite number"}},
        },
        "atom.setCharge": {"required": ["commandId", "kind", "atomId", "charge"], "range": {"charge": [-8, 8]}},
        "atom.setRadical": {"required": ["commandId", "kind", "atomId", "radical"], "range": {"radical": [0, 8]}},
        "atom.addHydrogen": {"required": ["commandId", "kind", "atomId", "hydrogenAtomId"]},
        "bond.add": {"required": ["commandId", "kind", "bondId", "atomId1", "atomId2", "order"], "allowed": {"order": [1, 2, 3]}},
        "bond.remove": {"required": ["commandId", "kind", "bondId"]},
        "bond.setOrder": {"required": ["commandId", "kind", "bondId", "order"], "allowed": {"order": [1, 2, 3]}},
        "fragment.attach": {
            "required": ["commandId", "kind", "atomId", "fragmentId"],
            "optional": ["torsionAngleDegrees"],
            "range": {"torsionAngleDegrees": [-360, 360]},
        },
        "fragment.bridge": {
            "required": ["commandId", "kind", "atomId1", "atomId2", "fragmentId"],
            "optional": ["orientationDegrees"],
            "range": {"orientationDegrees": [-360, 360]},
        },
        "fragment.fuse": {"required": ["commandId", "kind", "bondId", "fragmentId"]},
        "geometry.setBondLength": {
            "required": ["commandId", "kind", "atomId1", "atomId2", "length"],
            "range": {"length": [0.1, 20]},
        },
        "geometry.setBondAngle": {
            "required": ["commandId", "kind", "atomId1", "atomId2", "atomId3", "angleDegrees"],
            "rangeExclusive": {"angleDegrees": [0, 180]},
        },
        "geometry.setDihedral": {
            "required": ["commandId", "kind", "atomId1", "atomId2", "atomId3", "atomId4", "angleDegrees"],
            "range": {"angleDegrees": [-360, 360]},
        },
        "geometry.rotateGroup": {
            "required": ["commandId", "kind", "atomIds", "axisAtomId1", "axisAtomId2", "angleDegrees"],
            "range": {"angleDegrees": [-360, 360]},
        },
    }
    payload = {
        "schemaVersion": 1,
        "plan": {
            "required": ["schemaVersion", "planId", "source", "targetObjectId", "commands"],
            "optional": ["description", "scope", "anchor", "expectedRevision", "constraints"],
            "allowedSource": ["ai", "human", "import", "system"],
            "commandCount": [1, 512],
            "constraints": {
                "fixedAtomPositions": "unique atom id array",
                "protectedAtomIds": "unique atom id array",
            },
        },
        "commands": commands,
        "rules": [
            "Every object is strict: do not add fields absent from its command definition.",
            "Every commandId, atomId and bondId must be non-empty and stable within the plan.",
            "Later commands may reference ids created by earlier commands.",
            "Represent aromatic rings with alternating single and double bonds; there is no aromatic order literal.",
            "Do not move, replace or remove fixed/protected anchors.",
            "Candidate SDF is generated only by the RetainMol executor.",
        ],
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _write_initial_modeling_input(case: BenchmarkCase, path: Path) -> None:
    atom_ids = [anchor.anchor_id for anchor in case.anchors]
    payload = {
        "schemaVersion": 1,
        "objectId": f"benchmark:{case.case_id}",
        "fixedAtomIds": atom_ids,
        "molecule": {
            "name": f"{case.case_id} anchored core",
            "atoms": [
                {
                    "id": anchor.anchor_id,
                    "symbol": anchor.symbol,
                    **anchor.position.to_json(),
                }
                for anchor in case.anchors
            ],
            "bonds": [],
        },
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")


def prepare_task_bundle(case: BenchmarkCase, work_dir: Path = DEFAULT_WORK_DIR) -> Path:
    task_dir = work_dir / "tasks" / case.case_id
    if task_dir.exists():
        shutil.rmtree(task_dir)
    task_dir.mkdir(parents=True)
    shutil.copy2(case.image, task_dir / "target.png")
    _write_initial_modeling_input(case, task_dir / "initial-molecule.json")
    _write_modeling_protocol(task_dir / "protocol.json")
    public_task = {
        "schemaVersion": 1,
        "caseId": case.case_id,
        "description": case.description,
        "imageSha256": _sha256(case.image),
        "charge": case.charge,
        "multiplicity": case.multiplicity,
        "anchors": [anchor.public_json() for anchor in case.anchors],
        "modeling": {
            "targetObjectId": f"benchmark:{case.case_id}",
            "schemaVersion": 1,
            "capabilities": [
                "atom.add", "atom.replace", "atom.remove", "atom.move",
                "atom.setCharge", "atom.setRadical", "atom.addHydrogen",
                "bond.add", "bond.remove", "bond.setOrder",
                "fragment.attach", "fragment.bridge", "fragment.fuse",
                "geometry.setBondLength", "geometry.setBondAngle",
                "geometry.setDihedral", "geometry.rotateGroup",
            ],
            "builtInFragmentIds": [
                "benzene", "cyclohexane", "cyclopentane", "cyclopropane",
                "fluorene-9h-site-a", "fluorene-9h-site-b",
            ],
            "fragmentRecipes": {
                "fluoreneSpiroBridge": {
                    "description": "用一个原子命令把 9H-芴的 C9 刚性中心同时接到两个目标 H/未饱和重原子",
                    "preferredCommand": "fragment.bridge",
                    "fragmentIds": ["fluorene-9h-site-a", "fluorene-9h-site-b"],
                    "fields": ["atomId1", "atomId2", "fragmentId", "orientationDegrees?"],
                    "guarantees": [
                        "两个宿主原子坐标不移动",
                        "两个目标 H 在一个原子操作中同时让位",
                        "模板内部几何保持刚体",
                        "目标间距或位点夹角不可解时整条命令失败",
                    ],
                },
                "fluoreneSpiroClosure": {
                    "description": "兼容/诊断配方：优先改用 fluoreneSpiroBridge",
                    "fragmentIds": ["fluorene-9h-site-a", "fluorene-9h-site-b"],
                    "generatedAttachCenter": "<fragment.attach commandId>:atom:7",
                    "generatedRemainingHydrogen": "<fragment.attach commandId>:atom:18",
                    "steps": ["fragment.attach", "atom.remove", "bond.add"],
                }
            },
            "generatedIdConvention": {
                "atom": "<commandId>:atom:<1-based creation ordinal>",
                "bond": "<commandId>:bond:<1-based creation ordinal>",
            },
        },
        "requiredOutputs": {
            "editPlan": "edit-plan.json",
            "notes": "builder-notes.json (optional)",
        },
        "generatedByExecutor": {
            "structure": "candidate.sdf",
            "metadata": "candidate.json",
            "receipt": "execution.json",
        },
    }
    (task_dir / "task.json").write_text(json.dumps(public_task, ensure_ascii=False, indent=2) + "\n")
    (task_dir / "README.md").write_text(
        "# RetainMol 盲建模任务\n\n"
        "只允许使用本目录中的 `target.png`、`initial-molecule.json`、`task.json` 和 `protocol.json`。"
        "B/N 锚点由执行器强制锁定，可以作为新键端点。\n\n"
        "唯一必需的建模输出是 `edit-plan.json`。禁止直接生成 `candidate.sdf`，"
        "也禁止用 RDKit/Open Babel 绕过 RetainMol 命令。候选 3D SDF、元数据和执行回执"
        "将由 RetainMol 无界面执行器生成。`protocol.json` 是命令字段的机器可读规范；"
        "禁止提交自然语言阶段列表冒充 EditPlan。可额外输出 `builder-notes.json` 记录推理与假设。\n\n"
        "复杂刚性片段应优先使用 `fragment.attach` / `fragment.bridge` / `fragment.fuse`，整体调整使用"
        " `geometry.rotateGroup`；螺环芴优先使用 `task.json` 中的 `fluoreneSpiroBridge`，"
        "旧 `fluoreneSpiroClosure` 仅用于兼容和诊断。所有原子与键 id 必须稳定、可重放。\n"
    )
    return task_dir


def prepare_reference_ensemble(
    case: BenchmarkCase,
    *,
    seeds: list[int],
    work_dir: Path = DEFAULT_WORK_DIR,
    xtb: str | None = None,
) -> Path:
    reference_dir = work_dir / "references" / case.case_id
    if reference_dir.exists():
        shutil.rmtree(reference_dir)
    conformer_dir = reference_dir / "conformers"
    conformer_dir.mkdir(parents=True, exist_ok=True)
    records = []
    for seed in seeds:
        embedded = embed_distance_geometry(case, seed)
        result = optimize_with_xtb(
            embedded,
            charge=case.charge,
            multiplicity=case.multiplicity,
            fixed_atom_indices=(anchor.atom_index for anchor in case.anchors),
            xtb=xtb,
        )
        xyz_path = conformer_dir / f"seed-{seed}.xyz"
        sdf_path = conformer_dir / f"seed-{seed}.sdf"
        write_xyz(result.molecule, xyz_path)
        write_sdf(result.molecule, sdf_path)
        records.append({
            "seed": seed,
            "energyHartree": result.energy,
            "converged": result.converged,
            "returnCode": result.return_code,
            "anchorRmsdBeforeProjection": result.anchor_rmsd_before_projection,
            "xyz": str(xyz_path.relative_to(reference_dir)),
            "sdf": str(sdf_path.relative_to(reference_dir)),
        })
    successful = [item for item in records if item["converged"]] or records
    best = min(successful, key=lambda item: item["energyHartree"])
    metadata = {
        "schemaVersion": 1,
        "caseId": case.case_id,
        "generator": "RDKit ETKDGv3 + constrained GFN2-xTB",
        "referenceArtifact": "RetainMol-exported 3D SDF",
        "sourceSdfSha256": _sha256(case.reference_sdf),
        "anchors": [anchor.public_json() for anchor in case.anchors],
        "conformers": records,
        "best": best,
    }
    (reference_dir / "reference.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n")
    export = subprocess.run(
        [
            "node",
            str(RETAINMOL_SDF_EXPORTER),
            str(reference_dir / best["sdf"]),
            str(reference_dir / "reference.sdf"),
        ],
        capture_output=True,
        text=True,
    )
    if export.returncode != 0:
        raise RuntimeError(
            "RetainMol 参考 SDF 导出失败：" + (export.stderr.strip() or export.stdout.strip())
        )
    return reference_dir
