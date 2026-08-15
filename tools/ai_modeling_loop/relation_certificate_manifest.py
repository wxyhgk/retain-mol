from __future__ import annotations

from pathlib import Path
from typing import Any, Mapping

from .artifact_contracts import ArtifactContractError, load_strict_json, sha256_file


RELATION_CERTIFICATE_SCHEMA_VERSION = 1
RELATION_REQUIRED_KINDS = frozenset({
    "fragment.attach",
    "fragment.bridge",
    "fragment.fuse",
    "geometry.setBondLength",
    "geometry.setBondAngle",
    "geometry.setDihedral",
    "geometry.rotateGroup",
})
RELATION_NOT_APPLICABLE_KINDS = frozenset({
    "atom.add",
    "atom.replace",
    "atom.remove",
    "atom.move",
    "atom.setCharge",
    "atom.setRadical",
    "atom.addHydrogen",
    "bond.add",
    "bond.remove",
    "bond.setOrder",
})
RELATION_CERTIFICATE_FIELDS = frozenset({
    "schemaVersion",
    "relationMode",
    "reason",
    "runManifestSha256",
    "initialMoleculeSha256",
    "enforcedPlanSha256",
    "executionReceiptSha256",
    "projectionVersion",
    "relationTraceSha256",
    "certificateRequestSha256",
    "generatedLeanSha256",
    "formalVerdictSha256",
})
RELATION_ARTIFACTS = {
    "relationTraceSha256": Path("relation") / "relation-trace.json",
    "certificateRequestSha256": Path("relation") / "relation-trace-request.json",
    "generatedLeanSha256": Path("relation") / "GeneratedRelationTrace.lean",
    "formalVerdictSha256": Path("relation") / "formal-verdict.json",
}
CHECKER_EVIDENCE_FIELDS = frozenset({
    "requestSha256",
    "nodeExecutable",
    "nodeExecutableSha256",
    "projectorSha256",
    "projectorIoSha256",
    "strictJsonSha256",
    "modelingRuntimeSha256",
    "leanLauncher",
    "leanLauncherSha256",
    "leanExecutable",
    "leanExecutableSha256",
    "generatorSha256",
    "formalSourceTreeSha256",
    "generatedLeanSha256",
})
BOUND_RUN_ARTIFACTS = {
    "runManifestSha256": Path("run-manifest.json"),
    "initialMoleculeSha256": Path("inputs") / "initial-molecule.json",
    "enforcedPlanSha256": Path("enforced-plan.json"),
    "executionReceiptSha256": Path("execution.json"),
}


def _strict_object(value: Any, field: str, expected_fields: frozenset[str]) -> Mapping[str, Any]:
    if not isinstance(value, dict):
        raise ArtifactContractError(f"{field} must be an object")
    if set(value) != expected_fields:
        missing = sorted(expected_fields - set(value))
        unknown = sorted(set(value) - expected_fields)
        raise ArtifactContractError(
            f"{field} fields are invalid; missing={missing}, unknown={unknown}"
        )
    return value


def _sha256(value: Any, field: str) -> str:
    if (
        not isinstance(value, str)
        or len(value) != 64
        or any(character not in "0123456789abcdef" for character in value)
    ):
        raise ArtifactContractError(f"{field} must be a lowercase SHA-256 digest")
    return value


def classify_relation_mode(plan: Mapping[str, Any]) -> str:
    commands = plan.get("commands") if isinstance(plan, Mapping) else None
    if not isinstance(commands, list) or not commands:
        raise ArtifactContractError("enforced plan commands must be a non-empty array")
    kinds: list[str] = []
    for index, command in enumerate(commands):
        if not isinstance(command, Mapping):
            raise ArtifactContractError(f"enforced plan commands[{index}] must be an object")
        kind = command.get("kind")
        if not isinstance(kind, str) or not kind:
            raise ArtifactContractError(
                f"enforced plan commands[{index}].kind must be a non-empty string"
            )
        if kind not in RELATION_REQUIRED_KINDS | RELATION_NOT_APPLICABLE_KINDS:
            raise ArtifactContractError(f"unsupported modeling command kind: {kind}")
        kinds.append(kind)
    return "required" if any(kind in RELATION_REQUIRED_KINDS for kind in kinds) else "not-applicable"


def classify_relation_capability(plan: Mapping[str, Any]) -> str:
    mode = classify_relation_mode(plan)
    if mode == "not-applicable":
        return mode
    commands = plan["commands"]
    if all(command["kind"] == "geometry.rotateGroup" for command in commands):
        return "supported"
    return "unsupported"


def build_relation_certificate_manifest(
    run_dir: Path,
    *,
    projection_version: str | None = None,
) -> dict[str, Any]:
    plan = load_strict_json(run_dir / "enforced-plan.json")
    if not isinstance(plan, Mapping):
        raise ArtifactContractError("enforced plan must be an object")
    relation_mode = classify_relation_mode(plan)
    capability = classify_relation_capability(plan)
    payload: dict[str, Any] = {
        "schemaVersion": RELATION_CERTIFICATE_SCHEMA_VERSION,
        "relationMode": relation_mode,
        "reason": None,
        **{
            field: sha256_file(run_dir / relative_path)
            for field, relative_path in BOUND_RUN_ARTIFACTS.items()
        },
        "projectionVersion": None,
        **{field: None for field in RELATION_ARTIFACTS},
    }
    if relation_mode == "not-applicable":
        payload["reason"] = "command-set-has-no-spatial-relation-v1"
        return payload
    if capability != "supported":
        raise ArtifactContractError("enforced plan requires an unsupported relation certificate")
    if not isinstance(projection_version, str) or not projection_version:
        raise ArtifactContractError("required relation certificate needs a projection version")
    payload["projectionVersion"] = projection_version
    for field, relative_path in RELATION_ARTIFACTS.items():
        path = run_dir / relative_path
        if not path.is_file():
            raise ArtifactContractError(f"missing relation certificate artifact: {relative_path}")
        payload[field] = sha256_file(path)
    _validate_formal_verdict(run_dir, payload)
    return payload


