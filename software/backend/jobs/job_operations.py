"""User-facing operations on persisted jobs."""

from __future__ import annotations

from collections.abc import Callable, Mapping
from datetime import UTC, datetime
from typing import Any

from .errors import (
    InvalidJobOperationError,
    JobInUseError,
    JobNotFoundError,
)
from .input_resolution import JobInputResolver
from .job_workspace import JobWorkspace
from .lifecycle import RETRYABLE_JOB_STATUSES, JobLifecycle
from .models import Job
from .repository import JobRepository


class JobOperationsManager:
    """Applies mutable, copy, retry, cancellation, and deletion operations."""

    def __init__(
        self,
        repository: JobRepository,
        lifecycle: JobLifecycle,
        workspace: JobWorkspace,
        input_resolver: JobInputResolver,
        load_job: Callable[[str], Job],
        create_calculation_job: Callable[..., Job],
    ) -> None:
        self.repository = repository
        self.lifecycle = lifecycle
        self.workspace = workspace
        self.input_resolver = input_resolver
        self.load_job = load_job
        self.create_calculation_job = create_calculation_job

    def update(self, job_id: str, changes: Mapping[str, Any]) -> Job:
        """Update mutable presentation metadata without changing frozen inputs."""
        if not isinstance(changes, Mapping) or not changes:
            raise ValueError("job update must contain at least one field")
        unsupported = set(changes) - {"name", "description"}
        if unsupported:
            raise ValueError(
                "unsupported mutable job fields: " + ", ".join(sorted(unsupported))
            )

        job = self.load_job(job_id)
        metadata = dict(job.metadata)
        if "name" in changes:
            metadata["name"] = _required_text(changes["name"], "name")
        if "description" in changes:
            description = changes["description"]
            if description is None or not str(description).strip():
                metadata.pop("description", None)
            else:
                metadata["description"] = str(description).strip()

        if not self.repository.update_job_metadata(job_id, metadata, _now()):
            raise JobNotFoundError(job_id)
        updated = self.load_job(job_id)
        self.workspace.write_snapshot(updated)
        return updated

    def clone(self, job_id: str, *, name: str | None = None) -> Job:
        """Create a fresh queued calculation from an immutable spec and snapshots."""
        source = self.load_job(job_id)
        spec = (
            self.repository.get_calculation_spec(source.spec_id)
            if source.spec_id is not None
            else None
        )
        if spec is None:
            raise InvalidJobOperationError(
                "only jobs with an immutable calculation specification can be copied"
            )

        clone_name = (
            _required_text(name, "name")
            if name is not None
            else f"{source.metadata.get('name') or source.task_type} 副本"
        )
        metadata = _copy_metadata_with_name(source, clone_name)
        metadata["sourceJobId"] = source.job_id
        return self.create_calculation_job(
            spec.kind,
            spec.engine,
            spec.payload,
            inputs=self.input_resolver.copy_definitions(source),
            metadata=metadata,
        )

    def retry(self, job_id: str, *, name: str | None = None) -> Job:
        """Create a new immutable run from a failed terminal attempt."""
        source = self.load_job(job_id)
        if source.status not in RETRYABLE_JOB_STATUSES:
            raise InvalidJobOperationError(
                f"job in '{source.status}' state cannot be retried"
            )
        spec = (
            self.repository.get_calculation_spec(source.spec_id)
            if source.spec_id is not None
            else None
        )
        if spec is None:
            raise InvalidJobOperationError(
                "only jobs with an immutable calculation specification can be retried"
            )

        retry_name = (
            _required_text(name, "name")
            if name is not None
            else f"{source.metadata.get('name') or source.task_type} 重试"
        )
        return self.create_calculation_job(
            spec.kind,
            spec.engine,
            spec.payload,
            inputs=self.input_resolver.copy_definitions(source),
            metadata=_copy_metadata_with_name(source, retry_name),
            supersedes_job_id=source.job_id,
        )

    def cancel(self, job_id: str) -> Job:
        """Cancel a pending or active run through the persisted state machine."""
        self.lifecycle.cancel(job_id)
        job = self.load_job(job_id)
        self.workspace.write_snapshot(job)
        return job

    def delete(self, job_id: str) -> None:
        """Delete one non-running, unreferenced job and its private work directory."""
        job = self.load_job(job_id)
        if job.status == "running":
            raise InvalidJobOperationError("running jobs cannot be deleted")
        workflow_ids = self.repository.list_workflow_ids_for_job(job_id)
        if workflow_ids:
            raise JobInUseError(
                f"job is referenced by workflow(s): {', '.join(workflow_ids)}"
            )
        superseding_job_ids = self.repository.list_superseding_job_ids(job_id)
        if superseding_job_ids:
            raise JobInUseError(
                "job is superseded by retry job(s): " + ", ".join(superseding_job_ids)
            )
        if not self.repository.delete_job(job_id):
            raise JobNotFoundError(job_id)
        self.workspace.remove(job_id)


def _copy_metadata_with_name(source: Job, name: str) -> dict[str, Any]:
    metadata = dict(source.metadata)
    metadata["name"] = name
    request = metadata.get("request")
    if isinstance(request, Mapping):
        metadata["request"] = {**dict(request), "name": name}
    return metadata


def _now() -> datetime:
    return datetime.now(UTC)


def _required_text(value: str, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} must be a non-empty string")
    return value
