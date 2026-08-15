#!/usr/bin/env python3
"""Convert a strict system-authored SpatialRelation V1 artifact to Lean."""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

from intent_json_to_lean import render_intent_molecule
from json_to_lean import (
    COORDINATE_SCALE,
    EVALUATION_PREFIX,
    checked_int,
    checked_list,
    lean_inline_list,
    lean_list,
    lean_string,
    load_payload,
    strict_object,
)


SCHEMA_VERSION = 1
RELATION_SCOPE = "spatial-relation-v1"
MAX_RELATIONS = 128
MAX_REGION_ATOMS = 64

# These values belong to this verifier policy. They are intentionally absent
# from the caller-authored relation payload.
# With coordinateScale=1000 these exclude lattice-nonzero but numerically
# collapsed evidence: axis >= 0.316 A, projected frame area >= 0.1 A^2,
# and orientation volume6 >= 0.1 A^3.
MIN_AXIS_SQUARED = 100_000
MIN_AREA_SQUARED = 10_000_000_000
MIN_ABS_VOLUME6 = 100_000_000
MAX_SQUARED_DISTANCE_DELTA = 0


def render_frame(value: Any, field: str) -> str:
    frame = strict_object(value, field, {
        "originAtomId", "axisAtomId", "radialAtomId",
    })
    return (
        "{ originAtomId := "
        f"{lean_string(frame['originAtomId'], f'{field}.originAtomId')}, "
        f"axisAtomId := {lean_string(frame['axisAtomId'], f'{field}.axisAtomId')}, "
        f"radialAtomId := {lean_string(frame['radialAtomId'], f'{field}.radialAtomId')}, "
        f"minAxisSquared := {MIN_AXIS_SQUARED}, "
        f"minAreaSquared := {MIN_AREA_SQUARED} }}"
    )


def render_atom_ids(value: Any, field: str) -> str:
    atom_ids = checked_list(value, field, maximum=MAX_REGION_ATOMS)
    rendered = [
        lean_string(atom_id, f"{field}[{index}]")
        for index, atom_id in enumerate(atom_ids)
    ]
    return lean_inline_list(rendered)


def render_region(value: Any, field: str) -> str:
    region = strict_object(value, field, {
        "atomIds", "frame", "handednessAtomId",
    })
    return (
        "{ atomIds := "
        f"{render_atom_ids(region['atomIds'], f'{field}.atomIds')}, "
        f"frame := {render_frame(region['frame'], f'{field}.frame')}, "
        f"handednessAtomId := "
        f"{lean_string(region['handednessAtomId'], f'{field}.handednessAtomId')}, "
        f"maxSquaredDistanceDelta := {MAX_SQUARED_DISTANCE_DELTA}, "
        f"minAbsVolume6 := {MIN_ABS_VOLUME6} }}"
    )


def ratio(num: int, den: int) -> str:
    return f"{{ loNum := {num}, loDen := {den}, hiNum := {num}, hiDen := {den} }}"


def exact_turn(angle_degrees: int, field: str) -> tuple[str, str, tuple[int, int], tuple[int, int]]:
    normalized = ((angle_degrees + 180) % 360) - 180
    if normalized == -180:
        normalized = 180
    magnitude = abs(normalized)
    ratios = {
        0: ((1, 1), (0, 1)),
        30: ((3, 4), (1, 4)),
        45: ((1, 2), (1, 2)),
        60: ((1, 4), (3, 4)),
        90: ((0, 1), (1, 1)),
        120: ((1, 4), (3, 4)),
        135: ((1, 2), (1, 2)),
        150: ((3, 4), (1, 4)),
        180: ((1, 1), (0, 1)),
    }
    if magnitude not in ratios:
        raise ValueError(
            f"{field} is not in the exact-angle V1 set "
            "{0,30,45,60,90,120,135,150,180} modulo sign and 360"
        )
    cosine_sign = (
        ".nearZero" if magnitude == 90
        else ".positive" if magnitude < 90
        else ".negative"
    )
    sine_sign = (
        ".nearZero" if magnitude in {0, 180}
        else ".positive" if normalized > 0
        else ".negative"
    )
    cosine_ratio, sine_ratio = ratios[magnitude]
    return cosine_sign, sine_sign, cosine_ratio, sine_ratio


def render_turn(angle_degrees: Any, field: str) -> str:
    parsed = checked_int(angle_degrees, field)
    cosine_sign, sine_sign, cosine_ratio, sine_ratio = exact_turn(parsed, field)
    return (
        f"{{ cosineSign := {cosine_sign}, sineSign := {sine_sign}, "
        "signMargin := 0, "
        f"cosineSquared := {ratio(*cosine_ratio)}, "
        f"sineSquared := {ratio(*sine_ratio)} }}"
    )


