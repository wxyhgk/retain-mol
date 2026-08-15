from __future__ import annotations

import json
import subprocess
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
EXECUTOR = REPO_ROOT / "tools" / "ai_modeling_loop" / "retainmol_executor.mjs"
MODELING_DIST = REPO_ROOT / "packages" / "mol-viewer" / "dist" / "public" / "modeling.js"


class RetainMolExecutorIntegrationTests(unittest.TestCase):
    def test_executor_emits_matching_independent_and_production_effects(self) -> None:
        if not MODELING_DIST.is_file():
            self.skipTest("build @retainmol/mol-viewer before running executor integration")

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            initial = root / "initial.json"
            plan = root / "plan.json"
            output = root / "candidate.sdf"
            receipt = root / "execution.json"
            metadata = root / "metadata.json"
            snapshot = root / "builder-snapshot.json"
            identity_map = root / "identity-map.json"
            coordinate_transport = root / "coordinate-transport.json"
            expected_effect = root / "expected-effect.json"
            enforced_plan = root / "enforced-plan.json"

            initial.write_text(json.dumps({
                "schemaVersion": 1,
                "objectId": "integration:molecule",
                "fixedAtomIds": ["atom:C"],
                "molecule": {
                    "name": "executor-integration",
                    "atoms": [{
                        "id": "atom:C",
                        "symbol": "C",
                        "x": 0,
                        "y": 0,
                        "z": 0,
                    }],
                    "bonds": [],
                },
            }))
            plan.write_text(json.dumps({
                "schemaVersion": 1,
                "planId": "integration-plan",
                "source": "ai",
                "targetObjectId": "integration:molecule",
                "commands": [
                    {
                        "commandId": "add-oxygen",
                        "kind": "atom.add",
                        "atomId": "atom:O",
                        "symbol": "O",
                        "position": {"x": 1.3, "y": 0, "z": 0},
                    },
                    {
                        "commandId": "bond-carbon-oxygen",
                        "kind": "bond.add",
                        "bondId": "bond:CO",
                        "atomId1": "atom:C",
                        "atomId2": "atom:O",
                        "order": 2,
                    },
                ],
            }))

            completed = subprocess.run(
                [
                    "node",
                    str(EXECUTOR),
                    "--initial", str(initial),
                    "--plan", str(plan),
                    "--output", str(output),
                    "--receipt", str(receipt),
                    "--metadata", str(metadata),
                    "--snapshot", str(snapshot),
                    "--identity-map", str(identity_map),
                    "--coordinate-transport-receipt", str(coordinate_transport),
                    "--expected-effect", str(expected_effect),
                    "--enforced-plan", str(enforced_plan),
                ],
                cwd=REPO_ROOT,
                capture_output=True,
                text=True,
                timeout=30,
            )
            self.assertEqual(completed.returncode, 0, completed.stderr)

            execution = json.loads(receipt.read_text())
            expected = json.loads(expected_effect.read_text())
            final_snapshot = json.loads(snapshot.read_text())
            identity = json.loads(identity_map.read_text())
            coordinate_receipt = json.loads(coordinate_transport.read_text())

            self.assertEqual(execution["status"], "completed")
            self.assertEqual(execution["effectComparison"], {"verdict": "pass", "mismatches": []})
            self.assertEqual(expected["status"], "compiled")
            self.assertEqual(execution["actualEffectReceipt"]["finalDigest"], expected["finalDigest"])
            self.assertEqual(
                [atom["atomId"] for atom in final_snapshot["molecule"]["atoms"]],
                ["atom:C", "atom:O"],
            )
            self.assertEqual(
                [(row["rowIndex"], row["atomId"]) for row in identity["atomRows"]],
                [(1, "atom:C"), (2, "atom:O")],
            )
            self.assertIn("V2000", output.read_text())
            self.assertEqual(
                [row["atomId"] for row in coordinate_receipt["atomRows"]],
                ["atom:C", "atom:O"],
            )
            self.assertEqual(
                coordinate_receipt["finalSdfSha256"],
                execution["outputSha256"],
            )

    def test_executor_does_not_publish_when_effect_is_indeterminate(self) -> None:
        if not MODELING_DIST.is_file():
            self.skipTest("build @retainmol/mol-viewer before running executor integration")

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            paths = {
                name: root / filename
                for name, filename in {
                    "initial": "initial.json",
                    "plan": "plan.json",
                    "output": "candidate.sdf",
                    "receipt": "execution.json",
                    "metadata": "metadata.json",
                    "snapshot": "builder-snapshot.json",
                    "identity-map": "identity-map.json",
                    "coordinate-transport-receipt": "coordinate-transport.json",
                    "expected-effect": "expected-effect.json",
                    "enforced-plan": "enforced-plan.json",
                }.items()
            }
            paths["initial"].write_text(json.dumps({
                "schemaVersion": 1,
                "objectId": "integration:molecule",
                "molecule": {
                    "atoms": [{
                        "id": "atom:C",
                        "symbol": "C",
                        "x": 0,
                        "y": 0,
                        "z": 0,
                        "charge": 1,
                    }],
                    "bonds": [],
                },
            }))
            paths["plan"].write_text(json.dumps({
                "schemaVersion": 1,
                "planId": "unsupported-effect-plan",
                "source": "ai",
                "targetObjectId": "integration:molecule",
                "commands": [{
                    "commandId": "set-charge",
                    "kind": "atom.setCharge",
                    "atomId": "atom:C",
                    "charge": 1,
                }],
            }))
            arguments = ["node", str(EXECUTOR)]
            for name, path in paths.items():
                arguments.extend([f"--{name}", str(path)])
            completed = subprocess.run(
                arguments,
                cwd=REPO_ROOT,
                capture_output=True,
                text=True,
                timeout=30,
            )

            self.assertEqual(completed.returncode, 4, completed.stderr)
            execution = json.loads(paths["receipt"].read_text())
            self.assertEqual(execution["status"], "indeterminate")
            self.assertEqual(execution["effectComparison"]["verdict"], "indeterminate")
            expected = json.loads(paths["expected-effect"].read_text())
            enforced_plan = json.loads(paths["enforced-plan"].read_text())
            self.assertEqual(expected["status"], "indeterminate")
            self.assertEqual(enforced_plan["planId"], "unsupported-effect-plan")
            self.assertEqual(
                execution["actualEffectReceipt"]["planId"],
                "unsupported-effect-plan",
            )
            self.assertEqual(
                execution["actualEffectReceipt"]["finalDigest"],
                execution["actualEffectReceipt"]["commands"][0]["postDigest"],
            )
            self.assertEqual(
                execution["actualEffectReceipt"]["baseDigest"],
                execution["actualEffectReceipt"]["commands"][0]["preDigest"],
            )
            self.assertEqual(
                [
                    command["commandId"]
                    for command in execution["actualEffectReceipt"]["commands"]
                ],
                ["set-charge"],
            )
            self.assertNotEqual(
                execution["actualEffectReceipt"]["finalDigest"],
                execution["actualEffectReceipt"]["baseDigest"],
            )
            self.assertFalse(paths["output"].exists())
            self.assertFalse(paths["metadata"].exists())
            self.assertFalse(paths["snapshot"].exists())
            self.assertFalse(paths["identity-map"].exists())
            self.assertFalse(paths["coordinate-transport-receipt"].exists())


if __name__ == "__main__":
    unittest.main()
