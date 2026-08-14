from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any, Mapping

from .artifact_bridge import bridge_final_sdf
from .artifact_contracts import (
    ArtifactContractError,
    canonical_json_bytes,
    load_coordinate_transport_receipt,
    load_strict_json,
    sha256_file,
    sha256_json,
)
from .execution_evidence import validate_execution_evidence
from .coordinate_semantics import CoordinateSemanticError, verify_xtb_coordinate_chain
from .formal_geometry_checker import check_formal_geometry
from .formal_verdict import (
    AxisVerdict,
    VerificationEnvelope,
    VerificationStatus,
)


VERIFIER_VERSION = "retainmol-final-artifact-v2"
GEOMETRY_POLICY_VERSION = "covalent-distance-envelope-v1"
XTB_ROW_ORDER_CONTRACT = "xtb-preserves-input-row-order-v1"
XTB_POST_PROCESSING = "fixed-anchor-frame-projection-v1"


def _geometry_atom(atom: Mapping[str, Any]) -> dict[str, Any]:
    return {
        "atomId": atom["atomId"],
        "symbol": atom["symbol"],
        "position": atom["position"],
        "formalCharge": atom["formalCharge"],
        "radicalElectrons": atom["radicalElectrons"],
        "aromatic": False,
    }


def _geometry_bond(bond: Mapping[str, Any]) -> dict[str, Any]:
    return {
        "bondId": bond["bondId"],
        "atomId1": bond["atomId1"],
        "atomId2": bond["atomId2"],
        "order": {1: "single", 2: "double", 3: "triple"}[bond["order"]],
    }


def _distance(left: Mapping[str, Any], right: Mapping[str, Any]) -> float:
    return math.sqrt(sum(
        (float(left["position"][index]) - float(right["position"][index])) ** 2
        for index in range(3)
    ))


def build_geometry_request(
    expected_snapshot: Mapping[str, Any],
    candidate_snapshot: Mapping[str, Any],
) -> dict[str, Any]:
    expected_molecule = expected_snapshot["molecule"]
    candidate_molecule = candidate_snapshot["molecule"]
    expected_atoms = {atom["atomId"]: atom for atom in expected_molecule["atoms"]}
    bounds: list[dict[str, Any]] = []
    for bond in expected_molecule["bonds"]:
        distance = _distance(expected_atoms[bond["atomId1"]], expected_atoms[bond["atomId2"]])
        # Broad enough for xTB relaxation, narrow enough to catch broken or
        # collapsed structures.  Quantization is handled inward by Lean input.
        bounds.append({
            "atomId1": bond["atomId1"],
            "atomId2": bond["atomId2"],
            "minAngstrom": max(0.4, distance * 0.65),
            "maxAngstrom": min(3.5, max(distance * 1.35, distance + 0.15)),
        })
    return {
        "schemaVersion": 2,
        "coordinateScale": 1000,
        "expected": {
            "atoms": [_geometry_atom(atom) for atom in expected_molecule["atoms"]],
            "bonds": [_geometry_bond(bond) for bond in expected_molecule["bonds"]],
        },
        "candidate": {
            "atoms": [_geometry_atom(atom) for atom in candidate_molecule["atoms"]],
            "bonds": [_geometry_bond(bond) for bond in candidate_molecule["bonds"]],
        },
        "policy": {
            "policyId": GEOMETRY_POLICY_VERSION,
            "requireGeometryConstraints": True,
            "requireAllBondDistances": True,
            "fixedAtomIds": [],
            "distanceBounds": bounds,
            "orientationChecks": [],
            "rigidAtomGroups": [],
        },
    }


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


