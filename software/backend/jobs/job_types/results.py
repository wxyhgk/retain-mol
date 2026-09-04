"""Result collection boundary shared by versioned JobType implementations."""

from __future__ import annotations

from typing import Any, Protocol


class ResultCollector(Protocol):
    """Interpret one engine work directory for one exact JobType version."""

    collector_id: str
    collector_version: int

    def collect(self, context: Any) -> Any: ...


__all__ = ["ResultCollector"]
