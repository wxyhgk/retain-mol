"""Versioned request models for the built-in Psi4 JobTypes."""

from __future__ import annotations

from dataclasses import dataclass
from collections.abc import Mapping
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError

from ...execution import JobExecutionError
from ...structure_inputs import resolve_structure_request


class Psi4JobAtomV1(BaseModel):
    """Job-level atom retaining graph metadata not consumed by Psi4."""

    model_config = ConfigDict(extra="allow")

    id: str
    symbol: str
    x: float
    y: float
    z: float

    def to_engine_value(self) -> dict[str, Any]:
        return self.model_dump(
            include={"id", "symbol", "x", "y", "z"},
            mode="json",
        )


class Psi4StructureV1(BaseModel):
    model_config = ConfigDict(extra="allow")

    name: str | None = None
    atoms: list[Psi4JobAtomV1] = Field(min_length=1)


class Psi4CommonParametersV1(BaseModel):
    """Persisted parameters shared by the current Psi4 JobTypes."""

    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    charge: int = Field(default=0, ge=-20, le=20)
    multiplicity: int = Field(default=1, ge=1, le=20)
    method: str = Field(default="b3lyp", min_length=1, max_length=64)
    basis: str = Field(default="def2-svp", min_length=1, max_length=64)
    reference: Literal["rhf", "uhf", "rohf"] | None = None
    scf_type: Literal["df", "pk"] = Field(default="df", alias="scfType")
    threads: int = Field(default=1, ge=1, le=16)
    memory_mb: int = Field(default=1024, ge=256, le=32768, alias="memoryMb")
    timeout_seconds: int = Field(
        default=3600,
        ge=5,
        le=86400,
        alias="timeoutSeconds",
    )


class Psi4FrequencyParametersV1(Psi4CommonParametersV1):
    """Creation parameters for ``psi4-frequency@1``."""


class Psi4TransitionStateParametersV1(Psi4CommonParametersV1):
    """Creation parameters for ``psi4-ts-refine@1``."""

    max_steps: int = Field(default=100, alias="maxSteps", ge=1, le=1000)
    full_hessian_every: int = Field(
        default=1,
        alias="fullHessianEvery",
        ge=0,
        le=100,
    )
    convergence: Literal[
        "gau_loose",
        "gau",
        "gau_tight",
        "gau_verytight",
    ] = "gau_tight"


class Psi4IrcParametersV1(Psi4CommonParametersV1):
    """Creation parameters for ``psi4-irc@1``."""

    direction: Literal["forward", "backward", "both"] = "both"
    points: int = Field(default=20, ge=1, le=200)
    step_size: float = Field(default=0.2, alias="stepSize", gt=0, le=2)
    max_steps: int = Field(default=300, alias="maxSteps", ge=1, le=3000)


class Psi4FrequencyTypeDataV1(BaseModel):
    model_config = ConfigDict(extra="forbid")

    engine: Literal["psi4"]
    parameters: Psi4FrequencyParametersV1


class Psi4TransitionStateTypeDataV1(BaseModel):
    model_config = ConfigDict(extra="forbid")

    engine: Literal["psi4"]
    parameters: Psi4TransitionStateParametersV1


class Psi4IrcTypeDataV1(BaseModel):
    model_config = ConfigDict(extra="forbid")

    engine: Literal["psi4"]
    parameters: Psi4IrcParametersV1


class _Psi4CommonJobDataV1(Psi4CommonParametersV1):
    """Complete runtime fields shared by all current Psi4 JobTypes."""

    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    name: str | None = None
    structure: Psi4StructureV1
    molecule: dict[str, Any] | None = None

    def to_engine_payload(self) -> dict[str, Any]:
        payload = self.model_dump(
            by_alias=True,
            exclude={"name", "structure", "molecule", "timeout_seconds"},
            exclude_none=True,
            mode="json",
        )
        payload["atoms"] = [
            atom.to_engine_value() for atom in self.structure.atoms
        ]
        return payload

    def to_collection_request(self) -> dict[str, Any]:
        return self.model_dump(by_alias=True, exclude_none=True, mode="json")


