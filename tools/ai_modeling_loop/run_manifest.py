from __future__ import annotations

from pathlib import Path
from typing import Any, Mapping

from .artifact_contracts import ArtifactContractError, load_strict_json, sha256_file


RUN_MANIFEST_V1_FIELDS = {
    "schemaVersion",
    "runId",
    "createdAt",
    "caseId",
    "gitCommit",
    "gitDirty",
    "executor",
    "editPlanSha256",
    "referenceSdfSha256",
    "evaluatorSourceSha256",
}
RUN_MANIFEST_V2_FIELDS = RUN_MANIFEST_V1_FIELDS | {
    "initialMoleculeSha256",
    "runSpecSha256",
}
SHA256_FIELDS = {
    "editPlanSha256",
    "referenceSdfSha256",
    "evaluatorSourceSha256",
}


def load_run_manifest(path: Path) -> Mapping[str, Any]:
    value = load_strict_json(path)
    if not isinstance(value, dict):
        raise ArtifactContractError("run manifest must be an object")
    schema_version = value.get("schemaVersion")
    expected_fields = (
        RUN_MANIFEST_V1_FIELDS
        if schema_version == 1
        else RUN_MANIFEST_V2_FIELDS
        if schema_version == 2
        else None
    )
    if expected_fields is None:
        raise ArtifactContractError("unsupported run manifest schema")
    if set(value) != expected_fields:
        raise ArtifactContractError("run manifest fields are incomplete or unknown")
    for field in (
        "runId",
        "createdAt",
        "caseId",
        "executor",
        "editPlanSha256",
        "referenceSdfSha256",
        "evaluatorSourceSha256",
    ):
        if not isinstance(value[field], str) or not value[field]:
            raise ArtifactContractError(f"run manifest {field} must be a non-empty string")
    for field in SHA256_FIELDS:
        digest = value[field]
        if len(digest) != 64 or any(character not in "0123456789abcdef" for character in digest):
            raise ArtifactContractError(f"run manifest {field} must be a lowercase SHA-256 digest")
    if schema_version == 2:
        for field, relative_path in (
            ("initialMoleculeSha256", Path("inputs") / "initial-molecule.json"),
            ("runSpecSha256", Path("run-spec.json")),
        ):
            digest = value[field]
            if (
                not isinstance(digest, str)
                or len(digest) != 64
                or any(character not in "0123456789abcdef" for character in digest)
            ):
                raise ArtifactContractError(f"run manifest {field} must be a lowercase SHA-256 digest")
            artifact = path.parent / relative_path
            if not artifact.is_file() or sha256_file(artifact) != digest:
                raise ArtifactContractError(f"run manifest {field} does not match archived artifact")
    if value["gitCommit"] is not None and not isinstance(value["gitCommit"], str):
        raise ArtifactContractError("run manifest gitCommit must be a string or null")
    if value["gitDirty"] is not None and not isinstance(value["gitDirty"], bool):
        raise ArtifactContractError("run manifest gitDirty must be a boolean or null")
    return value


def require_manifest_matches_record(path: Path, record: Mapping[str, Any]) -> str:
    manifest = load_run_manifest(path)
    record_fields = {
        "runId": record.get("runId"),
        "createdAt": record.get("createdAt"),
        "gitCommit": record.get("gitCommit"),
        "gitDirty": record.get("gitDirty"),
        "executor": record.get("executor"),
        "editPlanSha256": record.get("editPlanSha256"),
        "referenceSdfSha256": record.get("referenceSdfSha256"),
        "evaluatorSourceSha256": record.get("evaluatorSourceSha256"),
    }
    if manifest["schemaVersion"] == 2:
        record_fields.update({
            "initialMoleculeSha256": record.get("initialMoleculeSha256"),
            "runSpecSha256": record.get("runSpecSha256"),
        })
    expected = {field: manifest[field] for field in record_fields}
    if record_fields != expected:
        raise ArtifactContractError("run record metadata differs from immutable run manifest")
    evaluation = record.get("evaluation")
    if not isinstance(evaluation, Mapping) or evaluation.get("case_id") != manifest["caseId"]:
        raise ArtifactContractError("run record case differs from immutable run manifest")
    return sha256_file(path)
