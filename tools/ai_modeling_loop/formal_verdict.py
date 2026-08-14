from __future__ import annotations

import hashlib
from dataclasses import dataclass
from enum import StrEnum
from pathlib import Path
from typing import Any, Mapping


REQUIRED_AXES = ("execution", "safety", "target")
ENVELOPE_FIELDS = frozenset({
    "schemaVersion",
    "status",
    "artifactSha256",
    "policySha256",
    "expectedGraphSha256",
    "enforcedPlanSha256",
    "verifierVersion",
    "verificationContextSha256",
    "axes",
})
AXIS_FIELDS = frozenset({
    "status",
    "code",
    "checker",
    "artifactSha256",
    "policySha256",
    "verificationContextSha256",
    "witness",
})


class VerificationStatus(StrEnum):
    PASS = "pass"
    REJECT = "reject"
    INDETERMINATE = "indeterminate"


@dataclass(frozen=True)
class AxisVerdict:
    status: VerificationStatus
    code: str
    checker: str
    artifact_sha256: str
    policy_sha256: str
    verification_context_sha256: str
    witness: Mapping[str, Any] | None = None

    def to_json(self) -> dict[str, Any]:
        return {
            "status": self.status.value,
            "code": self.code,
            "checker": self.checker,
            "artifactSha256": self.artifact_sha256,
            "policySha256": self.policy_sha256,
            "verificationContextSha256": self.verification_context_sha256,
            "witness": dict(self.witness) if self.witness is not None else None,
        }


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def combine_axis_statuses(axes: Mapping[str, AxisVerdict]) -> VerificationStatus:
    if set(axes) != set(REQUIRED_AXES):
        return VerificationStatus.INDETERMINATE
    statuses = [axes[name].status for name in REQUIRED_AXES]
    if VerificationStatus.REJECT in statuses:
        return VerificationStatus.REJECT
    if all(status is VerificationStatus.PASS for status in statuses):
        return VerificationStatus.PASS
    return VerificationStatus.INDETERMINATE


@dataclass(frozen=True)
class VerificationEnvelope:
    artifact_sha256: str
    policy_sha256: str
    expected_graph_sha256: str
    enforced_plan_sha256: str
    verifier_version: str
    verification_context_sha256: str
    axes: Mapping[str, AxisVerdict]

    @property
    def status(self) -> VerificationStatus:
        return combine_axis_statuses(self.axes)

    def publication_status(self, final_artifact: Path) -> VerificationStatus:
        if not final_artifact.is_file():
            return VerificationStatus.INDETERMINATE
        if sha256_file(final_artifact) != self.artifact_sha256:
            return VerificationStatus.INDETERMINATE
        if any(axis.artifact_sha256 != self.artifact_sha256 for axis in self.axes.values()):
            return VerificationStatus.INDETERMINATE
        if any(axis.policy_sha256 != self.policy_sha256 for axis in self.axes.values()):
            return VerificationStatus.INDETERMINATE
        if any(
            axis.verification_context_sha256 != self.verification_context_sha256
            for axis in self.axes.values()
        ):
            return VerificationStatus.INDETERMINATE
        return self.status

    def to_json(self) -> dict[str, Any]:
        return {
            "schemaVersion": 2,
            "status": self.status.value,
            "artifactSha256": self.artifact_sha256,
            "policySha256": self.policy_sha256,
            "expectedGraphSha256": self.expected_graph_sha256,
            "enforcedPlanSha256": self.enforced_plan_sha256,
            "verifierVersion": self.verifier_version,
            "verificationContextSha256": self.verification_context_sha256,
            "axes": {name: verdict.to_json() for name, verdict in sorted(self.axes.items())},
        }


def parse_verification_envelope(value: Mapping[str, Any]) -> VerificationEnvelope:
    if not isinstance(value, Mapping) or set(value) != ENVELOPE_FIELDS:
        raise ValueError("verification envelope has an invalid schema")
    if value.get("schemaVersion") != 2:
        raise ValueError("verification envelope must use schemaVersion 2")
    axes_value = value.get("axes")
    if not isinstance(axes_value, Mapping) or set(axes_value) != set(REQUIRED_AXES):
        raise ValueError("verification envelope must contain exactly three axes")

    axes: dict[str, AxisVerdict] = {}
    for name in REQUIRED_AXES:
        axis = axes_value[name]
        if not isinstance(axis, Mapping) or set(axis) != AXIS_FIELDS:
            raise ValueError(f"verification axis {name} has an invalid schema")
        witness = axis.get("witness")
        if witness is not None and not isinstance(witness, Mapping):
            raise ValueError(f"verification axis {name} witness must be an object or null")
        required_axis_strings = (
            "status",
            "code",
            "checker",
            "artifactSha256",
            "policySha256",
            "verificationContextSha256",
        )
        if any(not isinstance(axis.get(field), str) or not axis[field] for field in required_axis_strings):
            raise ValueError(f"verification axis {name} fields must be non-empty strings")
        try:
            axes[name] = AxisVerdict(
                status=VerificationStatus(axis["status"]),
                code=axis["code"],
                checker=axis["checker"],
                artifact_sha256=axis["artifactSha256"],
                policy_sha256=axis["policySha256"],
                verification_context_sha256=axis["verificationContextSha256"],
                witness=witness,
            )
        except (KeyError, ValueError) as error:
            raise ValueError(f"invalid verification axis {name}: {error}") from error

    required_strings = (
        "artifactSha256",
        "policySha256",
        "expectedGraphSha256",
        "enforcedPlanSha256",
        "verifierVersion",
        "verificationContextSha256",
    )
    for field in required_strings:
        if not isinstance(value.get(field), str) or not value[field]:
            raise ValueError(f"verification envelope field {field} must be a non-empty string")

    envelope = VerificationEnvelope(
        artifact_sha256=value["artifactSha256"],
        policy_sha256=value["policySha256"],
        expected_graph_sha256=value["expectedGraphSha256"],
        enforced_plan_sha256=value["enforcedPlanSha256"],
        verifier_version=value["verifierVersion"],
        verification_context_sha256=value["verificationContextSha256"],
        axes=axes,
    )
    if value.get("status") != envelope.status.value:
        raise ValueError("verification envelope status does not match axis verdicts")
    return envelope
