from __future__ import annotations

import re
import json
import shlex
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Literal

from rdkit import Chem
from rdkit.Chem import AllChem
from rdkit.Chem import rdMolAlign
from rdkit.Geometry import Point3D

from .contracts import BenchmarkCase


_ENERGY_RE = re.compile(r"TOTAL ENERGY\s+([-\d.]+)\s+Eh")
_CONVERGED_RE = re.compile(r"GEOMETRY OPTIMIZATION CONVERGED", re.IGNORECASE)


@dataclass(frozen=True)
class XtbResult:
    molecule: Chem.Mol
    energy: float
    converged: bool
    return_code: int
    log_tail: str
    anchor_rmsd_before_projection: float


def project_to_fixed_frame(
    optimized: Chem.Mol,
    reference: Chem.Mol,
    fixed_atom_indices: Iterable[int],
) -> tuple[Chem.Mol, float]:
    """Align xTB output to the input anchor frame, then restore exact anchor coordinates.

    xTB 6.7.1's ANC optimizer can drift even atoms reported under `$fix` for large
    molecules. The rigid projection keeps the optimized shape while making the
    benchmark frame deterministic; the final snap enforces the public contract.
    """
    zero_based = sorted({int(index) - 1 for index in fixed_atom_indices})
    if not zero_based:
        return optimized, 0.0
    result = Chem.Mol(optimized)
    rmsd = float(rdMolAlign.AlignMol(
        result,
        reference,
        atomMap=[(index, index) for index in zero_based],
    ))
    result_positions = result.GetConformer()
    reference_positions = reference.GetConformer()
    for index in zero_based:
        result_positions.SetAtomPosition(index, reference_positions.GetAtomPosition(index))
    return result, rmsd


def load_sdf(path: Path, *, remove_hydrogens: bool = False) -> Chem.Mol:
    supplier = Chem.SDMolSupplier(str(path), removeHs=remove_hydrogens, sanitize=True)
    molecule = supplier[0] if supplier else None
    if molecule is None:
        raise ValueError(f"Cannot parse SDF: {path}")
    return molecule


def with_explicit_hydrogens(molecule: Chem.Mol) -> Chem.Mol:
    """Return a molecule with every implicit hydrogen materialized.

    RetainMol EditPlans normally describe the editable heavy-atom graph and let
    the SDF carry implicit hydrogen counts.  Evaluation references and xTB,
    however, operate on explicit atoms.  Normalizing at this boundary keeps the
    editing protocol concise while ensuring topology comparison and refinement
    see the same chemical system.
    """
    has_coordinates = molecule.GetNumConformers() > 0
    return Chem.AddHs(molecule, addCoords=has_coordinates)


