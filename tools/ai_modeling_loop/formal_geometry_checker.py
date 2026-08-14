from __future__ import annotations

import json
import hashlib
import math
import os
import shlex
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass, replace
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any, Iterable, Mapping, Sequence

try:
    from .formal_verdict import VerificationStatus
except ImportError:  # Supports the dependency-light formal verification harness.
    from formal_verdict import VerificationStatus


EVALUATION_PREFIX = "RETAINMOL_GEOMETRY_RESULT:"
DEFAULT_GEOMETRY_ROOT = Path(__file__).resolve().parents[2] / "formal" / "geometry"
DEFAULT_LEAN_COMMAND = ("lake", "env", "lean")
KNOWN_ISSUES = frozenset({
    "expected-topology-invalid",
    "candidate-topology-invalid",
    "molecular-graph-changed",
    "policy-invalid",
    "fixed-atom-changed",
    "distance-out-of-range",
    "orientation-invalid",
    "rigid-group-distorted",
})


@dataclass(frozen=True)
class FormalGeometryCheckResult:
    status: VerificationStatus
    code: str
    issues: tuple[str, ...] = ()
    evidence: Mapping[str, Any] | None = None

    def to_json(self) -> dict[str, Any]:
        return {
            "status": self.status.value,
            "code": self.code,
            "issues": list(self.issues),
            "evidence": dict(self.evidence) if self.evidence is not None else None,
        }


FormalGeometryResult = FormalGeometryCheckResult


def _indeterminate(
    code: str,
    *issues: str,
    evidence: Mapping[str, Any] | None = None,
) -> FormalGeometryCheckResult:
    return FormalGeometryCheckResult(
        status=VerificationStatus.INDETERMINATE,
        code=code,
        issues=tuple(issues),
        evidence=evidence,
    )


