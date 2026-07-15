"""xTB execution adapter for durable RetainMol jobs.

The optimization algorithm remains owned by ``routers.optimize``.  This
adapter supplies a persistent working directory and records its outputs as
job artifacts instead of creating another optimization implementation.
"""

from __future__ import annotations

import hashlib
import json
import subprocess
from collections.abc import Mapping
from copy import deepcopy
from pathlib import Path
from typing import Any

from .molecule_canonicalize import molecule_content_hash
from .service import JobService
from .trajectory import write_xtb_trajectory


class JobExecutionError(RuntimeError):
    """Raised when a persisted job cannot be executed."""


def run_xtb_optimization_job(service: JobService, job_id: str) -> Any:
    """Run one queued xTB job synchronously and persist its result files."""
    job = service.get_job(job_id)
    if job.task_type != "xtb-optimization":
        raise JobExecutionError(f"Job '{job_id}' is not an xTB optimization")
    claimed_job = service.claim_queued_job(job_id)
    if claimed_job is None:
        current_job = service.get_job(job_id)
        raise JobExecutionError(
            f"Job '{job_id}' has status '{current_job.status}'; create a new job to run it again"
        )
    try:
        _execute_claimed_xtb_job(service, claimed_job)
    except subprocess.TimeoutExpired as error:
        service.update_status(job_id, "failed", error="xTB job timed out after 5 minutes", error_code="timeout")
        raise JobExecutionError("xTB job timed out after 5 minutes") from error
    except FileNotFoundError as error:
        service.update_status(job_id, "failed", error="xtb command was not found", error_code="command_not_found")
        raise JobExecutionError("xtb command was not found") from error
    except Exception as error:
        service.update_status(job_id, "failed", error=str(error), error_code="execution_failed")
        if isinstance(error, JobExecutionError):
            raise
        raise JobExecutionError(str(error)) from error

    return service.get_job(job_id)


