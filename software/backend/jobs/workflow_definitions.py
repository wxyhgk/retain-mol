"""Workflow definition persistence and reference validation."""

from __future__ import annotations

import secrets
from datetime import UTC, datetime
from typing import Any, Protocol

from .errors import (
    InvalidJobInputError,
    InvalidJobOperationError,
    WorkflowNotFoundError,
)
from .models import Artifact, Job, Workflow, WorkflowInputLink
from .repository import JobRepository
from .workflows import validate_workflow_dag


class WorkflowJobReader(Protocol):
    """Read-only Job access required while defining a workflow."""

    def get_job(self, job_id: str) -> Job: ...


class WorkflowDefinitionManager:
    """Creates immutable workflow definitions and validates their references."""

    def __init__(
        self,
        repository: JobRepository,
        jobs: WorkflowJobReader,
    ) -> None:
        self.repository = repository
        self.jobs = jobs

    def create(
        self,
        name: str,
        job_ids: list[str],
        input_links: list[dict[str, Any]],
    ) -> Workflow:
        workflow_id = _new_workflow_id()
        workflow = self._build(
            workflow_id,
            _required_text(name, "name"),
            job_ids,
            input_links,
        )
        self.repository.create_workflow(workflow)
        return workflow

    def list(self) -> list[Workflow]:
        workflows = self.repository.list_workflows()
        for workflow in workflows:
            self._populate_relations(workflow)
        return workflows

    def get(self, workflow_id: str) -> Workflow:
        workflow = self.repository.get_workflow(workflow_id)
        if workflow is None:
            raise WorkflowNotFoundError(workflow_id)
        self._populate_relations(workflow)
        return workflow

    def update(
        self,
        workflow_id: str,
        name: str,
        job_ids: list[str],
        input_links: list[dict[str, Any]],
    ) -> Workflow:
        if self.repository.get_workflow_execution(workflow_id) is not None:
            raise InvalidJobOperationError(
                "an activated workflow is immutable; create a new workflow revision"
            )
        current = self.get(workflow_id)
        workflow = self._build(
            workflow_id,
            _required_text(name, "name"),
            job_ids,
            input_links,
            created_at=current.created_at,
        )
        if not self.repository.update_workflow(workflow):
            raise WorkflowNotFoundError(workflow_id)
        return workflow

    def require_structure_artifact(
        self,
        job_id: str,
        artifact_id: str,
        role: str,
    ) -> Artifact:
        job = self.jobs.get_job(job_id)
        if job.status != "succeeded":
            raise InvalidJobInputError(
                f"{role.capitalize()} job '{job_id}' must be succeeded"
            )
        artifact = next(
            (item for item in job.artifacts if item.artifact_id == artifact_id),
            None,
        )
        if artifact is None:
            raise InvalidJobInputError(
                f"{role.capitalize()} artifact '{artifact_id}' does not belong to job '{job_id}'"
            )
        if artifact.format.lower() not in {"retainmol-json", "xyz", "sdf", "mol"}:
            raise InvalidJobInputError(
                f"{role.capitalize()} artifact must be a molecular structure"
            )
        if artifact.role != "output":
            raise InvalidJobInputError(
                f"{role.capitalize()} artifact must be an output artifact"
            )
        if not artifact.sha256:
            raise InvalidJobInputError(
                f"{role.capitalize()} artifact has no immutable content digest"
            )
        return artifact

    def _populate_relations(self, workflow: Workflow) -> None:
        workflow.job_ids = self.repository.get_workflow_job_ids(workflow.workflow_id)
        workflow.input_links = self.repository.get_workflow_input_links(
            workflow.workflow_id
        )

    def _build(
        self,
        workflow_id: str,
        name: str,
        job_ids: list[str],
        input_link_definitions: list[dict[str, Any]],
        *,
        created_at: datetime | None = None,
    ) -> Workflow:
        for job_id in job_ids:
            self.jobs.get_job(job_id)
        now = _now()
        input_links = [
            WorkflowInputLink(
                link_id=_new_input_link_id(),
                workflow_id=workflow_id,
                target_job_id=definition["targetJobId"],
                target_input_name=_required_text(
                    definition["targetInputName"], "targetInputName"
                ),
                source_job_id=definition["sourceJobId"],
                source_artifact_id=definition.get("sourceArtifactId"),
                source_kind=definition["sourceKind"],
                source_name=_required_text(
                    definition.get("sourceName") or "artifact", "sourceName"
                ),
                created_at=now,
            )
            for definition in input_link_definitions
        ]
        for link in input_links:
            self._validate_input_link_source(link)
        validate_workflow_dag(job_ids, input_links)
        return Workflow(
            workflow_id=workflow_id,
            name=name,
            created_at=created_at or now,
            updated_at=now,
            job_ids=job_ids,
            input_links=input_links,
        )

    def _validate_input_link_source(self, link: WorkflowInputLink) -> None:
        self.jobs.get_job(link.source_job_id)
        if link.source_artifact_id is None:
            return
        artifact = next(
            (
                item
                for item in self.repository.get_artifacts(link.source_job_id)
                if item.artifact_id == link.source_artifact_id
            ),
            None,
        )
        if artifact is None:
            raise ValueError(
                f"Artifact '{link.source_artifact_id}' does not belong to job "
                f"'{link.source_job_id}'"
            )


def _now() -> datetime:
    return datetime.now(UTC)


def _new_workflow_id() -> str:
    return f"workflow-{secrets.token_hex(8)}"


def _new_input_link_id() -> str:
    return f"reference-{secrets.token_hex(8)}"


def _required_text(value: str, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} must be a non-empty string")
    return value
