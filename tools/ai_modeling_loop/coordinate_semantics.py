from __future__ import annotations

import math
from pathlib import Path
from typing import Iterable

from rdkit import Chem
from rdkit.Geometry import Point3D

from .chemistry import load_sdf, project_to_fixed_frame


COORDINATE_TOLERANCE_ANGSTROM = 1.5e-3
IDENTITY_MARGIN_ANGSTROM = 1e-6


class CoordinateSemanticError(ValueError):
    """Coordinate files are hash-valid but do not describe one transport chain."""


def _xyz_rows(path: Path) -> tuple[tuple[str, tuple[float, float, float]], ...]:
    lines = path.read_text(encoding="utf-8").splitlines()
    if len(lines) < 2:
        raise CoordinateSemanticError(f"XYZ header is incomplete: {path}")
    try:
        count = int(lines[0].strip())
    except ValueError as error:
        raise CoordinateSemanticError(f"XYZ atom count is invalid: {path}") from error
    body = lines[2:]
    if len(body) != count:
        raise CoordinateSemanticError(
            f"XYZ row count {len(body)} does not match header {count}: {path}"
        )
    rows = []
    for index, line in enumerate(body):
        columns = line.split()
        if len(columns) < 4:
            raise CoordinateSemanticError(f"XYZ row {index + 1} is incomplete: {path}")
        try:
            position = tuple(float(value) for value in columns[1:4])
        except ValueError as error:
            raise CoordinateSemanticError(f"XYZ row {index + 1} has invalid coordinates") from error
        if not all(math.isfinite(value) for value in position):
            raise CoordinateSemanticError(f"XYZ row {index + 1} has non-finite coordinates")
        rows.append((columns[0], position))
    return tuple(rows)


def _molecule_rows(molecule: Chem.Mol) -> tuple[tuple[str, tuple[float, float, float]], ...]:
    if molecule.GetNumConformers() != 1:
        raise CoordinateSemanticError("coordinate molecule must contain exactly one conformer")
    conformer = molecule.GetConformer()
    rows = []
    for index, atom in enumerate(molecule.GetAtoms()):
        position = conformer.GetAtomPosition(index)
        rows.append((atom.GetSymbol(), (float(position.x), float(position.y), float(position.z))))
    return tuple(rows)


def _require_matching_rows(
    expected: tuple[tuple[str, tuple[float, float, float]], ...],
    actual: tuple[tuple[str, tuple[float, float, float]], ...],
    *,
    label: str,
) -> None:
    if len(expected) != len(actual):
        raise CoordinateSemanticError(f"{label} atom count mismatch")
    for index, ((expected_symbol, expected_position), (actual_symbol, actual_position)) in enumerate(
        zip(expected, actual, strict=True)
    ):
        if expected_symbol.lower() != actual_symbol.lower():
            raise CoordinateSemanticError(f"{label} symbol mismatch at row {index + 1}")
        if any(
            abs(expected_position[axis] - actual_position[axis]) > COORDINATE_TOLERANCE_ANGSTROM
            for axis in range(3)
        ):
            raise CoordinateSemanticError(f"{label} coordinate mismatch at row {index + 1}")


def _molecule_with_xyz(molecule: Chem.Mol, xyz_path: Path) -> Chem.Mol:
    rows = _xyz_rows(xyz_path)
    if len(rows) != molecule.GetNumAtoms():
        raise CoordinateSemanticError("xTB output atom count mismatch")
    result = Chem.Mol(molecule)
    conformer = Chem.Conformer(len(rows))
    for index, ((symbol, position), atom) in enumerate(zip(rows, result.GetAtoms(), strict=True)):
        if symbol.lower() != atom.GetSymbol().lower():
            raise CoordinateSemanticError(f"xTB output symbol mismatch at row {index + 1}")
        conformer.SetAtomPosition(index, Point3D(*position))
    result.RemoveAllConformers()
    result.AddConformer(conformer, assignId=True)
    return result