def render_relation(value: Any, field: str) -> str:
    relation = strict_object(value, field, {"kind"}, {
        "frame", "region", "commandId", "axisBondId", "fixedAxisAtomId",
        "movingAxisAtomId", "movingAtomIds", "angleDegrees",
    })
    kind = relation["kind"]
    if kind == "portFrame":
        strict_object(relation, field, {"kind", "frame"})
        return f".portFrame {render_frame(relation['frame'], f'{field}.frame')}"
    if kind == "properRigid":
        strict_object(relation, field, {"kind", "region"})
        return f".properRigid {render_region(relation['region'], f'{field}.region')}"
    if kind == "rotatableJoint":
        strict_object(relation, field, {
            "kind", "commandId", "axisBondId", "fixedAxisAtomId",
            "movingAxisAtomId", "movingAtomIds", "region", "angleDegrees",
        })
        return (
            ".rotatableJoint { commandId := "
            f"{lean_string(relation['commandId'], f'{field}.commandId')}, "
            f"axisBondId := {lean_string(relation['axisBondId'], f'{field}.axisBondId')}, "
            "fixedAxisAtomId := "
            f"{lean_string(relation['fixedAxisAtomId'], f'{field}.fixedAxisAtomId')}, "
            "movingAxisAtomId := "
            f"{lean_string(relation['movingAxisAtomId'], f'{field}.movingAxisAtomId')}, "
            f"movingAtomIds := {render_atom_ids(relation['movingAtomIds'], f'{field}.movingAtomIds')}, "
            f"region := {render_region(relation['region'], f'{field}.region')}, "
            f"turn := {render_turn(relation['angleDegrees'], f'{field}.angleDegrees')} }}"
        )
    raise ValueError(f"{field}.kind is not a supported SpatialRelation V1 kind")


def render_evaluation() -> str:
    return "\n".join([
        "private def statusCode : RelationEvaluationStatus → String",
        '  | .pass => "pass"',
        '  | .reject => "reject"',
        '  | .indeterminate => "indeterminate"',
        "",
        "private def issueClassCode : RelationIssueClass → String",
        '  | .contradiction => "contradiction"',
        '  | .numericMargin => "numeric-margin"',
        "",
        "private def issueCode : RelationIssueCode → String",
        '  | .referenceTopologyInvalid => "reference-topology-invalid"',
        '  | .candidateTopologyInvalid => "candidate-topology-invalid"',
        '  | .molecularGraphChanged => "molecular-graph-changed"',
        '  | .relationDefinitionInvalid => "relation-definition-invalid"',
        '  | .referenceEvidenceInsufficient => "reference-evidence-insufficient"',
        '  | .relationNotSatisfied => "relation-not-satisfied"',
        "",
        "private def encodeIssue (issue : RelationIssue) : String :=",
        "  let relationIndex := match issue.relationIndex with",
        '    | none => "null"',
        "    | some index => toString index",
        '  "{\\\"relationIndex\\\":" ++ relationIndex ++',
        '    ",\\\"class\\\":\\\"" ++ issueClassCode issue.issueClass ++',
        '    "\\\",\\\"code\\\":\\\"" ++ issueCode issue.code ++ "\\\"}"',
        "",
        "private def evaluationPayload : String :=",
        "  let evaluation := evaluateSpatialRelations reference candidate relations",
        '  let encoded := String.intercalate "," (evaluation.issues.map encodeIssue)',
        '  "{\\\"status\\\":\\\"" ++ statusCode evaluation.status ++ "\\\",\\\"scope\\\":\\\"spatial-relation-v1\\\",\\\"issues\\\":[" ++ encoded ++ "]}"',
        "",
        f'#eval IO.println ("{EVALUATION_PREFIX}" ++ evaluationPayload)',
    ])


def render_document(payload: Any) -> str:
    payload = strict_object(payload, "document", {
        "schemaVersion", "relationScope", "coordinateScale",
        "reference", "candidate", "relations",
    })
    if checked_int(payload["schemaVersion"], "schemaVersion") != SCHEMA_VERSION:
        raise ValueError(f"schemaVersion must be {SCHEMA_VERSION}")
    if payload["relationScope"] != RELATION_SCOPE:
        raise ValueError(f"relationScope must be {RELATION_SCOPE}")
    if checked_int(payload["coordinateScale"], "coordinateScale") != COORDINATE_SCALE:
        raise ValueError(f"coordinateScale must be fixed at {COORDINATE_SCALE}")
    relations = checked_list(payload["relations"], "relations", maximum=MAX_RELATIONS)
    if not relations:
        raise ValueError("relations must contain at least one relation")
    return "\n".join([
        "-- Generated from strict SpatialRelation V1 JSON. Do not edit by hand.",
        "import RetainMolGeometry",
        "",
        "open RetainMol.Geometry",
        "",
        render_intent_molecule("reference", payload["reference"]),
        render_intent_molecule("candidate", payload["candidate"]),
        "private def relations : List SpatialRelation := " + lean_list([
            render_relation(relation, f"relations[{index}]")
            for index, relation in enumerate(relations)
        ], "  "),
        "",
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
