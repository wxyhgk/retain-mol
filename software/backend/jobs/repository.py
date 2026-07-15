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
    JobInput,
    JobInputBinding,
    JobInputReference,
    JobStatus,
    MoleculeAsset,
    MoleculeRevision,
    Workflow,
)


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
            migrate(connection)

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

    def create_job(self, job: Job) -> None:
        with self._connection() as connection:
            self._insert_job(connection, job)

    def create_job_with_spec(self, job: Job, spec: CalculationSpec) -> None:
        """Persist an immutable calculation definition and its first run atomically."""
        with self._connection() as connection:
            self._insert_calculation_spec(connection, spec)
            self._insert_job(connection, job)

    def create_queued_job_with_spec_and_bindings(
        self,
        job: Job,
        spec: CalculationSpec,
        bindings: list[JobInputBinding],
        queued_at: datetime,
    ) -> None:
        """Create a draft run, freeze inputs, and queue it in one transaction."""
        if job.status != "created" or job.state_version != 0:
            raise ValueError("atomic submission must start from a new created job")
        if any(binding.job_id != job.job_id for binding in bindings):
            raise ValueError("all bindings must belong to the submitted job")
        with self._connection() as connection:
            connection.execute("BEGIN IMMEDIATE")
            self._insert_calculation_spec(connection, spec)
            self._insert_job(connection, job)
            self._insert_job_input_bindings(connection, bindings)
            self._queue_created_job(connection, job.job_id, queued_at)

    def freeze_job_input_bindings_and_queue(
        self,
        job_id: str,
        bindings: list[JobInputBinding],
        queued_at: datetime,
    ) -> bool:
        """Replace draft bindings and queue the job as one all-or-nothing write."""
        if any(binding.job_id != job_id for binding in bindings):
            raise ValueError("all bindings must belong to the queued job")
        with self._connection() as connection:
            connection.execute("BEGIN IMMEDIATE")
            row = connection.execute(
                "SELECT status, state_version FROM jobs WHERE job_id = ?", (job_id,)
            ).fetchone()
            if row is None or row["status"] != "created" or row["state_version"] != 0:
                return False
            connection.execute(
                "DELETE FROM job_input_bindings WHERE job_id = ?", (job_id,)
            )
            self._insert_job_input_bindings(connection, bindings)
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
            (job_id, task_type, status, spec_id, metadata_json, error, error_code,
             error_message, queued_at, started_at, finished_at, attempt_count,
             state_version, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                job.job_id,
                job.task_type,
                job.status,
                job.spec_id,
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

    def insert_job_input_bindings(
        self, bindings: list[JobInputBinding]
    ) -> None:
        """Insert a complete binding batch in one transaction."""
        with self._connection() as connection:
            self._insert_job_input_bindings(connection, bindings)

    def replace_job_input_bindings(
        self, job_id: str, bindings: list[JobInputBinding]
    ) -> None:
        """Atomically replace all resolved bindings for one job."""
        if any(binding.job_id != job_id for binding in bindings):
            raise ValueError("all replacement bindings must belong to the requested job")
        with self._connection() as connection:
            connection.execute(
                "DELETE FROM job_input_bindings WHERE job_id = ?", (job_id,)
            )
            self._insert_job_input_bindings(connection, bindings)

    def list_job_input_bindings(self, job_id: str) -> list[JobInputBinding]:
        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT * FROM job_input_bindings
                WHERE job_id = ?
                ORDER BY created_at, binding_id
                """,
                (job_id,),
            ).fetchall()
        return [self._job_input_binding_from_row(row) for row in rows]

    @staticmethod
    def _insert_job_input_bindings(
        connection: sqlite3.Connection, bindings: list[JobInputBinding]
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
                    binding.binding_id,
                    binding.job_id,
                    binding.input_name,
                    binding.source_kind,
                    _json_dump(binding.literal_value)
                    if binding.source_kind == "literal"
                    else None,
                    binding.molecule_revision_id,
                    binding.artifact_id,
                    binding.content_sha256,
                    binding.resolved_from_reference_id,
                    _timestamp(binding.created_at),
                )
                for binding in bindings
            ],
        )

    def add_artifact(self, artifact: Artifact) -> None:
        with self._connection() as connection:
            connection.execute(
                """
                INSERT INTO artifacts
                (artifact_id, job_id, name, path, storage_key, kind, role, format,
                 media_type, sha256, byte_size, metadata_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    artifact.artifact_id,
                    artifact.job_id,
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
            (reference_id, workflow_id, target_job_id, target_input_name, source_job_id,
             source_artifact_id, source_kind, source_name, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    reference.reference_id,
                    reference.workflow_id,
                    reference.target_job_id,
                    reference.target_input_name,
                    reference.source_job_id,
                    reference.source_artifact_id,
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
            spec_id=row["spec_id"],
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
    def _job_input_binding_from_row(row: sqlite3.Row) -> JobInputBinding:
        return JobInputBinding(
            binding_id=row["binding_id"],
            job_id=row["job_id"],
            input_name=row["input_name"],
            source_kind=row["source_kind"],
            literal_value=_json_load(row["literal_json"])
            if row["literal_json"] is not None
            else None,
            molecule_revision_id=row["molecule_revision_id"],
            artifact_id=row["artifact_id"],
            content_sha256=row["content_sha256"],
            resolved_from_reference_id=row["resolved_from_reference_id"],
            created_at=_parse_timestamp(row["created_at"]),
        )

    @staticmethod
    def _artifact_from_row(row: sqlite3.Row) -> Artifact:
        return Artifact(
            artifact_id=row["artifact_id"],
            job_id=row["job_id"],
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
    def _reference_from_row(row: sqlite3.Row) -> JobInputReference:
        return JobInputReference(
            reference_id=row["reference_id"],
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
