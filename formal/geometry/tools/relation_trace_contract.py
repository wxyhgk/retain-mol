"""Validate the relation-trace contract independently of Lean rendering."""

from __future__ import annotations

import re
from typing import Any

from command_trace_to_lean import render_command as render_primitive_command
from json_to_lean import checked_int, checked_list, checked_string, strict_object
from relation_trace_runtime import (
    CANONICAL_DIGEST_PREFIX,
    COORDINATE_SCALE,
    canonical_digest,
    canonical_snapshot,
    formal_snapshot,
    project_snapshot,
)


SCHEMA_VERSION = 1
PROJECTION_VERSION = "runtime-mixed-relation-trace-v2"
MAX_STEPS = 512
MIN_AXIS_SQUARED = "100000"
MIN_AREA_SQUARED = "10000000000"
MIN_ABS_VOLUME6 = "100000000"
MAX_SQUARED_DISTANCE_DELTA = "0"

_SHA256_RE = re.compile(r"[0-9a-f]{64}\Z")
_CANONICAL_NAT_RE = re.compile(r"(?:0|[1-9][0-9]*)\Z")
_SIGN_CLASSES = {"negative", "nearZero", "positive"}
_EXACT_RATIO_PAIRS = {
    ((1, 1), (0, 1)),
    ((3, 4), (1, 4)),
    ((1, 2), (1, 2)),
    ((1, 4), (3, 4)),
    ((0, 1), (1, 1)),
}
PRIMITIVE_COMMAND_KINDS = {
    "atom.add",
    "atom.replace",
    "atom.remove",
    "atom.move",
    "bond.add",
    "bond.remove",
    "bond.setOrder",
}
SUPPORTED_COMMAND_KINDS = PRIMITIVE_COMMAND_KINDS | {"geometry.rotateGroup"}


def _utf8_key(value: str) -> bytes:
    return value.encode("utf-8")


def _digest(value: Any, field: str) -> str:
    digest = checked_string(value, field)
    if not digest.startswith(CANONICAL_DIGEST_PREFIX) or not _SHA256_RE.fullmatch(
        digest[len(CANONICAL_DIGEST_PREFIX):]
    ):
        raise ValueError(f"{field} must be a canonical-v2 SHA-256 digest")
    return digest


def receipt(value: Any, field: str) -> dict[str, str]:
    item = strict_object(value, field, {"commandId", "commandKind", "preDigest", "postDigest"})
    command_kind = checked_string(item["commandKind"], f"{field}.commandKind")
    if command_kind not in SUPPORTED_COMMAND_KINDS:
        raise ValueError(f"{field}.commandKind is not supported: {command_kind!r}")
    return {
        "commandId": checked_string(item["commandId"], f"{field}.commandId"),
        "commandKind": command_kind,
        "preDigest": _digest(item["preDigest"], f"{field}.preDigest"),
        "postDigest": _digest(item["postDigest"], f"{field}.postDigest"),
    }


def _canonical_nat(value: Any, field: str, expected: str | None = None) -> int:
    text = checked_string(value, field)
    if not _CANONICAL_NAT_RE.fullmatch(text):
        raise ValueError(f"{field} must be a canonical non-negative decimal string")
    if expected is not None and text != expected:
        raise ValueError(f"{field} must be fixed at {expected}")
    return int(text)


def _ratio(value: Any, field: str) -> tuple[int, int, int, int]:
    band = strict_object(value, field, {"loNum", "loDen", "hiNum", "hiDen"})
    result = tuple(
        _canonical_nat(band[name], f"{field}.{name}")
        for name in ("loNum", "loDen", "hiNum", "hiDen")
    )
    if result[1] == 0 or result[3] == 0:
        raise ValueError(f"{field} denominators must be positive")
    if result[0] != result[2] or result[1] != result[3]:
        raise ValueError(f"{field} must be an exact V1 ratio")
    return result


def primitive_command(value: Any, field: str) -> dict[str, Any]:
    # The existing primitive trace renderer is also the canonical strict parser
    # for all seven PrimitiveCommand JSON variants.
    render_primitive_command(value, field)
    return value


