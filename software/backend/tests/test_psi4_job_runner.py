"""Tests for Psi4 calculations executed through persisted jobs."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from software.backend.jobs import JobService
import software.backend.jobs.psi4_runner as psi4_runner


def _structure() -> dict[str, Any]:
    return {
        "name": "Hydrogen",
        "atoms": [
            {"id": "h1", "symbol": "H", "x": 0.0, "y": 0.0, "z": -0.35},
            {"id": "h2", "symbol": "H", "x": 0.0, "y": 0.0, "z": 0.35},
        ],
    }


def _create_job(service: JobService, kind: str, payload: dict[str, Any] | None = None):
    return service.create_calculation_job(
        kind,
        "psi4",
        {
            "charge": 0,
            "multiplicity": 1,
            "method": "hf",
            "basis": "sto-3g",
            "timeoutSeconds": 60,
            **(payload or {}),
        },
        inputs={
            "structure": {
                "sourceKind": "literal",
                "format": "molecule",
                "value": {"format": "molecule", "structure": _structure()},
            }
        },
        metadata={"name": "Psi4 test"},
    )


def _fake_operation(
    request: dict[str, Any], work: Path, *, timeout: int, cancel_check=None
) -> dict[str, Any]:
    assert timeout == 60
    work.mkdir(parents=True, exist_ok=True)
    result: dict[str, Any] = {
        "operation": request["operation"],
        "energyHartree": -1.1,
        "method": "hf",
        "basis": "sto-3g",
        "psi4Version": "1.11",
    }
    if request["operation"] in {"ts-refine", "irc"}:
        result["structure"] = _structure()
    if request["operation"] == "frequency":
        result["frequenciesCm1"] = [-100.0, 1200.0]
        result["imaginaryFrequencyCount"] = 1
    (work / "psi4-result.json").write_text(json.dumps(result), encoding="utf-8")
    (work / "psi4.log").write_text("Psi4 output\n", encoding="utf-8")
    return result


def test_ts_refinement_publishes_structure_result_and_log(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    service = JobService(tmp_path / "data")
    job = _create_job(service, "psi4-ts-refine", {"maxSteps": 30})
    monkeypatch.setattr(psi4_runner, "run_psi4_operation", _fake_operation)

    completed = psi4_runner.run_psi4_job(service, job.job_id)

    assert completed.status == "succeeded"
    artifacts = {artifact.name: artifact for artifact in completed.artifacts}
    assert set(artifacts) == {
        "transition-state.xyz",
        "psi4-result.json",
        "psi4.log",
    }
    assert artifacts["transition-state.xyz"].metadata["energyHartree"] == -1.1


def test_frequency_publishes_imaginary_mode_summary(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    service = JobService(tmp_path / "data")
    job = _create_job(service, "psi4-frequency")
    monkeypatch.setattr(psi4_runner, "run_psi4_operation", _fake_operation)

    completed = psi4_runner.run_psi4_job(service, job.job_id)

    result_artifact = next(
        artifact for artifact in completed.artifacts if artifact.name == "psi4-result.json"
    )
    assert result_artifact.metadata["imaginaryFrequencyCount"] == 1


def test_bidirectional_irc_publishes_two_endpoints(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    service = JobService(tmp_path / "data")
    job = _create_job(service, "psi4-irc", {"direction": "both", "points": 3})
    directions: list[str] = []

    def run(request: dict[str, Any], work: Path, *, timeout: int, cancel_check=None) -> dict[str, Any]:
        directions.append(request["direction"])
        return _fake_operation(request, work, timeout=timeout, cancel_check=cancel_check)

    monkeypatch.setattr(psi4_runner, "run_psi4_operation", run)

    completed = psi4_runner.run_psi4_job(service, job.job_id)

    assert directions == ["forward", "backward"]
    assert {artifact.name for artifact in completed.artifacts} == {
        "irc-forward-endpoint.xyz",
        "irc-forward.json",
        "psi4-forward.log",
        "irc-backward-endpoint.xyz",
        "irc-backward.json",
        "psi4-backward.log",
    }


def test_failed_psi4_job_does_not_remain_running(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    service = JobService(tmp_path / "data")
    job = _create_job(service, "psi4-frequency")
    monkeypatch.setattr(
        psi4_runner,
        "run_psi4_operation",
        lambda *_args, **_kwargs: (_ for _ in ()).throw(
            psi4_runner.Psi4ExecutionError("SCF failed")
        ),
    )

    with pytest.raises(psi4_runner.JobExecutionError, match="SCF failed"):
        psi4_runner.run_psi4_job(service, job.job_id)

    failed = service.get_job(job.job_id)
    assert failed.status == "failed"
    assert failed.error_code == "psi4_execution_failed"
