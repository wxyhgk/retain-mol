"""Route-facing job persistence service."""

from __future__ import annotations

import os
from collections.abc import Mapping
from pathlib import Path
from typing import Any

from .artifact_manager import ArtifactManager
from .artifact_storage import ArtifactStorage
from .dispatching import JobDispatchCoordinator
from .input_resolution import JobInputResolver
from .lifecycle import JobLifecycle
from .models import (
    Artifact,
    CalculationSpec,
    Job,
    JobDispatch,
    JobInput,
    JobInputSnapshot,
    JobRun,
    JobTypeData,
    MoleculeAsset,
    MoleculeRevision,
    Workflow,
    WorkflowSchedule,
)
from .repository import JobRepository
from .job_creation import JobCreationManager
from .job_operations import JobOperationsManager
from .job_queries import JobQueryManager
from .job_runtime import JobRuntimeManager
from .job_workspace import JobWorkspace
from .legacy_inputs import LegacyJobInputManager
from .molecule_assets import MoleculeAssetManager
from .workflow_definitions import WorkflowDefinitionManager
from .workflow_runtime import WorkflowRuntimeCoordinator
from .workflow_templates import WorkflowTemplateManager

DEFAULT_DATA_ROOT = Path(
    os.getenv(
        "RETAINMOL_DATA_ROOT",
        str(Path(__file__).resolve().parents[1] / "data"),
    )
)


