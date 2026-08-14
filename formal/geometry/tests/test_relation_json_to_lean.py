from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
sys.path.insert(0, str(TOOLS))
MODULE_PATH = TOOLS / "relation_json_to_lean.py"
SPEC = importlib.util.spec_from_file_location("relation_json_to_lean", MODULE_PATH)
assert SPEC and SPEC.loader
relation_json_to_lean = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(relation_json_to_lean)


class RelationJsonToLeanTests(unittest.TestCase):
    def valid_payload(self):
        return relation_json_to_lean.load_payload(ROOT / "examples" / "quarter-turn-relation.json")

    def evaluate_payload(self, payload):
        generated_root = ROOT / ".lake" / "generated"
        generated_root.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix="relation-test-", dir=generated_root) as directory:
            lean_path = Path(directory) / "RelationEvaluation.lean"
            lean_path.write_text(relation_json_to_lean.render_document(payload), encoding="utf-8")
            result = subprocess.run(
                ["lake", "env", "lean", str(lean_path)],
                cwd=ROOT,
                check=True,
                capture_output=True,
                text=True,
            )
        prefix = relation_json_to_lean.EVALUATION_PREFIX
        encoded = next(
            line.split(prefix, 1)[1]
            for line in result.stdout.splitlines()
            if prefix in line
        )
        return json.loads(encoded)

    def test_renders_relation_without_caller_tolerances(self):
        rendered = relation_json_to_lean.render_document(self.valid_payload())
        self.assertIn("private def relations : List SpatialRelation", rendered)
        self.assertIn(".rotatableJoint", rendered)
        self.assertIn("maxSquaredDistanceDelta := 0", rendered)
        self.assertIn("cosineSquared := { loNum := 0", rendered)

    def test_unknown_fields_are_rejected(self):
        payload = self.valid_payload()
        payload["relations"][0]["tolerance"] = 999999
        with self.assertRaisesRegex(ValueError, "unknown fields"):
            relation_json_to_lean.render_document(payload)

    def test_region_cannot_supply_policy_thresholds(self):
        payload = self.valid_payload()
        payload["relations"][0]["region"]["maxSquaredDistanceDelta"] = 1000
        with self.assertRaisesRegex(ValueError, "unknown fields"):
            relation_json_to_lean.render_document(payload)

    def test_unsupported_exact_angle_is_indeterminate_before_lean(self):
        payload = self.valid_payload()
        payload["relations"][0]["angleDegrees"] = 17
        with self.assertRaisesRegex(ValueError, "exact-angle V1 set"):
            relation_json_to_lean.render_document(payload)

    def test_relation_kind_is_closed(self):
        payload = self.valid_payload()
        payload["relations"][0]["kind"] = "fragmentFuse"
        with self.assertRaisesRegex(ValueError, "not a supported SpatialRelation"):
            relation_json_to_lean.render_document(payload)

    def test_empty_relation_list_is_rejected(self):
        payload = self.valid_payload()
        payload["relations"] = []
        with self.assertRaisesRegex(ValueError, "at least one"):
            relation_json_to_lean.render_document(payload)

    def test_detached_joint_frame_is_rejected(self):
        payload = self.valid_payload()
        relation = payload["relations"][0]
        relation["region"]["frame"] = {
            "originAtomId": "F",
            "axisAtomId": "R",
            "radialAtomId": "M",
        }
        relation["angleDegrees"] = 0

        self.assertEqual(self.evaluate_payload(payload), {
            "status": "reject",
            "scope": "spatial-relation-v1",
            "issues": ["rotatable-joint"],
        })

    def test_truncated_candidate_is_rejected(self):
        payload = self.valid_payload()
        payload["candidate"]["atoms"] = [
            atom for atom in payload["candidate"]["atoms"]
            if atom["atomId"] in {"F", "M", "R"}
        ]
        payload["candidate"]["bonds"] = []
        payload["relations"] = [{
            "kind": "portFrame",
            "frame": {
                "originAtomId": "F",
                "axisAtomId": "M",
                "radialAtomId": "R",
            },
        }]

        self.assertEqual(self.evaluate_payload(payload), {
            "status": "reject",
            "scope": "spatial-relation-v1",
            "issues": ["port-frame"],
        })

    def test_axis_margin_gray_zone_is_rejected_until_tristate_exists(self):
        payload = self.valid_payload()
        self.set_quarter_turn_axis_length(payload, 316)

        self.assertEqual(self.evaluate_payload(payload), {
            "status": "reject",
            "scope": "spatial-relation-v1",
            "issues": ["rotatable-joint"],
        })

    def test_axis_just_above_system_margin_passes(self):
        payload = self.valid_payload()
        self.set_quarter_turn_axis_length(payload, 317)

        self.assertEqual(self.evaluate_payload(payload), {
            "status": "pass",
            "scope": "spatial-relation-v1",
            "issues": [],
        })

    @staticmethod
    def set_quarter_turn_axis_length(payload, axis_length):
        positions = {
            "reference": {
                "F": [0, 0, 0],
                "M": [axis_length, 0, 0],
                "R": [axis_length, 1000, 0],
                "H": [axis_length, 0, 1000],
            },
            "candidate": {
                "F": [0, 0, 0],
                "M": [axis_length, 0, 0],
                "R": [axis_length, 0, 1000],
                "H": [axis_length, -1000, 0],
            },
        }
        for side in ("reference", "candidate"):
            for atom in payload[side]["atoms"]:
                atom["positionUnits"] = positions[side][atom["atomId"]]


if __name__ == "__main__":
    unittest.main()
