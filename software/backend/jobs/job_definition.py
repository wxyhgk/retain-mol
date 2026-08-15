"""Pure request normalization for Job creation."""

from __future__ import annotations

import secrets
from collections.abc import Mapping
from datetime import datetime
from typing import Any

from pydantic import ValidationError

from .errors import InvalidJobInputError
from .job_types import JOB_TYPE_REGISTRY, UnknownJobTypeError
from .lifecycle import normalize_job_status
from .models import CalculationSpec, Job, JobTypeData


class JobDefinitionBuilder:
    """Validate creation requests and build immutable Job definition records."""

    @staticmethod
    def normalize_basic_request(
        task_type: str | Mapping[str, Any],
        metadata: dict[str, Any] | None,
        status: str,
    ) -> tuple[str, dict[str, Any], str]:
        if isinstance(task_type, Mapping):
            definition = dict(task_type)
            task_type = str(
                definition.pop(
                    "taskType",
                    definition.pop("task_type", definition.pop("type", "job")),
                )
            )
            status = str(definition.pop("status", status))
            supplied_metadata = definition.pop("metadata", {})
            if not isinstance(supplied_metadata, dict):
                raise ValueError("metadata must be an object")
            metadata = {**supplied_metadata, **definition, **(metadata or {})}

        normalized_status = normalize_job_status(status)
        if normalized_status not in {"created", "queued"}:
            raise ValueError("new jobs must start in 'created' or 'queued'")
        return (
            required_text(task_type, "task_type"),
            dict(metadata or {}),
            normalized_status,
        )

    @staticmethod
    def build_calculation_spec(
        kind: str,
        engine: str,
        payload: Mapping[str, Any],
        metadata: dict[str, Any] | None,
        now: datetime,
    ) -> tuple[CalculationSpec, dict[str, Any]]:
        spec_payload = dict(payload)
        job_metadata = dict(metadata or {})
        request_name = spec_payload.pop("name", None)
        if request_name is not None and "name" not in job_metadata:
            job_metadata["name"] = required_text(request_name, "name")
        return (
            CalculationSpec(
                specId=f"spec-{secrets.token_hex(8)}",
                schemaVersion=1,
                kind=required_text(kind, "kind"),
                engine=required_text(engine, "engine"),
                payload=spec_payload,
                createdAt=now,
            ),
            job_metadata,
        )

    @staticmethod
    def extract_inline_structure_input(
        definitions: dict[str, Any],
        spec_payload: dict[str, Any],
    ) -> dict[str, Any]:
        if definitions or "structure" not in spec_payload:
            return definitions
        structure = spec_payload.pop("structure")
        molecule = spec_payload.pop("molecule", None)
        literal = {"format": "molecule", "structure": structure}
        if molecule is not None:
            literal["molecule"] = molecule
        definitions["structure"] = {
            "sourceKind": "literal",
            "format": "molecule",
            "value": literal,
        }
        return definitions

    @classmethod
    def normalize_job_type_data(
        cls,
        job_type: str,
        raw_data: Mapping[str, Any],
    ) -> dict[str, Any]:
        try:
            handler = JOB_TYPE_REGISTRY.resolve(job_type)
        except UnknownJobTypeError:
            return dict(raw_data)
        try:
            return handler.normalize_job_type_data(raw_data)
        except (ValidationError, TypeError, ValueError) as error:
            raise InvalidJobInputError(
                f"Invalid {job_type}@{handler.job_type_version} parameters: {error}"
            ) from error

    @classmethod
    def build_job_type_data(
        cls,
        job: Job,
        *,
        schema_version: int,
        data: Mapping[str, Any],
        now: datetime,
    ) -> JobTypeData:
        return JobTypeData(
            jobId=job.job_id,
            jobType=job.task_type,
            jobTypeVersion=cls.job_type_version(job.task_type),
            schemaVersion=schema_version,
            data=dict(data),
            createdAt=now,
            updatedAt=now,
        )

    @staticmethod
    def job_type_version(job_type: str) -> int:
        try:
            return JOB_TYPE_REGISTRY.resolve(job_type).job_type_version
        except UnknownJobTypeError:
            return 1


def job_type_payload(metadata: Mapping[str, Any]) -> dict[str, Any]:
    request = metadata.get("request")
    return dict(request) if isinstance(request, Mapping) else {}


def required_text(value: Any, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} must be a non-empty string")
    return value
