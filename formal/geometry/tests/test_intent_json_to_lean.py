from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
sys.path.insert(0, str(TOOLS))
MODULE_PATH = TOOLS / "intent_json_to_lean.py"
SPEC = importlib.util.spec_from_file_location("intent_json_to_lean", MODULE_PATH)
assert SPEC and SPEC.loader
intent_json_to_lean = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(intent_json_to_lean)


class IntentJsonToLeanTests(unittest.TestCase):
    def valid_payload(self):
        return intent_json_to_lean.load_payload(ROOT / "examples" / "primitive-intent.json")

    def test_renders_intent_compiler_and_candidate_evaluation(self):
        rendered = intent_json_to_lean.render_document(self.valid_payload())
        self.assertIn("private def intent : GeometryIntent", rendered)
        self.assertIn(".atomMove", rendered)
        self.assertIn("geometryIntentCandidateIssues intent candidate", rendered)
        self.assertNotIn("private def policy : GeometryPolicy", rendered)

    def test_caller_authored_policy_is_rejected(self):
        payload = self.valid_payload()
        payload["policy"] = {"fixedAtomIds": []}
        with self.assertRaisesRegex(ValueError, "unknown fields"):
            intent_json_to_lean.render_document(payload)

    def test_unknown_primitive_command_is_rejected(self):
        payload = self.valid_payload()
        payload["intent"]["commands"] = [{"commandId": "fragment-a", "kind": "fragmentAttach"}]
        with self.assertRaisesRegex(ValueError, "not a supported primitive command"):
            intent_json_to_lean.render_document(payload)

    def test_command_fields_are_exact(self):
        payload = self.valid_payload()
        payload["intent"]["commands"][0]["unexpected"] = True
        with self.assertRaisesRegex(ValueError, "unknown fields"):
            intent_json_to_lean.render_document(payload)

    def test_numeric_policy_thresholds_are_rejected(self):
        payload = self.valid_payload()
        payload["intent"]["rigidAtomGroups"] = [{
            "atomIds": ["C1", "H1"],
            "maxSquaredDistanceDelta": 100,
        }]
        with self.assertRaisesRegex(ValueError, "unknown fields"):
            intent_json_to_lean.render_document(payload)

    def test_decimal_positions_are_not_rounded_at_the_trust_boundary(self):
        payload = self.valid_payload()
        payload["candidate"]["atoms"][1]["positionUnits"][0] = 1100.4
        with self.assertRaisesRegex(ValueError, "must be an integer"):
            intent_json_to_lean.render_document(payload)

    def test_oversized_coordinate_units_are_rejected_before_lean(self):
        payload = self.valid_payload()
        payload["candidate"]["atoms"][1]["positionUnits"][0] = 1_000_000_001
        with self.assertRaisesRegex(ValueError, "coordinate-unit limit"):
            intent_json_to_lean.render_document(payload)

    def test_oversized_formal_charge_is_rejected_before_lean(self):
        payload = self.valid_payload()
        payload["intent"]["expected"]["atoms"][0]["formalCharge"] = 65
        with self.assertRaisesRegex(ValueError, "formalCharge exceeds limit"):
            intent_json_to_lean.render_document(payload)

    def test_oversized_radical_count_is_rejected_before_lean(self):
        payload = self.valid_payload()
        payload["intent"]["expected"]["atoms"][0]["radicalElectrons"] = 65
        with self.assertRaisesRegex(ValueError, "radicalElectrons exceeds limit"):
            intent_json_to_lean.render_document(payload)


if __name__ == "__main__":
    unittest.main()
