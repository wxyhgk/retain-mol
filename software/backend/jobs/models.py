"""Models shared by job routes, workers, and the persistence layer."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, model_validator


JobStatus = Literal[
    "created",
    "queued",
    "running",
    "succeeded",
    "failed",
    "cancelled",
    "interrupted",
]

DispatchStatus = Literal["pending", "leased", "finished"]
WorkflowExecutionStatus = Literal["active", "succeeded", "blocked", "cancelled"]
WorkflowNodeState = Literal[
    "waiting",
    "ready",
    "queued",
    "running",
    "succeeded",
    "failed",
    "cancelled",
    "blocked",
]


class JobDispatch(BaseModel):
    """A durable request for one worker to execute a queued job."""

    model_config = ConfigDict(populate_by_name=True)

    dispatch_id: str = Field(alias="dispatchId")
    job_id: str = Field(alias="jobId")
    status: DispatchStatus
    requested_at: datetime = Field(alias="requestedAt")
    available_at: datetime = Field(alias="availableAt")
    lease_owner: str | None = Field(default=None, alias="leaseOwner")
    lease_token: str | None = Field(default=None, alias="leaseToken")
    lease_expires_at: datetime | None = Field(default=None, alias="leaseExpiresAt")
    heartbeat_at: datetime | None = Field(default=None, alias="heartbeatAt")
    finished_at: datetime | None = Field(default=None, alias="finishedAt")
    last_error: str | None = Field(default=None, alias="lastError")


class WorkflowExecution(BaseModel):
    """Persisted activation and terminal outcome of one concrete workflow DAG."""

    model_config = ConfigDict(populate_by_name=True)

    execution_id: str = Field(alias="executionId")
    workflow_id: str = Field(alias="workflowId")
    status: WorkflowExecutionStatus
    error_code: str | None = Field(default=None, alias="errorCode")
    error_message: str | None = Field(default=None, alias="errorMessage")
    started_at: datetime = Field(alias="startedAt")
    updated_at: datetime = Field(alias="updatedAt")
    finished_at: datetime | None = Field(default=None, alias="finishedAt")


class WorkflowNodeRuntime(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    job_id: str = Field(alias="jobId")
    job_status: JobStatus = Field(alias="jobStatus")
    state: WorkflowNodeState
    blocked_by: list[str] = Field(default_factory=list, alias="blockedBy")


class WorkflowSchedule(BaseModel):
    """Derived runtime view returned after one scheduler reconciliation."""

    model_config = ConfigDict(populate_by_name=True)

    execution: WorkflowExecution
    nodes: list[WorkflowNodeRuntime]
    ready_job_ids: list[str] = Field(default_factory=list, alias="readyJobIds")


class MoleculeAsset(BaseModel):
    """A stable identity whose head points at an immutable molecule revision."""

    model_config = ConfigDict(populate_by_name=True)

    asset_id: str = Field(
        alias="assetId", validation_alias=AliasChoices("assetId", "id")
    )
    name: str
    schema_version: int = Field(default=1, alias="schemaVersion", ge=1)
    head_revision_id: str | None = Field(default=None, alias="headRevisionId")
    version: int = Field(default=1, ge=1)
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class MoleculeRevision(BaseModel):
    """An immutable, content-addressed snapshot of one molecule asset."""

    model_config = ConfigDict(populate_by_name=True, frozen=True)

    revision_id: str = Field(
        alias="revisionId", validation_alias=AliasChoices("revisionId", "id")
    )
    schema_version: int = Field(default=1, alias="schemaVersion", ge=1)
    asset_id: str = Field(alias="assetId")
    parent_revision_id: str | None = Field(default=None, alias="parentRevisionId")
    structure: dict[str, Any] = Field(
        validation_alias=AliasChoices("structure", "molecule"),
        serialization_alias="molecule",
    )
    sha256: str = Field(
        validation_alias=AliasChoices("sha256", "contentHash"),
        serialization_alias="contentHash",
        min_length=64,
        max_length=64,
    )
    topology_fingerprint: str = Field(
        alias="topologyFingerprint", min_length=64, max_length=64
    )
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(alias="createdAt")


class CalculationSpec(BaseModel):
    """Immutable, engine-specific calculation input owned independently of a job run."""

    model_config = ConfigDict(populate_by_name=True)

    spec_id: str = Field(alias="specId")
    schema_version: int = Field(default=1, alias="schemaVersion", ge=1)
    kind: str
    engine: str
    payload: dict[str, Any]
    created_at: datetime = Field(alias="createdAt")


class JobInput(BaseModel):
    """A named value submitted when a job was created or configured."""

    model_config = ConfigDict(populate_by_name=True)

    input_id: str = Field(alias="inputId")
    job_id: str = Field(alias="jobId")
    name: str
    value: Any
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(alias="createdAt")


class JobInputSnapshot(BaseModel):
    """The resolved, immutable input actually consumed by one job run."""

    model_config = ConfigDict(populate_by_name=True)

    snapshot_id: str = Field(alias="bindingId")
    job_id: str = Field(alias="jobId")
    input_name: str = Field(alias="inputName", min_length=1)
    source_kind: Literal["literal", "molecule_revision", "artifact"] = Field(
        alias="sourceKind"
    )
    literal_value: Any | None = Field(default=None, alias="literalValue")
    molecule_revision_id: str | None = Field(
        default=None, alias="moleculeRevisionId"
    )
    artifact_id: str | None = Field(default=None, alias="artifactId")
    content_sha256: str | None = Field(default=None, alias="contentSha256")
    resolved_from_link_id: str | None = Field(
        default=None, alias="resolvedFromReferenceId"
    )
    created_at: datetime = Field(alias="createdAt")

    @model_validator(mode="after")
    def validate_source_payload(self) -> "JobInputSnapshot":
        if self.source_kind == "literal":
            if self.molecule_revision_id is not None or self.artifact_id is not None:
                raise ValueError("literal snapshots cannot reference a revision or artifact")
        elif self.source_kind == "molecule_revision":
            if self.molecule_revision_id is None or self.artifact_id is not None:
                raise ValueError("molecule_revision snapshots require only a revision")
            if self.literal_value is not None:
                raise ValueError("molecule_revision snapshots cannot contain a literal")
        elif self.artifact_id is None or self.molecule_revision_id is not None:
            raise ValueError("artifact snapshots require only an artifact")
        elif self.literal_value is not None:
            raise ValueError("artifact snapshots cannot contain a literal")
        return self


class Artifact(BaseModel):
    """A file or generated value associated with a completed job."""

    model_config = ConfigDict(populate_by_name=True)

    artifact_id: str = Field(alias="artifactId")
    job_id: str = Field(alias="jobId")
    name: str
    path: str
    storage_key: str | None = Field(default=None, alias="storageKey")
    kind: str = "file"
    role: str = "output"
    format: str = "file"
    media_type: str | None = Field(default=None, alias="mediaType")
    sha256: str | None = None
    byte_size: int | None = Field(default=None, alias="byteSize", ge=0)
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(alias="createdAt")


class WorkflowInputLink(BaseModel):
    """A design-time data link from one workflow job to another."""

    model_config = ConfigDict(populate_by_name=True)

    link_id: str = Field(alias="referenceId")
    workflow_id: str = Field(alias="workflowId")
    target_job_id: str = Field(alias="targetJobId")
    target_input_name: str = Field(alias="targetInputName")
    source_job_id: str = Field(alias="sourceJobId")
    source_artifact_id: str | None = Field(default=None, alias="sourceArtifactId")
    source_kind: Literal["input", "artifact"] = Field(alias="sourceKind")
    source_name: str = Field(alias="sourceName")
    created_at: datetime = Field(alias="createdAt")


class Workflow(BaseModel):
    """A persisted DAG of jobs and the input links between them."""

    model_config = ConfigDict(populate_by_name=True)

    workflow_id: str = Field(alias="workflowId")
    name: str
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")
    job_ids: list[str] = Field(default_factory=list, alias="jobIds")
    input_links: list[WorkflowInputLink] = Field(
        default_factory=list,
        alias="references",
    )


class Job(BaseModel):
    """A durable background task and its current observable state."""

    model_config = ConfigDict(populate_by_name=True)

    job_id: str = Field(alias="jobId")
    task_type: str = Field(alias="taskType")
    status: JobStatus
    spec_id: str | None = Field(default=None, alias="specId")
    supersedes_job_id: str | None = Field(default=None, alias="supersedesJobId")
    metadata: dict[str, Any] = Field(default_factory=dict)
    error: str | None = None
    error_code: str | None = Field(default=None, alias="errorCode")
    error_message: str | None = Field(default=None, alias="errorMessage")
    queued_at: datetime | None = Field(default=None, alias="queuedAt")
    started_at: datetime | None = Field(default=None, alias="startedAt")
    finished_at: datetime | None = Field(default=None, alias="finishedAt")
    attempt_count: int = Field(default=0, alias="attemptCount", ge=0)
    state_version: int = Field(default=0, alias="stateVersion", ge=0)
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")
    inputs: list[JobInput] = Field(default_factory=list)
    input_snapshots: list[JobInputSnapshot] = Field(
        default_factory=list,
        alias="bindings",
    )
    artifacts: list[Artifact] = Field(default_factory=list)


class JobStatusEvent(BaseModel):
    """Append-only audit record for one accepted job-state transition."""

    model_config = ConfigDict(populate_by_name=True)

    event_id: str = Field(alias="eventId")
    job_id: str = Field(alias="jobId")
    from_status: JobStatus | None = Field(default=None, alias="fromStatus")
    to_status: JobStatus = Field(alias="toStatus")
    state_version: int = Field(alias="stateVersion", ge=0)
    error_code: str | None = Field(default=None, alias="errorCode")
    error_message: str | None = Field(default=None, alias="errorMessage")
    created_at: datetime = Field(alias="createdAt")
