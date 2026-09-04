#!/usr/bin/env python3
"""Convert a strict GeometryIntent request to generated Lean evaluation code."""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

from json_to_lean import (
    BOND_ORDERS,
    COORDINATE_SCALE,
    EVALUATION_PREFIX,
    MAX_RIGID_GROUP_ATOMS,
    MAX_ATOMS,
    MAX_BONDS,
    checked_int,
    checked_list,
    checked_bool,
    checked_string,
    lean_inline_list,
    lean_list,
    lean_string,
    load_payload,
    strict_object,
)


SCHEMA_VERSION = 3
PROJECTION_VERSION = "expected-effect-v1-to-lean-v1"
MAX_COMMANDS = 512
MAX_ABS_COORDINATE_UNITS = 1_000_000_000
MAX_ABS_FORMAL_CHARGE = 64
MAX_RADICAL_ELECTRONS = 64


def render_vec3(value: Any, field: str) -> str:
    coordinates = checked_list(value, field, maximum=3)
    if len(coordinates) != 3:
        raise ValueError(f"{field} must contain exactly three coordinate units")
    parsed = [
        checked_int(item, f"{field}[{index}]")
        for index, item in enumerate(coordinates)
    ]
    if any(abs(item) > MAX_ABS_COORDINATE_UNITS for item in parsed):
        raise ValueError(
            f"{field} exceeds coordinate-unit limit {MAX_ABS_COORDINATE_UNITS}"
        )
    x, y, z = parsed
    return f"{{ x := {x}, y := {y}, z := {z} }}"


def render_intent_atom(atom: Any, field: str) -> str:
    atom = strict_object(atom, field, {
        "atomId", "symbol", "positionUnits", "formalCharge",
        "radicalElectrons", "aromatic",
    })
    formal_charge = checked_int(atom["formalCharge"], f"{field}.formalCharge")
    radical_electrons = checked_int(
        atom["radicalElectrons"], f"{field}.radicalElectrons", minimum=0,
    )
    if abs(formal_charge) > MAX_ABS_FORMAL_CHARGE:
        raise ValueError(
            f"{field}.formalCharge exceeds limit {MAX_ABS_FORMAL_CHARGE}"
        )
    if radical_electrons > MAX_RADICAL_ELECTRONS:
        raise ValueError(
            f"{field}.radicalElectrons exceeds limit {MAX_RADICAL_ELECTRONS}"
        )
    return (
        "{ atomId := "
        f"{lean_string(atom['atomId'], f'{field}.atomId')}, "
        f"symbol := {lean_string(atom['symbol'], f'{field}.symbol')}, "
        f"position := {render_vec3(atom['positionUnits'], f'{field}.positionUnits')}, "
        f"formalCharge := {formal_charge}, "
        f"radicalElectrons := {radical_electrons}, "
        f"aromatic := {str(checked_bool(atom['aromatic'], f'{field}.aromatic')).lower()} }}"
    )


def render_intent_bond(bond: Any, field: str) -> str:
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


def render_intent_molecule(name: str, molecule: Any) -> str:
    molecule = strict_object(molecule, name, {"atoms", "bonds"})
    atoms = checked_list(molecule["atoms"], f"{name}.atoms", maximum=MAX_ATOMS)
    bonds = checked_list(molecule["bonds"], f"{name}.bonds", maximum=MAX_BONDS)
    return (
        f"private def {name} : MoleculeSnapshot := {{\n"
        f"  atoms := {lean_list([render_intent_atom(atom, f'{name}.atoms[{index}]') for index, atom in enumerate(atoms)], '    ')}\n"
        f"  bonds := {lean_list([render_intent_bond(bond, f'{name}.bonds[{index}]') for index, bond in enumerate(bonds)], '    ')}\n"
        "}\n"
    )


def render_command(value: Any, field: str) -> str:
    command = strict_object(value, field, {"commandId", "kind"}, {
        "atom", "atomId", "symbol", "position", "bond", "bondId", "order",
    })
    kind = command["kind"]
    command_id = lean_string(command["commandId"], f"{field}.commandId")
    if kind == "atomAdd":
        strict_object(command, field, {"commandId", "kind", "atom"})
        primitive = f".atomAdd {render_intent_atom(command['atom'], f'{field}.atom')}"
        return f"⟨{command_id}, {primitive}⟩"
    if kind == "atomReplace":
        strict_object(command, field, {"commandId", "kind", "atomId", "symbol"})
        primitive = (f".atomReplace {lean_string(command['atomId'], f'{field}.atomId')} "
                     f"{lean_string(command['symbol'], f'{field}.symbol')}")
        return f"⟨{command_id}, {primitive}⟩"
    if kind == "atomRemove":
        strict_object(command, field, {"commandId", "kind", "atomId"})
        return f"⟨{command_id}, .atomRemove {lean_string(command['atomId'], f'{field}.atomId')}⟩"
    if kind == "atomMove":
        strict_object(command, field, {"commandId", "kind", "atomId", "position"})
        primitive = (f".atomMove {lean_string(command['atomId'], f'{field}.atomId')} "
                     f"{render_vec3(command['position'], f'{field}.position')}")
        return f"⟨{command_id}, {primitive}⟩"
    if kind == "bondAdd":
        strict_object(command, field, {"commandId", "kind", "bond"})
        return f"⟨{command_id}, .bondAdd {render_intent_bond(command['bond'], f'{field}.bond')}⟩"
    if kind == "bondRemove":
        strict_object(command, field, {"commandId", "kind", "bondId"})
        return f"⟨{command_id}, .bondRemove {lean_string(command['bondId'], f'{field}.bondId')}⟩"
    if kind == "bondSetOrder":
        strict_object(command, field, {"commandId", "kind", "bondId", "order"})
        order = command["order"]
        if order not in BOND_ORDERS:
            raise ValueError(f"{field}.order must be one of {sorted(BOND_ORDERS)}")
        primitive = (f".bondSetOrder {lean_string(command['bondId'], f'{field}.bondId')} "
                     f"{BOND_ORDERS[order]}")
        return f"⟨{command_id}, {primitive}⟩"
    raise ValueError(f"{field}.kind is not a supported primitive command")


