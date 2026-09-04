"""Validation primitives for data links between jobs in a workflow."""

from __future__ import annotations

from collections.abc import Iterable

from .models import WorkflowInputLink


class WorkflowInputLinkValidationError(ValueError):
    """Raised when an input link cannot participate in a workflow graph."""


def validate_workflow_input_links(
    input_links: Iterable[WorkflowInputLink],
) -> list[WorkflowInputLink]:
    """Return input links after rejecting self-links and duplicate targets."""
    validated = list(input_links)
    targets: set[tuple[str, str]] = set()
    for link in validated:
        if link.source_job_id == link.target_job_id:
            raise WorkflowInputLinkValidationError("a job cannot link to itself")
        target = (link.target_job_id, link.target_input_name)
        if target in targets:
            raise WorkflowInputLinkValidationError(
                f"duplicate input link target: {link.target_job_id}/{link.target_input_name}"
            )
        targets.add(target)
    return validated
