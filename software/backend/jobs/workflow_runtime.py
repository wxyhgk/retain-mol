"""Workflow execution reconciliation built on top of reusable Jobs."""

from __future__ import annotations

import secrets
from dataclasses import dataclass
from datetime import UTC, datetime
from collections.abc import Callable

from .errors import (
    InvalidJobInputError,
    InvalidJobOperationError,
    InvalidJobTransitionError,
)
from .lifecycle import CANCELLABLE_JOB_STATUSES
from .models import (
    DispatchStatus,
    Job,
    JobStatus,
    Workflow,
    WorkflowExecution,
    WorkflowNodeState,
    WorkflowNodeRuntime,
    WorkflowSchedule,
)
from .repository import JobRepository
from .workflows import validate_workflow_dag, workflow_predecessors


JobLoader = Callable[[str], Job]
QueueCalculationJob = Callable[..., Job]
CancelJob = Callable[[str], Job]


@dataclass(frozen=True)
class WorkflowNodeDecision:
    state: WorkflowNodeState
    ready: bool = False
    blocks_workflow: bool = False
    error: tuple[str, str] | None = None


_CANCELLED_WORKFLOW_STATE_BY_JOB: dict[JobStatus, WorkflowNodeState] = {
    "cancelled": "cancelled",
    "succeeded": "succeeded",
    "failed": "failed",
    "interrupted": "failed",
    "running": "running",
    "queued": "queued",
    "created": "waiting",
}

_DIRECT_NODE_STATE_BY_JOB: dict[JobStatus, WorkflowNodeState] = {
    "succeeded": "succeeded",
    "failed": "failed",
    "cancelled": "failed",
    "interrupted": "failed",
    "running": "running",
}

_VIABLE_NODE_STATES = frozenset({"waiting", "ready", "queued", "running"})
_FAILED_NODE_STATES = frozenset({"failed", "blocked"})


def derive_workflow_node_decision(
    job_id: str,
    job_status: JobStatus,
    *,
    upstream_succeeded: bool,
    execution_active: bool,
    dispatch_status: DispatchStatus | None,
) -> WorkflowNodeDecision:
    direct_state = _DIRECT_NODE_STATE_BY_JOB.get(job_status)
    if direct_state is not None:
        return WorkflowNodeDecision(state=direct_state)
    if job_status != "queued" or not upstream_succeeded:
        return WorkflowNodeDecision(state="waiting")
    if dispatch_status is None:
        return WorkflowNodeDecision(state="ready", ready=execution_active)
    if dispatch_status in {"pending", "leased"}:
        return WorkflowNodeDecision(state="queued")
    return WorkflowNodeDecision(
        state="blocked",
        blocks_workflow=True,
        error=(
            "workflow_dispatch_finished_early",
            f"Job '{job_id}' is queued but its dispatch is already finished",
        ),
    )


