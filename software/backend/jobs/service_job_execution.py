"""Job execution and dispatch methods exposed by :class:`JobService`."""

from __future__ import annotations

from .job_runtime import JobRuntimeManager
from .models import Job, JobDispatch, JobRun


class JobExecutionServiceApi:
    """Control persisted runs and worker dispatch without exposing runtime internals."""

    job_runtime: JobRuntimeManager

    def list_job_runs(self, job_id: str) -> list[JobRun]:
        return self.job_runtime.list_runs(job_id)

    def get_job_run(self, run_id: str) -> JobRun:
        return self.job_runtime.get_run(run_id)

    def update_status(
        self,
        job_id: str,
        status: str,
        *,
        error: str | None = None,
        error_code: str | None = None,
    ) -> Job:
        return self.job_runtime.update_status(
            job_id,
            status,
            error=error,
            error_code=error_code,
        )

    def claim_queued_job(self, job_id: str) -> Job | None:
        return self.job_runtime.claim_queued_job(job_id)

    def get_active_job_run(self, job_id: str) -> JobRun:
        return self.job_runtime.get_active_run(job_id)

    def request_job_dispatch(self, job_id: str, *, max_inflight: int) -> bool:
        return self.job_runtime.request_dispatch(job_id, max_inflight=max_inflight)

    def claim_next_dispatch(
        self,
        *,
        worker_id: str,
        lease_token: str,
        lease_seconds: float,
    ) -> JobDispatch | None:
        return self.job_runtime.claim_next_dispatch(
            worker_id=worker_id,
            lease_token=lease_token,
            lease_seconds=lease_seconds,
        )

    def recover_stale_executions(self) -> list[Job]:
        return self.job_runtime.recover_stale_executions()

    def renew_dispatch_lease(
        self,
        job_id: str,
        lease_token: str,
        *,
        lease_seconds: float,
    ) -> bool:
        return self.job_runtime.renew_dispatch_lease(
            job_id,
            lease_token,
            lease_seconds=lease_seconds,
        )

    def finish_job_dispatch(
        self,
        job_id: str,
        lease_token: str,
        *,
        last_error: str | None = None,
    ) -> bool:
        return self.job_runtime.finish_dispatch(
            job_id,
            lease_token,
            last_error=last_error,
        )

    def dispatch_counts(self) -> dict[str, int]:
        return self.job_runtime.dispatch_counts()

    def interrupt_running_jobs(self, reason: str) -> list[Job]:
        return self.job_runtime.interrupt_running_jobs(reason)