def write_sdf(molecule: Chem.Mol, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    writer = Chem.SDWriter(str(path))
    try:
        writer.write(molecule)
    finally:
        writer.close()


def write_xyz(molecule: Chem.Mol, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    Chem.MolToXYZFile(molecule, str(path))


def write_graph_json(molecule: Chem.Mol, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "schemaVersion": 1,
        "atoms": [
            {
                "symbol": atom.GetSymbol(),
                "formalCharge": atom.GetFormalCharge(),
                "radicalElectrons": atom.GetNumRadicalElectrons(),
                "isotope": atom.GetIsotope(),
                "aromatic": atom.GetIsAromatic(),
            }
            for atom in molecule.GetAtoms()
        ],
        "bonds": [
            {
                "begin": bond.GetBeginAtomIdx(),
                "end": bond.GetEndAtomIdx(),
                "order": bond.GetBondTypeAsDouble(),
                "aromatic": bond.GetIsAromatic(),
            }
            for bond in molecule.GetBonds()
        ],
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")


def load_graph_xyz(graph_path: Path, xyz_path: Path) -> Chem.Mol:
    payload = json.loads(graph_path.read_text())
    if int(payload.get("schemaVersion", -1)) != 1:
        raise ValueError(f"Unsupported reference graph schema: {graph_path}")
    editable = Chem.RWMol()
    for item in payload["atoms"]:
        atom = Chem.Atom(str(item["symbol"]))
        atom.SetFormalCharge(int(item.get("formalCharge", 0)))
        atom.SetNumRadicalElectrons(int(item.get("radicalElectrons", 0)))
        atom.SetIsotope(int(item.get("isotope", 0)))
        atom.SetIsAromatic(bool(item.get("aromatic", False)))
        editable.AddAtom(atom)
    bond_types = {
        1.0: Chem.BondType.SINGLE,
        1.5: Chem.BondType.AROMATIC,
        2.0: Chem.BondType.DOUBLE,
        3.0: Chem.BondType.TRIPLE,
    }
    for item in payload["bonds"]:
        order = float(item["order"])
        if order not in bond_types:
            raise ValueError(f"Unsupported bond order {order} in {graph_path}")
        editable.AddBond(int(item["begin"]), int(item["end"]), bond_types[order])
        bond = editable.GetBondBetweenAtoms(int(item["begin"]), int(item["end"]))
        bond.SetIsAromatic(bool(item.get("aromatic", False)))
    molecule = editable.GetMol()
    Chem.SanitizeMol(molecule)

    lines = xyz_path.read_text().splitlines()
    count = int(lines[0].strip())
    if count != molecule.GetNumAtoms():
        raise ValueError(f"XYZ atom count does not match graph: {xyz_path}")
    conformer = Chem.Conformer(count)
    for index, line in enumerate(lines[2 : 2 + count]):
        symbol, x, y, z, *_ = line.split()
        if symbol.lower() != molecule.GetAtomWithIdx(index).GetSymbol().lower():
            raise ValueError(f"XYZ atom order does not match graph at index {index + 1}")
        conformer.SetAtomPosition(index, Point3D(float(x), float(y), float(z)))
    molecule.AddConformer(conformer, assignId=True)
    return molecule


def _xtb_command(explicit: str | None = None) -> list[str]:
    if explicit:
        return shlex.split(explicit)
    executable = shutil.which("xtb")
    if executable:
        return [executable]
    conda = shutil.which("conda")
    if conda:
        probe = subprocess.run(
            [conda, "run", "-n", "retainmol-backend", "which", "xtb"],
            capture_output=True,
            text=True,
        )
        if probe.returncode == 0:
            return [conda, "run", "-n", "retainmol-backend", "xtb"]
    raise FileNotFoundError("xtb was not found; install or activate the retainmol-backend environment")


def _read_xyz_into(molecule: Chem.Mol, path: Path) -> Chem.Mol:
    lines = path.read_text().splitlines()
    count = int(lines[0].strip())
    if count != molecule.GetNumAtoms():
        raise ValueError(f"xTB returned {count} atoms; expected {molecule.GetNumAtoms()}")
    result = Chem.Mol(molecule)
    conformer = Chem.Conformer(count)
    for index, line in enumerate(lines[2 : 2 + count]):
        symbol, x, y, z, *_ = line.split()
        if symbol.lower() != result.GetAtomWithIdx(index).GetSymbol().lower():
            raise ValueError(f"xTB changed atom order at index {index + 1}")
        conformer.SetAtomPosition(index, Point3D(float(x), float(y), float(z)))
    result.RemoveAllConformers()
    result.AddConformer(conformer, assignId=True)
    return result


def _xcontrol(fixed_atom_indices: Iterable[int]) -> str:
    indices = sorted({int(index) for index in fixed_atom_indices})
    if not indices:
        return ""
    return "$fix\n  atoms: " + ",".join(str(index) for index in indices) + "\n$end\n"


def optimize_with_xtb(
    molecule: Chem.Mol,
    *,
    charge: int,
    multiplicity: int,
    fixed_atom_indices: Iterable[int],
    xtb: str | None = None,
    method: Literal["gfn2", "gfn1", "gfnff"] = "gfn2",
    electronic_temperature: int | None = None,
    max_steps: int = 500,
    timeout_seconds: int = 1800,
) -> XtbResult:
    fixed_indices = tuple(int(index) for index in fixed_atom_indices)
    with tempfile.TemporaryDirectory(prefix="retainmol_loop_xtb_") as directory:
        work = Path(directory)
        input_xyz = work / "input.xyz"
        control = work / "xcontrol.inp"
        write_xyz(molecule, input_xyz)
        control.write_text(_xcontrol(fixed_indices))
        method_arguments = {
            "gfn2": ["--gfn", "2"],
            "gfn1": ["--gfn", "1"],
            "gfnff": ["--gfnff"],
        }[method]
        command = [
            *_xtb_command(xtb),
            str(input_xyz),
            "--opt",
            "normal",
            *method_arguments,
            "--chrg",
            str(charge),
            "--uhf",
            str(max(0, multiplicity - 1)),
            "--cycles",
            str(max_steps),
            "--parallel",
            "1",
        ]
        if electronic_temperature is not None and method != "gfnff":
            command.extend(["--etemp", str(electronic_temperature)])
        if control.read_text():
            command.extend(["--input", str(control)])
        process = subprocess.run(
            command,
            cwd=work,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
        )
        log = process.stdout + process.stderr
        output = work / "xtbopt.xyz"
        if not output.exists():
            output = work / "input.xtbopt.xyz"
        if not output.exists():
            raise RuntimeError(f"xTB did not produce optimized coordinates:\n{log[-2000:]}")
        energies = _ENERGY_RE.findall(log)
        optimized = _read_xyz_into(molecule, output)
        projected, anchor_rmsd = project_to_fixed_frame(optimized, molecule, fixed_indices)
        return XtbResult(
            molecule=projected,
            energy=float(energies[-1]) if energies else 0.0,
            converged=bool(_CONVERGED_RE.search(log)) and process.returncode == 0,
            return_code=process.returncode,
            log_tail=log[-2000:],
            anchor_rmsd_before_projection=anchor_rmsd,
        )


def embed_distance_geometry(case: BenchmarkCase, seed: int) -> Chem.Mol:
    source = load_sdf(case.reference_sdf)
    molecule = Chem.AddHs(source, addCoords=False)
    parameters = AllChem.ETKDGv3()
    parameters.randomSeed = int(seed)
    parameters.useRandomCoords = True
    parameters.enforceChirality = True
    parameters.maxIterations = 2000
    parameters.SetCoordMap({
        anchor.atom_index - 1: Point3D(anchor.position.x, anchor.position.y, anchor.position.z)
        for anchor in case.anchors
    })
    if AllChem.EmbedMolecule(molecule, parameters) < 0:
        raise RuntimeError(f"Distance geometry failed for {case.case_id}, seed={seed}")
    return molecule


def embed_candidate_distance_geometry(
    molecule: Chem.Mol,
    *,
    fixed_atom_indices: Iterable[int],
    seed: int,
) -> Chem.Mol:
    """Generate a fresh candidate conformer without consulting hidden reference coordinates."""
    fixed_indices = tuple(sorted({int(index) for index in fixed_atom_indices}))
    result = Chem.Mol(molecule)
    result.RemoveAllConformers()
    source_positions = molecule.GetConformer()
    parameters = AllChem.ETKDGv3()
    parameters.randomSeed = int(seed)
    parameters.useRandomCoords = True
    parameters.enforceChirality = True
    parameters.maxIterations = 3000
    coordinate_map = {}
    for index in fixed_indices:
        point = source_positions.GetAtomPosition(index - 1)
        coordinate_map[index - 1] = Point3D(point.x, point.y, point.z)
    parameters.SetCoordMap(coordinate_map)
    if AllChem.EmbedMolecule(result, parameters) < 0:
        raise RuntimeError(f"Candidate distance geometry failed, seed={seed}")
    projected, _ = project_to_fixed_frame(result, molecule, fixed_indices)
    return projected
