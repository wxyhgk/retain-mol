"""Versioned SQLite schema migrations for durable jobs."""

from __future__ import annotations

import json
import hashlib
import sqlite3
from collections.abc import Callable


LATEST_SCHEMA_VERSION = 6

Migration = Callable[[sqlite3.Connection], None]


def migrate(connection: sqlite3.Connection) -> None:
    """Bring ``connection`` to the latest schema without replacing user data."""
    current_version = _user_version(connection)
    if current_version > LATEST_SCHEMA_VERSION:
        raise RuntimeError(
            "Database schema version "
            f"{current_version} is newer than supported version {LATEST_SCHEMA_VERSION}"
        )

    for version in range(current_version + 1, LATEST_SCHEMA_VERSION + 1):
        migration = _MIGRATIONS[version]
        savepoint = f"retainmol_migration_{version}"
        connection.execute(f"SAVEPOINT {savepoint}")
        try:
            migration(connection)
            connection.execute(f"PRAGMA user_version = {version}")
            connection.execute(f"RELEASE SAVEPOINT {savepoint}")
        except Exception:
            connection.execute(f"ROLLBACK TO SAVEPOINT {savepoint}")
            connection.execute(f"RELEASE SAVEPOINT {savepoint}")
            raise


def _user_version(connection: sqlite3.Connection) -> int:
    row = connection.execute("PRAGMA user_version").fetchone()
    return int(row[0])


def _migration_1_create_legacy_schema(connection: sqlite3.Connection) -> None:
    """Record the pre-migration schema and support initializing an empty DB."""
    statements = (
        """
        CREATE TABLE IF NOT EXISTS jobs (
            job_id TEXT PRIMARY KEY,
            task_type TEXT NOT NULL,
            status TEXT NOT NULL,
            metadata_json TEXT NOT NULL,
            error TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS job_inputs (
            input_id TEXT PRIMARY KEY,
            job_id TEXT NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            value_json TEXT NOT NULL,
            metadata_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS artifacts (
            artifact_id TEXT PRIMARY KEY,
            job_id TEXT NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            path TEXT NOT NULL,
            media_type TEXT,
            metadata_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS workflows (
            workflow_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS workflow_jobs (
            workflow_id TEXT NOT NULL REFERENCES workflows(workflow_id) ON DELETE CASCADE,
            job_id TEXT NOT NULL REFERENCES jobs(job_id) ON DELETE RESTRICT,
            position INTEGER NOT NULL,
            PRIMARY KEY (workflow_id, job_id)
        )
        """,
        """
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
        )
        """,
        "CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC)",
        """
        CREATE INDEX IF NOT EXISTS idx_job_inputs_job_id
        ON job_inputs(job_id, created_at)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_artifacts_job_id
        ON artifacts(job_id, created_at)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_workflow_jobs_workflow
        ON workflow_jobs(workflow_id, position)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_job_input_references_workflow
        ON job_input_references(workflow_id, created_at)
        """,
    )
    for statement in statements:
        connection.execute(statement)


