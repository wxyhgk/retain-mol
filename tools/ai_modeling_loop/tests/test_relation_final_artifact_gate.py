from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from rdkit import Chem
from rdkit.Geometry import Point3D

from tools.ai_modeling_loop.artifact_contracts import sha256_file
from tools.ai_modeling_loop.chemistry import write_sdf
from tools.ai_modeling_loop.formal_verdict import VerificationStatus
from tools.ai_modeling_loop.relation_certificate_checker import (
    RelationCertificateCheckResult,
)
from tools.ai_modeling_loop.relation_final_artifact_gate import (
    RelationFinalArtifactError,
    archived_relation_publication_status,
    verify_relation_final_artifact,
)
from tools.ai_modeling_loop.relation_terminal_binding import (
    canonical_snapshot_digest,
    canonicalize_builder_snapshot,
)


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, sort_keys=True) + "\n", encoding="utf-8")


class RelationFinalArtifactGateTests(unittest.TestCase):
    def create_run(self, root: Path) -> tuple[Path, dict, dict]:
        run_dir = root / "run"
        snapshot = {
            "schemaVersion": 1,
            "coordinateSpace": "angstrom",
            "molecule": {
                "name": "CO",
                "atoms": [
                    {
                        "atomId": "C:1",
                        "symbol": "C",
                        "position": [0.0, 0.0, 0.0],
                        "formalCharge": 0,
                        "radicalElectrons": 0,
                    },
                    {
                        "atomId": "O:1",
                        "symbol": "O",
                        "position": [1.2, 0.0, 0.0],
                        "formalCharge": 0,
                        "radicalElectrons": 0,
                    },
                ],
                "bonds": [{
                    "bondId": "bond:1",
                    "atomId1": "C:1",
                    "atomId2": "O:1",
                    "order": 2,
                    "aromatic": False,
                }],
            },
        }
        write_json(run_dir / "builder-snapshot.json", snapshot)
        write_json(run_dir / "identity-map.json", {
            "schemaVersion": 1,
            "atomRows": [
                {"rowIndex": 1, "atomId": "C:1", "symbol": "C"},
                {"rowIndex": 2, "atomId": "O:1", "symbol": "O"},
            ],
            "bondRows": [{
                "rowIndex": 1,
                "bondId": "bond:1",
                "atomId1": "C:1",
                "atomId2": "O:1",
                "order": 2,
            }],
        })
        editable = Chem.RWMol()
        editable.AddAtom(Chem.Atom("C"))
        editable.AddAtom(Chem.Atom("O"))
        editable.AddBond(0, 1, Chem.BondType.DOUBLE)
        molecule = editable.GetMol()
        conformer = Chem.Conformer(2)
        conformer.SetAtomPosition(0, Point3D(0.0, 0.0, 0.0))
        conformer.SetAtomPosition(1, Point3D(1.2, 0.0, 0.0))
        molecule.AddConformer(conformer)
        write_sdf(molecule, run_dir / "candidate.sdf")
        write_json(run_dir / "coordinate-transport.json", {})
        write_json(run_dir / "inputs/initial-molecule.json", {"schemaVersion": 1})
        write_json(run_dir / "enforced-plan.json", {"schemaVersion": 1})
        write_json(run_dir / "edit-plan.json", {"schemaVersion": 1})
        (run_dir / "target-reference.sdf").write_bytes(b"reference")
        (run_dir / "target-evaluator.py").write_text("# evaluator\n", encoding="utf-8")
        canonical = canonicalize_builder_snapshot(snapshot)
        final_digest = canonical_snapshot_digest(canonical)
        write_json(run_dir / "execution.json", {
            "schemaVersion": 1,
            "outputSha256": sha256_file(run_dir / "candidate.sdf"),
            "builderSnapshotSha256": sha256_file(run_dir / "builder-snapshot.json"),
            "identityMapSha256": sha256_file(run_dir / "identity-map.json"),
            "coordinateTransportReceiptSha256": sha256_file(
                run_dir / "coordinate-transport.json"
            ),
            "actualEffectReceipt": {"finalDigest": final_digest},
        })
        write_json(run_dir / "relation" / "relation-trace.json", {
            "identity": {"finalDigest": final_digest},
            "steps": [{"runtimeAfter": canonical}],
        })
        for name in (
            "relation-trace-request.json",
            "GeneratedRelationTrace.lean",
            "formal-verdict.json",
        ):
            path = run_dir / "relation" / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("{}\n", encoding="utf-8")
        relation_manifest_path = run_dir / "relation-certificate-manifest.json"
        write_json(relation_manifest_path, {"schemaVersion": 1})
        run_manifest = {
            "schemaVersion": 1,
            "runId": "run",
            "createdAt": "2026-08-15T00:00:00Z",
            "caseId": "case-a",
            "gitCommit": None,
            "gitDirty": None,
            "executor": "test-executor",
            "editPlanSha256": sha256_file(run_dir / "edit-plan.json"),
            "referenceSdfSha256": sha256_file(run_dir / "target-reference.sdf"),
            "evaluatorSourceSha256": sha256_file(run_dir / "target-evaluator.py"),
        }
        write_json(run_dir / "run-manifest.json", run_manifest)
        evaluation = {
            "case_id": "case-a",
            "score": 1.0,
            "passed": True,
            "formula_match": True,
            "topology_match": True,
            "severe_clashes": 0,
            "disconnected_components": 1,
            "failures": [],
            "diagnostics": [],
        }
        manifest = {
            "schemaVersion": 1,
            "relationMode": "required",
            "relationTraceSha256": sha256_file(
                run_dir / "relation" / "relation-trace.json"
            ),
            "certificateRequestSha256": sha256_file(
                run_dir / "relation" / "relation-trace-request.json"
            ),
            "generatedLeanSha256": sha256_file(
                run_dir / "relation" / "GeneratedRelationTrace.lean"
            ),
            "formalVerdictSha256": sha256_file(
                run_dir / "relation" / "formal-verdict.json"
            ),
        }
        return run_dir, evaluation, manifest

    def create_record(
        self,
        run_dir: Path,
        evaluation: dict,
        verification: dict,
    ) -> dict:
        return {
            "runId": "run",
            "createdAt": "2026-08-15T00:00:00Z",
            "gitCommit": None,
            "gitDirty": None,
            "executor": "test-executor",
            "editPlanSha256": sha256_file(run_dir / "edit-plan.json"),
            "referenceSdfSha256": sha256_file(run_dir / "target-reference.sdf"),
            "evaluatorSourceSha256": sha256_file(run_dir / "target-evaluator.py"),
            "executorReturnCode": 4,
            "evaluation": evaluation,
            "candidateSha256": sha256_file(run_dir / "candidate.sdf"),
            "executionReceiptSha256": sha256_file(run_dir / "execution.json"),
            "coordinateTransportReceiptSha256": sha256_file(
                run_dir / "coordinate-transport.json"
            ),
            "relationVerification": {
                "status": "pass",
                "manifestSha256": sha256_file(
                    run_dir / "relation-certificate-manifest.json"
                ),
            },
            "verification": verification,
        }

    def relation_result(self) -> RelationCertificateCheckResult:
        return RelationCertificateCheckResult(
            "pass",
            "lean-relation-satisfied",
            projection_version="runtime-mixed-relation-trace-v2",
            evidence={"checkerClosureSha256": "a" * 64},
        )

    def test_fresh_relation_proof_and_bridge_create_publishable_envelope(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            run_dir, evaluation, manifest = self.create_run(Path(directory))
            with patch(
                "tools.ai_modeling_loop.relation_final_artifact_gate._recheck_relation_manifest",
                return_value=(self.relation_result(), manifest),
            ):
                envelope = verify_relation_final_artifact(
                    run_dir=run_dir,
                    builder_snapshot_path=run_dir / "builder-snapshot.json",
                    identity_map_path=run_dir / "identity-map.json",
                    final_sdf_path=run_dir / "candidate.sdf",
                    coordinate_transport_receipt_path=run_dir / "coordinate-transport.json",
                    evaluation=evaluation,
                    output_dir=run_dir / "verification",
                    target_reference_path=run_dir / "target-reference.sdf",
                    target_evaluator_path=run_dir / "target-evaluator.py",
                )
            self.assertEqual(envelope.status, VerificationStatus.PASS)
            verification = envelope.to_json()
            record = self.create_record(run_dir, evaluation, verification)
            write_json(run_dir / "run.json", record)
            with patch(
                "tools.ai_modeling_loop.relation_final_artifact_gate.load_relation_certificate_manifest",
                return_value=manifest,
            ), patch(
                "tools.ai_modeling_loop.relation_final_artifact_gate._recheck_relation_manifest",
                return_value=(self.relation_result(), manifest),
            ):
                status = archived_relation_publication_status(
                    run_dir,
                    record,
                    envelope,
                )
            self.assertEqual(status, VerificationStatus.PASS)

    def test_publication_rejects_candidate_changed_after_verification(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            run_dir, evaluation, manifest = self.create_run(Path(directory))
            with patch(
                "tools.ai_modeling_loop.relation_final_artifact_gate._recheck_relation_manifest",
                return_value=(self.relation_result(), manifest),
            ):
                envelope = verify_relation_final_artifact(
                    run_dir=run_dir,
                    builder_snapshot_path=run_dir / "builder-snapshot.json",
                    identity_map_path=run_dir / "identity-map.json",
                    final_sdf_path=run_dir / "candidate.sdf",
                    coordinate_transport_receipt_path=run_dir / "coordinate-transport.json",
                    evaluation=evaluation,
                    output_dir=run_dir / "verification",
                    target_reference_path=run_dir / "target-reference.sdf",
                    target_evaluator_path=run_dir / "target-evaluator.py",
                )
            record = self.create_record(run_dir, evaluation, envelope.to_json())
            write_json(run_dir / "run.json", record)
            (run_dir / "candidate.sdf").write_text("tampered\n", encoding="utf-8")
            with patch(
                "tools.ai_modeling_loop.relation_final_artifact_gate.load_relation_certificate_manifest",
                return_value=manifest,
            ):
                with self.assertRaisesRegex(RelationFinalArtifactError, "binding mismatch"):
                    archived_relation_publication_status(run_dir, record, envelope)

    def test_relation_certificate_cannot_be_spliced_onto_another_builder_snapshot(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            run_dir, evaluation, manifest = self.create_run(Path(directory))
            snapshot = json.loads((run_dir / "builder-snapshot.json").read_text())
            snapshot["molecule"]["atoms"][1]["position"] = [2.4, 0.0, 0.0]
            write_json(run_dir / "builder-snapshot.json", snapshot)
            execution = json.loads((run_dir / "execution.json").read_text())
            execution["builderSnapshotSha256"] = sha256_file(
                run_dir / "builder-snapshot.json"
            )
            write_json(run_dir / "execution.json", execution)
            with patch(
                "tools.ai_modeling_loop.relation_final_artifact_gate._recheck_relation_manifest",
                return_value=(self.relation_result(), manifest),
            ):
                envelope = verify_relation_final_artifact(
                    run_dir=run_dir,
                    builder_snapshot_path=run_dir / "builder-snapshot.json",
                    identity_map_path=run_dir / "identity-map.json",
                    final_sdf_path=run_dir / "candidate.sdf",
                    coordinate_transport_receipt_path=run_dir / "coordinate-transport.json",
                    evaluation=evaluation,
                    output_dir=run_dir / "verification",
                    target_reference_path=run_dir / "target-reference.sdf",
                    target_evaluator_path=run_dir / "target-evaluator.py",
                )
            self.assertEqual(envelope.status, VerificationStatus.REJECT)
            self.assertEqual(
                envelope.axes["execution"].code,
                "relation-terminal-snapshot-mismatch",
            )

    def test_publication_preserves_fresh_relation_reject(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            run_dir, evaluation, manifest = self.create_run(Path(directory))
            with patch(
                "tools.ai_modeling_loop.relation_final_artifact_gate._recheck_relation_manifest",
                return_value=(self.relation_result(), manifest),
            ):
                envelope = verify_relation_final_artifact(
                    run_dir=run_dir,
                    builder_snapshot_path=run_dir / "builder-snapshot.json",
                    identity_map_path=run_dir / "identity-map.json",
                    final_sdf_path=run_dir / "candidate.sdf",
                    coordinate_transport_receipt_path=run_dir / "coordinate-transport.json",
                    evaluation=evaluation,
                    output_dir=run_dir / "verification",
                    target_reference_path=run_dir / "target-reference.sdf",
                    target_evaluator_path=run_dir / "target-evaluator.py",
                )
            record = {
                "executorReturnCode": 4,
                "evaluation": evaluation,
                "verification": envelope.to_json(),
            }
            write_json(run_dir / "run.json", record)
            with patch(
                "tools.ai_modeling_loop.relation_final_artifact_gate._archived_snapshot_publication_status",
                return_value=VerificationStatus.REJECT,
            ):
                status = archived_relation_publication_status(run_dir, record, envelope)
            self.assertEqual(status, VerificationStatus.REJECT)


if __name__ == "__main__":
    unittest.main()
