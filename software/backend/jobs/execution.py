"""Shared errors and dispatch for persisted calculation jobs."""

from __future__ import annotations

import logging
from collections.abc import Callable
from typing import Any

from .job_types import JOB_TYPE_REGISTRY, UnknownJobTypeError

LOGGER = logging.getLogger(__name__)


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


def _fail_job_before_run(
    service: Any, job_id: str, message: str, error_code: str
) -> None:
    """Persist a pre-execution failure so the job does not stay queued forever.

    A job's dispatch row is single-shot: once the worker consumes it, the job
    can never be re-dispatched. A precheck error that only raises would leave
    the job 'queued' with no error surface and no way to run it again, so we
    claim it and record the failure as a terminal, retryable state instead.
    """
    claim = getattr(service, "claim_queued_job", None)
    update = getattr(service, "update_status", None)
    if not callable(claim) or not callable(update):
        return
    try:
        if claim(job_id) is None:
            return
        update(job_id, "failed", error=message, error_code=error_code)
    except Exception:
        LOGGER.exception(
            "Could not persist precheck failure for job %s", job_id
        )


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
        try:
            job_type_data = get_job_type_data(job.job_id)
        except ValueError as exc:
            message = (
                f"Job '{job.job_id}' has no readable JobType data: {exc}"
            )
            _fail_job_before_run(
                service, job.job_id, message, "job_type_data_unavailable"
            )
            raise JobExecutionError(message) from exc
        if (
            job_type_data.job_type != handler.job_type
            or job_type_data.job_type_version != handler.job_type_version
        ):
            message = (
                f"Job '{job.job_id}' requires "
                f"{job_type_data.job_type}@{job_type_data.job_type_version}, but "
                f"the worker registered {handler.job_type}@{handler.job_type_version}"
            )
            _fail_job_before_run(
                service, job.job_id, message, "job_type_version_mismatch"
            )
            raise JobExecutionError(message)
    return handler.run(service, job_id, stop_check=stop_check)


__all__ = [
    "JobExecutionError",
    "SUPPORTED_JOB_TYPES",
    "ensure_supported_job",
    "run_persisted_job",
]
