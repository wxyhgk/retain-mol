"""Tests for the process-isolated Psi4 adapter."""

from __future__ import annotations

import json
from pathlib import Path
from types import SimpleNamespace

import pytest

from software.backend.engines import psi4_engine


def _request() -> dict:
    return {
        "atoms": [
            {"id": "h1", "symbol": "H", "x": 0.0, "y": 0.0, "z": -0.35},
            {"id": "h2", "symbol": "H", "x": 0.0, "y": 0.0, "z": 0.35},
        ],
        "charge": 0,
        "multiplicity": 1,
        "method": "hf",
        "basis": "sto-3g",
        "scfType": "df",
        "threads": 1,
        "memoryMb": 512,
    }


def test_single_point_runs_worker_and_reads_result(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        psi4_engine,
        "detect_psi4_runtime",
        lambda: psi4_engine.Psi4RuntimeInfo(True, "1.11", "/python"),
    )

    def fake_run(
        command: list[str], *, cwd: Path, log_path: Path, **_: object
    ) -> SimpleNamespace:
        assert command[0] == psi4_engine.sys.executable
        payload = json.loads(Path(command[2]).read_text(encoding="utf-8"))
        Path(payload["outputPath"]).write_text(
            json.dumps(
                {
                    "energyHartree": -1.117,
                    "method": "hf",
                    "basis": "sto-3g",
                    "psi4Version": "1.11",
                }
            ),
            encoding="utf-8",
        )
        log_path.write_text("Psi4 fake worker\n", encoding="utf-8")
        return SimpleNamespace(returncode=0, stdout="", stderr="")

    monkeypatch.setattr(psi4_engine, "run_live_process", fake_run)

    result = psi4_engine.run_psi4_single_point(_request())

    assert result["energyHartree"] == -1.117
    assert result["psi4Version"] == "1.11"


def test_missing_runtime_fails_before_starting_worker(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        psi4_engine,
        "detect_psi4_runtime",
        lambda: psi4_engine.Psi4RuntimeInfo(False, None, "/python"),
    )
    with pytest.raises(psi4_engine.Psi4ExecutionError, match="unavailable"):
        psi4_engine.run_psi4_single_point(_request())