class JobService:
    """Stable route-facing facade over focused Job domain managers."""

    def __init__(self, data_root: str | Path | None = None) -> None:
        self.data_root = Path(data_root) if data_root is not None else DEFAULT_DATA_ROOT
        self.data_root.mkdir(parents=True, exist_ok=True)
        self.workspace = JobWorkspace(self.data_root)
        self.artifact_storage = ArtifactStorage(self.data_root)
        self.repository = JobRepository(self.data_root / "retainmol.sqlite")
        self.job_queries = JobQueryManager(self.repository)
        self.artifact_manager = ArtifactManager(
            self.repository,
            self.artifact_storage,
            self.workspace,
            self.job_queries.get,
        )
        self.molecule_assets = MoleculeAssetManager(self.repository)
        self.input_resolver = JobInputResolver(self.repository)
        self.job_creation = JobCreationManager(
            self.repository,
            self.input_resolver,
            self.workspace,
            self.job_queries.get,
        )
        self.lifecycle = JobLifecycle(self.repository)
        self.job_operations = JobOperationsManager(
            self.repository,
            self.lifecycle,
            self.workspace,
            self.input_resolver,
            self.job_queries.get,
            self.job_creation.create_calculation_job,
        )
        self.dispatches = JobDispatchCoordinator(self.repository, self.lifecycle)
        self.job_runtime = JobRuntimeManager(
            self.repository,
            self.lifecycle,
            self.dispatches,
            self.workspace,
            self.job_queries.get,
        )
        self.legacy_inputs = LegacyJobInputManager(
            self.repository,
            self.workspace,
            self.job_queries.get,
        )
        self.workflow_definitions = WorkflowDefinitionManager(
            self.repository,
            self.job_queries,
        )
        self.workflow_templates = WorkflowTemplateManager(
            self.workflow_definitions,
            self.job_creation.create_calculation_draft,
            self.job_operations.delete,
        )
        self.workflow_runtime = WorkflowRuntimeCoordinator(
            self.repository,
            self.job_queries.get,
            self.job_creation.queue_calculation_job,
            self.job_operations.cancel,
        )

    def create_molecule_asset(
        self, name: str, *, metadata: dict[str, Any] | None = None
    ) -> MoleculeAsset:
        return self.molecule_assets.create(name, metadata=metadata)

    def list_molecule_assets(self) -> list[MoleculeAsset]:
        return self.molecule_assets.list()

    def get_molecule_asset(self, asset_id: str) -> MoleculeAsset:
        return self.molecule_assets.get(asset_id)

    def get_molecule_revision(self, revision_id: str) -> MoleculeRevision:
        return self.molecule_assets.get_revision(revision_id)

    def list_molecule_revisions(self, asset_id: str) -> list[MoleculeRevision]:
        return self.molecule_assets.list_revisions(asset_id)

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
        return self.molecule_assets.save_revision(
            asset_id,
            molecule,
            parent_revision_id=parent_revision_id,
            expected_head_revision_id=expected_head_revision_id,
            expected_version=expected_version,
            content_hash=content_hash,
            topology_fingerprint=topology_fingerprint,
            metadata=metadata,
        )

    def create_job(
        self,
        task_type: str | Mapping[str, Any],
        *,
        metadata: dict[str, Any] | None = None,
        status: str = "queued",
    ) -> Job:
        return self.job_creation.create_job(task_type, metadata=metadata, status=status)

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
        return self.job_creation.create_calculation_job(
            kind,
            engine,
            payload,
            inputs=inputs,
            metadata=metadata,
            supersedes_job_id=supersedes_job_id,
        )

    def create_calculation_draft(
        self,
        kind: str,
        engine: str,
        payload: Mapping[str, Any],
        *,
        metadata: dict[str, Any] | None = None,
    ) -> Job:
        return self.job_creation.create_calculation_draft(
            kind, engine, payload, metadata=metadata
        )

    def queue_calculation_job(
        self,
        job_id: str,
        inputs: Mapping[str, Any] | None = None,
        *,
        workflow_id: str | None = None,
        require_active_workflow: bool = False,
    ) -> Job:
        return self.job_creation.queue_calculation_job(
            job_id,
            inputs,
            workflow_id=workflow_id,
            require_active_workflow=require_active_workflow,
        )

    def get_calculation_spec(self, job_id: str) -> CalculationSpec | None:
        return self.job_queries.get_calculation_spec(job_id)

    def get_input_snapshots(self, job_id: str) -> list[JobInputSnapshot]:
        return self.job_queries.get_input_snapshots(job_id)

    def get_job_type_data(self, job_id: str) -> JobTypeData:
        return self.job_queries.get_job_type_data(job_id)

    def list_job_runs(self, job_id: str) -> list[JobRun]:
        return self.job_runtime.list_runs(job_id)

    def get_job_run(self, run_id: str) -> JobRun:
        return self.job_runtime.get_run(run_id)

    def list_jobs(self) -> list[Job]:
        return self.job_queries.list()

    def get_job(self, job_id: str) -> Job:
        return self.job_queries.get(job_id)

    def update_job(self, job_id: str, changes: Mapping[str, Any]) -> Job:
        return self.job_operations.update(job_id, changes)

    def clone_job(self, job_id: str, *, name: str | None = None) -> Job:
        return self.job_operations.clone(job_id, name=name)

    def retry_job(self, job_id: str, *, name: str | None = None) -> Job:
        return self.job_operations.retry(job_id, name=name)

    def cancel_job(self, job_id: str) -> Job:
        return self.job_operations.cancel(job_id)

    def read_job_log(
        self,
        job_id: str,
        *,
        cursor: int = 0,
        limit: int = 128 * 1024,
    ) -> dict[str, Any]:
        """Read an incremental UTF-8 log chunk without exposing task paths."""
        job = self.get_job(job_id)
        return self.workspace.read_log(job, cursor=cursor, limit=limit)

    def delete_job(self, job_id: str) -> None:
        self.job_operations.delete(job_id)

    def add_inputs(self, job_id: str, inputs: Mapping[str, Any]) -> Job:
        """Add a batch of named inputs, as submitted by the jobs HTTP route."""
        return self.legacy_inputs.add_many(job_id, inputs)

    def list_artifacts(self, job_id: str) -> list[Artifact]:
        """Return every artifact registered for a job."""
        return self.artifact_manager.list(job_id)

    def get_artifact(self, artifact_id: str) -> Artifact:
        return self.artifact_manager.get(artifact_id)

    def create_workflow(
        self,
        name: str,
        job_ids: list[str],
        input_links: list[dict[str, Any]],
    ) -> Workflow:
        """Persist a dependency graph after validating every referenced job."""
        return self.workflow_definitions.create(name, job_ids, input_links)

    def create_ts_preparation_workflow(
        self,
        name: str,
        reactant_job_id: str,
        reactant_artifact_id: str,
        product_job_id: str,
        product_artifact_id: str,
    ) -> tuple[Workflow, Job]:
        """Create the first fixed workflow: two optimized endpoints into a TS draft."""
        return self.workflow_templates.create_ts_preparation(
            name,
            reactant_job_id,
            reactant_artifact_id,
            product_job_id,
            product_artifact_id,
        )

    def list_workflows(self) -> list[Workflow]:
        return self.workflow_definitions.list()

    def get_workflow(self, workflow_id: str) -> Workflow:
        return self.workflow_definitions.get(workflow_id)

    def update_workflow(
        self,
        workflow_id: str,
        name: str,
        job_ids: list[str],
        input_links: list[dict[str, Any]],
    ) -> Workflow:
        return self.workflow_definitions.update(
            workflow_id,
            name,
            job_ids,
            input_links,
        )

    def start_workflow_execution(self, workflow_id: str) -> WorkflowSchedule:
        """Idempotently activate a workflow and reconcile its first runnable nodes."""
        return self.workflow_runtime.start(self.get_workflow(workflow_id))

    def get_workflow_schedule(self, workflow_id: str) -> WorkflowSchedule:
        return self.workflow_runtime.get_schedule(self.get_workflow(workflow_id))

    def list_active_workflow_ids(self) -> list[str]:
        return self.workflow_runtime.list_active_workflow_ids()

    def active_workflow_ids_for_job(self, job_id: str) -> list[str]:
        return self.workflow_runtime.active_workflow_ids_for_job(job_id)

    def block_workflow_execution(
        self, workflow_id: str, *, error_code: str, error_message: str
    ) -> WorkflowSchedule:
        """Record a scheduler-level failure that cannot be represented by a Job."""
        return self.workflow_runtime.block(
            self.get_workflow(workflow_id),
            error_code=error_code,
            error_message=error_message,
        )

    def cancel_workflow_execution(self, workflow_id: str) -> WorkflowSchedule:
        """Cancel one active DAG without disrupting jobs shared by another active DAG."""
        return self.workflow_runtime.cancel(self.get_workflow(workflow_id))

    def advance_workflow_execution(self, workflow_id: str) -> WorkflowSchedule:
        """Queue newly unblocked nodes and derive one durable DAG runtime snapshot."""
        return self.workflow_runtime.advance(self.get_workflow(workflow_id))

    def add_input(
        self,
        job_id: str,
        name: str,
        value: Any,
        *,
        metadata: dict[str, Any] | None = None,
    ) -> JobInput:
        return self.legacy_inputs.add(
            job_id,
            name,
            value,
            metadata=metadata,
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
        artifact = self.artifact_manager.add(
            job_id,
            name,
            path,
            media_type=media_type,
            metadata=metadata,
            run_id=run_id,
        )
        return artifact

    def update_status(
        self,
        job_id: str,
        status: str,
        *,
        error: str | None = None,
        error_code: str | None = None,
    ) -> Job:
        return self.job_runtime.update_status(
            job_id,
            status,
            error=error,
            error_code=error_code,
        )

    def claim_queued_job(self, job_id: str) -> Job | None:
        return self.job_runtime.claim_queued_job(job_id)

    def get_active_job_run(self, job_id: str) -> JobRun:
        return self.job_runtime.get_active_run(job_id)

    def request_job_dispatch(self, job_id: str, *, max_inflight: int) -> bool:
        return self.job_runtime.request_dispatch(job_id, max_inflight=max_inflight)

    def claim_next_dispatch(
        self,
        *,
        worker_id: str,
        lease_token: str,
        lease_seconds: float,
    ) -> JobDispatch | None:
        return self.job_runtime.claim_next_dispatch(
            worker_id=worker_id,
            lease_token=lease_token,
            lease_seconds=lease_seconds,
        )

    def recover_stale_executions(self) -> list[Job]:
        return self.job_runtime.recover_stale_executions()

    def renew_dispatch_lease(
        self,
        job_id: str,
        lease_token: str,
        *,
        lease_seconds: float,
    ) -> bool:
        return self.job_runtime.renew_dispatch_lease(
            job_id,
            lease_token,
            lease_seconds=lease_seconds,
        )

    def finish_job_dispatch(
        self,
        job_id: str,
        lease_token: str,
        *,
        last_error: str | None = None,
    ) -> bool:
        return self.job_runtime.finish_dispatch(
            job_id,
            lease_token,
            last_error=last_error,
        )

    def dispatch_counts(self) -> dict[str, int]:
        return self.job_runtime.dispatch_counts()

    def interrupt_running_jobs(self, reason: str) -> list[Job]:
        return self.job_runtime.interrupt_running_jobs(reason)

    def task_directory(self, job_id: str) -> Path:
        """Return the on-disk directory for a persisted job, creating it if needed."""
        self._require_job(job_id)
        return self.workspace.directory(job_id)

    def job_directory(self, job_id: str) -> Path:
        """Alias for task_directory() used by job-oriented callers."""
        return self.task_directory(job_id)

    def _require_job(self, job_id: str) -> Job:
        return self.get_job(job_id)
