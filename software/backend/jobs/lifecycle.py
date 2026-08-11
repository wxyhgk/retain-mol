"""Job state-machine and concrete execution-run coordination."""

from __future__ import annotations

import secrets
from datetime import UTC, datetime

from .errors import (
    InvalidJobOperationError,
    InvalidJobTransitionError,
    JobNotFoundError,
)
from .models import Job, JobRun, JobStatus
from .repository import JobRepository

ALLOWED_JOB_TRANSITIONS: dict[JobStatus, frozenset[JobStatus]] = {
    "created": frozenset({"queued", "cancelled"}),
    "queued": frozenset({"running", "cancelled"}),
    "running": frozenset({"succeeded", "failed", "cancelled", "interrupted"}),
    "succeeded": frozenset(),
    "failed": frozenset(),
    "cancelled": frozenset(),
    "interrupted": frozenset(),
}

CANCELLABLE_JOB_STATUSES = frozenset({"created", "queued", "running"})
RETRYABLE_JOB_STATUSES = frozenset({"failed", "cancelled", "interrupted"})
TERMINAL_JOB_STATUSES = frozenset({"succeeded", "failed", "cancelled", "interrupted"})


def normalize_job_status(value: str) -> JobStatus:
    normalized = "succeeded" if value == "completed" else value
    if normalized not in ALLOWED_JOB_TRANSITIONS:
        raise ValueError(f"Unsupported job status: {value}")
    return normalized  # type: ignore[return-value]


class JobLifecycle:
    """Owns state transitions and persisted execution-attempt records."""

    def __init__(self, repository: JobRepository) -> None:
        self.repository = repository

    def list_runs(self, job_id: str) -> list[JobRun]:
        self._require_job(job_id)
        return self.repository.list_job_runs(job_id)

    def get_run(self, run_id: str) -> JobRun:
        run = self.repository.get_job_run(run_id)
        if run is None:
            raise InvalidJobOperationError(f"JobRun '{run_id}' does not exist")
        return run

    def get_active_run(self, job_id: str) -> JobRun:
        self._require_job(job_id)
        run = self.repository.get_active_job_run(job_id)
        if run is None:
            raise InvalidJobOperationError(
                f"Job '{job_id}' has no active execution run"
            )
        return run

    def transition(
        self,
        job_id: str,
        status: str,
        *,
        error: str | None = None,
        error_code: str | None = None,
    ) -> Job:
        current = self._require_job(job_id)
        next_status = normalize_job_status(status)
        if next_status not in ALLOWED_JOB_TRANSITIONS[current.status]:
            raise InvalidJobTransitionError(
                f"Job '{job_id}' cannot transition from "
                f"'{current.status}' to '{next_status}'"
            )
        if not self.repository.transition_status(
            job_id,
            (current.status,),
            next_status,
            _now(),
            error_code,
            error,
        ):
            raise JobNotFoundError(job_id)
        return self._require_job(job_id)

    def cancel(self, job_id: str) -> Job:
        job = self._require_job(job_id)
        if job.status == "cancelled":
            return job
        if job.status not in CANCELLABLE_JOB_STATUSES:
            raise InvalidJobOperationError(
                f"job in '{job.status}' state cannot be cancelled"
            )
        return self.transition(job_id, "cancelled")

    def claim_queued(
        self,
        job_id: str,
        *,
        engine: str,
        collector_id: str | None,
        collector_version: int | None,
    ) -> Job | None:
        self._require_job(job_id)
        now = _now()
        run = JobRun(
            runId=f"run-{secrets.token_hex(8)}",
            jobId=job_id,
            runNumber=len(self.repository.list_job_runs(job_id)) + 1,
            engine=engine,
            status="running",
            collectorId=collector_id,
            collectorVersion=collector_version,
            metadata={},
            startedAt=now,
        )
        if not self.repository.claim_job_run(run):
            return None
        return self._require_job(job_id)

    def interrupt_expected(
        self,
        job_ids: list[str],
        *,
        error_code: str,
        reason: str,
    ) -> list[Job]:
        interrupted: list[Job] = []
        now = _now()
        for job_id in job_ids:
            if self.repository.transition_status(
                job_id,
                ("running",),
                "interrupted",
                now,
                error_code,
                reason,
            ):
                interrupted.append(self._require_job(job_id))
        return interrupted

    def interrupt_all_running(self, reason: str) -> list[Job]:
        running_ids = [
            job.job_id for job in self.repository.list_jobs() if job.status == "running"
        ]
        return self.interrupt_expected(
            running_ids,
            error_code="backend_restart",
            reason=reason,
        )

    def _require_job(self, job_id: str) -> Job:
        job = self.repository.get_job(job_id)
        if job is None:
            raise JobNotFoundError(job_id)
        return job


def _now() -> datetime:
    return datetime.now(UTC)
