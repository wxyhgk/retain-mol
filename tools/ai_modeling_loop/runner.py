from __future__ import annotations

import json
import hashlib
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
from .contracts import BenchmarkCase, DEFAULT_HISTORY_DIR, DEFAULT_WORK_DIR
from .evaluator import EvaluationResult, candidate_anchor_indices, evaluate_candidate
from .workspace import prepare_task_bundle


RETAINMOL_EXECUTOR = Path(__file__).with_name("retainmol_executor.mjs")


def _git_commit() -> str | None:
    process = subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True, text=True)
    return process.stdout.strip() if process.returncode == 0 else None


def _git_dirty() -> bool | None:
    process = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
    return bool(process.stdout.strip()) if process.returncode == 0 else None


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _rebuild_history_index(history_dir: Path) -> None:
    rows = []
    for path in sorted(history_dir.glob("*/*/run.json")):
        value = json.loads(path.read_text())
        evaluation = value["evaluation"]
        rows.append({
            "runId": value["runId"],
            "caseId": evaluation["case_id"],
            "createdAt": value["createdAt"],
            "score": evaluation["score"],
            "passed": evaluation["passed"],
            "failures": evaluation["failures"],
            "path": str(path.parent.relative_to(history_dir)),
        })
    history_dir.mkdir(parents=True, exist_ok=True)
    (history_dir / "index.json").write_text(
        json.dumps({"schemaVersion": 1, "runs": rows}, ensure_ascii=False, indent=2) + "\n"
    )


def archive_run(run_dir: Path, history_dir: Path = DEFAULT_HISTORY_DIR) -> Path:
    record_path = run_dir / "run.json"
    record = json.loads(record_path.read_text())
    case_id = record["evaluation"]["case_id"]
    target = history_dir / case_id / run_dir.name
    record["archiveRelativePath"] = str(target.relative_to(history_dir))
    record_path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n")
    if target.exists():
        shutil.rmtree(target)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(run_dir, target)
    _rebuild_history_index(history_dir)
    return target


def _is_archivable_attempt(run_dir: Path) -> bool:
    if (run_dir / "edit-plan.json").exists():
        return True
    metadata = run_dir / "candidate.json"
    if not metadata.exists():
        return False
    try:
        builder = str(json.loads(metadata.read_text()).get("builder", ""))
    except (json.JSONDecodeError, OSError):
        return False
    return bool(builder) and builder != "reference-self-check"


def archive_existing_runs(
    work_dir: Path = DEFAULT_WORK_DIR,
    history_dir: Path = DEFAULT_HISTORY_DIR,
) -> list[Path]:
    archived = []
    for run_dir in sorted((work_dir / "runs").iterdir() if (work_dir / "runs").exists() else ()):
        if not (run_dir / "run.json").exists():
            continue
        if not _is_archivable_attempt(run_dir):
            continue
        archived.append(archive_run(run_dir, history_dir))
    return archived


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
    work_dir: Path,
) -> EvaluationResult:
    try:
        return evaluate_candidate(
            case,
            candidate,
            candidate_metadata=metadata,
            work_dir=work_dir,
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
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [
            "node", str(RETAINMOL_EXECUTOR),
            "--initial", str(initial),
            "--plan", str(edit_plan),
            "--output", str(candidate),
            "--metadata", str(metadata),
            "--receipt", str(receipt),
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

    task_dir = work_dir / "tasks" / case.case_id
    initial = task_dir / "initial-molecule.json"
    if not initial.exists():
        prepare_task_bundle(case, work_dir)
    copied_candidate = run_dir / ("candidate.raw.sdf" if refine else "candidate.sdf")
    copied_metadata = run_dir / "candidate.json"
    receipt = run_dir / "execution.json"
    execution = _execute_edit_plan(
        initial=initial,
        edit_plan=copied_plan,
        candidate=copied_candidate,
        metadata=copied_metadata,
        receipt=receipt,
    )
    if execution.returncode == 0:
        raw_result = _evaluate_or_invalid(case, copied_candidate, copied_metadata, work_dir)
    else:
        error = RuntimeError(
            "RetainMol EditPlan 执行失败：" + (execution.stderr.strip() or execution.stdout.strip())
        )
        raw_result = _invalid_result(case, error)
    result = raw_result
    evaluated_candidate = copied_candidate
    refinement = None
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
            result = _evaluate_or_invalid(case, evaluated_candidate, copied_metadata, work_dir)
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
    record = {
        "schemaVersion": 1,
        "runId": run_dir.name,
        "createdAt": datetime.now(UTC).isoformat(),
        "gitCommit": _git_commit(),
        "gitDirty": _git_dirty(),
        "executor": "@retainmol/mol-viewer/modeling",
        "executorReturnCode": execution.returncode,
        "executorStderr": execution.stderr.strip() or None,
        "editPlanSha256": _sha256(copied_plan),
        "executionReceiptSha256": _sha256(receipt) if receipt.exists() else None,
        "candidateSha256": _sha256(evaluated_candidate) if evaluated_candidate.exists() else None,
        "rawCandidateSha256": _sha256(copied_candidate) if copied_candidate.exists() else None,
        "referenceSdfSha256": _sha256(
            work_dir / "references" / case.case_id / "reference.sdf"
        ),
        "rawEvaluation": raw_result.to_json(),
        "refinement": refinement,
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
