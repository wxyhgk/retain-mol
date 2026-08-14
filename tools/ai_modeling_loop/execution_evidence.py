from __future__ import annotations

import math
import re
from dataclasses import dataclass
from typing import Any, Mapping, Sequence


_ID_MAX_LENGTH = 128
_MAX_ENTITY_IDS = 10_000
_MAX_COMMANDS = 512
_ELEMENT_SYMBOL = re.compile(r"^[A-Z][a-z]{0,2}$")
_SUPPORTED_EFFECT_KINDS = frozenset({
    "atom.add",
    "atom.replace",
    "atom.remove",
    "atom.move",
    "bond.add",
    "bond.remove",
    "bond.setOrder",
})


@dataclass(frozen=True)
class ExecutionEvidenceResult:
    status: str
    code: str
    witness: Mapping[str, Any] | None = None


class _SchemaError(ValueError):
    def __init__(self, path: str, message: str) -> None:
        super().__init__(f"{path}: {message}")
        self.path = path
        self.message = message


def _object(value: Any, path: str) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        raise _SchemaError(path, "must be an object")
    return value


def _exact_fields(
    value: Mapping[str, Any],
    *,
    required: set[str],
    optional: set[str] | None = None,
    path: str,
) -> None:
    optional = optional or set()
    missing = sorted(required - set(value))
    extra = sorted(set(value) - required - optional)
    if missing:
        raise _SchemaError(path, f"missing fields: {', '.join(missing)}")
    if extra:
        raise _SchemaError(path, f"unexpected fields: {', '.join(extra)}")


def _identifier(value: Any, path: str) -> str:
    if (
        not isinstance(value, str)
        or value != value.strip()
        or not value
        or len(value) > _ID_MAX_LENGTH
    ):
        raise _SchemaError(path, "must be a trimmed non-empty string of at most 128 characters")
    return value


def _finite_number(value: Any, path: str) -> int | float:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
        raise _SchemaError(path, "must be a finite number")
    return value


def _integer(value: Any, path: str, minimum: int, maximum: int) -> int:
    number = _finite_number(value, path)
    if not float(number).is_integer() or not minimum <= number <= maximum:
        raise _SchemaError(path, f"must be an integer from {minimum} through {maximum}")
    return int(number)


def _position(value: Any, path: str) -> Mapping[str, Any]:
    position = _object(value, path)
    _exact_fields(position, required={"x", "y", "z"}, path=path)
    for axis in ("x", "y", "z"):
        _finite_number(position[axis], f"{path}.{axis}")
    return position


def _id_array(
    value: Any,
    path: str,
    *,
    minimum: int = 0,
    unique: bool = False,
) -> Sequence[Any]:
    if not isinstance(value, list) or not minimum <= len(value) <= _MAX_ENTITY_IDS:
        raise _SchemaError(path, f"must be an array with {minimum}..{_MAX_ENTITY_IDS} items")
    identifiers = [_identifier(item, f"{path}[{index}]") for index, item in enumerate(value)]
    if unique and len(set(identifiers)) != len(identifiers):
        raise _SchemaError(path, "must not contain duplicate ids")
    return value


def _validate_scope(value: Any, path: str) -> None:
    scope = _object(value, path)
    kind = scope.get("kind")
    if kind == "molecule":
        _exact_fields(scope, required={"kind"}, path=path)
    elif kind == "selection":
        _exact_fields(scope, required={"kind", "atomIds", "bondIds"}, path=path)
        _id_array(scope["atomIds"], f"{path}.atomIds")
        _id_array(scope["bondIds"], f"{path}.bondIds")
    else:
        raise _SchemaError(f"{path}.kind", "must be molecule or selection")


def _validate_anchor(value: Any, path: str) -> None:
    anchor = _object(value, path)
    kind = anchor.get("kind")
    if kind == "atom":
        _exact_fields(anchor, required={"kind", "atomId"}, path=path)
        _identifier(anchor["atomId"], f"{path}.atomId")
    elif kind == "bond":
        _exact_fields(anchor, required={"kind", "bondId"}, path=path)
        _identifier(anchor["bondId"], f"{path}.bondId")
    elif kind == "space":
        _exact_fields(anchor, required={"kind", "position"}, optional={"normal"}, path=path)
        _position(anchor["position"], f"{path}.position")
        if "normal" in anchor:
            _position(anchor["normal"], f"{path}.normal")
    else:
        raise _SchemaError(f"{path}.kind", "must be atom, bond, or space")


