"""XYZ I/O and fixed-atom coordinate handling for xTB."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np

from .contracts import XtbAtom, XtbOptimizationRequest


def write_xyz(path: Path, atoms: list[XtbAtom]) -> None:
    lines = [str(len(atoms)), ""]
    lines.extend(
        f"{atom.symbol.capitalize():4s}  "
        f"{atom.x:16.10f}  {atom.y:16.10f}  {atom.z:16.10f}"
        for atom in atoms
    )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def read_xyz(path: Path) -> list[dict[str, Any]]:
    lines = path.read_text(encoding="utf-8").splitlines()
    atom_count = int(lines[0].strip())
    result: list[dict[str, Any]] = []
    for line in lines[2 : 2 + atom_count]:
        parts = line.split()
        result.append(
            {
                "symbol": parts[0],
                "x": float(parts[1]),
                "y": float(parts[2]),
                "z": float(parts[3]),
            }
        )
    return result


def read_first_existing_xyz(*paths: Path) -> list[dict[str, Any]] | None:
    for path in paths:
        if path.exists():
            return read_xyz(path)
    return None


def prepare_output_atoms(
    atoms: list[dict[str, Any]],
    request: XtbOptimizationRequest,
) -> list[dict[str, Any]]:
    """Restore atom ids and align constrained output to the request frame."""
    result = _attach_atom_ids(atoms, request.atoms)
    if not request.fixed_atom_ids:
        return result

    fixed_ids = set(request.fixed_atom_ids)
    fixed_indices = [
        index for index, atom in enumerate(request.atoms) if atom.id in fixed_ids
    ]
    coordinates = np.array(
        [[atom["x"], atom["y"], atom["z"]] for atom in result],
        dtype=float,
    )
    fixed_output = coordinates[fixed_indices]
    fixed_target = np.array(
        [
            [
                request.atoms[index].x,
                request.atoms[index].y,
                request.atoms[index].z,
            ]
            for index in fixed_indices
        ],
        dtype=float,
    )

    output_centroid = fixed_output.mean(axis=0)
    target_centroid = fixed_target.mean(axis=0)
    rotation = np.eye(3)
    if len(fixed_indices) > 1:
        covariance = (
            (fixed_output - output_centroid).T
            @ (fixed_target - target_centroid)
        )
        left, _, right_transpose = np.linalg.svd(covariance)
        rotation = left @ right_transpose
        if np.linalg.det(rotation) < 0:
            left[:, -1] *= -1
            rotation = left @ right_transpose

    coordinates = (coordinates - output_centroid) @ rotation + target_centroid

    # The public constraint contract is exact even if xTB reports residual drift.
    coordinates[fixed_indices] = fixed_target
    for atom, coordinate in zip(result, coordinates):
        atom["x"], atom["y"], atom["z"] = map(float, coordinate)

    return result


def _attach_atom_ids(
    atoms: list[dict[str, Any]],
    source: list[XtbAtom],
) -> list[dict[str, Any]]:
    if len(atoms) != len(source):
        raise ValueError(
            f"xTB 返回 {len(atoms)} 个原子，但请求包含 {len(source)} 个原子"
        )

    result: list[dict[str, Any]] = []
    for atom, original in zip(atoms, source):
        if str(atom["symbol"]).lower() != original.symbol.lower():
            raise ValueError(
                "xTB 原子顺序发生变化："
                f"期望 {original.symbol}，得到 {atom['symbol']}"
            )
        result.append({"id": original.id, **atom})
    return result


__all__ = [
    "prepare_output_atoms",
    "read_first_existing_xyz",
    "read_xyz",
    "write_xyz",
]
