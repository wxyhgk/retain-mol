"""Tests for versioned jobs database migrations."""

from __future__ import annotations

import sqlite3

import pytest

from software.backend.jobs.migrations import LATEST_SCHEMA_VERSION, migrate


LEGACY_SCHEMA = """
CREATE TABLE jobs (
    job_id TEXT PRIMARY KEY,
    task_type TEXT NOT NULL,
    status TEXT NOT NULL,
    metadata_json TEXT NOT NULL,
    error TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
CREATE TABLE artifacts (
    artifact_id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    media_type TEXT,
    metadata_json TEXT NOT NULL,
    created_at TEXT NOT NULL
);
CREATE TABLE workflows (
    workflow_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
CREATE TABLE job_input_references (
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
"""


def _columns(connection: sqlite3.Connection, table: str) -> set[str]:
    return {str(row[1]) for row in connection.execute(f"PRAGMA table_info({table})")}


def _tables(connection: sqlite3.Connection) -> set[str]:
    rows = connection.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table'"
    ).fetchall()
    return {str(row[0]) for row in rows}


def test_migrate_initializes_an_empty_database() -> None:
    connection = sqlite3.connect(":memory:")

    migrate(connection)

    assert connection.execute("PRAGMA user_version").fetchone()[0] == LATEST_SCHEMA_VERSION
    assert {
        "jobs",
        "job_inputs",
        "artifacts",
        "workflows",
        "workflow_jobs",
        "job_input_references",
        "calculation_specs",
        "job_status_events",
        "molecule_assets",
        "molecule_revisions",
    } <= _tables(connection)


def test_migrate_preserves_legacy_data_and_normalizes_statuses() -> None:
    connection = sqlite3.connect(":memory:")
    connection.executescript(LEGACY_SCHEMA)
    jobs = (
        ("completed-job", "optimization", "completed", None),
        ("running-job", "optimization", "running", "worker stopped"),
        ("queued-job", "optimization", "queued", None),
    )
    connection.executemany(
        """
        INSERT INTO jobs
            (job_id, task_type, status, metadata_json, error, created_at, updated_at)
        VALUES (?, ?, ?, '{}', ?, '2026-07-14T00:00:00Z', '2026-07-14T00:01:00Z')
        """,
        jobs,
    )
    connection.execute(
        """
        INSERT INTO artifacts
            (artifact_id, job_id, name, path, media_type, metadata_json, created_at)
        VALUES
            ('artifact-1', 'completed-job', 'result', 'result.xyz',
             'chemical/x-xyz', '{}', '2026-07-14T00:01:00Z')
        """
    )

    migrate(connection)

    rows = connection.execute(
        "SELECT job_id, status, error, error_message FROM jobs ORDER BY job_id"
    ).fetchall()
    assert rows == [
        ("completed-job", "succeeded", None, None),
        ("queued-job", "queued", None, None),
        ("running-job", "interrupted", "worker stopped", "worker stopped"),
    ]
    assert connection.execute(
        "SELECT artifact_id, path, storage_key FROM artifacts"
    ).fetchone() == ("artifact-1", "result.xyz", "result.xyz")
    assert connection.execute(
        "SELECT job_id, to_status, state_version FROM job_status_events ORDER BY job_id"
    ).fetchall() == [
        ("completed-job", "succeeded", 0),
        ("queued-job", "queued", 0),
        ("running-job", "interrupted", 0),
    ]


def test_migrate_adds_all_requested_columns() -> None:
    connection = sqlite3.connect(":memory:")
    connection.executescript(LEGACY_SCHEMA)

    migrate(connection)

    assert {
        "spec_id",
        "error_code",
        "error_message",
        "queued_at",
        "started_at",
        "finished_at",
        "attempt_count",
        "state_version",
    } <= _columns(connection, "jobs")
    assert {
        "storage_key",
        "kind",
        "role",
        "format",
        "sha256",
        "byte_size",
    } <= _columns(connection, "artifacts")
    assert "source_artifact_id" in _columns(connection, "job_input_references")
    assert {"schema_version", "payload_json"} <= _columns(
        connection, "calculation_specs"
    )
    assert {"head_revision_id", "version"} <= _columns(
        connection, "molecule_assets"
    )
    assert {"schema_version", "topology_fingerprint", "metadata_json"} <= _columns(
        connection, "molecule_revisions"
    )


def test_migrate_is_idempotent_for_repeated_and_partially_applied_runs() -> None:
    connection = sqlite3.connect(":memory:")
    connection.executescript(LEGACY_SCHEMA)
    connection.execute("ALTER TABLE jobs ADD COLUMN error_code TEXT")
    connection.execute("PRAGMA user_version = 1")

    migrate(connection)
    first_schema = connection.execute(
        "SELECT type, name, sql FROM sqlite_master ORDER BY type, name"
    ).fetchall()
    migrate(connection)
    second_schema = connection.execute(
        "SELECT type, name, sql FROM sqlite_master ORDER BY type, name"
    ).fetchall()

    assert first_schema == second_schema
    assert list(_columns(connection, "jobs")).count("error_code") == 1
    assert connection.execute("PRAGMA user_version").fetchone()[0] == LATEST_SCHEMA_VERSION


def test_migrate_backfills_legacy_revision_digests_and_head_version() -> None:
    connection = sqlite3.connect(":memory:")
    migrate(connection)
    # Recreate the pre-v5 state explicitly so the v5 upgrade path is exercised.
    connection.execute("DROP TRIGGER trg_molecule_revision_valid_insert")
    connection.execute("DROP TRIGGER trg_molecule_revision_immutable_update")
    connection.execute("DROP TRIGGER trg_molecule_revision_immutable_delete")
    connection.execute("DROP TRIGGER trg_molecule_asset_head_insert")
    connection.execute("DROP TRIGGER trg_molecule_asset_head_update")
    connection.execute(
        "INSERT INTO molecule_assets "
        "(asset_id, name, metadata_json, created_at, updated_at) "
        "VALUES ('asset-old', 'Legacy', ?, '2026-07-14', '2026-07-14')",
        ('{"headRevisionId":"revision-old"}',),
    )
    connection.execute(
        "INSERT INTO molecule_revisions "
        "(revision_id, asset_id, structure_json, sha256, created_at) "
        "VALUES ('revision-old', 'asset-old', ?, NULL, '2026-07-14')",
        ('{"atoms":[],"bonds":[]}',),
    )
    connection.execute("PRAGMA user_version = 4")

    migrate(connection)

    row = connection.execute(
        "SELECT sha256, topology_fingerprint FROM molecule_revisions"
    ).fetchone()
    assert len(row[0]) == 64
    assert len(row[1]) == 64
    assert connection.execute(
        "SELECT head_revision_id, version FROM molecule_assets"
    ).fetchone() == ("revision-old", 2)


def test_migrate_refuses_a_database_from_a_newer_schema() -> None:
    connection = sqlite3.connect(":memory:")
    connection.execute(f"PRAGMA user_version = {LATEST_SCHEMA_VERSION + 1}")

    with pytest.raises(RuntimeError, match="newer than supported"):
        migrate(connection)
