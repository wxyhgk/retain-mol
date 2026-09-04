"""SQLite row decoding and scalar serialization for Job persistence."""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime
from typing import Any

from .models import (
    Artifact,
    Job,
    JobDispatch,
    JobInput,
    JobInputSnapshot,
    JobRun,
    JobTypeData,
    MoleculeAsset,
    MoleculeRevision,
    Workflow,
    WorkflowExecution,
    WorkflowInputLink,
)


class RepositoryRowMapperMixin:
    """Translate database rows into domain records without issuing SQL."""

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
        metadata = _json_load(row["metadata_json"])
        return Artifact(
            artifact_id=row["artifact_id"],
            job_id=row["job_id"],
            run_id=row["run_id"],
            name=row["name"],
            path=row["path"],
            storage_key=row["storage_key"],
            kind=row["kind"] or "file",
            role=row["role"] or metadata.get("role", "output"),
            format=row["format"] or metadata.get("format", "file"),
            media_type=row["media_type"],
            sha256=row["sha256"],
            byte_size=row["byte_size"],
            metadata=metadata,
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
