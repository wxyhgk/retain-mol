"""Route-facing job persistence service."""

from __future__ import annotations

import json
import os
import secrets
import shutil
import sqlite3
from collections.abc import Mapping
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

from pydantic import ValidationError

from .artifact_storage import ArtifactStorage
from .errors import (
    InvalidJobInputError,
    InvalidJobOperationError,
    InvalidJobTransitionError,
    JobInUseError,
    JobNotFoundError,
    MoleculeAssetNotFoundError,
    MoleculeHeadConflictError,
    MoleculeRevisionNotFoundError,
    WorkflowNotFoundError,
)
from .input_resolution import JobInputResolver
from .molecule_canonicalize import (
    InvalidMoleculeError,
    molecule_content_hash,
    molecule_topology_fingerprint,
    validate_molecule,
)
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
    WorkflowExecution,
    WorkflowInputLink,
    WorkflowNodeRuntime,
    WorkflowSchedule,
)
from .repository import JobRepository
from .job_types import JOB_TYPE_REGISTRY, UnknownJobTypeError
from .workflows import validate_workflow_dag, workflow_predecessors

DEFAULT_DATA_ROOT = Path(
    os.getenv(
        "RETAINMOL_DATA_ROOT",
        str(Path(__file__).resolve().parents[1] / "data"),
    )
)


_ALLOWED_TRANSITIONS: dict[JobStatus, frozenset[JobStatus]] = {
    "created": frozenset({"queued", "cancelled"}),
    "queued": frozenset({"running", "cancelled"}),
    "running": frozenset({"succeeded", "failed", "cancelled", "interrupted"}),
    "succeeded": frozenset(),
    "failed": frozenset(),
    "cancelled": frozenset(),
    "interrupted": frozenset(),
}


