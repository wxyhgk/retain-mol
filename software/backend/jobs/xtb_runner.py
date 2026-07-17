"""xTB execution adapter for durable RetainMol jobs.

The optimization algorithm remains owned by ``routers.optimize``.  This
adapter supplies a persistent working directory and records its outputs as
job artifacts instead of creating another optimization implementation.
"""

from __future__ import annotations

import subprocess
from collections.abc import Callable
from pathlib import Path
from typing import Any

try:
    from engines.process_runner import ProcessCancelledError, run_live_process
except ModuleNotFoundError:
    from software.backend.engines.process_runner import (
        ProcessCancelledError,
        run_live_process,
    )

from .execution import JobExecutionError
from .service import JobService
from .structure_inputs import molecule_with_coordinates, resolve_structure_request
from .trajectory import write_xtb_trajectory


def run_xtb_optimization_job(
    service: JobService,
    job_id: str,
    *,
    stop_check: Callable[[], bool] | None = None,
) -> Any:
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
        _execute_claimed_xtb_job(service, claimed_job, stop_check=stop_check)
    except ProcessCancelledError:
        current = service.get_job(job_id)
        if current.status == "running" and stop_check is not None and stop_check():
            return service.update_status(
                job_id,
                "interrupted",
                error="backend stopped while the calculation was running",
                error_code="backend_shutdown",
            )
        return service.get_job(job_id)
    except subprocess.TimeoutExpired as error:
        service.update_status(job_id, "failed", error="xTB job timed out after 5 minutes", error_code="timeout")
        raise JobExecutionError("xTB job timed out after 5 minutes") from error
    except FileNotFoundError as error:
        service.update_status(job_id, "failed", error="xtb command was not found", error_code="command_not_found")
        raise JobExecutionError("xtb command was not found") from error
    except Exception as error:
        if service.get_job(job_id).status == "cancelled":
            return service.get_job(job_id)
        service.update_status(job_id, "failed", error=str(error), error_code="execution_failed")
        if isinstance(error, JobExecutionError):
            raise
        raise JobExecutionError(str(error)) from error

    return service.get_job(job_id)


def _execute_claimed_xtb_job(
    service: JobService,
    job: Any,
    *,
    stop_check: Callable[[], bool] | None = None,
) -> None:
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
    process = run_live_process(
        _build_xtb_command(optimize_request, input_path, work),
        cwd=work,
        log_path=log_path,
        timeout=300,
        cancel_check=lambda: service.get_job(job_id).status == "cancelled"
        or bool(stop_check and stop_check()),
    )
    log = process.stdout + process.stderr
    if service.get_job(job_id).status == "cancelled":
        raise ProcessCancelledError("xTB calculation was cancelled")
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
    molecule_snapshot = molecule_with_coordinates(request.get("molecule"), structure)
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
    """Compose an executable request from frozen snapshots, with legacy fallback."""
    return resolve_structure_request(service, job)


def _xyz_text(atoms: list[dict[str, Any]]) -> str:
    lines = [str(len(atoms)), ""]
    lines.extend(
        f"{atom['symbol']} {atom['x']:.10f} {atom['y']:.10f} {atom['z']:.10f}"
        for atom in atoms
    )
    return "\n".join(lines) + "\n"
