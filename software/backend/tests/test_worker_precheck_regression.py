"""Regression: worker precheck failures must not strand jobs in 'queued'.

A job's dispatch row is single-shot: once a worker consumes it, the job can
never be re-dispatched. Before the fix, a jobType@version mismatch (or missing
JobType data) raised before the claim, the dispatch was finished in the worker
finally-block, and the job stayed 'queued' forever with no error surface.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

import pytest

from software.backend.jobs import JobService
from software.backend.jobs.execution import JobExecutionError, run_persisted_job
from software.backend.jobs import InvalidJobOperationError


def _database(tmp_path: Path) -> Path:
    return tmp_path / "data" / "retainmol.sqlite"


def test_job_type_version_mismatch_marks_job_failed_instead_of_stranding_it(
    tmp_path: Path,
) -> None:
    service = JobService(tmp_path / "data")
    job = service.create_job("xtb-optimization")
    assert job.status == "queued"

    with sqlite3.connect(_database(tmp_path)) as connection:
        connection.execute(
            "UPDATE job_type_data SET job_type_version = 2 WHERE job_id = ?",
            (job.job_id,),
        )

    with pytest.raises(JobExecutionError, match=r"requires xtb-optimization@2"):
        run_persisted_job(service, job.job_id)

    failed = service.get_job(job.job_id)
    assert failed.status == "failed"
    assert failed.error_code == "job_type_version_mismatch"
    assert "xtb-optimization@2" in (failed.error or "")

    # The failure is terminal and visible: a repeated execute request is
    # rejected loudly instead of silently accepting a job that can never run.
    with pytest.raises(InvalidJobOperationError, match="only queued jobs"):
        service.request_job_dispatch(job.job_id, max_inflight=4)

    runs = service.list_job_runs(job.job_id)
    assert len(runs) == 1
    assert runs[0].status == "failed"


def test_missing_job_type_data_marks_job_failed(tmp_path: Path) -> None:
    service = JobService(tmp_path / "data")
    job = service.create_job("xtb-optimization")

    with sqlite3.connect(_database(tmp_path)) as connection:
        connection.execute(
            "DELETE FROM job_type_data WHERE job_id = ?", (job.job_id,)
        )

    with pytest.raises(JobExecutionError, match="no readable JobType data"):
        run_persisted_job(service, job.job_id)

    failed = service.get_job(job.job_id)
    assert failed.status == "failed"
    assert failed.error_code == "job_type_data_unavailable"


def test_precheck_failure_on_non_queued_job_still_raises_without_side_effects(
    tmp_path: Path,
) -> None:
    """If the job is not claimable the precheck only raises; no bogus run."""
    service = JobService(tmp_path / "data")
    job = service.create_job("xtb-optimization")
    service.cancel_job(job.job_id)

    with sqlite3.connect(_database(tmp_path)) as connection:
        connection.execute(
            "UPDATE job_type_data SET job_type_version = 2 WHERE job_id = ?",
            (job.job_id,),
        )

    with pytest.raises(JobExecutionError, match=r"requires xtb-optimization@2"):
        run_persisted_job(service, job.job_id)

    assert service.get_job(job.job_id).status == "cancelled"
    assert service.list_job_runs(job.job_id) == []
