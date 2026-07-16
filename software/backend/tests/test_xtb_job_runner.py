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

    def fake_run(command: list[str], *, cwd: Path, log_path: Path, **_: object) -> SimpleNamespace:
        assert command == ["xtb", "input.xyz"]
        (Path(cwd) / "xtbopt.xyz").write_text(
            "2\noptimized by fake xTB\nO 0.1 0.0 0.0\nH 0.0 0.1 1.0\n",
            encoding="utf-8",
        )
        output = "fake stdout\nfake stderr\n"
        log_path.write_text(output, encoding="utf-8")
        return SimpleNamespace(stdout=output, stderr="", returncode=0)

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
    monkeypatch.setattr(xtb_runner, "run_live_process", fake_run)

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
    job = service.create_job("xtb-optimization", metadata={"request": _request()})
    assert service.claim_queued_job(job.job_id) is not None
    service.update_status(job.job_id, "succeeded")
    run = Mock()
    monkeypatch.setattr(xtb_runner, "run_live_process", run)

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
    monkeypatch.setattr(xtb_runner, "run_live_process", lambda *_args, log_path, **_kwargs: (log_path.write_text("", encoding="utf-8"), SimpleNamespace(stdout="", stderr="", returncode=0))[1])
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


def test_missing_request_finishes_as_failed_instead_of_staying_running(tmp_path: Path) -> None:
    service = JobService(tmp_path / "data")
    job = service.create_job("xtb-optimization")

    with pytest.raises(xtb_runner.JobExecutionError, match="no executable xTB request"):
        xtb_runner.run_xtb_optimization_job(service, job.job_id)

    failed = service.get_job(job.job_id)
    assert failed.status == "failed"
    assert failed.error_code == "execution_failed"


def test_runner_composes_new_request_from_spec_and_frozen_literal(tmp_path: Path) -> None:
    service = JobService(tmp_path / "data")
    request = _request() | {"molecule": _molecule_snapshot()}
    job = service.create_calculation_job(
        "xtb-optimization",
        "xtb",
        request,
        metadata={"name": request["name"], "request": request},
    )

    resolved = xtb_runner._resolve_xtb_request(service, job)

    assert resolved is not None
    assert resolved["method"] == "gfn2"
    assert resolved["structure"] == request["structure"]
    assert resolved["molecule"] == request["molecule"]
    spec = service.get_calculation_spec(job.job_id)
    assert spec is not None
    assert "structure" not in spec.payload
    assert "molecule" not in spec.payload


def test_runner_reads_xyz_from_a_frozen_artifact_binding(tmp_path: Path) -> None:
    service = JobService(tmp_path / "data")
    source = service.create_job("producer")
    assert service.claim_queued_job(source.job_id) is not None
    output = service.task_directory(source.job_id) / "optimized.xyz"
    output.write_text("2\nwater\nO 0 0 0\nH 0 0 1\n", encoding="utf-8")
    artifact = service.add_artifact(
        source.job_id,
        "optimized.xyz",
        "optimized.xyz",
        metadata={"role": "output", "format": "xyz"},
    )
    service.update_status(source.job_id, "succeeded")
    draft = service.create_calculation_draft(
        "xtb-optimization",
        "xtb",
        {
            "charge": 0,
            "multiplicity": 1,
            "method": "gfn2",
            "maxSteps": 200,
            "optLevel": "normal",
        },
    )
    queued = service.queue_calculation_job(
        draft.job_id,
        {
            "structure": {
                "sourceKind": "artifact",
                "artifactId": artifact.artifact_id,
                "format": "xyz",
                "contentSha256": artifact.sha256,
            }
        },
    )

    resolved = xtb_runner._resolve_xtb_request(service, queued)

    assert resolved is not None
    assert [atom["symbol"] for atom in resolved["structure"]["atoms"]] == ["O", "H"]


def test_runner_composes_request_from_an_immutable_molecule_revision(
    tmp_path: Path,
) -> None:
    service = JobService(tmp_path / "data")
    asset = service.create_molecule_asset("Water")
    molecule = _molecule_snapshot()
    revision = service.save_molecule_revision(
        asset.asset_id,
        molecule,
        parent_revision_id=None,
        expected_head_revision_id=None,
        expected_version=asset.version,
    )
    draft = service.create_calculation_draft(
        "xtb-optimization",
        "xtb",
        {
            "charge": 0,
            "multiplicity": 1,
            "method": "gfn2",
            "maxSteps": 200,
            "optLevel": "normal",
        },
    )
    queued = service.queue_calculation_job(
        draft.job_id,
        {
            "structure": {
                "sourceKind": "molecule_revision",
                "moleculeRevisionId": revision.revision_id,
                "format": "molecule",
                "contentSha256": revision.sha256,
            }
        },
    )

    resolved = xtb_runner._resolve_xtb_request(service, queued)

    assert resolved is not None
    assert resolved["molecule"] == molecule
    assert resolved["structure"]["atoms"] == molecule["atoms"]
    binding = service.get_input_bindings(queued.job_id)[0]
    assert binding.molecule_revision_id == revision.revision_id
    assert binding.content_sha256 == revision.sha256