def command_kind_for_witness(item: dict[str, Any]) -> str:
    if item["kind"] == "primitive":
        return item["command"]["kind"]
    return "geometry.rotateGroup"


def witness(value: Any, field: str) -> dict[str, Any]:
    discriminator = strict_object(value, field, {"kind"}, {
        "commandId", "command", "axisBondId", "fixedAxisAtomId", "movingAxisAtomId",
        "movingAtomIds", "region", "turn",
    })
    kind = checked_string(discriminator["kind"], f"{field}.kind")
    if kind == "primitive":
        item = strict_object(value, field, {"kind", "commandId", "command"})
        return {
            "kind": "primitive",
            "commandId": checked_string(item["commandId"], f"{field}.commandId"),
            "command": primitive_command(item["command"], f"{field}.command"),
        }
    if kind != "rotateGroup":
        raise ValueError(f"{field}.kind is not supported: {kind!r}")
    item = strict_object(value, field, {
        "kind", "commandId", "axisBondId", "fixedAxisAtomId", "movingAxisAtomId",
        "movingAtomIds", "region", "turn",
    })
    moving_ids = [
        checked_string(atom_id, f"{field}.movingAtomIds[{index}]")
        for index, atom_id in enumerate(checked_list(item["movingAtomIds"], f"{field}.movingAtomIds"))
    ]
    if not moving_ids or len(set(moving_ids)) != len(moving_ids):
        raise ValueError(f"{field}.movingAtomIds must be nonempty and unique")
    if moving_ids != sorted(moving_ids, key=_utf8_key):
        raise ValueError(f"{field}.movingAtomIds is not canonically byte-sorted")
    region_field = f"{field}.region"
    region = strict_object(item["region"], region_field, {
        "atomIds", "frame", "handednessAtomId", "maxSquaredDistanceDelta", "minAbsVolume6",
    })
    atom_ids = [
        checked_string(atom_id, f"{region_field}.atomIds[{index}]")
        for index, atom_id in enumerate(checked_list(region["atomIds"], f"{region_field}.atomIds"))
    ]
    if len(atom_ids) < 4 or len(set(atom_ids)) != len(atom_ids):
        raise ValueError(f"{region_field}.atomIds must contain at least four unique atoms")
    frame_field = f"{region_field}.frame"
    frame = strict_object(region["frame"], frame_field, {
        "originAtomId", "axisAtomId", "radialAtomId", "minAxisSquared", "minAreaSquared",
    })
    fixed_id = checked_string(item["fixedAxisAtomId"], f"{field}.fixedAxisAtomId")
    moving_id = checked_string(item["movingAxisAtomId"], f"{field}.movingAxisAtomId")
    origin_id = checked_string(frame["originAtomId"], f"{frame_field}.originAtomId")
    axis_id = checked_string(frame["axisAtomId"], f"{frame_field}.axisAtomId")
    radial_id = checked_string(frame["radialAtomId"], f"{frame_field}.radialAtomId")
    handedness_id = checked_string(region["handednessAtomId"], f"{region_field}.handednessAtomId")
    if origin_id != fixed_id or axis_id != moving_id:
        raise ValueError(f"{frame_field} must be anchored by the fixed and moving axis atoms")
    if moving_id not in moving_ids or fixed_id in moving_ids:
        raise ValueError(f"{field}.movingAtomIds does not match the directed axis")
    if set(atom_ids) != {fixed_id, *moving_ids}:
        raise ValueError(f"{region_field}.atomIds must be fixedAxisAtomId plus movingAtomIds")
    if len({origin_id, axis_id, radial_id, handedness_id}) != 4:
        raise ValueError(f"{region_field} frame and handedness atoms must be distinct")
    if not {origin_id, axis_id, radial_id, handedness_id}.issubset(atom_ids):
        raise ValueError(f"{region_field} witness atoms must belong to the rigid region")
    turn_field = f"{field}.turn"
    turn = strict_object(item["turn"], turn_field, {
        "cosineSign", "sineSign", "signMargin", "cosineSquared", "sineSquared",
    })
    cosine_sign = checked_string(turn["cosineSign"], f"{turn_field}.cosineSign")
    sine_sign = checked_string(turn["sineSign"], f"{turn_field}.sineSign")
    if cosine_sign not in _SIGN_CLASSES or sine_sign not in _SIGN_CLASSES:
        raise ValueError(f"{turn_field} has an invalid sign class")
    _canonical_nat(turn["signMargin"], f"{turn_field}.signMargin", "0")
    cosine = _ratio(turn["cosineSquared"], f"{turn_field}.cosineSquared")
    sine = _ratio(turn["sineSquared"], f"{turn_field}.sineSquared")
    if ((cosine[0], cosine[1]), (sine[0], sine[1])) not in _EXACT_RATIO_PAIRS:
        raise ValueError(f"{turn_field} is not one of the fixed exact-angle V1 bands")
    if cosine[0] == 0 and cosine_sign != "nearZero":
        raise ValueError(f"{turn_field}.cosineSign must be nearZero")
    if cosine[0] != 0 and cosine_sign == "nearZero":
        raise ValueError(f"{turn_field}.cosineSign must not be nearZero")
    if sine[0] == 0 and sine_sign != "nearZero":
        raise ValueError(f"{turn_field}.sineSign must be nearZero")
    if sine[0] != 0 and sine_sign == "nearZero":
        raise ValueError(f"{turn_field}.sineSign must not be nearZero")
    return {
        "kind": "rotateGroup",
        "commandId": checked_string(item["commandId"], f"{field}.commandId"),
        "axisBondId": checked_string(item["axisBondId"], f"{field}.axisBondId"),
        "fixedAxisAtomId": fixed_id,
        "movingAxisAtomId": moving_id,
        "movingAtomIds": moving_ids,
        "region": {
            "atomIds": atom_ids,
            "frame": {
                "originAtomId": origin_id,
                "axisAtomId": axis_id,
                "radialAtomId": radial_id,
                "minAxisSquared": _canonical_nat(
                    frame["minAxisSquared"], f"{frame_field}.minAxisSquared", MIN_AXIS_SQUARED,
                ),
                "minAreaSquared": _canonical_nat(
                    frame["minAreaSquared"], f"{frame_field}.minAreaSquared", MIN_AREA_SQUARED,
                ),
            },
            "handednessAtomId": handedness_id,
            "maxSquaredDistanceDelta": _canonical_nat(
                region["maxSquaredDistanceDelta"],
                f"{region_field}.maxSquaredDistanceDelta", MAX_SQUARED_DISTANCE_DELTA,
            ),
            "minAbsVolume6": _canonical_nat(
                region["minAbsVolume6"], f"{region_field}.minAbsVolume6", MIN_ABS_VOLUME6,
            ),
        },
        "turn": {
            "cosineSign": cosine_sign,
            "sineSign": sine_sign,
            "signMargin": 0,
            "cosineSquared": cosine,
            "sineSquared": sine,
        },
    }


