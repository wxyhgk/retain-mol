"""Isolated tests for the durable xTB job runner."""

from __future__ import annotations

from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock

import pytest

from software.backend.jobs import JobService
import software.backend.jobs.xtb_runner as xtb_runner
import software.backend.routers.optimize as optimize_router


def _request() -> dict:
    return {
        "name": "Water optimization",
        "structure": {
            "name": "Water",
            "atoms": [
                {"id": "oxygen", "symbol": "O", "x": 0.0, "y": 0.0, "z": 0.0},
                {"id": "hydrogen", "symbol": "H", "x": 0.0, "y": 0.0, "z": 1.0},
            ],
        },
        "charge": 0,
        "multiplicity": 1,
        "method": "gfn2",
        "maxSteps": 200,
        "optLevel": "normal",
    }


def _molecule_snapshot() -> dict:
    return {
        "name": "Water",
        "atoms": [
            {"id": "oxygen", "symbol": "O", "x": 0.0, "y": 0.0, "z": 0.0, "charge": 0},
            {"id": "hydrogen", "symbol": "H", "x": 0.0, "y": 0.0, "z": 1.0},
        ],
        "bonds": [{"id": "oh", "atomId1": "oxygen", "atomId2": "hydrogen", "order": 1}],
    }


def test_queued_xtb_job_persists_output_log_and_artifacts(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    service = JobService(tmp_path / "data")
    job = service.create_job(
        "xtb-optimization",
        metadata={"name": "Water optimization", "request": _request()},
    )
    output_atoms = [
        {"symbol": "O", "x": 0.1, "y": 0.0, "z": 0.0},
        {"symbol": "H", "x": 0.0, "y": 0.1, "z": 1.0},
    ]

    def fake_write_xyz(path: Path, _atoms: object) -> None:
        path.write_text("input geometry\n", encoding="utf-8")

    def fake_run(command: list[str], *, cwd: Path, **_: object) -> SimpleNamespace:
        assert command == ["xtb", "input.xyz"]
        (Path(cwd) / "xtbopt.xyz").write_text(
            "2\noptimized by fake xTB\nO 0.1 0.0 0.0\nH 0.0 0.1 1.0\n",
            encoding="utf-8",
        )
        return SimpleNamespace(
            stdout="fake stdout\n",
            stderr="fake stderr\n",
            returncode=0,
        )

    monkeypatch.setattr(optimize_router, "_build_xtb_command", lambda *_: ["xtb", "input.xyz"])
    monkeypatch.setattr(optimize_router, "_write_xyz", fake_write_xyz)
    monkeypatch.setattr(optimize_router, "_read_first_existing_xyz", lambda *_: output_atoms)
    monkeypatch.setattr(
        optimize_router,
        "_parse_energy_steps",
        lambda _log: (-76.1234, 8, True),
    )
    monkeypatch.setattr(
        optimize_router,
        "_prepare_output_atoms",
        lambda atoms, _request: [
            {"id": "oxygen", **atoms[0]},
            {"id": "hydrogen", **atoms[1]},
        ],
    )
    monkeypatch.setattr(xtb_runner.subprocess, "run", fake_run)

    completed = xtb_runner.run_xtb_optimization_job(service, job.job_id)

    work = service.task_directory(job.job_id)
    assert completed.status == "succeeded"
    assert (work / "input.xyz").read_text(encoding="utf-8") == "input geometry\n"
    assert (work / "optimized.xyz").read_text(encoding="utf-8") == (
        "2\noptimized by fake xTB\nO 0.1 0.0 0.0\nH 0.0 0.1 1.0\n"
    )
    assert (work / "xtb.log").read_text(encoding="utf-8") == "fake stdout\nfake stderr\n"

    artifacts = {artifact.name: artifact for artifact in completed.artifacts}
    assert set(artifacts) == {"optimized.xyz", "xtb.log"}
    assert artifacts["optimized.xyz"].path == "optimized.xyz"
    assert artifacts["optimized.xyz"].media_type == "chemical/x-xyz"
    assert artifacts["optimized.xyz"].metadata == {
        "role": "output",
        "format": "xyz",
        "sizeBytes": (work / "optimized.xyz").stat().st_size,
        "structure": {
            "name": "Water",
            "atoms": [
                {"id": "oxygen", **output_atoms[0]},
                {"id": "hydrogen", **output_atoms[1]},
            ],
        },
        "energy": -76.1234,
        "steps": 8,
        "converged": True,
    }
    assert artifacts["xtb.log"].path == "xtb.log"
    assert artifacts["xtb.log"].media_type == "text/plain"
    assert artifacts["xtb.log"].metadata == {
        "role": "output",
        "format": "log",
        "sizeBytes": (work / "xtb.log").stat().st_size,
    }


def test_non_queued_xtb_job_cannot_be_run_again(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    service = JobService(tmp_path / "data")
    job = service.create_job(
        "xtb-optimization",
        status="succeeded",
        metadata={"request": _request()},
    )
    run = Mock()
    monkeypatch.setattr(xtb_runner.subprocess, "run", run)

    with pytest.raises(
        xtb_runner.JobExecutionError,
        match="has status 'succeeded'; create a new job to run it again",
    ):
        xtb_runner.run_xtb_optimization_job(service, job.job_id)

    run.assert_not_called()
    assert service.get_job(job.job_id).status == "succeeded"


def test_successful_job_keeps_a_loadable_optimized_molecule_snapshot(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    service = JobService(tmp_path / "data")
    request = _request() | {"molecule": _molecule_snapshot()}
    job = service.create_job("xtb-optimization", metadata={"request": request})

    monkeypatch.setattr(optimize_router, "_build_xtb_command", lambda *_: ["xtb", "input.xyz"])
    monkeypatch.setattr(optimize_router, "_write_xyz", lambda path, _atoms: path.write_text("input\n", encoding="utf-8"))
    monkeypatch.setattr(xtb_runner.subprocess, "run", lambda *_args, **_kwargs: SimpleNamespace(stdout="", stderr="", returncode=0))
    monkeypatch.setattr(optimize_router, "_read_first_existing_xyz", lambda *_: [
        {"symbol": "O", "x": 2.0, "y": 3.0, "z": 4.0},
        {"symbol": "H", "x": 5.0, "y": 6.0, "z": 7.0},
    ])
    monkeypatch.setattr(optimize_router, "_parse_energy_steps", lambda _log: (None, None, True))
    monkeypatch.setattr(optimize_router, "_prepare_output_atoms", lambda atoms, _request: [
        {"id": "oxygen", **atoms[0]}, {"id": "hydrogen", **atoms[1]},
    ])

    completed = xtb_runner.run_xtb_optimization_job(service, job.job_id)
    artifact = next(item for item in completed.artifacts if item.name == "optimized.xyz")

    assert artifact.metadata["molecule"] == {
        "name": "Water",
        "atoms": [
            {"id": "oxygen", "symbol": "O", "x": 2.0, "y": 3.0, "z": 4.0, "charge": 0},
            {"id": "hydrogen", "symbol": "H", "x": 5.0, "y": 6.0, "z": 7.0},
        ],
        "bonds": [{"id": "oh", "atomId1": "oxygen", "atomId2": "hydrogen", "order": 1}],
    }