class Psi4FrequencyJobDataV1(_Psi4CommonJobDataV1):
    """Validated runtime data for ``psi4-frequency@1``."""


class Psi4TransitionStateJobDataV1(_Psi4CommonJobDataV1):
    """Validated runtime data for ``psi4-ts-refine@1``."""

    max_steps: int = Field(default=100, alias="maxSteps", ge=1, le=1000)
    full_hessian_every: int = Field(
        default=1,
        alias="fullHessianEvery",
        ge=0,
        le=100,
    )
    convergence: Literal[
        "gau_loose",
        "gau",
        "gau_tight",
        "gau_verytight",
    ] = "gau_tight"


class Psi4IrcJobDataV1(_Psi4CommonJobDataV1):
    """Validated runtime data for ``psi4-irc@1``."""

    direction: Literal["forward", "backward", "both"] = "both"
    points: int = Field(default=20, ge=1, le=200)
    step_size: float = Field(default=0.2, alias="stepSize", gt=0, le=2)
    max_steps: int = Field(default=300, alias="maxSteps", ge=1, le=3000)


Psi4JobDataV1 = (
    Psi4FrequencyJobDataV1
    | Psi4TransitionStateJobDataV1
    | Psi4IrcJobDataV1
)


@dataclass(frozen=True, slots=True)
class PreparedPsi4JobV1:
    job_type: str
    job_data: Psi4JobDataV1
    engine_payload: dict[str, Any]
    collection_request: dict[str, Any]
    timeout_seconds: int


_JOB_DATA_MODELS: dict[str, type[_Psi4CommonJobDataV1]] = {
    "psi4-frequency": Psi4FrequencyJobDataV1,
    "psi4-ts-refine": Psi4TransitionStateJobDataV1,
    "psi4-irc": Psi4IrcJobDataV1,
}

_TYPE_DATA_MODELS: dict[str, type[BaseModel]] = {
    "psi4-frequency": Psi4FrequencyTypeDataV1,
    "psi4-ts-refine": Psi4TransitionStateTypeDataV1,
    "psi4-irc": Psi4IrcTypeDataV1,
}


def normalize_psi4_type_data_v1(
    job_type: str,
    raw_data: Mapping[str, Any],
) -> dict[str, Any]:
    """Validate one Psi4 JobType's creation data before it is persisted."""
    try:
        model = _TYPE_DATA_MODELS[job_type]
    except KeyError as error:
        raise ValueError(f"Unsupported Psi4 JobType '{job_type}'") from error
    validated = model.model_validate(dict(raw_data))
    return validated.model_dump(by_alias=True, exclude_none=True, mode="json")


def prepare_psi4_job_v1(service: Any, job: Any) -> PreparedPsi4JobV1:
    """Resolve frozen inputs and validate one exact Psi4 JobType version."""
    try:
        model = _JOB_DATA_MODELS[job.task_type]
    except KeyError as error:
        raise JobExecutionError(
            f"Unsupported Psi4 JobType '{job.task_type}'"
        ) from error

    resolved = resolve_structure_request(service, job)
    if not isinstance(resolved, dict):
        raise JobExecutionError(
            f"Job '{job.job_id}' has no executable Psi4 request"
        )
    try:
        job_data = model.model_validate(resolved)
    except (ValidationError, TypeError, ValueError) as error:
        raise JobExecutionError(
            f"Job '{job.job_id}' has invalid {job.task_type}@1 data: {error}"
        ) from error
    return PreparedPsi4JobV1(
        job_type=job.task_type,
        job_data=job_data,
        engine_payload=job_data.to_engine_payload(),
        collection_request=job_data.to_collection_request(),
        timeout_seconds=job_data.timeout_seconds,
    )


__all__ = [
    "PreparedPsi4JobV1",
    "Psi4CommonParametersV1",
    "Psi4FrequencyJobDataV1",
    "Psi4FrequencyParametersV1",
    "Psi4IrcJobDataV1",
    "Psi4IrcParametersV1",
    "Psi4JobAtomV1",
    "Psi4StructureV1",
    "Psi4TransitionStateJobDataV1",
    "Psi4TransitionStateParametersV1",
    "normalize_psi4_type_data_v1",
    "prepare_psi4_job_v1",
]
