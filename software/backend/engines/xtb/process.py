"""Shared blocking process invocation for xTB calculations."""

from __future__ import annotations

from collections.abc import Callable
from pathlib import Path

try:
    from engines.process_runner import LiveProcessResult, run_live_process
except ModuleNotFoundError:
    from software.backend.engines.process_runner import (
        LiveProcessResult,
        run_live_process,
    )

from .command import build_xtb_command
from .contracts import XtbOptimizationRequest
from .errors import XtbInvalidStructureError
from .geometry import write_xyz


def run_xtb_process(
    request: XtbOptimizationRequest,
    *,
    work_directory: Path,
    log_path: Path,
    timeout: float = 300,
    cancel_check: Callable[[], bool] | None = None,
) -> LiveProcessResult:
    """Prepare and run xTB while preserving output and cancellation semantics."""
    if len(request.atoms) < 2:
        raise XtbInvalidStructureError("至少需要 2 个原子")

    input_path = work_directory / "input.xyz"
    write_xyz(input_path, request.atoms)
    return run_live_process(
        build_xtb_command(request, input_path, work_directory),
        cwd=work_directory,
        log_path=log_path,
        timeout=timeout,
        cancel_check=cancel_check,
    )


__all__ = ["run_xtb_process"]
