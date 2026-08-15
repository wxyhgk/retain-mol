from __future__ import annotations

import unittest

from tools.ai_modeling_loop.execution_evidence import validate_execution_evidence


class ExecutionEvidencePlanSchemaTests(unittest.TestCase):
    @staticmethod
    def validate(command: dict[str, object]):
        return validate_execution_evidence(
            plan={
                "schemaVersion": 1,
                "planId": "plan-a",
                "source": "ai",
                "targetObjectId": "object-a",
                "commands": [command],
            },
            expected_effect={
                "status": "indeterminate",
                "reason": "unsupported-effect-semantics",
            },
            receipt={},
            enforced_plan_sha256="plan-sha",
            expected_effect_sha256="effect-sha",
            executor_output_sha256="output-sha",
        )

    @staticmethod
    def attach_command() -> dict[str, object]:
        return {
            "commandId": "attach-a",
            "kind": "fragment.attach",
            "atomId": "host-h",
            "fragmentId": "benzene",
            "fragmentDigest": f"fragment-v1-sha256-{'a' * 64}",
            "torsionAngleDegrees": 30,
        }

    def test_fragment_attach_requires_content_digest(self) -> None:
        command = self.attach_command()
        del command["fragmentDigest"]

        result = self.validate(command)

        self.assertEqual(result.status, "indeterminate")
        self.assertEqual(result.code, "enforced-plan-invalid")
        self.assertEqual(result.witness["path"], "enforcedPlan.commands[0]")

    def test_fragment_attach_rejects_malformed_content_digest(self) -> None:
        command = self.attach_command()
        command["fragmentDigest"] = "fragment-v1-sha256-not-a-digest"

        result = self.validate(command)

        self.assertEqual(result.status, "indeterminate")
        self.assertEqual(result.code, "enforced-plan-invalid")
        self.assertEqual(
            result.witness["path"],
            "enforcedPlan.commands[0].fragmentDigest",
        )

    def test_fragment_attach_accepts_well_formed_content_digest(self) -> None:
        result = self.validate(self.attach_command())

        self.assertEqual(result.status, "indeterminate")
        self.assertEqual(result.code, "unsupported-effect-semantics")


if __name__ == "__main__":
    unittest.main()
