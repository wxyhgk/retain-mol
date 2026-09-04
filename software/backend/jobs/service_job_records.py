"""Persisted job record methods exposed by :class:`JobService`."""

from __future__ import annotations

from collections.abc import Mapping
from pathlib import Path
from typing import Any

from .job_operations import JobOperationsManager
from .job_queries import JobQueryManager
from .job_workspace import JobWorkspace
from .models import Job


class JobRecordServiceApi:
    """Read and mutate the user-facing record around an immutable job request."""

    job_operations: JobOperationsManager
    job_queries: JobQueryManager
    workspace: JobWorkspace

    def list_jobs(self) -> list[Job]:
        return self.job_queries.list()

    def get_job(self, job_id: str) -> Job:
        return self.job_queries.get(job_id)

    def update_job(self, job_id: str, changes: Mapping[str, Any]) -> Job:
        return self.job_operations.update(job_id, changes)

    def clone_job(self, job_id: str, *, name: str | None = None) -> Job:
        return self.job_operations.clone(job_id, name=name)

    def retry_job(self, job_id: str, *, name: str | None = None) -> Job:
        return self.job_operations.retry(job_id, name=name)

    def cancel_job(self, job_id: str) -> Job:
        return self.job_operations.cancel(job_id)

    def read_job_log(
        self,
        job_id: str,
        *,
        cursor: int = 0,
        limit: int = 128 * 1024,
    ) -> dict[str, Any]:
        """Read an incremental UTF-8 log chunk without exposing task paths."""
        return self.workspace.read_log(self.get_job(job_id), cursor=cursor, limit=limit)

    def delete_job(self, job_id: str) -> None:
        self.job_operations.delete(job_id)

    def task_directory(self, job_id: str) -> Path:
        """Return the on-disk directory for a persisted job, creating it if needed."""
        self.get_job(job_id)
        return self.workspace.directory(job_id)

    def job_directory(self, job_id: str) -> Path:
        """Alias for task_directory() used by job-oriented callers."""
        return self.task_directory(job_id)
