from __future__ import annotations

import hashlib
import json
import tempfile
import unittest
from pathlib import Path

from tools.ai_modeling_loop.artifact_contracts import (
    ArtifactContractError,
    canonical_json_bytes,
    sha256_file,
)
from tools.ai_modeling_loop.relation_certificate_manifest import (
    build_relation_certificate_manifest,
    classify_relation_capability,
    classify_relation_mode,
    load_relation_certificate_manifest,
)


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, sort_keys=True) + "\n", encoding="utf-8")


class RelationCertificateManifestTests(unittest.TestCase):
    def create_run(self, root: Path, command_kind: str) -> Path:
        run_dir = root / "run"
        write_json(run_dir / "run-manifest.json", {"schemaVersion": 2, "runId": "run"})
        write_json(run_dir / "inputs" / "initial-molecule.json", {"objectId": "molecule"})
        write_json(run_dir / "enforced-plan.json", {
            "schemaVersion": 1,
            "commands": [{"commandId": "command-1", "kind": command_kind}],
        })
        write_json(run_dir / "execution.json", {"commandCount": 1})
        return run_dir

    def create_relation_artifacts(self, run_dir: Path) -> None:
        relation_dir = run_dir / "relation"
        write_json(relation_dir / "relation-trace.json", {"schemaVersion": 1, "steps": []})
        write_json(relation_dir / "relation-trace-request.json", {"schemaVersion": 1})
        lean_path = relation_dir / "GeneratedRelationTrace.lean"
        lean_path.write_text("example : True := by trivial\n", encoding="utf-8")
        components = {
            "nodeExecutableSha256": "1" * 64,
            "pythonExecutableSha256": "2" * 64,
            "leanLauncherSha256": "3" * 64,
            "leanExecutableSha256": "4" * 64,
            "projectorSha256": "5" * 64,
            "projectorIoSha256": "6" * 64,
            "strictJsonSha256": "7" * 64,
            "modelingPackageSha256": "8" * 64,
            "modelingDistTreeSha256": "9" * 64,
            "nodeDependencyTreeSha256": "a" * 64,
            "formalSourceTreeSha256": "b" * 64,
            "checkerSourceTreeSha256": "e" * 64,
        }
        bound_inputs = {
            "runManifestSha256": sha256_file(run_dir / "run-manifest.json"),
            "initialMoleculeSha256": sha256_file(
                run_dir / "inputs" / "initial-molecule.json"
            ),
            "enforcedPlanSha256": sha256_file(run_dir / "enforced-plan.json"),
            "executionReceiptSha256": sha256_file(run_dir / "execution.json"),
        }
        write_json(relation_dir / "formal-verdict.json", {
            "schemaVersion": 1,
            "status": "pass",
            "checker": "lean-relation-trace-v1",
            "projectionVersion": "runtime-mixed-relation-trace-v2",
            "relationTraceSha256": sha256_file(relation_dir / "relation-trace.json"),
            "certificateRequestSha256": sha256_file(
                relation_dir / "relation-trace-request.json"
            ),
            "generatedLeanSha256": sha256_file(lean_path),
            "checkerEvidence": {
                "requestSha256": sha256_file(
                    relation_dir / "relation-trace-request.json"
                ),
                "nodeExecutable": "/usr/bin/node",
                "pythonExecutable": "/usr/bin/python3",
                **components,
                "modelingRuntimeSha256": "c" * 64,
                "leanLauncher": "/usr/bin/lake",
                "leanExecutable": "/usr/bin/lean",
                "generatorSha256": "d" * 64,
                "checkerClosureSha256": hashlib.sha256(
                    canonical_json_bytes(components)
                ).hexdigest(),
                "generatedLeanSha256": sha256_file(lean_path),
                **bound_inputs,
            },
        })

    def test_classifies_spatial_commands_as_required(self) -> None:
        self.assertEqual(classify_relation_mode({"commands": [{"kind": "fragment.attach"}]}), "required")
        self.assertEqual(classify_relation_mode({"commands": [{"kind": "geometry.rotateGroup"}]}), "required")
        self.assertEqual(
            classify_relation_capability({"commands": [{"kind": "geometry.rotateGroup"}]}),
            "supported",
        )

    def test_classifies_unimplemented_relations_as_unsupported(self) -> None:
        self.assertEqual(
            classify_relation_capability({"commands": [{"kind": "fragment.attach"}]}),
            "unsupported",
        )
        self.assertEqual(
            classify_relation_capability({
                "commands": [
                    {"kind": "atom.add"},
                    {"kind": "geometry.rotateGroup"},
                ],
            }),
            "supported",
        )
        self.assertEqual(
            classify_relation_capability({
                "commands": [
                    {"kind": "atom.setCharge"},
                    {"kind": "geometry.rotateGroup"},
                ],
            }),
            "unsupported",
        )

    def test_classifies_primitive_commands_as_not_applicable(self) -> None:
        self.assertEqual(classify_relation_mode({"commands": [{"kind": "atom.replace"}]}), "not-applicable")
        self.assertEqual(classify_relation_mode({"commands": [{"kind": "bond.add"}]}), "not-applicable")

    def test_builds_and_reloads_required_manifest(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            run_dir = self.create_run(Path(directory), "geometry.rotateGroup")
            self.create_relation_artifacts(run_dir)
            manifest = build_relation_certificate_manifest(
                run_dir,
                projection_version="runtime-mixed-relation-trace-v2",
            )
            path = run_dir / "relation-certificate-manifest.json"
            write_json(path, manifest)
            loaded = load_relation_certificate_manifest(path)
            self.assertEqual(loaded["relationMode"], "required")

    def test_builds_not_applicable_manifest_without_relation_artifacts(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            run_dir = self.create_run(Path(directory), "atom.replace")
            manifest = build_relation_certificate_manifest(run_dir)
            path = run_dir / "relation-certificate-manifest.json"
            write_json(path, manifest)
            loaded = load_relation_certificate_manifest(path)
            self.assertEqual(loaded["relationMode"], "not-applicable")
            self.assertIsNone(loaded["relationTraceSha256"])

    def test_rejects_not_applicable_claim_for_relation_plan(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            run_dir = self.create_run(Path(directory), "geometry.rotateGroup")
            self.create_relation_artifacts(run_dir)
            manifest = build_relation_certificate_manifest(
                run_dir,
                projection_version="runtime-mixed-relation-trace-v2",
            )
            manifest["relationMode"] = "not-applicable"
            manifest["reason"] = "command-set-has-no-spatial-relation-v1"
            manifest["projectionVersion"] = None
            for field in (
                "relationTraceSha256",
                "certificateRequestSha256",
                "generatedLeanSha256",
                "formalVerdictSha256",
            ):
                manifest[field] = None
            path = run_dir / "relation-certificate-manifest.json"
            write_json(path, manifest)
            with self.assertRaisesRegex(ArtifactContractError, "relationMode"):
                load_relation_certificate_manifest(path)

    def test_rejects_plan_tampering_after_certificate(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            run_dir = self.create_run(Path(directory), "geometry.rotateGroup")
            self.create_relation_artifacts(run_dir)
            manifest = build_relation_certificate_manifest(
                run_dir,
                projection_version="runtime-mixed-relation-trace-v2",
            )
            path = run_dir / "relation-certificate-manifest.json"
            write_json(path, manifest)
            write_json(run_dir / "enforced-plan.json", {
                "schemaVersion": 1,
                "commands": [{"commandId": "command-2", "kind": "geometry.rotateGroup"}],
            })
            with self.assertRaisesRegex(ArtifactContractError, "enforcedPlanSha256"):
                load_relation_certificate_manifest(path)

    def test_rejects_relation_trace_tampering_after_certificate(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            run_dir = self.create_run(Path(directory), "geometry.rotateGroup")
            self.create_relation_artifacts(run_dir)
            manifest = build_relation_certificate_manifest(
                run_dir,
                projection_version="runtime-mixed-relation-trace-v2",
            )
            path = run_dir / "relation-certificate-manifest.json"
            write_json(path, manifest)
            write_json(run_dir / "relation" / "relation-trace.json", {
                "schemaVersion": 1,
                "steps": [{"tampered": True}],
            })
            with self.assertRaisesRegex(ArtifactContractError, "relationTraceSha256"):
                load_relation_certificate_manifest(path)

    def test_rejects_formal_verdict_rebound_to_other_trace(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            run_dir = self.create_run(Path(directory), "geometry.rotateGroup")
            self.create_relation_artifacts(run_dir)
            verdict_path = run_dir / "relation" / "formal-verdict.json"
            verdict = json.loads(verdict_path.read_text(encoding="utf-8"))
            verdict["relationTraceSha256"] = "0" * 64
            write_json(verdict_path, verdict)
            with self.assertRaisesRegex(ArtifactContractError, "not bound"):
                build_relation_certificate_manifest(
                    run_dir,
                    projection_version="runtime-mixed-relation-trace-v2",
                )

    def test_rejects_checker_evidence_rebound_to_other_initial_molecule(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            run_dir = self.create_run(Path(directory), "geometry.rotateGroup")
            self.create_relation_artifacts(run_dir)
            verdict_path = run_dir / "relation" / "formal-verdict.json"
            verdict = json.loads(verdict_path.read_text(encoding="utf-8"))
            verdict["checkerEvidence"]["initialMoleculeSha256"] = "0" * 64
            write_json(verdict_path, verdict)
            with self.assertRaisesRegex(ArtifactContractError, "not bound"):
                build_relation_certificate_manifest(
                    run_dir,
                    projection_version="runtime-mixed-relation-trace-v2",
                )

    def test_rejects_checker_evidence_with_forged_closure(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            run_dir = self.create_run(Path(directory), "geometry.rotateGroup")
            self.create_relation_artifacts(run_dir)
            verdict_path = run_dir / "relation" / "formal-verdict.json"
            verdict = json.loads(verdict_path.read_text(encoding="utf-8"))
            verdict["checkerEvidence"]["checkerClosureSha256"] = "0" * 64
            write_json(verdict_path, verdict)
            with self.assertRaisesRegex(ArtifactContractError, "closure hash"):
                build_relation_certificate_manifest(
                    run_dir,
                    projection_version="runtime-mixed-relation-trace-v2",
                )

    def test_rejects_required_manifest_if_plan_becomes_unsupported(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            run_dir = self.create_run(Path(directory), "geometry.rotateGroup")
            self.create_relation_artifacts(run_dir)
            manifest = build_relation_certificate_manifest(
                run_dir,
                projection_version="runtime-mixed-relation-trace-v2",
            )
            write_json(run_dir / "enforced-plan.json", {
                "schemaVersion": 1,
                "commands": [{"commandId": "command-1", "kind": "fragment.attach"}],
            })
            manifest["enforcedPlanSha256"] = sha256_file(run_dir / "enforced-plan.json")
            path = run_dir / "relation-certificate-manifest.json"
            write_json(path, manifest)
            with self.assertRaisesRegex(ArtifactContractError, "unsupported command set"):
                load_relation_certificate_manifest(path)


if __name__ == "__main__":
    unittest.main()
