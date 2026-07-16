"""Shared errors and dispatch for persisted calculation jobs."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any


class JobExecutionError(RuntimeError):
    """Raised when a persisted job cannot be executed."""


SUPPORTED_JOB_TYPES = frozenset(
    {"xtb-optimization", "psi4-ts-refine", "psi4-frequency", "psi4-irc"}
)


def ensure_supported_job(job: Any) -> None:
    if job.task_type not in SUPPORTED_JOB_TYPES:
        raise JobExecutionError(
            f"Job '{job.job_id}' has unsupported task type '{job.task_type}'"
        )


def run_persisted_job(
    service: Any,
    job_id: str,
    *,
    stop_check: Callable[[], bool] | None = None,
) -> Any:
    """Dispatch one persisted job without exposing engine details to HTTP routes."""
    job = service.get_job(job_id)
    if job.task_type == "xtb-optimization":
        from .xtb_runner import run_xtb_optimization_job

        return run_xtb_optimization_job(service, job_id, stop_check=stop_check)
    if job.task_type in {"psi4-ts-refine", "psi4-frequency", "psi4-irc"}:
        from .psi4_runner import run_psi4_job

        return run_psi4_job(service, job_id, stop_check=stop_check)
    ensure_supported_job(job)
    raise AssertionError("supported job was not dispatched")


__all__ = [
    "JobExecutionError",
    "SUPPORTED_JOB_TYPES",
    "ensure_supported_job",
    "run_persisted_job",
]
