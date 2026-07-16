"""Psi4 execution adapter for durable RetainMol calculation jobs."""

from __future__ import annotations

import json
import shutil
from collections.abc import Callable
from pathlib import Path
from typing import Any

from .execution import JobExecutionError
from .service import JobService
from .structure_inputs import molecule_with_coordinates, resolve_structure_request

try:
    from engines.psi4_engine import (
        Psi4CancelledError,
        Psi4ExecutionError,
        run_psi4_operation,
    )
except ModuleNotFoundError:
    from software.backend.engines.psi4_engine import (
        Psi4CancelledError,
        Psi4ExecutionError,
        run_psi4_operation,
    )


PSI4_JOB_TYPES = frozenset({"psi4-ts-refine", "psi4-frequency", "psi4-irc"})


def run_psi4_job(
    service: JobService,
    job_id: str,
    *,
    stop_check: Callable[[], bool] | None = None,
) -> Any:
    """Run one queued Psi4 job and publish immutable result artifacts."""
    job = service.get_job(job_id)
    if job.task_type not in PSI4_JOB_TYPES:
        raise JobExecutionError(f"Job '{job_id}' is not a supported Psi4 job")
    claimed = service.claim_queued_job(job_id)
    if claimed is None:
        current = service.get_job(job_id)
        raise JobExecutionError(
            f"Job '{job_id}' has status '{current.status}'; create a new job to run it again"
        )
    try:
        _execute_claimed_psi4_job(service, claimed, stop_check=stop_check)
    except Psi4CancelledError:
        current = service.get_job(job_id)
        if current.status == "running" and stop_check is not None and stop_check():
            return service.update_status(
                job_id,
                "interrupted",
                error="backend stopped while the calculation was running",
                error_code="backend_shutdown",
            )
        return service.get_job(job_id)
    except Psi4ExecutionError as error:
        if service.get_job(job_id).status == "cancelled":
            return service.get_job(job_id)
        service.update_status(
            job_id, "failed", error=str(error), error_code="psi4_execution_failed"
        )
        raise JobExecutionError(str(error)) from error
    except Exception as error:
        if service.get_job(job_id).status == "cancelled":
            return service.get_job(job_id)
        service.update_status(
            job_id, "failed", error=str(error), error_code="execution_failed"
        )
        if isinstance(error, JobExecutionError):
            raise
        raise JobExecutionError(str(error)) from error
    return service.get_job(job_id)


def _execute_claimed_psi4_job(
    service: JobService,
    job: Any,
    *,
    stop_check: Callable[[], bool] | None = None,
) -> None:
    request = resolve_structure_request(service, job)
    if not isinstance(request, dict) or not isinstance(
        request.get("structure", {}).get("atoms"), list
    ):
        raise JobExecutionError(
            f"Job '{job.job_id}' has no executable Psi4 structure"
        )
    payload = {
        **request,
        "atoms": request["structure"]["atoms"],
    }
    work = service.task_directory(job.job_id)
    timeout = int(payload.pop("timeoutSeconds", 3600))

    if job.task_type == "psi4-irc":
        requested_direction = payload.pop("direction", "both")
        directions = (
            ("forward", "backward")
            if requested_direction == "both"
            else (requested_direction,)
        )
        for direction in directions:
            branch = work / f"irc-{direction}"
            result = run_psi4_operation(
                {**payload, "operation": "irc", "direction": direction},
                branch,
                timeout=timeout,
                cancel_check=lambda: service.get_job(job.job_id).status == "cancelled"
                or bool(stop_check and stop_check()),
            )
            _ensure_not_cancelled(service, job.job_id)
            _publish_irc_branch(service, job, request, direction, branch, result)
    else:
        operation = "ts-refine" if job.task_type == "psi4-ts-refine" else "frequency"
        result = run_psi4_operation(
            {**payload, "operation": operation},
            work,
            timeout=timeout,
            cancel_check=lambda: service.get_job(job.job_id).status == "cancelled"
            or bool(stop_check and stop_check()),
        )
        _ensure_not_cancelled(service, job.job_id)
        if operation == "ts-refine":
            _publish_structure_result(
                service,
                job,
                request,
                result,
                filename="transition-state.xyz",
            )
        _publish_json_artifact(service, job.job_id, "psi4-result.json")
        _publish_log_artifact(service, job.job_id, "psi4.log")
    service.update_status(job.job_id, "succeeded")


