"""Small cancellable subprocess primitive shared by calculation engines."""

from __future__ import annotations

import os
import signal
import subprocess
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Sequence


class ProcessCancelledError(RuntimeError):
    """Raised after a requested calculation process has been terminated."""


@dataclass(frozen=True)
class LiveProcessResult:
    returncode: int
    stdout: str
    stderr: str = ""


def run_live_process(
    command: Sequence[str],
    *,
    cwd: Path,
    log_path: Path,
    timeout: int,
    cancel_check: Callable[[], bool] | None = None,
    poll_interval: float = 0.2,
) -> LiveProcessResult:
    """Stream combined output to disk while polling timeout and cancellation."""
    started = time.monotonic()
    log_path.parent.mkdir(parents=True, exist_ok=True)
    with log_path.open("w", encoding="utf-8") as log:
        process = subprocess.Popen(
            list(command),
            cwd=cwd,
            stdout=log,
            stderr=subprocess.STDOUT,
            text=True,
            start_new_session=True,
        )
        while process.poll() is None:
            if cancel_check is not None and cancel_check():
                _stop_process(process)
                raise ProcessCancelledError("calculation was cancelled")
            if time.monotonic() - started >= timeout:
                _stop_process(process)
                raise subprocess.TimeoutExpired(list(command), timeout)
            time.sleep(poll_interval)
    output = log_path.read_text(encoding="utf-8", errors="replace")
    return LiveProcessResult(returncode=int(process.returncode or 0), stdout=output)


def _stop_process(process: subprocess.Popen[str]) -> None:
    if process.poll() is not None:
        return
    try:
        os.killpg(process.pid, signal.SIGTERM)
        process.wait(timeout=3)
    except (ProcessLookupError, subprocess.TimeoutExpired):
        try:
            os.killpg(process.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        process.wait(timeout=3)


__all__ = ["LiveProcessResult", "ProcessCancelledError", "run_live_process"]
