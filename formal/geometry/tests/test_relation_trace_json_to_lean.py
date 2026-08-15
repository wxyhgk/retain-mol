from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from decimal import Decimal
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
from relation_trace_runtime import project_snapshot

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


def create_certificate_request(trace_path: Path) -> Path:
    payload = json.loads(trace_path.read_text(encoding="utf-8"))
    request = {
        "schemaVersion": 1,
        "requestId": "trusted-test-run:rotate-plan",
        "relationTraceSha256": hashlib.sha256(trace_path.read_bytes()).hexdigest(),
        "expectedIdentity": payload["identity"],
        "expectedReceipts": payload["expectedReceipts"],
    }
    output = trace_path.with_name("relation-trace-request.json")
    output.write_text(json.dumps(request, indent=2) + "\n", encoding="utf-8")
    return output


class RelationTraceJsonToLeanTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        if not MODELING_DIST.is_file():
            raise unittest.SkipTest("build @retainmol/mol-viewer before running relation trace tests")
        cls._temporary = tempfile.TemporaryDirectory()
        cls.trace_path = create_projected_trace(Path(cls._temporary.name))
        cls.trace_bytes = cls.trace_path.read_bytes()
        cls.payload = relation_trace_json_to_lean.load_payload(cls.trace_path)
        cls.request_path = create_certificate_request(cls.trace_path)
        cls.request_bytes = cls.request_path.read_bytes()
        cls.request_payload = json.loads(cls.request_bytes)

    @classmethod
    def tearDownClass(cls) -> None:
        cls._temporary.cleanup()

    def valid_payload(self):
        return copy.deepcopy(self.payload)

    def valid_request(self):
        return copy.deepcopy(self.request_payload)

    @staticmethod
    def json_bytes(value) -> bytes:
        return json.dumps(
            value,
            ensure_ascii=True,
            separators=(",", ":"),
            default=lambda item: float(item) if isinstance(item, Decimal) else item,
        ).encode("utf-8")

    def render(
        self,
        payload=None,
        request=None,
        trace_bytes=None,
        *,
        bind_request_to_trace=True,
    ):
        effective_trace_bytes = trace_bytes
        if effective_trace_bytes is None:
            effective_trace_bytes = (
                self.trace_bytes if payload is None else self.json_bytes(payload)
            )
        effective_request = request
        request_changed = request is not None
        if effective_request is None:
            effective_request = self.valid_request()
        else:
            effective_request = copy.deepcopy(effective_request)
        if bind_request_to_trace and effective_trace_bytes != self.trace_bytes:
            effective_request["relationTraceSha256"] = hashlib.sha256(
                effective_trace_bytes
            ).hexdigest()
            request_changed = True
        effective_request_bytes = (
            self.request_bytes
            if not request_changed
            else self.json_bytes(effective_request)
        )
        return relation_trace_json_to_lean.render_document(
            effective_trace_bytes,
            effective_request_bytes,
            hashlib.sha256(effective_request_bytes).hexdigest(),
        )

    def test_generated_relation_trace_compiles_in_lean(self) -> None:
        if shutil.which("lake") is None:
            self.skipTest("lake is not installed")
        output = Path(self._temporary.name) / "GeneratedRelationTrace.lean"
        output.write_text(
            self.render(),
            encoding="utf-8",
        )
        completed = subprocess.run(
            ["lake", "env", "lean", str(output)],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=60,
        )
        self.assertEqual(
            completed.returncode,
            0,
            completed.stdout + completed.stderr,
        )

    def test_generated_source_retains_request_and_trace_hashes(self) -> None:
        rendered = self.render()
        self.assertIn(hashlib.sha256(self.request_bytes).hexdigest(), rendered)
        self.assertIn(hashlib.sha256(self.trace_bytes).hexdigest(), rendered)

    def test_generated_source_keeps_trusted_policy_outside_witnesses(self) -> None:
        rendered = self.render()
        self.assertIn(
            "private def expectedPolicies : List RelationPolicy := [.rotateGroup, .rotateGroup]",
            rendered,
        )
        witness_blocks = rendered.split("  witness := ")[1:]
        self.assertTrue(witness_blocks)
        self.assertTrue(all("policy :=" not in block.split("\n}", 1)[0] for block in witness_blocks))

    def test_generated_certificate_rejects_single_sided_digest_tampering(self) -> None:
        if shutil.which("lake") is None:
            self.skipTest("lake is not installed")
        rendered = self.render()
        marker = "private def certificateIdentity : RelationTraceCertificateIdentity := {"
        prefix, certificate_source = rendered.split(marker, 1)
        request_sha = hashlib.sha256(self.request_bytes).hexdigest()
        self.assertIn(request_sha, certificate_source)
        certificate_source = certificate_source.replace(request_sha, "0" * 64, 1)
        output = Path(self._temporary.name) / "TamperedRelationTrace.lean"
        output.write_text(prefix + marker + certificate_source, encoding="utf-8")
        completed = subprocess.run(
            ["lake", "env", "lean", str(output)],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=60,
        )
        self.assertNotEqual(completed.returncode, 0)

    def test_cli_requires_external_request_digest(self) -> None:
        output = Path(self._temporary.name) / "cli-generated.lean"
        completed = subprocess.run([
            sys.executable,
            str(MODULE_PATH),
            str(self.trace_path),
            str(self.request_path),
            str(output),
            "--expected-request-sha256",
            "0" * 64,
        ], cwd=ROOT, capture_output=True, text=True, timeout=30)
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("does not bind the request bytes", completed.stderr)
        self.assertFalse(output.exists())

    def test_runtime_snapshot_and_digest_cannot_be_rebound(self) -> None:
        payload = self.valid_payload()
        payload["steps"][0]["runtimeAfter"]["atoms"][0]["x"] += 1
        payload["steps"][0]["after"]["atoms"][0]["positionUnits"][0] += 1000
        with self.assertRaisesRegex(ValueError, "postDigest does not bind"):
            self.render(payload=payload)

    def test_formal_snapshot_must_equal_runtime_projection(self) -> None:
        payload = self.valid_payload()
        payload["steps"][0]["after"]["atoms"][0]["positionUnits"][0] += 1
        with self.assertRaisesRegex(ValueError, "runtime snapshot projection"):
            self.render(payload=payload)

    def test_independent_projection_rejects_quantization_tie(self) -> None:
        runtime = copy.deepcopy(self.payload["steps"][0]["runtimeBefore"])
        runtime["atoms"][0]["x"] = 0.0005
        with self.assertRaisesRegex(ValueError, "quantization boundary"):
            project_snapshot(runtime)

    def test_step_order_and_receipt_order_are_bound(self) -> None:
        payload = self.valid_payload()
        payload["steps"].reverse()
        with self.assertRaisesRegex(ValueError, "does not match expectedReceipts"):
            self.render(payload=payload)

    def test_fixed_policy_threshold_cannot_be_weakened(self) -> None:
        payload = self.valid_payload()
        payload["steps"][0]["witness"]["region"]["frame"]["minAxisSquared"] = "1"
        with self.assertRaisesRegex(ValueError, "must be fixed"):
            self.render(payload=payload)

    def test_unknown_trace_field_is_rejected(self) -> None:
        payload = self.valid_payload()
        payload["steps"][0]["callerWitness"] = {}
        with self.assertRaisesRegex(ValueError, "unknown fields"):
            self.render(payload=payload)

    def test_self_consistent_trace_rewrite_cannot_define_its_own_expectation(self) -> None:
        payload = self.valid_payload()
        payload["identity"]["planId"] = "forged-but-internally-consistent"
        forged_bytes = self.trace_bytes.replace(
            b'"planId": "rotate-plan"',
            b'"planId": "forged-but-internally-consistent"',
        )
        self.assertNotEqual(forged_bytes, self.trace_bytes)
        with self.assertRaisesRegex(ValueError, "does not bind the trace bytes"):
            self.render(
                payload=payload,
                trace_bytes=forged_bytes,
                bind_request_to_trace=False,
            )

    def test_render_document_cannot_mix_request_payload_and_other_request_bytes(self) -> None:
        forged_request = self.valid_request()
        forged_request["requestId"] = "forged-request-id"
        rendered = self.render(request=forged_request)
        self.assertIn("forged-request-id", rendered)
        self.assertNotIn(hashlib.sha256(self.request_bytes).hexdigest(), rendered)

    def test_trace_identity_must_match_the_external_request(self) -> None:
        request = self.valid_request()
        request["expectedIdentity"]["planId"] = "another-run"
        with self.assertRaisesRegex(ValueError, "does not match the trace identity"):
            self.render(request=request)

    def test_trace_receipts_must_match_the_external_request(self) -> None:
        request = self.valid_request()
        request["expectedReceipts"][0]["commandId"] = "another-command"
        with self.assertRaisesRegex(ValueError, "do not match the trace receipts"):
            self.render(request=request)

    def test_unknown_certificate_request_field_is_rejected(self) -> None:
        request = self.valid_request()
        request["callerPolicy"] = {}
        with self.assertRaisesRegex(ValueError, "unknown fields"):
            self.render(request=request)

    def test_duplicate_json_field_is_rejected(self) -> None:
        duplicate = Path(self._temporary.name) / "duplicate.json"
        duplicate.write_text('{"schemaVersion":1,"schemaVersion":1}', encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "duplicate JSON field"):
            relation_trace_json_to_lean.load_payload(duplicate)

    def test_trace_and_request_utf8_bom_are_rejected(self) -> None:
        with self.assertRaisesRegex(ValueError, "must not start with a UTF-8 BOM"):
            relation_trace_json_to_lean.render_document(
                b"\xef\xbb\xbf" + self.trace_bytes,
                self.request_bytes,
                hashlib.sha256(self.request_bytes).hexdigest(),
            )
        request_with_bom = b"\xef\xbb\xbf" + self.request_bytes
        with self.assertRaisesRegex(ValueError, "must not start with a UTF-8 BOM"):
            relation_trace_json_to_lean.render_document(
                self.trace_bytes,
                request_with_bom,
                hashlib.sha256(request_with_bom).hexdigest(),
            )

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
            self.render(payload=payload)

    def test_unsafe_runtime_integer_is_rejected_before_digest_comparison(self) -> None:
        payload = self.valid_payload()
        payload["steps"][0]["runtimeBefore"]["atoms"][0]["coordinationNumber"] = 9007199254740993
        with self.assertRaisesRegex(ValueError, "safe range"):
            self.render(payload=payload)

    def test_hard_link_output_cannot_overwrite_input(self) -> None:
        output = Path(self._temporary.name) / "hard-link.lean"
        os.link(self.trace_path, output)
        original = self.trace_path.read_bytes()
        with self.assertRaisesRegex(ValueError, "must not overwrite or alias"):
            relation_trace_json_to_lean.write_trace_output(self.trace_path, output, "forged")
        self.assertEqual(self.trace_path.read_bytes(), original)

    def test_output_cannot_overwrite_or_alias_the_certificate_request(self) -> None:
        original = self.request_path.read_bytes()
        with self.assertRaisesRegex(ValueError, "must not overwrite or alias"):
            relation_trace_json_to_lean.write_trace_output(
                [self.trace_path, self.request_path],
                self.request_path,
                "forged",
            )
        self.assertEqual(self.request_path.read_bytes(), original)

    def test_fifo_input_is_rejected_without_reading(self) -> None:
        fifo = Path(self._temporary.name) / "trace.fifo"
        os.mkfifo(fifo)
        with self.assertRaisesRegex(ValueError, "regular file"):
            relation_trace_json_to_lean.load_payload(fifo)

    def test_fifo_certificate_request_is_rejected_without_reading(self) -> None:
        fifo = Path(self._temporary.name) / "request.fifo"
        os.mkfifo(fifo)
        with self.assertRaisesRegex(ValueError, "regular file"):
            relation_trace_json_to_lean.load_trusted_request_document(fifo, "0" * 64)


if __name__ == "__main__":
    unittest.main()
