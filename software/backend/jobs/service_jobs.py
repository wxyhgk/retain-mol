"""Job methods exposed by :class:`JobService`."""

from __future__ import annotations

from collections.abc import Mapping
from pathlib import Path
from typing import Any

from .artifact_manager import ArtifactManager
from .job_creation import JobCreationManager
from .job_operations import JobOperationsManager
from .job_queries import JobQueryManager
from .job_runtime import JobRuntimeManager
from .job_workspace import JobWorkspace
from .legacy_inputs import LegacyJobInputManager
from .models import (
    Artifact,
    CalculationSpec,
    Job,
    JobDispatch,
    JobInput,
    JobInputSnapshot,
    JobRun,
    JobTypeData,
)


class JobServiceApi:
    """Typed Job facade mixed into the route-facing service."""

    job_queries: JobQueryManager
    job_creation: JobCreationManager
    job_operations: JobOperationsManager
    job_runtime: JobRuntimeManager
    legacy_inputs: LegacyJobInputManager
    artifact_manager: ArtifactManager
    workspace: JobWorkspace

    def create_job(
        self,
        task_type: str | Mapping[str, Any],
        *,
        metadata: dict[str, Any] | None = None,
        status: str = "queued",
    ) -> Job:
        return self.job_creation.create_job(task_type, metadata=metadata, status=status)

    def create_calculation_job(
        self,
        kind: str,
        engine: str,
        payload: Mapping[str, Any],
        *,
        inputs: Mapping[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
        supersedes_job_id: str | None = None,
    ) -> Job:
        return self.job_creation.create_calculation_job(
            kind,
            engine,
            payload,
            inputs=inputs,
            metadata=metadata,
            supersedes_job_id=supersedes_job_id,
        )

    def create_calculation_draft(
        self,
        kind: str,
        engine: str,
        payload: Mapping[str, Any],
        *,
        metadata: dict[str, Any] | None = None,
    ) -> Job:
        return self.job_creation.create_calculation_draft(
            kind, engine, payload, metadata=metadata
        )

    def queue_calculation_job(
        self,
        job_id: str,
        inputs: Mapping[str, Any] | None = None,
        *,
        workflow_id: str | None = None,
        require_active_workflow: bool = False,
    ) -> Job:
        return self.job_creation.queue_calculation_job(
            job_id,
            inputs,
            workflow_id=workflow_id,
            require_active_workflow=require_active_workflow,
        )

    def get_calculation_spec(self, job_id: str) -> CalculationSpec | None:
        return self.job_queries.get_calculation_spec(job_id)

    def get_input_snapshots(self, job_id: str) -> list[JobInputSnapshot]:
        return self.job_queries.get_input_snapshots(job_id)

    def get_job_type_data(self, job_id: str) -> JobTypeData:
        return self.job_queries.get_job_type_data(job_id)

    def list_job_runs(self, job_id: str) -> list[JobRun]:
        return self.job_runtime.list_runs(job_id)

    def get_job_run(self, run_id: str) -> JobRun:
        return self.job_runtime.get_run(run_id)

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

    def add_inputs(self, job_id: str, inputs: Mapping[str, Any]) -> Job:
        """Add a batch of named inputs, as submitted by the jobs HTTP route."""
        return self.legacy_inputs.add_many(job_id, inputs)

    def list_artifacts(self, job_id: str) -> list[Artifact]:
        """Return every artifact registered for a job."""
        return self.artifact_manager.list(job_id)

    def get_artifact(self, artifact_id: str) -> Artifact:
        return self.artifact_manager.get(artifact_id)

    def add_input(
        self,
        job_id: str,
        name: str,
        value: Any,
        *,
        metadata: dict[str, Any] | None = None,
    ) -> JobInput:
        return self.legacy_inputs.add(job_id, name, value, metadata=metadata)

    def add_artifact(
        self,
        job_id: str,
        name: str,
        path: str,
        *,
        media_type: str | None = None,
        metadata: dict[str, Any] | None = None,
        run_id: str | None = None,
    ) -> Artifact:
        return self.artifact_manager.add(
            job_id,
            name,
            path,
            media_type=media_type,
            metadata=metadata,
            run_id=run_id,
        )

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

    def task_directory(self, job_id: str) -> Path:
        """Return the on-disk directory for a persisted job, creating it if needed."""
        self.get_job(job_id)
        return self.workspace.directory(job_id)

    def job_directory(self, job_id: str) -> Path:
        """Alias for task_directory() used by job-oriented callers."""
        return self.task_directory(job_id)
