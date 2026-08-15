"""Dependency composition for the route-facing job service."""

from __future__ import annotations

from dataclasses import dataclass, fields
from pathlib import Path
from .artifact_manager import ArtifactManager
from .artifact_storage import ArtifactStorage
from .dispatching import JobDispatchCoordinator
from .input_resolution import JobInputResolver
from .job_creation import JobCreationManager
from .job_operations import JobOperationsManager
from .job_queries import JobQueryManager
from .job_runtime import JobRuntimeManager
from .job_submission import JobSubmissionManager
from .job_workspace import JobWorkspace
from .legacy_inputs import LegacyJobInputManager
from .lifecycle import JobLifecycle
from .molecule_assets import MoleculeAssetManager
from .repository import JobRepository
from .workflow_definitions import WorkflowDefinitionManager
from .workflow_runtime import WorkflowRuntimeCoordinator
from .workflow_templates import WorkflowTemplateManager


@dataclass(frozen=True)
class JobServiceComponents:
    """Concrete managers owned by one :class:`JobService` instance."""

    data_root: Path
    workspace: JobWorkspace
    artifact_storage: ArtifactStorage
    repository: JobRepository
    job_queries: JobQueryManager
    artifact_manager: ArtifactManager
    molecule_assets: MoleculeAssetManager
    input_resolver: JobInputResolver
    job_creation: JobCreationManager
    job_submission: JobSubmissionManager
    lifecycle: JobLifecycle
    job_operations: JobOperationsManager
    dispatches: JobDispatchCoordinator
    job_runtime: JobRuntimeManager
    legacy_inputs: LegacyJobInputManager
    workflow_definitions: WorkflowDefinitionManager
    workflow_templates: WorkflowTemplateManager
    workflow_runtime: WorkflowRuntimeCoordinator


class JobServiceComponentAccess:
    """Typed component attributes shared by the service capability mixins."""

    data_root: Path
    workspace: JobWorkspace
    artifact_storage: ArtifactStorage
    repository: JobRepository
    job_queries: JobQueryManager
    artifact_manager: ArtifactManager
    molecule_assets: MoleculeAssetManager
    input_resolver: JobInputResolver
    job_creation: JobCreationManager
    job_submission: JobSubmissionManager
    lifecycle: JobLifecycle
    job_operations: JobOperationsManager
    dispatches: JobDispatchCoordinator
    job_runtime: JobRuntimeManager
    legacy_inputs: LegacyJobInputManager
    workflow_definitions: WorkflowDefinitionManager
    workflow_templates: WorkflowTemplateManager
    workflow_runtime: WorkflowRuntimeCoordinator

    def _bind_components(self, components: JobServiceComponents) -> None:
        for field in fields(components):
            setattr(self, field.name, getattr(components, field.name))


def build_job_service_components(data_root: Path) -> JobServiceComponents:
    """Build one internally consistent graph of Job domain managers."""

    data_root.mkdir(parents=True, exist_ok=True)
    workspace = JobWorkspace(data_root)
    artifact_storage = ArtifactStorage(data_root)
    repository = JobRepository(data_root / "retainmol.sqlite")
    job_queries = JobQueryManager(repository)
    artifact_manager = ArtifactManager(
        repository,
        artifact_storage,
        workspace,
        job_queries.get,
    )
    molecule_assets = MoleculeAssetManager(repository)
    input_resolver = JobInputResolver(repository)
    job_creation = JobCreationManager(
        repository,
        input_resolver,
        workspace,
        job_queries.get,
    )
    job_submission = JobSubmissionManager(
        repository,
        input_resolver,
        workspace,
        job_queries.get,
    )
    lifecycle = JobLifecycle(repository)
    job_operations = JobOperationsManager(
        repository,
        lifecycle,
        workspace,
        input_resolver,
        job_queries.get,
        job_creation.create_calculation_job,
    )
    dispatches = JobDispatchCoordinator(repository, lifecycle)
    job_runtime = JobRuntimeManager(
        repository,
        lifecycle,
        dispatches,
        workspace,
        job_queries.get,
    )
    legacy_inputs = LegacyJobInputManager(
        repository,
        workspace,
        job_queries.get,
    )
    workflow_definitions = WorkflowDefinitionManager(repository, job_queries)
    workflow_templates = WorkflowTemplateManager(
        workflow_definitions,
        job_creation.create_calculation_draft,
        job_operations.delete,
    )
    workflow_runtime = WorkflowRuntimeCoordinator(
        repository,
        job_queries.get,
        job_submission.queue_calculation_job,
        job_operations.cancel,
    )

    return JobServiceComponents(
        data_root=data_root,
        workspace=workspace,
        artifact_storage=artifact_storage,
        repository=repository,
        job_queries=job_queries,
        artifact_manager=artifact_manager,
        molecule_assets=molecule_assets,
        input_resolver=input_resolver,
        job_creation=job_creation,
        job_submission=job_submission,
        lifecycle=lifecycle,
        job_operations=job_operations,
        dispatches=dispatches,
        job_runtime=job_runtime,
        legacy_inputs=legacy_inputs,
        workflow_definitions=workflow_definitions,
        workflow_templates=workflow_templates,
        workflow_runtime=workflow_runtime,
    )
