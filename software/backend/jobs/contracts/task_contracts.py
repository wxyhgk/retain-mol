"""Task-specific parameter contracts behind the generic Job API."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal, Mapping

from pydantic import BaseModel, ConfigDict, Field

from ..input_contracts import DEFAULT_INPUT_CONTRACTS


class _Parameters(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="forbid")


class XtbSolventParameters(_Parameters):
    model: Literal["alpb", "gbsa"]
    name: str = Field(min_length=1, max_length=80)


class XtbOptimizationParameters(_Parameters):
    method: Literal["gfn2-xtb"] = "gfn2-xtb"
    optimization_level: Literal[
        "crude",
        "sloppy",
        "loose",
        "lax",
        "normal",
        "tight",
        "vtight",
        "extreme",
    ] = Field(default="normal", alias="optimizationLevel")
    max_iterations: int = Field(default=200, alias="maxIterations", ge=1, le=1000)
    solvent: XtbSolventParameters | None = None


class Psi4ElectronicStructureParameters(_Parameters):
    method: str = Field(default="b3lyp", min_length=1, max_length=64)
    basis: str = Field(default="def2-svp", min_length=1, max_length=64)
    reference: Literal["rhf", "uhf", "rohf"] | None = None
    scf_type: Literal["df", "pk"] = Field(default="df", alias="scfType")


class Psi4TransitionStateParameters(Psi4ElectronicStructureParameters):
    max_iterations: int = Field(default=100, alias="maxIterations", ge=1, le=1000)
    full_hessian_every: int = Field(
        default=1, alias="fullHessianEvery", ge=0, le=100
    )
    convergence: Literal["gau_loose", "gau", "gau_tight", "gau_verytight"] = (
        "gau_tight"
    )


class Psi4FrequencyParameters(Psi4ElectronicStructureParameters):
    pass


class Psi4IrcParameters(Psi4ElectronicStructureParameters):
    direction: Literal["forward", "backward", "both"] = "both"
    points: int = Field(default=20, ge=1, le=200)
    step_size: float = Field(default=0.2, alias="stepSize", gt=0, le=2)
    max_iterations: int = Field(default=300, alias="maxIterations", ge=1, le=3000)


@dataclass(frozen=True)
class TaskContractDefinition:
    """One supported scientific task and its current execution adapter."""

    kind: str
    engine: str
    version: int
    runtime_kind: str
    parameters_model: type[BaseModel]

    def validate_parameters(self, value: Mapping[str, Any]) -> dict[str, Any]:
        parameters = self.parameters_model.model_validate(value)
        return parameters.model_dump(mode="json", by_alias=True, exclude_none=True)

    def runtime_payload(
        self,
        parameters: Mapping[str, Any],
        *,
        charge: int,
        multiplicity: int,
        execution: Mapping[str, Any] | None = None,
    ) -> dict[str, Any]:
        normalized = self.validate_parameters(parameters)
        payload: dict[str, Any] = {
            "charge": charge,
            "multiplicity": multiplicity,
        }
        if self.runtime_kind == "xtb-optimization":
            payload.update(
                {
                    "method": normalized["method"].removesuffix("-xtb"),
                    "maxSteps": normalized["maxIterations"],
                    "optLevel": normalized["optimizationLevel"],
                }
            )
            if "solvent" in normalized:
                payload["solvent"] = normalized["solvent"]
        else:
            payload.update(normalized)
            if "maxIterations" in payload:
                payload["maxSteps"] = payload.pop("maxIterations")

        resources = dict((execution or {}).get("resources") or {})
        if "cores" in resources:
            payload["threads"] = resources["cores"]
        if "memoryMb" in resources:
            payload["memoryMb"] = resources["memoryMb"]
        if "wallTimeSeconds" in resources:
            payload["timeoutSeconds"] = resources["wallTimeSeconds"]
        return payload

    def public_schema(self) -> dict[str, Any]:
        input_contract = DEFAULT_INPUT_CONTRACTS.get(self.runtime_kind)
        return {
            "kind": self.kind,
            "engine": self.engine,
            "version": self.version,
            "parametersSchema": self.parameters_model.model_json_schema(
                by_alias=True, mode="validation"
            ),
            "inputs": [
                {
                    "name": port.name,
                    "required": port.required,
                    "formatsBySourceType": _public_input_formats(
                        port.formats_by_source_kind
                    ),
                }
                for port in input_contract.ports
            ],
        }


_TASK_CONTRACTS = (
    TaskContractDefinition(
        kind="geometry-optimization",
        engine="xtb",
        version=1,
        runtime_kind="xtb-optimization",
        parameters_model=XtbOptimizationParameters,
    ),
    TaskContractDefinition(
        kind="transition-state-refinement",
        engine="psi4",
        version=1,
        runtime_kind="psi4-ts-refine",
        parameters_model=Psi4TransitionStateParameters,
    ),
    TaskContractDefinition(
        kind="frequency-analysis",
        engine="psi4",
        version=1,
        runtime_kind="psi4-frequency",
        parameters_model=Psi4FrequencyParameters,
    ),
    TaskContractDefinition(
        kind="intrinsic-reaction-coordinate",
        engine="psi4",
        version=1,
        runtime_kind="psi4-irc",
        parameters_model=Psi4IrcParameters,
    ),
)

_TASK_CONTRACT_INDEX = {
    (contract.kind, contract.engine, contract.version): contract
    for contract in _TASK_CONTRACTS
}


def resolve_task_contract(
    kind: str, engine: str, version: int = 1
) -> TaskContractDefinition:
    key = (kind.strip().lower(), engine.strip().lower(), version)
    try:
        return _TASK_CONTRACT_INDEX[key]
    except KeyError as error:
        raise ValueError(
            f"Unsupported task contract: kind={kind!r}, engine={engine!r}, version={version}"
        ) from error


def list_task_contracts() -> list[dict[str, Any]]:
    return [contract.public_schema() for contract in _TASK_CONTRACTS]


def _public_source_type(source_kind: str) -> str:
    return {
        "literal": "inline",
        "molecule_revision": "molecule-revision",
        "artifact": "artifact",
    }.get(source_kind, source_kind)


def _public_input_formats(
    formats_by_source_kind: Mapping[str, frozenset[str]],
) -> dict[str, list[str]]:
    return {
        _public_source_type(source_kind): sorted(formats)
        for source_kind, formats in formats_by_source_kind.items()
    }


__all__ = [
    "TaskContractDefinition",
    "list_task_contracts",
    "resolve_task_contract",
]
