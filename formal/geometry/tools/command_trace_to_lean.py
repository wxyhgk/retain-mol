#!/usr/bin/env python3
"""Convert a strict primitive-command receipt trace to a Lean proof document."""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

from json_to_lean import (
    BOND_ORDERS,
    COORDINATE_SCALE,
    checked_int,
    checked_list,
    lean_list,
    lean_string,
    load_payload,
    quantize_position,
    render_atom,
    render_bond,
    render_molecule,
    strict_object,
)


SCHEMA_VERSION = 1
MAX_STEPS = 50_000
EVALUATION_PREFIX = "RETAINMOL_COMMAND_TRACE_RESULT:"


def render_position(value: Any, field: str) -> str:
    x, y, z = quantize_position(value, field)
    return f"{{ x := {x}, y := {y}, z := {z} }}"


def render_order(value: Any, field: str) -> str:
    if value not in BOND_ORDERS:
        raise ValueError(f"{field} must be one of {sorted(BOND_ORDERS)}")
    return BOND_ORDERS[value]


def render_command(value: Any, field: str) -> str:
    value = strict_object(value, field, {"kind"}, {
        "atom", "atomId", "symbol", "position", "bond", "bondId", "order"
    })
    kind = value["kind"]
    if kind == "atom.add":
        value = strict_object(value, field, {"kind", "atom"})
        return f".atomAdd {render_atom(value['atom'], f'{field}.atom')}"
    if kind == "atom.replace":
        value = strict_object(value, field, {"kind", "atomId", "symbol"})
        return (
            f".atomReplace {lean_string(value['atomId'], f'{field}.atomId')} "
            f"{lean_string(value['symbol'], f'{field}.symbol')}"
        )
    if kind == "atom.remove":
        value = strict_object(value, field, {"kind", "atomId"})
        return f".atomRemove {lean_string(value['atomId'], f'{field}.atomId')}"
    if kind == "atom.move":
        value = strict_object(value, field, {"kind", "atomId", "position"})
        return (
            f".atomMove {lean_string(value['atomId'], f'{field}.atomId')} "
            f"{render_position(value['position'], f'{field}.position')}"
        )
    if kind == "bond.add":
        value = strict_object(value, field, {"kind", "bond"})
        return f".bondAdd {render_bond(value['bond'], f'{field}.bond')}"
    if kind == "bond.remove":
        value = strict_object(value, field, {"kind", "bondId"})
        return f".bondRemove {lean_string(value['bondId'], f'{field}.bondId')}"
    if kind == "bond.setOrder":
        value = strict_object(value, field, {"kind", "bondId", "order"})
        return (
            f".bondSetOrder {lean_string(value['bondId'], f'{field}.bondId')} "
            f"{render_order(value['order'], f'{field}.order')}"
        )
    raise ValueError(f"{field}.kind is unsupported: {kind!r}")


def render_document(payload: Any, *, mode: str = "proof") -> str:
    payload = strict_object(
        payload,
        "document",
        {"schemaVersion", "coordinateScale", "before", "steps"},
    )
    if checked_int(payload["schemaVersion"], "schemaVersion") != SCHEMA_VERSION:
        raise ValueError(f"schemaVersion must be {SCHEMA_VERSION}")
    if checked_int(payload["coordinateScale"], "coordinateScale") != COORDINATE_SCALE:
        raise ValueError(f"coordinateScale must be fixed at {COORDINATE_SCALE}")
    if mode not in {"proof", "evaluate"}:
        raise ValueError("mode must be 'proof' or 'evaluate'")

    steps = checked_list(payload["steps"], "steps", maximum=MAX_STEPS)
    after_definitions: list[str] = []
    rendered_steps: list[str] = []
    for index, step_value in enumerate(steps):
        field = f"steps[{index}]"
        step = strict_object(step_value, field, {"command", "after"})
        after_name = f"after{index}"
        after_definitions.append(render_molecule(after_name, step["after"]))
        rendered_steps.append(
            "{ command := "
            f"{render_command(step['command'], f'{field}.command')}, after := {after_name} }}"
        )

    trace = (
        "private def commandTrace : List PrimitiveCommandStep := "
        f"{lean_list(rendered_steps, '  ')}\n"
    )
    if mode == "proof":
        conclusion = "\n".join([
            "example : primitiveCommandTraceIsValid before commandTrace = true := by",
            "  decide",
            "",
            "example : PrimitiveCommandTraceSemantics before commandTrace := by",
            "  apply primitiveCommandTraceIsValid_sound",
            "  decide",
        ])
    else:
        conclusion = "\n".join([
            "private def traceStatus : String :=",
            '  if primitiveCommandTraceIsValid before commandTrace then "pass" else "reject"',
            f'#eval IO.println ("{EVALUATION_PREFIX}" ++ traceStatus)',
        ])

    return "\n".join([
        "-- Generated from a strict command receipt. Do not edit by hand.",
        "import RetainMolGeometry",
        "",
        "open RetainMol.Geometry",
        "",
        render_molecule("before", payload["before"]),
        *after_definitions,
        trace,
        conclusion,
        "",
    ])


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
