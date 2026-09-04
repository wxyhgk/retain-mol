#!/usr/bin/env python3
"""Convert a strict RetainMol geometry-policy request to generated Lean data."""

from __future__ import annotations

import argparse
import json
from decimal import Decimal, InvalidOperation, ROUND_CEILING, ROUND_FLOOR, ROUND_HALF_EVEN
from pathlib import Path
from typing import Any, Iterable


SCHEMA_VERSION = 2
COORDINATE_SCALE = 1000
# The validator enumerates every unordered atom pair for collision safety.
# 316 atoms stay below the 50,000-pair proof budget.
MAX_ATOMS = 316
MAX_BONDS = 20_000
MAX_CHECKS = 50_000
MAX_RIGID_GROUP_ATOMS = 256
MAX_ID_LENGTH = 160
MAX_ABS_COORDINATE = Decimal("1000000")

BOND_ORDERS = {
    "single": ".single",
    "double": ".double",
    "triple": ".triple",
    "aromatic": ".aromatic",
}

EVALUATION_PREFIX = "RETAINMOL_GEOMETRY_RESULT:"


def reject_duplicate_keys(pairs: Iterable[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON field: {key}")
        result[key] = value
    return result


def reject_constant(value: str) -> None:
    raise ValueError(f"non-finite JSON number is forbidden: {value}")


def load_payload(path: Path) -> Any:
    return json.loads(
        path.read_text(encoding="utf-8"),
        object_pairs_hook=reject_duplicate_keys,
        parse_float=Decimal,
        parse_constant=reject_constant,
    )


def strict_object(value: Any, field: str, required: set[str], optional: set[str] | None = None) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ValueError(f"{field} must be an object")
    optional = optional or set()
    keys = set(value)
    missing = required - keys
    unknown = keys - required - optional
    if missing:
        raise ValueError(f"{field} is missing fields: {sorted(missing)}")
    if unknown:
        raise ValueError(f"{field} has unknown fields: {sorted(unknown)}")
    return value


def checked_list(value: Any, field: str, *, maximum: int = MAX_CHECKS) -> list[Any]:
    if not isinstance(value, list):
        raise ValueError(f"{field} must be an array")
    if len(value) > maximum:
        raise ValueError(f"{field} exceeds limit {maximum}")
    return value


def checked_string(value: Any, field: str, *, allow_empty: bool = False) -> str:
    if not isinstance(value, str):
        raise ValueError(f"{field} must be a string")
    if not allow_empty and not value:
        raise ValueError(f"{field} must not be empty")
    if len(value) > MAX_ID_LENGTH:
        raise ValueError(f"{field} exceeds {MAX_ID_LENGTH} characters")
    return value


def checked_int(value: Any, field: str, *, minimum: int | None = None) -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        raise ValueError(f"{field} must be an integer")
    if minimum is not None and value < minimum:
        raise ValueError(f"{field} must be at least {minimum}")
    return value


def checked_bool(value: Any, field: str) -> bool:
    if not isinstance(value, bool):
        raise ValueError(f"{field} must be a boolean")
    return value


def decimal_number(value: Any, field: str) -> Decimal:
    if isinstance(value, bool) or not isinstance(value, (int, Decimal)):
        raise ValueError(f"{field} must be a JSON number")
    try:
        result = Decimal(value)
    except InvalidOperation as error:
        raise ValueError(f"{field} must be finite") from error
    if not result.is_finite():
        raise ValueError(f"{field} must be finite")
    return result


def lean_string(value: Any, field: str) -> str:
    return json.dumps(checked_string(value, field), ensure_ascii=False)


def quantize_position(value: Any, field: str) -> tuple[int, int, int]:
    coordinates = checked_list(value, field, maximum=3)
    if len(coordinates) != 3:
        raise ValueError(f"{field} must contain exactly three coordinates")
    result: list[int] = []
    for index, item in enumerate(coordinates):
        coordinate = decimal_number(item, f"{field}[{index}]")
        if abs(coordinate) > MAX_ABS_COORDINATE:
            raise ValueError(f"{field}[{index}] exceeds coordinate limit")
        result.append(int((coordinate * COORDINATE_SCALE).to_integral_value(rounding=ROUND_HALF_EVEN)))
    return result[0], result[1], result[2]


def lean_list(items: list[str], indent: str = "  ") -> str:
    if not items:
        return "[]"
    body = (",\n" + indent).join(items)
    return f"[\n{indent}{body}\n]"


def lean_inline_list(items: list[str]) -> str:
    return "[" + ", ".join(items) + "]"


def render_atom(atom: Any, field: str) -> str:
    atom = strict_object(
        atom,
        field,
        {"atomId", "symbol", "position"},
        {"formalCharge", "radicalElectrons", "aromatic"},
    )
    x, y, z = quantize_position(atom["position"], f"{field}.position")
    formal_charge = checked_int(atom.get("formalCharge", 0), f"{field}.formalCharge")
    radical = checked_int(atom.get("radicalElectrons", 0), f"{field}.radicalElectrons", minimum=0)
    aromatic = checked_bool(atom.get("aromatic", False), f"{field}.aromatic")
    return (
        "{ atomId := "
        f"{lean_string(atom['atomId'], f'{field}.atomId')}, "
        f"symbol := {lean_string(atom['symbol'], f'{field}.symbol')}, "
        f"position := {{ x := {x}, y := {y}, z := {z} }}, "
        f"formalCharge := {formal_charge}, radicalElectrons := {radical}, "
        f"aromatic := {str(aromatic).lower()} }}"
    )


def render_bond(bond: Any, field: str) -> str:
    bond = strict_object(bond, field, {"bondId", "atomId1", "atomId2", "order"})
    order = bond["order"]
    if order not in BOND_ORDERS:
        raise ValueError(f"{field}.order must be one of {sorted(BOND_ORDERS)}")
    return (
        "{ bondId := "
        f"{lean_string(bond['bondId'], f'{field}.bondId')}, "
        f"atomId1 := {lean_string(bond['atomId1'], f'{field}.atomId1')}, "
        f"atomId2 := {lean_string(bond['atomId2'], f'{field}.atomId2')}, "
        f"order := {BOND_ORDERS[order]} }}"
    )


def render_molecule(name: str, molecule: Any) -> str:
    molecule = strict_object(molecule, name, {"atoms", "bonds"})
    atoms = checked_list(molecule["atoms"], f"{name}.atoms", maximum=MAX_ATOMS)
    bonds = checked_list(molecule["bonds"], f"{name}.bonds", maximum=MAX_BONDS)
    rendered_atoms = [render_atom(atom, f"{name}.atoms[{index}]") for index, atom in enumerate(atoms)]
    rendered_bonds = [render_bond(bond, f"{name}.bonds[{index}]") for index, bond in enumerate(bonds)]
    return (
        f"private def {name} : MoleculeSnapshot := {{\n"
        f"  atoms := {lean_list(rendered_atoms, '    ')}\n"
        f"  bonds := {lean_list(rendered_bonds, '    ')}\n"
        "}\n"
    )


def inward_squared_bounds(minimum: Decimal, maximum: Decimal, field: str) -> tuple[int, int]:
    if minimum < 0 or maximum < minimum:
        raise ValueError(f"{field} has an invalid range")
    min_squared = int(((minimum * COORDINATE_SCALE) ** 2).to_integral_value(rounding=ROUND_CEILING))
    max_squared = int(((maximum * COORDINATE_SCALE) ** 2).to_integral_value(rounding=ROUND_FLOOR))
    if min_squared > max_squared:
        raise ValueError(f"{field} contains no representable quantized squared distance")
    return min_squared, max_squared


def render_policy(policy: Any) -> str:
    policy = strict_object(
        policy,
        "policy",
        {
            "policyId",
            "requireGeometryConstraints",
            "requireAllBondDistances",
            "fixedAtomIds",
            "distanceBounds",
            "orientationChecks",
            "rigidAtomGroups",
        },
    )
    fixed = checked_list(policy["fixedAtomIds"], "policy.fixedAtomIds")
    distances = checked_list(policy["distanceBounds"], "policy.distanceBounds")
    orientations = checked_list(policy["orientationChecks"], "policy.orientationChecks")
    rigid_groups = checked_list(policy["rigidAtomGroups"], "policy.rigidAtomGroups")

    fixed_items = [lean_string(atom_id, f"policy.fixedAtomIds[{index}]") for index, atom_id in enumerate(fixed)]
    distance_items: list[str] = []
    for index, value in enumerate(distances):
        field = f"policy.distanceBounds[{index}]"
        bound = strict_object(value, field, {"atomId1", "atomId2", "minAngstrom", "maxAngstrom"})
        minimum = decimal_number(bound["minAngstrom"], f"{field}.minAngstrom")
        maximum = decimal_number(bound["maxAngstrom"], f"{field}.maxAngstrom")
        min_squared, max_squared = inward_squared_bounds(minimum, maximum, field)
        distance_items.append(
            "{ atomId1 := "
            f"{lean_string(bound['atomId1'], f'{field}.atomId1')}, "
            f"atomId2 := {lean_string(bound['atomId2'], f'{field}.atomId2')}, "
            f"minSquared := {min_squared}, maxSquared := {max_squared} }}"
        )

    orientation_items: list[str] = []
    for index, value in enumerate(orientations):
        field = f"policy.orientationChecks[{index}]"
        check = strict_object(value, field, {"atomIds", "minAbsVolume6"})
        atom_ids = checked_list(check["atomIds"], f"{field}.atomIds", maximum=4)
        if len(atom_ids) != 4:
            raise ValueError(f"{field}.atomIds must contain four ids")
        orientation_items.append(
            "{ atomId1 := "
            f"{lean_string(atom_ids[0], f'{field}.atomIds[0]')}, "
            f"atomId2 := {lean_string(atom_ids[1], f'{field}.atomIds[1]')}, "
            f"atomId3 := {lean_string(atom_ids[2], f'{field}.atomIds[2]')}, "
            f"atomId4 := {lean_string(atom_ids[3], f'{field}.atomIds[3]')}, "
            f"minAbsVolume6 := {checked_int(check['minAbsVolume6'], f'{field}.minAbsVolume6', minimum=1)} }}"
        )

    rigid_items: list[str] = []
    for index, value in enumerate(rigid_groups):
        field = f"policy.rigidAtomGroups[{index}]"
        group = strict_object(value, field, {"atomIds", "maxSquaredDistanceDelta"})
        atom_ids = checked_list(group["atomIds"], f"{field}.atomIds", maximum=MAX_RIGID_GROUP_ATOMS)
        rigid_items.append(
            "{ atomIds := "
            f"{lean_inline_list([lean_string(atom_id, f'{field}.atomIds') for atom_id in atom_ids])}, "
            f"maxSquaredDistanceDelta := "
            f"{checked_int(group['maxSquaredDistanceDelta'], f'{field}.maxSquaredDistanceDelta', minimum=0)} }}"
        )

    require_geometry = checked_bool(policy["requireGeometryConstraints"], "policy.requireGeometryConstraints")
    require_bond_distances = checked_bool(policy["requireAllBondDistances"], "policy.requireAllBondDistances")
    return (
        "private def policy : GeometryPolicy := {\n"
        f"  policyId := {lean_string(policy['policyId'], 'policy.policyId')}\n"
        f"  requireGeometryConstraints := {str(require_geometry).lower()}\n"
        f"  requireAllBondDistances := {str(require_bond_distances).lower()}\n"
        f"  fixedAtomIds := {lean_list(fixed_items, '    ')}\n"
        f"  distanceBounds := {lean_list(distance_items, '    ')}\n"
        f"  orientationChecks := {lean_list(orientation_items, '    ')}\n"
        f"  rigidAtomGroups := {lean_list(rigid_items, '    ')}\n"
        "}\n"
    )


def render_evaluation() -> str:
    return "\n".join(
        [
            "private def validationIssueCode : ValidationIssue → String",
            '  | .expectedTopologyInvalid => "expected-topology-invalid"',
            '  | .candidateTopologyInvalid => "candidate-topology-invalid"',
            '  | .molecularGraphChanged => "molecular-graph-changed"',
            '  | .policyInvalid => "policy-invalid"',
            '  | .bondTooShort _ => "bond-too-short"',
            '  | .nonBondedCollision _ _ => "non-bonded-collision"',
            '  | .fixedAtomChanged _ => "fixed-atom-changed"',
            '  | .distanceOutOfRange _ _ => "distance-out-of-range"',
            '  | .orientationInvalid _ => "orientation-invalid"',
            '  | .rigidGroupDistorted _ => "rigid-group-distorted"',
            "",
            "private def evaluationPayload : String :=",
            "  let issues := geometryValidationIssues expected candidate policy",
            '  let status := if issues.isEmpty then "pass" else "reject"',
            "  let encodedIssues := String.intercalate \",\" (issues.map fun issue =>",
            '    "\\\"" ++ validationIssueCode issue ++ "\\\"")',
            '  "{\\\"status\\\":\\\"" ++ status ++ "\\\",\\\"issues\\\":[" ++ encodedIssues ++ "]}"',
            "",
            f'#eval IO.println ("{EVALUATION_PREFIX}" ++ evaluationPayload)',
        ]
    )


def render_document(payload: Any, *, mode: str = "proof") -> str:
    payload = strict_object(
        payload,
        "document",
        {"schemaVersion", "coordinateScale", "expected", "candidate", "policy"},
    )
    if checked_int(payload["schemaVersion"], "schemaVersion") != SCHEMA_VERSION:
        raise ValueError(f"schemaVersion must be {SCHEMA_VERSION}")
    if checked_int(payload["coordinateScale"], "coordinateScale") != COORDINATE_SCALE:
        raise ValueError(f"coordinateScale must be fixed at {COORDINATE_SCALE}")
    if mode not in {"proof", "evaluate"}:
        raise ValueError("mode must be 'proof' or 'evaluate'")
    conclusion = (
        "\n".join(
            [
                "#eval geometryValidationIssues expected candidate policy",
                "example : validateGeometryPolicy expected candidate policy = true := by",
                "  decide",
            ]
        )
        if mode == "proof"
        else render_evaluation()
    )
    return "\n".join(
        [
            "-- Generated from strict JSON data. Do not edit by hand.",
            "import RetainMolGeometry",
            "",
            "open RetainMol.Geometry",
            "",
            render_molecule("expected", payload["expected"]),
            render_molecule("candidate", payload["candidate"]),
            render_policy(payload["policy"]),
            conclusion,
            "",
        ]
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--mode", choices=("proof", "evaluate"), default="proof")
    args = parser.parse_args()

    rendered = render_document(load_payload(args.input), mode=args.mode)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(rendered, encoding="utf-8")


if __name__ == "__main__":
    main()