def render_orientation(value: Any, field: str) -> str:
    check = strict_object(value, field, {"atomIds"})
    atom_ids = checked_list(check["atomIds"], f"{field}.atomIds", maximum=4)
    if len(atom_ids) != 4:
        raise ValueError(f"{field}.atomIds must contain four ids")
    return (
        "{ atomId1 := "
        f"{lean_string(atom_ids[0], f'{field}.atomIds[0]')}, "
        f"atomId2 := {lean_string(atom_ids[1], f'{field}.atomIds[1]')}, "
        f"atomId3 := {lean_string(atom_ids[2], f'{field}.atomIds[2]')}, "
        f"atomId4 := {lean_string(atom_ids[3], f'{field}.atomIds[3]')} }}"
    )


def render_rigid_group(value: Any, field: str) -> str:
    group = strict_object(value, field, {"atomIds"})
    atom_ids = checked_list(
        group["atomIds"], f"{field}.atomIds", maximum=MAX_RIGID_GROUP_ATOMS,
    )
    rendered_ids = [
        lean_string(atom_id, f"{field}.atomIds[{index}]")
        for index, atom_id in enumerate(atom_ids)
    ]
    return lean_inline_list(rendered_ids)


def render_intent(intent: Any) -> str:
    intent = strict_object(intent, "intent", {
        "before", "commands", "expected", "protectedAnchorIds",
        "orientationAtomGroups", "rigidAtomGroups",
    })
    commands = checked_list(intent["commands"], "intent.commands", maximum=MAX_COMMANDS)
    protected = checked_list(intent["protectedAnchorIds"], "intent.protectedAnchorIds")
    orientations = checked_list(intent["orientationAtomGroups"], "intent.orientationAtomGroups")
    rigid_groups = checked_list(intent["rigidAtomGroups"], "intent.rigidAtomGroups")
    return "\n".join([
        render_intent_molecule("before", intent["before"]),
        render_intent_molecule("expected", intent["expected"]),
        "private def intent : GeometryIntent := {",
        "  before := before",
        f"  commands := {lean_list([render_command(item, f'intent.commands[{index}]') for index, item in enumerate(commands)], '    ')}",
        "  expected := expected",
        f"  protectedAnchorIds := {lean_list([lean_string(item, f'intent.protectedAnchorIds[{index}]') for index, item in enumerate(protected)], '    ')}",
        f"  orientationAtomGroups := {lean_list([render_orientation(item, f'intent.orientationAtomGroups[{index}]') for index, item in enumerate(orientations)], '    ')}",
        f"  rigidAtomGroups := {lean_list([render_rigid_group(item, f'intent.rigidAtomGroups[{index}]') for index, item in enumerate(rigid_groups)], '    ')}",
        "}",
    ])


def render_evaluation() -> str:
    return "\n".join([
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
        "  match geometryIntentCandidateIssues intent candidate with",
        '  | none => "{\\\"status\\\":\\\"reject\\\",\\\"issues\\\":[\\\"intent-invalid\\\"]}"',
        "  | some issues =>",
        '      let status := if issues.isEmpty then "pass" else "reject"',
        "      let encodedIssues := String.intercalate \",\" (issues.map fun issue =>",
        '        "\\\"" ++ validationIssueCode issue ++ "\\\"")',
        '      "{\\\"status\\\":\\\"" ++ status ++ "\\\",\\\"issues\\\":[" ++ encodedIssues ++ "]}"',
        "",
        f'#eval IO.println ("{EVALUATION_PREFIX}" ++ evaluationPayload)',
    ])


def render_document(payload: Any) -> str:
    payload = strict_object(
        payload, "document", {"schemaVersion", "projectionVersion", "coordinateScale", "intent", "candidate"},
    )
    if checked_int(payload["schemaVersion"], "schemaVersion") != SCHEMA_VERSION:
        raise ValueError(f"schemaVersion must be {SCHEMA_VERSION}")
    if checked_int(payload["coordinateScale"], "coordinateScale") != COORDINATE_SCALE:
        raise ValueError(f"coordinateScale must be fixed at {COORDINATE_SCALE}")
    if checked_string(payload["projectionVersion"], "projectionVersion") != PROJECTION_VERSION:
        raise ValueError(f"projectionVersion must be {PROJECTION_VERSION}")
    return "\n".join([
        "-- Generated from strict GeometryIntent JSON. Do not edit by hand.",
        "import RetainMolGeometry",
        "",
        "open RetainMol.Geometry",
        "",
        render_intent(payload["intent"]),
        render_intent_molecule("candidate", payload["candidate"]),
        render_evaluation(),
        "",
    ])


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    rendered = render_document(load_payload(args.input))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(rendered, encoding="utf-8")


if __name__ == "__main__":
    main()
