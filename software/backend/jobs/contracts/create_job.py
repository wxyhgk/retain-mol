"""Layered request model for creating one calculation Job."""

from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from .task_contracts import resolve_task_contract


class _ContractModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="forbid")


class JobProfile(_ContractModel):
    name: str = Field(min_length=1, max_length=160)
    description: str | None = Field(default=None, max_length=2000)
    tags: list[str] = Field(default_factory=list, max_length=32)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("name must not be empty")
        return normalized

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, values: list[str]) -> list[str]:
        normalized: list[str] = []
        for value in values:
            tag = value.strip()
            if not tag:
                raise ValueError("tags must not contain empty values")
            if tag not in normalized:
                normalized.append(tag)
        return normalized


class JobTaskContract(_ContractModel):
    kind: str = Field(min_length=1, max_length=80)
    engine: str = Field(min_length=1, max_length=40)
    version: Literal[1] = 1


class JobSystem(_ContractModel):
    charge: int = Field(default=0, ge=-20, le=20)
    multiplicity: int = Field(default=1, ge=1, le=20)


class JobOutputRequest(_ContractModel):
    output_type: str = Field(alias="type", min_length=1, max_length=80)
    format: str = Field(min_length=1, max_length=40)
    required: bool = True


class JobDefinition(_ContractModel):
    contract: JobTaskContract
    system: JobSystem = Field(default_factory=JobSystem)
    parameters: dict[str, Any]
    outputs: list[JobOutputRequest] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_task_parameters(self) -> "JobDefinition":
        task_contract = resolve_task_contract(
            self.contract.kind,
            self.contract.engine,
            self.contract.version,
        )
        self.parameters = task_contract.validate_parameters(self.parameters)
        return self


class InlineInputSource(_ContractModel):
    type: Literal["inline"]
    format: str = Field(min_length=1, max_length=40)
    value: Any


class MoleculeRevisionInputSource(_ContractModel):
    type: Literal["molecule-revision"]
    molecule_id: str | None = Field(default=None, alias="moleculeId", min_length=1)
    revision_id: str = Field(alias="revisionId", min_length=1)


class ArtifactInputSource(_ContractModel):
    type: Literal["artifact"]
    artifact_id: str = Field(alias="artifactId", min_length=1)


JobInputSource = Annotated[
    InlineInputSource
    | MoleculeRevisionInputSource
    | ArtifactInputSource,
    Field(discriminator="type"),
]


class JobInputManifest(_ContractModel):
    ports: dict[str, JobInputSource] = Field(min_length=1)

    @field_validator("ports")
    @classmethod
    def validate_port_names(
        cls, value: dict[str, JobInputSource]
    ) -> dict[str, JobInputSource]:
        for port in value:
            if not port.strip() or port != port.strip():
                raise ValueError("input port names must be non-empty and trimmed")
        return value


class JobResourceRequest(_ContractModel):
    cores: int | None = Field(default=None, ge=1, le=256)
    memory_mb: int | None = Field(default=None, alias="memoryMb", ge=256)
    wall_time_seconds: int | None = Field(
        default=None, alias="wallTimeSeconds", ge=5, le=604800
    )


class JobRetryPolicy(_ContractModel):
    max_attempts: int = Field(default=1, alias="maxAttempts", ge=1, le=10)


class JobExecutionRequest(_ContractModel):
    priority: Literal["low", "normal", "high"] = "normal"
    resources: JobResourceRequest | None = None
    retry_policy: JobRetryPolicy | None = Field(default=None, alias="retryPolicy")
    queue: str | None = Field(default=None, min_length=1, max_length=80)


class CreateJobRequest(_ContractModel):
    """Public creation envelope; status and results are intentionally absent."""

    schema_version: Literal[1] = Field(alias="schemaVersion")
    profile: JobProfile
    definition: JobDefinition
    inputs: JobInputManifest
    execution: JobExecutionRequest | None = None


__all__ = [
    "ArtifactInputSource",
    "CreateJobRequest",
    "InlineInputSource",
    "JobDefinition",
    "JobExecutionRequest",
    "JobInputManifest",
    "JobInputSource",
    "JobOutputRequest",
    "JobProfile",
    "JobResourceRequest",
    "JobSystem",
    "JobTaskContract",
    "MoleculeRevisionInputSource",
]
