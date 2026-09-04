"""Semantic result collection for ``psi4-irc@1``."""

from __future__ import annotations

from dataclasses import dataclass

from ...execution import JobExecutionError
from .common import (
    Psi4CollectionContext,
    publish_irc_trajectory,
    publish_json,
    publish_log,
    publish_structure,
)


@dataclass(frozen=True, slots=True)
class Psi4IrcCollectionResult:
    directions: tuple[str, ...]


class Psi4IrcCollector:
    collector_id = "psi4-irc"
    collector_version = 1

    def collect(self, context: Psi4CollectionContext) -> Psi4IrcCollectionResult:
        requested = context.request.get("direction", "both")
        expected = (
            ("forward", "backward") if requested == "both" else (requested,)
        )
        outputs = {output.direction: output for output in context.outputs}
        if None in outputs or set(outputs) != set(expected):
            raise JobExecutionError(
                "Psi4 IRC outputs do not match requested directions"
            )

        for direction in expected:
            output = outputs[direction]
            if output.result.get("operation") != "irc":
                raise JobExecutionError("Psi4 IRC result has an invalid operation")
            publish_structure(
                context, output, f"irc-{direction}-endpoint.xyz"
            )
            publish_json(
                context,
                f"irc-{direction}.json",
                source=output.work_directory / "psi4-result.json",
            )
            publish_log(
                context,
                f"psi4-{direction}.log",
                source=output.work_directory / "psi4.log",
            )
            publish_irc_trajectory(
                context, output, f"irc-{direction}-trajectory.json"
            )
        return Psi4IrcCollectionResult(directions=expected)


__all__ = ["Psi4IrcCollectionResult", "Psi4IrcCollector"]
