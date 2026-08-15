from __future__ import annotations

import copy
import importlib.util
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = ROOT.parents[1]
TOOLS = ROOT / "tools"
sys.path.insert(0, str(TOOLS))
MODULE_PATH = TOOLS / "relation_trace_json_to_lean.py"
SPEC = importlib.util.spec_from_file_location("relation_trace_json_to_lean", MODULE_PATH)
assert SPEC and SPEC.loader
relation_trace_json_to_lean = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(relation_trace_json_to_lean)

EXECUTOR = REPO_ROOT / "tools" / "ai_modeling_loop" / "retainmol_executor.mjs"
PROJECTOR = REPO_ROOT / "tools" / "ai_modeling_loop" / "relation_trace_projector.mjs"
MODELING_DIST = REPO_ROOT / "packages" / "mol-viewer" / "dist" / "public" / "modeling.js"


def create_projected_trace(root: Path) -> Path:
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
    molecule = {
        "atoms": [
            {"id": "F", "symbol": "C", "x": 0, "y": 0, "z": 0},
            {"id": "M", "symbol": "C", "x": 1, "y": 0, "z": 0},
            {"id": "R", "symbol": "C", "x": 1, "y": 1, "z": 0},
            {"id": "H", "symbol": "C", "x": 1, "y": 0, "z": 1},
        ],
        "bonds": [
            {"id": "FM", "atomId1": "F", "atomId2": "M", "order": 1},
            {"id": "MR", "atomId1": "M", "atomId2": "R", "order": 1},
            {"id": "MH", "atomId1": "M", "atomId2": "H", "order": 1},
        ],
    }
    plan = {
        "schemaVersion": 1,
        "planId": "rotate-plan",
        "source": "ai",
        "targetObjectId": "relation:molecule",
        "commands": [{
            "commandId": f"rotate-{index + 1}",
            "kind": "geometry.rotateGroup",
            "atomIds": ["R", "H"],
            "axisAtomId1": "F",
            "axisAtomId2": "M",
            "angleDegrees": 90,
        } for index in range(2)],
    }
    paths["initial"].write_text(json.dumps({
        "schemaVersion": 1,
        "objectId": "relation:molecule",
        "fixedAtomIds": ["F"],
        "molecule": molecule,
    }), encoding="utf-8")
    paths["plan"].write_text(json.dumps(plan), encoding="utf-8")
    arguments = ["node", str(EXECUTOR)]
    for name, path in paths.items():
        arguments.extend([f"--{name}", str(path)])
    completed = subprocess.run(
        arguments, cwd=REPO_ROOT, capture_output=True, text=True, timeout=30,
    )
    if completed.returncode != 4:
        raise AssertionError(completed.stderr)
    output = root / "relation-trace.json"
    completed = subprocess.run([
        "node", str(PROJECTOR),
        "--initial", str(paths["initial"]),
        "--enforced-plan", str(paths["enforced-plan"]),
        "--execution-receipt", str(paths["receipt"]),
        "--output", str(output),
    ], cwd=REPO_ROOT, capture_output=True, text=True, timeout=30)
    if completed.returncode != 0:
        raise AssertionError(completed.stderr)
    return output


class RelationTraceJsonToLeanTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        if not MODELING_DIST.is_file():
            raise unittest.SkipTest("build @retainmol/mol-viewer before running relation trace tests")
        cls._temporary = tempfile.TemporaryDirectory()
        cls.trace_path = create_projected_trace(Path(cls._temporary.name))
        cls.payload = relation_trace_json_to_lean.load_payload(cls.trace_path)

    @classmethod
    def tearDownClass(cls) -> None:
        cls._temporary.cleanup()

    def valid_payload(self):
        return copy.deepcopy(self.payload)

    def test_generated_relation_trace_compiles_in_lean(self) -> None:
        if shutil.which("lake") is None:
            self.skipTest("lake is not installed")
        output = Path(self._temporary.name) / "GeneratedRelationTrace.lean"
        output.write_text(
            relation_trace_json_to_lean.render_document(self.valid_payload()),
            encoding="utf-8",
        )
        completed = subprocess.run(
            ["lake", "env", "lean", str(output)],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=60,
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)

    def test_runtime_snapshot_and_digest_cannot_be_rebound(self) -> None:
        payload = self.valid_payload()
        payload["steps"][0]["runtimeAfter"]["atoms"][0]["x"] += 1
        payload["steps"][0]["after"]["atoms"][0]["positionUnits"][0] += 1000
        with self.assertRaisesRegex(ValueError, "postDigest does not bind"):
            relation_trace_json_to_lean.render_document(payload)

    def test_formal_snapshot_must_equal_runtime_projection(self) -> None:
        payload = self.valid_payload()
        payload["steps"][0]["after"]["atoms"][0]["positionUnits"][0] += 1
        with self.assertRaisesRegex(ValueError, "runtime snapshot projection"):
            relation_trace_json_to_lean.render_document(payload)

    def test_step_order_and_receipt_order_are_bound(self) -> None:
        payload = self.valid_payload()
        payload["steps"].reverse()
        with self.assertRaisesRegex(ValueError, "does not match expectedReceipts"):
            relation_trace_json_to_lean.render_document(payload)

    def test_fixed_policy_threshold_cannot_be_weakened(self) -> None:
        payload = self.valid_payload()
        payload["steps"][0]["witness"]["region"]["frame"]["minAxisSquared"] = "1"
        with self.assertRaisesRegex(ValueError, "must be fixed"):
            relation_trace_json_to_lean.render_document(payload)

    def test_unknown_trace_field_is_rejected(self) -> None:
        payload = self.valid_payload()
        payload["steps"][0]["callerWitness"] = {}
        with self.assertRaisesRegex(ValueError, "unknown fields"):
            relation_trace_json_to_lean.render_document(payload)

    def test_duplicate_json_field_is_rejected(self) -> None:
        duplicate = Path(self._temporary.name) / "duplicate.json"
        duplicate.write_text('{"schemaVersion":1,"schemaVersion":1}', encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "duplicate JSON field"):
            relation_trace_json_to_lean.load_payload(duplicate)

    def test_oversized_trace_is_rejected_before_parsing(self) -> None:
        oversized = Path(self._temporary.name) / "oversized.json"
        with oversized.open("wb") as handle:
            handle.truncate(relation_trace_json_to_lean.MAX_TRACE_BYTES + 1)
        with self.assertRaisesRegex(ValueError, "relation trace exceeds"):
            relation_trace_json_to_lean.load_payload(oversized)

    def test_negative_zero_and_unsafe_integer_tokens_are_rejected(self) -> None:
        for name, source in (
            ("negative-zero.json", '{"value":-0}'),
            ("unsafe-integer.json", '{"value":9007199254740993}'),
        ):
            invalid = Path(self._temporary.name) / name
            invalid.write_text(source, encoding="utf-8")
            with self.assertRaises(ValueError):
                relation_trace_json_to_lean.load_payload(invalid)

    def test_isolated_unicode_surrogate_is_rejected(self) -> None:
        payload = self.valid_payload()
        payload["identity"]["planId"] = "\ud800"
        with self.assertRaisesRegex(ValueError, "isolated Unicode surrogate"):
            relation_trace_json_to_lean.render_document(payload)

    def test_unsafe_runtime_integer_is_rejected_before_digest_comparison(self) -> None:
        payload = self.valid_payload()
        payload["steps"][0]["runtimeBefore"]["atoms"][0]["coordinationNumber"] = 9007199254740993
        with self.assertRaisesRegex(ValueError, "safe integer range"):
            relation_trace_json_to_lean.render_document(payload)

    def test_hard_link_output_cannot_overwrite_input(self) -> None:
        output = Path(self._temporary.name) / "hard-link.lean"
        os.link(self.trace_path, output)
        original = self.trace_path.read_bytes()
        with self.assertRaisesRegex(ValueError, "must not overwrite or alias"):
            relation_trace_json_to_lean.write_trace_output(self.trace_path, output, "forged")
        self.assertEqual(self.trace_path.read_bytes(), original)

    def test_fifo_input_is_rejected_without_reading(self) -> None:
        fifo = Path(self._temporary.name) / "trace.fifo"
        os.mkfifo(fifo)
        with self.assertRaisesRegex(ValueError, "regular file"):
            relation_trace_json_to_lean.load_payload(fifo)


if __name__ == "__main__":
    unittest.main()
