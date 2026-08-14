from __future__ import annotations

import json
import hashlib
import os
import shutil
import subprocess
from dataclasses import replace
from datetime import UTC, datetime
from pathlib import Path

from .chemistry import (
    embed_candidate_distance_geometry,
    load_sdf,
    optimize_with_xtb,
    with_explicit_hydrogens,
    write_sdf,
)
from .artifact_contracts import (
    CoordinateTransportAtomRow,
    coordinate_transport_atom_rows_json,
    coordinate_transport_atom_row_mapping_sha256,
    load_identity_map,
    sha256_file,
)
from .contracts import BenchmarkCase, DEFAULT_WORK_DIR
from .evaluator import EvaluationResult, candidate_anchor_indices
from .final_artifact_gate import verify_final_artifact
from .history_index import (
    _is_archivable_attempt,
    _rebuild_history_index,
    _rebuild_verified_index,
    archive_existing_runs,
    archive_run,
)
from .target_evaluation import archive_target_evidence, evaluate_archived_target
from .workspace import prepare_task_bundle


RETAINMOL_EXECUTOR = Path(__file__).with_name("retainmol_executor.mjs")
XTB_ROW_ORDER_CONTRACT = "xtb-preserves-input-row-order-v1"
XTB_POST_PROCESSING = "fixed-anchor-frame-projection-v1"


def _git_commit() -> str | None:
    process = subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True, text=True)
    return process.stdout.strip() if process.returncode == 0 else None


