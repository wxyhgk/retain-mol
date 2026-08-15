from __future__ import annotations

import json
import os
import subprocess
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
EXECUTOR = REPO_ROOT / "tools" / "ai_modeling_loop" / "retainmol_executor.mjs"
PROJECTOR = REPO_ROOT / "tools" / "ai_modeling_loop" / "relation_trace_projector.mjs"
PROJECTOR_IO = REPO_ROOT / "tools" / "ai_modeling_loop" / "relation_trace_projector_io.mjs"
MODELING_DIST = REPO_ROOT / "packages" / "mol-viewer" / "dist" / "public" / "modeling.js"


def molecule_payload(*, with_handedness: bool = True) -> dict:
    atoms = [
        {"id": "F", "symbol": "C", "x": 0, "y": 0, "z": 0},
        {"id": "M", "symbol": "C", "x": 1, "y": 0, "z": 0},
        {"id": "R", "symbol": "C", "x": 1, "y": 1, "z": 0},
    ]
    bonds = [
        {"id": "FM", "atomId1": "F", "atomId2": "M", "order": 1},
        {"id": "MR", "atomId1": "M", "atomId2": "R", "order": 1},
    ]
    if with_handedness:
        atoms.append({"id": "H", "symbol": "C", "x": 1, "y": 0, "z": 1})
        bonds.append({"id": "MH", "atomId1": "M", "atomId2": "H", "order": 1})
    return {"atoms": atoms, "bonds": bonds}


def rotate_plan(*, command_count: int = 1, reverse_axis: bool = False) -> dict:
    commands = []
    for index in range(command_count):
        commands.append({
            "commandId": f"rotate-{index + 1}",
            "kind": "geometry.rotateGroup",
            "atomIds": ["R", "H"],
            "axisAtomId1": "M" if reverse_axis else "F",
            "axisAtomId2": "F" if reverse_axis else "M",
            "angleDegrees": 90,
        })
    return {
        "schemaVersion": 1,
        "planId": "rotate-plan",
        "source": "ai",
        "targetObjectId": "relation:molecule",
        "commands": commands,
    }


def reverse_object_fields(value):
    if isinstance(value, dict):
        return {
            key: reverse_object_fields(value[key])
            for key in reversed(list(value))
        }
    if isinstance(value, list):
        return [reverse_object_fields(item) for item in value]
    return value


