from __future__ import annotations

import os
from dataclasses import dataclass, replace
from pathlib import Path
from typing import Callable

from .artifact_contracts import sha256_file
from .chemistry import load_sdf, with_explicit_hydrogens, write_sdf
from .contracts import BenchmarkCase
from .evaluator import EvaluationResult, candidate_anchor_indices
from .run_preparation import RunPaths


@dataclass(frozen=True)
class RefinementOutcome:
    result: EvaluationResult
    evaluated_candidate: Path
    refinement: dict | None
    transport_evidence: dict | None
    transport_source_sdf: Path | None
    transport_input_xyz: Path | None
    transport_output_xyz: Path | None


def xtb_stage(result, method: str, status: str = "completed") -> dict:
    return {
        "method": method,
        "status": status if result.converged else "not-converged",
        "energyEh": result.energy,
        "returnCode": result.return_code,
        "anchorRmsdBeforeProjection": result.anchor_rmsd_before_projection,
        "logTail": result.log_tail,
    }


def refine_with_xtb_fallback(
    molecule,
    *,
    case: BenchmarkCase,
    fixed_atom_indices: tuple[int, ...],
    xtb: str | None,
    optimize: Callable,
):
    stages = []
    try:
        result = optimize(
            molecule,
            charge=case.charge,
            multiplicity=case.multiplicity,
            fixed_atom_indices=fixed_atom_indices,
            xtb=xtb,
            method="gfn2",
        )
        stages.append(xtb_stage(result, "GFN2-xTB"))
        return result, stages
    except Exception as direct_error:
        stages.append({
            "method": "GFN2-xTB",
            "status": "failed",
            "error": f"{type(direct_error).__name__}: {direct_error}",
        })

    pre_relaxed = optimize(
        molecule,
        charge=case.charge,
        multiplicity=case.multiplicity,
        fixed_atom_indices=fixed_atom_indices,
        xtb=xtb,
        method="gfnff",
        max_steps=300,
    )
    stages.append(xtb_stage(pre_relaxed, "GFN-FF"))
    result = optimize(
        pre_relaxed.molecule,
        charge=case.charge,
        multiplicity=case.multiplicity,
        fixed_atom_indices=fixed_atom_indices,
        xtb=xtb,
        method="gfn2",
        electronic_temperature=1000,
    )
    stages.append(xtb_stage(result, "GFN2-xTB(etemp=1000K)"))
    return result, stages


