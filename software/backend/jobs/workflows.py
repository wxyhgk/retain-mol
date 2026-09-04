"""DAG validation for job workflows."""

from __future__ import annotations

from collections import deque
from collections.abc import Iterable

from .models import WorkflowInputLink
from .workflow_input_links import validate_workflow_input_links


class WorkflowValidationError(ValueError):
    """Raised when a workflow's jobs and dependencies do not form a DAG."""


def validate_workflow_dag(
    job_ids: Iterable[str],
    input_links: Iterable[WorkflowInputLink],
) -> list[str]:
    """Validate membership and return a deterministic topological job order."""
    supplied_nodes = list(job_ids)
    nodes = list(dict.fromkeys(supplied_nodes))
    if len(nodes) == 0:
        raise WorkflowValidationError("a workflow must contain at least one job")
    if len(nodes) != len(supplied_nodes):
        raise WorkflowValidationError("workflow job ids must be unique")
    if any(not isinstance(job_id, str) or not job_id.strip() for job_id in nodes):
        raise WorkflowValidationError("workflow job ids must be non-empty strings")

    node_set = set(nodes)
    input_links = validate_workflow_input_links(input_links)
    outgoing = {job_id: set() for job_id in nodes}
    incoming = {job_id: 0 for job_id in nodes}
    for link in input_links:
        if link.source_job_id not in node_set or link.target_job_id not in node_set:
            raise WorkflowValidationError(
                "every input link source and target must belong to the workflow"
            )
        if link.target_job_id not in outgoing[link.source_job_id]:
            outgoing[link.source_job_id].add(link.target_job_id)
            incoming[link.target_job_id] += 1

    ready = deque(job_id for job_id in nodes if incoming[job_id] == 0)
    ordered: list[str] = []
    while ready:
        job_id = ready.popleft()
        ordered.append(job_id)
        for target in sorted(outgoing[job_id]):
            incoming[target] -= 1
            if incoming[target] == 0:
                ready.append(target)
    if len(ordered) != len(nodes):
        raise WorkflowValidationError("workflow input links contain a cycle")
    return ordered


def workflow_predecessors(
    job_ids: Iterable[str],
    input_links: Iterable[WorkflowInputLink],
) -> dict[str, set[str]]:
    """Return direct upstream jobs after applying the same DAG validation rules."""
    nodes = list(job_ids)
    validated_links = list(validate_workflow_input_links(input_links))
    validate_workflow_dag(nodes, validated_links)
    predecessors = {job_id: set() for job_id in nodes}
    for link in validated_links:
        predecessors[link.target_job_id].add(link.source_job_id)
    return predecessors
