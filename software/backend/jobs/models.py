"""Models shared by job routes, workers, and the persistence layer."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class JobInput(BaseModel):
    """A named value submitted when a job was created or configured."""

    model_config = ConfigDict(populate_by_name=True)

    input_id: str = Field(alias="inputId")
    job_id: str = Field(alias="jobId")
    name: str
    value: Any
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(alias="createdAt")


class Artifact(BaseModel):
    """A file or generated value associated with a completed job."""

    model_config = ConfigDict(populate_by_name=True)

    artifact_id: str = Field(alias="artifactId")
    job_id: str = Field(alias="jobId")
    name: str
    path: str
    media_type: str | None = Field(default=None, alias="mediaType")
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(alias="createdAt")


class JobInputReference(BaseModel):
    """Connect one named input of a job to a named value from another job."""

    model_config = ConfigDict(populate_by_name=True)

    reference_id: str = Field(alias="referenceId")
    workflow_id: str = Field(alias="workflowId")
    target_job_id: str = Field(alias="targetJobId")
    target_input_name: str = Field(alias="targetInputName")
    source_job_id: str = Field(alias="sourceJobId")
    source_kind: Literal["input", "artifact"] = Field(alias="sourceKind")
    source_name: str = Field(alias="sourceName")
    created_at: datetime = Field(alias="createdAt")


class Workflow(BaseModel):
    """A persisted DAG of jobs and the input references between them."""

    model_config = ConfigDict(populate_by_name=True)

    workflow_id: str = Field(alias="workflowId")
    name: str
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")
    job_ids: list[str] = Field(default_factory=list, alias="jobIds")
    references: list[JobInputReference] = Field(default_factory=list)


class Job(BaseModel):
    """A durable background task and its current observable state."""

    model_config = ConfigDict(populate_by_name=True)

    job_id: str = Field(alias="jobId")
    task_type: str = Field(alias="taskType")
    status: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    error: str | None = None
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")
    inputs: list[JobInput] = Field(default_factory=list)
    artifacts: list[Artifact] = Field(default_factory=list)
