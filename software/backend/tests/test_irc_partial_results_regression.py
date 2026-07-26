"""Regression: a failed IRC branch must not discard the finished branch.

Before the fix, ``Psi4IrcExecutor`` ran both directional branches before any
collection, so a backward-branch failure threw away every forward-branch
result and published zero diagnostic artifacts.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from software.backend.jobs import JobService
import software.backend.jobs.job_types.psi4.executor as psi4_executor
import software.backend.jobs.psi4_runner as psi4_runner


def _structure() -> dict[str, Any]:
    return {
        "name": "Hydrogen",
        "atoms": [
            {"id": "h1", "symbol": "H", "x": 0.0, "y": 0.0, "z": -0.35},
            {"id": "h2", "symbol": "H", "x": 0.0, "y": 0.0, "z": 0.35},
        ],
    }


def _create_irc_job(service: JobService):
    return service.create_calculation_job(
        "psi4-irc",
        "psi4",
        {
            "charge": 0,
            "multiplicity": 1,
            "method": "hf",
            "basis": "sto-3g",
            "timeoutSeconds": 60,
            "direction": "both",
            "points": 3,
        },
        inputs={
            "structure": {
                "sourceKind": "literal",
                "format": "molecule",
                "value": {"format": "molecule", "structure": _structure()},
            }
        },
        metadata={"name": "IRC regression"},
    )


def _successful_branch(request: dict[str, Any], work: Path) -> dict[str, Any]:
    work.mkdir(parents=True, exist_ok=True)
    result: dict[str, Any] = {
        "operation": "irc",
        "direction": request["direction"],
        "energyHartree": -1.1,
        "method": "hf",
        "basis": "sto-3g",
        "psi4Version": "1.11",
        "structure": _structure(),
    }
    (work / "psi4-result.json").write_text(json.dumps(result), encoding="utf-8")
    (work / "psi4.log").write_text("forward branch output\n", encoding="utf-8")
    return result


def test_backward_failure_still_publishes_forward_artifacts_and_diagnostics(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    service = JobService(tmp_path / "data")
    job = _create_irc_job(service)

    def run(
        request: dict[str, Any],
        work: Path,
        *,
        timeout: int,
        cancel_check=None,
    ) -> dict[str, Any]:
        if request["direction"] == "forward":
            return _successful_branch(request, work)
        work.mkdir(parents=True, exist_ok=True)
        (work / "psi4.log").write_text(
            "SCF did not converge\n", encoding="utf-8"
        )
        raise psi4_runner.Psi4ExecutionError("SCF failed in backward branch")

    monkeypatch.setattr(psi4_executor, "run_psi4_operation", run)

    with pytest.raises(
        psi4_runner.JobExecutionError, match="SCF failed in backward branch"
    ):
        psi4_runner.run_psi4_job(service, job.job_id)

    failed = service.get_job(job.job_id)
    assert failed.status == "failed"
    assert failed.error_code == "psi4_execution_failed"

    names = {artifact.name for artifact in failed.artifacts}
    # Finished forward branch: endpoint structure, result JSON, and log.
    assert {
        "irc-forward-endpoint.xyz",
        "irc-forward.json",
        "psi4-forward.log",
    } <= names
    # Failed backward branch: its diagnostic log is published too.
    assert "psi4-backward.log" in names

    run_record = service.list_job_runs(job.job_id)[0]
    assert run_record.status == "failed"
    assert {artifact.run_id for artifact in failed.artifacts} == {
        run_record.run_id
    }

    forward_json = next(
        artifact
        for artifact in failed.artifacts
        if artifact.name == "irc-forward.json"
    )
    assert forward_json.metadata["energyHartree"] == -1.1


def test_first_branch_failure_publishes_only_its_diagnostic_log(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    service = JobService(tmp_path / "data")
    job = _create_irc_job(service)

    def run(
        request: dict[str, Any],
        work: Path,
        *,
        timeout: int,
        cancel_check=None,
    ) -> dict[str, Any]:
        work.mkdir(parents=True, exist_ok=True)
        (work / "psi4.log").write_text("early crash\n", encoding="utf-8")
        raise psi4_runner.Psi4ExecutionError("forward branch crashed")

    monkeypatch.setattr(psi4_executor, "run_psi4_operation", run)

    with pytest.raises(psi4_runner.JobExecutionError, match="forward branch"):
        psi4_runner.run_psi4_job(service, job.job_id)

    failed = service.get_job(job.job_id)
    assert failed.status == "failed"
    assert {artifact.name for artifact in failed.artifacts} == {
        "psi4-forward.log"
    }
