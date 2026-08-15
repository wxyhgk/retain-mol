"""Creation orchestration for Jobs."""

from __future__ import annotations

import secrets
import sqlite3
from collections.abc import Callable, Mapping
from datetime import UTC, datetime
from typing import Any

from .job_definition import JobDefinitionBuilder, job_type_payload
from .input_resolution import JobInputResolver
from .job_workspace import JobWorkspace
from .models import Job
from .repository import JobRepository

JobLoader = Callable[[str], Job]


class JobCreationManager:
    """Turns creation requests into persisted drafts or queued Jobs."""

    def __init__(
        self,
        repository: JobRepository,
        input_resolver: JobInputResolver,
        workspace: JobWorkspace,
        load_job: JobLoader,
    ) -> None:
        self.repository = repository
        self.input_resolver = input_resolver
        self.workspace = workspace
        self.load_job = load_job

    def create_job(
        self,
        task_type: str | Mapping[str, Any],
        *,
        metadata: dict[str, Any] | None = None,
        status: str = "queued",
    ) -> Job:
        task_type, metadata, status = JobDefinitionBuilder.normalize_basic_request(
            task_type, metadata, status
        )
        now = _now()
        for _ in range(10):
            job = Job(
                job_id=_new_job_id(now),
                task_type=task_type,
                status=status,
                queued_at=now if status == "queued" else None,
                metadata=metadata,
                created_at=now,
                updated_at=now,
            )
            job_type_data = JobDefinitionBuilder.build_job_type_data(
                job,
                schema_version=1,
                data=job_type_payload(metadata),
                now=now,
            )
            try:
                self.repository.create_job(job, job_type_data)
            except sqlite3.IntegrityError:
                continue
            self.workspace.write_snapshot(job)
            return job
        raise RuntimeError("Unable to allocate a unique job id")

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
        """Atomically create, bind, and queue one immutable calculation run."""
        now = _now()
        spec, job_metadata = JobDefinitionBuilder.build_calculation_spec(
            kind, engine, payload, metadata, now
        )
        input_definitions = JobDefinitionBuilder.extract_inline_structure_input(
            dict(inputs or {}), spec.payload
        )
        normalized_data = JobDefinitionBuilder.normalize_job_type_data(
            spec.kind,
            {"engine": spec.engine, "parameters": spec.payload},
        )
        for _ in range(10):
            job = Job(
                job_id=_new_job_id(now),
                task_type=spec.kind,
                status="created",
                spec_id=spec.spec_id,
                supersedes_job_id=supersedes_job_id,
                metadata=job_metadata,
                created_at=now,
                updated_at=now,
            )
            snapshots = self.input_resolver.build_snapshots(
                job.job_id, spec.kind, input_definitions, now
            )
            job_type_data = JobDefinitionBuilder.build_job_type_data(
                job,
                schema_version=spec.schema_version,
                data=normalized_data,
                now=now,
            )
            try:
                self.repository.create_queued_job_with_spec_and_snapshots(
                    job, spec, snapshots, now, job_type_data
                )
            except sqlite3.IntegrityError:
                continue
            return self._load_and_snapshot(job.job_id)
        raise RuntimeError("Unable to allocate a unique calculation job id")

    def create_calculation_draft(
        self,
        kind: str,
        engine: str,
        payload: Mapping[str, Any],
        *,
        metadata: dict[str, Any] | None = None,
    ) -> Job:
        """Create a persistent calculation draft for later input binding."""
        now = _now()
        spec, job_metadata = JobDefinitionBuilder.build_calculation_spec(
            kind, engine, payload, metadata, now
        )
        normalized_data = JobDefinitionBuilder.normalize_job_type_data(
            spec.kind,
            {"engine": spec.engine, "parameters": spec.payload},
        )
        for _ in range(10):
            job = Job(
                jobId=_new_job_id(now),
                taskType=spec.kind,
                status="created",
                specId=spec.spec_id,
                metadata=job_metadata,
                createdAt=now,
                updatedAt=now,
            )
            job_type_data = JobDefinitionBuilder.build_job_type_data(
                job,
                schema_version=spec.schema_version,
                data=normalized_data,
                now=now,
            )
            try:
                self.repository.create_job_with_spec(job, spec, job_type_data)
            except sqlite3.IntegrityError:
                continue
            return self._load_and_snapshot(job.job_id)
        raise RuntimeError("Unable to allocate a unique calculation draft id")

    def _load_and_snapshot(self, job_id: str) -> Job:
        job = self.load_job(job_id)
        self.workspace.write_snapshot(job)
        return job


def _now() -> datetime:
    return datetime.now(UTC)


def _new_job_id(now: datetime) -> str:
    return f"{now:%Y%m%d}-{secrets.token_hex(4)}"
