from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path
from typing import Any

from tools.ai_modeling_loop.topology_audit import (
    run_topology_audit,
    validate_topology_audit,
)


def valid_audit() -> dict[str, Any]:
    return {
        "elementCounts": {"C": 6},
        "heavyAtomCount": 6,
        "edgeCount": 6,
        "connectedComponentCount": 1,
        "independentCycleRank": 1,
        "implicitHydrogenCount": 6,
        "inferredFormula": "C6H6",
        "fragments": [{
            "name": "benzene",
            "ownedHeavyAtoms": 6,
            "cycleRankContribution": 1,
            "attachments": [],
        }],
        "symmetry": "D6h",
        "ambiguities": [],
    }


class FakeClient:
    def __init__(self, payloads: list[dict[str, Any]]):
        self.payloads = iter(payloads)
        self.prompts: list[str] = []

    def complete_json(self, *, prompt: str, image: Path, **kwargs):
        del image, kwargs
        self.prompts.append(prompt)
        return {"payload": next(self.payloads), "providerResponse": {"choices": []}}


class FlakyClient(FakeClient):
    def __init__(self, payloads: list[dict[str, Any]]):
        super().__init__(payloads)
        self.failed = False

    def complete_json(self, *, prompt: str, image: Path, **kwargs):
        if not self.failed:
            self.failed = True
            self.prompts.append(prompt)
            raise RuntimeError("temporary network failure")
        return super().complete_json(prompt=prompt, image=image, **kwargs)


class TopologyAuditTest(unittest.TestCase):
    def test_validator_accepts_self_consistent_audit(self) -> None:
        result = validate_topology_audit(valid_audit())
        self.assertTrue(result.valid)
        self.assertEqual(result.errors, ())

    def test_validator_rejects_model_claims_when_arithmetic_is_wrong(self) -> None:
        payload = valid_audit()
        payload["heavyAtomCount"] = 8
        payload["independentCycleRank"] = 99
        payload["checkSums"] = {"allCorrect": True}

        result = validate_topology_audit(payload)

        self.assertFalse(result.valid)
        self.assertTrue(any("sum(elementCounts)" in error for error in result.errors))
        self.assertTrue(any("E-V+C" in error for error in result.errors))
        self.assertTrue(any("ownedHeavyAtoms" in error for error in result.errors))

    def test_validator_checks_fragment_cycle_rank_ownership(self) -> None:
        payload = valid_audit()
        payload["fragments"][0]["cycleRankContribution"] = 2

        result = validate_topology_audit(payload)

        self.assertFalse(result.valid)
        self.assertTrue(any("cycleRankContribution" in error for error in result.errors))

    def test_runner_retries_with_external_validation_errors_and_archives_attempts(self) -> None:
        invalid = valid_audit()
        invalid["inferredFormula"] = "C7H6"
        client = FakeClient([invalid, valid_audit()])
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            image = root / "target.png"
            image.write_bytes(b"not decoded by fake client")

            result = run_topology_audit(
                image=image,
                client=client,
                run_id="test-audit",
                max_attempts=2,
                work_dir=root,
            )

            self.assertTrue(result.validation.valid)
            self.assertEqual(result.attempt_count, 2)
            self.assertIn("inferredFormula C count", client.prompts[1])
            self.assertTrue((result.run_dir / "attempt-01" / "validation.json").exists())
            self.assertTrue((result.run_dir / "attempt-02" / "audit.json").exists())
            summary = json.loads((result.run_dir / "result.json").read_text())
            self.assertTrue(summary["validation"]["valid"])

    def test_runner_stops_when_invalid_response_stagnates(self) -> None:
        invalid = valid_audit()
        invalid["heavyAtomCount"] = 7
        client = FakeClient([invalid, invalid, valid_audit()])
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            image = root / "target.png"
            image.write_bytes(b"not decoded by fake client")

            result = run_topology_audit(
                image=image,
                client=client,
                run_id="stagnated-audit",
                max_attempts=3,
                work_dir=root,
            )

            self.assertFalse(result.validation.valid)
            self.assertEqual(result.attempt_count, 2)
            self.assertTrue(any("planner-stagnated" in error for error in result.validation.errors))

    def test_runner_archives_provider_error_and_retries(self) -> None:
        client = FlakyClient([valid_audit()])
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            image = root / "target.png"
            image.write_bytes(b"not decoded by fake client")

            result = run_topology_audit(
                image=image,
                client=client,
                run_id="provider-retry",
                max_attempts=2,
                work_dir=root,
            )

            self.assertTrue(result.validation.valid)
            self.assertEqual(result.attempt_count, 2)
            error = json.loads(
                (result.run_dir / "attempt-01" / "provider-error.json").read_text()
            )
            self.assertEqual(error["type"], "RuntimeError")


if __name__ == "__main__":
    unittest.main()
