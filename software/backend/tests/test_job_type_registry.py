from __future__ import annotations

import ast
from dataclasses import dataclass, field
from pathlib import Path
from types import SimpleNamespace
from typing import Any

import pytest

import software.backend.jobs.execution as execution
import software.backend.jobs.psi4_runner as psi4_runner
import software.backend.jobs.xtb_runner as xtb_runner
from software.backend.jobs.job_types import (
    DuplicateJobTypeError,
    JobTypeRegistry,
    UnknownJobTypeError,
    build_builtin_job_type_registry,
)


@dataclass
class _RecordingHandler:
    job_type: str
    calls: list[tuple[Any, str, Any]] = field(default_factory=list)

    def run(self, service: Any, job_id: str, *, stop_check=None) -> str:
        self.calls.append((service, job_id, stop_check))
        return f"ran:{job_id}"


class _Service:
    def __init__(self, job_type: str, *, job_type_version: int = 1) -> None:
        self.job = SimpleNamespace(job_id="job-1", task_type=job_type)
        self.job_type_data = SimpleNamespace(
            job_type=job_type,
            job_type_version=job_type_version,
        )

    def get_job(self, job_id: str) -> Any:
        assert job_id == self.job.job_id
        return self.job

    def get_job_type_data(self, job_id: str) -> Any:
        assert job_id == self.job.job_id
        return self.job_type_data


def test_registry_registers_and_resolves_exact_job_type() -> None:
    handler = _RecordingHandler("example@1")
    registry = JobTypeRegistry([handler])

    assert registry.resolve("example@1") is handler
    assert registry.supports("example@1") is True
    assert registry.supports("example@2") is False
    assert registry.list_job_types() == ("example@1",)


def test_registry_rejects_duplicate_and_unknown_job_types() -> None:
    registry = JobTypeRegistry([_RecordingHandler("example@1")])

    with pytest.raises(DuplicateJobTypeError, match="already registered"):
        registry.register(_RecordingHandler("example@1"))
    with pytest.raises(UnknownJobTypeError, match="example@2"):
        registry.resolve("example@2")


def test_builtin_registry_keeps_each_existing_job_type_explicit() -> None:
    registry = build_builtin_job_type_registry()

    assert registry.list_job_types() == (
        "psi4-frequency",
        "psi4-irc",
        "psi4-ts-refine",
        "xtb-optimization",
    )


def test_builtin_handler_normalizes_its_own_creation_data() -> None:
    registry = build_builtin_job_type_registry()

    normalized = registry.resolve("psi4-ts-refine").normalize_job_type_data(
        {
            "engine": "psi4",
            "parameters": {"method": "hf", "maxSteps": 30},
        }
    )

    assert normalized["engine"] == "psi4"
    assert normalized["parameters"]["method"] == "hf"
    assert normalized["parameters"]["maxSteps"] == 30
    assert normalized["parameters"]["basis"] == "def2-svp"


@pytest.mark.parametrize(
    ("job_type", "runner_module", "runner_name"),
    (
        ("xtb-optimization", xtb_runner, "run_xtb_optimization_job"),
        ("psi4-ts-refine", psi4_runner, "run_psi4_job"),
        ("psi4-frequency", psi4_runner, "run_psi4_job"),
        ("psi4-irc", psi4_runner, "run_psi4_job"),
    ),
)
def test_execution_dispatches_existing_job_types_through_registry(
    monkeypatch: pytest.MonkeyPatch,
    job_type: str,
    runner_module: Any,
    runner_name: str,
) -> None:
    service = _Service(job_type)
    stop_check = lambda: False
    calls: list[tuple[Any, str, Any]] = []

    def fake_runner(
        received_service,
        job_id,
        *,
        stop_check=None,
        result_collector=None,
        execution_adapter=None,
    ):
        expected_collectors = {
            "xtb-optimization": "xtb-geometry-optimization",
            "psi4-ts-refine": "psi4-transition-state",
            "psi4-frequency": "psi4-frequency",
            "psi4-irc": "psi4-irc",
        }
        assert result_collector.collector_id == expected_collectors[job_type]
        assert callable(execution_adapter.execute)
        calls.append((received_service, job_id, stop_check))
        return f"completed:{job_type}"

    monkeypatch.setattr(runner_module, runner_name, fake_runner)

    result = execution.run_persisted_job(
        service,
        service.job.job_id,
        stop_check=stop_check,
    )

    assert result == f"completed:{job_type}"
    assert calls == [(service, service.job.job_id, stop_check)]


def test_execution_rejects_unregistered_job_type() -> None:
    service = _Service("unknown@1")

    with pytest.raises(execution.JobExecutionError, match="unsupported task type"):
        execution.run_persisted_job(service, service.job.job_id)


def test_execution_rejects_job_type_version_mismatch() -> None:
    service = _Service("xtb-optimization", job_type_version=2)

    with pytest.raises(execution.JobExecutionError, match=r"requires .*@2"):
        execution.run_persisted_job(service, service.job.job_id)


def test_job_types_do_not_depend_on_http_routers() -> None:
    job_types_root = Path(__file__).resolve().parents[1] / "jobs" / "job_types"
    violations: list[str] = []

    for source_path in job_types_root.rglob("*.py"):
        tree = ast.parse(source_path.read_text(encoding="utf-8"))
        for node in ast.walk(tree):
            modules: list[str] = []
            if isinstance(node, ast.Import):
                modules.extend(alias.name for alias in node.names)
            elif isinstance(node, ast.ImportFrom) and node.module:
                modules.append(node.module)

            if any(
                module == "routers"
                or module.endswith(".routers")
                or ".routers." in module
                for module in modules
            ):
                relative_path = source_path.relative_to(job_types_root)
                violations.append(f"{relative_path}:{node.lineno}")

    assert violations == []
