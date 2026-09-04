"""Versioned request model for the ``xtb-optimization@1`` JobType."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError

try:
    from engines.xtb import XtbAtom, XtbOptimizationRequest
except ModuleNotFoundError:
    from software.backend.engines.xtb import XtbAtom, XtbOptimizationRequest

from ...execution import JobExecutionError
from ...structure_inputs import resolve_structure_request


class XtbJobAtomV1(BaseModel):
    """Job-level atom that preserves editable graph metadata for collection."""

    model_config = ConfigDict(extra="allow")

    id: str
    symbol: str
    x: float
    y: float
    z: float

    def to_engine_atom(self) -> XtbAtom:
        return XtbAtom(
            id=self.id,
            symbol=self.symbol,
            x=self.x,
            y=self.y,
            z=self.z,
        )


class XtbStructureV1(BaseModel):
    """Resolved structure consumed by version 1 of the optimization JobType."""

    model_config = ConfigDict(extra="allow")

    name: str | None = None
    atoms: list[XtbJobAtomV1] = Field(min_length=1)


class XtbOptimizationParametersV1(BaseModel):
    """Persisted parameters accepted by ``xtb-optimization@1``."""

    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    fixed_atom_ids: list[str] = Field(default_factory=list, alias="fixedAtomIds")
    charge: int = 0
    multiplicity: int = Field(default=1, ge=1)
    method: Literal["gfn2", "gfn1", "gfnff"] = "gfn2"
    max_steps: int = Field(default=200, alias="maxSteps", ge=1, le=1000)
    opt_level: Literal[
        "crude",
        "sloppy",
        "loose",
        "lax",
        "normal",
        "tight",
        "vtight",
        "extreme",
    ] = Field(default="normal", alias="optLevel")
    solvent: dict[str, Any] | None = None
    threads: int = Field(default=1, ge=1, le=16)
    memory_mb: int = Field(default=1024, alias="memoryMb", ge=256, le=32768)
    timeout_seconds: int = Field(
        default=300,
        alias="timeoutSeconds",
        ge=5,
        le=86400,
    )


class XtbOptimizationTypeDataV1(BaseModel):
    """Canonical data stored beside an ``xtb-optimization@1`` Job."""

    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    engine: Literal["xtb"]
    parameters: XtbOptimizationParametersV1


class XtbOptimizationJobDataV1(XtbOptimizationParametersV1):
    """Complete, validated runtime data for ``xtb-optimization@1``."""

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    name: str | None = None
    structure: XtbStructureV1
    molecule: dict[str, Any] | None = None

    def to_engine_request(self) -> XtbOptimizationRequest:
        """Translate JobType vocabulary into the transport-neutral xTB contract."""
        return XtbOptimizationRequest(
            atoms=[atom.to_engine_atom() for atom in self.structure.atoms],
            fixed_atom_ids=self.fixed_atom_ids,
            charge=self.charge,
            multiplicity=self.multiplicity,
            method=self.method,
            max_steps=self.max_steps,
            optlevel=self.opt_level,
        )

    def to_collection_request(self) -> dict[str, Any]:
        """Return canonical camel-case data used by the result collector."""
        return self.model_dump(by_alias=True, exclude_none=True, mode="json")


@dataclass(frozen=True, slots=True)
class PreparedXtbOptimizationJobV1:
    job_data: XtbOptimizationJobDataV1
    engine_request: XtbOptimizationRequest
    collection_request: dict[str, Any]


def normalize_xtb_optimization_type_data_v1(
    raw_data: Mapping[str, Any],
) -> dict[str, Any]:
    """Validate creation data and return its canonical persisted form."""
    validated = XtbOptimizationTypeDataV1.model_validate(dict(raw_data))
    return validated.model_dump(by_alias=True, exclude_none=True, mode="json")


def prepare_xtb_optimization_job_v1(
    service: Any,
    job: Any,
) -> PreparedXtbOptimizationJobV1:
    """Resolve frozen inputs, validate JobType data, and build the engine request."""
    resolved = resolve_structure_request(service, job)
    if not isinstance(resolved, dict):
        raise JobExecutionError(
            f"Job '{job.job_id}' has no executable xTB request"
        )
    try:
        job_data = XtbOptimizationJobDataV1.model_validate(resolved)
        engine_request = job_data.to_engine_request()
    except (ValidationError, TypeError, ValueError) as error:
        raise JobExecutionError(
            f"Job '{job.job_id}' has invalid xtb-optimization@1 data: {error}"
        ) from error
    return PreparedXtbOptimizationJobV1(
        job_data=job_data,
        engine_request=engine_request,
        collection_request=job_data.to_collection_request(),
    )


__all__ = [
    "PreparedXtbOptimizationJobV1",
    "XtbJobAtomV1",
    "XtbOptimizationJobDataV1",
    "XtbOptimizationParametersV1",
    "XtbOptimizationTypeDataV1",
    "XtbStructureV1",
    "normalize_xtb_optimization_type_data_v1",
    "prepare_xtb_optimization_job_v1",
]
