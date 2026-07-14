"""SQLite storage primitives for RetainMol jobs."""

from __future__ import annotations

import json
import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from typing import Any

from .models import Artifact, Job, JobInput, JobInputReference, Workflow


class JobRepository:
    """Small SQLite repository with one connection per operation."""

    def __init__(self, database_path: str | Path) -> None:
        self.database_path = Path(database_path)
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self._initialize()

    @contextmanager
    def _connection(self) -> Iterator[sqlite3.Connection]:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
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
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS jobs (
                    job_id TEXT PRIMARY KEY,
                    task_type TEXT NOT NULL,
                    status TEXT NOT NULL,
                    metadata_json TEXT NOT NULL,
                    error TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS job_inputs (
                    input_id TEXT PRIMARY KEY,
                    job_id TEXT NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
                    name TEXT NOT NULL,
                    value_json TEXT NOT NULL,
                    metadata_json TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS artifacts (
                    artifact_id TEXT PRIMARY KEY,
                    job_id TEXT NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
                    name TEXT NOT NULL,
                    path TEXT NOT NULL,
                    media_type TEXT,
                    metadata_json TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );

                CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_job_inputs_job_id ON job_inputs(job_id, created_at);
                CREATE INDEX IF NOT EXISTS idx_artifacts_job_id ON artifacts(job_id, created_at);

                CREATE TABLE IF NOT EXISTS workflows (
                    workflow_id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS workflow_jobs (
                    workflow_id TEXT NOT NULL REFERENCES workflows(workflow_id) ON DELETE CASCADE,
                    job_id TEXT NOT NULL REFERENCES jobs(job_id) ON DELETE RESTRICT,
                    position INTEGER NOT NULL,
                    PRIMARY KEY (workflow_id, job_id)
                );

                CREATE TABLE IF NOT EXISTS job_input_references (
                    reference_id TEXT PRIMARY KEY,
                    workflow_id TEXT NOT NULL REFERENCES workflows(workflow_id) ON DELETE CASCADE,
                    target_job_id TEXT NOT NULL REFERENCES jobs(job_id) ON DELETE RESTRICT,
                    target_input_name TEXT NOT NULL,
                    source_job_id TEXT NOT NULL REFERENCES jobs(job_id) ON DELETE RESTRICT,
                    source_kind TEXT NOT NULL,
                    source_name TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    UNIQUE (workflow_id, target_job_id, target_input_name)
                );

                CREATE INDEX IF NOT EXISTS idx_workflow_jobs_workflow ON workflow_jobs(workflow_id, position);
                CREATE INDEX IF NOT EXISTS idx_job_input_references_workflow ON job_input_references(workflow_id, created_at);
                """
            )

    def create_job(self, job: Job) -> None:
        with self._connection() as connection:
            connection.execute(
                """
                INSERT INTO jobs (job_id, task_type, status, metadata_json, error, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    job.job_id,
                    job.task_type,
                    job.status,
                    _json_dump(job.metadata),
                    job.error,
                    _timestamp(job.created_at),
                    _timestamp(job.updated_at),
                ),
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

    def add_artifact(self, artifact: Artifact) -> None:
        with self._connection() as connection:
            connection.execute(
                """
                INSERT INTO artifacts (artifact_id, job_id, name, path, media_type, metadata_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    artifact.artifact_id,
                    artifact.job_id,
                    artifact.name,
                    artifact.path,
                    artifact.media_type,
                    _json_dump(artifact.metadata),
                    _timestamp(artifact.created_at),
                ),
            )

    def update_status(
        self,
        job_id: str,
        status: str,
        updated_at: datetime,
        error: str | None,
    ) -> bool:
        with self._connection() as connection:
            cursor = connection.execute(
                """
                UPDATE jobs
                SET status = ?, error = ?, updated_at = ?
                WHERE job_id = ?
                """,
                (status, error, _timestamp(updated_at), job_id),
            )
        return cursor.rowcount == 1

    def claim_job(
        self,
        job_id: str,
        *,
        expected_status: str,
        next_status: str,
        updated_at: datetime,
    ) -> bool:
        """Atomically move one job from an expected state to an active state."""
        with self._connection() as connection:
            cursor = connection.execute(
                """
                UPDATE jobs
                SET status = ?, error = NULL, updated_at = ?
                WHERE job_id = ? AND status = ?
                """,
                (next_status, _timestamp(updated_at), job_id, expected_status),
            )
        return cursor.rowcount == 1

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

    def get_workflow_job_ids(self, workflow_id: str) -> list[str]:
        with self._connection() as connection:
            rows = connection.execute(
                "SELECT job_id FROM workflow_jobs WHERE workflow_id = ? ORDER BY position, job_id",
                (workflow_id,),
            ).fetchall()
        return [str(row["job_id"]) for row in rows]

    def get_job_input_references(self, workflow_id: str) -> list[JobInputReference]:
        with self._connection() as connection:
            rows = connection.execute(
                "SELECT * FROM job_input_references WHERE workflow_id = ? ORDER BY created_at, reference_id",
                (workflow_id,),
            ).fetchall()
        return [self._reference_from_row(row) for row in rows]

    @staticmethod
    def _write_workflow_relations(connection: sqlite3.Connection, workflow: Workflow) -> None:
        connection.executemany(
            "INSERT INTO workflow_jobs (workflow_id, job_id, position) VALUES (?, ?, ?)",
            [(workflow.workflow_id, job_id, position) for position, job_id in enumerate(workflow.job_ids)],
        )
        connection.executemany(
            """
            INSERT INTO job_input_references
            (reference_id, workflow_id, target_job_id, target_input_name, source_job_id, source_kind, source_name, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    reference.reference_id,
                    reference.workflow_id,
                    reference.target_job_id,
                    reference.target_input_name,
                    reference.source_job_id,
                    reference.source_kind,
                    reference.source_name,
                    _timestamp(reference.created_at),
                )
                for reference in workflow.references
            ],
        )

    @staticmethod
    def _job_from_row(row: sqlite3.Row) -> Job:
        return Job(
            job_id=row["job_id"],
            task_type=row["task_type"],
            status=row["status"],
            metadata=_json_load(row["metadata_json"]),
            error=row["error"],
            created_at=_parse_timestamp(row["created_at"]),
            updated_at=_parse_timestamp(row["updated_at"]),
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
    def _artifact_from_row(row: sqlite3.Row) -> Artifact:
        return Artifact(
            artifact_id=row["artifact_id"],
            job_id=row["job_id"],
            name=row["name"],
            path=row["path"],
            media_type=row["media_type"],
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
    def _reference_from_row(row: sqlite3.Row) -> JobInputReference:
        return JobInputReference(
            reference_id=row["reference_id"],
            workflow_id=row["workflow_id"],
            target_job_id=row["target_job_id"],
            target_input_name=row["target_input_name"],
            source_job_id=row["source_job_id"],
            source_kind=row["source_kind"],
            source_name=row["source_name"],
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
