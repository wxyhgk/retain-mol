from __future__ import annotations

from pathlib import Path
from typing import Any, Mapping

from .artifact_contracts import (
    load_coordinate_transport_receipt,
    load_strict_json,
    sha256_file,
    sha256_json,
)
from .formal_verdict import VerificationEnvelope, VerificationStatus
from .final_artifact_gate import build_geometry_intent_request
from .geometry_policy_spec import load_run_geometry_policy_spec
from .coordinate_semantics import verify_xtb_coordinate_chain
from .run_manifest import load_run_manifest, require_manifest_matches_record


class PublicationEvidenceError(ValueError):
    """An archived verification envelope is no longer backed by its evidence."""


def _mapping(value: Any, field: str) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        raise PublicationEvidenceError(f"{field} must be an object")
    return value


def _required_digest(value: Any, field: str) -> str:
    if not isinstance(value, str) or len(value) != 64:
        raise PublicationEvidenceError(f"{field} must contain a SHA-256 digest")
    return value


def _require_file_hash(run_dir: Path, relative_path: str, expected: Any, field: str) -> str:
    expected_digest = _required_digest(expected, field)
    path = run_dir / relative_path
    if not path.is_file():
        raise PublicationEvidenceError(f"missing archived evidence: {relative_path}")
    actual_digest = sha256_file(path)
    if actual_digest != expected_digest:
        raise PublicationEvidenceError(f"archived evidence hash mismatch: {relative_path}")
    return actual_digest


