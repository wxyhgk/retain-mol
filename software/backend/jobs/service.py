"""Route-facing job persistence service."""

from __future__ import annotations

import hashlib
import json
import secrets
import sqlite3
from collections.abc import Mapping
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from .artifact_storage import ArtifactStorage
from .input_contracts import validate_calculation_inputs
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
    JobInput,
    JobInputBinding,
    JobInputReference,
    JobStatus,
    MoleculeAsset,
    MoleculeRevision,
    Workflow,
)
from .repository import JobRepository
from .workflows import validate_workflow_dag

DEFAULT_DATA_ROOT = Path(__file__).resolve().parents[1] / "data"


class JobNotFoundError(KeyError):
    """Raised when an operation targets a job that is not persisted."""


class WorkflowNotFoundError(KeyError):
    """Raised when an operation targets a workflow that is not persisted."""


class InvalidJobTransitionError(ValueError):
    """Raised when a job lifecycle operation would violate the state machine."""


class InvalidJobInputError(ValueError):
    """Raised when calculation inputs cannot be frozen safely."""


class MoleculeAssetNotFoundError(KeyError):
    """Raised when a molecule asset id has no persisted aggregate."""


class MoleculeRevisionNotFoundError(KeyError):
    """Raised when a molecule revision id has no immutable snapshot."""