def _target_status(evaluation: Mapping[str, Any]) -> tuple[VerificationStatus, str]:
    required = {
        "case_id",
        "passed",
        "score",
        "formula_match",
        "topology_match",
        "severe_clashes",
        "disconnected_components",
        "failures",
        "diagnostics",
    }
    if not required.issubset(evaluation):
        return VerificationStatus.INDETERMINATE, "target-evaluation-incomplete"
    failures = evaluation.get("failures")
    if not isinstance(failures, list) or any(not isinstance(item, str) for item in failures):
        return VerificationStatus.INDETERMINATE, "target-evaluation-invalid"
    if (
        not isinstance(evaluation.get("formula_match"), bool)
        or not isinstance(evaluation.get("topology_match"), bool)
        or isinstance(evaluation.get("severe_clashes"), bool)
        or not isinstance(evaluation.get("severe_clashes"), int)
        or isinstance(evaluation.get("disconnected_components"), bool)
        or not isinstance(evaluation.get("disconnected_components"), int)
    ):
        return VerificationStatus.INDETERMINATE, "target-evaluation-invalid"
    infrastructure_failures = {
        "candidate-invalid",
        "xtb-failed",
        "xtb-not-converged",
        "formal-indeterminate",
    }
    if any(item in infrastructure_failures for item in failures):
        return VerificationStatus.INDETERMINATE, "target-evaluator-infrastructure-failure"
    pass_invariants_hold = all((
        evaluation["formula_match"] is True,
        evaluation["topology_match"] is True,
        evaluation["severe_clashes"] == 0,
        evaluation["disconnected_components"] == 1,
    ))
    if evaluation.get("passed") is True and not failures and not pass_invariants_hold:
        return VerificationStatus.INDETERMINATE, "target-evaluation-inconsistent"
    if evaluation.get("passed") is True and not failures:
        return VerificationStatus.PASS, "target-evaluation-passed"
    if evaluation.get("passed") is False and failures:
        return VerificationStatus.REJECT, "target-evaluation-rejected"
    return VerificationStatus.INDETERMINATE, "target-evaluation-inconsistent"


def _transport_is_trusted(
    *,
    transport_evidence: Mapping[str, Any] | None,
    coordinate_transport_receipt_path: Path | None,
    source_sdf_path: Path | None,
    input_xyz_path: Path | None,
    output_xyz_path: Path | None,
    final_sdf_path: Path,
) -> bool:
    if transport_evidence is None:
        return True
    if transport_evidence.get("kind") != "xtb-coordinate-transport":
        return False
    if transport_evidence.get("trusted") is not True:
        return False
    paths = (
        coordinate_transport_receipt_path,
        source_sdf_path,
        input_xyz_path,
        output_xyz_path,
    )
    if any(path is None or not path.is_file() for path in paths):
        return False
    assert coordinate_transport_receipt_path is not None
    assert source_sdf_path is not None
    assert input_xyz_path is not None
    assert output_xyz_path is not None
    try:
        receipt = load_coordinate_transport_receipt(coordinate_transport_receipt_path)
    except ArtifactContractError:
        return False
    provenance = receipt.transport_provenance
    if provenance is None:
        return False
    expected = {
        "kind": "xtb-coordinate-transport",
        "sourceSdfSha256": sha256_file(source_sdf_path),
        "inputXyzSha256": sha256_file(input_xyz_path),
        "outputXyzSha256": sha256_file(output_xyz_path),
        "executableSha256": transport_evidence.get("executableSha256"),
        "rowOrderContract": XTB_ROW_ORDER_CONTRACT,
        "postProcessing": XTB_POST_PROCESSING,
        "fixedAtomRows": tuple(transport_evidence.get("fixedAtomRows", ())),
    }
    if dict(provenance) != expected:
        return False
    metadata_matches = all((
        transport_evidence.get("coordinateTransportReceiptSha256")
        == sha256_file(coordinate_transport_receipt_path),
        transport_evidence.get("sourceSdfSha256") == expected["sourceSdfSha256"],
        transport_evidence.get("inputXyzSha256") == expected["inputXyzSha256"],
        transport_evidence.get("outputXyzSha256") == expected["outputXyzSha256"],
        transport_evidence.get("rowOrderContract") == XTB_ROW_ORDER_CONTRACT,
        transport_evidence.get("postProcessing") == XTB_POST_PROCESSING,
        tuple(transport_evidence.get("fixedAtomRows", ())) == provenance["fixedAtomRows"],
    ))
    if not metadata_matches:
        return False
    try:
        verify_xtb_coordinate_chain(
            source_sdf_path=source_sdf_path,
            input_xyz_path=input_xyz_path,
            output_xyz_path=output_xyz_path,
            final_sdf_path=final_sdf_path,
            fixed_atom_rows=provenance["fixedAtomRows"],
        )
    except (CoordinateSemanticError, OSError, ValueError):
        return False
    return True


