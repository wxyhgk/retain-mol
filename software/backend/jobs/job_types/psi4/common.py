"""Shared file publication primitives for Psi4 result collectors."""

from __future__ import annotations

import json
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ...execution import JobExecutionError
from ...structure_inputs import molecule_with_coordinates


@dataclass(frozen=True, slots=True)
class Psi4OperationOutput:
    """Raw output from one Psi4 engine invocation."""

    work_directory: Path
    result: dict[str, Any]
    direction: str | None = None


@dataclass(frozen=True, slots=True)
class Psi4CollectionContext:
    """Stable inputs available to every Psi4 result collector."""

    service: Any
    job: Any
    run: Any
    request: dict[str, Any]
    work_directory: Path
    outputs: tuple[Psi4OperationOutput, ...]


def require_single_output(
    context: Psi4CollectionContext, operation: str
) -> Psi4OperationOutput:
    if len(context.outputs) != 1:
        raise JobExecutionError(
            f"Psi4 {operation} collector expected one engine output, "
            f"received {len(context.outputs)}"
        )
    output = context.outputs[0]
    if output.result.get("operation") != operation:
        raise JobExecutionError(
            f"Psi4 result operation must be '{operation}'"
        )
    return output


def publish_structure(
    context: Psi4CollectionContext,
    output: Psi4OperationOutput,
    filename: str,
) -> None:
    structure_value = output.result.get("structure")
    if not isinstance(structure_value, dict):
        raise JobExecutionError("Psi4 result does not contain an output structure")
    atoms = structure_value.get("atoms")
    if not isinstance(atoms, list) or not atoms:
        raise JobExecutionError("Psi4 output structure does not contain atoms")
    if not isinstance(output.result.get("energyHartree"), (int, float)):
        raise JobExecutionError("Psi4 structure result does not contain an energy")

    structure = dict(structure_value)
    structure["name"] = (
        context.request.get("structure", {}).get("name")
        or context.job.metadata.get("name")
    )
    path = context.work_directory / filename
    path.write_text(_xyz_text(atoms, filename), encoding="utf-8")
    molecule = molecule_with_coordinates(context.request.get("molecule"), structure)
    context.service.add_artifact(
        context.job.job_id,
        filename,
        filename,
        media_type="chemical/x-xyz",
        metadata={
            "role": "output",
            "format": "xyz",
            "sizeBytes": path.stat().st_size,
            "structure": structure,
            **({"molecule": molecule} if molecule is not None else {}),
            "energyHartree": output.result["energyHartree"],
        },
        run_id=context.run.run_id,
    )


def publish_json(
    context: Psi4CollectionContext,
    filename: str,
    *,
    source: Path | None = None,
) -> dict[str, Any]:
    path = context.work_directory / filename
    if source is not None:
        if not source.is_file():
            raise JobExecutionError(f"Psi4 did not produce '{source.name}'")
        shutil.copy2(source, path)
    if not path.is_file():
        raise JobExecutionError(f"Psi4 did not produce '{filename}'")
    result = json.loads(path.read_text(encoding="utf-8"))
    context.service.add_artifact(
        context.job.job_id,
        filename,
        filename,
        media_type="application/json",
        metadata={
            "role": "output",
            "format": "psi4-json",
            "sizeBytes": path.stat().st_size,
            "operation": result.get("operation"),
            "energyHartree": result.get("energyHartree"),
            **(
                {"imaginaryFrequencyCount": result["imaginaryFrequencyCount"]}
                if "imaginaryFrequencyCount" in result
                else {}
            ),
        },
        run_id=context.run.run_id,
    )
    return result


def publish_log(
    context: Psi4CollectionContext,
    filename: str,
    *,
    source: Path | None = None,
) -> None:
    path = context.work_directory / filename
    if source is not None:
        if not source.is_file():
            raise JobExecutionError(f"Psi4 did not produce '{source.name}'")
        shutil.copy2(source, path)
    if not path.is_file():
        raise JobExecutionError(f"Psi4 did not produce '{filename}'")
    context.service.add_artifact(
        context.job.job_id,
        filename,
        filename,
        media_type="text/plain",
        metadata={
            "role": "output",
            "format": "log",
            "sizeBytes": path.stat().st_size,
        },
        run_id=context.run.run_id,
    )


def publish_irc_trajectory(
    context: Psi4CollectionContext,
    output: Psi4OperationOutput,
    filename: str,
) -> None:
    source = output.work_directory / "irc-trajectory.json"
    if not source.is_file():
        return
    path = context.work_directory / filename
    shutil.copy2(source, path)
    context.service.add_artifact(
        context.job.job_id,
        filename,
        filename,
        media_type="application/json",
        metadata={
            "role": "output",
            "format": "irc-trajectory-json",
            "sizeBytes": path.stat().st_size,
            "direction": output.result.get("direction") or output.direction,
            "pointCount": output.result.get("ircPointCount"),
        },
        run_id=context.run.run_id,
    )


def _xyz_text(atoms: list[dict[str, Any]], comment: str) -> str:
    lines = [str(len(atoms)), comment]
    lines.extend(
        f"{atom['symbol']} {atom['x']:.12f} {atom['y']:.12f} {atom['z']:.12f}"
        for atom in atoms
    )
    return "\n".join(lines) + "\n"


__all__ = [
    "Psi4CollectionContext",
    "Psi4OperationOutput",
    "publish_irc_trajectory",
    "publish_json",
    "publish_log",
    "publish_structure",
    "require_single_output",
]
