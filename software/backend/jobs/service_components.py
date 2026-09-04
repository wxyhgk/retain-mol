"""Typed component contract for the route-facing job service."""

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
        for component_field in fields(components):
            setattr(
                self,
                component_field.name,
                getattr(components, component_field.name),
            )