def verify_final_artifact(
    *,
    builder_snapshot_path: Path,
    identity_map_path: Path,
    final_sdf_path: Path,
    executor_output_path: Path | None = None,
    execution_receipt_path: Path,
    expected_effect_path: Path,
    enforced_plan_path: Path,
    evaluation: Mapping[str, Any],
    output_dir: Path,
    coordinate_transport_receipt_path: Path | None = None,
    transport_evidence: Mapping[str, Any] | None = None,
    target_evidence: Mapping[str, Any] | None = None,
    transport_source_sdf_path: Path | None = None,
    transport_input_xyz_path: Path | None = None,
    transport_output_xyz_path: Path | None = None,
    target_reference_path: Path | None = None,
    target_evaluator_path: Path | None = None,
    run_manifest_path: Path | None = None,
) -> VerificationEnvelope:
    output_dir.mkdir(parents=True, exist_ok=True)
    final_snapshot_path = output_dir / "final-snapshot.json"
    geometry_request_path = output_dir / "geometry-request.json"

    bridge = bridge_final_sdf(
        builder_snapshot_path=builder_snapshot_path,
        identity_map_path=identity_map_path,
        final_sdf_path=final_sdf_path,
        output_snapshot_path=final_snapshot_path,
        coordinate_transport_receipt_path=coordinate_transport_receipt_path,
    )
    receipt = load_strict_json(execution_receipt_path)
    expected_effect = load_strict_json(expected_effect_path)
    plan = load_strict_json(enforced_plan_path)
    execution_receipt_sha256 = sha256_file(execution_receipt_path)
    expected_effect_sha256 = sha256_file(expected_effect_path)
    enforced_plan_sha256 = sha256_file(enforced_plan_path)
    resolved_executor_output = executor_output_path or final_sdf_path
    executor_output_sha256 = (
        sha256_file(resolved_executor_output)
        if resolved_executor_output.is_file()
        else "unavailable"
    )

    geometry_request: Mapping[str, Any] = {"policy": {"policyId": GEOMETRY_POLICY_VERSION}}
    if bridge.final_snapshot is not None:
        expected_snapshot = load_strict_json(builder_snapshot_path)
        geometry_request = build_geometry_request(expected_snapshot, bridge.final_snapshot)
        geometry_request_path.write_bytes(canonical_json_bytes(geometry_request) + b"\n")

    policy_sha256 = sha256_json(geometry_request["policy"])
    coordinate_receipt_sha256 = (
        sha256_file(coordinate_transport_receipt_path)
        if coordinate_transport_receipt_path is not None
        and coordinate_transport_receipt_path.is_file()
        else None
    )
    transport_trusted = _transport_is_trusted(
        transport_evidence=transport_evidence,
        coordinate_transport_receipt_path=coordinate_transport_receipt_path,
        source_sdf_path=transport_source_sdf_path,
        input_xyz_path=transport_input_xyz_path,
        output_xyz_path=transport_output_xyz_path,
        final_sdf_path=final_sdf_path,
    )
    resolved_target_evidence = dict(target_evidence or {})
    target_evidence_valid = True
    if target_reference_path is not None or target_evaluator_path is not None:
        target_evidence_valid = bool(
            target_reference_path is not None
            and target_evaluator_path is not None
            and target_reference_path.is_file()
            and target_evaluator_path.is_file()
        )
        if target_evidence_valid:
            assert target_reference_path is not None
            assert target_evaluator_path is not None
            resolved_target_evidence["referenceSdfSha256"] = sha256_file(target_reference_path)
            resolved_target_evidence["evaluatorSourceSha256"] = sha256_file(target_evaluator_path)
    formal = None
    if bridge.status is VerificationStatus.PASS and transport_trusted:
        formal = check_formal_geometry(geometry_request_path)
    context = {
        "schemaVersion": 1,
        "verifierVersion": VERIFIER_VERSION,
        "geometryPolicyVersion": GEOMETRY_POLICY_VERSION,
        "builderSnapshotSha256": sha256_file(builder_snapshot_path),
        "identityMapSha256": sha256_file(identity_map_path),
        "finalSdfSha256": sha256_file(final_sdf_path),
        "executionReceiptSha256": execution_receipt_sha256,
        "expectedEffectSha256": expected_effect_sha256,
        "enforcedPlanSha256": enforced_plan_sha256,
        "executorOutputSha256": executor_output_sha256,
        "runManifestSha256": (
            sha256_file(run_manifest_path)
            if run_manifest_path is not None and run_manifest_path.is_file()
            else None
        ),
        "geometryRequestSha256": (
            sha256_file(geometry_request_path) if geometry_request_path.is_file() else None
        ),
        "transportEvidence": dict(transport_evidence or {"kind": "direct-no-refinement"}),
        "coordinateTransportReceiptSha256": coordinate_receipt_sha256,
        "evaluationSha256": sha256_json(evaluation),
        "targetEvidence": resolved_target_evidence,
        "formalCheckerEvidence": dict(formal.evidence) if formal and formal.evidence else None,
    }
    context_sha256 = sha256_json(context)
    artifact_sha256 = sha256_file(final_snapshot_path) if final_snapshot_path.exists() else "unavailable"

    if bridge.status is VerificationStatus.REJECT:
        execution = _axis(
            VerificationStatus.REJECT,
            bridge.code,
            "artifact-bridge-v1",
            artifact_sha256=artifact_sha256,
            policy_sha256=policy_sha256,
            context_sha256=context_sha256,
            witness=bridge.witness,
        )
    else:
        effect_result = validate_execution_evidence(
            plan=plan,
            expected_effect=expected_effect,
            receipt=receipt,
            enforced_plan_sha256=enforced_plan_sha256,
            expected_effect_sha256=expected_effect_sha256,
            executor_output_sha256=executor_output_sha256,
        )
        execution = _axis(
            VerificationStatus(effect_result.status),
            effect_result.code,
            "expected-effect-plan-binding-v2",
            artifact_sha256=artifact_sha256,
            policy_sha256=policy_sha256,
            context_sha256=context_sha256,
            witness=effect_result.witness,
        )

    if bridge.status is not VerificationStatus.PASS:
        safety = _axis(
            bridge.status,
            bridge.code,
            "artifact-bridge-v1",
            artifact_sha256=artifact_sha256,
            policy_sha256=policy_sha256,
            context_sha256=context_sha256,
            witness=bridge.witness,
        )
    elif not transport_trusted:
        safety = _axis(
            VerificationStatus.INDETERMINATE,
            "untrusted-coordinate-transport",
            "transport-trust-v1",
            artifact_sha256=artifact_sha256,
            policy_sha256=policy_sha256,
            context_sha256=context_sha256,
            witness=transport_evidence,
        )
    else:
        if formal is None:
            raise RuntimeError("formal geometry checker did not produce a result")
        safety = _axis(
            formal.status,
            formal.code,
            "lean-retainmol-geometry-v2",
            artifact_sha256=artifact_sha256,
            policy_sha256=policy_sha256,
            context_sha256=context_sha256,
            witness={
                "issues": list(formal.issues),
                "evidence": dict(formal.evidence) if formal.evidence else None,
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
        expected_graph_sha256=sha256_file(builder_snapshot_path),
        enforced_plan_sha256=enforced_plan_sha256,
        verifier_version=VERIFIER_VERSION,
        verification_context_sha256=context_sha256,
        axes={"execution": execution, "safety": safety, "target": target},
    )
    (output_dir / "verification-context.json").write_text(
        json.dumps(context, ensure_ascii=False, sort_keys=True, indent=2) + "\n",
        encoding="utf-8",
    )
    (output_dir / "verification.json").write_text(
        json.dumps(envelope.to_json(), ensure_ascii=False, sort_keys=True, indent=2) + "\n",
        encoding="utf-8",
    )
    return envelope
