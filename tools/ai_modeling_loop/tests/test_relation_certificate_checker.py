from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

from tools.ai_modeling_loop.artifact_contracts import sha256_file
from tools.ai_modeling_loop.relation_certificate_checker import (
    PROJECTION_VERSION,
    run_relation_certificate_check,
)
from tools.ai_modeling_loop.relation_certificate_manifest import (
    build_relation_certificate_manifest,
    load_relation_certificate_manifest,
)


REPO_ROOT = Path(__file__).resolve().parents[3]
EXECUTOR = REPO_ROOT / "tools" / "ai_modeling_loop" / "retainmol_executor.mjs"
GEOMETRY_ROOT = REPO_ROOT / "formal" / "geometry"
MODELING_DIST = REPO_ROOT / "packages" / "mol-viewer" / "dist" / "public" / "modeling.js"


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, sort_keys=True) + "\n", encoding="utf-8")


def rotate_molecule() -> dict:
    return {
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


def rotate_plan() -> dict:
    return {
        "schemaVersion": 1,
        "planId": "rotate-plan",
        "source": "ai",
        "targetObjectId": "relation:molecule",
        "commands": [{
            "commandId": "rotate-1",
            "kind": "geometry.rotateGroup",
            "atomIds": ["R", "H"],
            "axisAtomId1": "F",
            "axisAtomId2": "M",
            "angleDegrees": 90,
        }],
    }


class RelationCertificateCheckerTests(unittest.TestCase):
    def create_plan_only_run(self, root: Path, commands: list[dict]) -> Path:
        run_dir = root / "run"
        write_json(run_dir / "enforced-plan.json", {
            "schemaVersion": 1,
            "planId": "plan",
            "commands": commands,
        })
        return run_dir

    def create_executed_rotate_run(self, root: Path) -> Path:
        run_dir = root / "run"
        paths = {
            "initial": run_dir / "inputs" / "initial-molecule.json",
            "plan": run_dir / "submitted-plan.json",
            "output": run_dir / "candidate.sdf",
            "receipt": run_dir / "execution.json",
            "metadata": run_dir / "metadata.json",
            "snapshot": run_dir / "builder-snapshot.json",
            "identity-map": run_dir / "identity-map.json",
            "coordinate-transport-receipt": run_dir / "coordinate-transport.json",
            "expected-effect": run_dir / "expected-effect.json",
            "enforced-plan": run_dir / "enforced-plan.json",
        }
        write_json(paths["initial"], {
            "schemaVersion": 1,
            "objectId": "relation:molecule",
            "fixedAtomIds": ["F"],
            "molecule": rotate_molecule(),
        })
        write_json(paths["plan"], rotate_plan())
        write_json(run_dir / "run-manifest.json", {"schemaVersion": 2, "runId": "run"})
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
        return run_dir

    def trusted_lean_hashes(self) -> tuple[str, str] | None:
        lake = shutil.which("lake")
        if lake is None:
            return None
        completed = subprocess.run(
            [lake, "env", "which", "lean"],
            cwd=GEOMETRY_ROOT,
            capture_output=True,
            text=True,
            timeout=30,
        )
        lean = Path(completed.stdout.strip())
        if completed.returncode != 0 or not lean.is_file():
            return None
        return sha256_file(lean), sha256_file(Path(lake))

    def test_non_relation_plan_is_not_applicable(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            run_dir = self.create_plan_only_run(Path(directory), [{
                "commandId": "replace-1",
                "kind": "atom.replace",
            }])
            result = run_relation_certificate_check(run_dir)
            self.assertEqual(result.status, "not-applicable")
            self.assertFalse((run_dir / "relation").exists())

    def test_unimplemented_relation_plan_is_indeterminate(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            run_dir = self.create_plan_only_run(Path(directory), [{
                "commandId": "attach-1",
                "kind": "fragment.attach",
            }])
            result = run_relation_certificate_check(run_dir)
            self.assertEqual(result.status, "indeterminate")
            self.assertEqual(result.code, "relation-command-set-unsupported")
            self.assertFalse((run_dir / "relation" / "formal-verdict.json").exists())

    def test_rotate_execution_is_reprojected_and_proved_by_lean(self) -> None:
        if not MODELING_DIST.is_file():
            self.skipTest("build @retainmol/mol-viewer before relation checker integration")
        trusted = self.trusted_lean_hashes()
        if trusted is None:
            self.skipTest("Lean toolchain is unavailable")
        with tempfile.TemporaryDirectory() as directory:
            run_dir = self.create_executed_rotate_run(Path(directory))
            result = run_relation_certificate_check(
                run_dir,
                trusted_lean_sha256=trusted[0],
                trusted_launcher_sha256=trusted[1],
            )
            self.assertEqual(result.status, "pass", result)
            self.assertEqual(result.projection_version, PROJECTION_VERSION)
            manifest = build_relation_certificate_manifest(
                run_dir,
                projection_version=result.projection_version,
            )
            manifest_path = run_dir / "relation-certificate-manifest.json"
            write_json(manifest_path, manifest)
            loaded = load_relation_certificate_manifest(manifest_path)
            self.assertEqual(loaded["relationMode"], "required")

    def test_failed_recheck_removes_stale_pass_verdict(self) -> None:
        if not MODELING_DIST.is_file():
            self.skipTest("build @retainmol/mol-viewer before relation checker integration")
        trusted = self.trusted_lean_hashes()
        if trusted is None:
            self.skipTest("Lean toolchain is unavailable")
        with tempfile.TemporaryDirectory() as directory:
            run_dir = self.create_executed_rotate_run(Path(directory))
            passed = run_relation_certificate_check(
                run_dir,
                trusted_lean_sha256=trusted[0],
                trusted_launcher_sha256=trusted[1],
            )
            self.assertEqual(passed.status, "pass", passed)
            verdict = run_dir / "relation" / "formal-verdict.json"
            self.assertTrue(verdict.is_file())
            failed = run_relation_certificate_check(
                run_dir,
                trusted_lean_sha256="0" * 64,
                trusted_launcher_sha256=trusted[1],
            )
            self.assertEqual(failed.status, "indeterminate")
            self.assertEqual(failed.code, "lean-trust-mismatch")
            self.assertFalse(verdict.exists())


if __name__ == "__main__":
    unittest.main()
