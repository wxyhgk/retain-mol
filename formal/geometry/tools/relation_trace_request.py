"""Validate the externally fixed request for one relation-trace certificate."""

from __future__ import annotations

import hashlib
import re
from pathlib import Path
from typing import Any

from json_to_lean import checked_int, checked_list, checked_string, strict_object
from relation_trace_contract import (
    MAX_STEPS,
    PROJECTION_VERSION,
    command_kind_for_witness,
    primitive_command,
    receipt,
)
from relation_trace_io import parse_strict_json_bytes, read_bounded_regular_file


REQUEST_SCHEMA_VERSION = 1
MAX_REQUEST_BYTES = 1024 * 1024
_SHA256_RE = re.compile(r"[0-9a-f]{64}\Z")


def load_request_document(path: Path) -> tuple[bytes, Any]:
    content = read_bounded_regular_file(
        path,
        label="certificate request",
        maximum=MAX_REQUEST_BYTES,
    )
    return content, parse_strict_json_bytes(content, label="certificate request")


def validate_request_digest(content: bytes, expected_sha256: str) -> str:
    expected = _sha256(expected_sha256, "expected certificate request SHA-256")
    actual = hashlib.sha256(content).hexdigest()
    if actual != expected:
        raise ValueError("expected certificate request SHA-256 does not bind the request bytes")
    return actual


def load_trusted_request_document(path: Path, expected_sha256: str) -> tuple[bytes, Any]:
    content = read_bounded_regular_file(
        path,
        label="certificate request",
        maximum=MAX_REQUEST_BYTES,
    )
    validate_request_digest(content, expected_sha256)
    return content, parse_strict_json_bytes(content, label="certificate request")


def _sha256(value: Any, field: str) -> str:
    digest = checked_string(value, field)
    if not _SHA256_RE.fullmatch(digest):
        raise ValueError(f"{field} must be a lowercase SHA-256")
    return digest


def relation_policy(value: Any, field: str) -> dict[str, Any]:
    discriminator = strict_object(value, field, {"kind"}, {"command"})
    kind = checked_string(discriminator["kind"], f"{field}.kind")
    if kind == "rotateGroup":
        strict_object(value, field, {"kind"})
        return {"kind": "rotateGroup"}
    if kind == "primitive":
        policy = strict_object(value, field, {"kind", "command"})
        return {
            "kind": "primitive",
            "command": primitive_command(policy["command"], f"{field}.command"),
        }
    raise ValueError(f"{field}.kind is not supported: {kind!r}")


def command_kind_for_policy(item: dict[str, Any]) -> str:
    if item["kind"] == "primitive":
        return item["command"]["kind"]
    return "geometry.rotateGroup"


def validate_request(
    value: Any,
    *,
    trace_bytes: bytes,
    document: dict[str, Any],
) -> dict[str, Any]:
    request = strict_object(value, "certificateRequest", {
        "schemaVersion", "requestId", "relationTraceSha256",
        "expectedIdentity", "expectedReceipts", "expectedPolicies",
    })
    if checked_int(request["schemaVersion"], "certificateRequest.schemaVersion") != REQUEST_SCHEMA_VERSION:
        raise ValueError(
            f"certificateRequest.schemaVersion must be {REQUEST_SCHEMA_VERSION}"
        )
    request_id = checked_string(request["requestId"], "certificateRequest.requestId")
    if not request_id:
        raise ValueError("certificateRequest.requestId must be nonempty")
    expected_trace_sha = _sha256(
        request["relationTraceSha256"],
        "certificateRequest.relationTraceSha256",
    )
    if hashlib.sha256(trace_bytes).hexdigest() != expected_trace_sha:
        raise ValueError("certificateRequest.relationTraceSha256 does not bind the trace bytes")

    raw_identity = strict_object(
        request["expectedIdentity"],
        "certificateRequest.expectedIdentity",
        {"projectionVersion", "planId", "enforcedPlanSha256", "baseDigest", "finalDigest"},
    )
    projection_version = checked_string(
        raw_identity["projectionVersion"],
        "certificateRequest.expectedIdentity.projectionVersion",
    )
    if projection_version != PROJECTION_VERSION:
        raise ValueError(
            f"certificateRequest.expectedIdentity.projectionVersion must be {PROJECTION_VERSION}"
        )
    expected_identity = {
        "projectionVersion": projection_version,
        "planId": checked_string(
            raw_identity["planId"], "certificateRequest.expectedIdentity.planId"
        ),
        "enforcedPlanSha256": _sha256(
            raw_identity["enforcedPlanSha256"],
            "certificateRequest.expectedIdentity.enforcedPlanSha256",
        ),
        "baseDigest": checked_string(
            raw_identity["baseDigest"], "certificateRequest.expectedIdentity.baseDigest"
        ),
        "finalDigest": checked_string(
            raw_identity["finalDigest"], "certificateRequest.expectedIdentity.finalDigest"
        ),
    }
    expected_receipts = [
        receipt(item, f"certificateRequest.expectedReceipts[{index}]")
        for index, item in enumerate(checked_list(
            request["expectedReceipts"],
            "certificateRequest.expectedReceipts",
            maximum=MAX_STEPS,
        ))
    ]
    if not expected_receipts:
        raise ValueError("certificateRequest.expectedReceipts must be nonempty")
    expected_policies = [
        relation_policy(item, f"certificateRequest.expectedPolicies[{index}]")
        for index, item in enumerate(checked_list(
            request["expectedPolicies"],
            "certificateRequest.expectedPolicies",
            maximum=MAX_STEPS,
        ))
    ]
    if len(expected_policies) != len(expected_receipts):
        raise ValueError(
            "certificateRequest.expectedPolicies and expectedReceipts must have equal length"
        )
    for index, (policy, expected_receipt, step) in enumerate(zip(
        expected_policies, expected_receipts, document["steps"], strict=True,
    )):
        policy_kind = command_kind_for_policy(policy)
        if policy_kind != expected_receipt["commandKind"]:
            raise ValueError(
                f"certificateRequest.expectedPolicies[{index}] kind does not match "
                "expectedReceipts commandKind"
            )
        if policy_kind != command_kind_for_witness(step["witness"]):
            raise ValueError(
                f"certificateRequest.expectedPolicies[{index}] kind does not match "
                "the trace witness kind"
            )
    if expected_identity != document["identity"]:
        raise ValueError("certificateRequest.expectedIdentity does not match the trace identity")
    if expected_receipts != document["expectedReceipts"]:
        raise ValueError("certificateRequest.expectedReceipts do not match the trace receipts")
    return {
        "requestId": request_id,
        "relationTraceSha256": expected_trace_sha,
        "expectedIdentity": expected_identity,
        "expectedReceipts": expected_receipts,
        "expectedPolicies": expected_policies,
    }
