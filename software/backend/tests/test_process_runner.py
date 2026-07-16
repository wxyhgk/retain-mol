"""Tests for the shared cancellable calculation process runner."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

from software.backend.engines.process_runner import (
    ProcessCancelledError,
    run_live_process,
)


def test_process_output_is_persisted_to_the_live_log(tmp_path: Path) -> None:
    log_path = tmp_path / "calculation.log"

    result = run_live_process(
        [sys.executable, "-u", "-c", "print('step 1'); print('step 2')"],
        cwd=tmp_path,
        log_path=log_path,
        timeout=5,
        poll_interval=0.01,
    )

    assert result.returncode == 0
    assert result.stdout == "step 1\nstep 2\n"
    assert log_path.read_text(encoding="utf-8") == result.stdout


def test_cancellation_terminates_the_process_and_keeps_partial_log(
    tmp_path: Path,
) -> None:
    log_path = tmp_path / "calculation.log"
    polls = 0

    def cancel_after_output_started() -> bool:
        nonlocal polls
        polls += 1
        return polls >= 4

    with pytest.raises(ProcessCancelledError, match="cancelled"):
        run_live_process(
            [
                sys.executable,
                "-u",
                "-c",
                "import time; print('started', flush=True); time.sleep(30)",
            ],
            cwd=tmp_path,
            log_path=log_path,
            timeout=5,
            cancel_check=cancel_after_output_started,
            poll_interval=0.02,
        )

    assert "started" in log_path.read_text(encoding="utf-8")
