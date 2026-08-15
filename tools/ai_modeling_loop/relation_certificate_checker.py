from __future__ import annotations

import hashlib
import os
import shutil
import subprocess
import sys
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
CONVERTER = GEOMETRY_ROOT / "tools" / "relation_trace_json_to_lean.py"
PROJECTION_VERSION = "runtime-rotate-relation-trace-v1"


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


def _require_mapping(value: Any, field: str) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        raise ArtifactContractError(f"{field} must be an object")
    return value


def _build_request(run_dir: Path, trace_path: Path) -> dict[str, Any]:
    plan = _require_mapping(load_strict_json(run_dir / "enforced-plan.json"), "enforced plan")
    receipt = _require_mapping(load_strict_json(run_dir / "execution.json"), "execution receipt")
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
        "requestId": f"{run_dir.name}:{plan.get('planId')}:relation-trace",
        "relationTraceSha256": sha256_file(trace_path),
        "expectedIdentity": {
            "projectionVersion": PROJECTION_VERSION,
            "planId": plan.get("planId"),
            "enforcedPlanSha256": sha256_file(run_dir / "enforced-plan.json"),
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


def run_relation_certificate_check(
    run_dir: Path,
    *,
    timeout_seconds: float = 60.0,
    trusted_lean_sha256: str | None = None,
    trusted_launcher_sha256: str | None = None,
) -> RelationCertificateCheckResult:
    try:
        plan = _require_mapping(load_strict_json(run_dir / "enforced-plan.json"), "enforced plan")
        capability = classify_relation_capability(plan)
    except (ArtifactContractError, OSError, ValueError) as error:
        return RelationCertificateCheckResult("reject", "relation-plan-invalid", evidence={"error": str(error)})
    if capability == "not-applicable":
        return RelationCertificateCheckResult("not-applicable", "relation-not-applicable")
    if capability != "supported":
        return RelationCertificateCheckResult("indeterminate", "relation-command-set-unsupported")

    relation_dir = run_dir / "relation"
    relation_dir.mkdir(parents=True, exist_ok=True)
    trace_path = relation_dir / "relation-trace.json"
    request_path = relation_dir / "relation-trace-request.json"
    generated_path = relation_dir / "GeneratedRelationTrace.lean"
    verdict_path = relation_dir / "formal-verdict.json"
    for stale_path in (trace_path, request_path, generated_path, verdict_path):
        stale_path.unlink(missing_ok=True)
    node = shutil.which("node")
    if node is None:
        return RelationCertificateCheckResult("indeterminate", "relation-projector-unavailable")
    try:
        projection = subprocess.run(
            [
                node, str(PROJECTOR),
                "--initial", str(run_dir / "inputs" / "initial-molecule.json"),
                "--enforced-plan", str(run_dir / "enforced-plan.json"),
                "--execution-receipt", str(run_dir / "execution.json"),
                "--output", str(trace_path),
            ],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
        )
    except (OSError, subprocess.TimeoutExpired) as error:
        return RelationCertificateCheckResult("indeterminate", "relation-projector-unavailable", evidence={"error": str(error)})
    if projection.returncode != 0:
        status = "reject" if projection.returncode == 3 else "indeterminate"
        return RelationCertificateCheckResult(status, "relation-projection-failed", evidence={"returnCode": projection.returncode})

    try:
        request = _build_request(run_dir, trace_path)
        _write_json_atomic(request_path, request)
        request_sha256 = sha256_file(request_path)
    except (ArtifactContractError, OSError, ValueError) as error:
        return RelationCertificateCheckResult("reject", "relation-request-invalid", evidence={"error": str(error)})

    try:
        generation = subprocess.run(
            [
                sys.executable,
                str(CONVERTER),
                str(trace_path),
                str(request_path),
                str(generated_path),
                "--expected-request-sha256",
                request_sha256,
            ],
            cwd=GEOMETRY_ROOT,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
        )
    except (OSError, subprocess.TimeoutExpired) as error:
        return RelationCertificateCheckResult("indeterminate", "relation-generator-unavailable", evidence={"error": str(error)})
    if generation.returncode != 0 or not generated_path.is_file():
        return RelationCertificateCheckResult("indeterminate", "relation-generator-failed")

    lake = shutil.which("lake")
    if lake is None:
        return RelationCertificateCheckResult("indeterminate", "lean-launcher-unavailable")
    lean = _resolve_lean(lake, timeout_seconds)
    if lean is None:
        return RelationCertificateCheckResult("indeterminate", "lean-executable-unavailable")
    evidence = {
        "requestSha256": request_sha256,
        "nodeExecutable": node,
        "nodeExecutableSha256": sha256_file(Path(node)),
        "projectorSha256": sha256_file(PROJECTOR),
        "projectorIoSha256": sha256_file(PROJECTOR_IO),
        "strictJsonSha256": sha256_file(STRICT_JSON),
        "modelingRuntimeSha256": sha256_file(MODELING_RUNTIME),
        "leanLauncher": lake,
        "leanLauncherSha256": sha256_file(Path(lake)),
        "leanExecutable": str(lean),
        "leanExecutableSha256": sha256_file(lean),
        "generatorSha256": sha256_file(CONVERTER),
        "formalSourceTreeSha256": _source_tree_sha256(GEOMETRY_ROOT),
        "generatedLeanSha256": sha256_file(generated_path),
    }
    trusted_lean = trusted_lean_sha256 or os.environ.get("RETAINMOL_TRUSTED_LEAN_SHA256")
    trusted_launcher = (
        trusted_launcher_sha256
        or os.environ.get("RETAINMOL_TRUSTED_LEAN_LAUNCHER_SHA256")
    )
    if trusted_lean != evidence["leanExecutableSha256"]:
        return RelationCertificateCheckResult("indeterminate", "lean-trust-mismatch", evidence=evidence)
    if trusted_launcher != evidence["leanLauncherSha256"]:
        return RelationCertificateCheckResult("indeterminate", "lean-launcher-trust-mismatch", evidence=evidence)
    try:
        evaluation = subprocess.run(
            [lake, "env", "lean", str(generated_path)],
            cwd=GEOMETRY_ROOT,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
        )
    except (OSError, subprocess.TimeoutExpired) as error:
        return RelationCertificateCheckResult("indeterminate", "lean-evaluation-unavailable", evidence={**evidence, "error": str(error)})
    if evaluation.returncode != 0:
        return RelationCertificateCheckResult("reject", "lean-relation-rejected", evidence=evidence)

    verdict = {
        "schemaVersion": 1,
        "status": "pass",
        "checker": "lean-relation-trace-v1",
        "projectionVersion": PROJECTION_VERSION,
        "relationTraceSha256": sha256_file(trace_path),
        "certificateRequestSha256": request_sha256,
        "generatedLeanSha256": sha256_file(generated_path),
        "checkerEvidence": evidence,
    }
    _write_json_atomic(verdict_path, verdict)
    return RelationCertificateCheckResult(
        "pass",
        "lean-relation-satisfied",
        projection_version=PROJECTION_VERSION,
        evidence=evidence,
    )
