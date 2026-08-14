from __future__ import annotations

import hashlib
from dataclasses import dataclass
from enum import StrEnum
from pathlib import Path
from typing import Any, Mapping


REQUIRED_AXES = ("execution", "safety", "target")


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
    witness: Mapping[str, Any] | None = None

    def to_json(self) -> dict[str, Any]:
        return {
            "status": self.status.value,
            "code": self.code,
            "checker": self.checker,
            "artifactSha256": self.artifact_sha256,
            "policySha256": self.policy_sha256,
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
        return self.status

    def to_json(self) -> dict[str, Any]:
        return {
            "schemaVersion": 1,
            "status": self.status.value,
            "artifactSha256": self.artifact_sha256,
            "policySha256": self.policy_sha256,
            "expectedGraphSha256": self.expected_graph_sha256,
            "enforcedPlanSha256": self.enforced_plan_sha256,
            "verifierVersion": self.verifier_version,
            "axes": {name: verdict.to_json() for name, verdict in sorted(self.axes.items())},
        }
