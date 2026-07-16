"""Small engine-neutral entry points for quantum chemistry capabilities."""

from __future__ import annotations

import asyncio
from typing import Literal, Self

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field, model_validator

try:
    from engines.psi4_engine import (
        Psi4ExecutionError,
        detect_psi4_runtime,
        run_psi4_single_point,
    )
except ModuleNotFoundError:
    from software.backend.engines.psi4_engine import (
        Psi4ExecutionError,
        detect_psi4_runtime,
        run_psi4_single_point,
    )


router = APIRouter(prefix="/quantum", tags=["quantum"])


class QuantumAtom(BaseModel):
    id: str
    symbol: str = Field(min_length=1, max_length=3, pattern=r"^[A-Za-z]{1,3}$")
    x: float
    y: float
    z: float


class Psi4SinglePointRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    atoms: list[QuantumAtom] = Field(min_length=1)
    charge: int = Field(default=0, ge=-20, le=20)
    multiplicity: int = Field(default=1, ge=1, le=20)
    method: Literal["hf", "b3lyp", "pbe0"] = "hf"
    basis: Literal["sto-3g", "def2-svp", "def2-tzvp"] = "sto-3g"
    reference: Literal["rhf", "uhf", "rohf"] | None = None
    scf_type: Literal["df", "pk"] = Field(default="df", alias="scfType")
    threads: int = Field(default=1, ge=1, le=16)
    memory_mb: int = Field(default=512, ge=256, le=32768, alias="memoryMb")
    timeout_seconds: int = Field(
        default=300,
        ge=5,
        le=3600,
        alias="timeoutSeconds",
    )

    @model_validator(mode="after")
    def validate_atom_ids(self) -> Self:
        atom_ids = [atom.id for atom in self.atoms]
        if len(atom_ids) != len(set(atom_ids)):
            raise ValueError("atoms 中的 ID 不得重复")
        return self

    def to_engine_request(self) -> dict:
        return {
            "atoms": [atom.model_dump() for atom in self.atoms],
            "charge": self.charge,
            "multiplicity": self.multiplicity,
            "method": self.method,
            "basis": self.basis,
            "reference": self.reference,
            "scfType": self.scf_type,
            "threads": self.threads,
            "memoryMb": self.memory_mb,
        }


class Psi4SinglePointResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    energy_hartree: float = Field(serialization_alias="energyHartree")
    method: str
    basis: str
    psi4_version: str = Field(serialization_alias="psi4Version")


@router.get("/psi4/status")
async def psi4_status() -> dict:
    return detect_psi4_runtime().to_dict()


@router.post("/psi4/single-point", response_model=Psi4SinglePointResponse)
async def psi4_single_point(
    request: Psi4SinglePointRequest,
) -> Psi4SinglePointResponse:
    try:
        result = await asyncio.to_thread(
            run_psi4_single_point,
            request.to_engine_request(),
            timeout=request.timeout_seconds,
        )
    except Psi4ExecutionError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    return Psi4SinglePointResponse(
        energy_hartree=result["energyHartree"],
        method=result["method"],
        basis=result["basis"],
        psi4_version=result["psi4Version"],
    )
