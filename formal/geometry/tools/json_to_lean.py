#!/usr/bin/env python3
"""Convert a restricted RetainMol geometry certificate JSON file to Lean data."""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Any


BOND_ORDERS = {
    "single": ".single",
    "double": ".double",
    "triple": ".triple",
    "aromatic": ".aromatic",
}


def lean_string(value: Any) -> str:
    if not isinstance(value, str):
        raise ValueError(f"expected string, got {type(value).__name__}")
    return json.dumps(value, ensure_ascii=False)


def finite_number(value: Any, field: str) -> float:
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise ValueError(f"{field} must be a number")
    result = float(value)
    if not math.isfinite(result):
        raise ValueError(f"{field} must be finite")
    return result


def quantize_position(value: Any, scale: int, field: str) -> tuple[int, int, int]:
    if not isinstance(value, list) or len(value) != 3:
        raise ValueError(f"{field} must contain exactly three coordinates")
    return tuple(round(finite_number(item, field) * scale) for item in value)  # type: ignore[return-value]


def lean_list(items: list[str], indent: str = "  ") -> str:
    if not items:
        return "[]"
    body = (",\n" + indent).join(items)
    return f"[\n{indent}{body}\n]"


def render_atom(atom: Any, scale: int, field: str) -> str:
    if not isinstance(atom, dict):
        raise ValueError(f"{field} must be an object")
    x, y, z = quantize_position(atom.get("position"), scale, f"{field}.position")
    return (
        "{ atomId := "
        f"{lean_string(atom.get('atomId'))}, symbol := {lean_string(atom.get('symbol'))}, "
        f"position := {{ x := {x}, y := {y}, z := {z} }} }}"
    )


def render_bond(bond: Any, field: str) -> str:
    if not isinstance(bond, dict):
        raise ValueError(f"{field} must be an object")
    order = bond.get("order")
    if order not in BOND_ORDERS:
        raise ValueError(f"{field}.order must be one of {sorted(BOND_ORDERS)}")
    return (
        "{ bondId := "
        f"{lean_string(bond.get('bondId'))}, atomId1 := {lean_string(bond.get('atomId1'))}, "
        f"atomId2 := {lean_string(bond.get('atomId2'))}, order := {BOND_ORDERS[order]} }}"
    )


def render_molecule(name: str, molecule: Any, scale: int) -> str:
    if not isinstance(molecule, dict):
        raise ValueError(f"{name} must be an object")
    atoms = molecule.get("atoms")
    bonds = molecule.get("bonds")
    if not isinstance(atoms, list) or not isinstance(bonds, list):
        raise ValueError(f"{name}.atoms and {name}.bonds must be arrays")
    rendered_atoms = [render_atom(atom, scale, f"{name}.atoms[{index}]") for index, atom in enumerate(atoms)]
    rendered_bonds = [render_bond(bond, f"{name}.bonds[{index}]") for index, bond in enumerate(bonds)]
    return (
        f"private def {name} : MoleculeSnapshot := {{\n"
        f"  atoms := {lean_list(rendered_atoms, '    ')}\n"
        f"  bonds := {lean_list(rendered_bonds, '    ')}\n"
        "}\n"
    )


def render_certificate(certificate: Any, scale: int) -> str:
    if not isinstance(certificate, dict):
        raise ValueError("certificate must be an object")
    fixed = certificate.get("fixedAtomIds", [])
    distances = certificate.get("distanceBounds", [])
    orientations = certificate.get("orientationChecks", [])
    if not all(isinstance(value, list) for value in (fixed, distances, orientations)):
        raise ValueError("certificate fields must be arrays")

    fixed_items = [lean_string(atom_id) for atom_id in fixed]
    distance_items: list[str] = []
    for index, bound in enumerate(distances):
        if not isinstance(bound, dict):
            raise ValueError(f"distanceBounds[{index}] must be an object")
        minimum = finite_number(bound.get("minAngstrom"), f"distanceBounds[{index}].minAngstrom")
        maximum = finite_number(bound.get("maxAngstrom"), f"distanceBounds[{index}].maxAngstrom")
        if minimum < 0 or maximum < minimum:
            raise ValueError(f"distanceBounds[{index}] has an invalid range")
        min_squared = math.floor((minimum * scale) ** 2)
        max_squared = math.ceil((maximum * scale) ** 2)
        distance_items.append(
            "{ atomId1 := "
            f"{lean_string(bound.get('atomId1'))}, atomId2 := {lean_string(bound.get('atomId2'))}, "
            f"minSquared := {min_squared}, maxSquared := {max_squared} }}"
        )

    orientation_items: list[str] = []
    for index, check in enumerate(orientations):
        if not isinstance(check, dict) or not isinstance(check.get("atomIds"), list):
            raise ValueError(f"orientationChecks[{index}].atomIds must be an array")
        atom_ids = check["atomIds"]
        if len(atom_ids) != 4:
            raise ValueError(f"orientationChecks[{index}].atomIds must contain four ids")
        orientation_items.append(
            "{ atomId1 := "
            f"{lean_string(atom_ids[0])}, atomId2 := {lean_string(atom_ids[1])}, "
            f"atomId3 := {lean_string(atom_ids[2])}, atomId4 := {lean_string(atom_ids[3])} }}"
        )

    return (
        "private def certificate : GeometryCertificate := {\n"
        f"  fixedAtomIds := {lean_list(fixed_items, '    ')}\n"
        f"  distanceBounds := {lean_list(distance_items, '    ')}\n"
        f"  orientationChecks := {lean_list(orientation_items, '    ')}\n"
        "}\n"
    )


def render_document(payload: Any) -> str:
    if not isinstance(payload, dict):
        raise ValueError("document must be an object")
    scale = payload.get("coordinateScale", 1000)
    if not isinstance(scale, int) or isinstance(scale, bool) or scale <= 0:
        raise ValueError("coordinateScale must be a positive integer")
    return "\n".join(
        [
            "-- Generated from restricted JSON data. Do not edit by hand.",
            "import RetainMolGeometry",
            "",
            "open RetainMol.Geometry",
            "",
            render_molecule("reference", payload.get("reference"), scale),
            render_molecule("candidate", payload.get("candidate"), scale),
            render_certificate(payload.get("certificate"), scale),
            "example : validateGeometryCertificate reference candidate certificate = true := by",
            "  decide",
            "",
        ]
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    payload = json.loads(args.input.read_text(encoding="utf-8"))
    rendered = render_document(payload)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(rendered, encoding="utf-8")


if __name__ == "__main__":
    main()