def validate_document(value: Any) -> dict[str, Any]:
    document = strict_object(value, "document", {
        "schemaVersion", "projectionVersion", "coordinateScale", "identity",
        "expectedReceipts", "base", "final", "steps",
    })
    if checked_int(document["schemaVersion"], "schemaVersion") != SCHEMA_VERSION:
        raise ValueError(f"schemaVersion must be {SCHEMA_VERSION}")
    projection_version = checked_string(document["projectionVersion"], "projectionVersion")
    if projection_version != PROJECTION_VERSION:
        raise ValueError(f"projectionVersion must be {PROJECTION_VERSION}")
    if checked_int(document["coordinateScale"], "coordinateScale") != COORDINATE_SCALE:
        raise ValueError(f"coordinateScale must be {COORDINATE_SCALE}")
    identity_value = strict_object(document["identity"], "identity", {
        "projectionVersion", "planId", "enforcedPlanSha256", "baseDigest", "finalDigest",
    })
    if identity_value["projectionVersion"] != projection_version:
        raise ValueError("identity.projectionVersion must match projectionVersion")
    plan_sha = checked_string(identity_value["enforcedPlanSha256"], "identity.enforcedPlanSha256")
    if not _SHA256_RE.fullmatch(plan_sha):
        raise ValueError("identity.enforcedPlanSha256 must be a lowercase SHA-256")
    identity = {
        "projectionVersion": projection_version,
        "planId": checked_string(identity_value["planId"], "identity.planId"),
        "enforcedPlanSha256": plan_sha,
        "baseDigest": _digest(identity_value["baseDigest"], "identity.baseDigest"),
        "finalDigest": _digest(identity_value["finalDigest"], "identity.finalDigest"),
    }
    expected = [
        receipt(item, f"expectedReceipts[{index}]")
        for index, item in enumerate(checked_list(
            document["expectedReceipts"], "expectedReceipts", maximum=MAX_STEPS,
        ))
    ]
    steps_value = checked_list(document["steps"], "steps", maximum=MAX_STEPS)
    if not steps_value or len(expected) != len(steps_value):
        raise ValueError("expectedReceipts and steps must be nonempty and have equal length")
    command_ids = [item["commandId"] for item in expected]
    if len(set(command_ids)) != len(command_ids):
        raise ValueError("expectedReceipts contains duplicate command ids")
    steps = []
    for index, raw_step in enumerate(steps_value):
        field = f"steps[{index}]"
        item = strict_object(raw_step, field, {
            "receipt", "runtimeBefore", "runtimeAfter", "before", "after", "witness",
        })
        step_receipt = receipt(item["receipt"], f"{field}.receipt")
        if step_receipt != expected[index]:
            raise ValueError(f"{field}.receipt does not match expectedReceipts")
        runtime_before = canonical_snapshot(item["runtimeBefore"], f"{field}.runtimeBefore")
        runtime_after = canonical_snapshot(item["runtimeAfter"], f"{field}.runtimeAfter")
        before = formal_snapshot(item["before"], f"{field}.before")
        after = formal_snapshot(item["after"], f"{field}.after")
        if project_snapshot(runtime_before) != before:
            raise ValueError(f"{field}.before does not match the runtime snapshot projection")
        if project_snapshot(runtime_after) != after:
            raise ValueError(f"{field}.after does not match the runtime snapshot projection")
        if canonical_digest(runtime_before) != step_receipt["preDigest"]:
            raise ValueError(f"{field}.receipt.preDigest does not bind runtimeBefore")
        if canonical_digest(runtime_after) != step_receipt["postDigest"]:
            raise ValueError(f"{field}.receipt.postDigest does not bind runtimeAfter")
        step_witness = witness(item["witness"], f"{field}.witness")
        if step_witness["commandId"] != step_receipt["commandId"]:
            raise ValueError(f"{field}.witness.commandId does not match the receipt")
        if command_kind_for_witness(step_witness) != step_receipt["commandKind"]:
            raise ValueError(f"{field}.witness kind does not match the receipt commandKind")
        steps.append({
            "receipt": step_receipt,
            "runtimeBefore": runtime_before,
            "runtimeAfter": runtime_after,
            "before": before,
            "after": after,
            "witness": step_witness,
        })
    base = formal_snapshot(document["base"], "base")
    final = formal_snapshot(document["final"], "final")
    if base != steps[0]["before"] or final != steps[-1]["after"]:
        raise ValueError("base/final must equal the complete trace endpoints")
    if identity["baseDigest"] != expected[0]["preDigest"]:
        raise ValueError("identity.baseDigest does not match the first receipt")
    if identity["finalDigest"] != expected[-1]["postDigest"]:
        raise ValueError("identity.finalDigest does not match the final receipt")
    for index in range(len(steps) - 1):
        if steps[index]["after"] != steps[index + 1]["before"]:
            raise ValueError(f"steps[{index}] and steps[{index + 1}] break the formal snapshot chain")
        if steps[index]["runtimeAfter"] != steps[index + 1]["runtimeBefore"]:
            raise ValueError(f"steps[{index}] and steps[{index + 1}] break the runtime snapshot chain")
        if expected[index]["postDigest"] != expected[index + 1]["preDigest"]:
            raise ValueError(f"expectedReceipts[{index}] breaks the digest chain")
    return {
        "identity": identity,
        "expectedReceipts": expected,
        "base": base,
        "final": final,
        "steps": steps,
    }
