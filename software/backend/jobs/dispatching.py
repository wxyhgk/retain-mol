"""Persisted job-dispatch queue and worker-lease coordination."""

from __future__ import annotations

import secrets
from datetime import UTC, datetime, timedelta

from .errors import InvalidJobOperationError, JobNotFoundError
from .lifecycle import JobLifecycle
from .models import Job, JobDispatch
from .repository import JobRepository


class JobDispatchCoordinator:
    """Coordinates durable dispatch requests without executing calculations."""

    def __init__(
        self,
        repository: JobRepository,
        lifecycle: JobLifecycle,
    ) -> None:
        self.repository = repository
        self.lifecycle = lifecycle

    def request(self, job_id: str, *, max_inflight: int) -> bool:
        job = self.repository.get_job(job_id)
        if job is None:
            raise JobNotFoundError(job_id)
        if job.status != "queued":
            raise InvalidJobOperationError(
                f"Job '{job_id}' has status '{job.status}'; only queued jobs can run"
            )
        now = _now()
        return self.repository.request_job_dispatch(
            JobDispatch(
                dispatch_id=f"dispatch-{secrets.token_hex(8)}",
                job_id=job_id,
                status="pending",
                requested_at=now,
                available_at=now,
            ),
            max_inflight=max_inflight,
        )

    def claim_next(
        self,
        *,
        worker_id: str,
        lease_token: str,
        lease_seconds: float,
    ) -> JobDispatch | None:
        now = _now()
        return self.repository.claim_next_dispatch(
            lease_owner=worker_id,
            lease_token=lease_token,
            now=now,
            lease_expires_at=now + timedelta(seconds=lease_seconds),
        )

    def recover_stale(self) -> list[Job]:
        now = _now()
        self.repository.recover_expired_dispatches(now)
        return self.lifecycle.interrupt_expected(
            self.repository.list_unleased_running_job_ids(now),
            error_code="worker_lease_expired",
            reason="worker lease expired while the calculation was running",
        )

    def renew_lease(
        self,
        job_id: str,
        lease_token: str,
        *,
        lease_seconds: float,
    ) -> bool:
        now = _now()
        return self.repository.renew_dispatch_lease(
            job_id,
            lease_token,
            heartbeat_at=now,
            lease_expires_at=now + timedelta(seconds=lease_seconds),
        )

    def finish(
        self,
        job_id: str,
        lease_token: str,
        *,
        last_error: str | None = None,
    ) -> bool:
        return self.repository.finish_job_dispatch(
            job_id,
            lease_token,
            finished_at=_now(),
            last_error=last_error,
        )

    def counts(self) -> dict[str, int]:
        return self.repository.dispatch_counts()


def _now() -> datetime:
    return datetime.now(UTC)
