"""Stable execution boundary for one persisted JobType implementation."""

from __future__ import annotations

from collections.abc import Callable, Mapping
from typing import Any, Protocol


StopCheck = Callable[[], bool]


class JobTypeHandler(Protocol):
    """Execute jobs belonging to one exact, registered JobType identifier.

    Execution metadata lets the kernel create a JobRun without branching on
    chemistry. Individual task types may migrate validation and preparation behind
    this handler incrementally.
    """

    job_type: str
    job_type_version: int
    engine_id: str
    collector_id: str | None
    collector_version: int | None

    def normalize_job_type_data(
        self, raw_data: Mapping[str, Any]
    ) -> dict[str, Any]: ...

    def get_executor(self, engine_id: str) -> Any: ...

    def get_result_collector(self, engine_id: str) -> Any | None: ...

    def run(
        self,
        service: Any,
        job_id: str,
        *,
        stop_check: StopCheck | None = None,
    ) -> Any: ...


__all__ = ["JobTypeHandler", "StopCheck"]
