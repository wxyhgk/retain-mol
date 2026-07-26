"""Built-in JobType handlers that preserve the current runner behavior."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

from .base import StopCheck
from .registry import JobTypeRegistry


@dataclass(frozen=True, slots=True)
class XtbOptimizationJobTypeHandler:
    job_type: str = "xtb-optimization"
    job_type_version: int = 1
    engine_id: str = "xtb"
    collector_id: str | None = "xtb-geometry-optimization"
    collector_version: int | None = 1

    def normalize_job_type_data(
        self, raw_data: Mapping[str, Any]
    ) -> dict[str, Any]:
        from .xtb.request import normalize_xtb_optimization_type_data_v1

        return normalize_xtb_optimization_type_data_v1(raw_data)

    def get_executor(self, engine_id: str) -> Any:
        if engine_id != self.engine_id:
            raise ValueError(
                f"JobType '{self.job_type}' does not support engine '{engine_id}'"
            )
        from .xtb import XtbOptimizationExecutor

        return XtbOptimizationExecutor()

    def get_result_collector(self, engine_id: str) -> Any:
        if engine_id != self.engine_id:
            raise ValueError(
                f"JobType '{self.job_type}' does not support engine '{engine_id}'"
            )
        from .xtb import XtbGeometryOptimizationCollector

        return XtbGeometryOptimizationCollector()

    def run(
        self,
        service: Any,
        job_id: str,
        *,
        stop_check: StopCheck | None = None,
    ) -> Any:
        # Lazy imports preserve the existing execution error boundary and keep
        # persistence-only processes independent from optional engine modules.
        from ..xtb_runner import run_xtb_optimization_job

        return run_xtb_optimization_job(
            service,
            job_id,
            stop_check=stop_check,
            result_collector=self.get_result_collector(self.engine_id),
            execution_adapter=self.get_executor(self.engine_id),
        )


@dataclass(frozen=True, slots=True)
class Psi4JobTypeHandler:
    job_type: str
    collector_id: str
    job_type_version: int = 1
    engine_id: str = "psi4"
    collector_version: int | None = 1

    def normalize_job_type_data(
        self, raw_data: Mapping[str, Any]
    ) -> dict[str, Any]:
        from .psi4.request import normalize_psi4_type_data_v1

        return normalize_psi4_type_data_v1(self.job_type, raw_data)

    def get_executor(self, engine_id: str) -> Any:
        if engine_id != self.engine_id:
            raise ValueError(
                f"JobType '{self.job_type}' does not support engine '{engine_id}'"
            )
        from .psi4 import resolve_psi4_executor

        return resolve_psi4_executor(self.job_type)

    def get_result_collector(self, engine_id: str) -> Any:
        if engine_id != self.engine_id:
            raise ValueError(
                f"JobType '{self.job_type}' does not support engine '{engine_id}'"
            )
        from .psi4 import resolve_psi4_collector

        collector = resolve_psi4_collector(self.job_type)
        if collector.collector_id != self.collector_id:
            raise RuntimeError(
                f"JobType '{self.job_type}' collector metadata is inconsistent"
            )
        return collector

    def run(
        self,
        service: Any,
        job_id: str,
        *,
        stop_check: StopCheck | None = None,
    ) -> Any:
        from ..psi4_runner import run_psi4_job

        return run_psi4_job(
            service,
            job_id,
            stop_check=stop_check,
            result_collector=self.get_result_collector(self.engine_id),
            execution_adapter=self.get_executor(self.engine_id),
        )


def build_builtin_job_type_registry() -> JobTypeRegistry:
    """Return a fresh registry so tests and future app instances stay isolated."""
    return JobTypeRegistry(
        (
            XtbOptimizationJobTypeHandler(),
            Psi4JobTypeHandler("psi4-ts-refine", "psi4-transition-state"),
            Psi4JobTypeHandler("psi4-frequency", "psi4-frequency"),
            Psi4JobTypeHandler("psi4-irc", "psi4-irc"),
        )
    )


__all__ = [
    "Psi4JobTypeHandler",
    "XtbOptimizationJobTypeHandler",
    "build_builtin_job_type_registry",
]
