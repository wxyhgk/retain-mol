"""Tests for trajectories parsed from xTB's native optimization log format."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from software.backend.jobs import JobService
from software.backend.jobs.trajectory import TrajectoryParseError, parse_xtb_trajectory, write_xtb_trajectory
import software.backend.jobs.xtb_runner as xtb_runner
import software.backend.routers.optimize as optimize_router


XTBOPT_LOG = """2
 energy: -5.070512345600 gnorm: 0.1234000000 xtb: 6.6.1
O       0.0000000000       0.0000000000       0.0000000000
H       0.0000000000       0.0000000000       1.0000000000
2
 energy: -5.071234567800 gnorm: 0.0045000000 xtb: 6.6.1
O       0.0100000000       0.0000000000       0.0000000000
H       0.0000000000       0.0100000000       1.0000000000
"""


def test_parses_xtbopt_frames_without_inventing_metrics() -> None:
    trajectory = parse_xtb_trajectory(XTBOPT_LOG)

    assert trajectory == {
        "schemaVersion": 1,
        "engine": "xtb",
        "frames": [
            {
                "step": 1,
                "energy": -5.0705123456,
                "gradient": 0.1234,
                "atoms": [
                    {"symbol": "O", "x": 0.0, "y": 0.0, "z": 0.0},
                    {"symbol": "H", "x": 0.0, "y": 0.0, "z": 1.0},
                ],
            },
            {
                "step": 2,
                "energy": -5.0712345678,
                "gradient": 0.0045,
                "atoms": [
                    {"symbol": "O", "x": 0.01, "y": 0.0, "z": 0.0},
                    {"symbol": "H", "x": 0.0, "y": 0.01, "z": 1.0},
                ],
            },
        ],
    }


def test_uses_cycle_steps_from_xtb_standard_output() -> None:
    trajectory = parse_xtb_trajectory(
        XTBOPT_LOG,
        output="GEOMETRY OPTIMIZATION CYCLE 4\nGEOMETRY OPTIMIZATION CYCLE 5\n",
    )

    assert [frame["step"] for frame in trajectory["frames"]] == [4, 5]


def test_writes_json_artifact_from_xtbopt_log(tmp_path: Path) -> None:
    source = tmp_path / "xtbopt.log"
    destination = tmp_path / "optimization-trajectory.json"
    source.write_text(XTBOPT_LOG, encoding="utf-8")

    trajectory = write_xtb_trajectory(source, destination)

    assert json.loads(destination.read_text(encoding="utf-8")) == trajectory


@pytest.mark.parametrize(
    "content",
    [
        "2\ncoordinates only\nO 0 0 0\nH 0 0 1\n",
        "2\nenergy: -5.0\nO 0 0 0\nH 0 0 1\n",
    ],
)
def test_rejects_trajectory_frames_without_real_energy_and_gradient(content: str) -> None:
    with pytest.raises(TrajectoryParseError, match="no complete frames"):
        parse_xtb_trajectory(content)


def test_runner_registers_trajectory_artifact_from_xtbopt_log(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    service = JobService(tmp_path / "data")
    job = service.create_job(
        "xtb-optimization",
        metadata={
            "request": {
                "structure": {
                    "atoms": [
                        {"id": "oxygen", "symbol": "O", "x": 0.0, "y": 0.0, "z": 0.0},
                        {"id": "hydrogen", "symbol": "H", "x": 0.0, "y": 0.0, "z": 1.0},
                    ],
                },
                "charge": 0,
                "multiplicity": 1,
                "method": "gfn2",
                "maxSteps": 20,
                "optLevel": "normal",
            },
        },
    )

    monkeypatch.setattr(optimize_router, "_build_xtb_command", lambda *_: ["xtb", "input.xyz"])
    monkeypatch.setattr(optimize_router, "_write_xyz", lambda path, _atoms: path.write_text("input\n"))
    monkeypatch.setattr(
        optimize_router,
        "_read_first_existing_xyz",
        lambda *_: [
            {"symbol": "O", "x": 0.01, "y": 0.0, "z": 0.0},
            {"symbol": "H", "x": 0.0, "y": 0.01, "z": 1.0},
        ],
    )
    monkeypatch.setattr(optimize_router, "_parse_energy_steps", lambda _log: (-5.0712345678, 2, True))
    monkeypatch.setattr(
        optimize_router,
        "_prepare_output_atoms",
        lambda atoms, _request: [
            {"id": "oxygen", **atoms[0]},
            {"id": "hydrogen", **atoms[1]},
        ],
    )

    def run(*_args: object, cwd: Path, **_kwargs: object) -> object:
        work = Path(cwd)
        (work / "xtbopt.xyz").write_text(
            "2\noptimized\nO 0.01 0.0 0.0\nH 0.0 0.01 1.0\n",
            encoding="utf-8",
        )
        (work / "xtbopt.log").write_text(XTBOPT_LOG, encoding="utf-8")
        return type(
            "CompletedProcess",
            (),
            {
                "stdout": "GEOMETRY OPTIMIZATION CYCLE 4\nGEOMETRY OPTIMIZATION CYCLE 5\n",
                "stderr": "",
                "returncode": 0,
            },
        )()

    monkeypatch.setattr(xtb_runner.subprocess, "run", run)

    completed = xtb_runner.run_xtb_optimization_job(service, job.job_id)
    artifact = next(item for item in completed.artifacts if item.name == "optimization-trajectory.json")
    artifact_path = service.task_directory(job.job_id) / artifact.path

    assert artifact.media_type == "application/json"
    assert artifact.metadata["frameCount"] == 2
    assert artifact.metadata["finalEnergy"] == -5.0712345678
    assert artifact.metadata["finalGradient"] == 0.0045
    assert [frame["step"] for frame in json.loads(artifact_path.read_text())["frames"]] == [4, 5]
