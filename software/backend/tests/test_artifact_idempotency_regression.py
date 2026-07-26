"""Regression: the (run_id, name) idempotency key must cover semantic content.

Collectors keep the scientific result (energy, converged, structure, ...) in
artifact metadata rather than in the file bytes. Before the fix a replay with
identical bytes but different metadata or media_type silently returned the
stale record; now it is rejected like any other content conflict.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

import pytest

from software.backend.jobs import JobService


def _setup(tmp_path: Path):
    service = JobService(tmp_path / "data")
    job = service.create_job("xtb-optimization")
    assert service.claim_queued_job(job.job_id) is not None
    run = service.get_active_job_run(job.job_id)
    path = service.task_directory(job.job_id) / "optimized.xyz"
    path.write_text("2\nwater\nO 0 0 0\nH 0 0 1\n", encoding="utf-8")
    return service, job, run


def _metadata(energy: float, converged: bool) -> dict:
    return {
        "role": "output",
        "format": "xyz",
        "energyHartree": energy,
        "converged": converged,
    }


def test_identical_replay_is_still_idempotent(tmp_path: Path) -> None:
    service, job, run = _setup(tmp_path)

    first = service.add_artifact(
        job.job_id,
        "optimized.xyz",
        "optimized.xyz",
        media_type="chemical/x-xyz",
        metadata=_metadata(-5.07, False),
        run_id=run.run_id,
    )
    replay = service.add_artifact(
        job.job_id,
        "optimized.xyz",
        "optimized.xyz",
        media_type="chemical/x-xyz",
        metadata=_metadata(-5.07, False),
        run_id=run.run_id,
    )

    assert replay.artifact_id == first.artifact_id
    assert len(service.get_job(job.job_id).artifacts) == 1


def test_same_bytes_but_different_metadata_is_rejected(tmp_path: Path) -> None:
    service, job, run = _setup(tmp_path)
    service.add_artifact(
        job.job_id,
        "optimized.xyz",
        "optimized.xyz",
        media_type="chemical/x-xyz",
        metadata=_metadata(-5.07, False),
        run_id=run.run_id,
    )

    with pytest.raises(sqlite3.IntegrityError, match="different artifact"):
        service.add_artifact(
            job.job_id,
            "optimized.xyz",
            "optimized.xyz",
            media_type="chemical/x-xyz",
            metadata=_metadata(-5.10, True),
            run_id=run.run_id,
        )

    # The stale record was not silently returned and no duplicate was added.
    artifacts = service.get_job(job.job_id).artifacts
    assert len(artifacts) == 1
    assert artifacts[0].metadata["energyHartree"] == -5.07
    assert artifacts[0].metadata["converged"] is False


def test_same_bytes_but_different_media_type_is_rejected(
    tmp_path: Path,
) -> None:
    service, job, run = _setup(tmp_path)
    service.add_artifact(
        job.job_id,
        "optimized.xyz",
        "optimized.xyz",
        media_type="chemical/x-xyz",
        metadata=_metadata(-5.07, False),
        run_id=run.run_id,
    )

    with pytest.raises(sqlite3.IntegrityError, match="different artifact"):
        service.add_artifact(
            job.job_id,
            "optimized.xyz",
            "optimized.xyz",
            media_type="text/plain",
            metadata=_metadata(-5.07, False),
            run_id=run.run_id,
        )
