"""Legacy mutable Job input operations.

Calculation jobs use immutable input snapshots. This manager only supports the
older generic Job API that still accepts mutable named inputs.
"""

from __future__ import annotations

import secrets
from collections.abc import Callable, Mapping
from datetime import UTC, datetime
from typing import Any

from .errors import InvalidJobOperationError, JobNotFoundError
from .job_workspace import JobWorkspace
from .models import Job, JobInput
from .repository import JobRepository

JobLoader = Callable[[str], Job]


class LegacyJobInputManager:
    """Own mutable inputs without leaking them into calculation snapshots."""

    def __init__(
        self,
        repository: JobRepository,
        workspace: JobWorkspace,
        load_job: JobLoader,
    ) -> None:
        self.repository = repository
        self.workspace = workspace
        self.load_job = load_job

    def add_many(self, job_id: str, inputs: Mapping[str, Any]) -> Job:
        if not isinstance(inputs, Mapping):
            raise ValueError("inputs must be an object")
        for name, value in inputs.items():
            self.add(job_id, name, value)
        return self.load_job(job_id)

    def add(
        self,
        job_id: str,
        name: str,
        value: Any,
        *,
        metadata: dict[str, Any] | None = None,
    ) -> JobInput:
        self._assert_mutable(job_id)
        job_input = self._add_without_snapshot(
            job_id,
            name,
            value,
            metadata=metadata,
        )
        self._sync_job(job_id)
        return job_input

    def _assert_mutable(self, job_id: str) -> None:
        job = self.load_job(job_id)
        if job.spec_id is not None or job.input_snapshots:
            raise InvalidJobOperationError(
                "calculation inputs are immutable; copy the job to change them"
            )

    def _add_without_snapshot(
        self,
        job_id: str,
        name: str,
        value: Any,
        *,
        metadata: dict[str, Any] | None = None,
    ) -> JobInput:
        job_input = JobInput(
            input_id=f"input-{secrets.token_hex(8)}",
            job_id=job_id,
            name=_required_text(name, "name"),
            value=value,
            metadata=metadata or {},
            created_at=_now(),
        )
        self.repository.add_input(job_input)
        return job_input

    def _sync_job(self, job_id: str) -> Job:
        if not self.repository.touch_job(job_id, _now()):
            raise JobNotFoundError(job_id)
        job = self.load_job(job_id)
        self.workspace.write_snapshot(job)
        return job


def _now() -> datetime:
    return datetime.now(UTC)


def _required_text(value: str, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} must be a non-empty string")
    return value
