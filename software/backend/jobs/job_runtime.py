"""Route-facing orchestration for job execution state and dispatch leases."""

from __future__ import annotations

from collections.abc import Callable

from .dispatching import JobDispatchCoordinator
from .job_types import JOB_TYPE_REGISTRY, UnknownJobTypeError
from .job_workspace import JobWorkspace
from .lifecycle import JobLifecycle
from .models import Job, JobDispatch, JobRun
from .repository import JobRepository


class JobRuntimeManager:
    """Coordinates lifecycle transitions, run records, dispatches, and snapshots."""

    def __init__(
        self,
        repository: JobRepository,
        lifecycle: JobLifecycle,
        dispatches: JobDispatchCoordinator,
        workspace: JobWorkspace,
        load_job: Callable[[str], Job],
    ) -> None:
        self.repository = repository
        self.lifecycle = lifecycle
        self.dispatches = dispatches
        self.workspace = workspace
        self.load_job = load_job

    def list_runs(self, job_id: str) -> list[JobRun]:
        return self.lifecycle.list_runs(job_id)

    def get_run(self, run_id: str) -> JobRun:
        return self.lifecycle.get_run(run_id)

    def update_status(
        self,
        job_id: str,
        status: str,
        *,
        error: str | None = None,
        error_code: str | None = None,
    ) -> Job:
        self.lifecycle.transition(
            job_id,
            status,
            error=error,
            error_code=error_code,
        )
        return self._load_and_snapshot(job_id)

    def claim_queued_job(self, job_id: str) -> Job | None:
        """Atomically claim a queued job for one runner process."""
        job = self.load_job(job_id)
        engine, collector_id, collector_version = self._execution_descriptor(job)
        claimed = self.lifecycle.claim_queued(
            job_id,
            engine=engine,
            collector_id=collector_id,
            collector_version=collector_version,
        )
        if claimed is None:
            return None
        return self._load_and_snapshot(job_id)

    def get_active_run(self, job_id: str) -> JobRun:
        return self.lifecycle.get_active_run(job_id)

    def request_dispatch(self, job_id: str, *, max_inflight: int) -> bool:
        """Persist an idempotent execution request for one queued job."""
        return self.dispatches.request(job_id, max_inflight=max_inflight)

    def claim_next_dispatch(
        self,
        *,
        worker_id: str,
        lease_token: str,
        lease_seconds: float,
    ) -> JobDispatch | None:
        """Recover stale work, then lease the next queued execution request."""
        self.recover_stale_executions()
        return self.dispatches.claim_next(
            worker_id=worker_id,
            lease_token=lease_token,
            lease_seconds=lease_seconds,
        )

    def recover_stale_executions(self) -> list[Job]:
        """Interrupt expired or legacy running jobs without a live worker lease."""
        recovered = self.dispatches.recover_stale()
        return [self._load_and_snapshot(job.job_id) for job in recovered]

    def renew_dispatch_lease(
        self,
        job_id: str,
        lease_token: str,
        *,
        lease_seconds: float,
    ) -> bool:
        return self.dispatches.renew_lease(
            job_id,
            lease_token,
            lease_seconds=lease_seconds,
        )

    def finish_dispatch(
        self,
        job_id: str,
        lease_token: str,
        *,
        last_error: str | None = None,
    ) -> bool:
        return self.dispatches.finish(
            job_id,
            lease_token,
            last_error=last_error,
        )

    def dispatch_counts(self) -> dict[str, int]:
        return self.dispatches.counts()

    def interrupt_running_jobs(self, reason: str) -> list[Job]:
        """Mark runs left active by a previous backend process as interrupted."""
        interrupted = self.lifecycle.interrupt_all_running(reason)
        return [self._load_and_snapshot(job.job_id) for job in interrupted]

    def _execution_descriptor(self, job: Job) -> tuple[str, str | None, int | None]:
        try:
            handler = JOB_TYPE_REGISTRY.resolve(job.task_type)
            return (
                handler.engine_id,
                handler.collector_id,
                handler.collector_version,
            )
        except UnknownJobTypeError:
            spec = (
                self.repository.get_calculation_spec(job.spec_id)
                if job.spec_id is not None
                else None
            )
            return (spec.engine if spec is not None else "unknown", None, None)

    def _load_and_snapshot(self, job_id: str) -> Job:
        job = self.load_job(job_id)
        self.workspace.write_snapshot(job)
        return job
