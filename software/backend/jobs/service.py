"""Route-facing job persistence service."""

from __future__ import annotations

import os
from pathlib import Path

from .artifact_manager import ArtifactManager
from .artifact_storage import ArtifactStorage
from .dispatching import JobDispatchCoordinator
from .input_resolution import JobInputResolver
from .lifecycle import JobLifecycle
from .repository import JobRepository
from .job_creation import JobCreationManager
from .job_operations import JobOperationsManager
from .job_queries import JobQueryManager
from .job_runtime import JobRuntimeManager
from .job_submission import JobSubmissionManager
from .job_workspace import JobWorkspace
from .legacy_inputs import LegacyJobInputManager
from .molecule_assets import MoleculeAssetManager
from .service_jobs import JobServiceApi
from .service_molecules import MoleculeServiceApi
from .service_workflows import WorkflowServiceApi
from .workflow_definitions import WorkflowDefinitionManager
from .workflow_runtime import WorkflowRuntimeCoordinator
from .workflow_templates import WorkflowTemplateManager

DEFAULT_DATA_ROOT = Path(
    os.getenv(
        "RETAINMOL_DATA_ROOT",
        str(Path(__file__).resolve().parents[1] / "data"),
    )
)


class JobService(MoleculeServiceApi, JobServiceApi, WorkflowServiceApi):
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
        self.job_submission = JobSubmissionManager(
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
            self.job_submission.queue_calculation_job,
            self.job_operations.cancel,
        )
