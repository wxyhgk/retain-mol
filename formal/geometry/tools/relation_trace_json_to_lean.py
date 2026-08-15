#!/usr/bin/env python3
"""Validate a trusted runtime relation trace and render its Lean certificate."""

from __future__ import annotations

import argparse
import hashlib
from pathlib import Path
from typing import Any

from intent_json_to_lean import render_intent_molecule
from json_to_lean import (
    lean_inline_list,
    lean_string,
)
from relation_trace_contract import validate_document
from relation_trace_io import (
    MAX_TRACE_BYTES,
    load_trace_document,
    load_trace_payload,
    parse_strict_json_bytes,
    write_trace_output,
)
from relation_trace_request import (
    load_trusted_request_document,
    validate_request,
    validate_request_digest,
)


def load_payload(path: Path) -> Any:
    return load_trace_payload(path)


def render_receipt(item: dict[str, str], field: str) -> str:
    return (
        "{ commandId := "
        f"{lean_string(item['commandId'], f'{field}.commandId')}, "
        f"commandKind := {lean_string(item['commandKind'], f'{field}.commandKind')}, "
        f"preDigest := {lean_string(item['preDigest'], f'{field}.preDigest')}, "
        f"postDigest := {lean_string(item['postDigest'], f'{field}.postDigest')} }}"
    )


def render_ratio(value: tuple[int, int, int, int]) -> str:
    return (
        f"{{ loNum := {value[0]}, loDen := {value[1]}, "
        f"hiNum := {value[2]}, hiDen := {value[3]} }}"
    )


def render_witness(item: dict[str, Any], field: str) -> str:
    region = item["region"]
    frame = region["frame"]
    turn = item["turn"]
    region_text = (
        "{ atomIds := "
        f"{lean_inline_list([lean_string(atom_id, f'{field}.region.atomIds') for atom_id in region['atomIds']])}, "
        "frame := { originAtomId := "
        f"{lean_string(frame['originAtomId'], f'{field}.region.frame.originAtomId')}, "
        f"axisAtomId := {lean_string(frame['axisAtomId'], f'{field}.region.frame.axisAtomId')}, "
        f"radialAtomId := {lean_string(frame['radialAtomId'], f'{field}.region.frame.radialAtomId')}, "
        f"minAxisSquared := {frame['minAxisSquared']}, "
        f"minAreaSquared := {frame['minAreaSquared']} }}, "
        f"handednessAtomId := {lean_string(region['handednessAtomId'], f'{field}.region.handednessAtomId')}, "
        f"maxSquaredDistanceDelta := {region['maxSquaredDistanceDelta']}, "
        f"minAbsVolume6 := {region['minAbsVolume6']} }}"
    )
    return (
        ".rotateGroup { commandId := "
        f"{lean_string(item['commandId'], f'{field}.commandId')}, "
        f"axisBondId := {lean_string(item['axisBondId'], f'{field}.axisBondId')}, "
        f"fixedAxisAtomId := {lean_string(item['fixedAxisAtomId'], f'{field}.fixedAxisAtomId')}, "
        f"movingAxisAtomId := {lean_string(item['movingAxisAtomId'], f'{field}.movingAxisAtomId')}, "
        f"movingAtomIds := {lean_inline_list([lean_string(atom_id, f'{field}.movingAtomIds') for atom_id in item['movingAtomIds']])}, "
        f"region := {region_text}, "
        "turn := { cosineSign := ."
        f"{turn['cosineSign']}, sineSign := .{turn['sineSign']}, signMargin := 0, "
        f"cosineSquared := {render_ratio(turn['cosineSquared'])}, "
        f"sineSquared := {render_ratio(turn['sineSquared'])} }} }}"
    )