def _execute_claimed_xtb_job(service: JobService, job: Any) -> None:
    job_id = job.job_id
    request = _resolve_xtb_request(service, job)
    if not isinstance(request, dict):
        raise JobExecutionError(f"Job '{job_id}' has no executable xTB request")

    # Import here so persistence-only tests do not require the optimization route.
    try:
        from routers.optimize import (
            Atom,
            OptimizeRequest,
            _build_xtb_command,
            _parse_energy_steps,
            _prepare_output_atoms,
            _read_first_existing_xyz,
            _write_xyz,
        )
    except ModuleNotFoundError:
        from software.backend.routers.optimize import (
            Atom,
            OptimizeRequest,
            _build_xtb_command,
            _parse_energy_steps,
            _prepare_output_atoms,
            _read_first_existing_xyz,
            _write_xyz,
        )

    try:
        optimize_request = OptimizeRequest(
            atoms=[Atom.model_validate(atom) for atom in request["structure"]["atoms"]],
            charge=request["charge"],
            multiplicity=request["multiplicity"],
            method=request["method"],
            max_steps=request["maxSteps"],
            optlevel=request["optLevel"],
        )
    except (KeyError, TypeError, ValueError) as error:
        raise JobExecutionError(f"Job '{job_id}' has an invalid xTB request: {error}") from error

    work = service.task_directory(job_id)
    input_path = work / "input.xyz"
    log_path = work / "xtb.log"
    output_path = work / "optimized.xyz"
    trajectory_path = work / "optimization-trajectory.json"
    _write_xyz(input_path, optimize_request.atoms)
    process = subprocess.run(
        _build_xtb_command(optimize_request, input_path, work),
        cwd=work,
        capture_output=True,
        text=True,
        timeout=300,
    )
    log = process.stdout + process.stderr
    log_path.write_text(log, encoding="utf-8")
    optimized_atoms = _read_first_existing_xyz(
        work / "xtbopt.xyz",
        work / "input.xtbopt.xyz",
        work / "xtblast.xyz",
        work / "input.xtblast.xyz",
    )
    if optimized_atoms is None:
        raise JobExecutionError(
            f"xTB did not produce optimized coordinates (exit {process.returncode}).\n{log[-800:]}"
        )

    output_path.write_text(
        (work / "xtbopt.xyz").read_text(encoding="utf-8")
        if (work / "xtbopt.xyz").exists()
        else _xyz_text(optimized_atoms),
        encoding="utf-8",
    )
    energy, steps, converged = _parse_energy_steps(log)
    prepared_atoms = _prepare_output_atoms(optimized_atoms, optimize_request)
    structure = {
        "name": request.get("structure", {}).get("name") or job.metadata.get("name"),
        "atoms": prepared_atoms,
    }
    molecule_snapshot = _optimized_molecule_snapshot(request.get("molecule"), structure)
    service.add_artifact(
        job_id,
        "optimized.xyz",
        "optimized.xyz",
        media_type="chemical/x-xyz",
        metadata={
            "role": "output",
            "format": "xyz",
            "sizeBytes": output_path.stat().st_size,
            "structure": structure,
            **({"molecule": molecule_snapshot} if molecule_snapshot is not None else {}),
            "energy": energy,
            "steps": steps,
            "converged": converged and process.returncode == 0,
        },
    )
    service.add_artifact(
        job_id,
        "xtb.log",
        "xtb.log",
        media_type="text/plain",
        metadata={"role": "output", "format": "log", "sizeBytes": log_path.stat().st_size},
    )
    if process.returncode == 0 and (work / "xtbopt.log").is_file():
        trajectory = write_xtb_trajectory(work / "xtbopt.log", trajectory_path, output=log)
        frames = trajectory["frames"]
        service.add_artifact(
            job_id,
            "optimization-trajectory.json",
            "optimization-trajectory.json",
            media_type="application/json",
            metadata={
                "role": "output",
                "format": "trajectory-json",
                "sizeBytes": trajectory_path.stat().st_size,
                "frameCount": len(frames),
                "finalEnergy": frames[-1]["energy"],
                "finalGradient": frames[-1]["gradient"],
            },
        )
    service.update_status(job_id, "succeeded" if process.returncode == 0 else "failed")


def _resolve_xtb_request(service: JobService, job: Any) -> dict[str, Any] | None:
    """Compose an executable request from frozen bindings, with legacy fallback."""
    spec = service.get_calculation_spec(job.job_id)
    bindings = service.get_input_bindings(job.job_id)
    if spec is not None and bindings:
        structure_binding = next(
            (binding for binding in bindings if binding.input_name == "structure"),
            None,
        )
        if structure_binding is None:
            raise JobExecutionError(
                f"Job '{job.job_id}' has no supported frozen structure binding"
            )
        if structure_binding.source_kind == "molecule_revision":
            revision = service.get_molecule_revision(
                structure_binding.molecule_revision_id or ""
            )
            if revision.sha256 != structure_binding.content_sha256:
                raise JobExecutionError(
                    f"Job '{job.job_id}' frozen molecule revision failed its digest check"
                )
            if molecule_content_hash(revision.structure) != revision.sha256:
                raise JobExecutionError(
                    f"Molecule revision '{revision.revision_id}' failed its content digest check"
                )
            request = dict(spec.payload)
            request["molecule"] = deepcopy(revision.structure)
            request["structure"] = {
                key: deepcopy(value)
                for key, value in revision.structure.items()
                if key in {"name", "atoms"}
            }
            return request
        if structure_binding.source_kind == "artifact":
            artifact = service.get_artifact(structure_binding.artifact_id or "")
            if artifact.sha256 != structure_binding.content_sha256:
                raise JobExecutionError(
                    f"Job '{job.job_id}' frozen artifact binding failed its digest check"
                )
            request = dict(spec.payload)
            structure = artifact.metadata.get("structure")
            if isinstance(structure, Mapping):
                request["structure"] = dict(structure)
            elif artifact.format == "xyz" and artifact.storage_key:
                path = service.artifact_storage.resolve(artifact.storage_key)
                payload = path.read_bytes()
                if hashlib.sha256(payload).hexdigest() != artifact.sha256:
                    raise JobExecutionError(
                        f"Artifact '{artifact.artifact_id}' failed its content digest check"
                    )
                request["structure"] = _structure_from_xyz(payload.decode("utf-8"))
            else:
                raise JobExecutionError(
                    f"Artifact '{artifact.artifact_id}' has no executable structure snapshot"
                )
            molecule = artifact.metadata.get("molecule")
            if isinstance(molecule, Mapping):
                request["molecule"] = dict(molecule)
            return request
        if structure_binding.source_kind != "literal":
            raise JobExecutionError(
                f"Job '{job.job_id}' frozen structure source is not supported"
            )
        literal = structure_binding.literal_value
        if _canonical_json_sha256(literal) != structure_binding.content_sha256:
            raise JobExecutionError(
                f"Job '{job.job_id}' frozen structure binding failed its digest check"
            )
        if not isinstance(literal, Mapping):
            raise JobExecutionError(
                f"Job '{job.job_id}' frozen structure binding is not an object"
            )
        request = dict(spec.payload)
        if isinstance(literal.get("structure"), Mapping):
            request["structure"] = dict(literal["structure"])
        elif isinstance(literal.get("atoms"), list):
            request["structure"] = dict(literal)
        else:
            raise JobExecutionError(
                f"Job '{job.job_id}' frozen structure binding has no structure"
            )
        if isinstance(literal.get("molecule"), Mapping):
            request["molecule"] = dict(literal["molecule"])
        return request
    if spec is not None:
        return dict(spec.payload)
    request = job.metadata.get("request")
    return request if isinstance(request, dict) else None


