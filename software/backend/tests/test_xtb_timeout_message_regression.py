"""Regression: xTB timeout errors must report the configured timeout.

Before the fix the durable runner hard-coded "xTB job timed out after
5 minutes" while the timeout itself was already configurable (5-86400 s).
"""

from __future__ import annotations

import subprocess
from pathlib import Path

import pytest

from software.backend.jobs import JobService
import software.backend.jobs.job_types.xtb.executor as xtb_executor
import software.backend.jobs.xtb_runner as xtb_runner


def _request(timeout_seconds: int) -> dict:
    return {
        "name": "Water optimization",
        "structure": {
            "name": "Water",
            "atoms": [
                {"id": "oxygen", "symbol": "O", "x": 0.0, "y": 0.0, "z": 0.0},
                {"id": "hydrogen", "symbol": "H", "x": 0.0, "y": 0.0, "z": 1.0},
            ],
        },
        "charge": 0,
        "multiplicity": 1,
        "method": "gfn2",
        "maxSteps": 200,
        "optLevel": "normal",
        "timeoutSeconds": timeout_seconds,
    }


def test_timeout_error_reports_configured_timeout_seconds(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    service = JobService(tmp_path / "data")
    job = service.create_job(
        "xtb-optimization",
        metadata={"name": "Water optimization", "request": _request(3600)},
    )
    seen: dict[str, float] = {}

    def fake_run(
        _request: object,
        *,
        work_directory: Path,
        log_path: Path,
        timeout: float,
        **_: object,
    ) -> None:
        seen["timeout"] = timeout
        raise subprocess.TimeoutExpired(cmd=["xtb"], timeout=timeout)

    monkeypatch.setattr(xtb_executor, "run_xtb_process", fake_run)

    with pytest.raises(
        xtb_runner.JobExecutionError, match="timed out after 3600 seconds"
    ):
        xtb_runner.run_xtb_optimization_job(service, job.job_id)

    assert seen["timeout"] == 3600
    failed = service.get_job(job.job_id)
    assert failed.status == "failed"
    assert failed.error_code == "timeout"
    assert failed.error == "xTB job timed out after 3600 seconds"
    assert "5 minutes" not in (failed.error or "")
