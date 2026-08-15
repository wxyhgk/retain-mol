from __future__ import annotations

import hashlib
import os
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping

from .artifact_contracts import (
    ArtifactContractError,
    canonical_json_bytes,
    load_strict_json,
    sha256_file,
)
from .relation_certificate_manifest import classify_relation_capability


REPO_ROOT = Path(__file__).resolve().parents[2]
GEOMETRY_ROOT = REPO_ROOT / "formal" / "geometry"
PROJECTOR = REPO_ROOT / "tools" / "ai_modeling_loop" / "relation_trace_projector.mjs"
PROJECTOR_IO = REPO_ROOT / "tools" / "ai_modeling_loop" / "relation_trace_projector_io.mjs"
STRICT_JSON = REPO_ROOT / "tools" / "ai_modeling_loop" / "strict_json.mjs"
MODELING_RUNTIME = REPO_ROOT / "packages" / "mol-viewer" / "dist" / "public" / "modeling.js"
MODELING_PACKAGE = REPO_ROOT / "packages" / "mol-viewer" / "package.json"
NODE_MODULES_ROOT = REPO_ROOT / "node_modules"
MODELING_NODE_DEPENDENCIES = (
    "clsx",
    "openchemlib",
    "react",
    "react-dom",
    "scheduler",
    "tailwind-merge",
    "three",
    "use-sync-external-store",
    "zod",
    "zundo",
    "zustand",
)
CONVERTER = GEOMETRY_ROOT / "tools" / "relation_trace_json_to_lean.py"
PROJECTION_VERSION = "runtime-rotate-relation-trace-v1"
CHECKER_SOURCE_ROOT = REPO_ROOT / "tools" / "ai_modeling_loop"


@dataclass(frozen=True)
class RelationCertificateCheckResult:
    status: str
    code: str
    projection_version: str | None = None
    evidence: Mapping[str, Any] | None = None


