"""SQLite storage primitives for RetainMol jobs."""

from __future__ import annotations

import json
import secrets
import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from typing import Any

from .migrations import migrate
from .models import (
    Artifact,
    CalculationSpec,
    Job,
    JobDispatch,
    JobInput,
    JobInputSnapshot,
    JobRun,
    JobStatus,
    JobTypeData,
    MoleculeAsset,
    MoleculeRevision,
    Workflow,
    WorkflowInputLink,
    WorkflowExecution,
)


class JobRepository:
    """Small SQLite repository with one connection per operation."""

    def __init__(self, database_path: str | Path) -> None:
        self.database_path = Path(database_path)
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self._initialize()

    @contextmanager
    def _connection(self) -> Iterator[sqlite3.Connection]:
        connection = sqlite3.connect(self.database_path, timeout=5)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        connection.execute("PRAGMA busy_timeout = 5000")
        try:
            yield connection
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def _initialize(self) -> None:
        with self._connection() as connection:
            migrate(connection)
            connection.execute("PRAGMA journal_mode = WAL")

    def create_molecule_asset(self, asset: MoleculeAsset) -> None:
        if asset.head_revision_id is not None:
            raise ValueError("a new molecule asset cannot already have a head revision")
        with self._connection() as connection:
            connection.execute(
                """
                INSERT INTO molecule_assets
                    (asset_id, name, metadata_json, head_revision_id, version,
                     created_at, updated_at)
                VALUES (?, ?, ?, NULL, ?, ?, ?)
                """,
                (
                    asset.asset_id,
                    asset.name,
                    _json_dump(asset.metadata),
                    asset.version,
                    _timestamp(asset.created_at),
                    _timestamp(asset.updated_at),
                ),
            )

    def get_molecule_asset(self, asset_id: str) -> MoleculeAsset | None:
        with self._connection() as connection:
            row = connection.execute(
                "SELECT * FROM molecule_assets WHERE asset_id = ?", (asset_id,)
            ).fetchone()
        return self._molecule_asset_from_row(row) if row is not None else None

    def list_molecule_assets(self) -> list[MoleculeAsset]:
        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT * FROM molecule_assets
                ORDER BY updated_at DESC, asset_id DESC
                """
            ).fetchall()
        return [self._molecule_asset_from_row(row) for row in rows]

    def create_molecule_revision(
        self,
        revision: MoleculeRevision,
        expected_head_revision_id: str | None,
        expected_version: int | None = None,
    ) -> bool:
        """Create a revision and move its asset head in one optimistic transaction."""
        with self._connection() as connection:
            connection.execute("BEGIN IMMEDIATE")
            asset_row = connection.execute(
                "SELECT * FROM molecule_assets WHERE asset_id = ?",
                (revision.asset_id,),
            ).fetchone()
            if asset_row is None:
                raise ValueError(f"molecule asset does not exist: {revision.asset_id}")

            current_head_revision_id = asset_row["head_revision_id"]
            if current_head_revision_id != expected_head_revision_id:
                return False
            if expected_version is not None and asset_row["version"] != expected_version:
                return False

            self._validate_molecule_revision_parent(connection, revision)
            self._insert_molecule_revision(connection, revision)
            cursor = connection.execute(
                """
                UPDATE molecule_assets
                SET head_revision_id = ?, version = version + 1, updated_at = ?
                WHERE asset_id = ? AND head_revision_id IS ? AND version = ?
                """,
                (
                    revision.revision_id,
                    _timestamp(revision.created_at),
                    revision.asset_id,
                    expected_head_revision_id,
                    asset_row["version"],
                ),
            )
            if cursor.rowcount != 1:
                raise sqlite3.IntegrityError("molecule asset head changed during save")
            return True

    def get_molecule_revision(self, revision_id: str) -> MoleculeRevision | None:
        with self._connection() as connection:
            row = connection.execute(
                "SELECT * FROM molecule_revisions WHERE revision_id = ?",
                (revision_id,),
            ).fetchone()
        return self._molecule_revision_from_row(row) if row is not None else None

    def list_molecule_revisions(self, asset_id: str) -> list[MoleculeRevision]:
        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT * FROM molecule_revisions
                WHERE asset_id = ?
                ORDER BY created_at, revision_id
                """,
                (asset_id,),
            ).fetchall()
        return [self._molecule_revision_from_row(row) for row in rows]

    def advance_molecule_asset_head(
        self,
        asset_id: str,
        revision_id: str,
        expected_head_revision_id: str | None,
        updated_at: datetime,
        expected_version: int | None = None,
    ) -> bool:
        """Point an asset at one of its revisions if its current head is expected."""
        with self._connection() as connection:
            connection.execute("BEGIN IMMEDIATE")
            asset_row = connection.execute(
                "SELECT head_revision_id, version FROM molecule_assets WHERE asset_id = ?",
                (asset_id,),
            ).fetchone()
            if asset_row is None:
                return False

            revision_row = connection.execute(
                "SELECT asset_id FROM molecule_revisions WHERE revision_id = ?",
                (revision_id,),
            ).fetchone()
            if revision_row is None:
                raise ValueError(f"molecule revision does not exist: {revision_id}")
            if revision_row["asset_id"] != asset_id:
                raise ValueError("head revision must belong to the molecule asset")

            if asset_row["head_revision_id"] != expected_head_revision_id:
                return False
            if expected_version is not None and asset_row["version"] != expected_version:
                return False
            cursor = connection.execute(
                """
                UPDATE molecule_assets
                SET head_revision_id = ?, version = version + 1, updated_at = ?
                WHERE asset_id = ? AND head_revision_id IS ? AND version = ?
                """,
                (
                    revision_id,
                    _timestamp(updated_at),
                    asset_id,
                    expected_head_revision_id,
                    asset_row["version"],
                ),
            )
            return cursor.rowcount == 1

    @staticmethod
    def _validate_molecule_revision_parent(
        connection: sqlite3.Connection, revision: MoleculeRevision
    ) -> None:
        if revision.parent_revision_id is None:
            return
        parent_row = connection.execute(
            "SELECT asset_id FROM molecule_revisions WHERE revision_id = ?",
            (revision.parent_revision_id,),
        ).fetchone()
        if parent_row is None:
            raise ValueError(
                f"parent molecule revision does not exist: {revision.parent_revision_id}"
            )
        if parent_row["asset_id"] != revision.asset_id:
            raise ValueError("parent revision must belong to the same molecule asset")

    @staticmethod
    def _insert_molecule_revision(
        connection: sqlite3.Connection, revision: MoleculeRevision
    ) -> None:
        connection.execute(
            """
            INSERT INTO molecule_revisions
                (revision_id, asset_id, parent_revision_id, structure_json,
                 sha256, schema_version, topology_fingerprint, metadata_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                revision.revision_id,
                revision.asset_id,
                revision.parent_revision_id,
                _json_dump(revision.structure),
                revision.sha256,
                revision.schema_version,
                revision.topology_fingerprint,
                _json_dump(revision.metadata),
                _timestamp(revision.created_at),
            ),
        )

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
            (job_id, task_type, status, spec_id, supersedes_job_id, metadata_json, error, error_code,
             error_message, queued_at, started_at, finished_at, attempt_count,
             state_version, created_at, updated_at)
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
            (f"event-{secrets.token_hex(8)}", job.job_id, job.status, job.state_version, _timestamp(job.created_at)),
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
                    "SELECT COALESCE(MAX(run_number), 0) + 1 FROM job_runs WHERE job_id = ?",
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
        """Delete one job aggregate and discard its now-unreferenced calculation spec."""
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

    def add_input(self, job_input: JobInput) -> None:
        with self._connection() as connection:
            connection.execute(
                """
                INSERT INTO job_inputs (input_id, job_id, name, value_json, metadata_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    job_input.input_id,
                    job_input.job_id,
                    job_input.name,
                    _json_dump(job_input.value),
                    _json_dump(job_input.metadata),
                    _timestamp(job_input.created_at),
                ),
            )

    def insert_job_input_snapshots(
        self, input_snapshots: list[JobInputSnapshot]
    ) -> None:
        """Insert a complete input snapshot batch in one transaction."""
        with self._connection() as connection:
            self._insert_job_input_snapshots(connection, input_snapshots)

    def replace_job_input_snapshots(
        self, job_id: str, input_snapshots: list[JobInputSnapshot]
    ) -> None:
        """Atomically replace all resolved input snapshots for one job."""
        if any(snapshot.job_id != job_id for snapshot in input_snapshots):
            raise ValueError("all replacement snapshots must belong to the requested job")
        with self._connection() as connection:
            connection.execute(
                "DELETE FROM job_input_bindings WHERE job_id = ?", (job_id,)
            )
            self._insert_job_input_snapshots(connection, input_snapshots)

    def list_job_input_snapshots(self, job_id: str) -> list[JobInputSnapshot]:
        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT * FROM job_input_bindings
                WHERE job_id = ?
                ORDER BY created_at, binding_id
                """,
                (job_id,),
            ).fetchall()
        return [self._job_input_snapshot_from_row(row) for row in rows]

    @staticmethod
    def _insert_job_input_snapshots(
        connection: sqlite3.Connection, input_snapshots: list[JobInputSnapshot]
    ) -> None:
        connection.executemany(
            """
            INSERT INTO job_input_bindings
            (binding_id, job_id, input_name, source_kind, literal_json,
             molecule_revision_id, artifact_id, content_sha256,
             resolved_from_reference_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    snapshot.snapshot_id,
                    snapshot.job_id,
                    snapshot.input_name,
                    snapshot.source_kind,
                    _json_dump(snapshot.literal_value)
                    if snapshot.source_kind == "literal"
                    else None,
                    snapshot.molecule_revision_id,
                    snapshot.artifact_id,
                    snapshot.content_sha256,
                    snapshot.resolved_from_link_id,
                    _timestamp(snapshot.created_at),
                )
                for snapshot in input_snapshots
            ],
        )

    def add_artifact(self, artifact: Artifact) -> Artifact:
        with self._connection() as connection:
            if artifact.run_id is not None:
                connection.execute("BEGIN IMMEDIATE")
                existing = connection.execute(
                    """
                    SELECT * FROM artifacts
                    WHERE run_id = ? AND name = ?
                    """,
                    (artifact.run_id, artifact.name),
                ).fetchone()
                if existing is not None:
                    persisted = self._artifact_from_row(existing)
                    if (
                        persisted.sha256 != artifact.sha256
                        or persisted.storage_key != artifact.storage_key
                        or persisted.path != artifact.path
                        or persisted.media_type != artifact.media_type
                        # Collectors keep semantic results (energy, converged,
                        # structure, ...) in metadata rather than file bytes,
                        # so a byte-identical replay with different metadata is
                        # still "different content" and must be rejected instead
                        # of silently returning the stale record. Round-trip
                        # through JSON so the comparison matches storage form.
                        or _json_load(_json_dump(artifact.metadata))
                        != persisted.metadata
                    ):
                        raise sqlite3.IntegrityError(
                            "a different artifact already exists for this run and name"
                        )
                    return persisted
            connection.execute(
                """
                INSERT INTO artifacts
                (artifact_id, job_id, run_id, name, path, storage_key, kind, role,
                 format, media_type, sha256, byte_size, metadata_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    artifact.artifact_id,
                    artifact.job_id,
                    artifact.run_id,
                    artifact.name,
                    artifact.path,
                    artifact.storage_key,
                    artifact.kind,
                    artifact.role,
                    artifact.format,
                    artifact.media_type,
                    artifact.sha256,
                    artifact.byte_size,
                    _json_dump(artifact.metadata),
                    _timestamp(artifact.created_at),
                ),
            )
        return artifact

    def get_artifact(self, artifact_id: str) -> Artifact | None:
        with self._connection() as connection:
            row = connection.execute(
                "SELECT * FROM artifacts WHERE artifact_id = ?", (artifact_id,)
            ).fetchone()
        return self._artifact_from_row(row) if row is not None else None

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
            terminal = next_status in {"succeeded", "failed", "cancelled", "interrupted"}
            cursor = connection.execute(
                """
                UPDATE jobs
                SET status = ?, error = ?, error_code = ?, error_message = ?,
                    queued_at = COALESCE(queued_at, ?),
                    started_at = COALESCE(started_at, ?),
                    finished_at = CASE WHEN ? THEN ? ELSE finished_at END,
                    attempt_count = attempt_count + CASE WHEN ? = 'running' THEN 1 ELSE 0 END,
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

    def get_inputs(self, job_id: str) -> list[JobInput]:
        with self._connection() as connection:
            rows = connection.execute(
                "SELECT * FROM job_inputs WHERE job_id = ? ORDER BY created_at, input_id",
                (job_id,),
            ).fetchall()
        return [self._input_from_row(row) for row in rows]

    def get_artifacts(self, job_id: str) -> list[Artifact]:
        with self._connection() as connection:
            rows = connection.execute(
                "SELECT * FROM artifacts WHERE job_id = ? ORDER BY created_at, artifact_id",
                (job_id,),
            ).fetchall()
        return [self._artifact_from_row(row) for row in rows]

    def create_workflow(self, workflow: Workflow) -> None:
        with self._connection() as connection:
            connection.execute(
                "INSERT INTO workflows VALUES (?, ?, ?, ?)",
                (workflow.workflow_id, workflow.name, _timestamp(workflow.created_at), _timestamp(workflow.updated_at)),
            )
            self._write_workflow_relations(connection, workflow)

    def update_workflow(self, workflow: Workflow) -> bool:
        with self._connection() as connection:
            cursor = connection.execute(
                "UPDATE workflows SET name = ?, updated_at = ? WHERE workflow_id = ?",
                (workflow.name, _timestamp(workflow.updated_at), workflow.workflow_id),
            )
            if cursor.rowcount != 1:
                return False
            connection.execute("DELETE FROM workflow_jobs WHERE workflow_id = ?", (workflow.workflow_id,))
            connection.execute("DELETE FROM job_input_references WHERE workflow_id = ?", (workflow.workflow_id,))
            self._write_workflow_relations(connection, workflow)
        return True

    def list_workflows(self) -> list[Workflow]:
        with self._connection() as connection:
            rows = connection.execute("SELECT * FROM workflows ORDER BY updated_at DESC, workflow_id DESC").fetchall()
        return [self._workflow_from_row(row) for row in rows]

    def get_workflow(self, workflow_id: str) -> Workflow | None:
        with self._connection() as connection:
            row = connection.execute("SELECT * FROM workflows WHERE workflow_id = ?", (workflow_id,)).fetchone()
        return self._workflow_from_row(row) if row is not None else None

    def create_workflow_execution(
        self, execution: WorkflowExecution
    ) -> WorkflowExecution:
        """Activate one workflow once, returning the existing activation on races."""
        with self._connection() as connection:
            connection.execute("BEGIN IMMEDIATE")
            connection.execute(
                """
                INSERT OR IGNORE INTO workflow_executions
                    (execution_id, workflow_id, status, error_code, error_message,
                     started_at, updated_at, finished_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    execution.execution_id,
                    execution.workflow_id,
                    execution.status,
                    execution.error_code,
                    execution.error_message,
                    _timestamp(execution.started_at),
                    _timestamp(execution.updated_at),
                    _optional_timestamp(execution.finished_at),
                ),
            )
            row = connection.execute(
                "SELECT * FROM workflow_executions WHERE workflow_id = ?",
                (execution.workflow_id,),
            ).fetchone()
        if row is None:
            raise sqlite3.IntegrityError("workflow execution was not persisted")
        return self._workflow_execution_from_row(row)

    def get_workflow_execution(
        self, workflow_id: str
    ) -> WorkflowExecution | None:
        with self._connection() as connection:
            row = connection.execute(
                "SELECT * FROM workflow_executions WHERE workflow_id = ?",
                (workflow_id,),
            ).fetchone()
        return self._workflow_execution_from_row(row) if row is not None else None

    def list_active_workflow_executions(self) -> list[WorkflowExecution]:
        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT * FROM workflow_executions
                WHERE status = 'active'
                ORDER BY started_at, execution_id
                """
            ).fetchall()
        return [self._workflow_execution_from_row(row) for row in rows]

    def transition_workflow_execution(
        self,
        workflow_id: str,
        *,
        expected_status: str,
        next_status: str,
        updated_at: datetime,
        error_code: str | None = None,
        error_message: str | None = None,
    ) -> bool:
        finished_at = updated_at if next_status != "active" else None
        with self._connection() as connection:
            cursor = connection.execute(
                """
                UPDATE workflow_executions
                SET status = ?, error_code = ?, error_message = ?, updated_at = ?,
                    finished_at = ?
                WHERE workflow_id = ? AND status = ?
                """,
                (
                    next_status,
                    error_code,
                    error_message,
                    _timestamp(updated_at),
                    _optional_timestamp(finished_at),
                    workflow_id,
                    expected_status,
                ),
            )
        return cursor.rowcount == 1

    def get_workflow_job_ids(self, workflow_id: str) -> list[str]:
        with self._connection() as connection:
            rows = connection.execute(
                "SELECT job_id FROM workflow_jobs WHERE workflow_id = ? ORDER BY position, job_id",
                (workflow_id,),
            ).fetchall()
        return [str(row["job_id"]) for row in rows]

    def get_workflow_input_links(self, workflow_id: str) -> list[WorkflowInputLink]:
        with self._connection() as connection:
            rows = connection.execute(
                "SELECT * FROM job_input_references WHERE workflow_id = ? ORDER BY created_at, reference_id",
                (workflow_id,),
            ).fetchall()
        return [self._workflow_input_link_from_row(row) for row in rows]

    @staticmethod
    def _write_workflow_relations(connection: sqlite3.Connection, workflow: Workflow) -> None:
        connection.executemany(
            "INSERT INTO workflow_jobs (workflow_id, job_id, position) VALUES (?, ?, ?)",
            [(workflow.workflow_id, job_id, position) for position, job_id in enumerate(workflow.job_ids)],
        )
        connection.executemany(
            """
            INSERT INTO job_input_references
            (reference_id, workflow_id, target_job_id, target_input_name, source_job_id,
             source_artifact_id, source_kind, source_name, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    link.link_id,
                    link.workflow_id,
                    link.target_job_id,
                    link.target_input_name,
                    link.source_job_id,
                    link.source_artifact_id,
                    link.source_kind,
                    link.source_name,
                    _timestamp(link.created_at),
                )
                for link in workflow.input_links
            ],
        )

    @staticmethod
    def _job_from_row(row: sqlite3.Row) -> Job:
        return Job(
            job_id=row["job_id"],
            task_type=row["task_type"],
            status=row["status"],
            spec_id=row["spec_id"],
            supersedes_job_id=row["supersedes_job_id"],
            metadata=_json_load(row["metadata_json"]),
            error=row["error"],
            error_code=row["error_code"],
            error_message=row["error_message"],
            queued_at=_optional_parse_timestamp(row["queued_at"]),
            started_at=_optional_parse_timestamp(row["started_at"]),
            finished_at=_optional_parse_timestamp(row["finished_at"]),
            attempt_count=row["attempt_count"],
            state_version=row["state_version"],
            created_at=_parse_timestamp(row["created_at"]),
            updated_at=_parse_timestamp(row["updated_at"]),
        )

    @staticmethod
    def _dispatch_from_row(row: sqlite3.Row) -> JobDispatch:
        return JobDispatch(
            dispatch_id=row["dispatch_id"],
            job_id=row["job_id"],
            status=row["status"],
            requested_at=_parse_timestamp(row["requested_at"]),
            available_at=_parse_timestamp(row["available_at"]),
            lease_owner=row["lease_owner"],
            lease_token=row["lease_token"],
            lease_expires_at=_optional_parse_timestamp(row["lease_expires_at"]),
            heartbeat_at=_optional_parse_timestamp(row["heartbeat_at"]),
            finished_at=_optional_parse_timestamp(row["finished_at"]),
            last_error=row["last_error"],
        )

    @staticmethod
    def _input_from_row(row: sqlite3.Row) -> JobInput:
        return JobInput(
            input_id=row["input_id"],
            job_id=row["job_id"],
            name=row["name"],
            value=_json_load(row["value_json"]),
            metadata=_json_load(row["metadata_json"]),
            created_at=_parse_timestamp(row["created_at"]),
        )

    @staticmethod
    def _job_input_snapshot_from_row(row: sqlite3.Row) -> JobInputSnapshot:
        return JobInputSnapshot(
            snapshot_id=row["binding_id"],
            job_id=row["job_id"],
            input_name=row["input_name"],
            source_kind=row["source_kind"],
            literal_value=_json_load(row["literal_json"])
            if row["literal_json"] is not None
            else None,
            molecule_revision_id=row["molecule_revision_id"],
            artifact_id=row["artifact_id"],
            content_sha256=row["content_sha256"],
            resolved_from_link_id=row["resolved_from_reference_id"],
            created_at=_parse_timestamp(row["created_at"]),
        )

    @staticmethod
    def _job_type_data_from_row(row: sqlite3.Row) -> JobTypeData:
        return JobTypeData(
            job_id=row["job_id"],
            job_type=row["job_type"],
            job_type_version=row["job_type_version"],
            schema_version=row["schema_version"],
            data=_json_load(row["data_json"]),
            created_at=_parse_timestamp(row["created_at"]),
            updated_at=_parse_timestamp(row["updated_at"]),
        )

    @staticmethod
    def _job_run_from_row(row: sqlite3.Row) -> JobRun:
        return JobRun(
            run_id=row["run_id"],
            job_id=row["job_id"],
            run_number=row["run_number"],
            engine=row["engine"],
            status=row["status"],
            collector_id=row["collector_id"],
            collector_version=row["collector_version"],
            error_code=row["error_code"],
            error_message=row["error_message"],
            metadata=_json_load(row["metadata_json"]),
            started_at=_parse_timestamp(row["started_at"]),
            finished_at=_optional_parse_timestamp(row["finished_at"]),
        )

    @staticmethod
    def _artifact_from_row(row: sqlite3.Row) -> Artifact:
        return Artifact(
            artifact_id=row["artifact_id"],
            job_id=row["job_id"],
            run_id=row["run_id"],
            name=row["name"],
            path=row["path"],
            storage_key=row["storage_key"],
            kind=row["kind"] or "file",
            role=row["role"] or _json_load(row["metadata_json"]).get("role", "output"),
            format=row["format"] or _json_load(row["metadata_json"]).get("format", "file"),
            media_type=row["media_type"],
            sha256=row["sha256"],
            byte_size=row["byte_size"],
            metadata=_json_load(row["metadata_json"]),
            created_at=_parse_timestamp(row["created_at"]),
        )

    @staticmethod
    def _workflow_from_row(row: sqlite3.Row) -> Workflow:
        return Workflow(
            workflow_id=row["workflow_id"],
            name=row["name"],
            created_at=_parse_timestamp(row["created_at"]),
            updated_at=_parse_timestamp(row["updated_at"]),
        )

    @staticmethod
    def _workflow_execution_from_row(row: sqlite3.Row) -> WorkflowExecution:
        return WorkflowExecution(
            execution_id=row["execution_id"],
            workflow_id=row["workflow_id"],
            status=row["status"],
            error_code=row["error_code"],
            error_message=row["error_message"],
            started_at=_parse_timestamp(row["started_at"]),
            updated_at=_parse_timestamp(row["updated_at"]),
            finished_at=_optional_parse_timestamp(row["finished_at"]),
        )

    @staticmethod
    def _workflow_input_link_from_row(row: sqlite3.Row) -> WorkflowInputLink:
        return WorkflowInputLink(
            link_id=row["reference_id"],
            workflow_id=row["workflow_id"],
            target_job_id=row["target_job_id"],
            target_input_name=row["target_input_name"],
            source_job_id=row["source_job_id"],
            source_artifact_id=row["source_artifact_id"],
            source_kind=row["source_kind"],
            source_name=row["source_name"],
            created_at=_parse_timestamp(row["created_at"]),
        )

    @staticmethod
    def _molecule_asset_from_row(row: sqlite3.Row) -> MoleculeAsset:
        return MoleculeAsset(
            asset_id=row["asset_id"],
            name=row["name"],
            head_revision_id=row["head_revision_id"],
            version=row["version"],
            metadata=_json_load(row["metadata_json"]),
            created_at=_parse_timestamp(row["created_at"]),
            updated_at=_parse_timestamp(row["updated_at"]),
        )

    @staticmethod
    def _molecule_revision_from_row(row: sqlite3.Row) -> MoleculeRevision:
        return MoleculeRevision(
            revision_id=row["revision_id"],
            asset_id=row["asset_id"],
            parent_revision_id=row["parent_revision_id"],
            structure=_json_load(row["structure_json"]),
            sha256=row["sha256"],
            schema_version=row["schema_version"],
            topology_fingerprint=row["topology_fingerprint"],
            metadata=_json_load(row["metadata_json"]),
            created_at=_parse_timestamp(row["created_at"]),
        )


def _json_dump(value: Any) -> str:
    return json.dumps(value, ensure_ascii=True, separators=(",", ":"), default=str)


def _json_load(value: str) -> Any:
    return json.loads(value)


def _timestamp(value: datetime) -> str:
    return value.isoformat()


def _parse_timestamp(value: str) -> datetime:
    return datetime.fromisoformat(value)


def _optional_timestamp(value: datetime | None) -> str | None:
    return _timestamp(value) if value is not None else None


def _optional_parse_timestamp(value: str | None) -> datetime | None:
    return _parse_timestamp(value) if value is not None else None
