"""Resolve mutable job input descriptions into immutable snapshots."""

from __future__ import annotations

import hashlib
import json
import secrets
from collections.abc import Callable, Mapping
from datetime import datetime
from typing import Any

from .errors import InvalidJobInputError, JobNotFoundError, WorkflowNotFoundError
from .input_contracts import validate_calculation_inputs
from .models import Artifact, Job, JobInputSnapshot, Workflow, WorkflowInputLink
from .repository import JobRepository

InputDefinition = dict[str, Any]
SnapshotBuilder = Callable[[str, str, Mapping[str, Any], datetime], JobInputSnapshot]
SnapshotDescriptorBuilder = Callable[[JobInputSnapshot], InputDefinition]


class JobInputResolver:
    """Own source-kind dispatch for cloning, freezing, and workflow binding."""

    def __init__(self, repository: JobRepository) -> None:
        self.repository = repository
        self._snapshot_builders: dict[str, SnapshotBuilder] = {
            "literal": self._build_literal_snapshot,
            "molecule_revision": self._build_revision_snapshot,
            "artifact": self._build_artifact_snapshot,
        }
        self._snapshot_descriptors: dict[str, SnapshotDescriptorBuilder] = {
            "literal": self._describe_literal_snapshot,
            "molecule_revision": self._describe_revision_snapshot,
            "artifact": self._describe_artifact_snapshot,
        }
        self._workflow_snapshot_descriptors: dict[str, SnapshotDescriptorBuilder] = {
            "literal": self._describe_literal_snapshot,
            "molecule_revision": self._resolve_revision_snapshot,
            "artifact": self._resolve_artifact_snapshot,
        }

    def copy_definitions(self, source: Job) -> dict[str, InputDefinition]:
        """Rebind immutable input identities without copying private output files."""
        definitions: dict[str, InputDefinition] = {}
        for snapshot in source.input_snapshots:
            describe = self._snapshot_descriptors.get(snapshot.source_kind)
            if describe is None:
                raise InvalidJobInputError(
                    f"Snapshot source '{snapshot.source_kind}' is not supported"
                )
            definitions[snapshot.input_name] = describe(snapshot)
        return definitions

    def build_snapshots(
        self,
        job_id: str,
        calculation_kind: str,
        definitions: Mapping[str, Any],
        created_at: datetime,
    ) -> list[JobInputSnapshot]:
        descriptors: dict[str, InputDefinition] = {}
        snapshots: list[JobInputSnapshot] = []
        for input_name, raw_definition in definitions.items():
            definition = self._normalize_definition(raw_definition)
            source_kind = definition.get("sourceKind", definition.get("source_kind"))
            descriptors[input_name] = {
                "sourceKind": source_kind,
                "format": definition.get("format"),
            }
            build = self._snapshot_builders.get(source_kind)
            if build is None:
                raise InvalidJobInputError(
                    f"Input '{input_name}' source '{source_kind}' is not resolvable"
                )
            snapshots.append(build(job_id, input_name, definition, created_at))

        validation = validate_calculation_inputs(calculation_kind, descriptors)
        if not validation.is_valid:
            details = "; ".join(issue.message for issue in validation.issues)
            raise InvalidJobInputError(details)
        return snapshots

    def resolve_workflow_definitions(
        self, workflow_id: str, target_job_id: str
    ) -> dict[str, InputDefinition]:
        workflow = self._require_workflow(workflow_id)
        if target_job_id not in workflow.job_ids:
            raise InvalidJobInputError(
                f"Job '{target_job_id}' is not a member of workflow '{workflow_id}'"
            )

        definitions: dict[str, InputDefinition] = {}
        for link in workflow.input_links:
            if link.target_job_id == target_job_id:
                definitions[link.target_input_name] = self._resolve_workflow_link(link)
        return definitions

    @staticmethod
    def _normalize_definition(raw_definition: Any) -> InputDefinition:
        if isinstance(raw_definition, Mapping):
            return dict(raw_definition)
        return {
            "sourceKind": "literal",
            "format": "structure",
            "value": raw_definition,
        }

    def _build_literal_snapshot(
        self,
        job_id: str,
        input_name: str,
        definition: Mapping[str, Any],
        created_at: datetime,
    ) -> JobInputSnapshot:
        literal_value = definition.get("value", definition.get("literalValue"))
        if literal_value is None:
            raise InvalidJobInputError(f"Literal input '{input_name}' has no value")
        if isinstance(literal_value, Mapping) and "format" not in literal_value:
            literal_value = {"format": definition.get("format"), **dict(literal_value)}
        return JobInputSnapshot(
            snapshot_id=_new_snapshot_id(),
            jobId=job_id,
            inputName=_required_input_name(input_name),
            sourceKind="literal",
            literalValue=literal_value,
            contentSha256=_canonical_json_sha256(literal_value),
            resolved_from_link_id=definition.get("resolvedFromReferenceId"),
            createdAt=created_at,
        )

    def _build_revision_snapshot(
        self,
        job_id: str,
        input_name: str,
        definition: Mapping[str, Any],
        created_at: datetime,
    ) -> JobInputSnapshot:
        revision_id = definition.get(
            "moleculeRevisionId", definition.get("molecule_revision_id")
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
        _require_matching_digest(
            definition, revision.sha256, f"Molecule revision '{revision.revision_id}'"
        )
        return JobInputSnapshot(
            snapshot_id=_new_snapshot_id(),
            jobId=job_id,
            inputName=_required_input_name(input_name),
            sourceKind="molecule_revision",
            moleculeRevisionId=revision.revision_id,
            contentSha256=revision.sha256,
            resolved_from_link_id=definition.get("resolvedFromReferenceId"),
            createdAt=created_at,
        )

    def _build_artifact_snapshot(
        self,
        job_id: str,
        input_name: str,
        definition: Mapping[str, Any],
        created_at: datetime,
    ) -> JobInputSnapshot:
        artifact_id = definition.get("artifactId", definition.get("artifact_id"))
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
        _require_matching_digest(
            definition, artifact.sha256, f"Artifact '{artifact.artifact_id}'"
        )
        return JobInputSnapshot(
            snapshot_id=_new_snapshot_id(),
            jobId=job_id,
            inputName=_required_input_name(input_name),
            sourceKind="artifact",
            artifactId=artifact.artifact_id,
            contentSha256=artifact.sha256,
            resolved_from_link_id=definition.get("resolvedFromReferenceId"),
            createdAt=created_at,
        )

    def _describe_literal_snapshot(self, snapshot: JobInputSnapshot) -> InputDefinition:
        descriptor = self._base_snapshot_descriptor(snapshot)
        descriptor["value"] = snapshot.literal_value
        if isinstance(snapshot.literal_value, Mapping):
            literal_format = snapshot.literal_value.get("format")
            if literal_format:
                descriptor["format"] = literal_format
        return descriptor

    def _describe_revision_snapshot(
        self, snapshot: JobInputSnapshot
    ) -> InputDefinition:
        return {
            **self._base_snapshot_descriptor(snapshot),
            "format": "molecule",
            "moleculeRevisionId": snapshot.molecule_revision_id,
        }

    def _describe_artifact_snapshot(
        self, snapshot: JobInputSnapshot
    ) -> InputDefinition:
        artifact = self.repository.get_artifact(snapshot.artifact_id or "")
        if artifact is None:
            raise KeyError(snapshot.artifact_id or "")
        return {
            **self._base_snapshot_descriptor(snapshot),
            "format": artifact.format,
            "artifactId": artifact.artifact_id,
        }

    @staticmethod
    def _base_snapshot_descriptor(snapshot: JobInputSnapshot) -> InputDefinition:
        descriptor: InputDefinition = {"sourceKind": snapshot.source_kind}
        if snapshot.content_sha256:
            descriptor["contentSha256"] = snapshot.content_sha256
        return descriptor

    def _resolve_workflow_link(self, link: WorkflowInputLink) -> InputDefinition:
        source_job = self._require_job(link.source_job_id)
        if source_job.status != "succeeded":
            raise InvalidJobInputError(
                f"Workflow source job '{source_job.job_id}' must be succeeded"
            )
        if link.source_kind == "artifact":
            return self._resolve_artifact_link(link)
        return self._resolve_input_link(link)

    def _resolve_artifact_link(self, link: WorkflowInputLink) -> InputDefinition:
        artifacts = self.repository.get_artifacts(link.source_job_id)
        matches = [
            artifact
            for artifact in artifacts
            if self._artifact_matches_link(artifact, link)
        ]
        if len(matches) != 1:
            raise InvalidJobInputError(
                f"Workflow input link '{link.link_id}' did not resolve uniquely"
            )
        artifact = matches[0]
        return {
            "sourceKind": "artifact",
            "artifactId": artifact.artifact_id,
            "format": artifact.format,
            "contentSha256": artifact.sha256,
            "resolvedFromReferenceId": link.link_id,
        }

    @staticmethod
    def _artifact_matches_link(artifact: Artifact, link: WorkflowInputLink) -> bool:
        if link.source_artifact_id is not None:
            return artifact.artifact_id == link.source_artifact_id
        return artifact.name == link.source_name

    def _resolve_input_link(self, link: WorkflowInputLink) -> InputDefinition:
        matches = [
            snapshot
            for snapshot in self.repository.list_job_input_snapshots(link.source_job_id)
            if snapshot.input_name == link.source_name
        ]
        if len(matches) != 1:
            raise InvalidJobInputError(
                f"Workflow input link '{link.link_id}' did not resolve uniquely"
            )
        source = matches[0]
        describe = self._workflow_snapshot_descriptors.get(source.source_kind)
        if describe is None:
            raise InvalidJobInputError(
                f"Source snapshot '{source.snapshot_id}' is not supported yet"
            )
        descriptor = describe(source)
        descriptor["resolvedFromReferenceId"] = link.link_id
        return descriptor

    def _resolve_revision_snapshot(self, snapshot: JobInputSnapshot) -> InputDefinition:
        revision = self.repository.get_molecule_revision(
            snapshot.molecule_revision_id or ""
        )
        if revision is None:
            raise InvalidJobInputError(
                f"Source snapshot '{snapshot.snapshot_id}' lost its molecule revision"
            )
        return {
            **self._base_snapshot_descriptor(snapshot),
            "sourceKind": "molecule_revision",
            "moleculeRevisionId": revision.revision_id,
            "format": "molecule",
        }

    def _resolve_artifact_snapshot(self, snapshot: JobInputSnapshot) -> InputDefinition:
        artifact = self.repository.get_artifact(snapshot.artifact_id or "")
        if artifact is None:
            raise InvalidJobInputError(
                f"Source snapshot '{snapshot.snapshot_id}' lost its artifact"
            )
        return {
            **self._base_snapshot_descriptor(snapshot),
            "sourceKind": "artifact",
            "artifactId": artifact.artifact_id,
            "format": artifact.format,
        }

    def _require_job(self, job_id: str) -> Job:
        job = self.repository.get_job(job_id)
        if job is None:
            raise JobNotFoundError(job_id)
        return job

    def _require_workflow(self, workflow_id: str) -> Workflow:
        workflow = self.repository.get_workflow(workflow_id)
        if workflow is None:
            raise WorkflowNotFoundError(workflow_id)
        workflow.job_ids = self.repository.get_workflow_job_ids(workflow_id)
        workflow.input_links = self.repository.get_workflow_input_links(workflow_id)
        return workflow


def _new_snapshot_id() -> str:
    return f"binding-{secrets.token_hex(8)}"


def _required_input_name(value: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError("input name must be a non-empty string")
    return value


def _canonical_json_sha256(value: Any) -> str:
    payload = json.dumps(
        value,
        ensure_ascii=True,
        allow_nan=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def _require_matching_digest(
    definition: Mapping[str, Any], actual_digest: str, subject: str
) -> None:
    expected_digest = definition.get("contentSha256")
    if expected_digest is not None and expected_digest != actual_digest:
        raise InvalidJobInputError(f"{subject} digest does not match the snapshot")
