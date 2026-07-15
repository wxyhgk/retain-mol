"""Repository tests for immutable, typed job input bindings."""

from __future__ import annotations

import sqlite3
from datetime import UTC, datetime

import pytest

from software.backend.jobs.models import Artifact, Job, JobInput, JobInputBinding
from software.backend.jobs.migrations import LATEST_SCHEMA_VERSION
from software.backend.jobs.repository import JobRepository


NOW = datetime(2026, 7, 14, 8, 0, tzinfo=UTC)


def _job(job_id: str) -> Job:
    return Job(
        jobId=job_id,
        taskType="test",
        status="created",
        createdAt=NOW,
        updatedAt=NOW,
    )


def _literal(binding_id: str, job_id: str, name: str, value: object) -> JobInputBinding:
    return JobInputBinding(
        bindingId=binding_id,
        jobId=job_id,
        inputName=name,
        sourceKind="literal",
        literalValue=value,
        createdAt=NOW,
    )


def _seed_revision(repository: JobRepository, revision_id: str) -> None:
    with repository._connection() as connection:
        connection.execute(
            """
            INSERT INTO molecule_assets
                (asset_id, name, metadata_json, created_at, updated_at)
            VALUES ('asset-1', 'Water', '{}', ?, ?)
            """,
            (NOW.isoformat(), NOW.isoformat()),
        )
        connection.execute(
            """
            INSERT INTO molecule_revisions
                (revision_id, asset_id, structure_json, sha256,
                 topology_fingerprint, created_at)
            VALUES (?, 'asset-1', '{"atoms":[],"bonds":[]}', ?, ?, ?)
            """,
            (revision_id, "a" * 64, "b" * 64, NOW.isoformat()),
        )


def _seed_artifact(repository: JobRepository, job_id: str, artifact_id: str) -> None:
    repository.add_artifact(
        Artifact(
            artifactId=artifact_id,
            jobId=job_id,
            name="optimized.xyz",
            path="outputs/optimized.xyz",
            sha256="b" * 64,
            createdAt=NOW,
        )
    )


def test_latest_schema_keeps_legacy_inputs_and_enforces_source_shape(tmp_path) -> None:
    repository = JobRepository(tmp_path / "jobs.sqlite")
    repository.create_job(_job("job-1"))
    repository.add_input(
        JobInput(
            inputId="legacy-1",
            jobId="job-1",
            name="legacy",
            value={"kept": True},
            createdAt=NOW,
        )
    )

    with repository._connection() as connection:
        assert connection.execute("PRAGMA user_version").fetchone()[0] == LATEST_SCHEMA_VERSION
        assert connection.execute("SELECT count(*) FROM job_inputs").fetchone()[0] == 1
        with pytest.raises(sqlite3.IntegrityError):
            connection.execute(
                """
                INSERT INTO job_input_bindings
                    (binding_id, job_id, input_name, source_kind, literal_json,
                     created_at)
                VALUES ('bad', 'job-1', 'structure', 'literal', NULL, ?)
                """,
                (NOW.isoformat(),),
            )


def test_insert_and_list_all_binding_sources(tmp_path) -> None:
    repository = JobRepository(tmp_path / "jobs.sqlite")
    repository.create_job(_job("source-job"))
    repository.create_job(_job("target-job"))
    _seed_revision(repository, "revision-1")
    _seed_artifact(repository, "source-job", "artifact-1")
    bindings = [
        _literal("binding-literal", "target-job", "charge", 0),
        JobInputBinding(
            bindingId="binding-revision",
            jobId="target-job",
            inputName="structure",
            sourceKind="molecule_revision",
            moleculeRevisionId="revision-1",
            contentSha256="a" * 64,
            createdAt=NOW,
        ),
        JobInputBinding(
            bindingId="binding-artifact",
            jobId="target-job",
            inputName="restart",
            sourceKind="artifact",
            artifactId="artifact-1",
            contentSha256="b" * 64,
            createdAt=NOW,
        ),
    ]

    repository.insert_job_input_bindings(bindings)

    persisted = {
        binding.input_name: binding
        for binding in repository.list_job_input_bindings("target-job")
    }
    assert persisted == {binding.input_name: binding for binding in bindings}
    assert bindings[0].model_dump(by_alias=True)["inputName"] == "charge"
    assert bindings[1].model_dump(by_alias=True)["moleculeRevisionId"] == "revision-1"

    job_payload = _job("snapshot-job").model_copy(
        update={"bindings": bindings}
    ).model_dump(by_alias=True)
    assert [item["inputName"] for item in job_payload["bindings"]] == [
        "charge",
        "structure",
        "restart",
    ]


def test_unique_input_name_and_foreign_keys_are_enforced(tmp_path) -> None:
    repository = JobRepository(tmp_path / "jobs.sqlite")
    repository.create_job(_job("job-1"))
    repository.insert_job_input_bindings(
        [_literal("binding-1", "job-1", "charge", 0)]
    )

    with pytest.raises(sqlite3.IntegrityError):
        repository.insert_job_input_bindings(
            [_literal("binding-2", "job-1", "charge", 1)]
        )
    with pytest.raises(sqlite3.IntegrityError):
        repository.insert_job_input_bindings(
            [_literal("binding-3", "missing-job", "charge", 0)]
        )


def test_replace_is_atomic_and_scoped_to_one_job(tmp_path) -> None:
    repository = JobRepository(tmp_path / "jobs.sqlite")
    repository.create_job(_job("job-1"))
    repository.create_job(_job("job-2"))
    original = _literal("binding-original", "job-1", "charge", 0)
    other = _literal("binding-other", "job-2", "charge", -1)
    repository.insert_job_input_bindings([original, other])

    replacement = _literal("binding-replacement", "job-1", "multiplicity", 1)
    repository.replace_job_input_bindings("job-1", [replacement])

    assert repository.list_job_input_bindings("job-1") == [replacement]
    assert repository.list_job_input_bindings("job-2") == [other]

    invalid = JobInputBinding(
        bindingId="binding-invalid",
        jobId="job-1",
        inputName="structure",
        sourceKind="artifact",
        artifactId="missing-artifact",
        createdAt=NOW,
    )
    with pytest.raises(sqlite3.IntegrityError):
        repository.replace_job_input_bindings("job-1", [invalid])
    assert repository.list_job_input_bindings("job-1") == [replacement]

    with pytest.raises(ValueError, match="requested job"):
        repository.replace_job_input_bindings("job-1", [other])
