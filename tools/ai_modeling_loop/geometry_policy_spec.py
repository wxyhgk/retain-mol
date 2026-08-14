from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping

from .artifact_contracts import ArtifactContractError, load_strict_json


GEOMETRY_POLICY_SPEC_SCHEMA_VERSION = 1
MAX_RIGID_GROUP_ATOMS = 64
MAX_RIGID_PAIR_BUDGET = 20_000


def _strict_object(
    value: Any,
    field: str,
    *,
    required: set[str],
) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        raise ArtifactContractError(f"{field} must be an object")
    if set(value) != required:
        raise ArtifactContractError(f"{field} fields are incomplete or unknown")
    return value


def _string(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value:
        raise ArtifactContractError(f"{field} must be a non-empty string")
    return value


def _integer(value: Any, field: str, *, minimum: int) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < minimum:
        raise ArtifactContractError(f"{field} must be an integer >= {minimum}")
    return value


def _unique_ids(value: Any, field: str, *, minimum: int) -> tuple[str, ...]:
    if not isinstance(value, list):
        raise ArtifactContractError(f"{field} must be an array")
    result = tuple(_string(item, f"{field}[{index}]") for index, item in enumerate(value))
    if len(result) < minimum:
        raise ArtifactContractError(f"{field} must contain at least {minimum} atom ids")
    if len(set(result)) != len(result):
        raise ArtifactContractError(f"{field} must contain unique atom ids")
    return result


@dataclass(frozen=True)
class OrientationSpec:
    atom_ids: tuple[str, str, str, str]
    min_abs_volume6: int

    def to_json(self) -> dict[str, Any]:
        return {
            "atomIds": list(self.atom_ids),
            "minAbsVolume6": self.min_abs_volume6,
        }


@dataclass(frozen=True)
class RigidGroupSpec:
    atom_ids: tuple[str, ...]
    max_squared_distance_delta: int

    def to_json(self) -> dict[str, Any]:
        return {
            "atomIds": list(self.atom_ids),
            "maxSquaredDistanceDelta": self.max_squared_distance_delta,
        }


@dataclass(frozen=True)
class GeometryPolicySpec:
    policy_id: str
    fixed_atom_ids: tuple[str, ...]
    orientation_checks: tuple[OrientationSpec, ...]
    rigid_atom_groups: tuple[RigidGroupSpec, ...]

    def to_json(self) -> dict[str, Any]:
        return {
            "schemaVersion": GEOMETRY_POLICY_SPEC_SCHEMA_VERSION,
            "policyId": self.policy_id,
            "fixedAtomIds": list(self.fixed_atom_ids),
            "orientationChecks": [item.to_json() for item in self.orientation_checks],
            "rigidAtomGroups": [item.to_json() for item in self.rigid_atom_groups],
        }


def parse_geometry_policy_spec(value: Any) -> GeometryPolicySpec:
    payload = _strict_object(
        value,
        "geometryPolicySpec",
        required={
            "schemaVersion",
            "policyId",
            "fixedAtomIds",
            "orientationChecks",
            "rigidAtomGroups",
        },
    )
    if payload["schemaVersion"] != GEOMETRY_POLICY_SPEC_SCHEMA_VERSION:
        raise ArtifactContractError("unsupported geometry policy spec schemaVersion")
    fixed_atom_ids = tuple(sorted(_unique_ids(
        payload["fixedAtomIds"],
        "geometryPolicySpec.fixedAtomIds",
        minimum=0,
    )))
    raw_orientations = payload["orientationChecks"]
    if not isinstance(raw_orientations, list):
        raise ArtifactContractError("geometryPolicySpec.orientationChecks must be an array")
    orientations: list[OrientationSpec] = []
    for index, raw in enumerate(raw_orientations):
        field = f"geometryPolicySpec.orientationChecks[{index}]"
        item = _strict_object(raw, field, required={"atomIds", "minAbsVolume6"})
        atom_ids = _unique_ids(item["atomIds"], f"{field}.atomIds", minimum=4)
        if len(atom_ids) != 4:
            raise ArtifactContractError(f"{field}.atomIds must contain exactly 4 atom ids")
        orientations.append(OrientationSpec(
            atom_ids=(atom_ids[0], atom_ids[1], atom_ids[2], atom_ids[3]),
            min_abs_volume6=_integer(
                item["minAbsVolume6"],
                f"{field}.minAbsVolume6",
                minimum=1,
            ),
        ))
    raw_groups = payload["rigidAtomGroups"]
    if not isinstance(raw_groups, list):
        raise ArtifactContractError("geometryPolicySpec.rigidAtomGroups must be an array")
    groups: list[RigidGroupSpec] = []
    for index, raw in enumerate(raw_groups):
        field = f"geometryPolicySpec.rigidAtomGroups[{index}]"
        item = _strict_object(
            raw,
            field,
            required={"atomIds", "maxSquaredDistanceDelta"},
        )
        atom_ids = tuple(sorted(_unique_ids(
            item["atomIds"],
            f"{field}.atomIds",
            minimum=2,
        )))
        if len(atom_ids) > MAX_RIGID_GROUP_ATOMS:
            raise ArtifactContractError(
                f"{field}.atomIds exceeds {MAX_RIGID_GROUP_ATOMS} atoms"
            )
        groups.append(RigidGroupSpec(
            atom_ids=atom_ids,
            max_squared_distance_delta=_integer(
                item["maxSquaredDistanceDelta"],
                f"{field}.maxSquaredDistanceDelta",
                minimum=0,
            ),
        ))
    if len({item.atom_ids for item in groups}) != len(groups):
        raise ArtifactContractError("geometryPolicySpec.rigidAtomGroups must be unique")
    pair_budget = sum(len(item.atom_ids) * (len(item.atom_ids) - 1) // 2 for item in groups)
    if pair_budget > MAX_RIGID_PAIR_BUDGET:
        raise ArtifactContractError(
            f"geometryPolicySpec rigid pair budget exceeds {MAX_RIGID_PAIR_BUDGET}"
        )
    orientation_keys = [item.atom_ids for item in orientations]
    if len(set(orientation_keys)) != len(orientation_keys):
        raise ArtifactContractError("geometryPolicySpec.orientationChecks must be unique")
    return GeometryPolicySpec(
        policy_id=_string(payload["policyId"], "geometryPolicySpec.policyId"),
        fixed_atom_ids=fixed_atom_ids,
        orientation_checks=tuple(orientations),
        rigid_atom_groups=tuple(sorted(groups, key=lambda item: item.atom_ids)),
    )


def load_geometry_policy_spec(path: Path) -> GeometryPolicySpec:
    return parse_geometry_policy_spec(load_strict_json(path))


def load_run_geometry_policy_spec(path: Path) -> GeometryPolicySpec:
    payload = load_strict_json(path)
    if not isinstance(payload, Mapping):
        raise ArtifactContractError("run spec must be an object")
    schema_version = payload.get("schemaVersion")
    base_fields = {
        "schemaVersion",
        "caseId",
        "charge",
        "multiplicity",
        "anchors",
        "refinement",
    }
    expected_fields = base_fields if schema_version == 1 else base_fields | {"geometryPolicy"}
    if schema_version not in (1, 2):
        raise ArtifactContractError("unsupported run spec schemaVersion")
    if set(payload) != expected_fields:
        raise ArtifactContractError("run spec fields are incomplete or unknown")
    case_id = _string(payload["caseId"], "runSpec.caseId")
    anchors = payload["anchors"]
    if not isinstance(anchors, list):
        raise ArtifactContractError("runSpec.anchors must be an array")
    anchor_ids: list[str] = []
    for index, raw in enumerate(anchors):
        field = f"runSpec.anchors[{index}]"
        anchor = _strict_object(
            raw,
            field,
            required={"id", "referenceAtomIndex", "symbol", "position"},
        )
        anchor_ids.append(_string(anchor["id"], f"{field}.id"))
    if len(set(anchor_ids)) != len(anchor_ids):
        raise ArtifactContractError("runSpec anchor ids must be unique")
    if schema_version == 1:
        return GeometryPolicySpec(
            policy_id=f"{case_id}-anchored-geometry-v1",
            fixed_atom_ids=tuple(sorted(anchor_ids)),
            orientation_checks=(),
            rigid_atom_groups=(),
        )
    spec = parse_geometry_policy_spec(payload["geometryPolicy"])
    if set(spec.fixed_atom_ids) != set(anchor_ids):
        raise ArtifactContractError(
            "runSpec.geometryPolicy.fixedAtomIds must exactly match runSpec anchors"
        )
    return spec
