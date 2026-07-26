"""Lifecycle boundary for durable Psi4 calculation jobs."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from .execution import JobExecutionError
from .service import JobService

try:
    from engines.psi4_engine import (
        Psi4CancelledError,
        Psi4ExecutionError,
    )
except ModuleNotFoundError:
    from software.backend.engines.psi4_engine import (
        Psi4CancelledError,
        Psi4ExecutionError,
    )


PSI4_JOB_TYPES = frozenset({"psi4-ts-refine", "psi4-frequency", "psi4-irc"})


def run_psi4_job(
    service: JobService,
    job_id: str,
    *,
    stop_check: Callable[[], bool] | None = None,
    result_collector: Any | None = None,
    execution_adapter: Any | None = None,
) -> Any:
    """Claim one Psi4 job and persist its lifecycle outcome."""
    job = service.get_job(job_id)
    if job.task_type not in PSI4_JOB_TYPES:
        raise JobExecutionError(f"Job '{job_id}' is not a supported Psi4 job")
    claimed = service.claim_queued_job(job_id)
    if claimed is None:
        current = service.get_job(job_id)
        raise JobExecutionError(
            f"Job '{job_id}' has status '{current.status}'; create a new job to run it again"
        )
    try:
        if execution_adapter is None or result_collector is None:
            from .job_types.psi4 import (
                resolve_psi4_collector,
                resolve_psi4_executor,
            )

            execution_adapter = execution_adapter or resolve_psi4_executor(
                claimed.task_type
            )
            result_collector = result_collector or resolve_psi4_collector(
                claimed.task_type
            )
        execution_adapter.execute(
            service,
            claimed,
            service.get_active_job_run(job_id),
            result_collector,
            stop_check=stop_check,
        )
    except Psi4CancelledError:
        current = service.get_job(job_id)
        if current.status == "running" and stop_check is not None and stop_check():
            return service.update_status(
                job_id,
                "interrupted",
                error="backend stopped while the calculation was running",
                error_code="backend_shutdown",
            )
        return service.get_job(job_id)
    except Psi4ExecutionError as error:
        if service.get_job(job_id).status == "cancelled":
            return service.get_job(job_id)
        service.update_status(
            job_id, "failed", error=str(error), error_code="psi4_execution_failed"
        )
        raise JobExecutionError(str(error)) from error
    except Exception as error:
        if service.get_job(job_id).status == "cancelled":
            return service.get_job(job_id)
        service.update_status(
            job_id, "failed", error=str(error), error_code="execution_failed"
        )
        if isinstance(error, JobExecutionError):
            raise
        raise JobExecutionError(str(error)) from error
    service.update_status(job.job_id, "succeeded")
    return service.get_job(job_id)


__all__ = ["PSI4_JOB_TYPES", "run_psi4_job"]