def _validate_constraints(value: Any, path: str) -> None:
    constraints = _object(value, path)
    _exact_fields(
        constraints,
        required=set(),
        optional={"fixedAtomPositions", "protectedAtomIds"},
        path=path,
    )
    for field in ("fixedAtomPositions", "protectedAtomIds"):
        if field in constraints:
            _id_array(constraints[field], f"{path}.{field}", unique=True)


def _validate_command(value: Any, path: str) -> Mapping[str, Any]:
    command = _object(value, path)
    kind = command.get("kind")
    fields: dict[str, tuple[set[str], set[str]]] = {
        "atom.add": ({"commandId", "kind", "atomId", "symbol", "position"}, set()),
        "atom.replace": ({"commandId", "kind", "atomId", "symbol"}, set()),
        "atom.remove": ({"commandId", "kind", "atomId"}, set()),
        "atom.move": ({"commandId", "kind", "atomId", "position"}, set()),
        "atom.setCharge": ({"commandId", "kind", "atomId", "charge"}, set()),
        "atom.setRadical": ({"commandId", "kind", "atomId", "radical"}, set()),
        "atom.addHydrogen": ({"commandId", "kind", "atomId", "hydrogenAtomId"}, set()),
        "bond.add": ({"commandId", "kind", "bondId", "atomId1", "atomId2", "order"}, set()),
        "bond.remove": ({"commandId", "kind", "bondId"}, set()),
        "bond.setOrder": ({"commandId", "kind", "bondId", "order"}, set()),
        "fragment.attach": (
            {"commandId", "kind", "atomId", "fragmentId"},
            {"torsionAngleDegrees"},
        ),
        "fragment.bridge": (
            {"commandId", "kind", "atomId1", "atomId2", "fragmentId"},
            {"orientationDegrees"},
        ),
        "fragment.fuse": ({"commandId", "kind", "bondId", "fragmentId"}, set()),
        "geometry.setBondLength": (
            {"commandId", "kind", "atomId1", "atomId2", "length"},
            set(),
        ),
        "geometry.setBondAngle": (
            {"commandId", "kind", "atomId1", "atomId2", "atomId3", "angleDegrees"},
            set(),
        ),
        "geometry.setDihedral": (
            {"commandId", "kind", "atomId1", "atomId2", "atomId3", "atomId4", "angleDegrees"},
            set(),
        ),
        "geometry.rotateGroup": (
            {"commandId", "kind", "atomIds", "axisAtomId1", "axisAtomId2", "angleDegrees"},
            set(),
        ),
    }
    if not isinstance(kind, str) or kind not in fields:
        raise _SchemaError(f"{path}.kind", "is not a supported modeling command kind")
    required, optional = fields[kind]
    _exact_fields(command, required=required, optional=optional, path=path)
    _identifier(command["commandId"], f"{path}.commandId")

    for field in (
        "atomId", "hydrogenAtomId", "bondId", "atomId1", "atomId2", "atomId3",
        "atomId4", "axisAtomId1", "axisAtomId2", "fragmentId",
    ):
        if field in command:
            _identifier(command[field], f"{path}.{field}")
    if "symbol" in command:
        symbol = command["symbol"]
        if not isinstance(symbol, str) or _ELEMENT_SYMBOL.fullmatch(symbol) is None:
            raise _SchemaError(f"{path}.symbol", "must be an element symbol")
    if "position" in command:
        _position(command["position"], f"{path}.position")
    if "order" in command:
        _integer(command["order"], f"{path}.order", 1, 3)
    if "charge" in command:
        _integer(command["charge"], f"{path}.charge", -8, 8)
    if "radical" in command:
        _integer(command["radical"], f"{path}.radical", 0, 8)
    if "atomIds" in command:
        _id_array(command["atomIds"], f"{path}.atomIds", minimum=1, unique=True)
    for field in ("torsionAngleDegrees", "orientationDegrees", "angleDegrees"):
        if field in command:
            number = _finite_number(command[field], f"{path}.{field}")
            if not -360 <= number <= 360:
                raise _SchemaError(f"{path}.{field}", "must be from -360 through 360")
    if kind == "geometry.setBondLength":
        length = _finite_number(command["length"], f"{path}.length")
        if not 0.1 < length <= 20:
            raise _SchemaError(f"{path}.length", "must be greater than 0.1 and at most 20")
    if kind == "geometry.setBondAngle":
        angle = _finite_number(command["angleDegrees"], f"{path}.angleDegrees")
        if not 0 < angle < 180:
            raise _SchemaError(f"{path}.angleDegrees", "must be greater than 0 and less than 180")
    return command


