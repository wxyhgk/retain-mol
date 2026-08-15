from __future__ import annotations

from dataclasses import replace
from pathlib import Path
from typing import Callable

from .evaluator import EvaluationResult
from .artifact_contracts import load_strict_json, sha256_file
from .run_preparation import PreparedRun
from .run_manifest import load_run_manifest


def indeterminate_verification(
    code: str,
    error: str,
    missing: list[str] | None = None,
) -> dict:
    return {
        "schemaVersion": 2,
        "status": "indeterminate",
        "code": code,
        "error": error,
        "missingArtifacts": missing or [],
        "axes": {},
    }


def with_formal_indeterminate(
    result: EvaluationResult,
    diagnostic: str,
) -> EvaluationResult:
    failures = result.failures
    if "formal-indeterminate" not in failures:
        failures = (*failures, "formal-indeterminate")
    return replace(
        result,
        passed=False,
        failures=failures,
        diagnostics=(*result.diagnostics, diagnostic),
    )


def with_formal_reject(
    result: EvaluationResult,
    diagnostic: str,
) -> EvaluationResult:
    failures = result.failures
    if "formal-reject" not in failures:
        failures = (*failures, "formal-reject")
    return replace(
        result,
        passed=False,
        failures=failures,
        diagnostics=(*result.diagnostics, diagnostic),
    )


def verify_completed_run(
    *,
    case_id: str,
    prepared: PreparedRun,
    result: EvaluationResult,
    evaluated_candidate: Path,
    transport_evidence: dict | None,
    transport_source_sdf: Path | None,
    transport_input_xyz: Path | None,
    transport_output_xyz: Path | None,
    verify_final_artifact: Callable,
) -> tuple[EvaluationResult, dict]:
    paths = prepared.paths
    required = (
        paths.builder_snapshot,
        paths.identity_map,
        evaluated_candidate,
        paths.execution_receipt,
        paths.expected_effect,
        paths.enforced_plan,
        paths.coordinate_transport_receipt,
    )
    missing = [path.name for path in required if not path.is_file()]
    if missing:
        verification = indeterminate_verification(
            "verification-artifacts-missing",
            "执行器未生成完整的最终产物验证证据。",
            missing,
        )
        return (
            with_formal_indeterminate(
                result,
                f"最终产物验证证据缺失：{', '.join(missing)}。",
            ),
            verification,
        )

    try:
        disk_manifest = load_run_manifest(paths.run_manifest)
        manifest_sha256 = sha256_file(paths.run_manifest)
        if dict(disk_manifest) != prepared.manifest:
            raise ValueError("disk run manifest differs from the prepared run snapshot")
        receipt = load_strict_json(paths.execution_receipt)
    except Exception as error:
        verification = indeterminate_verification(
            "execution-input-binding-unavailable",
            f"{type(error).__name__}: {error}",
        )
        return (
            with_formal_indeterminate(result, "执行输入哈希无法从执行回执中验证。"),
            verification,
        )
    expected_input_sha256 = disk_manifest.get("initialMoleculeSha256")
    if expected_input_sha256 is not None:
        actual_input_sha256 = receipt.get("inputSha256") if isinstance(receipt, dict) else None
        if not isinstance(actual_input_sha256, str):
            verification = indeterminate_verification(
                "execution-input-binding-unavailable",
                "执行回执缺少 inputSha256。",
            )
            return (
                with_formal_indeterminate(result, "执行回执没有绑定冻结的初始分子。"),
                verification,
            )
        if actual_input_sha256 != expected_input_sha256:
            verification = {
                "schemaVersion": 2,
                "status": "reject",
                "code": "execution-input-binding-reject",
                "error": "执行回执中的初始分子哈希与冻结输入不一致。",
                "missingArtifacts": [],
                "axes": {},
            }
            return (
                replace(
                    result,
                    passed=False,
                    failures=(*result.failures, "formal-reject"),
                    diagnostics=(*result.diagnostics, "执行阶段未使用本次 run 冻结的初始分子。"),
                ),
                verification,
            )

    try:
        envelope = verify_final_artifact(
            builder_snapshot_path=paths.builder_snapshot,
            identity_map_path=paths.identity_map,
            final_sdf_path=evaluated_candidate,
            executor_output_path=paths.raw_candidate,
            execution_receipt_path=paths.execution_receipt,
            expected_effect_path=paths.expected_effect,
            enforced_plan_path=paths.enforced_plan,
            initial_molecule_path=paths.initial,
            evaluation=result.to_json(),
            output_dir=paths.run_dir / "verification",
            coordinate_transport_receipt_path=paths.coordinate_transport_receipt,
            transport_evidence=transport_evidence,
            transport_source_sdf_path=transport_source_sdf,
            transport_input_xyz_path=transport_input_xyz,
            transport_output_xyz_path=transport_output_xyz,
            target_evidence={
                "caseId": case_id,
                "evaluator": "retainmol-benchmark-evaluator-v1",
            },
            target_reference_path=paths.archived_reference,
            target_evaluator_path=paths.archived_evaluator,
            run_manifest_path=paths.run_manifest,
            run_spec_path=paths.run_spec,
        )
        if sha256_file(paths.run_manifest) != manifest_sha256:
            raise ValueError("run manifest changed during final verification")
        verification = envelope.to_json()
        if envelope.status.value != "pass":
            result = replace(
                result,
                passed=False,
                failures=(*result.failures, f"formal-{envelope.status.value}"),
                diagnostics=(
                    *result.diagnostics,
                    f"最终产物三轴验证结果：{envelope.status.value}。",
                ),
            )
        return result, verification
    except Exception as error:
        verification = indeterminate_verification(
            "verification-tool-failed",
            f"{type(error).__name__}: {error}",
        )
        return (
            with_formal_indeterminate(
                result,
                f"最终产物验证器失败：{type(error).__name__}: {error}",
            ),
            verification,
        )
