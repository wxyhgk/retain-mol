"""Route-facing job persistence service."""

from __future__ import annotations

import json
import secrets
import sqlite3
from collections.abc import Mapping
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from .models import Artifact, Job, JobInput, JobInputReference, Workflow
from .repository import JobRepository
from .workflows import validate_workflow_dag

DEFAULT_DATA_ROOT = Path(__file__).resolve().parents[1] / "data"


class JobNotFoundError(KeyError):
    """Raised when an operation targets a job that is not persisted."""


class WorkflowNotFoundError(KeyError):
    """Raised when an operation targets a workflow that is not persisted."""


class JobService:
    """Creates jobs and keeps SQLite records and filesystem snapshots in sync."""

    def __init__(self, data_root: str | Path | None = None) -> None:
        self.data_root = Path(data_root) if data_root is not None else DEFAULT_DATA_ROOT
        self.data_root.mkdir(parents=True, exist_ok=True)
        self.tasks_root = self.data_root / "tasks"
        self.tasks_root.mkdir(parents=True, exist_ok=True)
        self.repository = JobRepository(self.data_root / "retainmol.sqlite")

    def create_job(
        self,
        task_type: str | Mapping[str, Any],
        *,
        metadata: dict[str, Any] | None = None,
        status: str = "queued",
    ) -> Job:
        if isinstance(task_type, Mapping):
            definition = dict(task_type)
            task_type = str(
                definition.pop("taskType", definition.pop("task_type", definition.pop("type", "job")))
            )
            status = str(definition.pop("status", status))
            supplied_metadata = definition.pop("metadata", {})
            if not isinstance(supplied_metadata, dict):
                raise ValueError("metadata must be an object")
            metadata = {**supplied_metadata, **definition, **(metadata or {})}
        task_type = _required_text(task_type, "task_type")
        status = _required_text(status, "status")
        now = _now()
        for _ in range(10):
            job = Job(
                job_id=_new_job_id(now),
                task_type=task_type,
                status=status,
                metadata=metadata or {},
                created_at=now,
                updated_at=now,
            )
            try:
                self.repository.create_job(job)
            except sqlite3.IntegrityError:
                continue
            self._write_snapshot(job)
            return job
        raise RuntimeError("Unable to allocate a unique job id")

    def list_jobs(self) -> list[Job]:
        jobs = self.repository.list_jobs()
        for job in jobs:
            self._populate_relations(job)
        return jobs

    def get_job(self, job_id: str) -> Job:
        job = self.repository.get_job(job_id)
        if job is None:
            raise JobNotFoundError(job_id)
        self._populate_relations(job)
        return job

    def add_inputs(self, job_id: str, inputs: Mapping[str, Any]) -> Job:
        """Add a batch of named inputs, as submitted by the jobs HTTP route."""
        if not isinstance(inputs, Mapping):
            raise ValueError("inputs must be an object")
        self._require_job(job_id)
        for name, value in inputs.items():
            self.add_input(job_id, name, value)
        return self.get_job(job_id)

    def list_artifacts(self, job_id: str) -> list[Artifact]:
        """Return every artifact registered for a job."""
        return self.get_job(job_id).artifacts

    def create_workflow(
        self,
        name: str,
        job_ids: list[str],
        references: list[dict[str, Any]],
    ) -> Workflow:
        """Persist a dependency graph after validating every referenced job."""
        name = _required_text(name, "name")
        workflow_id = _new_workflow_id()
        workflow = self._build_workflow(workflow_id, name, job_ids, references)
        self.repository.create_workflow(workflow)
        return workflow

    def list_workflows(self) -> list[Workflow]:
        workflows = self.repository.list_workflows()
        for workflow in workflows:
            self._populate_workflow_relations(workflow)
        return workflows

    def get_workflow(self, workflow_id: str) -> Workflow:
        workflow = self.repository.get_workflow(workflow_id)
        if workflow is None:
            raise WorkflowNotFoundError(workflow_id)
        self._populate_workflow_relations(workflow)
        return workflow

    def update_workflow(
        self,
        workflow_id: str,
        name: str,
        job_ids: list[str],
        references: list[dict[str, Any]],
    ) -> Workflow:
        current = self.get_workflow(workflow_id)
        workflow = self._build_workflow(
            workflow_id,
            _required_text(name, "name"),
            job_ids,
            references,
            created_at=current.created_at,
        )
        if not self.repository.update_workflow(workflow):
            raise WorkflowNotFoundError(workflow_id)
        return workflow

    def add_input(
        self,
        job_id: str,
        name: str,
        value: Any,
        *,
        metadata: dict[str, Any] | None = None,
    ) -> JobInput:
        self._require_job(job_id)
        job_input = JobInput(
            input_id=f"input-{secrets.token_hex(8)}",
            job_id=job_id,
            name=_required_text(name, "name"),
            value=value,
            metadata=metadata or {},
            created_at=_now(),
        )
        self.repository.add_input(job_input)
        self._touch_job(job_id)
        self._write_snapshot(self._require_job(job_id))
        return job_input

    def add_artifact(
        self,
        job_id: str,
        name: str,
        path: str,
        *,
        media_type: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> Artifact:
        self._require_job(job_id)
        artifact = Artifact(
            artifact_id=f"artifact-{secrets.token_hex(8)}",
            job_id=job_id,
            name=_required_text(name, "name"),
            path=_required_text(path, "path"),
            media_type=media_type,
            metadata=metadata or {},
            created_at=_now(),
        )
        self.repository.add_artifact(artifact)
        self._touch_job(job_id)
        self._write_snapshot(self._require_job(job_id))
        return artifact

    def update_status(self, job_id: str, status: str, *, error: str | None = None) -> Job:
        self._require_job(job_id)
        updated = self.repository.update_status(
            job_id,
            _required_text(status, "status"),
            _now(),
            error,
        )
        if not updated:
            raise JobNotFoundError(job_id)
        job = self._require_job(job_id)
        self._write_snapshot(job)
        return job

    def claim_queued_job(self, job_id: str) -> Job | None:
        """Atomically claim a queued job for one runner process."""
        if not self.repository.claim_job(
            job_id,
            expected_status="queued",
            next_status="running",
            updated_at=_now(),
        ):
            return None
        job = self._require_job(job_id)
        self._write_snapshot(job)
        return job

    def task_directory(self, job_id: str) -> Path:
        """Return the on-disk directory for a persisted job, creating it if needed."""
        self._require_job(job_id)
        directory = self.tasks_root / job_id
        directory.mkdir(parents=True, exist_ok=True)
        return directory

    def job_directory(self, job_id: str) -> Path:
        """Alias for task_directory() used by job-oriented callers."""
        return self.task_directory(job_id)

    def _require_job(self, job_id: str) -> Job:
        return self.get_job(job_id)

    def _populate_relations(self, job: Job) -> None:
        job.inputs = self.repository.get_inputs(job.job_id)
        job.artifacts = self.repository.get_artifacts(job.job_id)

    def _populate_workflow_relations(self, workflow: Workflow) -> None:
        workflow.job_ids = self.repository.get_workflow_job_ids(workflow.workflow_id)
        workflow.references = self.repository.get_job_input_references(workflow.workflow_id)

    def _build_workflow(
        self,
        workflow_id: str,
        name: str,
        job_ids: list[str],
        reference_definitions: list[dict[str, Any]],
        *,
        created_at: datetime | None = None,
    ) -> Workflow:
        for job_id in job_ids:
            self._require_job(job_id)
        now = _now()
        references = [
            JobInputReference(
                reference_id=_new_reference_id(),
                workflow_id=workflow_id,
                target_job_id=definition["targetJobId"],
                target_input_name=_required_text(definition["targetInputName"], "targetInputName"),
                source_job_id=definition["sourceJobId"],
                source_kind=definition["sourceKind"],
                source_name=_required_text(definition["sourceName"], "sourceName"),
                created_at=now,
            )
            for definition in reference_definitions
        ]
        validate_workflow_dag(job_ids, references)
        return Workflow(
            workflow_id=workflow_id,
            name=name,
            created_at=created_at or now,
            updated_at=now,
            job_ids=job_ids,
            references=references,
        )

    def _touch_job(self, job_id: str) -> None:
        if not self.repository.touch_job(job_id, _now()):
            raise JobNotFoundError(job_id)

    def _write_snapshot(self, job: Job) -> None:
        directory = self.tasks_root / job.job_id
        directory.mkdir(parents=True, exist_ok=True)
        snapshot_path = directory / "job.json"
        temporary_path = directory / ".job.json.tmp"
        temporary_path.write_text(
            json.dumps(
                job.model_dump(mode="json", by_alias=True),
                ensure_ascii=True,
                indent=2,
                sort_keys=True,
            )
            + "\n",
            encoding="utf-8",
        )
        temporary_path.replace(snapshot_path)


def _now() -> datetime:
    return datetime.now(UTC)


def _new_job_id(now: datetime) -> str:
    return f"{now:%Y%m%d}-{secrets.token_hex(4)}"


def _new_workflow_id() -> str:
    return f"workflow-{secrets.token_hex(8)}"


def _new_reference_id() -> str:
    return f"reference-{secrets.token_hex(8)}"


def _required_text(value: str, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} must be a non-empty string")
    return value