def _git_dirty() -> bool | None:
    process = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
    return bool(process.stdout.strip()) if process.returncode == 0 else None


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _write_json_atomic(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    os.replace(temporary, path)


def _write_coordinate_transport_receipt(
    *,
    path: Path,
    builder_snapshot_path: Path,
    identity_map_path: Path,
    final_sdf_path: Path,
    source_sdf_path: Path | None = None,
    input_xyz_path: Path | None = None,
    output_xyz_path: Path | None = None,
    executable_sha256: str | None = None,
    fixed_atom_rows: tuple[int, ...] = (),
) -> str:
    """Bind final serialized coordinates to the stable builder atom rows.

    This helper is only valid when the transport adapter has preserved the
    input SDF row order. Any atom insertion, removal, or row permutation fails
    closed before a receipt is published.
    """
    identity = load_identity_map(identity_map_path)
    molecule = load_sdf(final_sdf_path)
    if molecule.GetNumAtoms() != len(identity.atom_rows):
        raise ValueError(
            "coordinate transport changed atom count; stable atom IDs cannot be proven"
        )
    conformer = molecule.GetConformer()
    rows: list[CoordinateTransportAtomRow] = []
    for index, identity_row in enumerate(identity.atom_rows):
        atom = molecule.GetAtomWithIdx(index)
        if atom.GetSymbol() != identity_row.symbol:
            raise ValueError(
                f"coordinate transport changed atom row {index + 1}: "
                f"{atom.GetSymbol()} != {identity_row.symbol}"
            )
        position = conformer.GetAtomPosition(index)
        rows.append(CoordinateTransportAtomRow(
            row_index=identity_row.row_index,
            atom_id=identity_row.atom_id,
            symbol=identity_row.symbol,
            position=(float(position.x), float(position.y), float(position.z)),
        ))
    payload = {
        "schemaVersion": 1,
        "kind": "stable-atom-coordinate-transport",
        "builderSnapshotSha256": sha256_file(builder_snapshot_path),
        "identityMapSha256": sha256_file(identity_map_path),
        "finalSdfSha256": sha256_file(final_sdf_path),
        "atomRowMappingSha256": coordinate_transport_atom_row_mapping_sha256(rows),
        "atomRows": coordinate_transport_atom_rows_json(rows),
    }
    provenance_values = (
        source_sdf_path,
        input_xyz_path,
        output_xyz_path,
        executable_sha256,
    )
    if any(value is not None for value in provenance_values):
        if not all(value is not None for value in provenance_values):
            raise ValueError("xTB coordinate provenance must be complete")
        assert source_sdf_path is not None
        assert input_xyz_path is not None
        assert output_xyz_path is not None
        assert executable_sha256 is not None
        if not source_sdf_path.is_file() or not input_xyz_path.is_file() or not output_xyz_path.is_file():
            raise ValueError("xTB coordinate provenance files are missing")
        payload["transportProvenance"] = {
            "kind": "xtb-coordinate-transport",
            "sourceSdfSha256": sha256_file(source_sdf_path),
            "inputXyzSha256": sha256_file(input_xyz_path),
            "outputXyzSha256": sha256_file(output_xyz_path),
            "executableSha256": executable_sha256,
            "rowOrderContract": XTB_ROW_ORDER_CONTRACT,
            "postProcessing": XTB_POST_PROCESSING,
            "fixedAtomRows": list(fixed_atom_rows),
        }
    _write_json_atomic(path, payload)
    return sha256_file(path)


def _invalid_result(case: BenchmarkCase, error: Exception) -> EvaluationResult:
    return EvaluationResult(
        case_id=case.case_id,
        passed=False,
        score=0.0,
        formula_match=False,
        topology_match=False,
        anchor_max_displacement=None,
        core_rmsd=None,
        heavy_atom_rmsd=None,
        severe_clashes=0,
        disconnected_components=0,
        failures=("candidate-invalid",),
        diagnostics=(f"候选文件或元数据无效：{type(error).__name__}: {error}",),
    )


def _indeterminate_verification(code: str, error: str, missing: list[str] | None = None) -> dict:
    return {
        "schemaVersion": 2,
        "status": "indeterminate",
        "code": code,
        "error": error,
        "missingArtifacts": missing or [],
        "axes": {},
    }


def _with_formal_indeterminate(
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


def _evaluate_or_invalid(
    case: BenchmarkCase,
    candidate: Path,
    metadata: Path | None,
    archived_reference: Path,
    archived_evaluator: Path,
) -> EvaluationResult:
    try:
        return evaluate_archived_target(
            case,
            candidate,
            candidate_metadata=metadata,
            archived_reference=archived_reference,
            archived_evaluator=archived_evaluator,
        )
    except Exception as error:
        return _invalid_result(case, error)


def _xtb_stage(result, method: str, status: str = "completed") -> dict:
    return {
        "method": method,
        "status": status if result.converged else "not-converged",
        "energyEh": result.energy,
        "returnCode": result.return_code,
        "anchorRmsdBeforeProjection": result.anchor_rmsd_before_projection,
        "logTail": result.log_tail,
    }


def _refine_with_xtb_fallback(
    molecule,
    *,
    case: BenchmarkCase,
    fixed_atom_indices: tuple[int, ...],
    xtb: str | None,
):
    stages = []
    try:
        result = optimize_with_xtb(
            molecule,
            charge=case.charge,
            multiplicity=case.multiplicity,
            fixed_atom_indices=fixed_atom_indices,
            xtb=xtb,
            method="gfn2",
        )
        stages.append(_xtb_stage(result, "GFN2-xTB"))
        return result, stages
    except Exception as direct_error:
        stages.append({
            "method": "GFN2-xTB",
            "status": "failed",
            "error": f"{type(direct_error).__name__}: {direct_error}",
        })

    pre_relaxed = optimize_with_xtb(
        molecule,
        charge=case.charge,
        multiplicity=case.multiplicity,
        fixed_atom_indices=fixed_atom_indices,
        xtb=xtb,
        method="gfnff",
        max_steps=300,
    )
    stages.append(_xtb_stage(pre_relaxed, "GFN-FF"))
    result = optimize_with_xtb(
        pre_relaxed.molecule,
        charge=case.charge,
        multiplicity=case.multiplicity,
        fixed_atom_indices=fixed_atom_indices,
        xtb=xtb,
        method="gfn2",
        electronic_temperature=1000,
    )
    stages.append(_xtb_stage(result, "GFN2-xTB(etemp=1000K)"))
    return result, stages


def _refine_conformer_ensemble(
    molecule,
    *,
    case: BenchmarkCase,
    fixed_atom_indices: tuple[int, ...],
    seeds: tuple[int, ...],
    xtb: str | None,
):
    stages = []
    pre_relaxed = []
    sources = [("input", None, molecule)]
    for seed in seeds:
        try:
            embedded = embed_candidate_distance_geometry(
                molecule,
                fixed_atom_indices=fixed_atom_indices,
                seed=seed,
            )
            sources.append((f"etkdg-{seed}", seed, embedded))
        except Exception as error:
            stages.append({
                "method": "ETKDGv3",
                "seed": seed,
                "status": "failed",
                "error": f"{type(error).__name__}: {error}",
            })
    for label, seed, source in sources:
        try:
            result = optimize_with_xtb(
                source,
                charge=case.charge,
                multiplicity=case.multiplicity,
                fixed_atom_indices=fixed_atom_indices,
                xtb=xtb,
                method="gfnff",
                max_steps=300,
            )
            stage = _xtb_stage(result, "GFN-FF")
            stage.update({"source": label, "seed": seed})
            stages.append(stage)
            pre_relaxed.append((result.energy, label, result))
        except Exception as error:
            stages.append({
                "method": "GFN-FF",
                "source": label,
                "seed": seed,
                "status": "failed",
                "error": f"{type(error).__name__}: {error}",
            })
    if not pre_relaxed:
        raise RuntimeError("all GFN-FF conformer pre-relaxations failed")
    _, selected_source, selected = min(pre_relaxed, key=lambda item: item[0])
    try:
        result = optimize_with_xtb(
            selected.molecule,
            charge=case.charge,
            multiplicity=case.multiplicity,
            fixed_atom_indices=fixed_atom_indices,
            xtb=xtb,
            method="gfn2",
        )
        stage = _xtb_stage(result, "GFN2-xTB")
    except Exception as error:
        stages.append({
            "method": "GFN2-xTB",
            "source": selected_source,
            "status": "failed",
            "error": f"{type(error).__name__}: {error}",
        })
        result = optimize_with_xtb(
            selected.molecule,
            charge=case.charge,
            multiplicity=case.multiplicity,
            fixed_atom_indices=fixed_atom_indices,
            xtb=xtb,
            method="gfn2",
            electronic_temperature=1000,
        )
        stage = _xtb_stage(result, "GFN2-xTB(etemp=1000K)")
    stage.update({"source": selected_source})
    stages.append(stage)
    return result, stages, selected_source


def _execute_edit_plan(
    *,
    initial: Path,
    edit_plan: Path,
    candidate: Path,
    metadata: Path,
    receipt: Path,
    snapshot: Path,
    identity_map: Path,
    coordinate_transport_receipt: Path,
    expected_effect: Path,
    enforced_plan: Path,
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [
            "node", str(RETAINMOL_EXECUTOR),
            "--initial", str(initial),
            "--plan", str(edit_plan),
            "--output", str(candidate),
            "--metadata", str(metadata),
            "--receipt", str(receipt),
            "--snapshot", str(snapshot),
            "--identity-map", str(identity_map),
            "--coordinate-transport-receipt", str(coordinate_transport_receipt),
            "--expected-effect", str(expected_effect),
            "--enforced-plan", str(enforced_plan),
        ],
        capture_output=True,
        text=True,
    )


def record_run(
    case: BenchmarkCase,
    edit_plan: Path,
    *,
    builder_notes: Path | None = None,
    work_dir: Path = DEFAULT_WORK_DIR,
    refine: bool = False,
    xtb: str | None = None,
    conformer_seeds: tuple[int, ...] = (),
) -> tuple[Path, EvaluationResult]:
    stamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    run_dir = work_dir / "runs" / f"{stamp}-{case.case_id}"
    suffix = 1
    while run_dir.exists():
        suffix += 1
        run_dir = work_dir / "runs" / f"{stamp}-{case.case_id}-{suffix}"
    run_dir.mkdir(parents=True)
    copied_plan = run_dir / "edit-plan.json"
    shutil.copy2(edit_plan, copied_plan)
    if builder_notes and builder_notes.exists():
        shutil.copy2(builder_notes, run_dir / "builder-notes.json")

    reference_source = work_dir / "references" / case.case_id / "reference.sdf"
    archived_reference, archived_evaluator = archive_target_evidence(
        reference_source=reference_source,
        run_dir=run_dir,
    )
    created_at = datetime.now(UTC).isoformat()
    run_manifest = run_dir / "run-manifest.json"
    run_manifest_value = {
        "schemaVersion": 1,
        "runId": run_dir.name,
        "createdAt": created_at,
        "caseId": case.case_id,
        "gitCommit": _git_commit(),
        "gitDirty": _git_dirty(),
        "executor": "@retainmol/mol-viewer/modeling",
        "editPlanSha256": _sha256(copied_plan),
        "referenceSdfSha256": _sha256(archived_reference),
        "evaluatorSourceSha256": _sha256(archived_evaluator),
    }
    _write_json_atomic(run_manifest, run_manifest_value)

    task_dir = work_dir / "tasks" / case.case_id
    initial = task_dir / "initial-molecule.json"
    if not initial.exists():
        prepare_task_bundle(case, work_dir)
    copied_candidate = run_dir / ("candidate.raw.sdf" if refine else "candidate.sdf")
    copied_metadata = run_dir / "candidate.json"
    receipt = run_dir / "execution.json"
    builder_snapshot = run_dir / "builder-snapshot.json"
    identity_map = run_dir / "identity-map.json"
    coordinate_transport_receipt = run_dir / "coordinate-transport.json"
    expected_effect = run_dir / "expected-effect.json"
    enforced_plan = run_dir / "enforced-plan.json"
    execution = _execute_edit_plan(
        initial=initial,
        edit_plan=copied_plan,
        candidate=copied_candidate,
        metadata=copied_metadata,
        receipt=receipt,
        snapshot=builder_snapshot,
        identity_map=identity_map,
        coordinate_transport_receipt=coordinate_transport_receipt,
        expected_effect=expected_effect,
        enforced_plan=enforced_plan,
    )
    if execution.returncode == 0:
        raw_result = _evaluate_or_invalid(
            case,
            copied_candidate,
            copied_metadata,
            archived_reference,
            archived_evaluator,
        )
    else:
        error = RuntimeError(
            "RetainMol EditPlan 执行失败：" + (execution.stderr.strip() or execution.stdout.strip())
        )
        raw_result = _invalid_result(case, error)
    result = raw_result
    evaluated_candidate = copied_candidate
    refinement = None
    transport_evidence: dict | None = None
    xtb_input_sdf: Path | None = None
    xtb_input_xyz: Path | None = None
    xtb_output_xyz: Path | None = None
    if refine and execution.returncode == 0 and "candidate-invalid" not in raw_result.failures:
        try:
            molecule = with_explicit_hydrogens(load_sdf(copied_candidate))
            anchors = candidate_anchor_indices(case, molecule, copied_metadata)
            fixed_indices = tuple(index + 1 for index in anchors.values())
            selected_source = "input"
            if conformer_seeds:
                xtb_result, stages, selected_source = _refine_conformer_ensemble(
                    molecule,
                    case=case,
                    fixed_atom_indices=fixed_indices,
                    seeds=conformer_seeds,
                    xtb=xtb,
                )
            else:
                xtb_result, stages = _refine_with_xtb_fallback(
                    molecule,
                    case=case,
                    fixed_atom_indices=fixed_indices,
                    xtb=xtb,
                )
            evaluated_candidate = run_dir / "candidate.sdf"
            write_sdf(xtb_result.molecule, evaluated_candidate)
            xtb_input_sdf = run_dir / "xtb-input.sdf"
            xtb_input_xyz = run_dir / "xtb-input.xyz"
            xtb_output_xyz = run_dir / "xtb-output.xyz"
            if (
                xtb_result.input_molecule is None
                or xtb_result.input_xyz_text is None
                or xtb_result.output_xyz_text is None
                or xtb_result.executable_sha256 is None
                or xtb_result.input_xyz_sha256 is None
                or xtb_result.output_xyz_sha256 is None
            ):
                raise ValueError("xTB adapter did not return complete coordinate provenance")
            write_sdf(xtb_result.input_molecule, xtb_input_sdf)
            xtb_input_xyz.write_text(xtb_result.input_xyz_text, encoding="utf-8")
            xtb_output_xyz.write_text(xtb_result.output_xyz_text, encoding="utf-8")
            if sha256_file(xtb_input_xyz) != xtb_result.input_xyz_sha256:
                raise ValueError("archived xTB input XYZ hash mismatch")
            if sha256_file(xtb_output_xyz) != xtb_result.output_xyz_sha256:
                raise ValueError("archived xTB output XYZ hash mismatch")
            coordinate_receipt_sha256 = _write_coordinate_transport_receipt(
                path=coordinate_transport_receipt,
                builder_snapshot_path=builder_snapshot,
                identity_map_path=identity_map,
                final_sdf_path=evaluated_candidate,
                source_sdf_path=xtb_input_sdf,
                input_xyz_path=xtb_input_xyz,
                output_xyz_path=xtb_output_xyz,
                executable_sha256=xtb_result.executable_sha256,
                fixed_atom_rows=fixed_indices,
            )
            result = _evaluate_or_invalid(
                case,
                evaluated_candidate,
                copied_metadata,
                archived_reference,
                archived_evaluator,
            )
            refinement = {
                "method": "GFN2-xTB",
                "status": "completed" if xtb_result.converged else "not-converged",
                "energyEh": xtb_result.energy,
                "returnCode": xtb_result.return_code,
                "anchorRmsdBeforeProjection": xtb_result.anchor_rmsd_before_projection,
                "logTail": xtb_result.log_tail,
                "stages": stages,
                "strategy": "conformer-ensemble" if conformer_seeds else "direct-with-fallback",
                "conformerSeeds": list(conformer_seeds),
                "selectedSource": selected_source,
            }
            trusted_digest = os.environ.get("RETAINMOL_TRUSTED_XTB_SHA256")
            transport_evidence = {
                "kind": "xtb-coordinate-transport",
                "trusted": bool(
                    trusted_digest
                    and xtb_result.executable_sha256
                    and trusted_digest == xtb_result.executable_sha256
                ),
                "executableSha256": xtb_result.executable_sha256,
                "expectedExecutableSha256Configured": bool(trusted_digest),
                "command": list(xtb_result.command),
                "inputXyzSha256": xtb_result.input_xyz_sha256,
                "outputXyzSha256": xtb_result.output_xyz_sha256,
                "sourceSdfSha256": sha256_file(xtb_input_sdf),
                "rowOrderContract": XTB_ROW_ORDER_CONTRACT,
                "postProcessing": XTB_POST_PROCESSING,
                "fixedAtomRows": list(fixed_indices),
                "coordinateTransportReceiptSha256": coordinate_receipt_sha256,
            }
            if not xtb_result.converged:
                result = replace(
                    result,
                    passed=False,
                    failures=(*result.failures, "xtb-not-converged"),
                    diagnostics=(*result.diagnostics, "GFN2-xTB 返回结构，但优化未收敛。"),
                )
        except Exception as error:
            refinement = {
                "method": "GFN2-xTB",
                "status": "failed",
                "error": f"{type(error).__name__}: {error}",
            }
            result = replace(
                raw_result,
                passed=False,
                failures=(*raw_result.failures, "xtb-failed"),
                diagnostics=(*raw_result.diagnostics, f"GFN2-xTB 精修失败：{error}"),
            )
            transport_evidence = {
                "kind": "xtb-coordinate-transport",
                "trusted": False,
                "error": f"{type(error).__name__}: {error}",
            }
    verification = None
    required_verification_files = (
        builder_snapshot,
        identity_map,
        evaluated_candidate,
        receipt,
        expected_effect,
        enforced_plan,
        coordinate_transport_receipt,
    )
    if execution.returncode == 0:
        missing = [path.name for path in required_verification_files if not path.is_file()]
        if missing:
            verification = _indeterminate_verification(
                "verification-artifacts-missing",
                "执行器未生成完整的最终产物验证证据。",
                missing,
            )
            result = _with_formal_indeterminate(
                result,
                f"最终产物验证证据缺失：{', '.join(missing)}。",
            )
        else:
            try:
                envelope = verify_final_artifact(
                    builder_snapshot_path=builder_snapshot,
                    identity_map_path=identity_map,
                    final_sdf_path=evaluated_candidate,
                    executor_output_path=copied_candidate,
                    execution_receipt_path=receipt,
                    expected_effect_path=expected_effect,
                    enforced_plan_path=enforced_plan,
                    evaluation=result.to_json(),
                    output_dir=run_dir / "verification",
                    coordinate_transport_receipt_path=coordinate_transport_receipt,
                    transport_evidence=transport_evidence,
                    transport_source_sdf_path=xtb_input_sdf,
                    transport_input_xyz_path=xtb_input_xyz,
                    transport_output_xyz_path=xtb_output_xyz,
                    target_evidence={
                        "caseId": case.case_id,
                        "evaluator": "retainmol-benchmark-evaluator-v1",
                    },
                    target_reference_path=archived_reference,
                    target_evaluator_path=archived_evaluator,
                    run_manifest_path=run_manifest,
                )
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
            except Exception as error:
                verification = _indeterminate_verification(
                    "verification-tool-failed",
                    f"{type(error).__name__}: {error}",
                )
                result = _with_formal_indeterminate(
                    result,
                    f"最终产物验证器失败：{type(error).__name__}: {error}",
                )
    record = {
        "schemaVersion": 1,
        "runId": run_manifest_value["runId"],
        "createdAt": run_manifest_value["createdAt"],
        "gitCommit": run_manifest_value["gitCommit"],
        "gitDirty": run_manifest_value["gitDirty"],
        "executor": run_manifest_value["executor"],
        "executorReturnCode": execution.returncode,
        "executorStderr": execution.stderr.strip() or None,
        "editPlanSha256": run_manifest_value["editPlanSha256"],
        "executionReceiptSha256": _sha256(receipt) if receipt.exists() else None,
        "coordinateTransportReceiptSha256": (
            _sha256(coordinate_transport_receipt)
            if coordinate_transport_receipt.exists()
            else None
        ),
        "candidateSha256": _sha256(evaluated_candidate) if evaluated_candidate.exists() else None,
        "rawCandidateSha256": _sha256(copied_candidate) if copied_candidate.exists() else None,
        "referenceSdfSha256": run_manifest_value["referenceSdfSha256"],
        "evaluatorSourceSha256": run_manifest_value["evaluatorSourceSha256"],
        "rawEvaluation": raw_result.to_json(),
        "refinement": refinement,
        "verification": verification,
        "evaluation": result.to_json(),
    }
    (run_dir / "run.json").write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n")
    lines = [
        f"# {run_dir.name}",
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
    (run_dir / "report.md").write_text("\n".join(lines) + "\n")
    if work_dir.resolve() == DEFAULT_WORK_DIR.resolve() and _is_archivable_attempt(run_dir):
        archive_run(run_dir)
    return run_dir, result


def scoreboard(work_dir: Path = DEFAULT_WORK_DIR) -> list[dict]:
    rows = []
    for path in sorted((work_dir / "runs").glob("*/run.json")):
        value = json.loads(path.read_text())
        evaluation = value["evaluation"]
        rows.append({
            "runId": value["runId"],
            "caseId": evaluation["case_id"],
            "score": evaluation["score"],
            "passed": evaluation["passed"],
            "failures": evaluation["failures"],
        })
    return rows
