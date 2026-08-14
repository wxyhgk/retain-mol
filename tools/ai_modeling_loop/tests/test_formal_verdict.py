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
sha256_file = formal_verdict.sha256_file


class FormalVerdictTests(unittest.TestCase):
    def axis(self, status: VerificationStatus, artifact: str = "artifact", policy: str = "policy"):
        return AxisVerdict(
            status=status,
            code=f"test-{status.value}",
            checker="test",
            artifact_sha256=artifact,
            policy_sha256=policy,
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
                axes=axes,
            )
            self.assertEqual(
                envelope.publication_status(artifact),
                VerificationStatus.INDETERMINATE,
            )


if __name__ == "__main__":
    unittest.main()
