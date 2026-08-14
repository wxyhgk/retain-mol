from __future__ import annotations

import tempfile
import unittest
import importlib.util
import sys
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parents[1] / "formal_verdict.py"
SPEC = importlib.util.spec_from_file_location("formal_verdict", MODULE_PATH)
assert SPEC and SPEC.loader
formal_verdict = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = formal_verdict
SPEC.loader.exec_module(formal_verdict)

AxisVerdict = formal_verdict.AxisVerdict
VerificationEnvelope = formal_verdict.VerificationEnvelope
VerificationStatus = formal_verdict.VerificationStatus
combine_axis_statuses = formal_verdict.combine_axis_statuses
parse_verification_envelope = formal_verdict.parse_verification_envelope
sha256_file = formal_verdict.sha256_file


class FormalVerdictTests(unittest.TestCase):
    def axis(
        self,
        status: VerificationStatus,
        artifact: str = "artifact",
        policy: str = "policy",
        context: str = "context",
    ):
        return AxisVerdict(
            status=status,
            code=f"test-{status.value}",
            checker="test",
            artifact_sha256=artifact,
            policy_sha256=policy,
            verification_context_sha256=context,
        )

    def test_all_three_axes_must_explicitly_pass(self):
        axes = {name: self.axis(VerificationStatus.PASS) for name in ("execution", "safety", "target")}
        self.assertEqual(combine_axis_statuses(axes), VerificationStatus.PASS)
        axes.pop("target")
        self.assertEqual(combine_axis_statuses(axes), VerificationStatus.INDETERMINATE)

    def test_reject_dominates_indeterminate(self):
        axes = {
            "execution": self.axis(VerificationStatus.INDETERMINATE),
            "safety": self.axis(VerificationStatus.REJECT),
            "target": self.axis(VerificationStatus.PASS),
        }
        self.assertEqual(combine_axis_statuses(axes), VerificationStatus.REJECT)

    def test_final_artifact_hash_is_rechecked_at_publication(self):
        with tempfile.TemporaryDirectory() as directory:
            artifact = Path(directory) / "candidate.sdf"
            artifact.write_text("final-v1")
            digest = sha256_file(artifact)
            axes = {
                name: self.axis(VerificationStatus.PASS, artifact=digest)
                for name in ("execution", "safety", "target")
            }
            envelope = VerificationEnvelope(
                artifact_sha256=digest,
                policy_sha256="policy",
                expected_graph_sha256="expected",
                enforced_plan_sha256="plan",
                verifier_version="test-v1",
                verification_context_sha256="context",
                axes=axes,
            )
            self.assertEqual(envelope.publication_status(artifact), VerificationStatus.PASS)
            artifact.write_text("mutated-after-verification")
            self.assertEqual(
                envelope.publication_status(artifact),
                VerificationStatus.INDETERMINATE,
            )

    def test_axis_hash_mismatch_is_indeterminate(self):
        with tempfile.TemporaryDirectory() as directory:
            artifact = Path(directory) / "candidate.sdf"
            artifact.write_text("final")
            digest = sha256_file(artifact)
            axes = {
                "execution": self.axis(VerificationStatus.PASS, artifact=digest),
                "safety": self.axis(VerificationStatus.PASS, artifact="wrong"),
                "target": self.axis(VerificationStatus.PASS, artifact=digest),
            }
            envelope = VerificationEnvelope(
                artifact_sha256=digest,
                policy_sha256="policy",
                expected_graph_sha256="expected",
                enforced_plan_sha256="plan",
                verifier_version="test-v1",
                verification_context_sha256="context",
                axes=axes,
            )
            self.assertEqual(
                envelope.publication_status(artifact),
                VerificationStatus.INDETERMINATE,
            )

    def test_axis_context_mismatch_is_indeterminate(self):
        with tempfile.TemporaryDirectory() as directory:
            artifact = Path(directory) / "candidate.sdf"
            artifact.write_text("final")
            digest = sha256_file(artifact)
            axes = {
                "execution": self.axis(VerificationStatus.PASS, artifact=digest),
                "safety": self.axis(
                    VerificationStatus.PASS,
                    artifact=digest,
                    context="different-context",
                ),
                "target": self.axis(VerificationStatus.PASS, artifact=digest),
            }
            envelope = VerificationEnvelope(
                artifact_sha256=digest,
                policy_sha256="policy",
                expected_graph_sha256="expected",
                enforced_plan_sha256="plan",
                verifier_version="test-v2",
                verification_context_sha256="context",
                axes=axes,
            )
            self.assertEqual(
                envelope.publication_status(artifact),
                VerificationStatus.INDETERMINATE,
            )

    def test_envelope_round_trip_uses_strict_schema(self):
        axes = {
            name: self.axis(VerificationStatus.PASS)
            for name in ("execution", "safety", "target")
        }
        envelope = VerificationEnvelope(
            artifact_sha256="artifact",
            policy_sha256="policy",
            expected_graph_sha256="expected",
            enforced_plan_sha256="plan",
            verifier_version="test-v2",
            verification_context_sha256="context",
            axes=axes,
        )
        parsed = parse_verification_envelope(envelope.to_json())
        self.assertEqual(parsed.to_json(), envelope.to_json())

    def test_envelope_rejects_status_axis_mismatch(self):
        axes = {
            name: self.axis(VerificationStatus.PASS)
            for name in ("execution", "safety", "target")
        }
        value = VerificationEnvelope(
            artifact_sha256="artifact",
            policy_sha256="policy",
            expected_graph_sha256="expected",
            enforced_plan_sha256="plan",
            verifier_version="test-v2",
            verification_context_sha256="context",
            axes=axes,
        ).to_json()
        value["status"] = "reject"
        with self.assertRaisesRegex(ValueError, "does not match"):
            parse_verification_envelope(value)

    def test_envelope_rejects_coerced_axis_fields_and_unknown_fields(self):
        axes = {
            name: self.axis(VerificationStatus.PASS)
            for name in ("execution", "safety", "target")
        }
        value = VerificationEnvelope(
            artifact_sha256="artifact",
            policy_sha256="policy",
            expected_graph_sha256="expected",
            enforced_plan_sha256="plan",
            verifier_version="test-v2",
            verification_context_sha256="context",
            axes=axes,
        ).to_json()
        value["axes"]["execution"]["checker"] = 7
        with self.assertRaisesRegex(ValueError, "non-empty strings"):
            parse_verification_envelope(value)
        value = VerificationEnvelope(
            artifact_sha256="artifact",
            policy_sha256="policy",
            expected_graph_sha256="expected",
            enforced_plan_sha256="plan",
            verifier_version="test-v2",
            verification_context_sha256="context",
            axes=axes,
        ).to_json()
        value["untrustedExtra"] = True
        with self.assertRaisesRegex(ValueError, "invalid schema"):
            parse_verification_envelope(value)


if __name__ == "__main__":
    unittest.main()
