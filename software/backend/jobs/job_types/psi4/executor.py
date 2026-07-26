"""Task-specific preparation and Psi4 invocation for built-in JobTypes."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

try:
    from engines.psi4_engine import Psi4CancelledError, run_psi4_operation
except ModuleNotFoundError:
    from software.backend.engines.psi4_engine import (
        Psi4CancelledError,
        run_psi4_operation,
    )

from .common import Psi4CollectionContext, Psi4OperationOutput
from .request import PreparedPsi4JobV1, prepare_psi4_job_v1


class _Psi4ExecutorBase:
    def prepare_request(self, service: Any, job: Any) -> PreparedPsi4JobV1:
        return prepare_psi4_job_v1(service, job)

    @staticmethod
    def _cancel_check(
        service: Any,
        job_id: str,
        stop_check: Callable[[], bool] | None,
    ) -> Callable[[], bool]:
        return lambda: service.get_job(job_id).status == "cancelled" or bool(
            stop_check and stop_check()
        )

    @staticmethod
    def _ensure_not_cancelled(service: Any, job_id: str) -> None:
        if service.get_job(job_id).status == "cancelled":
            raise Psi4CancelledError("Psi4 calculation was cancelled")


class Psi4SingleOperationExecutor(_Psi4ExecutorBase):
    """Execute one frequency or TS-refinement Psi4 operation."""

    def __init__(self, operation: str) -> None:
        self.operation = operation

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
        result = run_psi4_operation(
            {**prepared.engine_payload, "operation": self.operation},
            work,
            timeout=prepared.timeout_seconds,
            cancel_check=self._cancel_check(service, job.job_id, stop_check),
        )
        self._ensure_not_cancelled(service, job.job_id)
        return collector.collect(
            Psi4CollectionContext(
                service=service,
                job=job,
                run=run,
                request=prepared.collection_request,
                work_directory=work,
                outputs=(
                    Psi4OperationOutput(work_directory=work, result=result),
                ),
            )
        )


class Psi4IrcExecutor(_Psi4ExecutorBase):
    """Execute one or both directional IRC branches before collection."""

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
        payload = dict(prepared.engine_payload)
        requested_direction = payload.pop("direction", "both")
        directions = (
            ("forward", "backward")
            if requested_direction == "both"
            else (requested_direction,)
        )
        work = service.task_directory(job.job_id)
        outputs: list[Psi4OperationOutput] = []
        for direction in directions:
            branch = work / f"irc-{direction}"
            result = run_psi4_operation(
                {**payload, "operation": "irc", "direction": direction},
                branch,
                timeout=prepared.timeout_seconds,
                cancel_check=self._cancel_check(service, job.job_id, stop_check),
            )
            self._ensure_not_cancelled(service, job.job_id)
            outputs.append(
                Psi4OperationOutput(
                    work_directory=branch,
                    result=result,
                    direction=direction,
                )
            )
        return collector.collect(
            Psi4CollectionContext(
                service=service,
                job=job,
                run=run,
                request=prepared.collection_request,
                work_directory=work,
                outputs=tuple(outputs),
            )
        )


def resolve_psi4_executor(job_type: str):
    """Resolve execution semantics without adding branches to the runner."""
    executors = {
        "psi4-frequency": lambda: Psi4SingleOperationExecutor("frequency"),
        "psi4-irc": Psi4IrcExecutor,
        "psi4-ts-refine": lambda: Psi4SingleOperationExecutor("ts-refine"),
    }
    try:
        return executors[job_type]()
    except KeyError as exc:
        raise ValueError(f"Unsupported Psi4 JobType '{job_type}'") from exc


__all__ = [
    "Psi4IrcExecutor",
    "Psi4SingleOperationExecutor",
    "resolve_psi4_executor",
]