def render_document(
    trace_bytes: bytes,
    request_bytes: bytes,
    expected_request_sha256: str,
) -> str:
    validate_request_digest(request_bytes, expected_request_sha256)
    payload = parse_strict_json_bytes(trace_bytes, label="relation trace")
    request_payload = parse_strict_json_bytes(
        request_bytes,
        label="certificate request",
    )
    document = validate_document(payload)
    request = validate_request(
        request_payload,
        trace_bytes=trace_bytes,
        document=document,
    )
    identity = request["expectedIdentity"]
    request_sha256 = hashlib.sha256(request_bytes).hexdigest()
    trace_sha256 = request["relationTraceSha256"]
    request_id = request["requestId"]
    receipt_names = [f"receipt{index}" for index in range(len(document["steps"]))]
    lines = [
        "-- Generated from a runtime relation trace bound by an external certificate request.",
        "import RetainMolGeometry.RelationTrace",
        "",
        "open RetainMol.Geometry",
        "",
        "private def externallyExpectedCertificateIdentity : RelationTraceCertificateIdentity := {",
        f"  requestId := {lean_string(request_id, 'certificateRequest.requestId')}",
        f"  requestSha256 := {lean_string(request_sha256, 'certificateRequest.sha256')}",
        f"  traceSha256 := {lean_string(trace_sha256, 'certificateRequest.relationTraceSha256')}",
        "}",
        "",
        "private def certificateIdentity : RelationTraceCertificateIdentity := {",
        f"  requestId := {lean_string(request_id, 'certificate.requestId')}",
        f"  requestSha256 := {lean_string(request_sha256, 'certificate.requestSha256')}",
        f"  traceSha256 := {lean_string(trace_sha256, 'certificate.traceSha256')}",
        "}",
        "",
        "private def expectedIdentity : RelationTraceIdentity := {",
        f"  projectionVersion := {lean_string(identity['projectionVersion'], 'identity.projectionVersion')}",
        f"  planId := {lean_string(identity['planId'], 'identity.planId')}",
        f"  enforcedPlanSha256 := {lean_string(identity['enforcedPlanSha256'], 'identity.enforcedPlanSha256')}",
        f"  baseDigest := {lean_string(identity['baseDigest'], 'identity.baseDigest')}",
        f"  finalDigest := {lean_string(identity['finalDigest'], 'identity.finalDigest')}",
        "}",
        "",
    ]
    for index, item in enumerate(request["expectedReceipts"]):
        lines.extend([
            f"private def {receipt_names[index]} : RelationCommandReceipt := "
            f"{render_receipt(item, f'expectedReceipts[{index}]')}",
            "",
        ])
    lines.extend([
        "private def expectedReceipts : List RelationCommandReceipt := "
        + lean_inline_list(receipt_names),
        "",
        render_intent_molecule("base", document["base"]),
        render_intent_molecule("final", document["final"]),
    ])
    step_names = []
    for index, step in enumerate(document["steps"]):
        before_name = f"step{index}Before"
        after_name = f"step{index}After"
        step_name = f"step{index}"
        step_names.append(step_name)
        lines.extend([
            render_intent_molecule(before_name, step["before"]),
            render_intent_molecule(after_name, step["after"]),
            f"private def {step_name} : RelationTraceStep := {{",
            f"  receipt := {receipt_names[index]}",
            f"  before := {before_name}",
            f"  after := {after_name}",
            f"  witness := {render_witness(step['witness'], f'steps[{index}].witness')}",
            "}",
            "",
        ])
    lines.extend([
        "private def trace : RelationTrace := {",
        "  identity := expectedIdentity",
        "  base := base",
        "  final := final",
        f"  steps := {lean_inline_list(step_names)}",
        "}",
        "",
        "private def certificate : RelationTraceCertificate := {",
        "  certificateIdentity := certificateIdentity",
        "  expectedIdentity := expectedIdentity",
        "  expectedReceipts := expectedReceipts",
        "  trace := trace",
        "}",
        "",
        "example : relationTraceCertificateIsSatisfied externallyExpectedCertificateIdentity certificate = true := by",
        "  decide",
        "",
        "example : RelationTraceCertificateSemantics externallyExpectedCertificateIdentity certificate := by",
        "  apply relationTraceCertificateIsSatisfied_sound",
        "  decide",
        "",
    ])
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("trace", type=Path)
    parser.add_argument("request", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument(
        "--expected-request-sha256",
        required=True,
        help="SHA-256 fixed by the immutable run manifest before request parsing",
    )
    args = parser.parse_args()
    trace_bytes, _payload = load_trace_document(args.trace)
    request_bytes, _request_payload = load_trusted_request_document(
        args.request,
        args.expected_request_sha256,
    )
    rendered = render_document(
        trace_bytes,
        request_bytes,
        args.expected_request_sha256,
    )
    write_trace_output([args.trace, args.request], args.output, rendered)


if __name__ == "__main__":
    main()