def _validate_plan(value: Any) -> Mapping[str, Any]:
    plan = _object(value, "enforcedPlan")
    _exact_fields(
        plan,
        required={"schemaVersion", "planId", "source", "targetObjectId", "commands"},
        optional={"description", "scope", "anchor", "expectedRevision", "constraints"},
        path="enforcedPlan",
    )
    if plan["schemaVersion"] != 1 or isinstance(plan["schemaVersion"], bool):
        raise _SchemaError("enforcedPlan.schemaVersion", "must equal 1")
    _identifier(plan["planId"], "enforcedPlan.planId")
    _identifier(plan["targetObjectId"], "enforcedPlan.targetObjectId")
    if not isinstance(plan["source"], str) or plan["source"] not in {
        "ai", "human", "import", "system",
    }:
        raise _SchemaError("enforcedPlan.source", "has an invalid value")
    if "description" in plan and (
        not isinstance(plan["description"], str) or len(plan["description"]) > 2000
    ):
        raise _SchemaError("enforcedPlan.description", "must be a string of at most 2000 characters")
    if "expectedRevision" in plan:
        _identifier(plan["expectedRevision"], "enforcedPlan.expectedRevision")
    if "scope" in plan:
        _validate_scope(plan["scope"], "enforcedPlan.scope")
    if "anchor" in plan:
        _validate_anchor(plan["anchor"], "enforcedPlan.anchor")
    if "constraints" in plan:
        _validate_constraints(plan["constraints"], "enforcedPlan.constraints")
    commands = plan["commands"]
    if not isinstance(commands, list) or not 1 <= len(commands) <= _MAX_COMMANDS:
        raise _SchemaError("enforcedPlan.commands", "must contain 1..512 commands")
    parsed_commands = [
        _validate_command(command, f"enforcedPlan.commands[{index}]")
        for index, command in enumerate(commands)
    ]
    command_ids = [command["commandId"] for command in parsed_commands]
    if len(set(command_ids)) != len(command_ids):
        raise _SchemaError("enforcedPlan.commands", "commandId values must be unique")
    return plan


def _effect_command(value: Any, path: str) -> Mapping[str, Any]:
    command = _object(value, path)
    _exact_fields(
        command,
        required={"commandId", "kind", "preDigest", "postDigest", "changes"},
        path=path,
    )
    _identifier(command["commandId"], f"{path}.commandId")
    if not isinstance(command["kind"], str) or not command["kind"]:
        raise _SchemaError(f"{path}.kind", "must be a non-empty string")
    for field in ("preDigest", "postDigest"):
        if not isinstance(command[field], str) or not command[field]:
            raise _SchemaError(f"{path}.{field}", "must be a non-empty string")
    changes = _object(command["changes"], f"{path}.changes")
    _exact_fields(changes, required={"atoms", "bonds"}, path=f"{path}.changes")
    for entity in ("atoms", "bonds"):
        rows = changes[entity]
        if not isinstance(rows, list):
            raise _SchemaError(f"{path}.changes.{entity}", "must be an array")
        identifiers: list[str] = []
        for index, row_value in enumerate(rows):
            row_path = f"{path}.changes.{entity}[{index}]"
            row = _object(row_value, row_path)
            _exact_fields(row, required={"id", "before", "after"}, path=row_path)
            identifiers.append(_identifier(row["id"], f"{row_path}.id"))
            for side in ("before", "after"):
                if row[side] is not None and not isinstance(row[side], Mapping):
                    raise _SchemaError(f"{row_path}.{side}", "must be an object or null")
        if identifiers != sorted(identifiers) or len(set(identifiers)) != len(identifiers):
            raise _SchemaError(f"{path}.changes.{entity}", "ids must be unique and sorted")
    return command


def _find_change(
    effect_command: Mapping[str, Any],
    entity: str,
    entity_id: str,
) -> Mapping[str, Any] | None:
    changes = effect_command["changes"][entity]
    return next((change for change in changes if change["id"] == entity_id), None)


