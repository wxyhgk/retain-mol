from __future__ import annotations

import hashlib
import json
import os
import subprocess
from pathlib import Path

from .artifact_contracts import (
    CoordinateTransportAtomRow,
    coordinate_transport_atom_row_mapping_sha256,
    coordinate_transport_atom_rows_json,
    load_identity_map,
    sha256_file,
)
from .chemistry import embed_candidate_distance_geometry, load_sdf, optimize_with_xtb
from .contracts import BenchmarkCase, DEFAULT_WORK_DIR
from .evaluator import EvaluationResult
from .final_artifact_gate import verify_final_artifact
from .history_index import (
    _is_archivable_attempt,
    _rebuild_history_index,
    _rebuild_verified_index,
    archive_existing_runs,
    archive_run,
)
from .refinement_stage import (
    refine_candidate,
    refine_conformer_ensemble,
    refine_with_xtb_fallback,
)
from .run_preparation import prepare_run
from .run_recording import write_run_record
from .target_evaluation import evaluate_archived_target
from .verification_stage import verify_completed_run
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
    """Bind final serialized coordinates to stable builder atom rows."""
    identity = load_identity_map(identity_map_path)
    molecule = load_sdf(final_sdf_path)
    if molecule.GetNumAtoms() != len(identity.atom_rows):
        raise ValueError("coordinate transport changed atom count; stable atom IDs cannot be proven")
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
    provenance_values = (source_sdf_path, input_xyz_path, output_xyz_path, executable_sha256)
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


def _refine_with_xtb_fallback(
    molecule,
    *,
    case: BenchmarkCase,
    fixed_atom_indices: tuple[int, ...],
    xtb: str | None,
):
    return refine_with_xtb_fallback(
        molecule,
        case=case,
        fixed_atom_indices=fixed_atom_indices,
        xtb=xtb,
        optimize=optimize_with_xtb,
    )


def _refine_conformer_ensemble(
    molecule,
    *,
    case: BenchmarkCase,
    fixed_atom_indices: tuple[int, ...],
    seeds: tuple[int, ...],
    xtb: str | None,
):
    return refine_conformer_ensemble(
        molecule,
        case=case,
        fixed_atom_indices=fixed_atom_indices,
        seeds=seeds,
        xtb=xtb,
        embed=embed_candidate_distance_geometry,
        optimize=optimize_with_xtb,
    )


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
    prepared = prepare_run(
        case,
        edit_plan,
        work_dir=work_dir,
        refine=refine,
        builder_notes=builder_notes,
        git_commit=_git_commit(),
        git_dirty=_git_dirty(),
        sha256=_sha256,
        write_json_atomic=_write_json_atomic,
        prepare_task=prepare_task_bundle,
        xtb=xtb,
        conformer_seeds=conformer_seeds,
    )
    paths = prepared.paths
    execution = _execute_edit_plan(
        initial=paths.initial,
        edit_plan=paths.copied_plan,
        candidate=paths.raw_candidate,
        metadata=paths.metadata,
        receipt=paths.execution_receipt,
        snapshot=paths.builder_snapshot,
        identity_map=paths.identity_map,
        coordinate_transport_receipt=paths.coordinate_transport_receipt,
        expected_effect=paths.expected_effect,
        enforced_plan=paths.enforced_plan,
    )
    if execution.returncode == 0:
        if refine and paths.coordinate_transport_receipt.is_file():
            paths.executor_coordinate_transport_receipt.write_bytes(
                paths.coordinate_transport_receipt.read_bytes()
            )
        raw_result = _evaluate_or_invalid(
            case,
            paths.raw_candidate,
            paths.metadata,
            paths.archived_reference,
            paths.archived_evaluator,
        )
    else:
        error = RuntimeError(
            "RetainMol EditPlan 执行失败：" + (execution.stderr.strip() or execution.stdout.strip())
        )
        raw_result = _invalid_result(case, error)

    result = raw_result
    evaluated_candidate = paths.raw_candidate
    refinement = None
    transport_evidence = None
    transport_source_sdf = None
    transport_input_xyz = None
    transport_output_xyz = None
    if refine and execution.returncode == 0 and "candidate-invalid" not in raw_result.failures:
        outcome = refine_candidate(
            case=case,
            paths=paths,
            raw_result=raw_result,
            conformer_seeds=conformer_seeds,
            xtb=xtb,
            refine_with_fallback=_refine_with_xtb_fallback,
            refine_ensemble=_refine_conformer_ensemble,
            write_coordinate_receipt=_write_coordinate_transport_receipt,
            evaluate_candidate=lambda candidate: _evaluate_or_invalid(
                case,
                candidate,
                paths.metadata,
                paths.archived_reference,
                paths.archived_evaluator,
            ),
            row_order_contract=XTB_ROW_ORDER_CONTRACT,
            post_processing=XTB_POST_PROCESSING,
            trusted_xtb_sha256=prepared.trusted_xtb_sha256,
        )
        result = outcome.result
        evaluated_candidate = outcome.evaluated_candidate
        refinement = outcome.refinement
        transport_evidence = outcome.transport_evidence
        transport_source_sdf = outcome.transport_source_sdf
        transport_input_xyz = outcome.transport_input_xyz
        transport_output_xyz = outcome.transport_output_xyz

    verification = None
    if execution.returncode == 0:
        result, verification = verify_completed_run(
            case_id=case.case_id,
            prepared=prepared,
            result=result,
            evaluated_candidate=evaluated_candidate,
            transport_evidence=transport_evidence,
            transport_source_sdf=transport_source_sdf,
            transport_input_xyz=transport_input_xyz,
            transport_output_xyz=transport_output_xyz,
            verify_final_artifact=verify_final_artifact,
        )
    write_run_record(
        prepared=prepared,
        executor_return_code=execution.returncode,
        executor_stderr=execution.stderr.strip(),
        raw_result=raw_result,
        result=result,
        evaluated_candidate=evaluated_candidate,
        refinement=refinement,
        verification=verification,
        sha256=_sha256,
        write_json_atomic=_write_json_atomic,
    )
    if work_dir.resolve() == DEFAULT_WORK_DIR.resolve() and _is_archivable_attempt(paths.run_dir):
        archive_run(paths.run_dir)
    return paths.run_dir, result


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
