"""Durable Job dispatch queue persistence operations."""

from __future__ import annotations

import sqlite3
from datetime import datetime

from .models import JobDispatch
from .repository_records import _timestamp


class JobDispatchRepositoryMixin:
    """Persist bounded dispatch admission, leasing, and recovery."""

    def request_job_dispatch(
        self,
        dispatch: JobDispatch,
        *,
        max_inflight: int,
    ) -> bool:
        """Persist one execution request with bounded, process-safe admission."""
        with self._connection() as connection:
            connection.execute("BEGIN IMMEDIATE")
            self._finish_dispatches_for_terminal_jobs(connection, dispatch.requested_at)
            row = connection.execute(
                "SELECT status FROM job_dispatches WHERE job_id = ?",
                (dispatch.job_id,),
            ).fetchone()
            if row is not None:
                return False
            job = connection.execute(
                "SELECT status FROM jobs WHERE job_id = ?", (dispatch.job_id,)
            ).fetchone()
            if job is None:
                raise KeyError(dispatch.job_id)
            if job["status"] != "queued":
                raise ValueError(
                    f"Job '{dispatch.job_id}' has status '{job['status']}'; "
                    "only queued jobs can run"
                )
            inflight = int(
                connection.execute(
                    """
                    SELECT COUNT(*) FROM job_dispatches
                    WHERE status IN ('pending', 'leased')
                    """
                ).fetchone()[0]
            )
            if inflight >= max_inflight:
                raise OverflowError("The durable job execution queue is full")
            connection.execute(
                """
                INSERT INTO job_dispatches
                    (dispatch_id, job_id, status, requested_at, available_at)
                VALUES (?, ?, 'pending', ?, ?)
                """,
                (
                    dispatch.dispatch_id,
                    dispatch.job_id,
                    _timestamp(dispatch.requested_at),
                    _timestamp(dispatch.available_at),
                ),
            )
            return True

    def recover_expired_dispatches(self, now: datetime) -> list[str]:
        """Requeue unstarted leases and finish leases whose jobs were running."""
        timestamp = _timestamp(now)
        with self._connection() as connection:
            connection.execute("BEGIN IMMEDIATE")
            running_rows = connection.execute(
                """
                SELECT d.job_id
                FROM job_dispatches d
                JOIN jobs j ON j.job_id = d.job_id
                WHERE d.status = 'leased'
                  AND d.lease_expires_at <= ?
                  AND j.status = 'running'
                """,
                (timestamp,),
            ).fetchall()
            running_job_ids = [str(row["job_id"]) for row in running_rows]
            connection.execute(
                """
                UPDATE job_dispatches
                SET status = 'pending', lease_owner = NULL, lease_token = NULL,
                    lease_expires_at = NULL, heartbeat_at = NULL,
                    available_at = ?
                WHERE status = 'leased' AND lease_expires_at <= ?
                  AND job_id IN (SELECT job_id FROM jobs WHERE status = 'queued')
                """,
                (timestamp, timestamp),
            )
            connection.execute(
                """
                UPDATE job_dispatches
                SET status = 'finished', finished_at = ?,
                    last_error = CASE
                        WHEN last_error IS NULL THEN 'worker lease expired'
                        ELSE last_error
                    END
                WHERE status = 'leased' AND lease_expires_at <= ?
                  AND job_id IN (
                      SELECT job_id FROM jobs WHERE status <> 'queued'
                  )
                """,
                (timestamp, timestamp),
            )
            self._finish_dispatches_for_terminal_jobs(connection, now)
            return running_job_ids

    def list_unleased_running_job_ids(self, now: datetime) -> list[str]:
        """Find legacy or abandoned running jobs not protected by a live lease."""
        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT j.job_id
                FROM jobs j
                WHERE j.status = 'running'
                  AND NOT EXISTS (
                      SELECT 1 FROM job_dispatches d
                      WHERE d.job_id = j.job_id
                        AND d.status = 'leased'
                        AND d.lease_expires_at > ?
                  )
                ORDER BY j.job_id
                """,
                (_timestamp(now),),
            ).fetchall()
        return [str(row["job_id"]) for row in rows]

    def claim_next_dispatch(
        self,
        *,
        lease_owner: str,
        lease_token: str,
        now: datetime,
        lease_expires_at: datetime,
    ) -> JobDispatch | None:
        """Lease the oldest runnable dispatch atomically across processes."""
        with self._connection() as connection:
            connection.execute("BEGIN IMMEDIATE")
            row = connection.execute(
                """
                SELECT d.*
                FROM job_dispatches d
                JOIN jobs j ON j.job_id = d.job_id
                WHERE d.status = 'pending'
                  AND d.available_at <= ?
                  AND j.status = 'queued'
                ORDER BY d.requested_at, d.dispatch_id
                LIMIT 1
                """,
                (_timestamp(now),),
            ).fetchone()
            if row is None:
                return None
            cursor = connection.execute(
                """
                UPDATE job_dispatches
                SET status = 'leased', lease_owner = ?, lease_token = ?,
                    lease_expires_at = ?, heartbeat_at = ?
                WHERE dispatch_id = ? AND status = 'pending'
                """,
                (
                    lease_owner,
                    lease_token,
                    _timestamp(lease_expires_at),
                    _timestamp(now),
                    row["dispatch_id"],
                ),
            )
            if cursor.rowcount != 1:
                return None
            leased = connection.execute(
                "SELECT * FROM job_dispatches WHERE dispatch_id = ?",
                (row["dispatch_id"],),
            ).fetchone()
            return self._dispatch_from_row(leased)

    def renew_dispatch_lease(
        self,
        job_id: str,
        lease_token: str,
        *,
        heartbeat_at: datetime,
        lease_expires_at: datetime,
    ) -> bool:
        with self._connection() as connection:
            cursor = connection.execute(
                """
                UPDATE job_dispatches
                SET heartbeat_at = ?, lease_expires_at = ?
                WHERE job_id = ? AND status = 'leased' AND lease_token = ?
                """,
                (
                    _timestamp(heartbeat_at),
                    _timestamp(lease_expires_at),
                    job_id,
                    lease_token,
                ),
            )
        return cursor.rowcount == 1

    def finish_job_dispatch(
        self,
        job_id: str,
        lease_token: str,
        *,
        finished_at: datetime,
        last_error: str | None = None,
    ) -> bool:
        with self._connection() as connection:
            cursor = connection.execute(
                """
                UPDATE job_dispatches
                SET status = 'finished', finished_at = ?, last_error = ?,
                    lease_expires_at = NULL
                WHERE job_id = ? AND status = 'leased' AND lease_token = ?
                """,
                (_timestamp(finished_at), last_error, job_id, lease_token),
            )
        return cursor.rowcount == 1

    def dispatch_counts(self) -> dict[str, int]:
        with self._connection() as connection:
            rows = connection.execute(
                "SELECT status, COUNT(*) AS total FROM job_dispatches GROUP BY status"
            ).fetchall()
        counts = {"pending": 0, "leased": 0, "finished": 0}
        counts.update({str(row["status"]): int(row["total"]) for row in rows})
        return counts

    def get_job_dispatch(self, job_id: str) -> JobDispatch | None:
        with self._connection() as connection:
            row = connection.execute(
                "SELECT * FROM job_dispatches WHERE job_id = ?", (job_id,)
            ).fetchone()
        return self._dispatch_from_row(row) if row is not None else None

    @staticmethod
    def _finish_dispatches_for_terminal_jobs(
        connection: sqlite3.Connection, now: datetime
    ) -> None:
        connection.execute(
            """
            UPDATE job_dispatches
            SET status = 'finished', finished_at = COALESCE(finished_at, ?),
                lease_expires_at = NULL
            WHERE status IN ('pending', 'leased')
              AND job_id IN (
                  SELECT job_id FROM jobs
                  WHERE status IN ('succeeded', 'failed', 'cancelled', 'interrupted')
              )
            """,
            (_timestamp(now),),
        )

