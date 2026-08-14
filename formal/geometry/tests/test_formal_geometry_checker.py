from __future__ import annotations

import copy
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


FORMAL_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = FORMAL_ROOT.parents[1]
sys.path.insert(0, str(REPO_ROOT / "tools" / "ai_modeling_loop"))

from formal_geometry_checker import check_formal_geometry  # noqa: E402
from formal_verdict import VerificationStatus  # noqa: E402


class FormalGeometryCheckerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.valid = json.loads(
            (FORMAL_ROOT / "examples" / "anchored-core.json").read_text(encoding="utf-8")
        )
        lake = shutil.which("lake")
        if lake is None:
            raise unittest.SkipTest("lake is unavailable")
        cls.lake = str(Path(lake).resolve())
        cls.lake_sha256 = hashlib.sha256(Path(cls.lake).read_bytes()).hexdigest()
        lean = subprocess.run(
            [cls.lake, "env", "which", "lean"],
            cwd=FORMAL_ROOT,
            capture_output=True,
            text=True,
            check=True,
        ).stdout.strip()
        cls.lean = str(Path(lean).resolve())
        cls.lean_sha256 = hashlib.sha256(Path(cls.lean).read_bytes()).hexdigest()
        cls.python_sha256 = hashlib.sha256(Path(sys.executable).read_bytes()).hexdigest()

    def check_payload(self, payload: dict):
        with tempfile.TemporaryDirectory() as directory:
            request = Path(directory) / "request.json"
            request.write_text(json.dumps(payload), encoding="utf-8")
            return check_formal_geometry(
                request,
                geometry_root=FORMAL_ROOT,
                lean_command=(self.lake, "env", "lean"),
                trusted_lean_sha256=self.lean_sha256,
                trusted_launcher_sha256=self.lake_sha256,
            )

    def test_valid_candidate_passes(self) -> None:
        result = self.check_payload(copy.deepcopy(self.valid))
        self.assertEqual(result.status, VerificationStatus.PASS)
        self.assertEqual(result.code, "geometry-policy-satisfied")
        self.assertEqual(result.issues, ())

    def test_graph_change_is_a_candidate_reject(self) -> None:
        payload = copy.deepcopy(self.valid)
        payload["candidate"]["bonds"].pop()
        result = self.check_payload(payload)
        self.assertEqual(result.status, VerificationStatus.REJECT)
        self.assertIn("molecular-graph-changed", result.issues)

    def test_fixed_atom_change_is_a_candidate_reject(self) -> None:
        payload = copy.deepcopy(self.valid)
        payload["candidate"]["atoms"][0]["position"][0] = 0.001
        result = self.check_payload(payload)
        self.assertEqual(result.status, VerificationStatus.REJECT)
        self.assertIn("fixed-atom-changed", result.issues)

    def test_bond_distance_change_is_a_candidate_reject(self) -> None:
        payload = copy.deepcopy(self.valid)
        payload["candidate"]["atoms"][-1]["position"] = [0.0, 20.0, 0.0]
        result = self.check_payload(payload)
        self.assertEqual(result.status, VerificationStatus.REJECT)
        self.assertIn("distance-out-of-range", result.issues)

    def test_missing_lean_is_indeterminate(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            request = Path(directory) / "request.json"
            request.write_text(json.dumps(self.valid), encoding="utf-8")
            result = check_formal_geometry(
                request,
                geometry_root=FORMAL_ROOT,
                lean_command=("retainmol-command-that-does-not-exist",),
            )
        self.assertEqual(result.status, VerificationStatus.INDETERMINATE)
        self.assertEqual(result.code, "lean-unavailable")

    def test_lean_timeout_is_indeterminate(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            request = Path(directory) / "request.json"
            request.write_text(json.dumps(self.valid), encoding="utf-8")
            result = check_formal_geometry(
                request,
                geometry_root=FORMAL_ROOT,
                lean_command=(sys.executable, "-c", "import time; time.sleep(2)"),
                timeout_seconds=0.5,
                trusted_lean_sha256=self.python_sha256,
                trusted_launcher_sha256=self.python_sha256,
            )
        self.assertEqual(result.status, VerificationStatus.INDETERMINATE)
        self.assertEqual(result.code, "lean-timeout")

    def test_lean_compile_failure_is_not_a_candidate_reject(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            request = Path(directory) / "request.json"
            request.write_text(json.dumps(self.valid), encoding="utf-8")
            result = check_formal_geometry(
                request,
                geometry_root=FORMAL_ROOT,
                lean_command=(sys.executable, "-c", "raise SystemExit(1)"),
                trusted_lean_sha256=self.python_sha256,
                trusted_launcher_sha256=self.python_sha256,
            )
        self.assertEqual(result.status, VerificationStatus.INDETERMINATE)
        self.assertEqual(result.code, "lean-failed")

    def test_unparseable_lean_output_is_indeterminate(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            request = Path(directory) / "request.json"
            request.write_text(json.dumps(self.valid), encoding="utf-8")
            result = check_formal_geometry(
                request,
                geometry_root=FORMAL_ROOT,
                lean_command=(sys.executable, "-c", "print('not-a-verdict')"),
                trusted_lean_sha256=self.python_sha256,
                trusted_launcher_sha256=self.python_sha256,
            )
        self.assertEqual(result.status, VerificationStatus.INDETERMINATE)
        self.assertEqual(result.code, "lean-output-invalid")

    def test_bad_schema_is_indeterminate(self) -> None:
        payload = copy.deepcopy(self.valid)
        payload["schemaVersion"] = 999
        result = self.check_payload(payload)
        self.assertEqual(result.status, VerificationStatus.INDETERMINATE)
        self.assertEqual(result.code, "generator-failed")

    def test_invalid_trusted_policy_is_indeterminate(self) -> None:
        payload = copy.deepcopy(self.valid)
        payload["policy"] = {
            "policyId": "empty",
            "requireGeometryConstraints": True,
            "requireAllBondDistances": True,
            "fixedAtomIds": [],
            "distanceBounds": [],
            "orientationChecks": [],
            "rigidAtomGroups": [],
        }
        result = self.check_payload(payload)
        self.assertEqual(result.status, VerificationStatus.INDETERMINATE)
        self.assertEqual(result.code, "trusted-geometry-input-invalid")
        self.assertIn("policy-invalid", result.issues)

    def test_exact_distance_precheck_catches_quantization_false_pass(self) -> None:
        payload = copy.deepcopy(self.valid)
        payload["expected"]["atoms"] = payload["expected"]["atoms"][:2]
        payload["candidate"]["atoms"] = payload["candidate"]["atoms"][:2]
        payload["expected"]["bonds"] = payload["expected"]["bonds"][:1]
        payload["candidate"]["bonds"] = payload["candidate"]["bonds"][:1]
        payload["expected"]["atoms"][0]["position"] = [0, 0, 0]
        payload["candidate"]["atoms"][0]["position"] = [0, 0, 0]
        payload["expected"]["atoms"][1]["position"] = [1.00049, 0, 0]
        payload["candidate"]["atoms"][1]["position"] = [1.00049, 0, 0]
        payload["policy"] = {
            "policyId": "quantization-attack",
            "requireGeometryConstraints": True,
            "requireAllBondDistances": True,
            "fixedAtomIds": [],
            "distanceBounds": [{
                "atomId1": payload["candidate"]["atoms"][0]["atomId"],
                "atomId2": payload["candidate"]["atoms"][1]["atomId"],
                "minAngstrom": 0.5,
                "maxAngstrom": 1.0004,
            }],
            "orientationChecks": [],
            "rigidAtomGroups": [],
        }
        result = self.check_payload(payload)
        self.assertEqual(result.status, VerificationStatus.REJECT)
        self.assertEqual(result.code, "exact-geometry-policy-rejected")

    def test_exact_fixed_atom_precheck_catches_sub_quantization_drift(self) -> None:
        payload = copy.deepcopy(self.valid)
        payload["candidate"]["atoms"][0]["position"][0] = 0.0004

        result = self.check_payload(payload)

        self.assertEqual(result.status, VerificationStatus.REJECT)
        self.assertEqual(result.code, "exact-geometry-policy-rejected")
        self.assertIn("fixed-atom-changed", result.issues)

    def test_exact_rigid_group_precheck_catches_sub_quantization_distortion(self) -> None:
        payload = copy.deepcopy(self.valid)
        payload["policy"]["fixedAtomIds"] = []
        payload["policy"]["orientationChecks"] = []
        payload["policy"]["rigidAtomGroups"] = [{
            "atomIds": ["B:core", "N:left"],
            "maxSquaredDistanceDelta": 1,
        }]
        payload["candidate"]["atoms"][1]["position"][0] = -1.4004

        result = self.check_payload(payload)

        self.assertEqual(result.status, VerificationStatus.REJECT)
        self.assertEqual(result.code, "exact-geometry-policy-rejected")
        self.assertIn("rigid-group-distorted", result.issues)

    def test_rigid_distances_allow_mirror_but_orientation_rejects_it(self) -> None:
        payload = copy.deepcopy(self.valid)
        payload["policy"]["fixedAtomIds"] = []
        payload["policy"]["orientationChecks"] = []
        for atom in payload["candidate"]["atoms"]:
            atom["position"][2] *= -1

        rigid_only = self.check_payload(payload)

        self.assertEqual(rigid_only.status, VerificationStatus.PASS)

        payload["policy"]["orientationChecks"] = copy.deepcopy(
            self.valid["policy"]["orientationChecks"]
        )
        oriented = self.check_payload(payload)

        self.assertEqual(oriented.status, VerificationStatus.REJECT)
        self.assertIn("orientation-invalid", oriented.issues)

    def test_invalid_expected_orientation_margin_is_indeterminate(self) -> None:
        payload = copy.deepcopy(self.valid)
        payload["policy"]["orientationChecks"][0]["minAbsVolume6"] = 10**20

        result = self.check_payload(payload)

        self.assertEqual(result.status, VerificationStatus.INDETERMINATE)
        self.assertEqual(result.code, "exact-geometry-policy-invalid")
        self.assertIn("policy-invalid", result.issues)

    def test_untrusted_lean_binary_cannot_report_pass(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fake = Path(directory) / "lake"
            fake.write_text(
                f"#!{sys.executable}\n"
                "print('RETAINMOL_GEOMETRY_RESULT:{\"status\":\"pass\",\"issues\":[]}')\n"
            )
            os.chmod(fake, 0o755)
            request = Path(directory) / "request.json"
            request.write_text(json.dumps(self.valid), encoding="utf-8")
            result = check_formal_geometry(
                request,
                geometry_root=FORMAL_ROOT,
                lean_command=(str(fake),),
                trusted_lean_sha256=self.lean_sha256,
                trusted_launcher_sha256=self.lake_sha256,
            )
        self.assertEqual(result.status, VerificationStatus.INDETERMINATE)
        self.assertEqual(result.code, "lean-trust-mismatch")

    def test_trusted_compiler_with_untrusted_launcher_is_indeterminate(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            request = Path(directory) / "request.json"
            request.write_text(json.dumps(self.valid), encoding="utf-8")
            result = check_formal_geometry(
                request,
                geometry_root=FORMAL_ROOT,
                lean_command=(self.lake, "env", "lean"),
                trusted_lean_sha256=self.lean_sha256,
                trusted_launcher_sha256="0" * 64,
            )
        self.assertEqual(result.status, VerificationStatus.INDETERMINATE)
        self.assertEqual(result.code, "lean-launcher-trust-mismatch")


if __name__ == "__main__":
    unittest.main()
