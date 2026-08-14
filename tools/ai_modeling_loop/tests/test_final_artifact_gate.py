from __future__ import annotations

import json
import hashlib
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from rdkit import Chem
from rdkit.Geometry import Point3D

from tools.ai_modeling_loop.artifact_contracts import (
    CoordinateTransportAtomRow,
    coordinate_transport_atom_row_mapping_sha256,
    sha256_file,
)
from tools.ai_modeling_loop.chemistry import load_sdf, write_sdf
from tools.ai_modeling_loop.final_artifact_gate import verify_final_artifact
from tools.ai_modeling_loop.formal_geometry_checker import FormalGeometryCheckResult
from tools.ai_modeling_loop.formal_verdict import VerificationStatus


class FinalArtifactGateTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.snapshot = self.root / "builder-snapshot.json"
        self.identity = self.root / "identity-map.json"
        self.sdf = self.root / "candidate.sdf"
        self.receipt = self.root / "execution.json"
        self.effect = self.root / "expected-effect.json"
        self.plan = self.root / "enforced-plan.json"
        self.out = self.root / "verification"
        self.snapshot.write_text(json.dumps({
            "schemaVersion": 1,
            "coordinateSpace": "angstrom",
            "molecule": {
                "atoms": [
                    {"atomId": "C", "symbol": "C", "position": [0, 0, 0], "formalCharge": 0, "radicalElectrons": 0},
                    {"atomId": "O", "symbol": "O", "position": [1.2, 0, 0], "formalCharge": 0, "radicalElectrons": 0},
                ],
                "bonds": [{"bondId": "CO", "atomId1": "C", "atomId2": "O", "order": 2, "aromatic": False}],
            },
        }))
        self.identity.write_text(json.dumps({
            "schemaVersion": 1,
            "atomRows": [
                {"rowIndex": 1, "atomId": "C", "symbol": "C"},
                {"rowIndex": 2, "atomId": "O", "symbol": "O"},
            ],
            "bondRows": [{"rowIndex": 1, "bondId": "CO", "atomId1": "C", "atomId2": "O", "order": 2}],
        }))
        editable = Chem.RWMol()
        editable.AddAtom(Chem.Atom("C"))
        editable.AddAtom(Chem.Atom("O"))
        editable.AddBond(0, 1, Chem.BondType.DOUBLE)
        molecule = editable.GetMol()
        conformer = Chem.Conformer(2)
        conformer.SetAtomPosition(0, Point3D(0, 0, 0))
        conformer.SetAtomPosition(1, Point3D(1.22, 0, 0))
        molecule.AddConformer(conformer)
        write_sdf(molecule, self.sdf)
        self.plan.write_text(json.dumps({
            "schemaVersion": 1,
            "planId": "plan-a",
            "source": "ai",
            "targetObjectId": "object-a",
            "commands": [
                {
                    "commandId": "move-carbon",
                    "kind": "atom.move",
                    "atomId": "C",
                    "position": {"x": 0, "y": 0, "z": 0},
                },
                {
                    "commandId": "set-co-order",
                    "kind": "bond.setOrder",
                    "bondId": "CO",
                    "order": 2,
                },
            ],
        }))
        expected_receipt = {
            "schemaVersion": 1,
            "planId": "plan-a",
            "baseDigest": "base-a",
            "finalDigest": "final-a",
            "commands": [
                {
                    "commandId": "move-carbon",
                    "kind": "atom.move",
                    "preDigest": "base-a",
                    "postDigest": "after-move-a",
                    "changes": {
                        "atoms": [{
                            "id": "C",
                            "before": {"id": "C", "symbol": "C", "x": -0.1, "y": 0, "z": 0},
                            "after": {"id": "C", "symbol": "C", "x": 0, "y": 0, "z": 0},
                        }],
                        "bonds": [],
                    },
                },
                {
                    "commandId": "set-co-order",
                    "kind": "bond.setOrder",
                    "preDigest": "after-move-a",
                    "postDigest": "final-a",
                    "changes": {
                        "atoms": [],
                        "bonds": [{
                            "id": "CO",
                            "before": {"id": "CO", "atomId1": "C", "atomId2": "O", "order": 1},
                            "after": {"id": "CO", "atomId1": "C", "atomId2": "O", "order": 2},
                        }],
                    },
                },
            ],
        }
        self.effect.write_text(json.dumps({"status": "compiled", **expected_receipt}))
        self.receipt.write_text(json.dumps({
            "schemaVersion": 1,
            "status": "completed",
            "enforcedPlanSha256": self.sha256(self.plan),
            "expectedEffectSha256": self.sha256(self.effect),
            "targetObjectId": "object-a",
            "commandCount": 2,
            "outputSha256": self.sha256(self.sdf),
            "effectComparison": {"verdict": "pass", "mismatches": []},
            "actualEffectReceipt": expected_receipt,
        }))

    def tearDown(self) -> None:
        self.temp.cleanup()

    @staticmethod
    def sha256(path: Path) -> str:
        return hashlib.sha256(path.read_bytes()).hexdigest()

    def refresh_plan_binding(self) -> None:
        receipt = json.loads(self.receipt.read_text())
        receipt["enforcedPlanSha256"] = self.sha256(self.plan)
        self.receipt.write_text(json.dumps(receipt))

    def verify(self, *, evaluation_overrides=None, **kwargs):
        evaluation = {
            "case_id": "case-a",
            "passed": True,
            "score": 1.0,
            "formula_match": True,
            "topology_match": True,
            "severe_clashes": 0,
            "disconnected_components": 1,
            "failures": [],
            "diagnostics": [],
        }
        evaluation.update(evaluation_overrides or {})
        return verify_final_artifact(
            builder_snapshot_path=self.snapshot,
            identity_map_path=self.identity,
            final_sdf_path=self.sdf,
            execution_receipt_path=self.receipt,
            expected_effect_path=self.effect,
            enforced_plan_path=self.plan,
            evaluation=evaluation,
            output_dir=self.out,
            **kwargs,
        )

    @patch("tools.ai_modeling_loop.final_artifact_gate.check_formal_geometry")
    def test_all_three_axes_share_one_context_and_pass(self, check) -> None:
        check.return_value = FormalGeometryCheckResult(
            VerificationStatus.PASS,
            "geometry-policy-satisfied",
        )
        envelope = self.verify()
        self.assertEqual(envelope.status, VerificationStatus.PASS)
        self.assertEqual(envelope.publication_status(self.out / "final-snapshot.json"), VerificationStatus.PASS)
        contexts = {axis.verification_context_sha256 for axis in envelope.axes.values()}
        self.assertEqual(contexts, {envelope.verification_context_sha256})
        self.assertTrue((self.out / "geometry-request.json").exists())

    @patch("tools.ai_modeling_loop.final_artifact_gate.check_formal_geometry")
    def test_direct_output_must_match_executor_receipt(self, check) -> None:
        check.return_value = FormalGeometryCheckResult(
            VerificationStatus.PASS,
            "geometry-policy-satisfied",
        )
        receipt = json.loads(self.receipt.read_text())
        receipt["outputSha256"] = "0" * 64
        self.receipt.write_text(json.dumps(receipt))

        envelope = self.verify()

        self.assertEqual(envelope.axes["execution"].status, VerificationStatus.REJECT)
        self.assertEqual(envelope.axes["execution"].code, "execution-evidence-binding-reject")
        self.assertTrue((self.out / "verification.json").exists())

    @patch("tools.ai_modeling_loop.final_artifact_gate.check_formal_geometry")
    def test_contradictory_target_pass_is_indeterminate(self, check) -> None:
        check.return_value = FormalGeometryCheckResult(
            VerificationStatus.PASS,
            "geometry-policy-satisfied",
        )
        envelope = self.verify(evaluation_overrides={"formula_match": False})
        self.assertEqual(envelope.axes["target"].status, VerificationStatus.INDETERMINATE)
        self.assertEqual(envelope.axes["target"].code, "target-evaluation-inconsistent")

    @patch("tools.ai_modeling_loop.final_artifact_gate.check_formal_geometry")
    def test_untrusted_xtb_transport_is_indeterminate(self, check) -> None:
        envelope = self.verify(transport_evidence={
            "kind": "xtb-coordinate-transport",
            "trusted": False,
            "executableSha256": "abc",
        })
        self.assertEqual(envelope.status, VerificationStatus.INDETERMINATE)
        self.assertEqual(envelope.axes["safety"].code, "untrusted-coordinate-transport")
        check.assert_not_called()

    @patch("tools.ai_modeling_loop.final_artifact_gate.check_formal_geometry")
    def test_xtb_transport_without_bound_provenance_is_indeterminate(self, check) -> None:
        coordinate_receipt = self.root / "coordinate-transport.json"
        source_sdf = self.root / "xtb-input.sdf"
        input_xyz = self.root / "xtb-input.xyz"
        output_xyz = self.root / "xtb-output.xyz"
        source_sdf.write_bytes(self.sdf.read_bytes())
        input_xyz.write_text("2\ninput\nC 0 0 0\nO 1.22 0 0\n")
        output_xyz.write_text("2\noutput\nC 0 0 0\nO 1.22 0 0\n")
        molecule = load_sdf(self.sdf)
        conformer = molecule.GetConformer()
        rows = []
        for index, atom_id in enumerate(("C", "O")):
            position = conformer.GetAtomPosition(index)
            rows.append(CoordinateTransportAtomRow(
                row_index=index + 1,
                atom_id=atom_id,
                symbol=molecule.GetAtomWithIdx(index).GetSymbol(),
                position=(position.x, position.y, position.z),
            ))
        coordinate_receipt.write_text(json.dumps({
            "schemaVersion": 1,
            "kind": "stable-atom-coordinate-transport",
            "builderSnapshotSha256": sha256_file(self.snapshot),
            "identityMapSha256": sha256_file(self.identity),
            "finalSdfSha256": sha256_file(self.sdf),
            "atomRowMappingSha256": coordinate_transport_atom_row_mapping_sha256(rows),
            "atomRows": [
                {
                    "rowIndex": row.row_index,
                    "atomId": row.atom_id,
                    "symbol": row.symbol,
                    "position": list(row.position),
                }
                for row in rows
            ],
        }))
        evidence = {
            "kind": "xtb-coordinate-transport",
            "trusted": True,
            "executableSha256": "a" * 64,
            "sourceSdfSha256": sha256_file(source_sdf),
            "inputXyzSha256": sha256_file(input_xyz),
            "outputXyzSha256": sha256_file(output_xyz),
            "rowOrderContract": "xtb-preserves-input-row-order-v1",
            "postProcessing": "fixed-anchor-frame-projection-v1",
            "coordinateTransportReceiptSha256": sha256_file(coordinate_receipt),
            "fixedAtomRows": [],
        }

        envelope = self.verify(
            coordinate_transport_receipt_path=coordinate_receipt,
            transport_evidence=evidence,
            transport_source_sdf_path=source_sdf,
            transport_input_xyz_path=input_xyz,
            transport_output_xyz_path=output_xyz,
        )

        self.assertEqual(envelope.axes["safety"].status, VerificationStatus.INDETERMINATE)
        self.assertEqual(envelope.axes["safety"].code, "untrusted-coordinate-transport")
        check.assert_not_called()

        receipt_payload = json.loads(coordinate_receipt.read_text())
        receipt_payload["transportProvenance"] = {
            "kind": "xtb-coordinate-transport",
            "sourceSdfSha256": evidence["sourceSdfSha256"],
            "inputXyzSha256": evidence["inputXyzSha256"],
            "outputXyzSha256": evidence["outputXyzSha256"],
            "executableSha256": evidence["executableSha256"],
            "rowOrderContract": evidence["rowOrderContract"],
            "postProcessing": evidence["postProcessing"],
            "fixedAtomRows": [],
        }
        coordinate_receipt.write_text(json.dumps(receipt_payload))
        evidence["coordinateTransportReceiptSha256"] = sha256_file(coordinate_receipt)
        check.return_value = FormalGeometryCheckResult(
            VerificationStatus.PASS,
            "geometry-policy-satisfied",
        )

        trusted_envelope = self.verify(
            coordinate_transport_receipt_path=coordinate_receipt,
            transport_evidence=evidence,
            transport_source_sdf_path=source_sdf,
            transport_input_xyz_path=input_xyz,
            transport_output_xyz_path=output_xyz,
        )

        self.assertEqual(trusted_envelope.axes["safety"].status, VerificationStatus.PASS)
        check.assert_called_once()

        output_xyz.write_text("2\noutput\nC 0 0 0\nO 1.8 0 0\n")
        receipt_payload["transportProvenance"]["outputXyzSha256"] = sha256_file(output_xyz)
        coordinate_receipt.write_text(json.dumps(receipt_payload))
        evidence["outputXyzSha256"] = sha256_file(output_xyz)
        evidence["coordinateTransportReceiptSha256"] = sha256_file(coordinate_receipt)

        unrelated_coordinates = self.verify(
            coordinate_transport_receipt_path=coordinate_receipt,
            transport_evidence=evidence,
            transport_source_sdf_path=source_sdf,
            transport_input_xyz_path=input_xyz,
            transport_output_xyz_path=output_xyz,
        )

        self.assertEqual(
            unrelated_coordinates.axes["safety"].status,
            VerificationStatus.INDETERMINATE,
        )
        self.assertEqual(
            unrelated_coordinates.axes["safety"].code,
            "untrusted-coordinate-transport",
        )

    @patch("tools.ai_modeling_loop.final_artifact_gate.check_formal_geometry")
    def test_execution_mismatch_rejects_even_when_geometry_passes(self, check) -> None:
        check.return_value = FormalGeometryCheckResult(
            VerificationStatus.PASS,
            "geometry-policy-satisfied",
        )
        receipt = json.loads(self.receipt.read_text())
        receipt["actualEffectReceipt"]["finalDigest"] = "wrong"
        receipt["effectComparison"] = {"verdict": "reject", "mismatches": [{"code": "final"}]}
        self.receipt.write_text(json.dumps(receipt))
        envelope = self.verify()
        self.assertEqual(envelope.status, VerificationStatus.REJECT)
        self.assertEqual(envelope.axes["execution"].status, VerificationStatus.REJECT)

    @patch("tools.ai_modeling_loop.final_artifact_gate.check_formal_geometry")
    def test_reordered_actual_receipt_is_rejected_despite_reported_pass(self, check) -> None:
        check.return_value = FormalGeometryCheckResult(
            VerificationStatus.PASS,
            "geometry-policy-satisfied",
        )
        receipt = json.loads(self.receipt.read_text())
        receipt["actualEffectReceipt"]["commands"].reverse()
        self.receipt.write_text(json.dumps(receipt))

        envelope = self.verify()

        self.assertEqual(envelope.status, VerificationStatus.REJECT)
        self.assertEqual(envelope.axes["execution"].code, "effect-plan-binding-reject")
        self.assertIn("actualEffectReceipt.commands[0]", envelope.axes["execution"].witness["path"])

    @patch("tools.ai_modeling_loop.final_artifact_gate.check_formal_geometry")
    def test_reordered_enforced_commands_are_rejected(self, check) -> None:
        check.return_value = FormalGeometryCheckResult(
            VerificationStatus.PASS,
            "geometry-policy-satisfied",
        )
        plan = json.loads(self.plan.read_text())
        plan["commands"].reverse()
        self.plan.write_text(json.dumps(plan))
        self.refresh_plan_binding()

        envelope = self.verify()

        self.assertEqual(envelope.status, VerificationStatus.REJECT)
        self.assertEqual(envelope.axes["execution"].code, "effect-plan-binding-reject")
        self.assertIn("commands[0]", envelope.axes["execution"].witness["path"])

    @patch("tools.ai_modeling_loop.final_artifact_gate.check_formal_geometry")
    def test_tampered_parameter_is_rejected_even_with_updated_plan_hash(self, check) -> None:
        check.return_value = FormalGeometryCheckResult(
            VerificationStatus.PASS,
            "geometry-policy-satisfied",
        )
        plan = json.loads(self.plan.read_text())
        plan["commands"][0]["position"]["x"] = 0.25
        self.plan.write_text(json.dumps(plan))
        self.refresh_plan_binding()

        envelope = self.verify()

        self.assertEqual(envelope.status, VerificationStatus.REJECT)
        self.assertEqual(envelope.axes["execution"].code, "effect-plan-binding-reject")
        self.assertIn("changes", envelope.axes["execution"].witness["path"])

    @patch("tools.ai_modeling_loop.final_artifact_gate.check_formal_geometry")
    def test_tampered_plan_id_is_rejected_even_with_updated_plan_hash(self, check) -> None:
        check.return_value = FormalGeometryCheckResult(
            VerificationStatus.PASS,
            "geometry-policy-satisfied",
        )
        plan = json.loads(self.plan.read_text())
        plan["planId"] = "other-plan"
        self.plan.write_text(json.dumps(plan))
        self.refresh_plan_binding()

        envelope = self.verify()

        self.assertEqual(envelope.status, VerificationStatus.REJECT)
        self.assertEqual(envelope.axes["execution"].code, "effect-plan-binding-reject")
        self.assertEqual(envelope.axes["execution"].witness["path"], "expectedEffect.planId")

    @patch("tools.ai_modeling_loop.final_artifact_gate.check_formal_geometry")
    def test_empty_enforced_plan_is_indeterminate(self, check) -> None:
        check.return_value = FormalGeometryCheckResult(
            VerificationStatus.PASS,
            "geometry-policy-satisfied",
        )
        plan = json.loads(self.plan.read_text())
        plan["commands"] = []
        self.plan.write_text(json.dumps(plan))
        self.refresh_plan_binding()

        envelope = self.verify()

        self.assertEqual(envelope.status, VerificationStatus.INDETERMINATE)
        self.assertEqual(envelope.axes["execution"].code, "enforced-plan-invalid")
        self.assertEqual(envelope.axes["execution"].witness["path"], "enforcedPlan.commands")

    @patch("tools.ai_modeling_loop.final_artifact_gate.check_formal_geometry")
    def test_enforced_plan_with_unknown_field_is_indeterminate(self, check) -> None:
        check.return_value = FormalGeometryCheckResult(
            VerificationStatus.PASS,
            "geometry-policy-satisfied",
        )
        plan = json.loads(self.plan.read_text())
        plan["commands"][0]["unvalidatedParameter"] = True
        self.plan.write_text(json.dumps(plan))
        self.refresh_plan_binding()

        envelope = self.verify()

        self.assertEqual(envelope.status, VerificationStatus.INDETERMINATE)
        self.assertEqual(envelope.axes["execution"].code, "enforced-plan-invalid")
        self.assertIn("commands[0]", envelope.axes["execution"].witness["path"])

    @patch("tools.ai_modeling_loop.final_artifact_gate.check_formal_geometry")
    def test_enforced_plan_with_malformed_types_is_indeterminate(self, check) -> None:
        check.return_value = FormalGeometryCheckResult(
            VerificationStatus.PASS,
            "geometry-policy-satisfied",
        )
        plan = json.loads(self.plan.read_text())
        plan["source"] = []
        self.plan.write_text(json.dumps(plan))
        self.refresh_plan_binding()

        envelope = self.verify()

        self.assertEqual(envelope.status, VerificationStatus.INDETERMINATE)
        self.assertEqual(envelope.axes["execution"].code, "enforced-plan-invalid")
        self.assertEqual(envelope.axes["execution"].witness["path"], "enforcedPlan.source")

    @patch("tools.ai_modeling_loop.final_artifact_gate.check_formal_geometry")
    def test_unsupported_effect_is_indeterminate(self, check) -> None:
        self.effect.write_text(json.dumps({
            "status": "indeterminate",
            "reason": "unsupported-effect-semantics",
            "message": "fragment.attach is not modeled",
        }))
        check.return_value = FormalGeometryCheckResult(
            VerificationStatus.PASS,
            "geometry-policy-satisfied",
        )
        envelope = self.verify()
        self.assertEqual(envelope.status, VerificationStatus.INDETERMINATE)
        self.assertEqual(envelope.axes["execution"].code, "unsupported-effect-semantics")

    @patch("tools.ai_modeling_loop.final_artifact_gate.check_formal_geometry")
    def test_self_reported_pass_with_mismatches_is_rejected(self, check) -> None:
        check.return_value = FormalGeometryCheckResult(
            VerificationStatus.PASS,
            "geometry-policy-satisfied",
        )
        receipt = json.loads(self.receipt.read_text())
        receipt["effectComparison"] = {
            "verdict": "pass",
            "mismatches": [{"code": "final-digest-mismatch"}],
        }
        self.receipt.write_text(json.dumps(receipt))
        envelope = self.verify()
        self.assertEqual(envelope.status, VerificationStatus.REJECT)
        self.assertEqual(
            envelope.axes["execution"].code,
            "effect-comparison-self-report-inconsistent",
        )

    @patch("tools.ai_modeling_loop.final_artifact_gate.check_formal_geometry")
    def test_inconsistent_target_pass_is_indeterminate(self, check) -> None:
        check.return_value = FormalGeometryCheckResult(
            VerificationStatus.PASS,
            "geometry-policy-satisfied",
        )
        evaluation = {
            "case_id": "case-a",
            "passed": True,
            "score": 1.0,
            "formula_match": True,
            "topology_match": True,
            "severe_clashes": 0,
            "disconnected_components": 0,
            "failures": ["candidate-invalid"],
            "diagnostics": [],
        }
        envelope = verify_final_artifact(
            builder_snapshot_path=self.snapshot,
            identity_map_path=self.identity,
            final_sdf_path=self.sdf,
            execution_receipt_path=self.receipt,
            expected_effect_path=self.effect,
            enforced_plan_path=self.plan,
            evaluation=evaluation,
            output_dir=self.out,
        )
        self.assertEqual(envelope.status, VerificationStatus.INDETERMINATE)
        self.assertEqual(
            envelope.axes["target"].code,
            "target-evaluator-infrastructure-failure",
        )

    @patch("tools.ai_modeling_loop.final_artifact_gate.check_formal_geometry")
    def test_non_object_execution_evidence_is_indeterminate(self, check) -> None:
        check.return_value = FormalGeometryCheckResult(
            VerificationStatus.PASS,
            "geometry-policy-satisfied",
        )
        self.receipt.write_text(json.dumps([]))
        envelope = self.verify()
        self.assertEqual(envelope.status, VerificationStatus.INDETERMINATE)
        self.assertEqual(envelope.axes["execution"].code, "execution-evidence-invalid")
        self.assertFalse(envelope.axes["execution"].witness["receiptIsObject"])


if __name__ == "__main__":
    unittest.main()
