"""Job run and lifecycle persistence operations."""

from __future__ import annotations

import secrets
import sqlite3
from datetime import datetime

from .models import JobRun, JobStatus
from .repository_records import _json_dump, _optional_timestamp, _timestamp


class JobRunRepositoryMixin:
    """Persist concrete attempts and guarded lifecycle transitions."""

    def list_job_runs(self, job_id: str) -> list[JobRun]:
        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT * FROM job_runs
                WHERE job_id = ?
                ORDER BY run_number, run_id
                """,
                (job_id,),
            ).fetchall()
        return [self._job_run_from_row(row) for row in rows]

    def get_job_run(self, run_id: str) -> JobRun | None:
        with self._connection() as connection:
            row = connection.execute(
                "SELECT * FROM job_runs WHERE run_id = ?", (run_id,)
            ).fetchone()
        return self._job_run_from_row(row) if row is not None else None

    def get_active_job_run(self, job_id: str) -> JobRun | None:
        with self._connection() as connection:
            row = connection.execute(
                """
                SELECT * FROM job_runs
                WHERE job_id = ? AND status = 'running'
                ORDER BY run_number DESC
                LIMIT 1
                """,
                (job_id,),
            ).fetchone()
        return self._job_run_from_row(row) if row is not None else None

    def claim_job_run(self, run: JobRun) -> bool:
        """Atomically claim a queued Job and create its concrete running attempt."""
        if run.status != "running":
            raise ValueError("a claimed JobRun must start in the running state")
        with self._connection() as connection:
            connection.execute("BEGIN IMMEDIATE")
            row = connection.execute(
                "SELECT status, state_version FROM jobs WHERE job_id = ?",
                (run.job_id,),
            ).fetchone()
            if row is None or row["status"] != "queued":
                return False
            next_run_number = int(
                connection.execute(
                    """
                    SELECT COALESCE(MAX(run_number), 0) + 1
                    FROM job_runs WHERE job_id = ?
                    """,
                    (run.job_id,),
                ).fetchone()[0]
            )
            if run.run_number != next_run_number:
                raise ValueError(
                    f"JobRun number must be {next_run_number} for Job '{run.job_id}'"
                )
            connection.execute(
                """
                INSERT INTO job_runs
                    (run_id, job_id, run_number, engine, status, collector_id,
                     collector_version, error_code, error_message, metadata_json,
                     started_at, finished_at)
                VALUES (?, ?, ?, ?, 'running', ?, ?, NULL, NULL, ?, ?, NULL)
                """,
                (
                    run.run_id,
                    run.job_id,
                    run.run_number,
                    run.engine,
                    run.collector_id,
                    run.collector_version,
                    _json_dump(run.metadata),
                    _timestamp(run.started_at),
                ),
            )
            next_version = int(row["state_version"]) + 1
            cursor = connection.execute(
                """
                UPDATE jobs
                SET status = 'running', started_at = COALESCE(started_at, ?),
                    attempt_count = attempt_count + 1, state_version = ?, updated_at = ?
                WHERE job_id = ? AND status = 'queued' AND state_version = ?
                """,
                (
                    _timestamp(run.started_at),
                    next_version,
                    _timestamp(run.started_at),
                    run.job_id,
                    row["state_version"],
                ),
            )
            if cursor.rowcount != 1:
                raise sqlite3.IntegrityError("job changed while creating its run")
            connection.execute(
                """
                INSERT INTO job_status_events
                    (event_id, job_id, from_status, to_status, error_code,
                     error_message, state_version, created_at)
                VALUES (?, ?, 'queued', 'running', NULL, NULL, ?, ?)
                """,
                (
                    f"event-{secrets.token_hex(8)}",
                    run.job_id,
                    next_version,
                    _timestamp(run.started_at),
                ),
            )
            return True

    def transition_status(
        self,
        job_id: str,
        expected_statuses: tuple[JobStatus, ...],
        next_status: JobStatus,
        updated_at: datetime,
        error_code: str | None = None,
        error_message: str | None = None,
    ) -> bool:
        with self._connection() as connection:
            row = connection.execute(
                "SELECT status, state_version FROM jobs WHERE job_id = ?", (job_id,)
            ).fetchone()
            if row is None or row["status"] not in expected_statuses:
                return False
            next_version = int(row["state_version"]) + 1
            queued_at = updated_at if next_status == "queued" else None
            started_at = updated_at if next_status == "running" else None
            terminal = next_status in {
                "succeeded",
                "failed",
                "cancelled",
                "interrupted",
            }
            cursor = connection.execute(
                """
                UPDATE jobs
                SET status = ?, error = ?, error_code = ?, error_message = ?,
                    queued_at = COALESCE(queued_at, ?),
                    started_at = COALESCE(started_at, ?),
                    finished_at = CASE WHEN ? THEN ? ELSE finished_at END,
                    attempt_count = attempt_count +
                        CASE WHEN ? = 'running' THEN 1 ELSE 0 END,
                    state_version = ?, updated_at = ?
                WHERE job_id = ? AND status = ? AND state_version = ?
                """,
                (
                    next_status,
                    error_message,
                    error_code,
                    error_message,
                    _optional_timestamp(queued_at),
                    _optional_timestamp(started_at),
                    terminal,
                    _timestamp(updated_at),
                    next_status,
                    next_version,
                    _timestamp(updated_at),
                    job_id,
                    row["status"],
                    row["state_version"],
                ),
            )
            if cursor.rowcount != 1:
                return False
            connection.execute(
                """
                INSERT INTO job_status_events
                (event_id, job_id, from_status, to_status, error_code, error_message,
                 state_version, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    f"event-{secrets.token_hex(8)}",
                    job_id,
                    row["status"],
                    next_status,
                    error_code,
                    error_message,
                    next_version,
                    _timestamp(updated_at),
                ),
            )
            if terminal:
                connection.execute(
                    """
                    UPDATE job_runs
                    SET status = ?, error_code = ?, error_message = ?, finished_at = ?
                    WHERE run_id = (
                        SELECT run_id FROM job_runs
                        WHERE job_id = ? AND status = 'running'
                        ORDER BY run_number DESC
                        LIMIT 1
                    )
                    """,
                    (
                        next_status,
                        error_code,
                        error_message,
                        _timestamp(updated_at),
                        job_id,
                    ),
                )
                self._finish_dispatches_for_terminal_jobs(connection, updated_at)
            return True

    def claim_job(
        self,
        job_id: str,
        *,
        expected_status: str,
        next_status: str,
        updated_at: datetime,
    ) -> bool:
        """Atomically move one job from an expected state to an active state."""
        return self.transition_status(
            job_id,
            (expected_status,),
            next_status,
            updated_at,
        )

    def touch_job(self, job_id: str, updated_at: datetime) -> bool:
        with self._connection() as connection:
            cursor = connection.execute(
                "UPDATE jobs SET updated_at = ? WHERE job_id = ?",
                (_timestamp(updated_at), job_id),
            )
        return cursor.rowcount == 1

