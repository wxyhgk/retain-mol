from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from decimal import Decimal
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "tools" / "json_to_lean.py"
SPEC = importlib.util.spec_from_file_location("json_to_lean", MODULE_PATH)
assert SPEC and SPEC.loader
json_to_lean = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(json_to_lean)


class JsonToLeanTests(unittest.TestCase):
    def load_text(self, text: str):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "request.json"
            path.write_text(text, encoding="utf-8")
            return json_to_lean.load_payload(path)

    def valid_payload(self):
        return json_to_lean.load_payload(ROOT / "examples" / "anchored-core.json")

    def test_valid_v2_request_renders_policy(self):
        rendered = json_to_lean.render_document(self.valid_payload())
        self.assertIn("private def policy : GeometryPolicy", rendered)
        self.assertIn("geometryValidationIssues", rendered)

    def test_evaluate_mode_emits_machine_result_without_pass_proof(self):
        rendered = json_to_lean.render_document(self.valid_payload(), mode="evaluate")
        self.assertIn(json_to_lean.EVALUATION_PREFIX, rendered)
        self.assertIn("evaluationPayload", rendered)
        self.assertNotIn("example : validateGeometryPolicy", rendered)

    def test_proof_mode_remains_the_default(self):
        rendered = json_to_lean.render_document(self.valid_payload())
        self.assertIn("example : validateGeometryPolicy", rendered)

    def test_duplicate_json_field_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "duplicate JSON field"):
            self.load_text('{"schemaVersion": 2, "schemaVersion": 2}')

    def test_unknown_field_is_rejected(self):
        payload = self.valid_payload()
        payload["policy"]["fixedAtomID"] = []
        with self.assertRaisesRegex(ValueError, "unknown fields"):
            json_to_lean.render_document(payload)

    def test_coordinate_scale_is_fixed(self):
        payload = self.valid_payload()
        payload["coordinateScale"] = 1
        with self.assertRaisesRegex(ValueError, "must be fixed"):
            json_to_lean.render_document(payload)

    def test_distance_bounds_are_inward_rounded(self):
        lower, upper = json_to_lean.inward_squared_bounds(
            Decimal("1.0000004"), Decimal("1.0004"), "bound"
        )
        self.assertEqual(lower, 1_000_001)
        self.assertEqual(upper, 1_000_800)

    def test_unrepresentable_zero_width_bound_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "no representable"):
            json_to_lean.inward_squared_bounds(
                Decimal("1.0004"), Decimal("1.0004"), "bound"
            )

    def test_non_finite_number_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "non-finite"):
            self.load_text('{"value": NaN}')

    def test_empty_policy_fails_in_generated_lean_contract(self):
        payload = self.valid_payload()
        payload["policy"] = {
            "policyId": "empty",
            "requireGeometryConstraints": True,
            "requireAllBondDistances": True,
            "fixedAtomIds": [],
            "distanceBounds": [],
            "orientationChecks": [],
            "rigidAtomGroups": [],
        }
        rendered = json_to_lean.render_document(payload)
        self.assertIn("requireGeometryConstraints := true", rendered)


if __name__ == "__main__":
    unittest.main()
