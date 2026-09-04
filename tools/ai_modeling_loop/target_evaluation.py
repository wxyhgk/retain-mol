from __future__ import annotations

import shutil
from pathlib import Path

from .artifact_contracts import sha256_file
from .contracts import BenchmarkCase
from .evaluator import (
    EVALUATOR_LOADED_SOURCE_SHA256,
    EvaluationResult,
    evaluate_candidate,
)


TARGET_EVALUATOR_SOURCE = Path(__file__).with_name("evaluator.py")


class TargetEvaluationError(RuntimeError):
    """The target evaluator or reference changed across one evaluation."""


def archive_target_evidence(
    *,
    reference_source: Path,
    run_dir: Path,
) -> tuple[Path, Path]:
    archived_reference = run_dir / "target-reference.sdf"
    archived_evaluator = run_dir / "target-evaluator.py"
    if not reference_source.is_file():
        raise TargetEvaluationError(f"target reference is missing: {reference_source}")
    if not TARGET_EVALUATOR_SOURCE.is_file():
        raise TargetEvaluationError(f"target evaluator is missing: {TARGET_EVALUATOR_SOURCE}")
    shutil.copy2(reference_source, archived_reference)
    shutil.copy2(TARGET_EVALUATOR_SOURCE, archived_evaluator)
    return archived_reference, archived_evaluator


def evaluate_archived_target(
    case: BenchmarkCase,
    candidate_path: Path,
    *,
    candidate_metadata: Path | None,
    archived_reference: Path,
    archived_evaluator: Path,
) -> EvaluationResult:
    """Evaluate only against immutable per-run evidence and detect source drift."""

    archived_evaluator_digest = sha256_file(archived_evaluator)
    if archived_evaluator_digest != EVALUATOR_LOADED_SOURCE_SHA256:
        raise TargetEvaluationError("archived evaluator differs from the loaded implementation")
    if sha256_file(TARGET_EVALUATOR_SOURCE) != archived_evaluator_digest:
        raise TargetEvaluationError("target evaluator differs from the archived implementation")
    reference_digest = sha256_file(archived_reference)
    result = evaluate_candidate(
        case,
        candidate_path,
        candidate_metadata=candidate_metadata,
        reference_sdf_path=archived_reference,
    )
    if sha256_file(TARGET_EVALUATOR_SOURCE) != archived_evaluator_digest:
        raise TargetEvaluationError("target evaluator changed during evaluation")
    if sha256_file(archived_reference) != reference_digest:
        raise TargetEvaluationError("target reference changed during evaluation")
    return result
