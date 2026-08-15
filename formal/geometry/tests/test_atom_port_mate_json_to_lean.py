from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
sys.path.insert(0, str(TOOLS))
MODULE_PATH = TOOLS / "atom_port_mate_json_to_lean.py"
SPEC = importlib.util.spec_from_file_location("atom_port_mate_json_to_lean", MODULE_PATH)
assert SPEC and SPEC.loader
atom_port_mate_json_to_lean = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = atom_port_mate_json_to_lean
SPEC.loader.exec_module(atom_port_mate_json_to_lean)


class AtomPortMateJsonToLeanTests(unittest.TestCase):
    def valid_request(self):
        return atom_port_mate_json_to_lean.load_payload(
            ROOT / "examples" / "atom-port-mate-request.json"
        )

    def evaluate_request(self, request):
        generated_root = ROOT / ".lake" / "generated"
        generated_root.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix="atom-port-mate-test-", dir=generated_root) as directory:
            lean_path = Path(directory) / "AtomPortMateEvaluation.lean"
            lean_path.write_text(
                atom_port_mate_json_to_lean.render_document(request), encoding="utf-8"
            )
            result = subprocess.run(
                ["lake", "env", "lean", str(lean_path)],
                cwd=ROOT,
                check=True,
                capture_output=True,
                text=True,
            )
        prefix = atom_port_mate_json_to_lean.EVALUATION_PREFIX
        encoded = next(
            line.split(prefix, 1)[1]
            for line in result.stdout.splitlines()
            if prefix in line
        )
        return json.loads(encoded)

    def copied_registry(self, directory: str) -> Path:
        target = Path(directory) / "atom-port-mate-v1"
        shutil.copytree(atom_port_mate_json_to_lean.REGISTRY_ROOT, target)
        return target

    def test_generates_all_atom_port_mate_lean_values(self):
        rendered = atom_port_mate_json_to_lean.render_document(self.valid_request())
        self.assertIn("private def policy : AtomPortMatePolicy", rendered)
        self.assertIn("private def mate : AtomPortMate", rendered)
        self.assertIn("private def reference : MoleculeSnapshot", rendered)
        self.assertIn("private def candidate : MoleculeSnapshot", rendered)
        self.assertIn("linkBondOrder := .single", rendered)
        self.assertIn('expectedLinkBondId := "attach:host-guest"', rendered)
        self.assertIn("linkDirection :=", rendered)
        self.assertIn("cosineSquared :=", rendered)

    def test_registered_c_sp3_c_single_case_passes(self):
        request = self.valid_request()
        self.assertEqual(self.evaluate_request(request), {
            "status": "pass",
            "scope": "atom-port-mate-v1",
            "projectionVersion": request["projectionVersion"],
            "commandId": "attach-c-sp3-1",
            "policyId": request["policyId"],
            "policySha256": request["policySha256"],
            "evidenceId": request["evidenceId"],
            "evidenceSha256": request["evidenceSha256"],
        })

    def test_registered_sideways_candidate_is_rejected(self):
        request = self.valid_request()
        request["evidenceId"] = "c-sp3-c-single-reject-v1"
        request["evidenceSha256"] = atom_port_mate_json_to_lean.EVIDENCE_REGISTRY[
            request["evidenceId"]
        ].sha256
        self.assertEqual(self.evaluate_request(request), {
            "status": "reject",
            "scope": "atom-port-mate-v1",
            "projectionVersion": request["projectionVersion"],
            "commandId": "attach-c-sp3-1",
            "policyId": request["policyId"],
            "policySha256": request["policySha256"],
            "evidenceId": request["evidenceId"],
            "evidenceSha256": request["evidenceSha256"],
        })

    def test_external_request_cannot_supply_trusted_bodies_or_thresholds(self):
        forbidden = {
            "policy": {},
            "candidate": {},
            "reference": {},
            "rewrite": {},
            "threshold": 1,
        }
        for field, value in forbidden.items():
            with self.subTest(field=field):
                request = self.valid_request()
                request[field] = value
                with self.assertRaisesRegex(ValueError, "unknown fields"):
                    atom_port_mate_json_to_lean.render_document(request)

    def test_duplicate_request_key_is_rejected(self):
        encoded = (ROOT / "examples" / "atom-port-mate-request.json").read_text(
            encoding="utf-8"
        )
        encoded = encoded.replace(
            '"schemaVersion": 1,', '"schemaVersion": 1,\n  "schemaVersion": 1,', 1
        )
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "duplicate.json"
            path.write_text(encoded, encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "duplicate JSON field"):
                atom_port_mate_json_to_lean.load_payload(path)

    def test_wrong_request_versions_are_rejected(self):
        attacks = {
            "schemaVersion": 2,
            "projectionVersion": "atom-port-mate-registry-v2-to-lean-v1",
            "coordinateScale": 999,
        }
        for field, value in attacks.items():
            with self.subTest(field=field):
                request = self.valid_request()
                request[field] = value
                with self.assertRaisesRegex(ValueError, field):
                    atom_port_mate_json_to_lean.render_document(request)

    def test_unregistered_ids_are_rejected(self):
        request = self.valid_request()
        request["policyId"] = "caller-policy"
        with self.assertRaisesRegex(ValueError, "not registered"):
            atom_port_mate_json_to_lean.render_document(request)

    def test_request_digest_mismatch_is_rejected(self):
        request = self.valid_request()
        request["policySha256"] = "0" * 64
        with self.assertRaisesRegex(ValueError, "policy digest mismatch"):
            atom_port_mate_json_to_lean.render_document(request)

    def test_evidence_digest_mismatch_is_rejected(self):
        request = self.valid_request()
        request["evidenceSha256"] = "0" * 64
        with self.assertRaisesRegex(ValueError, "evidence digest mismatch"):
            atom_port_mate_json_to_lean.render_document(request)

    def test_changed_registry_file_is_rejected_by_fixed_digest(self):
        with tempfile.TemporaryDirectory() as directory:
            registry_root = self.copied_registry(directory)
            policy_path = registry_root / "policies" / "c-sp3-c-single-v1.json"
            policy_path.write_text(
                policy_path.read_text(encoding="utf-8") + "\n", encoding="utf-8"
            )
            with patch.object(atom_port_mate_json_to_lean, "REGISTRY_ROOT", registry_root):
                with self.assertRaisesRegex(ValueError, "trusted policy registry digest mismatch"):
                    atom_port_mate_json_to_lean.render_document(self.valid_request())

    def test_non_integer_registry_position_units_are_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            registry_root = self.copied_registry(directory)
            policy_path = registry_root / "policies" / "c-sp3-c-single-v1.json"
            encoded = policy_path.read_text(encoding="utf-8").replace(
                '"positionUnits": [1500, 0, 0]',
                '"positionUnits": [1500.5, 0, 0]',
                1,
            )
            policy_path.write_text(encoded, encoding="utf-8")
            digest = hashlib.sha256(policy_path.read_bytes()).hexdigest()
            policy_registry = copy.copy(atom_port_mate_json_to_lean.POLICY_REGISTRY)
            policy_registry["c-sp3-c-single-v1"] = atom_port_mate_json_to_lean.RegistryRecord(
                "policies/c-sp3-c-single-v1.json", digest
            )
            request = self.valid_request()
            request["policySha256"] = digest
            with patch.object(atom_port_mate_json_to_lean, "REGISTRY_ROOT", registry_root), patch.object(
                atom_port_mate_json_to_lean, "POLICY_REGISTRY", policy_registry
            ):
                with self.assertRaisesRegex(ValueError, "must be an integer"):
                    atom_port_mate_json_to_lean.render_document(request)

    def test_duplicate_registry_key_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            registry_root = self.copied_registry(directory)
            policy_path = registry_root / "policies" / "c-sp3-c-single-v1.json"
            encoded = policy_path.read_text(encoding="utf-8").replace(
                '"registryVersion": 1,',
                '"registryVersion": 1,\n  "registryVersion": 1,',
                1,
            )
            policy_path.write_text(encoded, encoding="utf-8")
            digest = hashlib.sha256(policy_path.read_bytes()).hexdigest()
            policy_registry = copy.copy(atom_port_mate_json_to_lean.POLICY_REGISTRY)
            policy_registry["c-sp3-c-single-v1"] = atom_port_mate_json_to_lean.RegistryRecord(
                "policies/c-sp3-c-single-v1.json", digest
            )
            request = self.valid_request()
            request["policySha256"] = digest
            with patch.object(atom_port_mate_json_to_lean, "REGISTRY_ROOT", registry_root), patch.object(
                atom_port_mate_json_to_lean, "POLICY_REGISTRY", policy_registry
            ):
                with self.assertRaisesRegex(ValueError, "duplicate JSON field"):
                    atom_port_mate_json_to_lean.render_document(request)

    def test_unknown_registry_field_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            registry_root = self.copied_registry(directory)
            policy_path = registry_root / "policies" / "c-sp3-c-single-v1.json"
            policy = json.loads(policy_path.read_text(encoding="utf-8"))
            policy["callerThreshold"] = 0
            policy_path.write_text(json.dumps(policy), encoding="utf-8")
            digest = hashlib.sha256(policy_path.read_bytes()).hexdigest()
            policy_registry = copy.copy(atom_port_mate_json_to_lean.POLICY_REGISTRY)
            policy_registry["c-sp3-c-single-v1"] = atom_port_mate_json_to_lean.RegistryRecord(
                "policies/c-sp3-c-single-v1.json", digest
            )
            request = self.valid_request()
            request["policySha256"] = digest
            with patch.object(atom_port_mate_json_to_lean, "REGISTRY_ROOT", registry_root), patch.object(
                atom_port_mate_json_to_lean, "POLICY_REGISTRY", policy_registry
            ):
                with self.assertRaisesRegex(ValueError, "unknown fields"):
                    atom_port_mate_json_to_lean.render_document(request)

    def test_wrong_registry_version_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            registry_root = self.copied_registry(directory)
            policy_path = registry_root / "policies" / "c-sp3-c-single-v1.json"
            policy = json.loads(policy_path.read_text(encoding="utf-8"))
            policy["registryVersion"] = 2
            policy_path.write_text(json.dumps(policy), encoding="utf-8")
            digest = hashlib.sha256(policy_path.read_bytes()).hexdigest()
            policy_registry = copy.copy(atom_port_mate_json_to_lean.POLICY_REGISTRY)
            policy_registry["c-sp3-c-single-v1"] = atom_port_mate_json_to_lean.RegistryRecord(
                "policies/c-sp3-c-single-v1.json", digest
            )
            request = self.valid_request()
            request["policySha256"] = digest
            with patch.object(atom_port_mate_json_to_lean, "REGISTRY_ROOT", registry_root), patch.object(
                atom_port_mate_json_to_lean, "POLICY_REGISTRY", policy_registry
            ):
                with self.assertRaisesRegex(ValueError, "registryVersion"):
                    atom_port_mate_json_to_lean.render_document(request)


if __name__ == "__main__":
    unittest.main()
