"""Tests for versioned JobType data and concrete execution runs."""

from __future__ import annotations

import sqlite3
from pathlib import Path

import pytest

from software.backend.jobs import InvalidJobInputError, JobService


def test_calculation_job_persists_canonical_job_type_data(tmp_path: Path) -> None:
    service = JobService(tmp_path / "data")

    job = service.create_calculation_job(
        "xtb-optimization",
        "xtb",
        {"charge": 0, "method": "gfn2"},
        inputs={
            "structure": {
                "sourceKind": "literal",
                "format": "molecule",
                "value": {"format": "molecule", "structure": {"atoms": []}},
            }
        },
    )

    job_type_data = service.get_job_type_data(job.job_id)
    assert job_type_data.job_type == "xtb-optimization"
    assert job_type_data.job_type_version == 1
    assert job_type_data.data == {
        "engine": "xtb",
        "parameters": {
            "fixedAtomIds": [],
            "charge": 0,
            "multiplicity": 1,
            "method": "gfn2",
            "maxSteps": 200,
            "optLevel": "normal",
            "threads": 1,
            "memoryMb": 1024,
            "timeoutSeconds": 300,
        },
    }


def test_invalid_registered_job_type_data_is_not_persisted(tmp_path: Path) -> None:
    service = JobService(tmp_path / "data")

    with pytest.raises(InvalidJobInputError, match="xtb-optimization@1"):
        service.create_calculation_job(
            "xtb-optimization",
            "xtb",
            {"maxSteps": 0},
            inputs={
                "structure": {
                    "sourceKind": "literal",
                    "format": "molecule",
                    "value": {
                        "format": "molecule",
                        "structure": {
                            "atoms": [
                                {
                                    "id": "h",
                                    "symbol": "H",
                                    "x": 0,
                                    "y": 0,
                                    "z": 0,
                                }
                            ]
                        },
                    },
                }
            },
        )

    assert service.list_jobs() == []


def test_frequency_draft_rejects_transition_state_only_parameters(
    tmp_path: Path,
) -> None:
    service = JobService(tmp_path / "data")

    with pytest.raises(InvalidJobInputError, match="psi4-frequency@1"):
        service.create_calculation_draft(
            "psi4-frequency",
            "psi4",
            {"maxSteps": 25},
        )

    assert service.list_jobs() == []


def test_claiming_and_finishing_job_updates_one_concrete_run(tmp_path: Path) -> None:
    service = JobService(tmp_path / "data")
    job = service.create_job("xtb-optimization")

    claimed = service.claim_queued_job(job.job_id)

    assert claimed is not None
    run = service.get_active_job_run(job.job_id)
    assert run.run_number == 1
    assert run.engine == "xtb"
    assert run.collector_id == "xtb-geometry-optimization"
    assert run.collector_version == 1
    assert run.status == "running"

    service.update_status(job.job_id, "succeeded")

    completed_runs = service.list_job_runs(job.job_id)
    assert len(completed_runs) == 1
    assert completed_runs[0].run_id == run.run_id
    assert completed_runs[0].status == "succeeded"
    assert completed_runs[0].finished_at is not None


def test_only_one_worker_can_create_the_first_run(tmp_path: Path) -> None:
    service = JobService(tmp_path / "data")
    job = service.create_job("xtb-optimization")

    assert service.claim_queued_job(job.job_id) is not None
    assert service.claim_queued_job(job.job_id) is None
    assert len(service.list_job_runs(job.job_id)) == 1


def test_run_artifact_registration_is_idempotent_by_name_and_content(
    tmp_path: Path,
) -> None:
    service = JobService(tmp_path / "data")
    job = service.create_job("xtb-optimization")
    assert service.claim_queued_job(job.job_id) is not None
    run = service.get_active_job_run(job.job_id)
    path = service.task_directory(job.job_id) / "xtb.log"
    path.write_text("normal termination\n", encoding="utf-8")

    first = service.add_artifact(
        job.job_id,
        "xtb.log",
        "xtb.log",
        run_id=run.run_id,
        metadata={"role": "output", "format": "log"},
    )
    second = service.add_artifact(
        job.job_id,
        "xtb.log",
        "xtb.log",
        run_id=run.run_id,
        metadata={"role": "output", "format": "log"},
    )

    assert second.artifact_id == first.artifact_id
    assert len(service.get_job(job.job_id).artifacts) == 1

    path.write_text("different bytes\n", encoding="utf-8")
    with pytest.raises(sqlite3.IntegrityError, match="different artifact"):
        service.add_artifact(
            job.job_id,
            "xtb.log",
            "xtb.log",
            run_id=run.run_id,
            metadata={"role": "output", "format": "log"},
        )
