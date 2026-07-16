"""Lease-based workers for durable calculation dispatches."""

from __future__ import annotations

import logging
import os
import secrets
import socket
import threading
import time
from typing import Any

from .execution import JobExecutionError, ensure_supported_job, run_persisted_job

LOGGER = logging.getLogger(__name__)


class JobQueueFullError(RuntimeError):
    """Raised when durable dispatch admission reaches its configured bound."""


class JobNotRunnableError(RuntimeError):
    """Raised when a persisted job is not in a state that can be submitted."""


def execution_mode() -> str:
    """Return ``embedded`` or ``external`` for API process worker ownership."""
    mode = os.getenv("RETAINMOL_EXECUTION_MODE", "embedded").strip().lower()
    if mode not in {"embedded", "external"}:
        raise ValueError(
            "RETAINMOL_EXECUTION_MODE must be either 'embedded' or 'external'"
        )
    return mode


class JobExecutor:
    """Poll durable dispatches and run them with renewable SQLite leases."""

    def __init__(
        self,
        *,
        max_workers: int | None = None,
        max_queue_size: int | None = None,
        lease_seconds: float | None = None,
        poll_seconds: float | None = None,
    ) -> None:
        self.max_workers = max(
            1,
            max_workers
            if max_workers is not None
            else int(os.getenv("RETAINMOL_JOB_WORKERS", "1")),
        )
        self.max_queue_size = max(
            1,
            max_queue_size
            if max_queue_size is not None
            else int(os.getenv("RETAINMOL_JOB_QUEUE_SIZE", "128")),
        )
        self.lease_seconds = max(
            1.0,
            lease_seconds
            if lease_seconds is not None
            else float(os.getenv("RETAINMOL_JOB_LEASE_SECONDS", "30")),
        )
        self.poll_seconds = max(
            0.05,
            poll_seconds
            if poll_seconds is not None
            else float(os.getenv("RETAINMOL_JOB_POLL_SECONDS", "0.2")),
        )
        self.worker_id = (
            f"{socket.gethostname()}:{os.getpid()}:{secrets.token_hex(4)}"
        )
        self._lock = threading.RLock()
        self._active: set[str] = set()
        self._threads: list[threading.Thread] = []
        self._stop_event = threading.Event()
        self._wake_event = threading.Event()
        self._started = False
        self._service: Any | None = None
        self._last_workflow_sweep = 0.0

    def start(self, service: Any) -> None:
        """Start local workers; durable stale-lease recovery occurs while polling."""
        with self._lock:
            if self._started:
                return
            self._service = service
            recovered = service.recover_stale_executions()
            if recovered:
                LOGGER.warning(
                    "Recovered %d stale running job(s)", len(recovered)
                )
            self._stop_event.clear()
            self._wake_event.clear()
            self._threads = [
                threading.Thread(
                    target=self._worker,
                    name=f"retainmol-job-worker-{index + 1}",
                    daemon=True,
                )
                for index in range(self.max_workers)
            ]
            self._started = True
            for thread in self._threads:
                thread.start()

    def bind(self, service: Any) -> None:
        """Attach persistence for health reporting without starting local workers."""
        with self._lock:
            if self._started and self._service is not service:
                raise RuntimeError("cannot replace the service of a running executor")
            self._service = service

    def submit(
        self,
        service: Any,
        job_id: str,
        *,
        start_workers: bool | None = None,
    ) -> bool:
        """Persist one execution request and optionally wake embedded workers."""
        job = service.get_job(job_id)
        ensure_supported_job(job)
        if job.status != "queued":
            raise JobNotRunnableError(
                f"Job '{job_id}' has status '{job.status}'; only queued jobs can run"
            )
        try:
            accepted = service.request_job_dispatch(
                job_id,
                max_inflight=self.max_queue_size + self.max_workers,
            )
        except OverflowError as exc:
            raise JobQueueFullError(str(exc)) from exc
        except ValueError as exc:
            raise JobNotRunnableError(str(exc)) from exc

        self.bind(service)

        should_start = execution_mode() == "embedded" if start_workers is None else start_workers
        if should_start:
            self.start(service)
            self._wake_event.set()
        return accepted

    def submit_workflow(
        self,
        service: Any,
        workflow_id: str,
        *,
        start_workers: bool | None = None,
    ) -> Any:
        """Activate a DAG, persist dispatches for ready nodes, and return its state."""
        self.bind(service)
        schedule = service.start_workflow_execution(workflow_id)
        self._submit_workflow_ready_jobs(service, workflow_id, schedule)
        should_start = (
            execution_mode() == "embedded"
            if start_workers is None
            else start_workers
        )
        if should_start:
            self.start(service)
        self._wake_event.set()
        return service.advance_workflow_execution(workflow_id)

    def shutdown(self) -> None:
        """Stop local workers; pending durable dispatches remain available."""
        with self._lock:
            if not self._started:
                return
            self._stop_event.set()
            self._wake_event.set()
            threads = list(self._threads)
        for thread in threads:
            thread.join()
        with self._lock:
            self._threads = []
            self._started = False
            self._active.clear()
            self._service = None

    def snapshot(self) -> dict[str, Any]:
        with self._lock:
            service = self._service
            active = sorted(self._active)
            started = self._started
        counts = (
            service.dispatch_counts()
            if service is not None
            else {"pending": 0, "leased": 0, "finished": 0}
        )
        return {
            "mode": execution_mode(),
            "started": started,
            "accepting": not self._stop_event.is_set(),
            "workers": self.max_workers,
            "workerId": self.worker_id,
            "queued": counts["pending"],
            "leased": counts["leased"],
            "finished": counts["finished"],
            "activeJobIds": active,
        }

    def _worker(self) -> None:
        service = self._service
        if service is None:
            return
        while not self._stop_event.is_set():
            lease_token = secrets.token_hex(16)
            try:
                dispatch = service.claim_next_dispatch(
                    worker_id=self.worker_id,
                    lease_token=lease_token,
                    lease_seconds=self.lease_seconds,
                )
            except Exception:
                LOGGER.exception("Unable to poll the durable job queue")
                self._wait_for_work()
                continue
            if dispatch is None:
                self._sweep_active_workflows(service)
                self._wait_for_work()
                continue
            self._run_dispatch(service, dispatch.job_id, lease_token)

    def _run_dispatch(self, service: Any, job_id: str, lease_token: str) -> None:
        lease_lost = threading.Event()
        heartbeat_stop = threading.Event()
        heartbeat = threading.Thread(
            target=self._heartbeat,
            args=(service, job_id, lease_token, heartbeat_stop, lease_lost),
            name=f"retainmol-job-heartbeat-{job_id}",
            daemon=True,
        )
        with self._lock:
            self._active.add(job_id)
        heartbeat.start()
        last_error: str | None = None
        try:
            run_persisted_job(
                service,
                job_id,
                stop_check=lambda: self._stop_event.is_set() or lease_lost.is_set(),
            )
        except (JobExecutionError, KeyError) as exc:
            last_error = str(exc)
            LOGGER.exception("Persisted job %s failed", job_id)
        except Exception as exc:
            last_error = str(exc)
            LOGGER.exception("Unexpected worker failure for job %s", job_id)
        finally:
            heartbeat_stop.set()
            heartbeat.join()
            service.finish_job_dispatch(
                job_id,
                lease_token,
                last_error=last_error,
            )
            with self._lock:
                self._active.discard(job_id)
            self._advance_workflows_for_job(service, job_id)

    def _advance_workflows_for_job(self, service: Any, job_id: str) -> None:
        try:
            workflow_ids = service.active_workflow_ids_for_job(job_id)
        except Exception:
            LOGGER.exception("Unable to find workflows for completed job %s", job_id)
            return
        for workflow_id in workflow_ids:
            self._advance_and_submit_workflow(service, workflow_id)

    def _sweep_active_workflows(self, service: Any) -> None:
        now = time.monotonic()
        if now - self._last_workflow_sweep < max(0.5, self.poll_seconds * 5):
            return
        self._last_workflow_sweep = now
        try:
            workflow_ids = service.list_active_workflow_ids()
        except Exception:
            LOGGER.exception("Unable to list active workflow executions")
            return
        for workflow_id in workflow_ids:
            self._advance_and_submit_workflow(service, workflow_id)

    def _advance_and_submit_workflow(self, service: Any, workflow_id: str) -> None:
        try:
            schedule = service.advance_workflow_execution(workflow_id)
            self._submit_workflow_ready_jobs(service, workflow_id, schedule)
        except Exception:
            LOGGER.exception("Unable to advance workflow %s", workflow_id)

    def _submit_workflow_ready_jobs(
        self, service: Any, workflow_id: str, schedule: Any
    ) -> None:
        try:
            for job_id in schedule.ready_job_ids:
                ensure_supported_job(service.get_job(job_id))
        except (JobExecutionError, KeyError) as exc:
            LOGGER.error("Workflow %s has an unrunnable ready node: %s", workflow_id, exc)
            service.block_workflow_execution(
                workflow_id,
                error_code="workflow_job_not_runnable",
                error_message=str(exc),
            )
            return
        for job_id in schedule.ready_job_ids:
            try:
                self.submit(service, job_id, start_workers=False)
            except JobQueueFullError:
                LOGGER.info(
                    "Execution queue is full; workflow %s will retry job %s",
                    workflow_id,
                    job_id,
                )
                return
            except (JobExecutionError, JobNotRunnableError) as exc:
                LOGGER.error(
                    "Workflow %s cannot submit job %s: %s",
                    workflow_id,
                    job_id,
                    exc,
                )
                service.block_workflow_execution(
                    workflow_id,
                    error_code="workflow_job_not_runnable",
                    error_message=str(exc),
                )
                return

    def _heartbeat(
        self,
        service: Any,
        job_id: str,
        lease_token: str,
        stop_event: threading.Event,
        lease_lost: threading.Event,
    ) -> None:
        interval = max(0.25, self.lease_seconds / 3)
        while not stop_event.wait(interval):
            try:
                renewed = service.renew_dispatch_lease(
                    job_id,
                    lease_token,
                    lease_seconds=self.lease_seconds,
                )
            except Exception:
                LOGGER.exception("Unable to renew lease for job %s", job_id)
                renewed = False
            if not renewed:
                lease_lost.set()
                return

    def _wait_for_work(self) -> None:
        self._wake_event.wait(self.poll_seconds)
        self._wake_event.clear()


_EXECUTOR = JobExecutor()


def get_job_executor() -> JobExecutor:
    return _EXECUTOR


__all__ = [
    "JobExecutor",
    "JobNotRunnableError",
    "JobQueueFullError",
    "execution_mode",
    "get_job_executor",
]
