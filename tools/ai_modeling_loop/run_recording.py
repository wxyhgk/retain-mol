from __future__ import annotations

from pathlib import Path
from typing import Callable

from .evaluator import EvaluationResult
from .run_preparation import PreparedRun


def write_run_record(
    *,
    prepared: PreparedRun,
    executor_return_code: int,
    executor_stderr: str,
    raw_result: EvaluationResult,
    result: EvaluationResult,
    evaluated_candidate: Path,
    refinement: dict | None,
    relation_verification: dict | None,
    verification: dict | None,
    sha256: Callable[[Path], str],
    write_json_atomic: Callable[[Path, dict], None],
) -> None:
    paths = prepared.paths
    manifest = prepared.manifest
    record = {
        "schemaVersion": 1,
        "runId": manifest["runId"],
        "createdAt": manifest["createdAt"],
        "gitCommit": manifest["gitCommit"],
        "gitDirty": manifest["gitDirty"],
        "executor": manifest["executor"],
        "executorReturnCode": executor_return_code,
        "executorStderr": executor_stderr or None,
        "editPlanSha256": manifest["editPlanSha256"],
        "executionReceiptSha256": sha256(paths.execution_receipt) if paths.execution_receipt.exists() else None,
        "coordinateTransportReceiptSha256": (
            sha256(paths.coordinate_transport_receipt)
            if paths.coordinate_transport_receipt.exists()
            else None
        ),
        "candidateSha256": sha256(evaluated_candidate) if evaluated_candidate.exists() else None,
        "rawCandidateSha256": sha256(paths.raw_candidate) if paths.raw_candidate.exists() else None,
        "referenceSdfSha256": manifest["referenceSdfSha256"],
        "evaluatorSourceSha256": manifest["evaluatorSourceSha256"],
        "rawEvaluation": raw_result.to_json(),
        "refinement": refinement,
        "verification": verification,
        "evaluation": result.to_json(),
    }
    if relation_verification is not None:
        record["schemaVersion"] = 2
        record["relationVerification"] = relation_verification
    if manifest["schemaVersion"] == 2:
        record.update({
            "initialMoleculeSha256": manifest["initialMoleculeSha256"],
            "runSpecSha256": manifest["runSpecSha256"],
        })
    write_json_atomic(paths.run_dir / "run.json", record)
    lines = [
        f"# {paths.run_dir.name}",
        "",
        f"- 评分：{result.score:.3f}",
        f"- 通过：{'是' if result.passed else '否'}",
        f"- 失败分类：{', '.join(result.failures) if result.failures else '无'}",
        f"- 原始候选评分：{raw_result.score:.3f}",
        f"- GFN2-xTB：{refinement['status'] if refinement else '未执行'}",
        "",
        "## 下一轮诊断",
        "",
        *[f"- {item}" for item in result.diagnostics],
    ]
    (paths.run_dir / "report.md").write_text("\n".join(lines) + "\n")