def _reject_duplicate_keys(pairs: Iterable[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate result field: {key}")
        result[key] = value
    return result


def _normalize_command(command: Sequence[str] | str | Path) -> tuple[str, ...]:
    if isinstance(command, Path):
        result = (str(command),)
    elif isinstance(command, str):
        result = tuple(shlex.split(command))
    else:
        result = tuple(str(part) for part in command)
    if not result or any(not part for part in result):
        raise ValueError("lean command must not be empty")
    return result


def parse_lean_evaluation_output(stdout: str) -> FormalGeometryCheckResult:
    markers = [
        line[len(EVALUATION_PREFIX):]
        for line in stdout.splitlines()
        if line.startswith(EVALUATION_PREFIX)
    ]
    if len(markers) != 1:
        raise ValueError("expected exactly one formal geometry result marker")
    payload = json.loads(markers[0], object_pairs_hook=_reject_duplicate_keys)
    if not isinstance(payload, dict) or set(payload) != {"status", "issues"}:
        raise ValueError("formal geometry result has an invalid schema")
    status = payload["status"]
    issues = payload["issues"]
    if status not in {"pass", "reject"}:
        raise ValueError("formal geometry result has an invalid status")
    if not isinstance(issues, list) or any(not isinstance(issue, str) for issue in issues):
        raise ValueError("formal geometry result issues must be strings")
    if any(issue not in KNOWN_ISSUES for issue in issues):
        raise ValueError("formal geometry result contains an unknown issue")
    if status == "pass" and issues:
        raise ValueError("a passing formal geometry result must not contain issues")
    if status == "reject" and not issues:
        raise ValueError("a rejected formal geometry result must contain issues")
    if status == "pass":
        return FormalGeometryCheckResult(
            status=VerificationStatus.PASS,
            code="geometry-policy-satisfied",
        )
    trusted_input_issues = {"expected-topology-invalid", "policy-invalid"}
    if any(issue in trusted_input_issues for issue in issues):
        return FormalGeometryCheckResult(
            status=VerificationStatus.INDETERMINATE,
            code="trusted-geometry-input-invalid",
            issues=tuple(issues),
        )
    return FormalGeometryCheckResult(
        status=VerificationStatus.REJECT,
        code="geometry-policy-rejected",
        issues=tuple(issues),
    )


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _source_tree_sha256(root: Path) -> str:
    digest = hashlib.sha256()
    paths = sorted((root / "RetainMolGeometry").glob("*.lean"))
    paths.extend(path for path in (root / "lakefile.toml", root / "lean-toolchain") if path.is_file())
    for path in paths:
        digest.update(str(path.relative_to(root)).encode("utf-8"))
        digest.update(b"\0")
        digest.update(path.read_bytes())
        digest.update(b"\0")
    return digest.hexdigest()


def _resolved_command(command: tuple[str, ...]) -> tuple[str, ...] | None:
    executable = Path(command[0]).expanduser()
    if executable.is_absolute():
        resolved = executable.resolve() if executable.is_file() else None
    else:
        found = shutil.which(command[0])
        resolved = Path(found).resolve() if found else None
    if resolved is None or not resolved.is_file():
        return None
    return (str(resolved), *command[1:])


def _resolve_lean_compiler(
    command: tuple[str, ...],
    *,
    cwd: Path,
    timeout: float,
) -> Path | None:
    if len(command) >= 3 and Path(command[0]).name == "lake" and command[1:3] == ("env", "lean"):
        try:
            probe = subprocess.run(
                [command[0], "env", "which", "lean"],
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=timeout,
            )
        except (OSError, subprocess.TimeoutExpired, UnicodeError):
            return None
        lines = [line.strip() for line in probe.stdout.splitlines() if line.strip()]
        if probe.returncode != 0 or len(lines) != 1:
            return None
        compiler = Path(lines[0]).expanduser()
        return compiler.resolve() if compiler.is_file() else None
    executable = Path(command[0])
    return executable.resolve() if executable.is_file() else None


def _exact_geometry_issues(request: Path) -> tuple[str, ...] | None:
    try:
        payload = json.loads(
            request.read_text(encoding="utf-8"),
            parse_float=Decimal,
            parse_int=Decimal,
            object_pairs_hook=_reject_duplicate_keys,
        )
        scale = Decimal(payload["coordinateScale"])
        expected_positions = {
            atom["atomId"]: tuple(Decimal(value) for value in atom["position"])
            for atom in payload["expected"]["atoms"]
        }
        candidate_positions = {
            atom["atomId"]: tuple(Decimal(value) for value in atom["position"])
            for atom in payload["candidate"]["atoms"]
        }
        issues: list[str] = []
        for bound in payload["policy"]["distanceBounds"]:
            left = candidate_positions[bound["atomId1"]]
            right = candidate_positions[bound["atomId2"]]
            squared = sum((a - b) ** 2 for a, b in zip(left, right))
            minimum = Decimal(bound["minAngstrom"])
            maximum = Decimal(bound["maxAngstrom"])
            if squared < minimum ** 2 or squared > maximum ** 2:
                issues.append("distance-out-of-range")
        for atom_id in payload["policy"]["fixedAtomIds"]:
            if expected_positions[atom_id] != candidate_positions[atom_id]:
                issues.append("fixed-atom-changed")

        def sub(left: tuple[Decimal, ...], right: tuple[Decimal, ...]) -> tuple[Decimal, ...]:
            return tuple(a - b for a, b in zip(left, right))

        def cross(left: tuple[Decimal, ...], right: tuple[Decimal, ...]) -> tuple[Decimal, ...]:
            return (
                left[1] * right[2] - left[2] * right[1],
                left[2] * right[0] - left[0] * right[2],
                left[0] * right[1] - left[1] * right[0],
            )

        def dot(left: tuple[Decimal, ...], right: tuple[Decimal, ...]) -> Decimal:
            return sum(a * b for a, b in zip(left, right))

        def signed_volume6(
            positions: Mapping[str, tuple[Decimal, ...]],
            atom_ids: list[str],
        ) -> Decimal:
            a, b, c, d = (positions[atom_id] for atom_id in atom_ids)
            return dot(sub(b, a), cross(sub(c, a), sub(d, a)))

        for check in payload["policy"]["orientationChecks"]:
            expected_volume = signed_volume6(expected_positions, check["atomIds"])
            candidate_volume = signed_volume6(candidate_positions, check["atomIds"])
            minimum = Decimal(check["minAbsVolume6"]) / (scale ** 3)
            if abs(expected_volume) < minimum or expected_volume == 0:
                issues.append("policy-invalid")
            elif (
                abs(candidate_volume) < minimum
                or candidate_volume == 0
                or (expected_volume > 0) != (candidate_volume > 0)
            ):
                issues.append("orientation-invalid")

        for group in payload["policy"]["rigidAtomGroups"]:
            atom_ids = group["atomIds"]
            tolerance = Decimal(group["maxSquaredDistanceDelta"]) / (scale ** 2)
            distorted = False
            for left_index, left_id in enumerate(atom_ids):
                for right_id in atom_ids[left_index + 1:]:
                    expected_squared = sum(
                        (a - b) ** 2
                        for a, b in zip(expected_positions[left_id], expected_positions[right_id])
                    )
                    candidate_squared = sum(
                        (a - b) ** 2
                        for a, b in zip(candidate_positions[left_id], candidate_positions[right_id])
                    )
                    if abs(expected_squared - candidate_squared) > tolerance:
                        distorted = True
                        break
                if distorted:
                    break
            if distorted:
                issues.append("rigid-group-distorted")
        return tuple(dict.fromkeys(issues))
    except (OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError, InvalidOperation):
        return None


def check_formal_geometry(
    request_path: Path | str,
    *,
    lean_command: Sequence[str] | str | Path = DEFAULT_LEAN_COMMAND,
    geometry_root: Path | str = DEFAULT_GEOMETRY_ROOT,
    timeout_seconds: float = 30.0,
    trusted_lean_sha256: str | None = None,
    trusted_launcher_sha256: str | None = None,
) -> FormalGeometryCheckResult:
    try:
        request = Path(request_path)
        root = Path(geometry_root)
    except (TypeError, ValueError, OSError) as error:
        return _indeterminate("checker-configuration-invalid", str(error))
    generator = root / "tools" / "json_to_lean.py"
    if not request.is_file():
        return _indeterminate("request-unavailable", "request path is not a file")
    if not root.is_dir() or not generator.is_file():
        return _indeterminate("generator-unavailable", "formal geometry generator is unavailable")
    try:
        command = _normalize_command(lean_command)
        timeout = float(timeout_seconds)
        if not math.isfinite(timeout) or timeout <= 0:
            raise ValueError("timeout must be positive")
    except (TypeError, ValueError) as error:
        return _indeterminate("checker-configuration-invalid", str(error))

    command = _resolved_command(command)
    if command is None:
        return _indeterminate("lean-unavailable", "Lean command could not be resolved")
    launcher_sha256 = _sha256(Path(command[0]))
    compiler = _resolve_lean_compiler(command, cwd=root, timeout=timeout)
    if compiler is None:
        return _indeterminate("lean-compiler-unavailable", "Lean compiler could not be resolved")
    lean_sha256 = _sha256(compiler)
    trusted_digest = trusted_lean_sha256 or os.environ.get("RETAINMOL_TRUSTED_LEAN_SHA256")
    trusted_launcher_digest = (
        trusted_launcher_sha256
        or os.environ.get("RETAINMOL_TRUSTED_LEAN_LAUNCHER_SHA256")
    )
    evidence = {
        "leanLauncher": command[0],
        "leanLauncherSha256": launcher_sha256,
        "leanExecutable": str(compiler),
        "leanExecutableSha256": lean_sha256,
        "generatorSha256": _sha256(generator),
        "formalSourceTreeSha256": _source_tree_sha256(root),
    }
    if not trusted_digest:
        return _indeterminate(
            "lean-trust-unconfigured",
            "trusted Lean SHA-256 is not configured",
            evidence=evidence,
        )
    if trusted_digest != lean_sha256:
        return _indeterminate(
            "lean-trust-mismatch",
            "Lean executable SHA-256 does not match trust policy",
            evidence=evidence,
        )
    if not trusted_launcher_digest:
        return _indeterminate(
            "lean-launcher-trust-unconfigured",
            "trusted Lean launcher SHA-256 is not configured",
            evidence=evidence,
        )
    if trusted_launcher_digest != launcher_sha256:
        return _indeterminate(
            "lean-launcher-trust-mismatch",
            "Lean launcher SHA-256 does not match trust policy",
            evidence=evidence,
        )

    with tempfile.TemporaryDirectory(prefix="retainmol_formal_geometry_") as directory:
        generated = Path(directory) / "EvaluateGeometry.lean"
        try:
            generation = subprocess.run(
                [
                    sys.executable,
                    str(generator),
                    str(request),
                    str(generated),
                    "--mode",
                    "evaluate",
                ],
                cwd=root,
                capture_output=True,
                text=True,
                timeout=timeout,
            )
        except subprocess.TimeoutExpired:
            return _indeterminate("generator-timeout", "formal geometry generation timed out")
        except OSError:
            return _indeterminate("generator-unavailable", "formal geometry generator could not start")
        except UnicodeError:
            return _indeterminate("generator-failed", "formal geometry generator output is invalid")
        if generation.returncode != 0 or not generated.is_file():
            return _indeterminate("generator-failed", "request schema or generation failed")
        exact_issues = _exact_geometry_issues(request)
        if exact_issues:
            if "policy-invalid" in exact_issues:
                return _indeterminate(
                    "exact-geometry-policy-invalid",
                    *exact_issues,
                    evidence={**evidence, "generatedLeanSha256": _sha256(generated)},
                )
            return FormalGeometryCheckResult(
                status=VerificationStatus.REJECT,
                code="exact-geometry-policy-rejected",
                issues=exact_issues,
                evidence={**evidence, "generatedLeanSha256": _sha256(generated)},
            )

        try:
            evaluation = subprocess.run(
                [*command, str(generated)],
                cwd=root,
                capture_output=True,
                text=True,
                timeout=timeout,
            )
        except subprocess.TimeoutExpired:
            return _indeterminate("lean-timeout", "Lean evaluation timed out")
        except OSError:
            return _indeterminate("lean-unavailable", "Lean command could not start")
        except UnicodeError:
            return _indeterminate("lean-output-invalid", "Lean result marker could not be parsed")
        if evaluation.returncode != 0:
            return _indeterminate("lean-failed", "Lean evaluation failed")
        try:
            result = parse_lean_evaluation_output(evaluation.stdout)
            return replace(
                result,
                evidence={**evidence, "generatedLeanSha256": _sha256(generated)},
            )
        except (json.JSONDecodeError, ValueError, TypeError):
            return _indeterminate("lean-output-invalid", "Lean result marker could not be parsed")


run_formal_geometry_check = check_formal_geometry