def _distance(
    left: tuple[float, float, float],
    right: tuple[float, float, float],
) -> float:
    return math.sqrt(sum((left[axis] - right[axis]) ** 2 for axis in range(3)))


def _require_non_collinear_fixed_frame(
    rows: tuple[tuple[str, tuple[float, float, float]], ...],
    fixed_rows: tuple[int, ...],
) -> None:
    if len(fixed_rows) < 3:
        raise CoordinateSemanticError(
            "repeated elements require at least three fixed atom rows to prove identity"
        )
    origin = rows[fixed_rows[0] - 1][1]
    vectors = [
        tuple(rows[row - 1][1][axis] - origin[axis] for axis in range(3))
        for row in fixed_rows[1:]
    ]
    for left_index, left in enumerate(vectors):
        for right in vectors[left_index + 1:]:
            cross = (
                left[1] * right[2] - left[2] * right[1],
                left[2] * right[0] - left[0] * right[2],
                left[0] * right[1] - left[1] * right[0],
            )
            if sum(value * value for value in cross) > 1e-10:
                return
    raise CoordinateSemanticError(
        "fixed atom rows are collinear and cannot define a stable identity frame"
    )


def _require_same_element_identity_continuity(
    source: tuple[tuple[str, tuple[float, float, float]], ...],
    transported: tuple[tuple[str, tuple[float, float, float]], ...],
    *,
    row_indices: Iterable[int] | None = None,
    label: str,
) -> None:
    indices = tuple(row_indices) if row_indices is not None else tuple(range(len(source)))
    for index in indices:
        symbol, source_position = source[index]
        transported_symbol, transported_position = transported[index]
        if symbol.lower() != transported_symbol.lower():
            raise CoordinateSemanticError(f"{label} symbol mismatch at row {index + 1}")
        alternatives = [
            candidate_position
            for candidate_index, (candidate_symbol, candidate_position) in enumerate(source)
            if candidate_index != index and candidate_symbol.lower() == symbol.lower()
        ]
        if not alternatives:
            continue
        own_distance = _distance(transported_position, source_position)
        nearest_alternative = min(
            _distance(transported_position, alternative)
            for alternative in alternatives
        )
        if own_distance + IDENTITY_MARGIN_ANGSTROM >= nearest_alternative:
            raise CoordinateSemanticError(
                f"{label} cannot prove stable same-element identity at row {index + 1}"
            )


def verify_xtb_coordinate_chain(
    *,
    source_sdf_path: Path,
    input_xyz_path: Path,
    output_xyz_path: Path,
    final_sdf_path: Path,
    fixed_atom_rows: Iterable[int],
) -> None:
    """Prove SDF -> xTB XYZ -> fixed-frame projection -> final SDF coordinates."""

    source = load_sdf(source_sdf_path)
    final = load_sdf(final_sdf_path)
    source_rows = _molecule_rows(source)
    input_rows = _xyz_rows(input_xyz_path)
    _require_matching_rows(
        source_rows,
        input_rows,
        label="xTB input",
    )
    fixed_rows = tuple(sorted({int(row) for row in fixed_atom_rows}))
    if any(row < 1 or row > len(source_rows) for row in fixed_rows):
        raise CoordinateSemanticError("fixed atom row is outside the coordinate table")
    has_repeated_elements = len({symbol.lower() for symbol, _ in source_rows}) != len(source_rows)
    if has_repeated_elements:
        _require_non_collinear_fixed_frame(source_rows, fixed_rows)
    output_rows = _xyz_rows(output_xyz_path)
    _require_same_element_identity_continuity(
        source_rows,
        output_rows,
        row_indices=(row - 1 for row in fixed_rows),
        label="xTB fixed-frame output",
    )
    optimized = _molecule_with_xyz(source, output_xyz_path)
    projected, _ = project_to_fixed_frame(optimized, source, fixed_rows)
    projected_rows = _molecule_rows(projected)
    _require_same_element_identity_continuity(
        source_rows,
        projected_rows,
        label="xTB projected output",
    )
    _require_matching_rows(
        projected_rows,
        _molecule_rows(final),
        label="xTB projected output",
    )
