"""Input freezing and queue submission for calculation drafts."""

from __future__ import annotations

from collections.abc import Callable, Mapping
from datetime import UTC, datetime
from typing import Any

from .errors import (
    InvalidJobInputError,
    InvalidJobOperationError,
    InvalidJobTransitionError,
)
from .input_resolution import JobInputResolver
from .job_workspace import JobWorkspace
from .models import Job
from .repository import JobRepository

JobLoader = Callable[[str], Job]


class JobSubmissionManager:
    """Freeze resolved inputs and atomically move calculation drafts to queued."""

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

    def queue_calculation_job(
        self,
        job_id: str,
        inputs: Mapping[str, Any] | None = None,
        *,
        workflow_id: str | None = None,
        require_active_workflow: bool = False,
    ) -> Job:
        """Resolve inputs, freeze immutable snapshots, then queue one draft."""
        job = self.load_job(job_id)
        if job.status != "created":
            raise InvalidJobTransitionError(
                f"Job '{job_id}' cannot freeze inputs from '{job.status}'"
            )
        spec = (
            self.repository.get_calculation_spec(job.spec_id)
            if job.spec_id is not None
            else None
        )
        if spec is None:
            raise InvalidJobInputError(
                f"Job '{job_id}' has no calculation specification"
            )

        definitions = dict(inputs or {})
        if workflow_id is not None:
            workflow_definitions = self.input_resolver.resolve_workflow_definitions(
                workflow_id, job_id
            )
            for name, definition in workflow_definitions.items():
                if name in definitions:
                    raise InvalidJobInputError(
                        f"Input '{name}' is supplied explicitly and by workflow"
                    )
                definitions[name] = definition

        now = datetime.now(UTC)
        snapshots = self.input_resolver.build_snapshots(
            job_id, spec.kind, definitions, now
        )
        queued = self.repository.freeze_job_input_snapshots_and_queue(
            job_id,
            snapshots,
            now,
            active_workflow_id=workflow_id if require_active_workflow else None,
        )
        if not queued:
            self._raise_queue_failure(
                job_id,
                workflow_id=workflow_id,
                require_active_workflow=require_active_workflow,
            )
        return self._load_and_snapshot(job_id)

    def _load_and_snapshot(self, job_id: str) -> Job:
        job = self.load_job(job_id)
        self.workspace.write_snapshot(job)
        return job

    def _raise_queue_failure(
        self,
        job_id: str,
        *,
        workflow_id: str | None,
        require_active_workflow: bool,
    ) -> None:
        current = self.load_job(job_id)
        if workflow_id is not None and require_active_workflow:
            execution = self.repository.get_workflow_execution(workflow_id)
            if execution is None or execution.status != "active":
                raise InvalidJobOperationError(
                    f"Workflow '{workflow_id}' is no longer active"
                )
        raise InvalidJobTransitionError(
            f"Job '{job_id}' cannot queue from '{current.status}'"
        )