def _migration_2_expand_durable_job_schema(connection: sqlite3.Connection) -> None:
    statements = (
        """
        CREATE TABLE IF NOT EXISTS calculation_specs (
            spec_id TEXT PRIMARY KEY,
            kind TEXT NOT NULL,
            engine TEXT NOT NULL,
            method TEXT,
            parameters_json TEXT NOT NULL DEFAULT '{}',
            created_at TEXT NOT NULL
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS molecule_assets (
            asset_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            metadata_json TEXT NOT NULL DEFAULT '{}',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS molecule_revisions (
            revision_id TEXT PRIMARY KEY,
            asset_id TEXT NOT NULL REFERENCES molecule_assets(asset_id) ON DELETE CASCADE,
            parent_revision_id TEXT REFERENCES molecule_revisions(revision_id) ON DELETE SET NULL,
            structure_json TEXT NOT NULL,
            sha256 TEXT,
            created_at TEXT NOT NULL
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS job_status_events (
            event_id TEXT PRIMARY KEY,
            job_id TEXT NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
            from_status TEXT,
            to_status TEXT NOT NULL,
            error_code TEXT,
            error_message TEXT,
            state_version INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE (job_id, state_version)
        )
        """,
    )
    for statement in statements:
        connection.execute(statement)

    _add_column_if_missing(
        connection,
        "jobs",
        "spec_id",
        "TEXT REFERENCES calculation_specs(spec_id) ON DELETE RESTRICT",
    )
    _add_column_if_missing(connection, "jobs", "error_code", "TEXT")
    _add_column_if_missing(connection, "jobs", "error_message", "TEXT")
    _add_column_if_missing(connection, "jobs", "queued_at", "TEXT")
    _add_column_if_missing(connection, "jobs", "started_at", "TEXT")
    _add_column_if_missing(connection, "jobs", "finished_at", "TEXT")
    _add_column_if_missing(
        connection,
        "jobs",
        "attempt_count",
        "INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0)",
    )
    _add_column_if_missing(
        connection,
        "jobs",
        "state_version",
        "INTEGER NOT NULL DEFAULT 0 CHECK (state_version >= 0)",
    )

    _add_column_if_missing(connection, "artifacts", "storage_key", "TEXT")
    _add_column_if_missing(connection, "artifacts", "kind", "TEXT")
    _add_column_if_missing(connection, "artifacts", "role", "TEXT")
    _add_column_if_missing(connection, "artifacts", "format", "TEXT")
    _add_column_if_missing(connection, "artifacts", "sha256", "TEXT")
    _add_column_if_missing(
        connection,
        "artifacts",
        "byte_size",
        "INTEGER CHECK (byte_size IS NULL OR byte_size >= 0)",
    )

    _add_column_if_missing(
        connection,
        "job_input_references",
        "source_artifact_id",
        "TEXT REFERENCES artifacts(artifact_id) ON DELETE RESTRICT",
    )

    # Keep legacy values available through the normalized fields.
    connection.execute(
        "UPDATE jobs SET error_message = error "
        "WHERE error_message IS NULL AND error IS NOT NULL"
    )
    connection.execute(
        "UPDATE artifacts SET storage_key = path "
        "WHERE storage_key IS NULL AND path IS NOT NULL"
    )
    connection.execute("UPDATE jobs SET status = 'succeeded' WHERE status = 'completed'")
    connection.execute("UPDATE jobs SET status = 'interrupted' WHERE status = 'running'")
    connection.execute(
        """
        INSERT OR IGNORE INTO job_status_events
            (event_id, job_id, from_status, to_status, error_code, error_message,
             state_version, created_at)
        SELECT
            'migration-' || job_id,
            job_id,
            NULL,
            status,
            error_code,
            error_message,
            state_version,
            updated_at
        FROM jobs
        """
    )

    indexes = (
        "CREATE INDEX IF NOT EXISTS idx_jobs_spec_id ON jobs(spec_id)",
        """
        CREATE INDEX IF NOT EXISTS idx_job_status_events_job
        ON job_status_events(job_id, state_version)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_molecule_revisions_asset
        ON molecule_revisions(asset_id, created_at)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_job_input_references_source_artifact
        ON job_input_references(source_artifact_id)
        """,
    )
    for statement in indexes:
        connection.execute(statement)


def _migration_3_align_public_data_contract(connection: sqlite3.Connection) -> None:
    """Add versioned, engine-neutral fields used by the public domain models."""
    _add_column_if_missing(
        connection,
        "calculation_specs",
        "schema_version",
        "INTEGER NOT NULL DEFAULT 1 CHECK (schema_version >= 1)",
    )
    _add_column_if_missing(
        connection,
        "calculation_specs",
        "payload_json",
        "TEXT NOT NULL DEFAULT '{}'",
    )
    connection.execute(
        "UPDATE calculation_specs SET payload_json = parameters_json "
        "WHERE payload_json = '{}' AND parameters_json <> '{}'"
    )


