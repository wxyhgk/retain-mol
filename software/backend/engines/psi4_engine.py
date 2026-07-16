"""Process-isolated Psi4 execution adapter.

Psi4 owns process-global output, memory, and thread settings. Keeping actual
calculations in a child process prevents one request from leaking those values
into another request or into the FastAPI process.
"""

from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import tempfile
from dataclasses import asdict, dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any, Callable

from .process_runner import ProcessCancelledError, run_live_process


class Psi4ExecutionError(RuntimeError):
    """Raised when Psi4 is unavailable or a calculation fails."""


class Psi4CancelledError(Psi4ExecutionError):
    """Raised when a persisted Psi4 job requests cooperative cancellation."""


@dataclass(frozen=True)
class Psi4RuntimeInfo:
    available: bool
    version: str | None
    python: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@lru_cache(maxsize=1)
def detect_psi4_runtime() -> Psi4RuntimeInfo:
    """Report whether the active backend Python can import Psi4."""
    available = importlib.util.find_spec("psi4") is not None
    psi4_version: str | None = None
    if available:
        try:
            with tempfile.TemporaryDirectory(prefix="retainmol_psi4_probe_") as temp_dir:
                probe = subprocess.run(
                    [sys.executable, "-c", "import psi4; print(psi4.__version__)"],
                    cwd=temp_dir,
                    capture_output=True,
                    text=True,
                    timeout=15,
                )
            if probe.returncode == 0:
                psi4_version = probe.stdout.strip() or "unknown"
            else:
                available = False
        except (OSError, subprocess.SubprocessError):
            available = False
            psi4_version = "unknown"
    return Psi4RuntimeInfo(
        available=available,
        version=psi4_version,
        python=sys.executable,
    )


def run_psi4_single_point(
    request: dict[str, Any],
    *,
    timeout: int = 300,
) -> dict[str, Any]:
    """Run one energy calculation in a fresh Python process."""
    with tempfile.TemporaryDirectory(prefix="retainmol_psi4_") as temp_dir:
        payload = dict(request)
        payload["operation"] = "single-point"
        return run_psi4_operation(payload, Path(temp_dir), timeout=timeout)


def run_psi4_operation(
    request: dict[str, Any],
    work: Path,
    *,
    timeout: int = 300,
    cancel_check: Callable[[], bool] | None = None,
) -> dict[str, Any]:
    """Run one Psi4 operation in a fresh process and retain its output files."""
    runtime = detect_psi4_runtime()
    if not runtime.available:
        raise Psi4ExecutionError(
            "Psi4 is unavailable in the active backend Python environment"
        )

    worker = Path(__file__).with_name("psi4_worker.py")
    work.mkdir(parents=True, exist_ok=True)
    input_path = work / "psi4-request.json"
    output_path = work / "psi4-result.json"
    log_path = work / "psi4.log"
    payload = dict(request)
    payload["outputPath"] = str(output_path)
    payload["logPath"] = str(log_path)
    input_path.write_text(json.dumps(payload), encoding="utf-8")

    process_log_path = work / "psi4-process.log"
    try:
        process = run_live_process(
            [sys.executable, str(worker), str(input_path)],
            cwd=work,
            log_path=process_log_path,
            timeout=timeout,
            cancel_check=cancel_check,
        )
    except ProcessCancelledError as error:
        raise Psi4CancelledError("Psi4 calculation was cancelled") from error
    except subprocess.TimeoutExpired as error:
        raise Psi4ExecutionError(
            f"Psi4 calculation timed out after {timeout} seconds"
        ) from error

    if process.returncode != 0 or not output_path.is_file():
        log_tail = _read_tail(log_path)
        detail = process.stderr.strip() or process.stdout.strip() or log_tail
        raise Psi4ExecutionError(
            f"Psi4 calculation failed (exit {process.returncode}): "
            f"{detail[-1200:]}"
        )

    try:
        result = json.loads(output_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise Psi4ExecutionError("Psi4 returned an invalid result file") from error
    if not isinstance(result, dict) or "energyHartree" not in result:
        raise Psi4ExecutionError("Psi4 result does not contain an energy")
    return result


def _read_tail(path: Path, limit: int = 1200) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="replace")[-limit:]
    except OSError:
        return ""
