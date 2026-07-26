"""Shared errors and dispatch for persisted calculation jobs."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from .job_types import JOB_TYPE_REGISTRY, UnknownJobTypeError


class JobExecutionError(RuntimeError):
    """Raised when a persisted job cannot be executed."""


SUPPORTED_JOB_TYPES = frozenset(JOB_TYPE_REGISTRY.list_job_types())


def ensure_supported_job(job: Any) -> None:
    try:
        JOB_TYPE_REGISTRY.resolve(job.task_type)
    except (UnknownJobTypeError, ValueError) as exc:
        raise JobExecutionError(
            f"Job '{job.job_id}' has unsupported task type '{job.task_type}'"
        ) from exc


def run_persisted_job(
    service: Any,
    job_id: str,
    *,
    stop_check: Callable[[], bool] | None = None,
) -> Any:
    """Dispatch one persisted job without exposing engine details to HTTP routes."""
    job = service.get_job(job_id)
    try:
        handler = JOB_TYPE_REGISTRY.resolve(job.task_type)
    except (UnknownJobTypeError, ValueError) as exc:
        raise JobExecutionError(
            f"Job '{job.job_id}' has unsupported task type '{job.task_type}'"
        ) from exc
    get_job_type_data = getattr(service, "get_job_type_data", None)
    if callable(get_job_type_data):
        job_type_data = get_job_type_data(job.job_id)
        if (
            job_type_data.job_type != handler.job_type
            or job_type_data.job_type_version != handler.job_type_version
        ):
            raise JobExecutionError(
                f"Job '{job.job_id}' requires "
                f"{job_type_data.job_type}@{job_type_data.job_type_version}, but "
                f"the worker registered {handler.job_type}@{handler.job_type_version}"
            )
    return handler.run(service, job_id, stop_check=stop_check)


__all__ = [
    "JobExecutionError",
    "SUPPORTED_JOB_TYPES",
    "ensure_supported_job",
    "run_persisted_job",
]
