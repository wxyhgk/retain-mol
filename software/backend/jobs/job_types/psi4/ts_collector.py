"""Semantic result collection for ``psi4-ts-refine@1``."""

from __future__ import annotations

from dataclasses import dataclass

from .common import (
    Psi4CollectionContext,
    publish_json,
    publish_log,
    publish_structure,
    require_single_output,
)


@dataclass(frozen=True, slots=True)
class Psi4TransitionStateCollectionResult:
    energy_hartree: float


class Psi4TransitionStateCollector:
    collector_id = "psi4-transition-state"
    collector_version = 1

    def collect(
        self, context: Psi4CollectionContext
    ) -> Psi4TransitionStateCollectionResult:
        output = require_single_output(context, "ts-refine")
        publish_structure(context, output, "transition-state.xyz")
        publish_json(context, "psi4-result.json")
        publish_log(context, "psi4.log")
        return Psi4TransitionStateCollectionResult(
            energy_hartree=float(output.result["energyHartree"])
        )


__all__ = [
    "Psi4TransitionStateCollectionResult",
    "Psi4TransitionStateCollector",
]