class WorkflowRuntimeCoordinator:
    """Activates, advances, blocks, and cancels one persisted Job DAG."""

    def __init__(
        self,
        repository: JobRepository,
        load_job: JobLoader,
        queue_calculation_job: QueueCalculationJob,
        cancel_job: CancelJob,
    ) -> None:
        self.repository = repository
        self.load_job = load_job
        self.queue_calculation_job = queue_calculation_job
        self.cancel_job = cancel_job

    def start(self, workflow: Workflow) -> WorkflowSchedule:
        now = _now()
        persisted = self.repository.create_workflow_execution(
            WorkflowExecution(
                executionId=f"execution-{secrets.token_hex(8)}",
                workflowId=workflow.workflow_id,
                status="active",
                startedAt=now,
                updatedAt=now,
            )
        )
        if persisted.status == "cancelled":
            raise InvalidJobOperationError("a cancelled workflow cannot be restarted")
        return self.advance(workflow)

    def get_schedule(self, workflow: Workflow) -> WorkflowSchedule:
        self._require_execution(workflow.workflow_id)
        return self.advance(workflow)

    def list_active_workflow_ids(self) -> list[str]:
        return [
            execution.workflow_id
            for execution in self.repository.list_active_workflow_executions()
        ]

    def active_workflow_ids_for_job(self, job_id: str) -> list[str]:
        active = set(self.list_active_workflow_ids())
        return [
            workflow_id
            for workflow_id in self.repository.list_workflow_ids_for_job(job_id)
            if workflow_id in active
        ]

    def block(
        self,
        workflow: Workflow,
        *,
        error_code: str,
        error_message: str,
    ) -> WorkflowSchedule:
        self.repository.transition_workflow_execution(
            workflow.workflow_id,
            expected_status="active",
            next_status="blocked",
            updated_at=_now(),
            error_code=error_code,
            error_message=error_message,
        )
        return self.advance(workflow)

    def cancel(self, workflow: Workflow) -> WorkflowSchedule:
        execution = self._require_execution(workflow.workflow_id)
        if execution.status == "cancelled":
            return self.advance(workflow)
        if execution.status != "active":
            raise InvalidJobOperationError(
                f"workflow in '{execution.status}' state cannot be cancelled"
            )

        if not self.repository.transition_workflow_execution(
            workflow.workflow_id,
            expected_status="active",
            next_status="cancelled",
            updated_at=_now(),
        ):
            refreshed = self.repository.get_workflow_execution(workflow.workflow_id)
            if refreshed is None or refreshed.status != "cancelled":
                status = refreshed.status if refreshed is not None else "missing"
                raise InvalidJobOperationError(
                    f"workflow in '{status}' state cannot be cancelled"
                )

        for job_id in workflow.job_ids:
            job = self.load_job(job_id)
            if job.status not in CANCELLABLE_JOB_STATUSES:
                continue
            other_active_workflows = [
                active_id
                for active_id in self.active_workflow_ids_for_job(job_id)
                if active_id != workflow.workflow_id
            ]
            if other_active_workflows:
                continue
            try:
                self.cancel_job(job_id)
            except InvalidJobOperationError:
                # A worker may reach a terminal state after the status read.
                pass
        return self.advance(workflow)

    def advance(self, workflow: Workflow) -> WorkflowSchedule:
        execution = self._require_execution(workflow.workflow_id)
        ordered_job_ids = validate_workflow_dag(workflow.job_ids, workflow.input_links)
        predecessors = workflow_predecessors(workflow.job_ids, workflow.input_links)
        jobs = {job_id: self.load_job(job_id) for job_id in ordered_job_ids}
        if execution.status == "cancelled":
            return self._cancelled_schedule(execution, ordered_job_ids, jobs)

        blocked_job_ids: set[str] = set()
        nodes: list[WorkflowNodeRuntime] = []
        ready_job_ids: list[str] = []
        scheduler_error: tuple[str, str] | None = None

        for job_id in ordered_job_ids:
            job = jobs[job_id]
            blocked_by = sorted(
                predecessor
                for predecessor in predecessors[job_id]
                if jobs[predecessor].status in {"failed", "cancelled", "interrupted"}
                or predecessor in blocked_job_ids
            )
            if blocked_by:
                blocked_job_ids.add(job_id)
                nodes.append(
                    WorkflowNodeRuntime(
                        jobId=job_id,
                        jobStatus=job.status,
                        state="blocked",
                        blockedBy=blocked_by,
                    )
                )
                continue

            upstream_succeeded = all(
                jobs[predecessor].status == "succeeded"
                for predecessor in predecessors[job_id]
            )
            job, queue_error = self._queue_unblocked_job(
                workflow,
                execution,
                job,
                upstream_succeeded=upstream_succeeded,
            )
            jobs[job_id] = job
            if queue_error is not None:
                if queue_error == "execution_changed":
                    return self.advance(workflow)
                blocked_job_ids.add(job_id)
                scheduler_error = (
                    "workflow_input_unresolved",
                    f"Job '{job_id}' could not freeze workflow inputs: {queue_error}",
                )
                nodes.append(
                    WorkflowNodeRuntime(
                        jobId=job_id,
                        jobStatus=job.status,
                        state="blocked",
                    )
                )
                continue

            dispatch = (
                self.repository.get_job_dispatch(job_id)
                if job.status == "queued" and upstream_succeeded
                else None
            )
            decision = derive_workflow_node_decision(
                job_id,
                job.status,
                upstream_succeeded=upstream_succeeded,
                execution_active=execution.status == "active",
                dispatch_status=dispatch.status if dispatch is not None else None,
            )
            if decision.blocks_workflow:
                blocked_job_ids.add(job_id)
            if decision.ready:
                ready_job_ids.append(job_id)
            if decision.error is not None:
                scheduler_error = decision.error
            nodes.append(
                WorkflowNodeRuntime(
                    jobId=job_id,
                    jobStatus=job.status,
                    state=decision.state,
                )
            )

        self._finish_execution_if_resolved(
            workflow.workflow_id,
            execution,
            nodes,
            scheduler_error,
        )
        refreshed_execution = self.repository.get_workflow_execution(
            workflow.workflow_id
        )
        if refreshed_execution is None:
            raise RuntimeError("workflow execution disappeared during reconciliation")
        if refreshed_execution.status != "active":
            ready_job_ids = []
        return WorkflowSchedule(
            execution=refreshed_execution,
            nodes=nodes,
            readyJobIds=ready_job_ids,
        )

    def _queue_unblocked_job(
        self,
        workflow: Workflow,
        execution: WorkflowExecution,
        job: Job,
        *,
        upstream_succeeded: bool,
    ) -> tuple[Job, str | None]:
        if not (
            job.status == "created"
            and upstream_succeeded
            and execution.status == "active"
        ):
            return job, None
        try:
            return (
                self.queue_calculation_job(
                    job.job_id,
                    workflow_id=workflow.workflow_id,
                    require_active_workflow=True,
                ),
                None,
            )
        except InvalidJobOperationError:
            refreshed_execution = self.repository.get_workflow_execution(
                workflow.workflow_id
            )
            if refreshed_execution is None or refreshed_execution.status == "active":
                raise
            return job, "execution_changed"
        except (InvalidJobInputError, InvalidJobTransitionError) as exc:
            refreshed = self.load_job(job.job_id)
            return refreshed, str(exc) if refreshed.status == "created" else None

    def _finish_execution_if_resolved(
        self,
        workflow_id: str,
        execution: WorkflowExecution,
        nodes: list[WorkflowNodeRuntime],
        scheduler_error: tuple[str, str] | None,
    ) -> None:
        if execution.status != "active":
            return
        states = {node.state for node in nodes}
        if all(node.state == "succeeded" for node in nodes):
            self.repository.transition_workflow_execution(
                workflow_id,
                expected_status="active",
                next_status="succeeded",
                updated_at=_now(),
            )
            return
        if states & _FAILED_NODE_STATES and not states & _VIABLE_NODE_STATES:
            code, message = scheduler_error or (
                "workflow_dependency_failed",
                "One or more workflow dependencies failed",
            )
            self.repository.transition_workflow_execution(
                workflow_id,
                expected_status="active",
                next_status="blocked",
                updated_at=_now(),
                error_code=code,
                error_message=message,
            )

    @staticmethod
    def _cancelled_schedule(
        execution: WorkflowExecution,
        ordered_job_ids: list[str],
        jobs: dict[str, Job],
    ) -> WorkflowSchedule:
        return WorkflowSchedule(
            execution=execution,
            nodes=[
                WorkflowNodeRuntime(
                    jobId=job_id,
                    jobStatus=jobs[job_id].status,
                    state=_CANCELLED_WORKFLOW_STATE_BY_JOB[jobs[job_id].status],
                )
                for job_id in ordered_job_ids
            ],
            readyJobIds=[],
        )

    def _require_execution(self, workflow_id: str) -> WorkflowExecution:
        execution = self.repository.get_workflow_execution(workflow_id)
        if execution is None:
            raise InvalidJobOperationError("workflow has not been activated")
        return execution


def _now() -> datetime:
    return datetime.now(UTC)