def refine_conformer_ensemble(
    molecule,
    *,
    case: BenchmarkCase,
    fixed_atom_indices: tuple[int, ...],
    seeds: tuple[int, ...],
    xtb: str | None,
    embed: Callable,
    optimize: Callable,
):
    stages = []
    pre_relaxed = []
    sources = [("input", None, molecule)]
    for seed in seeds:
        try:
            embedded = embed(
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
            result = optimize(
                source,
                charge=case.charge,
                multiplicity=case.multiplicity,
                fixed_atom_indices=fixed_atom_indices,
                xtb=xtb,
                method="gfnff",
                max_steps=300,
            )
            stage = xtb_stage(result, "GFN-FF")
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
        result = optimize(
            selected.molecule,
            charge=case.charge,
            multiplicity=case.multiplicity,
            fixed_atom_indices=fixed_atom_indices,
            xtb=xtb,
            method="gfn2",
        )
        stage = xtb_stage(result, "GFN2-xTB")
    except Exception as error:
        stages.append({
            "method": "GFN2-xTB",
            "source": selected_source,
            "status": "failed",
            "error": f"{type(error).__name__}: {error}",
        })
        result = optimize(
            selected.molecule,
            charge=case.charge,
            multiplicity=case.multiplicity,
            fixed_atom_indices=fixed_atom_indices,
            xtb=xtb,
            method="gfn2",
            electronic_temperature=1000,
        )
        stage = xtb_stage(result, "GFN2-xTB(etemp=1000K)")
    stage.update({"source": selected_source})
    stages.append(stage)
    return result, stages, selected_source


def refine_candidate(
    *,
    case: BenchmarkCase,
    paths: RunPaths,
    raw_result: EvaluationResult,
    conformer_seeds: tuple[int, ...],
    xtb: str | None,
    refine_with_fallback: Callable,
    refine_ensemble: Callable,
    write_coordinate_receipt: Callable[..., str],
    evaluate_candidate: Callable[[Path], EvaluationResult],
    row_order_contract: str,
    post_processing: str,
    trusted_xtb_sha256: str | None,
) -> RefinementOutcome:
    evaluated_candidate = paths.raw_candidate
    if "candidate-invalid" in raw_result.failures:
        return RefinementOutcome(raw_result, evaluated_candidate, None, None, None, None, None)

    try:
        molecule = with_explicit_hydrogens(load_sdf(paths.raw_candidate))
        anchors = candidate_anchor_indices(case, molecule, paths.metadata)
        fixed_indices = tuple(index + 1 for index in anchors.values())
        selected_source = "input"
        if conformer_seeds:
            xtb_result, stages, selected_source = refine_ensemble(
                molecule,
                case=case,
                fixed_atom_indices=fixed_indices,
                seeds=conformer_seeds,
                xtb=xtb,
            )
        else:
            xtb_result, stages = refine_with_fallback(
                molecule,
                case=case,
                fixed_atom_indices=fixed_indices,
                xtb=xtb,
            )

        if (
            xtb_result.input_molecule is None
            or xtb_result.input_xyz_text is None
            or xtb_result.output_xyz_text is None
            or xtb_result.executable_sha256 is None
            or xtb_result.input_xyz_sha256 is None
            or xtb_result.output_xyz_sha256 is None
        ):
            raise ValueError("xTB adapter did not return complete coordinate provenance")

        staged_candidate = paths.run_dir / ".candidate.refined.sdf.tmp"
        write_sdf(xtb_result.molecule, staged_candidate)
        write_sdf(xtb_result.input_molecule, paths.xtb_input_sdf)
        paths.xtb_input_xyz.write_text(xtb_result.input_xyz_text, encoding="utf-8")
        paths.xtb_output_xyz.write_text(xtb_result.output_xyz_text, encoding="utf-8")
        if sha256_file(paths.xtb_input_xyz) != xtb_result.input_xyz_sha256:
            raise ValueError("archived xTB input XYZ hash mismatch")
        if sha256_file(paths.xtb_output_xyz) != xtb_result.output_xyz_sha256:
            raise ValueError("archived xTB output XYZ hash mismatch")

        coordinate_receipt_sha256 = write_coordinate_receipt(
            path=paths.coordinate_transport_receipt,
            builder_snapshot_path=paths.builder_snapshot,
            identity_map_path=paths.identity_map,
            final_sdf_path=staged_candidate,
            source_sdf_path=paths.xtb_input_sdf,
            input_xyz_path=paths.xtb_input_xyz,
            output_xyz_path=paths.xtb_output_xyz,
            executable_sha256=xtb_result.executable_sha256,
            fixed_atom_rows=fixed_indices,
        )
        result = evaluate_candidate(staged_candidate)
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
        transport_evidence = {
            "kind": "xtb-coordinate-transport",
            "trusted": bool(
                trusted_xtb_sha256
                and trusted_xtb_sha256 == xtb_result.executable_sha256
            ),
            "executableSha256": xtb_result.executable_sha256,
            "expectedExecutableSha256Configured": bool(trusted_xtb_sha256),
            "command": list(xtb_result.command),
            "inputXyzSha256": xtb_result.input_xyz_sha256,
            "outputXyzSha256": xtb_result.output_xyz_sha256,
            "sourceSdfSha256": sha256_file(paths.xtb_input_sdf),
            "rowOrderContract": row_order_contract,
            "postProcessing": post_processing,
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
        os.replace(staged_candidate, paths.final_candidate)
        evaluated_candidate = paths.final_candidate
        return RefinementOutcome(
            result,
            evaluated_candidate,
            refinement,
            transport_evidence,
            paths.xtb_input_sdf,
            paths.xtb_input_xyz,
            paths.xtb_output_xyz,
        )
    except Exception as error:
        (paths.run_dir / ".candidate.refined.sdf.tmp").unlink(missing_ok=True)
        if paths.executor_coordinate_transport_receipt.is_file():
            temporary_receipt = paths.run_dir / ".coordinate-transport.restore.tmp"
            temporary_receipt.write_bytes(paths.executor_coordinate_transport_receipt.read_bytes())
            os.replace(temporary_receipt, paths.coordinate_transport_receipt)
        else:
            paths.coordinate_transport_receipt.unlink(missing_ok=True)
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
        return RefinementOutcome(
            result,
            paths.raw_candidate,
            refinement,
            {
                "kind": "xtb-coordinate-transport",
                "trusted": False,
                "error": f"{type(error).__name__}: {error}",
            },
            None,
            None,
            None,
        )