def _write_json_atomic(path: Path, payload: Mapping[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.tmp")
    temporary.write_bytes(canonical_json_bytes(payload) + b"\n")
    temporary.replace(path)


def _source_tree_sha256(root: Path) -> str:
    digest = hashlib.sha256()
    files = sorted(
        path
        for path in root.rglob("*")
        if (
            path.is_file()
            and ".lake" not in path.parts
            and "__pycache__" not in path.parts
            and (
                path.suffix in {".lean", ".py", ".toml", ".json"}
                or path.name == "lean-toolchain"
            )
        )
    )
    for path in files:
        relative = path.relative_to(root).as_posix().encode("utf-8")
        content = path.read_bytes()
        digest.update(len(relative).to_bytes(8, "big"))
        digest.update(relative)
        digest.update(len(content).to_bytes(8, "big"))
        digest.update(content)
    return digest.hexdigest()


def _checker_source_tree_sha256() -> str:
    digest = hashlib.sha256()
    files = sorted(
        path
        for path in CHECKER_SOURCE_ROOT.rglob("*")
        if (
            path.is_file()
            and "tests" not in path.parts
            and "__pycache__" not in path.parts
            and path.suffix in {".py", ".mjs"}
        )
    )
    for path in files:
        relative = path.relative_to(CHECKER_SOURCE_ROOT).as_posix().encode("utf-8")
        content = path.read_bytes()
        digest.update(len(relative).to_bytes(8, "big"))
        digest.update(relative)
        digest.update(len(content).to_bytes(8, "big"))
        digest.update(content)
    return digest.hexdigest()


def _all_files_tree_sha256(root: Path) -> str:
    digest = hashlib.sha256()
    files = sorted(path for path in root.rglob("*") if path.is_file())
    for path in files:
        relative = path.relative_to(root).as_posix().encode("utf-8")
        content = path.read_bytes()
        digest.update(len(relative).to_bytes(8, "big"))
        digest.update(relative)
        digest.update(len(content).to_bytes(8, "big"))
        digest.update(content)
    return digest.hexdigest()


def _node_package_source(package_name: str) -> Path:
    candidates = (
        REPO_ROOT / "packages" / "mol-viewer" / "node_modules" / package_name,
        NODE_MODULES_ROOT / package_name,
        REPO_ROOT / "apps" / "retainmol" / "node_modules" / package_name,
    )
    for candidate in candidates:
        if candidate.is_dir():
            return candidate.resolve()
    raise FileNotFoundError(f"missing Node runtime dependency: {package_name}")


def _named_package_tree_sha256(package_roots: Mapping[str, Path]) -> str:
    digest = hashlib.sha256()
    for package_name in sorted(package_roots):
        package_root = package_roots[package_name]
        if not package_root.is_dir():
            raise FileNotFoundError(f"missing Node runtime dependency: {package_name}")
        name = package_name.encode("utf-8")
        tree_hash = _all_files_tree_sha256(package_root).encode("ascii")
        digest.update(len(name).to_bytes(8, "big"))
        digest.update(name)
        digest.update(tree_hash)
    return digest.hexdigest()


def _require_mapping(value: Any, field: str) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        raise ArtifactContractError(f"{field} must be an object")
    return value


def _build_request(plan_path: Path, receipt_path: Path, trace_path: Path, request_id: str) -> dict[str, Any]:
    plan = _require_mapping(load_strict_json(plan_path), "enforced plan")
    receipt = _require_mapping(load_strict_json(receipt_path), "execution receipt")
    actual = _require_mapping(receipt.get("actualEffectReceipt"), "actual effect receipt")
    commands = actual.get("commands")
    if not isinstance(commands, list) or not commands:
        raise ArtifactContractError("actual effect receipt commands must be a non-empty array")
    expected_receipts = []
    for index, raw in enumerate(commands):
        command = _require_mapping(raw, f"actual effect receipt commands[{index}]")
        expected_receipts.append({
            "commandId": command.get("commandId"),
            "commandKind": command.get("kind"),
            "preDigest": command.get("preDigest"),
            "postDigest": command.get("postDigest"),
        })
    return {
        "schemaVersion": 1,
        "requestId": request_id,
        "relationTraceSha256": sha256_file(trace_path),
        "expectedIdentity": {
            "projectionVersion": PROJECTION_VERSION,
            "planId": plan.get("planId"),
            "enforcedPlanSha256": sha256_file(plan_path),
            "baseDigest": actual.get("baseDigest"),
            "finalDigest": actual.get("finalDigest"),
        },
        "expectedReceipts": expected_receipts,
    }


def _resolve_lean(lake: str, timeout: float) -> Path | None:
    try:
        completed = subprocess.run(
            [lake, "env", "which", "lean"],
            cwd=GEOMETRY_ROOT,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    path = Path(completed.stdout.strip())
    return path if completed.returncode == 0 and path.is_file() else None


def relation_checker_runtime_evidence(timeout_seconds: float = 60.0) -> dict[str, str] | None:
    node = shutil.which("node")
    lake = shutil.which("lake")
    if node is None or lake is None:
        return None
    lean = _resolve_lean(lake, timeout_seconds)
    if lean is None or not MODELING_RUNTIME.is_file():
        return None
    try:
        components = {
            "nodeExecutableSha256": sha256_file(Path(node)),
            "pythonExecutableSha256": sha256_file(Path(sys.executable)),
            "leanLauncherSha256": sha256_file(Path(lake)),
            "leanExecutableSha256": sha256_file(lean),
            "projectorSha256": sha256_file(PROJECTOR),
            "projectorIoSha256": sha256_file(PROJECTOR_IO),
            "strictJsonSha256": sha256_file(STRICT_JSON),
            "modelingPackageSha256": sha256_file(MODELING_PACKAGE),
            "modelingDistTreeSha256": _all_files_tree_sha256(MODELING_RUNTIME.parents[1]),
            "nodeDependencyTreeSha256": _named_package_tree_sha256(
                {
                    package_name: _node_package_source(package_name)
                    for package_name in MODELING_NODE_DEPENDENCIES
                }
            ),
            "formalSourceTreeSha256": _source_tree_sha256(GEOMETRY_ROOT),
            "checkerSourceTreeSha256": _checker_source_tree_sha256(),
        }
    except OSError:
        return None
    return {
        "nodeExecutable": node,
        "pythonExecutable": sys.executable,
        "leanLauncher": lake,
        "leanExecutable": str(lean),
        **components,
        "checkerClosureSha256": hashlib.sha256(canonical_json_bytes(components)).hexdigest(),
    }


def run_relation_certificate_check(
    run_dir: Path,
    *,
    timeout_seconds: float = 60.0,
    trusted_lean_sha256: str | None = None,
    trusted_launcher_sha256: str | None = None,
    trusted_checker_closure_sha256: str | None = None,
) -> RelationCertificateCheckResult:
    relation_dir = run_dir / "relation"
    trace_path = relation_dir / "relation-trace.json"
    request_path = relation_dir / "relation-trace-request.json"
    generated_path = relation_dir / "GeneratedRelationTrace.lean"
    verdict_path = relation_dir / "formal-verdict.json"
    for stale_path in (trace_path, request_path, generated_path, verdict_path):
        stale_path.unlink(missing_ok=True)
    try:
        plan = _require_mapping(load_strict_json(run_dir / "enforced-plan.json"), "enforced plan")
        capability = classify_relation_capability(plan)
    except (ArtifactContractError, OSError, ValueError) as error:
        return RelationCertificateCheckResult("reject", "relation-plan-invalid", evidence={"error": str(error)})
    if capability == "not-applicable":
        return RelationCertificateCheckResult("not-applicable", "relation-not-applicable")
    if capability != "supported":
        return RelationCertificateCheckResult("indeterminate", "relation-command-set-unsupported")

    runtime = relation_checker_runtime_evidence(timeout_seconds)
    if runtime is None:
        return RelationCertificateCheckResult("indeterminate", "relation-checker-runtime-unavailable")
    trusted_closure = (
        trusted_checker_closure_sha256
        or os.environ.get("RETAINMOL_TRUSTED_RELATION_CHECKER_CLOSURE_SHA256")
    )
    if trusted_closure != runtime["checkerClosureSha256"]:
        return RelationCertificateCheckResult(
            "indeterminate",
            "relation-checker-trust-mismatch",
            evidence=runtime,
        )
    trusted_lean = trusted_lean_sha256 or os.environ.get("RETAINMOL_TRUSTED_LEAN_SHA256")
    trusted_launcher = (
        trusted_launcher_sha256
        or os.environ.get("RETAINMOL_TRUSTED_LEAN_LAUNCHER_SHA256")
    )
    if trusted_lean is not None and trusted_lean != runtime["leanExecutableSha256"]:
        return RelationCertificateCheckResult("indeterminate", "lean-trust-mismatch", evidence=runtime)
    if trusted_launcher is not None and trusted_launcher != runtime["leanLauncherSha256"]:
        return RelationCertificateCheckResult("indeterminate", "lean-launcher-trust-mismatch", evidence=runtime)

    bound_inputs = {
        "runManifestSha256": run_dir / "run-manifest.json",
        "initialMoleculeSha256": run_dir / "inputs" / "initial-molecule.json",
        "enforcedPlanSha256": run_dir / "enforced-plan.json",
        "executionReceiptSha256": run_dir / "execution.json",
    }
    try:
        input_hashes = {field: sha256_file(path) for field, path in bound_inputs.items()}
    except OSError as error:
        return RelationCertificateCheckResult(
            "reject",
            "relation-input-binding-invalid",
            evidence={"error": str(error)},
        )

    relation_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="retainmol-relation-check-") as directory:
        snapshot_root = Path(directory).resolve()
        runtime_root = snapshot_root / "runtime"
        runtime_tools = runtime_root / "tools" / "ai_modeling_loop"
        runtime_tools.mkdir(parents=True)
        for source in (PROJECTOR, PROJECTOR_IO, STRICT_JSON):
            shutil.copy2(source, runtime_tools / source.name)
        package_root = runtime_root / "node_modules" / "@retainmol" / "mol-viewer"
        package_root.mkdir(parents=True)
        shutil.copy2(MODELING_RUNTIME.parents[2] / "package.json", package_root / "package.json")
        shutil.copytree(MODELING_RUNTIME.parents[1], package_root / "dist")
        for package_name in MODELING_NODE_DEPENDENCIES:
            shutil.copytree(
                _node_package_source(package_name),
                runtime_root / "node_modules" / package_name,
            )

        frozen_inputs = snapshot_root / "inputs"
        frozen_inputs.mkdir()
        for field, source in bound_inputs.items():
            (frozen_inputs / field).write_bytes(source.read_bytes())

        isolated_geometry = snapshot_root / "formal-geometry"
        shutil.copytree(
            GEOMETRY_ROOT,
            isolated_geometry,
            ignore=shutil.ignore_patterns(".lake", "__pycache__", "*.pyc"),
        )
        snapshot_hashes = {
            "projectorSha256": sha256_file(runtime_tools / PROJECTOR.name),
            "projectorIoSha256": sha256_file(runtime_tools / PROJECTOR_IO.name),
            "strictJsonSha256": sha256_file(runtime_tools / STRICT_JSON.name),
            "modelingPackageSha256": sha256_file(package_root / "package.json"),
            "modelingDistTreeSha256": _all_files_tree_sha256(package_root / "dist"),
            "nodeDependencyTreeSha256": _named_package_tree_sha256(
                {
                    package_name: runtime_root / "node_modules" / package_name
                    for package_name in MODELING_NODE_DEPENDENCIES
                }
            ),
            "formalSourceTreeSha256": _source_tree_sha256(isolated_geometry),
            "checkerSourceTreeSha256": _checker_source_tree_sha256(),
        }
        if any(runtime[field] != digest for field, digest in snapshot_hashes.items()):
            return RelationCertificateCheckResult(
                "indeterminate",
                "relation-checker-snapshot-mismatch",
                evidence={"snapshotHashes": snapshot_hashes},
            )
        if any(
            sha256_file(frozen_inputs / field) != input_hashes[field]
            for field in bound_inputs
        ):
            return RelationCertificateCheckResult(
                "reject",
                "relation-input-snapshot-mismatch",
            )
        snapshot_projector = runtime_tools / PROJECTOR.name
        snapshot_converter = isolated_geometry / "tools" / CONVERTER.name
        try:
            projection = subprocess.run(
                [
                    runtime["nodeExecutable"], str(snapshot_projector),
                    "--initial", str(frozen_inputs / "initialMoleculeSha256"),
                    "--enforced-plan", str(frozen_inputs / "enforcedPlanSha256"),
                    "--execution-receipt", str(frozen_inputs / "executionReceiptSha256"),
                    "--output", str(trace_path),
                ],
                cwd=runtime_root,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
            )
        except (OSError, subprocess.TimeoutExpired) as error:
            return RelationCertificateCheckResult("indeterminate", "relation-projector-unavailable", evidence={"error": str(error)})
        if projection.returncode != 0:
            status = "reject" if projection.returncode == 3 else "indeterminate"
            return RelationCertificateCheckResult(
                status,
                "relation-projection-failed",
                evidence={
                    "returnCode": projection.returncode,
                    "stderr": projection.stderr[-4000:] or None,
                },
            )

        try:
            request = _build_request(
                frozen_inputs / "enforcedPlanSha256",
                frozen_inputs / "executionReceiptSha256",
                trace_path,
                f"{run_dir.name}:{plan.get('planId')}:relation-trace",
            )
            _write_json_atomic(request_path, request)
            request_sha256 = sha256_file(request_path)
        except (ArtifactContractError, OSError, ValueError) as error:
            return RelationCertificateCheckResult("reject", "relation-request-invalid", evidence={"error": str(error)})

        try:
            generation = subprocess.run(
                [
                    runtime["pythonExecutable"],
                    str(snapshot_converter),
                    str(trace_path),
                    str(request_path),
                    str(generated_path),
                    "--expected-request-sha256",
                    request_sha256,
                ],
                cwd=isolated_geometry,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
            )
        except (OSError, subprocess.TimeoutExpired) as error:
            return RelationCertificateCheckResult("indeterminate", "relation-generator-unavailable", evidence={"error": str(error)})
        if generation.returncode != 0 or not generated_path.is_file():
            return RelationCertificateCheckResult(
                "indeterminate",
                "relation-generator-failed",
                evidence={
                    "returnCode": generation.returncode,
                    "stderr": generation.stderr[-4000:] or None,
                },
            )

        isolated_generated = isolated_geometry / generated_path.name
        shutil.copy2(generated_path, isolated_generated)
        try:
            build = subprocess.run(
                [runtime["leanLauncher"], "build"],
                cwd=isolated_geometry,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
            )
            if build.returncode != 0:
                return RelationCertificateCheckResult(
                    "indeterminate",
                    "lean-isolated-build-failed",
                    evidence={"stderr": build.stderr[-4000:] or None},
                )
            evaluation = subprocess.run(
                [runtime["leanLauncher"], "env", "lean", str(isolated_generated)],
                cwd=isolated_geometry,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
            )
        except (OSError, subprocess.TimeoutExpired) as error:
            return RelationCertificateCheckResult("indeterminate", "lean-evaluation-unavailable", evidence={"error": str(error)})
        if evaluation.returncode != 0:
            return RelationCertificateCheckResult("reject", "lean-relation-rejected")

    current_runtime = relation_checker_runtime_evidence(timeout_seconds)
    if (
        current_runtime is None
        or current_runtime["checkerClosureSha256"] != runtime["checkerClosureSha256"]
    ):
        return RelationCertificateCheckResult(
            "indeterminate",
            "relation-checker-changed-during-check",
        )
    if any(sha256_file(path) != input_hashes[field] for field, path in bound_inputs.items()):
        return RelationCertificateCheckResult("reject", "relation-input-changed-during-check")
    trace_sha256 = sha256_file(trace_path)
    generated_sha256 = sha256_file(generated_path)
    if request.get("relationTraceSha256") != trace_sha256:
        return RelationCertificateCheckResult("reject", "relation-trace-changed-during-check")
    evidence = {
        "requestSha256": request_sha256,
        **runtime,
        **input_hashes,
        "generatorSha256": sha256_file(CONVERTER),
        "modelingRuntimeSha256": sha256_file(MODELING_RUNTIME),
        "generatedLeanSha256": generated_sha256,
    }

    verdict = {
        "schemaVersion": 1,
        "status": "pass",
        "checker": "lean-relation-trace-v1",
        "projectionVersion": PROJECTION_VERSION,
        "relationTraceSha256": trace_sha256,
        "certificateRequestSha256": request_sha256,
        "generatedLeanSha256": generated_sha256,
        "checkerEvidence": evidence,
    }
    _write_json_atomic(verdict_path, verdict)
    return RelationCertificateCheckResult(
        "pass",
        "lean-relation-satisfied",
        projection_version=PROJECTION_VERSION,
        evidence=evidence,
    )
