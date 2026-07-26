"""Semantic result collection for ``psi4-frequency@1``."""

from __future__ import annotations

from dataclasses import dataclass

from ...execution import JobExecutionError
from .common import (
    Psi4CollectionContext,
    publish_json,
    publish_log,
    require_single_output,
)


@dataclass(frozen=True, slots=True)
class Psi4FrequencyCollectionResult:
    imaginary_frequency_count: int
    frequency_count: int


class Psi4FrequencyCollector:
    collector_id = "psi4-frequency"
    collector_version = 1

    def collect(
        self, context: Psi4CollectionContext
    ) -> Psi4FrequencyCollectionResult:
        output = require_single_output(context, "frequency")
        frequencies = output.result.get("frequenciesCm1")
        imaginary_count = output.result.get("imaginaryFrequencyCount")
        if not isinstance(frequencies, list) or not all(
            isinstance(value, (int, float)) for value in frequencies
        ):
            raise JobExecutionError("Psi4 frequency result has no frequency list")
        if not isinstance(imaginary_count, int):
            raise JobExecutionError(
                "Psi4 frequency result has no imaginary-frequency count"
            )
        publish_json(context, "psi4-result.json")
        publish_log(context, "psi4.log")
        return Psi4FrequencyCollectionResult(
            imaginary_frequency_count=imaginary_count,
            frequency_count=len(frequencies),
        )


__all__ = ["Psi4FrequencyCollectionResult", "Psi4FrequencyCollector"]
