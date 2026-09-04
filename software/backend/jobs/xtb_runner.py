"""Lifecycle boundary for durable ``xtb-optimization`` jobs."""

from __future__ import annotations

import subprocess
from collections.abc import Callable
from typing import Any

try:
    from engines.process_runner import ProcessCancelledError
except ModuleNotFoundError:
    from software.backend.engines.process_runner import ProcessCancelledError

from .execution import JobExecutionError
from .service import JobService


def _timeout_message(error: subprocess.TimeoutExpired) -> str:
    """Report the actual configured timeout instead of a fixed 5 minutes."""
    timeout_seconds = getattr(error, "timeout", None)
    if isinstance(timeout_seconds, (int, float)):
        return f"xTB job timed out after {timeout_seconds:g} seconds"
    return "xTB job timed out"


def run_xtb_optimization_job(
    service: JobService,
    job_id: str,
    *,
    stop_check: Callable[[], bool] | None = None,
    result_collector: Any | None = None,
    execution_adapter: Any | None = None,
) -> Any:
    """Claim one job and map execution failures into durable lifecycle states."""
    job = service.get_job(job_id)
    if job.task_type != "xtb-optimization":
        raise JobExecutionError(f"Job '{job_id}' is not an xTB optimization")
    claimed_job = service.claim_queued_job(job_id)
    if claimed_job is None:
        current_job = service.get_job(job_id)
        raise JobExecutionError(
            f"Job '{job_id}' has status '{current_job.status}'; create a new job to run it again"
        )
    try:
        if execution_adapter is None or result_collector is None:
            from .job_types.xtb import (
                XtbGeometryOptimizationCollector,
                XtbOptimizationExecutor,
            )

            execution_adapter = execution_adapter or XtbOptimizationExecutor()
            result_collector = (
                result_collector or XtbGeometryOptimizationCollector()
            )
        result = execution_adapter.execute(
            service,
            claimed_job,
            service.get_active_job_run(job_id),
            result_collector,
            stop_check=stop_check,
        )
    except ProcessCancelledError:
        current = service.get_job(job_id)
        if current.status == "running" and stop_check is not None and stop_check():
            return service.update_status(
                job_id,
                "interrupted",
                error="backend stopped while the calculation was running",
                error_code="backend_shutdown",
            )
        return service.get_job(job_id)
    except subprocess.TimeoutExpired as error:
        message = _timeout_message(error)
        service.update_status(
            job_id,
            "failed",
            error=message,
            error_code="timeout",
        )
        raise JobExecutionError(message) from error
    except FileNotFoundError as error:
        service.update_status(
            job_id,
            "failed",
            error="xtb command was not found",
            error_code="command_not_found",
        )
        raise JobExecutionError("xtb command was not found") from error
    except Exception as error:
        if service.get_job(job_id).status == "cancelled":
            return service.get_job(job_id)
        service.update_status(
            job_id,
            "failed",
            error=str(error),
            error_code="execution_failed",
        )
        if isinstance(error, JobExecutionError):
            raise
        raise JobExecutionError(str(error)) from error

    service.update_status(
        job_id, "succeeded" if result.succeeded else "failed"
    )
    return service.get_job(job_id)
