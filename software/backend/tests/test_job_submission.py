from types import SimpleNamespace

import pytest

from software.backend.jobs.errors import (
    InvalidJobOperationError,
    InvalidJobTransitionError,
)
from software.backend.jobs.job_submission import JobSubmissionManager


class _Resolver:
    def resolve_workflow_definitions(self, workflow_id: str, job_id: str):
        return {}

    def build_snapshots(self, job_id: str, job_type: str, definitions, now):
        return []


class _Repository:
    def __init__(self, workflow_status: str | None) -> None:
        self.workflow_status = workflow_status

    def get_calculation_spec(self, spec_id: str):
        return SimpleNamespace(kind="xtb-optimization")

    def freeze_job_input_snapshots_and_queue(self, *args, **kwargs) -> bool:
        return False

    def get_workflow_execution(self, workflow_id: str):
        if self.workflow_status is None:
            return None
        return SimpleNamespace(status=self.workflow_status)


def _submission_manager(workflow_status: str | None) -> JobSubmissionManager:
    jobs = iter(
        [
            SimpleNamespace(job_id="job-1", status="created", spec_id="spec-1"),
            SimpleNamespace(job_id="job-1", status="running", spec_id="spec-1"),
        ]
    )
    return JobSubmissionManager(
        _Repository(workflow_status),
        _Resolver(),
        SimpleNamespace(write_snapshot=lambda job: None),
        lambda job_id: next(jobs),
    )


def test_submission_reports_workflow_cancellation_won_queue_race() -> None:
    manager = _submission_manager("cancelled")

    with pytest.raises(InvalidJobOperationError, match="no longer active"):
        manager.queue_calculation_job(
            "job-1",
            workflow_id="workflow-1",
            require_active_workflow=True,
        )


def test_submission_reports_job_state_won_queue_race() -> None:
    manager = _submission_manager("active")

    with pytest.raises(InvalidJobTransitionError, match="cannot queue from 'running'"):
        manager.queue_calculation_job(
            "job-1",
            workflow_id="workflow-1",
            require_active_workflow=True,
        )