def archived_publication_status(
    run_dir: Path,
    record: Mapping[str, Any],
    envelope: VerificationEnvelope,
) -> VerificationStatus:
    """Revalidate every archived file that contributed to a PASS envelope."""

    if record.get("executorReturnCode") != 0:
        return VerificationStatus.INDETERMINATE

    evaluation = _mapping(record.get("evaluation"), "run.evaluation")
    if evaluation.get("passed") is not True:
        return VerificationStatus.INDETERMINATE

    final_snapshot = run_dir / "verification" / "final-snapshot.json"
    if envelope.publication_status(final_snapshot) is not VerificationStatus.PASS:
        return VerificationStatus.INDETERMINATE

    context_path = run_dir / "verification" / "verification-context.json"
    context = _mapping(load_strict_json(context_path), "verification context")
    if sha256_json(context) != envelope.verification_context_sha256:
        raise PublicationEvidenceError("verification context hash mismatch")
    if context.get("schemaVersion") != 1:
        raise PublicationEvidenceError("unsupported verification context schema")
    if context.get("verifierVersion") != envelope.verifier_version:
        raise PublicationEvidenceError("verifier version mismatch")

    builder_digest = _require_file_hash(
        run_dir,
        "builder-snapshot.json",
        context.get("builderSnapshotSha256"),
        "context.builderSnapshotSha256",
    )
    if envelope.verifier_version != "retainmol-final-artifact-v4" and (
        builder_digest != envelope.expected_graph_sha256
    ):
        raise PublicationEvidenceError("expected graph hash mismatch")
    _require_file_hash(
        run_dir,
        "identity-map.json",
        context.get("identityMapSha256"),
        "context.identityMapSha256",
    )
    candidate_digest = _require_file_hash(
        run_dir,
        "candidate.sdf",
        context.get("finalSdfSha256"),
        "context.finalSdfSha256",
    )
    execution_digest = _require_file_hash(
        run_dir,
        "execution.json",
        context.get("executionReceiptSha256"),
        "context.executionReceiptSha256",
    )
    expected_effect_digest = _require_file_hash(
        run_dir,
        "expected-effect.json",
        context.get("expectedEffectSha256"),
        "context.expectedEffectSha256",
    )
    plan_digest = _require_file_hash(
        run_dir,
        "enforced-plan.json",
        context.get("enforcedPlanSha256"),
        "context.enforcedPlanSha256",
    )
    if plan_digest != envelope.enforced_plan_sha256:
        raise PublicationEvidenceError("enforced plan hash mismatch")
    executor_output_relative = "candidate.raw.sdf" if (run_dir / "candidate.raw.sdf").is_file() else "candidate.sdf"
    _require_file_hash(
        run_dir,
        executor_output_relative,
        context.get("executorOutputSha256"),
        "context.executorOutputSha256",
    )
    manifest_path = run_dir / "run-manifest.json"
    manifest_digest = require_manifest_matches_record(manifest_path, record)
    if manifest_digest != context.get("runManifestSha256"):
        raise PublicationEvidenceError("run manifest hash mismatch")
    manifest = load_run_manifest(manifest_path)
    _require_file_hash(
        run_dir,
        "edit-plan.json",
        manifest.get("editPlanSha256"),
        "manifest.editPlanSha256",
    )

    coordinate_digest = _require_file_hash(
        run_dir,
        "coordinate-transport.json",
        context.get("coordinateTransportReceiptSha256"),
        "context.coordinateTransportReceiptSha256",
    )
    transport = _mapping(context.get("transportEvidence"), "context.transportEvidence")
    if transport.get("coordinateTransportReceiptSha256") not in (None, coordinate_digest):
        raise PublicationEvidenceError("transport evidence receipt hash mismatch")
    if transport.get("kind") == "xtb-coordinate-transport":
        transport_files = {
            "sourceSdfSha256": "xtb-input.sdf",
            "inputXyzSha256": "xtb-input.xyz",
            "outputXyzSha256": "xtb-output.xyz",
        }
        for field, relative_path in transport_files.items():
            _require_file_hash(
                run_dir,
                relative_path,
                transport.get(field),
                f"context.transportEvidence.{field}",
            )
        coordinate_receipt = load_coordinate_transport_receipt(
            run_dir / "coordinate-transport.json"
        )
        if coordinate_receipt.transport_provenance is None:
            raise PublicationEvidenceError("xTB coordinate provenance is missing")
        if coordinate_receipt.transport_provenance != {
            "kind": "xtb-coordinate-transport",
            "sourceSdfSha256": transport.get("sourceSdfSha256"),
            "inputXyzSha256": transport.get("inputXyzSha256"),
            "outputXyzSha256": transport.get("outputXyzSha256"),
            "executableSha256": transport.get("executableSha256"),
            "rowOrderContract": transport.get("rowOrderContract"),
            "postProcessing": transport.get("postProcessing"),
            "fixedAtomRows": tuple(transport.get("fixedAtomRows", ())),
        }:
            raise PublicationEvidenceError("xTB coordinate provenance mismatch")
        verify_xtb_coordinate_chain(
            source_sdf_path=run_dir / "xtb-input.sdf",
            input_xyz_path=run_dir / "xtb-input.xyz",
            output_xyz_path=run_dir / "xtb-output.xyz",
            final_sdf_path=run_dir / "candidate.sdf",
            fixed_atom_rows=coordinate_receipt.transport_provenance["fixedAtomRows"],
        )

    geometry_request = _mapping(
        load_strict_json(run_dir / "verification" / "geometry-request.json"),
        "geometry request",
    )
    if sha256_file(run_dir / "verification" / "geometry-request.json") != context.get(
        "geometryRequestSha256"
    ):
        raise PublicationEvidenceError("geometry request hash mismatch")
    if envelope.verifier_version == "retainmol-final-artifact-v4":
        _require_file_hash(
            run_dir,
            "inputs/initial-molecule.json",
            context.get("initialMoleculeSha256"),
            "context.initialMoleculeSha256",
        )
        intent = _mapping(geometry_request.get("intent"), "geometry request intent")
        if sha256_json(intent) != envelope.policy_sha256:
            raise PublicationEvidenceError("geometry intent hash mismatch")
        if sha256_json(_mapping(intent.get("expected"), "geometry intent expected")) != envelope.expected_graph_sha256:
            raise PublicationEvidenceError("expected graph hash mismatch")
        run_spec_path = run_dir / "run-spec.json"
        if run_spec_path.is_file():
            run_spec_digest = _require_file_hash(
                run_dir,
                "run-spec.json",
                context.get("runSpecSha256"),
                "context.runSpecSha256",
            )
            if run_spec_digest != manifest.get("runSpecSha256"):
                raise PublicationEvidenceError("geometry intent run spec hash mismatch")
            spec = load_run_geometry_policy_spec(run_spec_path)
        else:
            if context.get("runSpecSha256") is not None or manifest.get("runSpecSha256") is not None:
                raise PublicationEvidenceError("geometry intent run spec is missing")
            spec = None
        rebuilt_request = build_geometry_intent_request(
            _mapping(load_strict_json(run_dir / "expected-effect.json"), "expected effect"),
            _mapping(load_strict_json(run_dir / "enforced-plan.json"), "enforced plan"),
            _mapping(load_strict_json(run_dir / "inputs/initial-molecule.json"), "initial molecule"),
            _mapping(load_strict_json(run_dir / "builder-snapshot.json"), "builder snapshot"),
            _mapping(load_strict_json(final_snapshot), "final snapshot"),
            spec,
        )
        if rebuilt_request != geometry_request:
            raise PublicationEvidenceError("geometry intent is not reproducible from archived evidence")
        if expected_effect_digest != context.get("expectedEffectSha256"):
            raise PublicationEvidenceError("expected effect hash mismatch")
    else:
        policy = _mapping(geometry_request.get("policy"), "geometry request policy")
        if sha256_json(policy) != envelope.policy_sha256:
            raise PublicationEvidenceError("geometry policy hash mismatch")
    if envelope.verifier_version == "retainmol-final-artifact-v3":
        run_spec_digest = _require_file_hash(
            run_dir,
            "run-spec.json",
            context.get("runSpecSha256"),
            "context.runSpecSha256",
        )
        if run_spec_digest != manifest.get("runSpecSha256"):
            raise PublicationEvidenceError("geometry policy run spec hash mismatch")
        spec = load_run_geometry_policy_spec(run_dir / "run-spec.json")
        expected_policy_fields = {
            "policyId": spec.policy_id,
            "fixedAtomIds": list(spec.fixed_atom_ids),
            "orientationChecks": [item.to_json() for item in spec.orientation_checks],
            "rigidAtomGroups": [item.to_json() for item in spec.rigid_atom_groups],
        }
        for field, expected_value in expected_policy_fields.items():
            if policy.get(field) != expected_value:
                raise PublicationEvidenceError(
                    f"geometry policy field is not derived from frozen run spec: {field}"
                )
    if sha256_json(evaluation) != context.get("evaluationSha256"):
        raise PublicationEvidenceError("evaluation hash mismatch")

    archived_envelope = load_strict_json(run_dir / "verification" / "verification.json")
    if archived_envelope != record.get("verification"):
        raise PublicationEvidenceError("archived verification envelope mismatch")

    record_hashes = {
        "candidateSha256": candidate_digest,
        "executionReceiptSha256": execution_digest,
        "coordinateTransportReceiptSha256": coordinate_digest,
    }
    for field, actual_digest in record_hashes.items():
        if record.get(field) != actual_digest:
            raise PublicationEvidenceError(f"run record {field} mismatch")

    target_evidence = _mapping(context.get("targetEvidence"), "context.targetEvidence")
    reference_digest = _require_file_hash(
        run_dir,
        "target-reference.sdf",
        target_evidence.get("referenceSdfSha256"),
        "context.targetEvidence.referenceSdfSha256",
    )
    evaluator_digest = _require_file_hash(
        run_dir,
        "target-evaluator.py",
        target_evidence.get("evaluatorSourceSha256"),
        "context.targetEvidence.evaluatorSourceSha256",
    )
    if reference_digest != record.get("referenceSdfSha256"):
        raise PublicationEvidenceError("target reference hash mismatch")
    if evaluator_digest != record.get("evaluatorSourceSha256"):
        raise PublicationEvidenceError("target evaluator hash mismatch")
    return VerificationStatus.PASS