def _migration_4_add_job_input_bindings(connection: sqlite3.Connection) -> None:
    """Add immutable, typed input snapshots without removing legacy job inputs."""
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS job_input_bindings (
            binding_id TEXT PRIMARY KEY,
            job_id TEXT NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
            input_name TEXT NOT NULL CHECK (length(trim(input_name)) > 0),
            source_kind TEXT NOT NULL
                CHECK (source_kind IN ('literal', 'molecule_revision', 'artifact')),
            literal_json TEXT,
            molecule_revision_id TEXT
                REFERENCES molecule_revisions(revision_id) ON DELETE RESTRICT,
            artifact_id TEXT REFERENCES artifacts(artifact_id) ON DELETE RESTRICT,
            content_sha256 TEXT,
            resolved_from_reference_id TEXT
                REFERENCES job_input_references(reference_id) ON DELETE SET NULL,
            created_at TEXT NOT NULL,
            UNIQUE (job_id, input_name),
            CHECK (
                (source_kind = 'literal'
                    AND literal_json IS NOT NULL
                    AND molecule_revision_id IS NULL
                    AND artifact_id IS NULL)
                OR
                (source_kind = 'molecule_revision'
                    AND literal_json IS NULL
                    AND molecule_revision_id IS NOT NULL
                    AND artifact_id IS NULL)
                OR
                (source_kind = 'artifact'
                    AND literal_json IS NULL
                    AND molecule_revision_id IS NULL
                    AND artifact_id IS NOT NULL)
            )
        )
        """
    )
    indexes = (
        """
        CREATE INDEX IF NOT EXISTS idx_job_input_bindings_job
        ON job_input_bindings(job_id, created_at, binding_id)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_job_input_bindings_revision
        ON job_input_bindings(molecule_revision_id)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_job_input_bindings_artifact
        ON job_input_bindings(artifact_id)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_job_input_bindings_reference
        ON job_input_bindings(resolved_from_reference_id)
        """,
    )
    for statement in indexes:
        connection.execute(statement)


def _migration_5_finalize_molecule_revisions(connection: sqlite3.Connection) -> None:
    """Promote molecule snapshots to immutable, versioned aggregate records."""
    _add_column_if_missing(
        connection,
        "molecule_assets",
        "head_revision_id",
        "TEXT REFERENCES molecule_revisions(revision_id) ON DELETE RESTRICT",
    )
    _add_column_if_missing(
        connection,
        "molecule_assets",
        "version",
        "INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1)",
    )
    _add_column_if_missing(
        connection,
        "molecule_revisions",
        "schema_version",
        "INTEGER NOT NULL DEFAULT 1 CHECK (schema_version >= 1)",
    )
    _add_column_if_missing(
        connection,
        "molecule_revisions",
        "topology_fingerprint",
        "TEXT",
    )

    # A short-lived schema 4 implementation stored the head in metadata. Preserve
    # it only when the referenced revision exists and belongs to the same asset.
    rows = connection.execute(
        "SELECT asset_id, metadata_json FROM molecule_assets "
        "WHERE head_revision_id IS NULL"
    ).fetchall()
    for row in rows:
        try:
            metadata = json.loads(row[1] or "{}")
        except (TypeError, json.JSONDecodeError):
            continue
        head_revision_id = metadata.get("headRevisionId")
        if not isinstance(head_revision_id, str):
            continue
        revision = connection.execute(
            "SELECT asset_id FROM molecule_revisions WHERE revision_id = ?",
            (head_revision_id,),
        ).fetchone()
        if revision is not None and revision[0] == row[0]:
            connection.execute(
                "UPDATE molecule_assets SET head_revision_id = ? WHERE asset_id = ?",
                (head_revision_id, row[0]),
            )

    # Schema 2 allowed nullable digests. Backfill every legacy row before the
    # immutable triggers are installed so upgraded projects remain readable.
    revision_rows = connection.execute(
        "SELECT revision_id, structure_json, sha256, topology_fingerprint "
        "FROM molecule_revisions"
    ).fetchall()
    for revision_id, structure_json, content_hash, topology_fingerprint in revision_rows:
        computed_content, computed_topology = _legacy_revision_digests(structure_json)
        connection.execute(
            """
            UPDATE molecule_revisions
            SET sha256 = ?, topology_fingerprint = ?
            WHERE revision_id = ?
            """,
            (
                content_hash if _is_sha256(content_hash) else computed_content,
                topology_fingerprint
                if _is_sha256(topology_fingerprint)
                else computed_topology,
                revision_id,
            ),
        )
    connection.execute(
        "UPDATE molecule_assets SET version = 2 "
        "WHERE head_revision_id IS NOT NULL AND version = 1"
    )

    statements = (
        """
        CREATE INDEX IF NOT EXISTS idx_molecule_assets_head
        ON molecule_assets(head_revision_id)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_molecule_revisions_content
        ON molecule_revisions(sha256)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_molecule_revisions_topology
        ON molecule_revisions(topology_fingerprint)
        """,
        """
        CREATE TRIGGER IF NOT EXISTS trg_molecule_revision_valid_insert
        BEFORE INSERT ON molecule_revisions
        WHEN NEW.sha256 IS NULL
          OR length(NEW.sha256) <> 64
          OR NEW.sha256 GLOB '*[^0-9a-f]*'
          OR NEW.topology_fingerprint IS NULL
          OR length(NEW.topology_fingerprint) <> 64
          OR NEW.topology_fingerprint GLOB '*[^0-9a-f]*'
        BEGIN
            SELECT RAISE(ABORT, 'molecule revision requires valid content digests');
        END
        """,
        """
        CREATE TRIGGER IF NOT EXISTS trg_molecule_revision_immutable_update
        BEFORE UPDATE ON molecule_revisions
        BEGIN
            SELECT RAISE(ABORT, 'molecule revisions are immutable');
        END
        """,
        """
        CREATE TRIGGER IF NOT EXISTS trg_molecule_revision_immutable_delete
        BEFORE DELETE ON molecule_revisions
        BEGIN
            SELECT RAISE(ABORT, 'molecule revisions are immutable');
        END
        """,
        """
        CREATE TRIGGER IF NOT EXISTS trg_molecule_asset_head_insert
        BEFORE INSERT ON molecule_assets
        WHEN NEW.head_revision_id IS NOT NULL
          AND NOT EXISTS (
              SELECT 1 FROM molecule_revisions
              WHERE revision_id = NEW.head_revision_id
                AND asset_id = NEW.asset_id
          )
        BEGIN
            SELECT RAISE(ABORT, 'asset head must reference its own revision');
        END
        """,
        """
        CREATE TRIGGER IF NOT EXISTS trg_molecule_asset_head_update
        BEFORE UPDATE OF head_revision_id ON molecule_assets
        WHEN NEW.head_revision_id IS NOT NULL
          AND NOT EXISTS (
              SELECT 1 FROM molecule_revisions
              WHERE revision_id = NEW.head_revision_id
                AND asset_id = NEW.asset_id
          )
        BEGIN
            SELECT RAISE(ABORT, 'asset head must reference its own revision');
        END
        """,
    )
    for statement in statements:
        connection.execute(statement)


def _legacy_revision_digests(structure_json: str) -> tuple[str, str]:
    try:
        from .molecule_canonicalize import (
            molecule_content_hash,
            molecule_topology_fingerprint,
            validate_molecule,
        )

        structure = validate_molecule(json.loads(structure_json))
        return (
            molecule_content_hash(structure),
            molecule_topology_fingerprint(structure),
        )
    except (ImportError, TypeError, ValueError, json.JSONDecodeError):
        raw = str(structure_json).encode("utf-8")
        return (
            hashlib.sha256(b"retainmol-legacy-content-v1\0" + raw).hexdigest(),
            hashlib.sha256(b"retainmol-legacy-topology-v1\0" + raw).hexdigest(),
        )


def _is_sha256(value: object) -> bool:
    return (
        isinstance(value, str)
        and len(value) == 64
        and all(character in "0123456789abcdef" for character in value)
    )


def _add_column_if_missing(
    connection: sqlite3.Connection,
    table: str,
    column: str,
    definition: str,
) -> None:
    columns = {
        str(row[1]) for row in connection.execute(f"PRAGMA table_info({table})")
    }
    if column not in columns:
        connection.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")


def _migration_6_add_molecule_revision_metadata(connection: sqlite3.Connection) -> None:
    """Store immutable provenance without changing molecule content hashes."""
    _add_column_if_missing(
        connection,
        "molecule_revisions",
        "metadata_json",
        "TEXT NOT NULL DEFAULT '{}'",
    )


_MIGRATIONS: dict[int, Migration] = {
    1: _migration_1_create_legacy_schema,
    2: _migration_2_expand_durable_job_schema,
    3: _migration_3_align_public_data_contract,
    4: _migration_4_add_job_input_bindings,
    5: _migration_5_finalize_molecule_revisions,
    6: _migration_6_add_molecule_revision_metadata,
}