def _canonical_json_sha256(value: Any) -> str:
    payload = json.dumps(
        value,
        ensure_ascii=True,
        allow_nan=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def _structure_from_xyz(payload: str) -> dict[str, Any]:
    lines = payload.splitlines()
    try:
        atom_count = int(lines[0].strip())
        atom_lines = lines[2 : 2 + atom_count]
        atoms = []
        for index, line in enumerate(atom_lines):
            symbol, x, y, z, *_ = line.split()
            atoms.append(
                {
                    "id": f"atom-{index + 1}",
                    "symbol": symbol,
                    "x": float(x),
                    "y": float(y),
                    "z": float(z),
                }
            )
    except (IndexError, TypeError, ValueError) as error:
        raise JobExecutionError(f"Invalid XYZ artifact: {error}") from error
    if len(atoms) != atom_count:
        raise JobExecutionError("Invalid XYZ artifact: atom count does not match")
    return {"atoms": atoms}


def _xyz_text(atoms: list[dict[str, Any]]) -> str:
    lines = [str(len(atoms)), ""]
    lines.extend(
        f"{atom['symbol']} {atom['x']:.10f} {atom['y']:.10f} {atom['z']:.10f}"
        for atom in atoms
    )
    return "\n".join(lines) + "\n"


def _optimized_molecule_snapshot(value: Any, structure: dict[str, Any]) -> dict[str, Any] | None:
    """Keep a submitted graph intact while replacing atom coordinates."""
    if not isinstance(value, dict):
        return None
    atoms = value.get("atoms")
    bonds = value.get("bonds")
    if not isinstance(atoms, list) or not isinstance(bonds, list):
        return None
    positions = {
        atom.get("id"): atom
        for atom in structure["atoms"]
        if isinstance(atom, dict) and isinstance(atom.get("id"), str)
    }
    if len(positions) != len(atoms):
        return None
    snapshot = deepcopy(value)
    for atom in snapshot["atoms"]:
        if not isinstance(atom, dict) or not isinstance(atom.get("id"), str):
            return None
        position = positions.get(atom["id"])
        if position is None or position.get("symbol") != atom.get("symbol"):
            return None
        atom.update({key: position[key] for key in ("x", "y", "z")})
    snapshot["name"] = structure.get("name") or snapshot.get("name")
    return snapshot
