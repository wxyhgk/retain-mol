from __future__ import annotations

import os
import shutil
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Callable

from .contracts import BenchmarkCase
from .target_evaluation import archive_target_evidence


@dataclass(frozen=True)
class RunPaths:
    run_dir: Path
    copied_plan: Path
    archived_reference: Path
    archived_evaluator: Path
    run_manifest: Path
    run_spec: Path
    initial: Path
    raw_candidate: Path
    metadata: Path
    execution_receipt: Path
    builder_snapshot: Path
    identity_map: Path
    coordinate_transport_receipt: Path
    executor_coordinate_transport_receipt: Path
    expected_effect: Path
    enforced_plan: Path
    final_candidate: Path
    xtb_input_sdf: Path
    xtb_input_xyz: Path
    xtb_output_xyz: Path


@dataclass(frozen=True)
class PreparedRun:
    paths: RunPaths
    manifest: dict
    trusted_xtb_sha256: str | None


def prepare_run(
    case: BenchmarkCase,
    edit_plan: Path,
    *,
    work_dir: Path,
    refine: bool,
    builder_notes: Path | None,
    git_commit: str | None,
    git_dirty: bool | None,
    sha256: Callable[[Path], str],
    write_json_atomic: Callable[[Path, dict], None],
    prepare_task: Callable[[BenchmarkCase, Path], Path],
    xtb: str | None,
    conformer_seeds: tuple[int, ...],
) -> PreparedRun:
    stamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    run_dir = work_dir / "runs" / f"{stamp}-{case.case_id}"
    suffix = 1
    while True:
        try:
            run_dir.mkdir(parents=True)
            break
        except FileExistsError:
            suffix += 1
            run_dir = work_dir / "runs" / f"{stamp}-{case.case_id}-{suffix}"

    copied_plan = run_dir / "edit-plan.json"
    shutil.copy2(edit_plan, copied_plan)
    if builder_notes and builder_notes.exists():
        shutil.copy2(builder_notes, run_dir / "builder-notes.json")

    task_dir = work_dir / "tasks" / case.case_id
    shared_initial = task_dir / "initial-molecule.json"
    if not shared_initial.exists():
        prepare_task(case, work_dir)
    frozen_input_dir = run_dir / "inputs"
    frozen_input_dir.mkdir()
    initial = frozen_input_dir / "initial-molecule.json"
    shutil.copy2(shared_initial, initial)

    trusted_xtb_sha256 = os.environ.get("RETAINMOL_TRUSTED_XTB_SHA256")
    run_spec = run_dir / "run-spec.json"
    run_spec_value = {
        "schemaVersion": 2,
        "caseId": case.case_id,
        "charge": case.charge,
        "multiplicity": case.multiplicity,
        "anchors": [
            {
                "id": anchor.anchor_id,
                "referenceAtomIndex": anchor.atom_index,
                "symbol": anchor.symbol,
                "position": anchor.position.to_json(),
            }
            for anchor in case.anchors
        ],
        "refinement": {
            "enabled": refine,
            "xtb": xtb,
            "conformerSeeds": list(conformer_seeds),
            "trustedExecutableSha256": trusted_xtb_sha256,
        },
        "geometryPolicy": case.geometry_policy_spec.to_json(),
    }
    write_json_atomic(run_spec, run_spec_value)

    reference_source = work_dir / "references" / case.case_id / "reference.sdf"
    archived_reference, archived_evaluator = archive_target_evidence(
        reference_source=reference_source,
        run_dir=run_dir,
    )
    created_at = datetime.now(UTC).isoformat()
    run_manifest = run_dir / "run-manifest.json"
    manifest = {
        "schemaVersion": 2,
        "runId": run_dir.name,
        "createdAt": created_at,
        "caseId": case.case_id,
        "gitCommit": git_commit,
        "gitDirty": git_dirty,
        "executor": "@retainmol/mol-viewer/modeling",
        "editPlanSha256": sha256(copied_plan),
        "referenceSdfSha256": sha256(archived_reference),
        "evaluatorSourceSha256": sha256(archived_evaluator),
        "initialMoleculeSha256": sha256(initial),
        "runSpecSha256": sha256(run_spec),
    }
    write_json_atomic(run_manifest, manifest)

    paths = RunPaths(
        run_dir=run_dir,
        copied_plan=copied_plan,
        archived_reference=archived_reference,
        archived_evaluator=archived_evaluator,
        run_manifest=run_manifest,
        run_spec=run_spec,
        initial=initial,
        raw_candidate=run_dir / ("candidate.raw.sdf" if refine else "candidate.sdf"),
        metadata=run_dir / "candidate.json",
        execution_receipt=run_dir / "execution.json",
        builder_snapshot=run_dir / "builder-snapshot.json",
        identity_map=run_dir / "identity-map.json",
        coordinate_transport_receipt=run_dir / "coordinate-transport.json",
        executor_coordinate_transport_receipt=run_dir / "coordinate-transport.raw.json",
        expected_effect=run_dir / "expected-effect.json",
        enforced_plan=run_dir / "enforced-plan.json",
        final_candidate=run_dir / "candidate.sdf",
        xtb_input_sdf=run_dir / "xtb-input.sdf",
        xtb_input_xyz=run_dir / "xtb-input.xyz",
        xtb_output_xyz=run_dir / "xtb-output.xyz",
    )
    return PreparedRun(
        paths=paths,
        manifest=manifest,
        trusted_xtb_sha256=trusted_xtb_sha256,
    )
