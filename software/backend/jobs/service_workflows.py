"""Workflow methods exposed by :class:`JobService`."""

from __future__ import annotations

from typing import Any

from .models import Job, Workflow, WorkflowSchedule
from .workflow_definitions import WorkflowDefinitionManager
from .workflow_runtime import WorkflowRuntimeCoordinator
from .workflow_templates import WorkflowTemplateManager


class WorkflowServiceApi:
    """Typed workflow facade mixed into the route-facing service."""

    workflow_definitions: WorkflowDefinitionManager
    workflow_templates: WorkflowTemplateManager
    workflow_runtime: WorkflowRuntimeCoordinator

    def create_workflow(
        self,
        name: str,
        job_ids: list[str],
        input_links: list[dict[str, Any]],
    ) -> Workflow:
        """Persist a dependency graph after validating every referenced job."""
        return self.workflow_definitions.create(name, job_ids, input_links)

    def create_ts_preparation_workflow(
        self,
        name: str,
        reactant_job_id: str,
        reactant_artifact_id: str,
        product_job_id: str,
        product_artifact_id: str,
    ) -> tuple[Workflow, Job]:
        """Create the first fixed workflow: two optimized endpoints into a TS draft."""
        return self.workflow_templates.create_ts_preparation(
            name,
            reactant_job_id,
            reactant_artifact_id,
            product_job_id,
            product_artifact_id,
        )

    def list_workflows(self) -> list[Workflow]:
        return self.workflow_definitions.list()

    def get_workflow(self, workflow_id: str) -> Workflow:
        return self.workflow_definitions.get(workflow_id)

    def update_workflow(
        self,
        workflow_id: str,
        name: str,
        job_ids: list[str],
        input_links: list[dict[str, Any]],
    ) -> Workflow:
        return self.workflow_definitions.update(
            workflow_id,
            name,
            job_ids,
            input_links,
        )

    def start_workflow_execution(self, workflow_id: str) -> WorkflowSchedule:
        """Idempotently activate a workflow and reconcile its first runnable nodes."""
        return self.workflow_runtime.start(self.get_workflow(workflow_id))

    def get_workflow_schedule(self, workflow_id: str) -> WorkflowSchedule:
        return self.workflow_runtime.get_schedule(self.get_workflow(workflow_id))

    def list_active_workflow_ids(self) -> list[str]:
        return self.workflow_runtime.list_active_workflow_ids()

    def active_workflow_ids_for_job(self, job_id: str) -> list[str]:
        return self.workflow_runtime.active_workflow_ids_for_job(job_id)

    def block_workflow_execution(
        self, workflow_id: str, *, error_code: str, error_message: str
    ) -> WorkflowSchedule:
        """Record a scheduler-level failure that cannot be represented by a Job."""
        return self.workflow_runtime.block(
            self.get_workflow(workflow_id),
            error_code=error_code,
            error_message=error_message,
        )

    def cancel_workflow_execution(self, workflow_id: str) -> WorkflowSchedule:
        """Cancel one active DAG without disrupting jobs shared by another active DAG."""
        return self.workflow_runtime.cancel(self.get_workflow(workflow_id))

    def advance_workflow_execution(self, workflow_id: str) -> WorkflowSchedule:
        """Queue newly unblocked nodes and derive one durable DAG runtime snapshot."""
        return self.workflow_runtime.advance(self.get_workflow(workflow_id))
