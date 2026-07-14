"""Validation primitives for references between persisted jobs."""

from __future__ import annotations

from collections.abc import Iterable

from .models import JobInputReference


class JobReferenceValidationError(ValueError):
    """Raised when a reference cannot participate in a workflow graph."""


def validate_job_input_references(
    references: Iterable[JobInputReference],
) -> list[JobInputReference]:
    """Return references after rejecting invalid or duplicate target inputs."""
    validated = list(references)
    targets: set[tuple[str, str]] = set()
    for reference in validated:
        if reference.source_job_id == reference.target_job_id:
            raise JobReferenceValidationError("a job cannot reference itself")
        target = (reference.target_job_id, reference.target_input_name)
        if target in targets:
            raise JobReferenceValidationError(
                f"duplicate reference target: {reference.target_job_id}/{reference.target_input_name}"
            )
        targets.add(target)
    return validated
