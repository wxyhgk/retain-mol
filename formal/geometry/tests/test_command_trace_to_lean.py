from __future__ import annotations

import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
sys.path.insert(0, str(TOOLS))
MODULE_PATH = TOOLS / "command_trace_to_lean.py"
SPEC = importlib.util.spec_from_file_location("command_trace_to_lean", MODULE_PATH)
assert SPEC and SPEC.loader
command_trace_to_lean = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(command_trace_to_lean)


class CommandTraceToLeanTests(unittest.TestCase):
    def valid_payload(self):
        return command_trace_to_lean.load_payload(
            ROOT / "examples" / "primitive-command-trace.json"
        )

    def load_text(self, text: str):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "trace.json"
            path.write_text(text, encoding="utf-8")
            return command_trace_to_lean.load_payload(path)

    def test_proof_document_contains_prop_level_trace_proof(self):
        rendered = command_trace_to_lean.render_document(self.valid_payload())
        self.assertIn("NonemptyPrimitiveCommandTraceSemantics before commandTrace", rendered)
        self.assertIn("nonemptyPrimitiveCommandTraceIsValid_sound", rendered)

    def test_evaluate_mode_has_no_proof_claim(self):
        rendered = command_trace_to_lean.render_document(
            self.valid_payload(), mode="evaluate"
        )
        self.assertIn(command_trace_to_lean.EVALUATION_PREFIX, rendered)
        self.assertNotIn("example : PrimitiveCommandTraceSemantics", rendered)

    def test_empty_trace_is_rejected(self):
        payload = self.valid_payload()
        payload["steps"] = []
        with self.assertRaisesRegex(ValueError, "at least one command receipt"):
            command_trace_to_lean.render_document(payload)

    def test_unknown_command_is_rejected(self):
        payload = self.valid_payload()
        payload["steps"][0]["command"] = {"kind": "fragment.attach"}
        with self.assertRaisesRegex(ValueError, "unsupported"):
            command_trace_to_lean.render_document(payload)

    def test_command_fields_are_kind_specific(self):
        payload = self.valid_payload()
        payload["steps"][0]["command"]["bondId"] = "unexpected"
        with self.assertRaisesRegex(ValueError, "unknown fields"):
            command_trace_to_lean.render_document(payload)

    def test_duplicate_json_field_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "duplicate JSON field"):
            self.load_text('{"schemaVersion": 1, "schemaVersion": 1}')

    def test_all_v1_command_kinds_render(self):
        cases = [
            ({"kind": "atom.add", "atom": {"atomId": "C", "symbol": "C", "position": [0, 0, 0]}}, ".atomAdd"),
            ({"kind": "atom.replace", "atomId": "A", "symbol": "N"}, ".atomReplace"),
            ({"kind": "atom.remove", "atomId": "A"}, ".atomRemove"),
            ({"kind": "atom.move", "atomId": "A", "position": [0, 1, 2]}, ".atomMove"),
            ({"kind": "bond.add", "bond": {"bondId": "x", "atomId1": "A", "atomId2": "B", "order": "double"}}, ".bondAdd"),
            ({"kind": "bond.remove", "bondId": "A-B"}, ".bondRemove"),
            ({"kind": "bond.setOrder", "bondId": "A-B", "order": "triple"}, ".bondSetOrder"),
        ]
        for command, expected in cases:
            with self.subTest(command=command["kind"]):
                self.assertIn(
                    expected,
                    command_trace_to_lean.render_command(command, "command"),
                )


if __name__ == "__main__":
    unittest.main()
