"""Job input snapshot and artifact persistence operations."""

from __future__ import annotations

import sqlite3

from .models import Artifact, JobInput, JobInputSnapshot
from .repository_records import _json_dump, _json_load, _timestamp


class JobDataRepositoryMixin:
    """Persist Job inputs, frozen snapshots, and immutable artifacts."""

    def add_input(self, job_input: JobInput) -> None:
        with self._connection() as connection:
            connection.execute(
                """
                INSERT INTO job_inputs
                    (input_id, job_id, name, value_json, metadata_json, created_at)
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

    def get_inputs(self, job_id: str) -> list[JobInput]:
        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT * FROM job_inputs
                WHERE job_id = ? ORDER BY created_at, input_id
                """,
                (job_id,),
            ).fetchall()
        return [self._input_from_row(row) for row in rows]

    def get_artifacts(self, job_id: str) -> list[Artifact]:
        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT * FROM artifacts
                WHERE job_id = ? ORDER BY created_at, artifact_id
                """,
                (job_id,),
            ).fetchall()
        return [self._artifact_from_row(row) for row in rows]