def _ensure_not_cancelled(service: JobService, job_id: str) -> None:
    if service.get_job(job_id).status == "cancelled":
        raise Psi4CancelledError("Psi4 calculation was cancelled")


def _publish_irc_branch(
    service: JobService,
    job: Any,
    request: dict[str, Any],
    direction: str,
    branch: Path,
    result: dict[str, Any],
) -> None:
    result_name = f"irc-{direction}.json"
    log_name = f"psi4-{direction}.log"
    shutil.copy2(branch / "psi4-result.json", service.task_directory(job.job_id) / result_name)
    shutil.copy2(branch / "psi4.log", service.task_directory(job.job_id) / log_name)
    _publish_structure_result(
        service,
        job,
        request,
        result,
        filename=f"irc-{direction}-endpoint.xyz",
    )
    _publish_json_artifact(service, job.job_id, result_name)
    _publish_log_artifact(service, job.job_id, log_name)
    trajectory = branch / "irc-trajectory.json"
    if trajectory.is_file():
        trajectory_name = f"irc-{direction}-trajectory.json"
        shutil.copy2(trajectory, service.task_directory(job.job_id) / trajectory_name)
        _publish_irc_trajectory(service, job.job_id, trajectory_name, result)


def _publish_structure_result(
    service: JobService,
    job: Any,
    request: dict[str, Any],
    result: dict[str, Any],
    *,
    filename: str,
) -> None:
    structure = result.get("structure")
    if not isinstance(structure, dict) or not isinstance(structure.get("atoms"), list):
        raise JobExecutionError("Psi4 result does not contain an output structure")
    structure["name"] = request.get("structure", {}).get("name") or job.metadata.get("name")
    path = service.task_directory(job.job_id) / filename
    path.write_text(_xyz_text(structure["atoms"], filename), encoding="utf-8")
    molecule = molecule_with_coordinates(request.get("molecule"), structure)
    service.add_artifact(
        job.job_id,
        filename,
        filename,
        media_type="chemical/x-xyz",
        metadata={
            "role": "output",
            "format": "xyz",
            "sizeBytes": path.stat().st_size,
            "structure": structure,
            **({"molecule": molecule} if molecule is not None else {}),
            "energyHartree": result["energyHartree"],
        },
    )


def _publish_json_artifact(service: JobService, job_id: str, filename: str) -> None:
    path = service.task_directory(job_id) / filename
    result = json.loads(path.read_text(encoding="utf-8"))
    service.add_artifact(
        job_id,
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
    )


def _publish_log_artifact(service: JobService, job_id: str, filename: str) -> None:
    path = service.task_directory(job_id) / filename
    service.add_artifact(
        job_id,
        filename,
        filename,
        media_type="text/plain",
        metadata={
            "role": "output",
            "format": "log",
            "sizeBytes": path.stat().st_size,
        },
    )


def _publish_irc_trajectory(
    service: JobService,
    job_id: str,
    filename: str,
    result: dict[str, Any],
) -> None:
    path = service.task_directory(job_id) / filename
    service.add_artifact(
        job_id,
        filename,
        filename,
        media_type="application/json",
        metadata={
            "role": "output",
            "format": "irc-trajectory-json",
            "sizeBytes": path.stat().st_size,
            "direction": result.get("direction"),
            "pointCount": result.get("ircPointCount"),
        },
    )


def _xyz_text(atoms: list[dict[str, Any]], comment: str) -> str:
    lines = [str(len(atoms)), comment]
    lines.extend(
        f"{atom['symbol']} {atom['x']:.12f} {atom['y']:.12f} {atom['z']:.12f}"
        for atom in atoms
    )
    return "\n".join(lines) + "\n"


__all__ = ["PSI4_JOB_TYPES", "run_psi4_job"]