def _parameters_match(
    plan_command: Mapping[str, Any],
    effect_command: Mapping[str, Any],
) -> bool:
    kind = plan_command["kind"]
    if kind.startswith("atom."):
        change = _find_change(effect_command, "atoms", plan_command["atomId"])
    else:
        change = _find_change(effect_command, "bonds", plan_command["bondId"])
    if change is None:
        return False
    before = change["before"]
    after = change["after"]
    if kind == "atom.add":
        position = plan_command["position"]
        return before is None and isinstance(after, Mapping) and all((
            after.get("id") == plan_command["atomId"],
            after.get("symbol") == plan_command["symbol"],
            after.get("x") == position["x"],
            after.get("y") == position["y"],
            after.get("z") == position["z"],
        ))
    if kind == "atom.replace":
        return (
            isinstance(before, Mapping)
            and isinstance(after, Mapping)
            and before.get("id") == plan_command["atomId"]
            and after.get("id") == plan_command["atomId"]
            and after.get("symbol") == plan_command["symbol"]
        )
    if kind == "atom.remove":
        return isinstance(before, Mapping) and before.get("id") == plan_command["atomId"] and after is None
    if kind == "atom.move":
        position = plan_command["position"]
        return isinstance(before, Mapping) and isinstance(after, Mapping) and all((
            before.get("id") == plan_command["atomId"],
            after.get("id") == plan_command["atomId"],
            after.get("x") == position["x"],
            after.get("y") == position["y"],
            after.get("z") == position["z"],
        ))
    if kind == "bond.add":
        endpoints = sorted((plan_command["atomId1"], plan_command["atomId2"]))
        return before is None and isinstance(after, Mapping) and all((
            after.get("id") == plan_command["bondId"],
            [after.get("atomId1"), after.get("atomId2")] == endpoints,
            after.get("order") == plan_command["order"],
        ))
    if kind == "bond.remove":
        return isinstance(before, Mapping) and before.get("id") == plan_command["bondId"] and after is None
    if kind == "bond.setOrder":
        return (
            isinstance(before, Mapping)
            and isinstance(after, Mapping)
            and before.get("id") == plan_command["bondId"]
            and after.get("id") == plan_command["bondId"]
            and after.get("order") == plan_command["order"]
        )
    return False


def _validate_effect_receipt(
    value: Any,
    *,
    path: str,
    plan: Mapping[str, Any],
) -> Mapping[str, Any]:
    effect = _object(value, path)
    required = {"schemaVersion", "planId", "baseDigest", "finalDigest", "commands"}
    if path == "expectedEffect":
        required.add("status")
        optional = {"baseSnapshot", "finalSnapshot"}
    else:
        optional = set()
    _exact_fields(effect, required=required, optional=optional, path=path)
    if path == "expectedEffect" and effect["status"] != "compiled":
        raise _SchemaError(f"{path}.status", "must equal compiled")
    if effect["schemaVersion"] != 1 or isinstance(effect["schemaVersion"], bool):
        raise _SchemaError(f"{path}.schemaVersion", "must equal 1")
    for field in ("planId", "baseDigest", "finalDigest"):
        if not isinstance(effect[field], str) or not effect[field]:
            raise _SchemaError(f"{path}.{field}", "must be a non-empty string")
    if effect["planId"] != plan["planId"]:
        raise _SchemaError(f"{path}.planId", "does not match enforcedPlan.planId")
    commands = effect["commands"]
    if not isinstance(commands, list) or len(commands) != len(plan["commands"]):
        raise _SchemaError(f"{path}.commands", "must have one receipt per enforced command")
    parsed = [
        _effect_command(command, f"{path}.commands[{index}]")
        for index, command in enumerate(commands)
    ]
    previous_digest = effect["baseDigest"]
    for index, (plan_command, effect_command) in enumerate(zip(plan["commands"], parsed, strict=True)):
        if effect_command["preDigest"] != previous_digest:
            raise _SchemaError(f"{path}.commands[{index}].preDigest", "breaks the digest chain")
        previous_digest = effect_command["postDigest"]
        if (
            effect_command["commandId"] != plan_command["commandId"]
            or effect_command["kind"] != plan_command["kind"]
        ):
            raise _SchemaError(f"{path}.commands[{index}]", "does not match enforced command id/kind/order")
        if plan_command["kind"] not in _SUPPORTED_EFFECT_KINDS:
            raise _SchemaError(f"{path}.commands[{index}].kind", "has no ExpectedEffect V1 semantics")
        if not _parameters_match(plan_command, effect_command):
            raise _SchemaError(f"{path}.commands[{index}].changes", "does not bind enforced command parameters")
    if previous_digest != effect["finalDigest"]:
        raise _SchemaError(f"{path}.finalDigest", "does not terminate the command digest chain")
    return effect


