from __future__ import annotations

import pytest

from software.backend.jobs import (
    InvalidJobOperationError,
    InvalidJobTransitionError,
    JobService,
)
from software.backend.jobs.dispatching import JobDispatchCoordinator
from software.backend.jobs.lifecycle import JobLifecycle


def _components(tmp_path):
    service = JobService(tmp_path / "data")
    lifecycle = JobLifecycle(service.repository)
    dispatches = JobDispatchCoordinator(service.repository, lifecycle)
    return service, lifecycle, dispatches


def test_lifecycle_owns_transition_policy_and_completed_alias(tmp_path) -> None:
    service, lifecycle, _ = _components(tmp_path)
    job = service.create_job("geometry-optimization")

    with pytest.raises(InvalidJobTransitionError):
        lifecycle.transition(job.job_id, "succeeded")

    claimed = lifecycle.claim_queued(
        job.job_id,
        engine="xtb",
        collector_id="xtb-output",
        collector_version=1,
    )
    assert claimed is not None
    completed = lifecycle.transition(job.job_id, "completed")

    assert completed.status == "succeeded"
    assert lifecycle.list_runs(job.job_id)[0].status == "succeeded"


def test_lifecycle_cancel_is_idempotent_and_rejects_terminal_jobs(tmp_path) -> None:
    service, lifecycle, _ = _components(tmp_path)
    cancelled_job = service.create_job("single-point")

    assert lifecycle.cancel(cancelled_job.job_id).status == "cancelled"
    assert lifecycle.cancel(cancelled_job.job_id).status == "cancelled"

    completed_job = service.create_job("single-point")
    assert lifecycle.claim_queued(
        completed_job.job_id,
        engine="xtb",
        collector_id=None,
        collector_version=None,
    )
    lifecycle.transition(completed_job.job_id, "succeeded")
    with pytest.raises(InvalidJobOperationError):
        lifecycle.cancel(completed_job.job_id)


def test_dispatch_coordinator_only_leases_queued_jobs(tmp_path) -> None:
    service, lifecycle, dispatches = _components(tmp_path)
    queued_job = service.create_job("geometry-optimization")
    cancelled_job = service.create_job("single-point")
    lifecycle.cancel(cancelled_job.job_id)

    assert dispatches.request(queued_job.job_id, max_inflight=2)
    leased = dispatches.claim_next(
        worker_id="worker-1",
        lease_token="lease-1",
        lease_seconds=30,
    )
    assert leased is not None
    assert leased.job_id == queued_job.job_id

    with pytest.raises(InvalidJobOperationError):
        dispatches.request(cancelled_job.job_id, max_inflight=2)