def _validate_formal_verdict(run_dir: Path, manifest: Mapping[str, Any]) -> None:
    verdict = _strict_object(
        load_strict_json(run_dir / RELATION_ARTIFACTS["formalVerdictSha256"]),
        "relation formal verdict",
        frozenset({
            "schemaVersion",
            "status",
            "checker",
            "projectionVersion",
            "relationTraceSha256",
            "certificateRequestSha256",
            "generatedLeanSha256",
            "checkerEvidence",
        }),
    )
    if verdict["schemaVersion"] != 1:
        raise ArtifactContractError("unsupported relation formal verdict schema")
    if verdict["status"] != "pass" or verdict["checker"] != "lean-relation-trace-v1":
        raise ArtifactContractError("relation formal verdict must be a Lean pass")
    if verdict["projectionVersion"] != manifest["projectionVersion"]:
        raise ArtifactContractError("relation formal verdict projectionVersion mismatch")
    evidence = _strict_object(
        verdict["checkerEvidence"],
        "relation formal verdict checkerEvidence",
        CHECKER_EVIDENCE_FIELDS,
    )
    for field in (
        "relationTraceSha256",
        "certificateRequestSha256",
        "generatedLeanSha256",
    ):
        if _sha256(verdict[field], f"relation formal verdict {field}") != manifest[field]:
            raise ArtifactContractError(f"relation formal verdict {field} is not bound to manifest")
    if _sha256(evidence["requestSha256"], "checker evidence requestSha256") != verdict["certificateRequestSha256"]:
        raise ArtifactContractError("checker evidence requestSha256 is not bound to verdict")
    if _sha256(evidence["generatedLeanSha256"], "checker evidence generatedLeanSha256") != verdict["generatedLeanSha256"]:
        raise ArtifactContractError("checker evidence generatedLeanSha256 is not bound to verdict")
    for field in (
        "nodeExecutableSha256",
        "projectorSha256",
        "projectorIoSha256",
        "strictJsonSha256",
        "modelingRuntimeSha256",
        "leanLauncherSha256",
        "leanExecutableSha256",
        "generatorSha256",
        "formalSourceTreeSha256",
    ):
        _sha256(evidence[field], f"checker evidence {field}")
    for field in ("nodeExecutable", "leanLauncher", "leanExecutable"):
        if not isinstance(evidence[field], str) or not evidence[field]:
            raise ArtifactContractError(f"checker evidence {field} must be a non-empty string")


def load_relation_certificate_manifest(path: Path) -> Mapping[str, Any]:
    manifest = _strict_object(
        load_strict_json(path),
        "relation certificate manifest",
        RELATION_CERTIFICATE_FIELDS,
    )
    if manifest["schemaVersion"] != RELATION_CERTIFICATE_SCHEMA_VERSION:
        raise ArtifactContractError("unsupported relation certificate manifest schema")
    mode = manifest["relationMode"]
    if mode not in {"required", "not-applicable"}:
        raise ArtifactContractError("relation certificate manifest has invalid relationMode")

    run_dir = path.parent
    plan = load_strict_json(run_dir / "enforced-plan.json")
    if not isinstance(plan, Mapping):
        raise ArtifactContractError("enforced plan must be an object")
    expected_mode = classify_relation_mode(plan)
    if mode != expected_mode:
        raise ArtifactContractError("relationMode does not match the enforced plan")
    capability = classify_relation_capability(plan)
    if mode == "required" and capability != "supported":
        raise ArtifactContractError("required relation certificate uses an unsupported command set")

    for field, relative_path in BOUND_RUN_ARTIFACTS.items():
        expected = _sha256(manifest[field], f"relation certificate manifest {field}")
        artifact = run_dir / relative_path
        if not artifact.is_file() or sha256_file(artifact) != expected:
            raise ArtifactContractError(f"relation certificate manifest {field} hash mismatch")

    if mode == "not-applicable":
        if manifest["reason"] != "command-set-has-no-spatial-relation-v1":
            raise ArtifactContractError("not-applicable relation certificate has invalid reason")
        if manifest["projectionVersion"] is not None:
            raise ArtifactContractError("not-applicable relation certificate cannot name a projection")
        if any(manifest[field] is not None for field in RELATION_ARTIFACTS):
            raise ArtifactContractError("not-applicable relation certificate cannot bind relation artifacts")
        return manifest

    if manifest["reason"] is not None:
        raise ArtifactContractError("required relation certificate cannot contain a bypass reason")
    if not isinstance(manifest["projectionVersion"], str) or not manifest["projectionVersion"]:
        raise ArtifactContractError("required relation certificate needs a projection version")
    for field, relative_path in RELATION_ARTIFACTS.items():
        expected = _sha256(manifest[field], f"relation certificate manifest {field}")
        artifact = run_dir / relative_path
        if not artifact.is_file() or sha256_file(artifact) != expected:
            raise ArtifactContractError(f"relation certificate manifest {field} hash mismatch")
    _validate_formal_verdict(run_dir, manifest)
    return manifest