def validate_execution_evidence(
    *,
    plan: Any,
    expected_effect: Any,
    receipt: Any,
    enforced_plan_sha256: str,
    expected_effect_sha256: str,
    executor_output_sha256: str,
) -> ExecutionEvidenceResult:
    if not all(isinstance(value, Mapping) for value in (plan, expected_effect, receipt)):
        return ExecutionEvidenceResult(
            "indeterminate",
            "execution-evidence-invalid",
            {
                "receiptIsObject": isinstance(receipt, Mapping),
                "expectedEffectIsObject": isinstance(expected_effect, Mapping),
                "planIsObject": isinstance(plan, Mapping),
            },
        )

    try:
        enforced_plan = _validate_plan(plan)
    except _SchemaError as error:
        return ExecutionEvidenceResult(
            "indeterminate",
            "enforced-plan-invalid",
            {"path": error.path, "message": error.message},
        )

    if expected_effect.get("status") == "indeterminate":
        return ExecutionEvidenceResult(
            "indeterminate",
            str(expected_effect.get("reason", "unsupported-effect-semantics")),
            {"message": expected_effect.get("message")},
        )
    if expected_effect.get("status") != "compiled":
        return ExecutionEvidenceResult("indeterminate", "expected-effect-invalid")

    binding_fields = {
        "schemaVersion": 1,
        "status": "completed",
        "enforcedPlanSha256": enforced_plan_sha256,
        "expectedEffectSha256": expected_effect_sha256,
        "targetObjectId": enforced_plan["targetObjectId"],
        "commandCount": len(enforced_plan["commands"]),
        "outputSha256": executor_output_sha256,
    }
    missing = [field for field in binding_fields if field not in receipt]
    if missing:
        return ExecutionEvidenceResult(
            "indeterminate",
            "actual-execution-receipt-invalid",
            {"missingFields": missing},
        )
    if (
        isinstance(receipt.get("schemaVersion"), bool)
        or isinstance(receipt.get("commandCount"), bool)
        or not isinstance(receipt.get("commandCount"), int)
    ):
        return ExecutionEvidenceResult(
            "indeterminate",
            "actual-execution-receipt-invalid",
            {"invalidFields": ["schemaVersion", "commandCount"]},
        )
    mismatches = [field for field, expected in binding_fields.items() if receipt.get(field) != expected]
    if mismatches:
        return ExecutionEvidenceResult(
            "reject",
            "execution-evidence-binding-reject",
            {"mismatchedFields": mismatches},
        )

    if not isinstance(receipt.get("actualEffectReceipt"), Mapping):
        return ExecutionEvidenceResult(
            "indeterminate",
            "actual-effect-receipt-unavailable",
        )
    try:
        expected = _validate_effect_receipt(
            expected_effect,
            path="expectedEffect",
            plan=enforced_plan,
        )
        actual = _validate_effect_receipt(
            receipt.get("actualEffectReceipt"),
            path="actualEffectReceipt",
            plan=enforced_plan,
        )
    except _SchemaError as error:
        return ExecutionEvidenceResult(
            "reject",
            "effect-plan-binding-reject",
            {"path": error.path, "message": error.message},
        )

    effect_fields = ("schemaVersion", "planId", "baseDigest", "finalDigest", "commands")
    mismatched_effect_fields = [field for field in effect_fields if expected[field] != actual[field]]
    if mismatched_effect_fields:
        return ExecutionEvidenceResult(
            "reject",
            "effect-comparison-reject",
            {"mismatchedFields": mismatched_effect_fields},
        )
    comparison = receipt.get("effectComparison")
    if not isinstance(comparison, Mapping):
        return ExecutionEvidenceResult("indeterminate", "effect-comparison-unavailable")
    if comparison.get("verdict") != "pass" or comparison.get("mismatches") != []:
        return ExecutionEvidenceResult(
            "reject",
            "effect-comparison-self-report-inconsistent",
            {"reported": dict(comparison)},
        )
    return ExecutionEvidenceResult(
        "pass",
        "effect-comparison-pass",
        {"mismatchedFields": []},
    )
