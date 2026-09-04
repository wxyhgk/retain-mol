"""Execution preparation and engine invocation for ``xtb-optimization@1``."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

try:
    from engines.process_runner import ProcessCancelledError
    from engines.xtb import run_xtb_process
except ModuleNotFoundError:
    from software.backend.engines.process_runner import ProcessCancelledError
    from software.backend.engines.xtb import run_xtb_process

from .collector import XtbCollectionContext
from .request import (
    PreparedXtbOptimizationJobV1,
    prepare_xtb_optimization_job_v1,
)


class XtbOptimizationExecutor:
    """Prepare, execute, and collect one claimed xTB optimization run."""

    def prepare_request(
        self, service: Any, job: Any
    ) -> PreparedXtbOptimizationJobV1:
        return prepare_xtb_optimization_job_v1(service, job)

    def execute(
        self,
        service: Any,
        job: Any,
        run: Any,
        collector: Any,
        *,
        stop_check: Callable[[], bool] | None = None,
    ) -> Any:
        prepared = self.prepare_request(service, job)

        work = service.task_directory(job.job_id)
        log_path = work / "xtb.log"
        process = run_xtb_process(
            prepared.engine_request,
            work_directory=work,
            log_path=log_path,
            timeout=prepared.job_data.timeout_seconds,
            cancel_check=lambda: service.get_job(job.job_id).status == "cancelled"
            or bool(stop_check and stop_check()),
        )
        if service.get_job(job.job_id).status == "cancelled":
            raise ProcessCancelledError("xTB calculation was cancelled")

        return collector.collect(
            XtbCollectionContext(
                service=service,
                job=job,
                run=run,
                request=prepared.collection_request,
                optimize_request=prepared.engine_request,
                process=process,
                work_directory=work,
            )
        )


__all__ = ["XtbOptimizationExecutor"]
