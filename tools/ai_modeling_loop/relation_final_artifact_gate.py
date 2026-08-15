from __future__ import annotations

import shutil
import tempfile
from pathlib import Path
from typing import Any, Callable, Mapping

from .artifact_bridge import ArtifactBridgeResult, bridge_final_sdf
from .artifact_contracts import canonical_json_bytes, load_strict_json, sha256_file, sha256_json
from .final_artifact_gate import _target_status
from .formal_verdict import (
    AxisVerdict,
    VerificationEnvelope,
    VerificationStatus,
    combine_verification_statuses,
)
from .relation_certificate_checker import (
    RelationCertificateCheckResult,
    run_relation_certificate_check,
)
from .relation_certificate_manifest import (
    build_relation_certificate_manifest,
    load_relation_certificate_manifest,
)
from .relation_terminal_binding import verify_relation_terminal_binding
from .run_manifest import load_run_manifest, require_manifest_matches_record


RELATION_FINAL_VERIFIER_VERSION = "retainmol-relation-final-artifact-v1"
RELATION_FINAL_POLICY_VERSION = "lean-runtime-relation-v1"


class RelationFinalArtifactError(ValueError):
    """The relation proof cannot be bound to the final published artifact."""


def _write_json_atomic(path: Path, payload: Mapping[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.tmp")
    temporary.write_bytes(canonical_json_bytes(payload) + b"\n")
    temporary.replace(path)


def _status(value: str) -> VerificationStatus:
    if value == "pass":
        return VerificationStatus.PASS
    if value == "reject":
        return VerificationStatus.REJECT
    return VerificationStatus.INDETERMINATE


def _axis(
    status: VerificationStatus,
    code: str,
    checker: str,
    *,
    artifact_sha256: str,
    policy_sha256: str,
    context_sha256: str,
    witness: Mapping[str, Any] | None = None,
) -> AxisVerdict:
    return AxisVerdict(
        status=status,
        code=code,
        checker=checker,
        artifact_sha256=artifact_sha256,
        policy_sha256=policy_sha256,
        verification_context_sha256=context_sha256,
        witness=witness,
    )


def _expected_graph_sha256(builder_snapshot: Mapping[str, Any]) -> str:
    molecule = builder_snapshot.get("molecule")
    if not isinstance(molecule, Mapping):
        raise RelationFinalArtifactError("builder snapshot molecule is unavailable")
    atoms = molecule.get("atoms")
    bonds = molecule.get("bonds")
    if not isinstance(atoms, list) or not isinstance(bonds, list):
        raise RelationFinalArtifactError("builder snapshot graph is unavailable")
    graph = {
        "atoms": [
            {
                "atomId": atom["atomId"],
                "symbol": atom["symbol"],
                "formalCharge": atom["formalCharge"],
                "radicalElectrons": atom["radicalElectrons"],
            }
            for atom in atoms
        ],
        "bonds": [
            {
                "bondId": bond["bondId"],
                "atomId1": bond["atomId1"],
                "atomId2": bond["atomId2"],
                "order": bond["order"],
                "aromatic": bond["aromatic"],
            }
            for bond in bonds
        ],
    }
    return sha256_json(graph)


def _recheck_relation_manifest(
    run_dir: Path,
    *,
    checker: Callable[..., RelationCertificateCheckResult],
) -> tuple[RelationCertificateCheckResult, Mapping[str, Any]]:
    manifest_path = run_dir / "relation-certificate-manifest.json"
    archived_manifest = load_relation_certificate_manifest(manifest_path)
    with tempfile.TemporaryDirectory(prefix="retainmol-relation-recheck-") as directory:
        frozen_run = Path(directory).resolve() / run_dir.name
        for relative_path in (
            Path("run-manifest.json"),
            Path("inputs") / "initial-molecule.json",
            Path("enforced-plan.json"),
            Path("execution.json"),
        ):
            source = run_dir / relative_path
            destination = frozen_run / relative_path
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, destination)
        result = checker(frozen_run)
        if result.status != "pass":
            return result, archived_manifest
        rebuilt = build_relation_certificate_manifest(
            frozen_run,
            projection_version=result.projection_version,
        )
        if rebuilt != archived_manifest:
            raise RelationFinalArtifactError(
                "fresh relation check does not reproduce the archived certificate manifest"
            )
        return result, archived_manifest


def verify_relation_final_artifact(
    *,
    run_dir: Path,
    builder_snapshot_path: Path,
    identity_map_path: Path,
    final_sdf_path: Path,
    coordinate_transport_receipt_path: Path,
    evaluation: Mapping[str, Any],
    output_dir: Path,
    target_reference_path: Path,
    target_evaluator_path: Path,
    checker: Callable[..., RelationCertificateCheckResult] = run_relation_certificate_check,
) -> VerificationEnvelope:
    """Build a three-axis envelope for a spatial-relation execution.

    The archived PASS is not trusted. The relation projector and Lean checker
    run again and must reproduce the already archived manifest byte bindings.
    """

    output_dir.mkdir(parents=True, exist_ok=True)
    final_snapshot_path = output_dir / "final-snapshot.json"
    bridge = bridge_final_sdf(
        builder_snapshot_path=builder_snapshot_path,
        identity_map_path=identity_map_path,
        final_sdf_path=final_sdf_path,
        output_snapshot_path=final_snapshot_path,
        coordinate_transport_receipt_path=coordinate_transport_receipt_path,
    )
    relation, relation_manifest = _recheck_relation_manifest(run_dir, checker=checker)
    relation_status = _status(relation.status)
    terminal = verify_relation_terminal_binding(
        relation_trace_path=run_dir / "relation" / "relation-trace.json",
        execution_receipt_path=run_dir / "execution.json",
        builder_snapshot_path=builder_snapshot_path,
        identity_map_path=identity_map_path,
        coordinate_transport_receipt_path=coordinate_transport_receipt_path,
        final_sdf_path=final_sdf_path,
    )
    checker_evidence = dict(relation.evidence or {})
    checker_closure = checker_evidence.get("checkerClosureSha256")
    policy = {
        "policyVersion": RELATION_FINAL_POLICY_VERSION,
        "projectionVersion": relation.projection_version,
        "checkerClosureSha256": checker_closure,
    }
    policy_sha256 = sha256_json(policy)
    artifact_sha256 = (
        sha256_file(final_snapshot_path) if final_snapshot_path.is_file() else "unavailable"
    )
    target_evidence_valid = target_reference_path.is_file() and target_evaluator_path.is_file()
    target_evidence = {
        "referenceSdfSha256": (
            sha256_file(target_reference_path) if target_reference_path.is_file() else None
        ),
        "evaluatorSourceSha256": (
            sha256_file(target_evaluator_path) if target_evaluator_path.is_file() else None
        ),
    }
    context = {
        "schemaVersion": 1,
        "verifierVersion": RELATION_FINAL_VERIFIER_VERSION,
        "policy": policy,
        "builderSnapshotSha256": sha256_file(builder_snapshot_path),
        "identityMapSha256": sha256_file(identity_map_path),
        "finalSdfSha256": sha256_file(final_sdf_path),
        "finalSnapshotSha256": artifact_sha256,
        "coordinateTransportReceiptSha256": sha256_file(
            coordinate_transport_receipt_path
        ),
        "runManifestSha256": sha256_file(run_dir / "run-manifest.json"),
        "initialMoleculeSha256": sha256_file(
            run_dir / "inputs" / "initial-molecule.json"
        ),
        "enforcedPlanSha256": sha256_file(run_dir / "enforced-plan.json"),
        "executionReceiptSha256": sha256_file(run_dir / "execution.json"),
        "relationCertificateManifestSha256": sha256_file(
            run_dir / "relation-certificate-manifest.json"
        ),
        "relationCertificateManifest": dict(relation_manifest),
        "relationCheckerEvidence": checker_evidence,
        "relationTerminalBinding": terminal.to_json(),
        "artifactBridge": bridge.to_json(),
        "evaluationSha256": sha256_json(evaluation),
        "targetEvidence": target_evidence,
    }
    context_sha256 = sha256_json(context)
    execution_status = combine_verification_statuses(
        [relation_status, terminal.status]
    )
    execution = _axis(
        execution_status,
        (
            relation.code
            if relation_status is not VerificationStatus.PASS
            else terminal.code
        ),
        "lean-relation-trace-v1",
        artifact_sha256=artifact_sha256,
        policy_sha256=policy_sha256,
        context_sha256=context_sha256,
        witness={"checker": checker_evidence, "terminal": terminal.to_json()},
    )
    safety_status = combine_verification_statuses(
        [bridge.status, relation_status, terminal.status]
    )
    safety = _axis(
        safety_status,
        (
            "identity-graph-and-spatial-relation-preserved"
            if safety_status is VerificationStatus.PASS
            else relation.code
            if relation_status is not VerificationStatus.PASS
            else terminal.code
            if terminal.status is not VerificationStatus.PASS
            else bridge.code
        ),
        "artifact-bridge-v1+lean-relation-trace-v1",
        artifact_sha256=artifact_sha256,
        policy_sha256=policy_sha256,
        context_sha256=context_sha256,
        witness={
            "bridge": bridge.to_json(),
            "relation": checker_evidence,
            "terminal": terminal.to_json(),
        },
    )
    target_status, target_code = _target_status(evaluation)
    if not target_evidence_valid:
        target_status = VerificationStatus.INDETERMINATE
        target_code = "target-evidence-missing"
    target = _axis(
        target_status,
        target_code,
        "retainmol-benchmark-evaluator-v1",
        artifact_sha256=artifact_sha256,
        policy_sha256=policy_sha256,
        context_sha256=context_sha256,
        witness={"failures": evaluation.get("failures", [])},
    )
    envelope = VerificationEnvelope(
        artifact_sha256=artifact_sha256,
        policy_sha256=policy_sha256,
        expected_graph_sha256=_expected_graph_sha256(
            load_strict_json(builder_snapshot_path)
        ),
        enforced_plan_sha256=sha256_file(run_dir / "enforced-plan.json"),
        verifier_version=RELATION_FINAL_VERIFIER_VERSION,
        verification_context_sha256=context_sha256,
        axes={"execution": execution, "safety": safety, "target": target},
    )
    _write_json_atomic(output_dir / "verification-context.json", context)
    _write_json_atomic(output_dir / "verification.json", envelope.to_json())
    return envelope


def archived_relation_publication_status(
    run_dir: Path,
    record: Mapping[str, Any],
    envelope: VerificationEnvelope,
    *,
    checker: Callable[..., RelationCertificateCheckResult] = run_relation_certificate_check,
) -> VerificationStatus:
    """Re-run all publication checks from one content-validated snapshot."""

    if envelope.verifier_version != RELATION_FINAL_VERIFIER_VERSION:
        return VerificationStatus.INDETERMINATE
    if record.get("executorReturnCode") != 4:
        return VerificationStatus.INDETERMINATE
    with tempfile.TemporaryDirectory(prefix="retainmol-relation-publication-") as directory:
        frozen_run = Path(directory).resolve() / run_dir.name
        shutil.copytree(run_dir, frozen_run)
        frozen_record = load_strict_json(frozen_run / "run.json")
        if frozen_record != record:
            raise RelationFinalArtifactError("run record changed before publication snapshot")
        return _archived_snapshot_publication_status(
            frozen_run,
            record,
            envelope,
            checker=checker,
        )


def _archived_snapshot_publication_status(
    run_dir: Path,
    record: Mapping[str, Any],
    envelope: VerificationEnvelope,
    *,
    checker: Callable[..., RelationCertificateCheckResult],
) -> VerificationStatus:
    evaluation = record.get("evaluation")
    if not isinstance(evaluation, Mapping):
        return VerificationStatus.INDETERMINATE
    target_status, _ = _target_status(evaluation)
    if target_status is not VerificationStatus.PASS:
        return target_status
    final_snapshot = run_dir / "verification" / "final-snapshot.json"
    publication_status = envelope.publication_status(final_snapshot)
    if publication_status is not VerificationStatus.PASS:
        return publication_status

    context = load_strict_json(run_dir / "verification" / "verification-context.json")
    if not isinstance(context, Mapping):
        raise RelationFinalArtifactError("relation verification context must be an object")
    if context.get("schemaVersion") != 1:
        raise RelationFinalArtifactError("unsupported relation verification context schema")
    if sha256_json(context) != envelope.verification_context_sha256:
        raise RelationFinalArtifactError("relation verification context hash mismatch")
    if context.get("verifierVersion") != RELATION_FINAL_VERIFIER_VERSION:
        raise RelationFinalArtifactError("relation verifier version mismatch")
    policy = context.get("policy")
    if not isinstance(policy, Mapping) or sha256_json(policy) != envelope.policy_sha256:
        raise RelationFinalArtifactError("relation policy hash mismatch")

    bindings = {
        "builderSnapshotSha256": run_dir / "builder-snapshot.json",
        "identityMapSha256": run_dir / "identity-map.json",
        "finalSdfSha256": run_dir / "candidate.sdf",
        "finalSnapshotSha256": final_snapshot,
        "coordinateTransportReceiptSha256": run_dir / "coordinate-transport.json",
        "runManifestSha256": run_dir / "run-manifest.json",
        "initialMoleculeSha256": run_dir / "inputs" / "initial-molecule.json",
        "enforcedPlanSha256": run_dir / "enforced-plan.json",
        "executionReceiptSha256": run_dir / "execution.json",
        "relationCertificateManifestSha256": run_dir / "relation-certificate-manifest.json",
        "relationTraceSha256": run_dir / "relation" / "relation-trace.json",
        "relationTraceRequestSha256": run_dir / "relation" / "relation-trace-request.json",
        "generatedLeanSha256": run_dir / "relation" / "GeneratedRelationTrace.lean",
        "formalVerdictSha256": run_dir / "relation" / "formal-verdict.json",
    }
    archived_manifest = load_relation_certificate_manifest(
        run_dir / "relation-certificate-manifest.json"
    )
    relation_binding_fields = {
        "relationTraceSha256": "relationTraceSha256",
        "relationTraceRequestSha256": "certificateRequestSha256",
        "generatedLeanSha256": "generatedLeanSha256",
        "formalVerdictSha256": "formalVerdictSha256",
    }
    before: dict[str, str] = {}
    for field, path in bindings.items():
        if not path.is_file():
            raise RelationFinalArtifactError(f"missing relation publication artifact: {path.name}")
        digest = sha256_file(path)
        expected = (
            archived_manifest[relation_binding_fields[field]]
            if field in relation_binding_fields
            else context.get(field)
        )
        if expected != digest:
            raise RelationFinalArtifactError(f"relation publication binding mismatch: {field}")
        before[field] = digest
    if envelope.enforced_plan_sha256 != before["enforcedPlanSha256"]:
        raise RelationFinalArtifactError("relation envelope plan hash mismatch")
    if envelope.artifact_sha256 != before["finalSnapshotSha256"]:
        raise RelationFinalArtifactError("relation envelope artifact hash mismatch")
    if sha256_json(evaluation) != context.get("evaluationSha256"):
        raise RelationFinalArtifactError("relation evaluation hash mismatch")

    if dict(archived_manifest) != context.get("relationCertificateManifest"):
        raise RelationFinalArtifactError("relation manifest differs from verification context")
    relation_record = record.get("relationVerification")
    if not isinstance(relation_record, Mapping) or relation_record.get("status") != "pass":
        return VerificationStatus.INDETERMINATE
    if relation_record.get("manifestSha256") != before["relationCertificateManifestSha256"]:
        raise RelationFinalArtifactError("run record relation manifest hash mismatch")

    archived_verification = load_strict_json(run_dir / "verification" / "verification.json")
    if archived_verification != record.get("verification"):
        raise RelationFinalArtifactError("archived relation envelope mismatch")
    target_evidence = context.get("targetEvidence")
    if not isinstance(target_evidence, Mapping):
        raise RelationFinalArtifactError("relation target evidence is missing")
    target_hashes: dict[str, str] = {}
    for field, path in (
        ("referenceSdfSha256", run_dir / "target-reference.sdf"),
        ("evaluatorSourceSha256", run_dir / "target-evaluator.py"),
    ):
        if not path.is_file():
            raise RelationFinalArtifactError(f"missing relation target evidence: {field}")
        target_hashes[field] = sha256_file(path)
        if target_evidence.get(field) != target_hashes[field]:
            raise RelationFinalArtifactError(f"relation target evidence mismatch: {field}")
    if target_hashes["referenceSdfSha256"] != record.get("referenceSdfSha256"):
        raise RelationFinalArtifactError("run record target reference hash mismatch")
    if target_hashes["evaluatorSourceSha256"] != record.get("evaluatorSourceSha256"):
        raise RelationFinalArtifactError("run record target evaluator hash mismatch")

    manifest_digest = require_manifest_matches_record(run_dir / "run-manifest.json", record)
    if manifest_digest != before["runManifestSha256"]:
        raise RelationFinalArtifactError("run manifest digest mismatch")
    manifest = load_run_manifest(run_dir / "run-manifest.json")
    edit_plan = run_dir / "edit-plan.json"
    if not edit_plan.is_file() or sha256_file(edit_plan) != manifest.get("editPlanSha256"):
        raise RelationFinalArtifactError("archived edit plan hash mismatch")
    for field, digest in (
        ("candidateSha256", before["finalSdfSha256"]),
        ("executionReceiptSha256", before["executionReceiptSha256"]),
        (
            "coordinateTransportReceiptSha256",
            before["coordinateTransportReceiptSha256"],
        ),
    ):
        if record.get(field) != digest:
            raise RelationFinalArtifactError(f"run record {field} mismatch")

    fresh_relation, fresh_manifest = _recheck_relation_manifest(run_dir, checker=checker)
    fresh_status = _status(fresh_relation.status)
    if fresh_status is not VerificationStatus.PASS:
        return fresh_status
    if dict(fresh_manifest) != dict(archived_manifest):
        return VerificationStatus.REJECT
    fresh_closure = (fresh_relation.evidence or {}).get("checkerClosureSha256")
    if fresh_closure != policy.get("checkerClosureSha256"):
        return VerificationStatus.INDETERMINATE

    terminal = verify_relation_terminal_binding(
        relation_trace_path=run_dir / "relation" / "relation-trace.json",
        execution_receipt_path=run_dir / "execution.json",
        builder_snapshot_path=run_dir / "builder-snapshot.json",
        identity_map_path=run_dir / "identity-map.json",
        coordinate_transport_receipt_path=run_dir / "coordinate-transport.json",
        final_sdf_path=run_dir / "candidate.sdf",
    )
    bridge_output = run_dir / "verification" / "publication-final-snapshot.json"
    bridge: ArtifactBridgeResult = bridge_final_sdf(
        builder_snapshot_path=run_dir / "builder-snapshot.json",
        identity_map_path=run_dir / "identity-map.json",
        final_sdf_path=run_dir / "candidate.sdf",
        output_snapshot_path=bridge_output,
        coordinate_transport_receipt_path=run_dir / "coordinate-transport.json",
    )
    combined = combine_verification_statuses(
        [fresh_status, terminal.status, bridge.status, target_status]
    )
    if combined is not VerificationStatus.PASS:
        return combined
    if not bridge_output.is_file() or sha256_file(bridge_output) != envelope.artifact_sha256:
        return VerificationStatus.REJECT
    return VerificationStatus.PASS