class JobService:
    """Creates jobs and keeps SQLite records and filesystem snapshots in sync."""

    def __init__(self, data_root: str | Path | None = None) -> None:
        self.data_root = Path(data_root) if data_root is not None else DEFAULT_DATA_ROOT
        self.data_root.mkdir(parents=True, exist_ok=True)
        self.tasks_root = self.data_root / "tasks"
        self.tasks_root.mkdir(parents=True, exist_ok=True)
        self.artifact_storage = ArtifactStorage(self.data_root)
        self.repository = JobRepository(self.data_root / "retainmol.sqlite")
        self.input_resolver = JobInputResolver(self.repository)

    def create_molecule_asset(
        self, name: str, *, metadata: dict[str, Any] | None = None
    ) -> MoleculeAsset:
        now = _now()
        for _ in range(10):
            asset = MoleculeAsset(
                assetId=f"mol-{secrets.token_hex(8)}",
                name=_required_text(name, "name"),
                schemaVersion=1,
                headRevisionId=None,
                version=1,
                metadata=metadata or {},
                createdAt=now,
                updatedAt=now,
            )
            try:
                self.repository.create_molecule_asset(asset)
            except sqlite3.IntegrityError:
                continue
            return asset
        raise RuntimeError("Unable to allocate a unique molecule asset id")

    def list_molecule_assets(self) -> list[MoleculeAsset]:
        return self.repository.list_molecule_assets()

    def get_molecule_asset(self, asset_id: str) -> MoleculeAsset:
        asset = self.repository.get_molecule_asset(asset_id)
        if asset is None:
            raise MoleculeAssetNotFoundError(asset_id)
        return asset

    def get_molecule_revision(self, revision_id: str) -> MoleculeRevision:
        revision = self.repository.get_molecule_revision(revision_id)
        if revision is None:
            raise MoleculeRevisionNotFoundError(revision_id)
        return revision

    def list_molecule_revisions(self, asset_id: str) -> list[MoleculeRevision]:
        self.get_molecule_asset(asset_id)
        return self.repository.list_molecule_revisions(asset_id)

    def save_molecule_revision(
        self,
        asset_id: str,
        molecule: Mapping[str, Any],
        *,
        parent_revision_id: str | None,
        expected_head_revision_id: str | None,
        expected_version: int,
        content_hash: str | None = None,
        topology_fingerprint: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> MoleculeRevision:
        """Create one immutable snapshot and CAS-advance the asset head."""
        self.get_molecule_asset(asset_id)
        if parent_revision_id != expected_head_revision_id:
            raise InvalidMoleculeError(
                "parentRevisionId must match expectedHeadRevisionId"
            )
        snapshot = validate_molecule(dict(molecule))
        computed_content_hash = molecule_content_hash(snapshot)
        computed_topology_fingerprint = molecule_topology_fingerprint(snapshot)
        if content_hash is not None and content_hash != computed_content_hash:
            raise InvalidMoleculeError("contentHash does not match the molecule snapshot")
        if (
            topology_fingerprint is not None
            and topology_fingerprint != computed_topology_fingerprint
        ):
            raise InvalidMoleculeError(
                "topologyFingerprint does not match the molecule topology"
            )
        revision = MoleculeRevision(
            revisionId=f"rev-{secrets.token_hex(8)}",
            schemaVersion=1,
            assetId=asset_id,
            parentRevisionId=parent_revision_id,
            molecule=snapshot,
            contentHash=computed_content_hash,
            topologyFingerprint=computed_topology_fingerprint,
            metadata=metadata or {},
            createdAt=_now(),
        )
        if not self.repository.create_molecule_revision(
            revision,
            expected_head_revision_id,
            expected_version,
        ):
            raise MoleculeHeadConflictError(self.get_molecule_asset(asset_id))
        return revision

    def create_job(
        self,
        task_type: str | Mapping[str, Any],
        *,
        metadata: dict[str, Any] | None = None,
        status: str = "queued",
    ) -> Job:
        if isinstance(task_type, Mapping):
            definition = dict(task_type)
            task_type = str(
                definition.pop("taskType", definition.pop("task_type", definition.pop("type", "job")))
            )
            status = str(definition.pop("status", status))
            supplied_metadata = definition.pop("metadata", {})
            if not isinstance(supplied_metadata, dict):
                raise ValueError("metadata must be an object")
            metadata = {**supplied_metadata, **definition, **(metadata or {})}
        task_type = _required_text(task_type, "task_type")
        status = _normalize_status(status)
        if status not in {"created", "queued"}:
            raise ValueError("new jobs must start in 'created' or 'queued'")
        now = _now()
        for _ in range(10):
            job = Job(
                job_id=_new_job_id(now),
                task_type=task_type,
                status=status,
                queued_at=now if status == "queued" else None,
                metadata=metadata or {},
                created_at=now,
                updated_at=now,
            )
            job_type_data = JobTypeData(
                jobId=job.job_id,
                jobType=job.task_type,
                jobTypeVersion=self._job_type_version(job.task_type),
                schemaVersion=1,
                data=_job_type_payload(metadata or {}),
                createdAt=now,
                updatedAt=now,
            )
            try:
                self.repository.create_job(job, job_type_data)
            except sqlite3.IntegrityError:
                continue
            self._write_snapshot(job)
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
        spec_payload = dict(payload)
        job_metadata = dict(metadata or {})
        request_name = spec_payload.pop("name", None)
        if request_name is not None and "name" not in job_metadata:
            job_metadata["name"] = _required_text(request_name, "name")
        input_definitions = dict(inputs or {})
        if not input_definitions and "structure" in spec_payload:
            structure = spec_payload.pop("structure")
            molecule = spec_payload.pop("molecule", None)
            literal = {"format": "molecule", "structure": structure}
            if molecule is not None:
                literal["molecule"] = molecule
            input_definitions["structure"] = {
                "sourceKind": "literal",
                "format": "molecule",
                "value": literal,
            }
        spec = CalculationSpec(
            spec_id=f"spec-{secrets.token_hex(8)}",
            schema_version=1,
            kind=_required_text(kind, "kind"),
            engine=_required_text(engine, "engine"),
            payload=spec_payload,
            created_at=now,
        )
        normalized_job_type_data = self._normalize_job_type_data(
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
            input_snapshots = self._build_input_snapshots(
                job.job_id, spec.kind, input_definitions, now
            )
            job_type_data = JobTypeData(
                jobId=job.job_id,
                jobType=job.task_type,
                jobTypeVersion=self._job_type_version(job.task_type),
                schemaVersion=spec.schema_version,
                data=normalized_job_type_data,
                createdAt=now,
                updatedAt=now,
            )
            try:
                self.repository.create_queued_job_with_spec_and_snapshots(
                    job, spec, input_snapshots, now, job_type_data
                )
            except sqlite3.IntegrityError:
                continue
            queued_job = self.get_job(job.job_id)
            self._write_snapshot(queued_job)
            return queued_job
        raise RuntimeError("Unable to allocate a unique calculation job id")

    def create_calculation_draft(
        self,
        kind: str,
        engine: str,
        payload: Mapping[str, Any],
        *,
        metadata: dict[str, Any] | None = None,
    ) -> Job:
        """Create a persistent calculation draft for later workflow binding."""
        now = _now()
        spec_payload = dict(payload)
        job_metadata = dict(metadata or {})
        request_name = spec_payload.pop("name", None)
        if request_name is not None and "name" not in job_metadata:
            job_metadata["name"] = _required_text(request_name, "name")
        spec = CalculationSpec(
            specId=f"spec-{secrets.token_hex(8)}",
            schemaVersion=1,
            kind=_required_text(kind, "kind"),
            engine=_required_text(engine, "engine"),
            payload=spec_payload,
            createdAt=now,
        )
        normalized_job_type_data = self._normalize_job_type_data(
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
            job_type_data = JobTypeData(
                jobId=job.job_id,
                jobType=job.task_type,
                jobTypeVersion=self._job_type_version(job.task_type),
                schemaVersion=spec.schema_version,
                data=normalized_job_type_data,
                createdAt=now,
                updatedAt=now,
            )
            try:
                self.repository.create_job_with_spec(job, spec, job_type_data)
            except sqlite3.IntegrityError:
                continue
            created = self.get_job(job.job_id)
            self._write_snapshot(created)
            return created
        raise RuntimeError("Unable to allocate a unique calculation draft id")

    def queue_calculation_job(
        self,
        job_id: str,
        inputs: Mapping[str, Any] | None = None,
        *,
        workflow_id: str | None = None,
        require_active_workflow: bool = False,
    ) -> Job:
        """Resolve explicit/workflow inputs, freeze them, then queue one draft."""
        job = self._require_job(job_id)
        if job.status != "created":
            raise InvalidJobTransitionError(
                f"Job '{job_id}' cannot freeze inputs from '{job.status}'"
            )
        spec = self.get_calculation_spec(job_id)
        if spec is None:
            raise InvalidJobInputError(f"Job '{job_id}' has no calculation specification")
        definitions = dict(inputs or {})
        if workflow_id is not None:
            for name, definition in self._resolve_workflow_input_definitions(
                workflow_id, job_id
            ).items():
                if name in definitions:
                    raise InvalidJobInputError(
                        f"Input '{name}' is supplied explicitly and by workflow"
                    )
                definitions[name] = definition
        now = _now()
        input_snapshots = self._build_input_snapshots(
            job_id, spec.kind, definitions, now
        )
        if not self.repository.freeze_job_input_snapshots_and_queue(
            job_id,
            input_snapshots,
            now,
            active_workflow_id=workflow_id if require_active_workflow else None,
        ):
            current = self._require_job(job_id)
            if workflow_id is not None and require_active_workflow:
                execution = self.repository.get_workflow_execution(workflow_id)
                if execution is None or execution.status != "active":
                    raise InvalidJobOperationError(
                        f"Workflow '{workflow_id}' is no longer active"
                    )
            raise InvalidJobTransitionError(
                f"Job '{job_id}' cannot queue from '{current.status}'"
            )
        queued = self.get_job(job_id)
        self._write_snapshot(queued)
        return queued

    def get_calculation_spec(self, job_id: str) -> CalculationSpec | None:
        job = self._require_job(job_id)
        return self.repository.get_calculation_spec(job.spec_id) if job.spec_id else None

    def get_input_snapshots(self, job_id: str) -> list[JobInputSnapshot]:
        self._require_job(job_id)
        return self.repository.list_job_input_snapshots(job_id)

    def get_job_type_data(self, job_id: str) -> JobTypeData:
        self._require_job(job_id)
        job_type_data = self.repository.get_job_type_data(job_id)
        if job_type_data is None:
            raise InvalidJobOperationError(
                f"Job '{job_id}' has no persisted JobType data"
            )
        return job_type_data

    def list_job_runs(self, job_id: str) -> list[JobRun]:
        self._require_job(job_id)
        return self.repository.list_job_runs(job_id)

    def get_job_run(self, run_id: str) -> JobRun:
        run = self.repository.get_job_run(run_id)
        if run is None:
            raise InvalidJobOperationError(f"JobRun '{run_id}' does not exist")
        return run

    def list_jobs(self) -> list[Job]:
        jobs = self.repository.list_jobs()
        for job in jobs:
            self._populate_relations(job)
        return jobs

    def get_job(self, job_id: str) -> Job:
        job = self.repository.get_job(job_id)
        if job is None:
            raise JobNotFoundError(job_id)
        self._populate_relations(job)
        return job

    def update_job(self, job_id: str, changes: Mapping[str, Any]) -> Job:
        """Update mutable presentation metadata without changing frozen inputs."""
        if not isinstance(changes, Mapping) or not changes:
            raise ValueError("job update must contain at least one field")
        unsupported = set(changes) - {"name", "description"}
        if unsupported:
            raise ValueError(
                "unsupported mutable job fields: " + ", ".join(sorted(unsupported))
            )

        job = self.get_job(job_id)
        metadata = dict(job.metadata)
        if "name" in changes:
            metadata["name"] = _required_text(changes["name"], "name")
        if "description" in changes:
            description = changes["description"]
            if description is None or not str(description).strip():
                metadata.pop("description", None)
            else:
                metadata["description"] = str(description).strip()

        updated_at = _now()
        if not self.repository.update_job_metadata(job_id, metadata, updated_at):
            raise JobNotFoundError(job_id)
        updated = self.get_job(job_id)
        self._write_snapshot(updated)
        return updated

    def clone_job(self, job_id: str, *, name: str | None = None) -> Job:
        """Create a fresh queued calculation from an immutable spec and snapshots."""
        source = self.get_job(job_id)
        spec = self.get_calculation_spec(job_id)
        if spec is None:
            raise InvalidJobOperationError(
                "only jobs with an immutable calculation specification can be copied"
            )

        clone_name = (
            _required_text(name, "name")
            if name is not None
            else f"{source.metadata.get('name') or source.task_type} 副本"
        )
        metadata = dict(source.metadata)
        metadata["name"] = clone_name
        metadata["sourceJobId"] = source.job_id
        request = metadata.get("request")
        if isinstance(request, Mapping):
            metadata["request"] = {**dict(request), "name": clone_name}

        return self.create_calculation_job(
            spec.kind,
            spec.engine,
            spec.payload,
            inputs=self._copy_input_definitions(source),
            metadata=metadata,
        )

    def retry_job(self, job_id: str, *, name: str | None = None) -> Job:
        """Create a new immutable run from a failed terminal attempt."""
        source = self.get_job(job_id)
        if source.status not in {"failed", "cancelled", "interrupted"}:
            raise InvalidJobOperationError(
                f"job in '{source.status}' state cannot be retried"
            )
        spec = self.get_calculation_spec(job_id)
        if spec is None:
            raise InvalidJobOperationError(
                "only jobs with an immutable calculation specification can be retried"
            )

        retry_name = (
            _required_text(name, "name")
            if name is not None
            else f"{source.metadata.get('name') or source.task_type} 重试"
        )
        metadata = dict(source.metadata)
        metadata["name"] = retry_name
        request = metadata.get("request")
        if isinstance(request, Mapping):
            metadata["request"] = {**dict(request), "name": retry_name}

        return self.create_calculation_job(
            spec.kind,
            spec.engine,
            spec.payload,
            inputs=self._copy_input_definitions(source),
            metadata=metadata,
            supersedes_job_id=source.job_id,
        )

    def cancel_job(self, job_id: str) -> Job:
        """Cancel a pending or active run through the persisted state machine."""
        job = self.get_job(job_id)
        if job.status == "cancelled":
            return job
        if job.status not in {"created", "queued", "running"}:
            raise InvalidJobOperationError(
                f"job in '{job.status}' state cannot be cancelled"
            )
        return self.update_status(job_id, "cancelled")

    def read_job_log(
        self,
        job_id: str,
        *,
        cursor: int = 0,
        limit: int = 128 * 1024,
    ) -> dict[str, Any]:
        """Read an incremental UTF-8 log chunk without exposing task paths."""
        job = self.get_job(job_id)
        cursor = max(0, int(cursor))
        limit = min(max(1, int(limit)), 512 * 1024)
        directory = self.tasks_root / job_id
        candidates = [
            directory / "xtb.log",
            directory / "psi4.log",
            directory / "psi4-process.log",
            directory / "irc-forward" / "psi4.log",
            directory / "irc-backward" / "psi4.log",
        ]
        path = next((candidate for candidate in candidates if candidate.is_file()), None)
        if path is None:
            return {
                "content": "",
                "cursor": 0,
                "source": None,
                "complete": job.status in {"succeeded", "failed", "cancelled", "interrupted"},
            }
        size = path.stat().st_size
        if cursor > size:
            cursor = 0
        with path.open("rb") as handle:
            handle.seek(cursor)
            chunk = handle.read(limit)
        return {
            "content": chunk.decode("utf-8", errors="replace"),
            "cursor": cursor + len(chunk),
            "source": path.name,
            "complete": job.status in {"succeeded", "failed", "cancelled", "interrupted"},
        }

    def delete_job(self, job_id: str) -> None:
        """Delete one non-running, unreferenced job and its private work directory."""
        job = self.get_job(job_id)
        if job.status == "running":
            raise InvalidJobOperationError("running jobs cannot be deleted")
        workflow_ids = self.repository.list_workflow_ids_for_job(job_id)
        if workflow_ids:
            raise JobInUseError(
                f"job is referenced by workflow(s): {', '.join(workflow_ids)}"
            )
        superseding_job_ids = self.repository.list_superseding_job_ids(job_id)
        if superseding_job_ids:
            raise JobInUseError(
                "job is superseded by retry job(s): "
                + ", ".join(superseding_job_ids)
            )
        if not self.repository.delete_job(job_id):
            raise JobNotFoundError(job_id)
        shutil.rmtree(self.tasks_root / job_id, ignore_errors=True)

    def add_inputs(self, job_id: str, inputs: Mapping[str, Any]) -> Job:
        """Add a batch of named inputs, as submitted by the jobs HTTP route."""
        if not isinstance(inputs, Mapping):
            raise ValueError("inputs must be an object")
        self._assert_legacy_inputs_mutable(job_id)
        for name, value in inputs.items():
            self.add_input(job_id, name, value)
        return self.get_job(job_id)

    def list_artifacts(self, job_id: str) -> list[Artifact]:
        """Return every artifact registered for a job."""
        return self.get_job(job_id).artifacts

    def get_artifact(self, artifact_id: str) -> Artifact:
        artifact = self.repository.get_artifact(artifact_id)
        if artifact is None:
            raise KeyError(artifact_id)
        return artifact

    def create_workflow(
        self,
        name: str,
        job_ids: list[str],
        input_links: list[dict[str, Any]],
    ) -> Workflow:
        """Persist a dependency graph after validating every referenced job."""
        name = _required_text(name, "name")
        workflow_id = _new_workflow_id()
        workflow = self._build_workflow(workflow_id, name, job_ids, input_links)
        self.repository.create_workflow(workflow)
        return workflow

    def create_ts_preparation_workflow(
        self,
        name: str,
        reactant_job_id: str,
        reactant_artifact_id: str,
        product_job_id: str,
        product_artifact_id: str,
    ) -> tuple[Workflow, Job]:
        """Create the first fixed workflow: two optimized endpoints into a TS draft."""
        name = _required_text(name, "name")
        if reactant_job_id == product_job_id:
            raise InvalidJobInputError(
                "Reactant and product must come from different jobs"
            )

        reactant_artifact = self._require_workflow_structure_artifact(
            reactant_job_id, reactant_artifact_id, "reactant"
        )
        product_artifact = self._require_workflow_structure_artifact(
            product_job_id, product_artifact_id, "product"
        )
        target = self.create_calculation_draft(
            "ts-initial-guess",
            "retainmol",
            {"strategy": "double-ended", "schemaVersion": 1},
            metadata={
                "name": f"{name} · TS initial guess",
                "description": "Created from explicit reactant and product artifacts",
                "workflowRole": "ts-initial-guess",
            },
        )

        input_links = [
            {
                "sourceJobId": reactant_job_id,
                "sourceArtifactId": reactant_artifact.artifact_id,
                "sourceKind": "artifact",
                "sourceName": reactant_artifact.name,
                "targetJobId": target.job_id,
                "targetInputName": "reactant",
            },
            {
                "sourceJobId": product_job_id,
                "sourceArtifactId": product_artifact.artifact_id,
                "sourceKind": "artifact",
                "sourceName": product_artifact.name,
                "targetJobId": target.job_id,
                "targetInputName": "product",
            },
        ]
        try:
            workflow = self.create_workflow(
                name,
                [reactant_job_id, product_job_id, target.job_id],
                input_links,
            )
        except Exception:
            self.delete_job(target.job_id)
            raise
        return workflow, target

    def list_workflows(self) -> list[Workflow]:
        workflows = self.repository.list_workflows()
        for workflow in workflows:
            self._populate_workflow_relations(workflow)
        return workflows

    def get_workflow(self, workflow_id: str) -> Workflow:
        workflow = self.repository.get_workflow(workflow_id)
        if workflow is None:
            raise WorkflowNotFoundError(workflow_id)
        self._populate_workflow_relations(workflow)
        return workflow

    def update_workflow(
        self,
        workflow_id: str,
        name: str,
        job_ids: list[str],
        input_links: list[dict[str, Any]],
    ) -> Workflow:
        if self.repository.get_workflow_execution(workflow_id) is not None:
            raise InvalidJobOperationError(
                "an activated workflow is immutable; create a new workflow revision"
            )
        current = self.get_workflow(workflow_id)
        workflow = self._build_workflow(
            workflow_id,
            _required_text(name, "name"),
            job_ids,
            input_links,
            created_at=current.created_at,
        )
        if not self.repository.update_workflow(workflow):
            raise WorkflowNotFoundError(workflow_id)
        return workflow

    def start_workflow_execution(self, workflow_id: str) -> WorkflowSchedule:
        """Idempotently activate a workflow and reconcile its first runnable nodes."""
        self.get_workflow(workflow_id)
        now = _now()
        execution = WorkflowExecution(
            executionId=f"execution-{secrets.token_hex(8)}",
            workflowId=workflow_id,
            status="active",
            startedAt=now,
            updatedAt=now,
        )
        persisted = self.repository.create_workflow_execution(execution)
        if persisted.status == "cancelled":
            raise InvalidJobOperationError("a cancelled workflow cannot be restarted")
        return self.advance_workflow_execution(workflow_id)

    def get_workflow_schedule(self, workflow_id: str) -> WorkflowSchedule:
        self.get_workflow(workflow_id)
        if self.repository.get_workflow_execution(workflow_id) is None:
            raise InvalidJobOperationError("workflow has not been activated")
        return self.advance_workflow_execution(workflow_id)

    def list_active_workflow_ids(self) -> list[str]:
        return [
            execution.workflow_id
            for execution in self.repository.list_active_workflow_executions()
        ]

    def active_workflow_ids_for_job(self, job_id: str) -> list[str]:
        active = set(self.list_active_workflow_ids())
        return [
            workflow_id
            for workflow_id in self.repository.list_workflow_ids_for_job(job_id)
            if workflow_id in active
        ]

    def block_workflow_execution(
        self, workflow_id: str, *, error_code: str, error_message: str
    ) -> WorkflowSchedule:
        """Record a scheduler-level failure that cannot be represented by a Job."""
        self.get_workflow(workflow_id)
        self.repository.transition_workflow_execution(
            workflow_id,
            expected_status="active",
            next_status="blocked",
            updated_at=_now(),
            error_code=error_code,
            error_message=error_message,
        )
        return self.advance_workflow_execution(workflow_id)

    def cancel_workflow_execution(self, workflow_id: str) -> WorkflowSchedule:
        """Cancel one active DAG without disrupting jobs shared by another active DAG."""
        workflow = self.get_workflow(workflow_id)
        execution = self.repository.get_workflow_execution(workflow_id)
        if execution is None:
            raise InvalidJobOperationError("workflow has not been activated")
        if execution.status == "cancelled":
            return self.advance_workflow_execution(workflow_id)
        if execution.status != "active":
            raise InvalidJobOperationError(
                f"workflow in '{execution.status}' state cannot be cancelled"
            )

        transitioned = self.repository.transition_workflow_execution(
            workflow_id,
            expected_status="active",
            next_status="cancelled",
            updated_at=_now(),
        )
        if not transitioned:
            refreshed = self.repository.get_workflow_execution(workflow_id)
            if refreshed is None or refreshed.status != "cancelled":
                status = refreshed.status if refreshed is not None else "missing"
                raise InvalidJobOperationError(
                    f"workflow in '{status}' state cannot be cancelled"
                )

        for job_id in workflow.job_ids:
            job = self.get_job(job_id)
            if job.status not in {"created", "queued", "running"}:
                continue
            other_active_workflows = [
                active_id
                for active_id in self.active_workflow_ids_for_job(job_id)
                if active_id != workflow_id
            ]
            if other_active_workflows:
                continue
            try:
                self.cancel_job(job_id)
            except InvalidJobOperationError:
                # A worker may have reached a terminal state after the status read.
                pass
        return self.advance_workflow_execution(workflow_id)

    def advance_workflow_execution(self, workflow_id: str) -> WorkflowSchedule:
        """Queue newly unblocked nodes and derive one durable DAG runtime snapshot."""
        workflow = self.get_workflow(workflow_id)
        execution = self.repository.get_workflow_execution(workflow_id)
        if execution is None:
            raise InvalidJobOperationError("workflow has not been activated")

        ordered_job_ids = validate_workflow_dag(
            workflow.job_ids, workflow.input_links
        )
        predecessors = workflow_predecessors(
            workflow.job_ids, workflow.input_links
        )
        jobs = {job_id: self.get_job(job_id) for job_id in ordered_job_ids}
        if execution.status == "cancelled":
            cancelled_nodes: list[WorkflowNodeRuntime] = []
            for job_id in ordered_job_ids:
                job = jobs[job_id]
                if job.status == "cancelled":
                    state = "cancelled"
                elif job.status == "succeeded":
                    state = "succeeded"
                elif job.status in {"failed", "interrupted"}:
                    state = "failed"
                elif job.status == "running":
                    state = "running"
                elif job.status == "queued":
                    state = "queued"
                else:
                    state = "waiting"
                cancelled_nodes.append(
                    WorkflowNodeRuntime(
                        jobId=job_id,
                        jobStatus=job.status,
                        state=state,
                    )
                )
            return WorkflowSchedule(
                execution=execution,
                nodes=cancelled_nodes,
                readyJobIds=[],
            )
        blocked_job_ids: set[str] = set()
        nodes: list[WorkflowNodeRuntime] = []
        ready_job_ids: list[str] = []
        scheduler_error: tuple[str, str] | None = None

        for job_id in ordered_job_ids:
            job = jobs[job_id]
            blocked_by = sorted(
                predecessor
                for predecessor in predecessors[job_id]
                if jobs[predecessor].status
                in {"failed", "cancelled", "interrupted"}
                or predecessor in blocked_job_ids
            )
            if blocked_by:
                blocked_job_ids.add(job_id)
                nodes.append(
                    WorkflowNodeRuntime(
                        jobId=job_id,
                        jobStatus=job.status,
                        state="blocked",
                        blockedBy=blocked_by,
                    )
                )
                continue

            upstream_succeeded = all(
                jobs[predecessor].status == "succeeded"
                for predecessor in predecessors[job_id]
            )
            if job.status == "created" and upstream_succeeded and execution.status == "active":
                try:
                    job = self.queue_calculation_job(
                        job_id,
                        workflow_id=workflow_id,
                        require_active_workflow=True,
                    )
                    jobs[job_id] = job
                except InvalidJobOperationError:
                    refreshed_execution = self.repository.get_workflow_execution(
                        workflow_id
                    )
                    if (
                        refreshed_execution is None
                        or refreshed_execution.status == "active"
                    ):
                        raise
                    return self.advance_workflow_execution(workflow_id)
                except (InvalidJobInputError, InvalidJobTransitionError) as exc:
                    refreshed = self.get_job(job_id)
                    jobs[job_id] = refreshed
                    job = refreshed
                    if job.status == "created":
                        blocked_job_ids.add(job_id)
                        scheduler_error = (
                            "workflow_input_unresolved",
                            f"Job '{job_id}' could not freeze workflow inputs: {exc}",
                        )
                        nodes.append(
                            WorkflowNodeRuntime(
                                jobId=job_id,
                                jobStatus=job.status,
                                state="blocked",
                            )
                        )
                        continue

            if job.status == "succeeded":
                state = "succeeded"
            elif job.status in {"failed", "cancelled", "interrupted"}:
                state = "failed"
            elif job.status == "running":
                state = "running"
            elif job.status == "queued" and upstream_succeeded:
                dispatch = self.repository.get_job_dispatch(job_id)
                if dispatch is None:
                    state = "ready"
                    if execution.status == "active":
                        ready_job_ids.append(job_id)
                elif dispatch.status in {"pending", "leased"}:
                    state = "queued"
                else:
                    state = "blocked"
                    blocked_job_ids.add(job_id)
                    scheduler_error = (
                        "workflow_dispatch_finished_early",
                        f"Job '{job_id}' is queued but its dispatch is already finished",
                    )
            else:
                state = "waiting"
            nodes.append(
                WorkflowNodeRuntime(
                    jobId=job_id,
                    jobStatus=job.status,
                    state=state,
                )
            )

        if execution.status == "active":
            if all(node.state == "succeeded" for node in nodes):
                self.repository.transition_workflow_execution(
                    workflow_id,
                    expected_status="active",
                    next_status="succeeded",
                    updated_at=_now(),
                )
            else:
                has_viable_work = any(
                    node.state in {"waiting", "ready", "queued", "running"}
                    for node in nodes
                )
                has_failure = any(
                    node.state in {"failed", "blocked"} for node in nodes
                )
                if has_failure and not has_viable_work:
                    code, message = scheduler_error or (
                        "workflow_dependency_failed",
                        "One or more workflow dependencies failed",
                    )
                    self.repository.transition_workflow_execution(
                        workflow_id,
                        expected_status="active",
                        next_status="blocked",
                        updated_at=_now(),
                        error_code=code,
                        error_message=message,
                    )

        refreshed_execution = self.repository.get_workflow_execution(workflow_id)
        if refreshed_execution is None:
            raise RuntimeError("workflow execution disappeared during reconciliation")
        if refreshed_execution.status != "active":
            ready_job_ids = []
        return WorkflowSchedule(
            execution=refreshed_execution,
            nodes=nodes,
            readyJobIds=ready_job_ids,
        )

    def add_input(
        self,
        job_id: str,
        name: str,
        value: Any,
        *,
        metadata: dict[str, Any] | None = None,
    ) -> JobInput:
        self._assert_legacy_inputs_mutable(job_id)
        job_input = JobInput(
            input_id=f"input-{secrets.token_hex(8)}",
            job_id=job_id,
            name=_required_text(name, "name"),
            value=value,
            metadata=metadata or {},
            created_at=_now(),
        )
        self.repository.add_input(job_input)
        self._touch_job(job_id)
        self._write_snapshot(self._require_job(job_id))
        return job_input

    def _assert_legacy_inputs_mutable(self, job_id: str) -> None:
        """Keep the legacy input route away from frozen calculation snapshots."""
        job = self._require_job(job_id)
        if job.spec_id is not None or job.input_snapshots:
            raise InvalidJobOperationError(
                "calculation inputs are immutable; copy the job to change them"
            )

    def add_artifact(
        self,
        job_id: str,
        name: str,
        path: str,
        *,
        media_type: str | None = None,
        metadata: dict[str, Any] | None = None,
        run_id: str | None = None,
    ) -> Artifact:
        self._require_job(job_id)
        if run_id is not None:
            run = self.get_job_run(run_id)
            if run.job_id != job_id:
                raise InvalidJobOperationError(
                    f"JobRun '{run_id}' does not belong to Job '{job_id}'"
                )
        artifact = Artifact(
            artifact_id=f"artifact-{secrets.token_hex(8)}",
            job_id=job_id,
            run_id=run_id,
            name=_required_text(name, "name"),
            path=_required_text(path, "path"),
            **self._artifact_identity(job_id, path),
            kind=_artifact_kind((metadata or {}).get("format")),
            role=str((metadata or {}).get("role") or "output"),
            format=str((metadata or {}).get("format") or _path_format(path)),
            media_type=media_type,
            metadata=metadata or {},
            created_at=_now(),
        )
        artifact = self.repository.add_artifact(artifact)
        self._touch_job(job_id)
        self._write_snapshot(self._require_job(job_id))
        return artifact

    def update_status(
        self,
        job_id: str,
        status: str,
        *,
        error: str | None = None,
        error_code: str | None = None,
    ) -> Job:
        current = self._require_job(job_id)
        next_status = _normalize_status(status)
        if next_status not in _ALLOWED_TRANSITIONS[current.status]:
            raise InvalidJobTransitionError(
                f"Job '{job_id}' cannot transition from '{current.status}' to '{next_status}'"
            )
        updated = self.repository.transition_status(
            job_id,
            (current.status,),
            next_status,
            _now(),
            error_code,
            error,
        )
        if not updated:
            raise JobNotFoundError(job_id)
        job = self._require_job(job_id)
        self._write_snapshot(job)
        return job

    def claim_queued_job(self, job_id: str) -> Job | None:
        """Atomically claim a queued job for one runner process."""
        job = self._require_job(job_id)
        engine, collector_id, collector_version = self._execution_descriptor(job)
        now = _now()
        run = JobRun(
            runId=f"run-{secrets.token_hex(8)}",
            jobId=job_id,
            runNumber=len(self.repository.list_job_runs(job_id)) + 1,
            engine=engine,
            status="running",
            collectorId=collector_id,
            collectorVersion=collector_version,
            metadata={},
            startedAt=now,
        )
        if not self.repository.claim_job_run(run):
            return None
        job = self._require_job(job_id)
        self._write_snapshot(job)
        return job

    def get_active_job_run(self, job_id: str) -> JobRun:
        self._require_job(job_id)
        run = self.repository.get_active_job_run(job_id)
        if run is None:
            raise InvalidJobOperationError(
                f"Job '{job_id}' has no active execution run"
            )
        return run

    @staticmethod
    def _job_type_version(job_type: str) -> int:
        try:
            return JOB_TYPE_REGISTRY.resolve(job_type).job_type_version
        except UnknownJobTypeError:
            return 1

    @staticmethod
    def _normalize_job_type_data(
        job_type: str,
        raw_data: Mapping[str, Any],
    ) -> dict[str, Any]:
        """Delegate creation validation to the exact registered JobType."""
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

    def _execution_descriptor(
        self, job: Job
    ) -> tuple[str, str | None, int | None]:
        try:
            handler = JOB_TYPE_REGISTRY.resolve(job.task_type)
            return (
                handler.engine_id,
                handler.collector_id,
                handler.collector_version,
            )
        except UnknownJobTypeError:
            spec = (
                self.repository.get_calculation_spec(job.spec_id)
                if job.spec_id is not None
                else None
            )
            return (spec.engine if spec is not None else "unknown", None, None)

    def request_job_dispatch(self, job_id: str, *, max_inflight: int) -> bool:
        """Persist an idempotent execution request for one queued job."""
        job = self._require_job(job_id)
        if job.status != "queued":
            raise InvalidJobOperationError(
                f"Job '{job_id}' has status '{job.status}'; only queued jobs can run"
            )
        now = _now()
        dispatch = JobDispatch(
            dispatch_id=f"dispatch-{secrets.token_hex(8)}",
            job_id=job_id,
            status="pending",
            requested_at=now,
            available_at=now,
        )
        return self.repository.request_job_dispatch(
            dispatch,
            max_inflight=max_inflight,
        )

    def claim_next_dispatch(
        self,
        *,
        worker_id: str,
        lease_token: str,
        lease_seconds: float,
    ) -> JobDispatch | None:
        """Recover stale work, then lease the next queued execution request."""
        self.recover_stale_executions()
        now = _now()
        return self.repository.claim_next_dispatch(
            lease_owner=worker_id,
            lease_token=lease_token,
            now=now,
            lease_expires_at=now + timedelta(seconds=lease_seconds),
        )

    def recover_stale_executions(self) -> list[Job]:
        """Interrupt expired or legacy running jobs without a live worker lease."""
        now = _now()
        self.repository.recover_expired_dispatches(now)
        recovered_jobs: list[Job] = []
        for job_id in self.repository.list_unleased_running_job_ids(now):
            if not self.repository.transition_status(
                job_id,
                ("running",),
                "interrupted",
                now,
                "worker_lease_expired",
                "worker lease expired while the calculation was running",
            ):
                continue
            recovered = self.get_job(job_id)
            self._write_snapshot(recovered)
            recovered_jobs.append(recovered)
        return recovered_jobs

    def renew_dispatch_lease(
        self,
        job_id: str,
        lease_token: str,
        *,
        lease_seconds: float,
    ) -> bool:
        now = _now()
        return self.repository.renew_dispatch_lease(
            job_id,
            lease_token,
            heartbeat_at=now,
            lease_expires_at=now + timedelta(seconds=lease_seconds),
        )

    def finish_job_dispatch(
        self,
        job_id: str,
        lease_token: str,
        *,
        last_error: str | None = None,
    ) -> bool:
        return self.repository.finish_job_dispatch(
            job_id,
            lease_token,
            finished_at=_now(),
            last_error=last_error,
        )

    def dispatch_counts(self) -> dict[str, int]:
        return self.repository.dispatch_counts()

    def interrupt_running_jobs(self, reason: str) -> list[Job]:
        """Mark runs left active by a previous backend process as interrupted."""
        interrupted: list[Job] = []
        for job in self.repository.list_jobs():
            if job.status != "running":
                continue
            if not self.repository.transition_status(
                job.job_id,
                ("running",),
                "interrupted",
                _now(),
                "backend_restart",
                reason,
            ):
                continue
            recovered = self.get_job(job.job_id)
            self._write_snapshot(recovered)
            interrupted.append(recovered)
        return interrupted

    def _artifact_identity(self, job_id: str, path: str) -> dict[str, Any]:
        candidate = (self.tasks_root / job_id / path).resolve()
        task_root = (self.tasks_root / job_id).resolve()
        if task_root not in candidate.parents or not candidate.is_file():
            return {}
        published = self.artifact_storage.publish_file(candidate)
        return {
            "storage_key": published["storageKey"],
            "sha256": published["sha256"],
            "byte_size": published["byteSize"],
        }

    def task_directory(self, job_id: str) -> Path:
        """Return the on-disk directory for a persisted job, creating it if needed."""
        self._require_job(job_id)
        directory = self.tasks_root / job_id
        directory.mkdir(parents=True, exist_ok=True)
        return directory

    def job_directory(self, job_id: str) -> Path:
        """Alias for task_directory() used by job-oriented callers."""
        return self.task_directory(job_id)

    def _require_job(self, job_id: str) -> Job:
        return self.get_job(job_id)

    def _populate_relations(self, job: Job) -> None:
        job.inputs = self.repository.get_inputs(job.job_id)
        job.input_snapshots = self.repository.list_job_input_snapshots(job.job_id)
        job.artifacts = self.repository.get_artifacts(job.job_id)

    def _copy_input_definitions(self, source: Job) -> dict[str, dict[str, Any]]:
        return self.input_resolver.copy_definitions(source)

    def _build_input_snapshots(
        self,
        job_id: str,
        calculation_kind: str,
        definitions: Mapping[str, Any],
        created_at: datetime,
    ) -> list[JobInputSnapshot]:
        return self.input_resolver.build_snapshots(
            job_id, calculation_kind, definitions, created_at
        )

    def _resolve_workflow_input_definitions(
        self, workflow_id: str, target_job_id: str
    ) -> dict[str, dict[str, Any]]:
        return self.input_resolver.resolve_workflow_definitions(
            workflow_id, target_job_id
        )

    def _populate_workflow_relations(self, workflow: Workflow) -> None:
        workflow.job_ids = self.repository.get_workflow_job_ids(workflow.workflow_id)
        workflow.input_links = self.repository.get_workflow_input_links(
            workflow.workflow_id
        )

    def _build_workflow(
        self,
        workflow_id: str,
        name: str,
        job_ids: list[str],
        input_link_definitions: list[dict[str, Any]],
        *,
        created_at: datetime | None = None,
    ) -> Workflow:
        for job_id in job_ids:
            self._require_job(job_id)
        now = _now()
        input_links = [
            WorkflowInputLink(
                link_id=_new_input_link_id(),
                workflow_id=workflow_id,
                target_job_id=definition["targetJobId"],
                target_input_name=_required_text(
                    definition["targetInputName"], "targetInputName"
                ),
                source_job_id=definition["sourceJobId"],
                source_artifact_id=definition.get("sourceArtifactId"),
                source_kind=definition["sourceKind"],
                source_name=_required_text(
                    definition.get("sourceName") or "artifact", "sourceName"
                ),
                created_at=now,
            )
            for definition in input_link_definitions
        ]
        for link in input_links:
            self._validate_workflow_input_link_source(link)
        validate_workflow_dag(job_ids, input_links)
        return Workflow(
            workflow_id=workflow_id,
            name=name,
            created_at=created_at or now,
            updated_at=now,
            job_ids=job_ids,
            input_links=input_links,
        )

    def _validate_workflow_input_link_source(self, link: WorkflowInputLink) -> None:
        self._require_job(link.source_job_id)
        if link.source_artifact_id is None:
            return
        artifact = next(
            (
                item
                for item in self.repository.get_artifacts(link.source_job_id)
                if item.artifact_id == link.source_artifact_id
            ),
            None,
        )
        if artifact is None:
            raise ValueError(
                f"Artifact '{link.source_artifact_id}' does not belong to job "
                f"'{link.source_job_id}'"
            )

    def _require_workflow_structure_artifact(
        self, job_id: str, artifact_id: str, role: str
    ) -> Artifact:
        job = self.get_job(job_id)
        if job.status != "succeeded":
            raise InvalidJobInputError(
                f"{role.capitalize()} job '{job_id}' must be succeeded"
            )
        artifact = next(
            (item for item in job.artifacts if item.artifact_id == artifact_id), None
        )
        if artifact is None:
            raise InvalidJobInputError(
                f"{role.capitalize()} artifact '{artifact_id}' does not belong to job '{job_id}'"
            )
        if artifact.format.lower() not in {"retainmol-json", "xyz", "sdf", "mol"}:
            raise InvalidJobInputError(
                f"{role.capitalize()} artifact must be a molecular structure"
            )
        if artifact.role != "output":
            raise InvalidJobInputError(
                f"{role.capitalize()} artifact must be an output artifact"
            )
        if not artifact.sha256:
            raise InvalidJobInputError(
                f"{role.capitalize()} artifact has no immutable content digest"
            )
        return artifact

    def _touch_job(self, job_id: str) -> None:
        if not self.repository.touch_job(job_id, _now()):
            raise JobNotFoundError(job_id)

    def _write_snapshot(self, job: Job) -> None:
        directory = self.tasks_root / job.job_id
        directory.mkdir(parents=True, exist_ok=True)
        snapshot_path = directory / "job.json"
        temporary_path = directory / ".job.json.tmp"
        temporary_path.write_text(
            json.dumps(
                job.model_dump(mode="json", by_alias=True),
                ensure_ascii=True,
                indent=2,
                sort_keys=True,
            )
            + "\n",
            encoding="utf-8",
        )
        temporary_path.replace(snapshot_path)


def _now() -> datetime:
    return datetime.now(UTC)


def _new_job_id(now: datetime) -> str:
    return f"{now:%Y%m%d}-{secrets.token_hex(4)}"


def _new_workflow_id() -> str:
    return f"workflow-{secrets.token_hex(8)}"


def _new_input_link_id() -> str:
    return f"reference-{secrets.token_hex(8)}"


def _job_type_payload(metadata: Mapping[str, Any]) -> dict[str, Any]:
    request = metadata.get("request")
    return dict(request) if isinstance(request, Mapping) else {}


def _required_text(value: str, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} must be a non-empty string")
    return value


def _normalize_status(value: str) -> JobStatus:
    normalized = "succeeded" if value == "completed" else value
    if normalized not in _ALLOWED_TRANSITIONS:
        raise ValueError(f"Unsupported job status: {value}")
    return normalized  # type: ignore[return-value]


def _path_format(path: str) -> str:
    suffix = Path(path).suffix.lower().lstrip(".")
    return suffix or "file"


def _artifact_kind(format_name: Any) -> str:
    normalized = str(format_name or "").lower()
    if normalized in {"xyz", "sdf", "mol", "retainmol-json"}:
        return "structure"
    if normalized in {"cube"}:
        return "volumetric-grid"
    if normalized in {"molden"}:
        return "wavefunction"
    if normalized in {"png", "jpg", "jpeg", "webp"}:
        return "image"
    if normalized in {"log", "out"}:
        return "log"
    if normalized in {"trajectory-json"}:
        return "trajectory"
    return "file"