class MoleculeHeadConflictError(RuntimeError):
    """Raised when optimistic head/version expectations are stale."""

    def __init__(self, asset: MoleculeAsset) -> None:
        self.asset = asset
        super().__init__(f"Molecule asset '{asset.asset_id}' head changed")


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
            try:
                self.repository.create_job(job)
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
    ) -> Job:
        """Atomically create, bind, and queue one immutable calculation run."""
        now = _now()
        spec_payload = dict(payload)
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
        for _ in range(10):
            job = Job(
                job_id=_new_job_id(now),
                task_type=spec.kind,
                status="created",
                spec_id=spec.spec_id,
                metadata=metadata or {},
                created_at=now,
                updated_at=now,
            )
            bindings = self._build_input_bindings(job.job_id, spec.kind, input_definitions, now)
            try:
                self.repository.create_queued_job_with_spec_and_bindings(
                    job, spec, bindings, now
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
        spec = CalculationSpec(
            specId=f"spec-{secrets.token_hex(8)}",
            schemaVersion=1,
            kind=_required_text(kind, "kind"),
            engine=_required_text(engine, "engine"),
            payload=dict(payload),
            createdAt=now,
        )
        for _ in range(10):
            job = Job(
                jobId=_new_job_id(now),
                taskType=spec.kind,
                status="created",
                specId=spec.spec_id,
                metadata=metadata or {},
                createdAt=now,
                updatedAt=now,
            )
            try:
                self.repository.create_job_with_spec(job, spec)
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
        bindings = self._build_input_bindings(job_id, spec.kind, definitions, now)
        if not self.repository.freeze_job_input_bindings_and_queue(
            job_id, bindings, now
        ):
            current = self._require_job(job_id)
            raise InvalidJobTransitionError(
                f"Job '{job_id}' cannot queue from '{current.status}'"
            )
        queued = self.get_job(job_id)
        self._write_snapshot(queued)
        return queued

    def get_calculation_spec(self, job_id: str) -> CalculationSpec | None:
        job = self._require_job(job_id)
        return self.repository.get_calculation_spec(job.spec_id) if job.spec_id else None

    def get_input_bindings(self, job_id: str) -> list[JobInputBinding]:
        self._require_job(job_id)
        return self.repository.list_job_input_bindings(job_id)

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

    def add_inputs(self, job_id: str, inputs: Mapping[str, Any]) -> Job:
        """Add a batch of named inputs, as submitted by the jobs HTTP route."""
        if not isinstance(inputs, Mapping):
            raise ValueError("inputs must be an object")
        self._require_job(job_id)
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
        references: list[dict[str, Any]],
    ) -> Workflow:
        """Persist a dependency graph after validating every referenced job."""
        name = _required_text(name, "name")
        workflow_id = _new_workflow_id()
        workflow = self._build_workflow(workflow_id, name, job_ids, references)
        self.repository.create_workflow(workflow)
        return workflow

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
        references: list[dict[str, Any]],
    ) -> Workflow:
        current = self.get_workflow(workflow_id)
        workflow = self._build_workflow(
            workflow_id,
            _required_text(name, "name"),
            job_ids,
            references,
            created_at=current.created_at,
        )
        if not self.repository.update_workflow(workflow):
            raise WorkflowNotFoundError(workflow_id)
        return workflow

    def add_input(
        self,
        job_id: str,
        name: str,
        value: Any,
        *,
        metadata: dict[str, Any] | None = None,
    ) -> JobInput:
        self._require_job(job_id)
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

    def add_artifact(
        self,
        job_id: str,
        name: str,
        path: str,
        *,
        media_type: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> Artifact:
        self._require_job(job_id)
        artifact = Artifact(
            artifact_id=f"artifact-{secrets.token_hex(8)}",
            job_id=job_id,
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
        self.repository.add_artifact(artifact)
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
        if not self.repository.claim_job(
            job_id,
            expected_status="queued",
            next_status="running",
            updated_at=_now(),
        ):
            return None
        job = self._require_job(job_id)
        self._write_snapshot(job)
        return job

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
        job.bindings = self.repository.list_job_input_bindings(job.job_id)
        job.artifacts = self.repository.get_artifacts(job.job_id)

    def _build_input_bindings(
        self,
        job_id: str,
        calculation_kind: str,
        definitions: Mapping[str, Any],
        created_at: datetime,
    ) -> list[JobInputBinding]:
        descriptors: dict[str, dict[str, Any]] = {}
        bindings: list[JobInputBinding] = []
        for input_name, definition in definitions.items():
            if not isinstance(definition, Mapping):
                definition = {
                    "sourceKind": "literal",
                    "format": "structure",
                    "value": definition,
                }
            descriptor = dict(definition)
            source_kind = descriptor.get("sourceKind", descriptor.get("source_kind"))
            value_format = descriptor.get("format")
            descriptors[input_name] = {
                "sourceKind": source_kind,
                "format": value_format,
            }
            if source_kind not in {"literal", "molecule_revision", "artifact"}:
                raise InvalidJobInputError(
                    f"Input '{input_name}' source '{source_kind}' is not resolvable"
                )
            if source_kind == "literal":
                literal_value = descriptor.get("value", descriptor.get("literalValue"))
                if literal_value is None:
                    raise InvalidJobInputError(f"Literal input '{input_name}' has no value")
                if isinstance(literal_value, Mapping) and "format" not in literal_value:
                    literal_value = {"format": value_format, **dict(literal_value)}
                bindings.append(
                    JobInputBinding(
                        bindingId=f"binding-{secrets.token_hex(8)}",
                        jobId=job_id,
                        inputName=_required_text(input_name, "input name"),
                        sourceKind="literal",
                        literalValue=literal_value,
                        contentSha256=_canonical_json_sha256(literal_value),
                        resolvedFromReferenceId=descriptor.get("resolvedFromReferenceId"),
                        createdAt=created_at,
                    )
                )
                continue

            if source_kind == "molecule_revision":
                revision_id = descriptor.get(
                    "moleculeRevisionId", descriptor.get("molecule_revision_id")
                )
                revision = (
                    self.repository.get_molecule_revision(revision_id)
                    if isinstance(revision_id, str)
                    else None
                )
                if revision is None:
                    raise InvalidJobInputError(
                        f"Revision input '{input_name}' does not resolve to a molecule revision"
                    )
                expected_digest = descriptor.get("contentSha256")
                if expected_digest is not None and expected_digest != revision.sha256:
                    raise InvalidJobInputError(
                        f"Molecule revision '{revision.revision_id}' digest does not match the binding"
                    )
                bindings.append(
                    JobInputBinding(
                        bindingId=f"binding-{secrets.token_hex(8)}",
                        jobId=job_id,
                        inputName=_required_text(input_name, "input name"),
                        sourceKind="molecule_revision",
                        moleculeRevisionId=revision.revision_id,
                        contentSha256=revision.sha256,
                        resolvedFromReferenceId=descriptor.get(
                            "resolvedFromReferenceId"
                        ),
                        createdAt=created_at,
                    )
                )
                continue

            artifact_id = descriptor.get("artifactId", descriptor.get("artifact_id"))
            artifact = (
                self.repository.get_artifact(artifact_id)
                if isinstance(artifact_id, str)
                else None
            )
            if artifact is None:
                raise InvalidJobInputError(
                    f"Artifact input '{input_name}' does not resolve to an artifact"
                )
            source_job = self._require_job(artifact.job_id)
            if source_job.status != "succeeded":
                raise InvalidJobInputError(
                    f"Artifact '{artifact.artifact_id}' comes from non-succeeded job '{artifact.job_id}'"
                )
            if not artifact.sha256:
                raise InvalidJobInputError(
                    f"Artifact '{artifact.artifact_id}' has no immutable content digest"
                )
            expected_digest = descriptor.get("contentSha256")
            if expected_digest is not None and expected_digest != artifact.sha256:
                raise InvalidJobInputError(
                    f"Artifact '{artifact.artifact_id}' digest does not match the binding"
                )
            bindings.append(
                JobInputBinding(
                    bindingId=f"binding-{secrets.token_hex(8)}",
                    jobId=job_id,
                    inputName=_required_text(input_name, "input name"),
                    sourceKind="artifact",
                    artifactId=artifact.artifact_id,
                    contentSha256=artifact.sha256,
                    resolvedFromReferenceId=descriptor.get("resolvedFromReferenceId"),
                    createdAt=created_at,
                )
            )

        validation = validate_calculation_inputs(calculation_kind, descriptors)
        if not validation.is_valid:
            details = "; ".join(issue.message for issue in validation.issues)
            raise InvalidJobInputError(details)
        return bindings

    def _resolve_workflow_input_definitions(
        self, workflow_id: str, target_job_id: str
    ) -> dict[str, dict[str, Any]]:
        workflow = self.get_workflow(workflow_id)
        if target_job_id not in workflow.job_ids:
            raise InvalidJobInputError(
                f"Job '{target_job_id}' is not a member of workflow '{workflow_id}'"
            )
        definitions: dict[str, dict[str, Any]] = {}
        for reference in workflow.references:
            if reference.target_job_id != target_job_id:
                continue
            if reference.source_kind == "artifact":
                artifacts = self.repository.get_artifacts(reference.source_job_id)
                if reference.source_artifact_id is not None:
                    matches = [
                        artifact
                        for artifact in artifacts
                        if artifact.artifact_id == reference.source_artifact_id
                    ]
                else:
                    matches = [
                        artifact
                        for artifact in artifacts
                        if artifact.name == reference.source_name
                    ]
                if len(matches) != 1:
                    raise InvalidJobInputError(
                        f"Workflow reference '{reference.reference_id}' did not resolve uniquely"
                    )
                artifact = matches[0]
                definitions[reference.target_input_name] = {
                    "sourceKind": "artifact",
                    "artifactId": artifact.artifact_id,
                    "format": artifact.format,
                    "contentSha256": artifact.sha256,
                    "resolvedFromReferenceId": reference.reference_id,
                }
                continue

            source_bindings = self.repository.list_job_input_bindings(
                reference.source_job_id
            )
            matches = [
                binding
                for binding in source_bindings
                if binding.input_name == reference.source_name
            ]
            if len(matches) != 1:
                raise InvalidJobInputError(
                    f"Workflow reference '{reference.reference_id}' did not resolve uniquely"
                )
            source = matches[0]
            if source.source_kind == "literal":
                literal = source.literal_value
                definitions[reference.target_input_name] = {
                    "sourceKind": "literal",
                    "format": literal.get("format") if isinstance(literal, Mapping) else "structure",
                    "value": literal,
                    "resolvedFromReferenceId": reference.reference_id,
                }
            elif source.source_kind == "artifact":
                artifact = self.repository.get_artifact(source.artifact_id or "")
                if artifact is None:
                    raise InvalidJobInputError(
                        f"Source binding '{source.binding_id}' lost its artifact"
                    )
                definitions[reference.target_input_name] = {
                    "sourceKind": "artifact",
                    "artifactId": artifact.artifact_id,
                    "format": artifact.format,
                    "contentSha256": source.content_sha256,
                    "resolvedFromReferenceId": reference.reference_id,
                }
            elif source.source_kind == "molecule_revision":
                revision = self.repository.get_molecule_revision(
                    source.molecule_revision_id or ""
                )
                if revision is None:
                    raise InvalidJobInputError(
                        f"Source binding '{source.binding_id}' lost its molecule revision"
                    )
                definitions[reference.target_input_name] = {
                    "sourceKind": "molecule_revision",
                    "moleculeRevisionId": revision.revision_id,
                    "format": "molecule",
                    "contentSha256": source.content_sha256,
                    "resolvedFromReferenceId": reference.reference_id,
                }
            else:
                raise InvalidJobInputError(
                    f"Source binding '{source.binding_id}' is not supported yet"
                )
        return definitions

    def _populate_workflow_relations(self, workflow: Workflow) -> None:
        workflow.job_ids = self.repository.get_workflow_job_ids(workflow.workflow_id)
        workflow.references = self.repository.get_job_input_references(workflow.workflow_id)

    def _build_workflow(
        self,
        workflow_id: str,
        name: str,
        job_ids: list[str],
        reference_definitions: list[dict[str, Any]],
        *,
        created_at: datetime | None = None,
    ) -> Workflow:
        for job_id in job_ids:
            self._require_job(job_id)
        now = _now()
        references = [
            JobInputReference(
                reference_id=_new_reference_id(),
                workflow_id=workflow_id,
                target_job_id=definition["targetJobId"],
                target_input_name=_required_text(definition["targetInputName"], "targetInputName"),
                source_job_id=definition["sourceJobId"],
                source_artifact_id=definition.get("sourceArtifactId"),
                source_kind=definition["sourceKind"],
                source_name=_required_text(definition.get("sourceName") or "artifact", "sourceName"),
                created_at=now,
            )
            for definition in reference_definitions
        ]
        for reference in references:
            self._validate_reference_source(reference)
        validate_workflow_dag(job_ids, references)
        return Workflow(
            workflow_id=workflow_id,
            name=name,
            created_at=created_at or now,
            updated_at=now,
            job_ids=job_ids,
            references=references,
        )

    def _validate_reference_source(self, reference: JobInputReference) -> None:
        self._require_job(reference.source_job_id)
        if reference.source_artifact_id is None:
            return
        artifact = next(
            (
                item
                for item in self.repository.get_artifacts(reference.source_job_id)
                if item.artifact_id == reference.source_artifact_id
            ),
            None,
        )
        if artifact is None:
            raise ValueError(
                f"Artifact '{reference.source_artifact_id}' does not belong to job "
                f"'{reference.source_job_id}'"
            )

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


def _canonical_json_sha256(value: Any) -> str:
    payload = json.dumps(
        value,
        ensure_ascii=True,
        allow_nan=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def _new_job_id(now: datetime) -> str:
    return f"{now:%Y%m%d}-{secrets.token_hex(4)}"


def _new_workflow_id() -> str:
    return f"workflow-{secrets.token_hex(8)}"


def _new_reference_id() -> str:
    return f"reference-{secrets.token_hex(8)}"


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