class RelationTraceProjectorTests(unittest.TestCase):
    def setUp(self) -> None:
        if not MODELING_DIST.is_file():
            self.skipTest("build @retainmol/mol-viewer before running projector integration")

    def create_executor_artifacts(
        self,
        root: Path,
        *,
        molecule: dict | None = None,
        plan: dict | None = None,
    ) -> dict[str, Path]:
        paths = {
            name: root / filename
            for name, filename in {
                "initial": "initial.json",
                "plan": "submitted-plan.json",
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
            "objectId": "relation:molecule",
            "fixedAtomIds": ["F"],
            "molecule": molecule or molecule_payload(),
        }))
        paths["plan"].write_text(json.dumps(plan or rotate_plan()))
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
        self.assertFalse(paths["output"].exists())
        return paths

    def project(self, paths: dict[str, Path], output: Path) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [
                "node", str(PROJECTOR),
                "--initial", str(paths["initial"]),
                "--enforced-plan", str(paths["enforced-plan"]),
                "--execution-receipt", str(paths["receipt"]),
                "--output", str(output),
            ],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            timeout=30,
        )

    def test_projects_two_step_rotate_trace_from_trusted_replay(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            paths = self.create_executor_artifacts(root, plan=rotate_plan(command_count=2))
            output = root / "relation-trace.json"
            completed = self.project(paths, output)
            self.assertEqual(completed.returncode, 0, completed.stderr)

            projected = json.loads(output.read_text())
            self.assertEqual(projected["projectionVersion"], "runtime-rotate-relation-trace-v1")
            self.assertEqual(projected["coordinateScale"], 1000)
            self.assertEqual(len(projected["steps"]), 2)
            self.assertEqual(
                [receipt["commandId"] for receipt in projected["expectedReceipts"]],
                ["rotate-1", "rotate-2"],
            )
            first = projected["steps"][0]
            self.assertEqual(first["witness"]["axisBondId"], "FM")
            self.assertEqual(first["witness"]["fixedAxisAtomId"], "F")
            self.assertEqual(first["witness"]["movingAxisAtomId"], "M")
            radial = first["witness"]["region"]["frame"]["radialAtomId"]
            handedness = first["witness"]["region"]["handednessAtomId"]
            self.assertIn(radial, {"H", "R"})
            self.assertIn(handedness, {"H", "R"})
            self.assertNotEqual(radial, handedness)
            self.assertEqual(first["witness"]["turn"]["sineSign"], "positive")
            self.assertEqual(first["receipt"]["preDigest"], projected["identity"]["baseDigest"])
            self.assertEqual(
                projected["steps"][0]["receipt"]["postDigest"],
                projected["steps"][1]["receipt"]["preDigest"],
            )
            self.assertEqual(projected["steps"][-1]["after"], projected["final"])

    def test_reverses_signed_angle_when_runtime_axis_is_reversed(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            paths = self.create_executor_artifacts(root, plan=rotate_plan(reverse_axis=True))
            output = root / "relation-trace.json"
            completed = self.project(paths, output)
            self.assertEqual(completed.returncode, 0, completed.stderr)
            projected = json.loads(output.read_text())
            self.assertEqual(projected["steps"][0]["witness"]["turn"]["sineSign"], "negative")

    def test_rejects_modified_enforced_plan_bytes(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            paths = self.create_executor_artifacts(root)
            paths["enforced-plan"].write_text(paths["enforced-plan"].read_text() + "\n")
            output = root / "relation-trace.json"
            completed = self.project(paths, output)
            self.assertEqual(completed.returncode, 3, completed.stderr)
            self.assertEqual(json.loads(output.read_text())["code"], "plan-digest-mismatch")

    def test_output_cannot_overwrite_an_input_file(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            paths = self.create_executor_artifacts(root)
            original = paths["initial"].read_bytes()
            completed = self.project(paths, paths["initial"])
            self.assertEqual(completed.returncode, 1, completed.stderr)
            self.assertEqual(paths["initial"].read_bytes(), original)

    def test_output_symlink_cannot_overwrite_an_input_file(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            paths = self.create_executor_artifacts(root)
            original = paths["initial"].read_bytes()
            output = root / "alias.json"
            output.symlink_to(paths["initial"])
            completed = self.project(paths, output)
            self.assertEqual(completed.returncode, 1, completed.stderr)
            self.assertEqual(paths["initial"].read_bytes(), original)

    def test_output_hardlink_cannot_overwrite_an_input_file(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            paths = self.create_executor_artifacts(root)
            original = paths["initial"].read_bytes()
            output = root / "alias.json"
            os.link(paths["initial"], output)
            completed = self.project(paths, output)
            self.assertEqual(completed.returncode, 1, completed.stderr)
            self.assertEqual(paths["initial"].read_bytes(), original)

    def test_fifo_input_is_rejected_without_blocking(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            fifo = root / "initial.fifo"
            os.mkfifo(fifo)
            output = root / "relation-trace.json"
            completed = subprocess.run(
                [
                    "node", str(PROJECTOR),
                    "--initial", str(fifo),
                    "--enforced-plan", str(fifo),
                    "--execution-receipt", str(fifo),
                    "--output", str(output),
                ],
                cwd=REPO_ROOT,
                capture_output=True,
                text=True,
                timeout=5,
            )
            self.assertEqual(completed.returncode, 3, completed.stderr)
            self.assertEqual(json.loads(output.read_text())["code"], "invalid-input-file")

    def test_io_module_parses_cli_arguments_and_rejects_duplicates(self) -> None:
        script = f"""
          import {{ parseArgs }} from {json.dumps(PROJECTOR_IO.as_uri())}
          const parsed = parseArgs([
            '--initial', 'initial.json',
            '--enforced-plan', 'plan.json',
            '--execution-receipt', 'receipt.json',
            '--output', 'trace.json',
          ])
          if (parsed['enforced-plan'] !== 'plan.json') process.exit(2)
          try {{
            parseArgs([
              '--initial', 'first.json', '--initial', 'second.json',
              '--enforced-plan', 'plan.json',
              '--execution-receipt', 'receipt.json',
              '--output', 'trace.json',
            ])
            process.exit(3)
          }} catch (error) {{
            if (error.message !== '重复参数：--initial') process.exit(4)
          }}
        """
        completed = subprocess.run(
            ["node", "--input-type=module", "-e", script],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            timeout=10,
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)

    def test_io_module_rejects_utf8_bom_for_every_projector_input(self) -> None:
        script = f"""
          import {{ decodeUtf8, RelationTraceInputFileError }} from {json.dumps(PROJECTOR_IO.as_uri())}
          const bomDocument = Uint8Array.from([0xef, 0xbb, 0xbf, 0x7b, 0x7d])
          for (const label of ['initial', 'enforced plan', 'execution receipt']) {{
            try {{
              decodeUtf8(bomDocument, label)
              process.exit(2)
            }} catch (error) {{
              if (!(error instanceof RelationTraceInputFileError)) process.exit(3)
              if (error.code !== 'invalid-utf8') process.exit(4)
            }}
          }}
        """
        completed = subprocess.run(
            ["node", "--input-type=module", "-e", script],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            timeout=10,
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)

    def test_strict_json_uses_own_fields_and_rejects_unsafe_numbers(self) -> None:
        script = """
          import { parseStrictJson } from './tools/ai_modeling_loop/strict_json.mjs'
          const value = parseStrictJson('{"__proto__":{"planId":"forged"},"safe":1}')
          if (Object.getPrototypeOf(value) !== null) process.exit(2)
          if (!Object.hasOwn(value, '__proto__') || value.planId !== undefined) process.exit(3)
          for (const source of ['{"value":-0}', '{"value":9007199254740993}', '{"value":"\\\\ud800"}']) {
            try { parseStrictJson(source); process.exit(4) } catch {}
          }
        """
        completed = subprocess.run(
            ["node", "--input-type=module", "-e", script],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            timeout=10,
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)

    def test_rejects_forged_per_command_receipt(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            paths = self.create_executor_artifacts(root)
            receipt = json.loads(paths["receipt"].read_text())
            receipt["actualEffectReceipt"]["commands"][0]["postDigest"] = "forged"
            paths["receipt"].write_text(json.dumps(receipt))
            output = root / "relation-trace.json"
            completed = self.project(paths, output)
            self.assertEqual(completed.returncode, 3, completed.stderr)
            self.assertEqual(json.loads(output.read_text())["code"], "effect-receipt-mismatch")

    def test_accepts_semantically_equal_receipt_with_reordered_fields(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            paths = self.create_executor_artifacts(root)
            receipt = reverse_object_fields(json.loads(paths["receipt"].read_text()))
            paths["receipt"].write_text(json.dumps(receipt))
            output = root / "relation-trace.json"
            completed = self.project(paths, output)
            self.assertEqual(completed.returncode, 0, completed.stderr)

    def test_rejects_duplicate_json_fields(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            paths = self.create_executor_artifacts(root)
            original = paths["receipt"].read_text().strip()
            paths["receipt"].write_text('{"schemaVersion":1,"schemaVersion":1,"ignored":' + original + '}')
            output = root / "relation-trace.json"
            completed = self.project(paths, output)
            self.assertEqual(completed.returncode, 3, completed.stderr)
            self.assertEqual(json.loads(output.read_text())["code"], "invalid-json")

    def test_marks_non_relation_plan_indeterminate_without_consuming_witnesses(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            paths = {
                "initial": root / "initial.json",
                "enforced-plan": root / "plan.json",
                "receipt": root / "execution.json",
            }
            paths["initial"].write_text(json.dumps({
                "schemaVersion": 1,
                "objectId": "relation:molecule",
                "molecule": molecule_payload(),
            }))
            plan = rotate_plan()
            plan["commands"] = [{
                "commandId": "attach",
                "kind": "fragment.attach",
                "atomId": "R",
                "fragmentId": "methyl",
            }]
            paths["enforced-plan"].write_text(json.dumps(plan))
            paths["receipt"].write_text(json.dumps({"callerWitness": {"kind": "rotateGroup"}}))
            output = root / "relation-trace.json"
            completed = self.project(paths, output)
            self.assertEqual(completed.returncode, 4, completed.stderr)
            self.assertEqual(json.loads(output.read_text())["code"], "unsupported-command-set")

    def test_marks_missing_handedness_witness_indeterminate(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            plan = rotate_plan()
            plan["commands"][0]["atomIds"] = ["R"]
            paths = self.create_executor_artifacts(
                root,
                molecule=molecule_payload(with_handedness=False),
                plan=plan,
            )
            output = root / "relation-trace.json"
            completed = self.project(paths, output)
            self.assertEqual(completed.returncode, 4, completed.stderr)
            self.assertEqual(json.loads(output.read_text())["code"], "no-handedness-witness")

    def test_marks_coordinate_on_quantization_tie_indeterminate(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            molecule = molecule_payload()
            molecule["atoms"][0]["x"] = 0.0005
            paths = self.create_executor_artifacts(root, molecule=molecule)
            output = root / "relation-trace.json"
            completed = self.project(paths, output)
            self.assertEqual(completed.returncode, 4, completed.stderr)
            self.assertEqual(json.loads(output.read_text())["code"], "quantization-boundary")

    def test_rejects_invalid_utf8_before_json_or_digest_validation(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            paths = self.create_executor_artifacts(root)
            paths["initial"].write_bytes(b"\xff")
            output = root / "relation-trace.json"
            completed = self.project(paths, output)
            self.assertEqual(completed.returncode, 3, completed.stderr)
            self.assertEqual(json.loads(output.read_text())["code"], "invalid-utf8")

    def test_rejects_oversized_molecule_before_replay(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            initial = root / "initial.json"
            plan = root / "plan.json"
            receipt = root / "receipt.json"
            initial.write_text(json.dumps({
                "schemaVersion": 1,
                "objectId": "relation:molecule",
                "molecule": {
                    "atoms": [
                        {"id": f"A{index}", "symbol": "C", "x": index, "y": 0, "z": 0}
                        for index in range(317)
                    ],
                    "bonds": [],
                },
            }))
            plan.write_text(json.dumps(rotate_plan()))
            receipt.write_text("{}")
            output = root / "relation-trace.json"
            completed = subprocess.run([
                "node", str(PROJECTOR),
                "--initial", str(initial),
                "--enforced-plan", str(plan),
                "--execution-receipt", str(receipt),
                "--output", str(output),
            ], cwd=REPO_ROOT, capture_output=True, text=True, timeout=10)
            self.assertEqual(completed.returncode, 4, completed.stderr)
            self.assertEqual(json.loads(output.read_text())["code"], "resource-limit")


if __name__ == "__main__":
    unittest.main()
