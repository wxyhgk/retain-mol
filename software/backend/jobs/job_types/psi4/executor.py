"""Task-specific preparation and Psi4 invocation for built-in JobTypes."""

from __future__ import annotations

import logging
from collections.abc import Callable
from typing import Any

try:
    from engines.psi4_engine import Psi4CancelledError, run_psi4_operation
except ModuleNotFoundError:
    from software.backend.engines.psi4_engine import (
        Psi4CancelledError,
        run_psi4_operation,
    )

from .common import (
    Psi4CollectionContext,
    Psi4OperationOutput,
    publish_irc_trajectory,
    publish_json,
    publish_log,
    publish_structure,
)
from .request import PreparedPsi4JobV1, prepare_psi4_job_v1

LOGGER = logging.getLogger(__name__)


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
        failed_direction: str | None = None
        try:
            for direction in directions:
                failed_direction = direction
                branch = work / f"irc-{direction}"
                result = run_psi4_operation(
                    {**payload, "operation": "irc", "direction": direction},
                    branch,
                    timeout=prepared.timeout_seconds,
                    cancel_check=self._cancel_check(
                        service, job.job_id, stop_check
                    ),
                )
                self._ensure_not_cancelled(service, job.job_id)
                outputs.append(
                    Psi4OperationOutput(
                        work_directory=branch,
                        result=result,
                        direction=direction,
                    )
                )
                failed_direction = None
        except Psi4CancelledError:
            raise
        except BaseException:
            # One branch failed: register everything the finished branches
            # already produced, plus the failed branch's diagnostic log,
            # before the runner marks the job failed. Otherwise hours of
            # forward-branch work would exist only on disk, unreachable
            # through the API.
            self._publish_partial_irc_results(
                service,
                job,
                run,
                prepared,
                work,
                tuple(outputs),
                failed_direction,
            )
            raise
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

    @staticmethod
    def _publish_partial_irc_results(
        service: Any,
        job: Any,
        run: Any,
        prepared: PreparedPsi4JobV1,
        work: Any,
        outputs: tuple[Psi4OperationOutput, ...],
        failed_direction: str | None,
    ) -> None:
        """Best-effort artifact registration for a failed IRC job.

        Publication must never mask the original engine error, so every
        individual publish failure is swallowed here.
        """
        context = Psi4CollectionContext(
            service=service,
            job=job,
            run=run,
            request=prepared.collection_request,
            work_directory=work,
            outputs=outputs,
        )
        for output in outputs:
            direction = output.direction
            publishers: tuple[Any, ...] = (
                lambda: publish_structure(
                    context, output, f"irc-{direction}-endpoint.xyz"
                ),
                lambda: publish_json(
                    context,
                    f"irc-{direction}.json",
                    source=output.work_directory / "psi4-result.json",
                ),
                lambda: publish_log(
                    context,
                    f"psi4-{direction}.log",
                    source=output.work_directory / "psi4.log",
                ),
                lambda: publish_irc_trajectory(
                    context, output, f"irc-{direction}-trajectory.json"
                ),
            )
            for publish in publishers:
                try:
                    publish()
                except Exception:
                    LOGGER.exception(
                        "Could not publish partial IRC artifact for job %s "
                        "(direction %s)",
                        job.job_id,
                        direction,
                    )
        if failed_direction is not None:
            try:
                publish_log(
                    context,
                    f"psi4-{failed_direction}.log",
                    source=work / f"irc-{failed_direction}" / "psi4.log",
                )
            except Exception:
                LOGGER.exception(
                    "Could not publish diagnostic log for failed IRC branch "
                    "'%s' of job %s",
                    failed_direction,
                    job.job_id,
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
