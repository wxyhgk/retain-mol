"""Creation and input-freezing orchestration for Jobs."""

from __future__ import annotations

import secrets
import sqlite3
from collections.abc import Callable, Mapping
from datetime import UTC, datetime
from typing import Any

from pydantic import ValidationError

from .errors import (
    InvalidJobInputError,
    InvalidJobOperationError,
    InvalidJobTransitionError,
)
from .input_resolution import JobInputResolver
from .job_types import JOB_TYPE_REGISTRY, UnknownJobTypeError
from .job_workspace import JobWorkspace
from .lifecycle import normalize_job_status
from .models import CalculationSpec, Job, JobTypeData
from .repository import JobRepository

JobLoader = Callable[[str], Job]


class JobCreationManager:
    """Turns creation requests into persisted drafts or queued Jobs."""

    def __init__(
        self,
        repository: JobRepository,
        input_resolver: JobInputResolver,
        workspace: JobWorkspace,
        load_job: JobLoader,
    ) -> None:
        self.repository = repository
        self.input_resolver = input_resolver
        self.workspace = workspace
        self.load_job = load_job

    def create_job(
        self,
        task_type: str | Mapping[str, Any],
        *,
        metadata: dict[str, Any] | None = None,
        status: str = "queued",
    ) -> Job:
        task_type, metadata, status = self._normalize_basic_request(
            task_type, metadata, status
        )
        now = _now()
        for _ in range(10):
            job = Job(
                job_id=_new_job_id(now),
                task_type=task_type,
                status=status,
                queued_at=now if status == "queued" else None,
                metadata=metadata,
                created_at=now,
                updated_at=now,
            )
            job_type_data = self._job_type_data(
                job,
                schema_version=1,
                data=_job_type_payload(metadata),
                now=now,
            )
            try:
                self.repository.create_job(job, job_type_data)
            except sqlite3.IntegrityError:
                continue
            self.workspace.write_snapshot(job)
            return job
        raise RuntimeError("Unable to allocate a unique job id")

    def create_calculation_job(
        self,
        kind: str,
        engine: str,
        payload: Mapping[str, Any],
        *,
        inputs: Mapping[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
        supersedes_job_id: str | None = None,
    ) -> Job:
        """Atomically create, bind, and queue one immutable calculation run."""
        now = _now()
        spec, job_metadata = self._build_calculation_spec(
            kind, engine, payload, metadata, now
        )
        input_definitions = self._normalize_inline_structure_inputs(
            dict(inputs or {}), spec.payload
        )
        normalized_data = self._normalize_job_type_data(
            spec.kind,
            {"engine": spec.engine, "parameters": spec.payload},
        )
        for _ in range(10):
            job = Job(
                job_id=_new_job_id(now),
                task_type=spec.kind,
                status="created",
                spec_id=spec.spec_id,
                supersedes_job_id=supersedes_job_id,
                metadata=job_metadata,
                created_at=now,
                updated_at=now,
            )
            snapshots = self.input_resolver.build_snapshots(
                job.job_id, spec.kind, input_definitions, now
            )
            job_type_data = self._job_type_data(
                job,
                schema_version=spec.schema_version,
                data=normalized_data,
                now=now,
            )
            try:
                self.repository.create_queued_job_with_spec_and_snapshots(
                    job, spec, snapshots, now, job_type_data
                )
            except sqlite3.IntegrityError:
                continue
            return self._load_and_snapshot(job.job_id)
        raise RuntimeError("Unable to allocate a unique calculation job id")

    def create_calculation_draft(
        self,
        kind: str,
        engine: str,
        payload: Mapping[str, Any],
        *,
        metadata: dict[str, Any] | None = None,
    ) -> Job:
        """Create a persistent calculation draft for later input binding."""
        now = _now()
        spec, job_metadata = self._build_calculation_spec(
            kind, engine, payload, metadata, now
        )
        normalized_data = self._normalize_job_type_data(
            spec.kind,
            {"engine": spec.engine, "parameters": spec.payload},
        )
        for _ in range(10):
            job = Job(
                jobId=_new_job_id(now),
                taskType=spec.kind,
                status="created",
                specId=spec.spec_id,
                metadata=job_metadata,
                createdAt=now,
                updatedAt=now,
            )
            job_type_data = self._job_type_data(
                job,
                schema_version=spec.schema_version,
                data=normalized_data,
                now=now,
            )
            try:
                self.repository.create_job_with_spec(job, spec, job_type_data)
            except sqlite3.IntegrityError:
                continue
            return self._load_and_snapshot(job.job_id)
        raise RuntimeError("Unable to allocate a unique calculation draft id")

    def queue_calculation_job(
        self,
        job_id: str,
        inputs: Mapping[str, Any] | None = None,
        *,
        workflow_id: str | None = None,
        require_active_workflow: bool = False,
    ) -> Job:
        """Resolve inputs, freeze immutable snapshots, then queue one draft."""
        job = self.load_job(job_id)
        if job.status != "created":
            raise InvalidJobTransitionError(
                f"Job '{job_id}' cannot freeze inputs from '{job.status}'"
            )
        spec = (
            self.repository.get_calculation_spec(job.spec_id)
            if job.spec_id is not None
            else None
        )
        if spec is None:
            raise InvalidJobInputError(
                f"Job '{job_id}' has no calculation specification"
            )
        definitions = dict(inputs or {})
        if workflow_id is not None:
            workflow_definitions = self.input_resolver.resolve_workflow_definitions(
                workflow_id, job_id
            )
            for name, definition in workflow_definitions.items():
                if name in definitions:
                    raise InvalidJobInputError(
                        f"Input '{name}' is supplied explicitly and by workflow"
                    )
                definitions[name] = definition
        now = _now()
        snapshots = self.input_resolver.build_snapshots(
            job_id, spec.kind, definitions, now
        )
        if not self.repository.freeze_job_input_snapshots_and_queue(
            job_id,
            snapshots,
            now,
            active_workflow_id=workflow_id if require_active_workflow else None,
        ):
            self._raise_queue_failure(
                job_id,
                workflow_id=workflow_id,
                require_active_workflow=require_active_workflow,
            )
        return self._load_and_snapshot(job_id)

    @staticmethod
    def job_type_version(job_type: str) -> int:
        try:
            return JOB_TYPE_REGISTRY.resolve(job_type).job_type_version
        except UnknownJobTypeError:
            return 1

    @classmethod
    def _normalize_job_type_data(
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

    def _load_and_snapshot(self, job_id: str) -> Job:
        job = self.load_job(job_id)
        self.workspace.write_snapshot(job)
        return job

    def _raise_queue_failure(
        self,
        job_id: str,
        *,
        workflow_id: str | None,
        require_active_workflow: bool,
    ) -> None:
        current = self.load_job(job_id)
        if workflow_id is not None and require_active_workflow:
            execution = self.repository.get_workflow_execution(workflow_id)
            if execution is None or execution.status != "active":
                raise InvalidJobOperationError(
                    f"Workflow '{workflow_id}' is no longer active"
                )
        raise InvalidJobTransitionError(
            f"Job '{job_id}' cannot queue from '{current.status}'"
        )

    @classmethod
    def _job_type_data(
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
    def _normalize_basic_request(
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
            _required_text(task_type, "task_type"),
            dict(metadata or {}),
            normalized_status,
        )

    @staticmethod
    def _build_calculation_spec(
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
            job_metadata["name"] = _required_text(request_name, "name")
        return (
            CalculationSpec(
                specId=f"spec-{secrets.token_hex(8)}",
                schemaVersion=1,
                kind=_required_text(kind, "kind"),
                engine=_required_text(engine, "engine"),
                payload=spec_payload,
                createdAt=now,
            ),
            job_metadata,
        )

    @staticmethod
    def _normalize_inline_structure_inputs(
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


def _now() -> datetime:
    return datetime.now(UTC)


def _new_job_id(now: datetime) -> str:
    return f"{now:%Y%m%d}-{secrets.token_hex(4)}"


def _job_type_payload(metadata: Mapping[str, Any]) -> dict[str, Any]:
    request = metadata.get("request")
    return dict(request) if isinstance(request, Mapping) else {}


def _required_text(value: Any, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} must be a non-empty string")
    return value
