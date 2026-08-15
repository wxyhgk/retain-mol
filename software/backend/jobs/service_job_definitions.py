"""Job definition and submission methods exposed by :class:`JobService`."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from .job_creation import JobCreationManager
from .job_queries import JobQueryManager
from .job_submission import JobSubmissionManager
from .models import CalculationSpec, Job, JobInputSnapshot, JobTypeData


class JobDefinitionServiceApi:
    """Create immutable job definitions and submit calculation drafts."""

    job_creation: JobCreationManager
    job_queries: JobQueryManager
    job_submission: JobSubmissionManager

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
        return self.job_submission.queue_calculation_job(
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
