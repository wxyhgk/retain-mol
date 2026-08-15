"""Job definition and aggregate persistence operations."""

from __future__ import annotations

import secrets
import sqlite3
from datetime import datetime
from typing import Any

from .models import CalculationSpec, Job, JobInputSnapshot, JobTypeData
from .repository_records import (
    _json_dump,
    _json_load,
    _optional_timestamp,
    _parse_timestamp,
    _timestamp,
)


class JobDefinitionRepositoryMixin:
    """Persist immutable definitions and the mutable Job aggregate shell."""

    def create_job(
        self, job: Job, job_type_data: JobTypeData | None = None
    ) -> None:
        with self._connection() as connection:
            self._insert_job(connection, job)
            if job_type_data is not None:
                self._insert_job_type_data(connection, job_type_data)

    def create_job_with_spec(
        self,
        job: Job,
        spec: CalculationSpec,
        job_type_data: JobTypeData | None = None,
    ) -> None:
        """Persist an immutable calculation definition and its first run atomically."""
        with self._connection() as connection:
            self._insert_calculation_spec(connection, spec)
            self._insert_job(connection, job)
            if job_type_data is not None:
                self._insert_job_type_data(connection, job_type_data)

    def create_queued_job_with_spec_and_snapshots(
        self,
        job: Job,
        spec: CalculationSpec,
        input_snapshots: list[JobInputSnapshot],
        queued_at: datetime,
        job_type_data: JobTypeData | None = None,
    ) -> None:
        """Create a draft run, freeze inputs, and queue it in one transaction."""
        if job.status != "created" or job.state_version != 0:
            raise ValueError("atomic submission must start from a new created job")
        if any(snapshot.job_id != job.job_id for snapshot in input_snapshots):
            raise ValueError("all input snapshots must belong to the submitted job")
        with self._connection() as connection:
            connection.execute("BEGIN IMMEDIATE")
            self._insert_calculation_spec(connection, spec)
            self._insert_job(connection, job)
            if job_type_data is not None:
                self._insert_job_type_data(connection, job_type_data)
            self._insert_job_input_snapshots(connection, input_snapshots)
            self._queue_created_job(connection, job.job_id, queued_at)

    def freeze_job_input_snapshots_and_queue(
        self,
        job_id: str,
        input_snapshots: list[JobInputSnapshot],
        queued_at: datetime,
        *,
        active_workflow_id: str | None = None,
    ) -> bool:
        """Freeze resolved input snapshots and queue the job atomically."""
        if any(snapshot.job_id != job_id for snapshot in input_snapshots):
            raise ValueError("all input snapshots must belong to the queued job")
        with self._connection() as connection:
            connection.execute("BEGIN IMMEDIATE")
            if active_workflow_id is not None:
                execution = connection.execute(
                    "SELECT status FROM workflow_executions WHERE workflow_id = ?",
                    (active_workflow_id,),
                ).fetchone()
                if execution is None or execution["status"] != "active":
                    return False
            row = connection.execute(
                "SELECT status, state_version FROM jobs WHERE job_id = ?", (job_id,)
            ).fetchone()
            if row is None or row["status"] != "created" or row["state_version"] != 0:
                return False
            connection.execute(
                "DELETE FROM job_input_bindings WHERE job_id = ?", (job_id,)
            )
            self._insert_job_input_snapshots(connection, input_snapshots)
            self._queue_created_job(connection, job_id, queued_at)
            return True

    @staticmethod
    def _insert_calculation_spec(
        connection: sqlite3.Connection, spec: CalculationSpec
    ) -> None:
        connection.execute(
            """
            INSERT INTO calculation_specs
            (spec_id, schema_version, kind, engine, payload_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                spec.spec_id,
                spec.schema_version,
                spec.kind,
                spec.engine,
                _json_dump(spec.payload),
                _timestamp(spec.created_at),
            ),
        )

    @staticmethod
    def _queue_created_job(
        connection: sqlite3.Connection, job_id: str, queued_at: datetime
    ) -> None:
        cursor = connection.execute(
            """
            UPDATE jobs
            SET status = 'queued', queued_at = ?, state_version = 1, updated_at = ?
            WHERE job_id = ? AND status = 'created' AND state_version = 0
            """,
            (_timestamp(queued_at), _timestamp(queued_at), job_id),
        )
        if cursor.rowcount != 1:
            raise sqlite3.IntegrityError("job was not in the created state")
        connection.execute(
            """
            INSERT INTO job_status_events
            (event_id, job_id, from_status, to_status, error_code, error_message,
             state_version, created_at)
            VALUES (?, ?, 'created', 'queued', NULL, NULL, 1, ?)
            """,
            (f"event-{secrets.token_hex(8)}", job_id, _timestamp(queued_at)),
        )

    @staticmethod
    def _insert_job(connection: sqlite3.Connection, job: Job) -> None:
        connection.execute(
            """
            INSERT INTO jobs
            (job_id, task_type, status, spec_id, supersedes_job_id, metadata_json,
             error, error_code, error_message, queued_at, started_at, finished_at,
             attempt_count, state_version, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                job.job_id,
                job.task_type,
                job.status,
                job.spec_id,
                job.supersedes_job_id,
                _json_dump(job.metadata),
                job.error,
                job.error_code,
                job.error_message,
                _optional_timestamp(job.queued_at),
                _optional_timestamp(job.started_at),
                _optional_timestamp(job.finished_at),
                job.attempt_count,
                job.state_version,
                _timestamp(job.created_at),
                _timestamp(job.updated_at),
            ),
        )
        connection.execute(
            """
            INSERT INTO job_status_events
            (event_id, job_id, from_status, to_status, error_code, error_message,
             state_version, created_at)
            VALUES (?, ?, NULL, ?, NULL, NULL, ?, ?)
            """,
            (
                f"event-{secrets.token_hex(8)}",
                job.job_id,
                job.status,
                job.state_version,
                _timestamp(job.created_at),
            ),
        )

    @staticmethod
    def _insert_job_type_data(
        connection: sqlite3.Connection, job_type_data: JobTypeData
    ) -> None:
        connection.execute(
            """
            INSERT INTO job_type_data
                (job_id, job_type, job_type_version, schema_version, data_json,
                 created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                job_type_data.job_id,
                job_type_data.job_type,
                job_type_data.job_type_version,
                job_type_data.schema_version,
                _json_dump(job_type_data.data),
                _timestamp(job_type_data.created_at),
                _timestamp(job_type_data.updated_at),
            ),
        )

    def get_job_type_data(self, job_id: str) -> JobTypeData | None:
        with self._connection() as connection:
            row = connection.execute(
                "SELECT * FROM job_type_data WHERE job_id = ?", (job_id,)
            ).fetchone()
        return self._job_type_data_from_row(row) if row is not None else None

    def get_calculation_spec(self, spec_id: str) -> CalculationSpec | None:
        with self._connection() as connection:
            row = connection.execute(
                "SELECT * FROM calculation_specs WHERE spec_id = ?", (spec_id,)
            ).fetchone()
        if row is None:
            return None
        return CalculationSpec(
            spec_id=row["spec_id"],
            schema_version=row["schema_version"],
            kind=row["kind"],
            engine=row["engine"],
            payload=_json_load(row["payload_json"]),
            created_at=_parse_timestamp(row["created_at"]),
        )

    def list_jobs(self) -> list[Job]:
        with self._connection() as connection:
            rows = connection.execute(
                "SELECT * FROM jobs ORDER BY created_at DESC, job_id DESC"
            ).fetchall()
        return [self._job_from_row(row) for row in rows]

    def get_job(self, job_id: str) -> Job | None:
        with self._connection() as connection:
            row = connection.execute(
                "SELECT * FROM jobs WHERE job_id = ?", (job_id,)
            ).fetchone()
        return self._job_from_row(row) if row is not None else None

    def update_job_metadata(
        self, job_id: str, metadata: dict[str, Any], updated_at: datetime
    ) -> bool:
        with self._connection() as connection:
            cursor = connection.execute(
                "UPDATE jobs SET metadata_json = ?, updated_at = ? WHERE job_id = ?",
                (_json_dump(metadata), _timestamp(updated_at), job_id),
            )
        return cursor.rowcount == 1

    def list_workflow_ids_for_job(self, job_id: str) -> list[str]:
        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT workflow_id FROM workflow_jobs WHERE job_id = ?
                UNION
                SELECT workflow_id FROM job_input_references
                WHERE source_job_id = ? OR target_job_id = ?
                ORDER BY workflow_id
                """,
                (job_id, job_id, job_id),
            ).fetchall()
        return [str(row["workflow_id"]) for row in rows]

    def list_superseding_job_ids(self, job_id: str) -> list[str]:
        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT job_id FROM jobs
                WHERE supersedes_job_id = ?
                ORDER BY created_at, job_id
                """,
                (job_id,),
            ).fetchall()
        return [str(row["job_id"]) for row in rows]

    def delete_job(self, job_id: str) -> bool:
        """Delete one job aggregate and its now-unreferenced calculation spec."""
        with self._connection() as connection:
            row = connection.execute(
                "SELECT spec_id FROM jobs WHERE job_id = ?", (job_id,)
            ).fetchone()
            if row is None:
                return False
            spec_id = row["spec_id"]
            cursor = connection.execute("DELETE FROM jobs WHERE job_id = ?", (job_id,))
            if spec_id is not None:
                connection.execute(
                    """
                    DELETE FROM calculation_specs
                    WHERE spec_id = ?
                      AND NOT EXISTS (SELECT 1 FROM jobs WHERE spec_id = ?)
                    """,
                    (spec_id, spec_id),
                )
        return cursor.rowcount == 1

