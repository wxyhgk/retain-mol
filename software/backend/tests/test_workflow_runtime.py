"""Focused tests for workflow runtime state reconciliation."""

from __future__ import annotations

import pytest

from software.backend.jobs.models import DispatchStatus, JobStatus
from software.backend.jobs.workflow_runtime import derive_workflow_node_decision


@pytest.mark.parametrize(
    ("job_status", "expected_state"),
    [
        ("succeeded", "succeeded"),
        ("failed", "failed"),
        ("cancelled", "failed"),
        ("interrupted", "failed"),
        ("running", "running"),
    ],
)
def test_terminal_and_running_jobs_map_directly_to_node_state(
    job_status: JobStatus,
    expected_state: str,
) -> None:
    decision = derive_workflow_node_decision(
        "job-1",
        job_status,
        upstream_succeeded=False,
        execution_active=True,
        dispatch_status=None,
    )

    assert decision.state == expected_state
    assert decision.ready is False
    assert decision.blocks_workflow is False
    assert decision.error is None


@pytest.mark.parametrize("job_status", ["created", "queued"])
def test_unresolved_upstream_keeps_created_or_queued_job_waiting(
    job_status: JobStatus,
) -> None:
    decision = derive_workflow_node_decision(
        "job-1",
        job_status,
        upstream_succeeded=False,
        execution_active=True,
        dispatch_status=None,
    )

    assert decision.state == "waiting"
    assert decision.ready is False


def test_queued_job_without_dispatch_is_ready_only_for_active_execution() -> None:
    active = derive_workflow_node_decision(
        "job-1",
        "queued",
        upstream_succeeded=True,
        execution_active=True,
        dispatch_status=None,
    )
    inactive = derive_workflow_node_decision(
        "job-1",
        "queued",
        upstream_succeeded=True,
        execution_active=False,
        dispatch_status=None,
    )

    assert active.state == "ready"
    assert active.ready is True
    assert inactive.state == "ready"
    assert inactive.ready is False


@pytest.mark.parametrize("dispatch_status", ["pending", "leased"])
def test_live_dispatch_keeps_queued_job_queued(
    dispatch_status: DispatchStatus,
) -> None:
    decision = derive_workflow_node_decision(
        "job-1",
        "queued",
        upstream_succeeded=True,
        execution_active=True,
        dispatch_status=dispatch_status,
    )

    assert decision.state == "queued"
    assert decision.ready is False


def test_finished_dispatch_for_queued_job_blocks_workflow() -> None:
    decision = derive_workflow_node_decision(
        "job-1",
        "queued",
        upstream_succeeded=True,
        execution_active=True,
        dispatch_status="finished",
    )

    assert decision.state == "blocked"
    assert decision.blocks_workflow is True
    assert decision.error == (
        "workflow_dispatch_finished_early",
        "Job 'job-1' is queued but its dispatch is already finished",
    )
