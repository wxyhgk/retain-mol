"""Result collector for ``xtb-optimization@1`` executed by xTB."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:
    from engines.xtb import (
        parse_energy_steps,
        prepare_output_atoms,
        read_first_existing_xyz,
    )
except ModuleNotFoundError:
    from software.backend.engines.xtb import (
        parse_energy_steps,
        prepare_output_atoms,
        read_first_existing_xyz,
    )

from ...execution import JobExecutionError
from ...structure_inputs import molecule_with_coordinates
from ...trajectory import write_xtb_trajectory


@dataclass(frozen=True, slots=True)
class XtbCollectionContext:
    service: Any
    job: Any
    run: Any
    request: dict[str, Any]
    optimize_request: Any
    process: Any
    work_directory: Path


@dataclass(frozen=True, slots=True)
class XtbCollectionResult:
    succeeded: bool
    energy: float | None
    steps: int | None
    converged: bool


class XtbGeometryOptimizationCollector:
    """Validate and publish the semantic outputs of one xTB optimization run."""

    collector_id = "xtb-geometry-optimization"
    collector_version = 1

    def collect(self, context: XtbCollectionContext) -> XtbCollectionResult:
        service = context.service
        job = context.job
        run = context.run
        work = context.work_directory
        process = context.process
        log_path = work / "xtb.log"
        log = process.stdout + process.stderr

        service.add_artifact(
            job.job_id,
            "xtb.log",
            "xtb.log",
            media_type="text/plain",
            metadata={
                "role": "output",
                "format": "log",
                "sizeBytes": log_path.stat().st_size,
            },
            run_id=run.run_id,
        )

        optimized_atoms = read_first_existing_xyz(
            work / "xtbopt.xyz",
            work / "input.xtbopt.xyz",
            work / "xtblast.xyz",
            work / "input.xtblast.xyz",
        )
        if optimized_atoms is None:
            raise JobExecutionError(
                "xTB did not produce optimized coordinates "
                f"(exit {process.returncode}).\n{log[-800:]}"
            )

        output_path = work / "optimized.xyz"
        source_path = work / "xtbopt.xyz"
        output_path.write_text(
            source_path.read_text(encoding="utf-8")
            if source_path.exists()
            else _xyz_text(optimized_atoms),
            encoding="utf-8",
        )
        energy, steps, converged = parse_energy_steps(log)
        prepared_atoms = prepare_output_atoms(
            optimized_atoms, context.optimize_request
        )
        structure = {
            "name": context.request.get("structure", {}).get("name")
            or job.metadata.get("name"),
            "atoms": prepared_atoms,
        }
        molecule_snapshot = molecule_with_coordinates(
            context.request.get("molecule"), structure
        )
        service.add_artifact(
            job.job_id,
            "optimized.xyz",
            "optimized.xyz",
            media_type="chemical/x-xyz",
            metadata={
                "role": "output",
                "format": "xyz",
                "sizeBytes": output_path.stat().st_size,
                "structure": structure,
                **(
                    {"molecule": molecule_snapshot}
                    if molecule_snapshot is not None
                    else {}
                ),
                "energy": energy,
                "steps": steps,
                "converged": converged and process.returncode == 0,
            },
            run_id=run.run_id,
        )

        trajectory_source = work / "xtbopt.log"
        if process.returncode == 0 and trajectory_source.is_file():
            trajectory_path = work / "optimization-trajectory.json"
            trajectory = write_xtb_trajectory(
                trajectory_source, trajectory_path, output=log
            )
            frames = trajectory["frames"]
            service.add_artifact(
                job.job_id,
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
                run_id=run.run_id,
            )

        succeeded = process.returncode == 0
        return XtbCollectionResult(
            succeeded=succeeded,
            energy=energy,
            steps=steps,
            converged=converged and succeeded,
        )


def _xyz_text(atoms: list[dict[str, Any]]) -> str:
    lines = [str(len(atoms)), ""]
    lines.extend(
        f"{atom['symbol']} {atom['x']:.10f} {atom['y']:.10f} {atom['z']:.10f}"
        for atom in atoms
    )
    return "\n".join(lines) + "\n"
