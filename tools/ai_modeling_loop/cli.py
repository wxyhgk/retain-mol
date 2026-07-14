from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

from rdkit import rdBase

from .contracts import DEFAULT_WORK_DIR, list_cases, load_case
from .runner import archive_existing_runs, record_run, scoreboard
from .provider import OpenAICompatibleClient, OpenAICompatibleConfig
from .region_proposal import run_region_proposal
from .region_tree import run_region_tree
from .topology_audit import run_topology_audit
from .workspace import prepare_reference_ensemble, prepare_task_bundle


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="retainmol-ai-loop")
    parser.add_argument("--work-dir", type=Path, default=DEFAULT_WORK_DIR)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("doctor")
    tasks = sub.add_parser("prepare-tasks")
    tasks.add_argument("--case", action="append", dest="cases")
    references = sub.add_parser("prepare-references")
    references.add_argument("--case", action="append", dest="cases")
    references.add_argument("--seeds", default="20260713")
    references.add_argument("--xtb")
    run = sub.add_parser("record-run")
    run.add_argument("--case", required=True)
    run.add_argument("--edit-plan", type=Path, required=True)
    run.add_argument("--builder-notes", type=Path)
    run.add_argument("--refine", action="store_true")
    run.add_argument("--xtb")
    run.add_argument("--conformer-seeds", default="")
    sub.add_parser("scoreboard")
    sub.add_parser("archive-runs")
    audit = sub.add_parser("audit-image")
    audit.add_argument("--image", type=Path, required=True)
    audit.add_argument("--run-id")
    audit.add_argument("--max-attempts", type=int, default=3)
    regions = sub.add_parser("propose-regions")
    regions.add_argument("--image", type=Path, required=True)
    regions.add_argument("--run-id")
    regions.add_argument("--max-attempts", type=int, default=3)
    regions.add_argument("--min-regions", type=int, default=1)
    regions.add_argument("--max-regions", type=int, default=16)
    tree = sub.add_parser("plan-region-tree")
    tree.add_argument("--image", type=Path, required=True)
    tree.add_argument("--run-id")
    tree.add_argument("--max-depth", type=int, default=2)
    tree.add_argument("--max-children", type=int, default=8)
    tree.add_argument("--max-attempts", type=int, default=3)
    return parser


def _selected(case_ids: list[str] | None):
    return [load_case(case_id) for case_id in case_ids] if case_ids else list(list_cases())


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    if args.command == "doctor":
        payload = {
            "rdkit": rdBase.rdkitVersion,
            "xtb": shutil.which("xtb") or "conda env: retainmol-backend",
            "workDir": str(args.work_dir),
            "cases": [case.case_id for case in list_cases()],
        }
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0
    if args.command == "prepare-tasks":
        for case in _selected(args.cases):
            print(prepare_task_bundle(case, args.work_dir))
        return 0
    if args.command == "prepare-references":
        seeds = [int(value) for value in args.seeds.split(",") if value.strip()]
        for case in _selected(args.cases):
            print(prepare_reference_ensemble(case, seeds=seeds, work_dir=args.work_dir, xtb=args.xtb))
        return 0
    if args.command == "record-run":
        run_dir, result = record_run(
            load_case(args.case),
            args.edit_plan,
            builder_notes=args.builder_notes,
            work_dir=args.work_dir,
            refine=args.refine,
            xtb=args.xtb,
            conformer_seeds=tuple(
                int(value) for value in args.conformer_seeds.split(",") if value.strip()
            ),
        )
        print(json.dumps({"runDir": str(run_dir), **result.to_json()}, ensure_ascii=False, indent=2))
        return 0 if result.passed else 2
    if args.command == "scoreboard":
        print(json.dumps(scoreboard(args.work_dir), ensure_ascii=False, indent=2))
        return 0
    if args.command == "archive-runs":
        for path in archive_existing_runs(args.work_dir):
            print(path)
        return 0
    if args.command == "audit-image":
        result = run_topology_audit(
            image=args.image,
            client=OpenAICompatibleClient(OpenAICompatibleConfig.from_environment()),
            run_id=args.run_id,
            max_attempts=args.max_attempts,
            work_dir=args.work_dir,
        )
        print(json.dumps({
            "runDir": str(result.run_dir),
            "attemptCount": result.attempt_count,
            "validation": result.validation.to_json(),
            "audit": result.audit,
        }, ensure_ascii=False, indent=2))
        return 0 if result.validation.valid else 2
    if args.command == "propose-regions":
        result = run_region_proposal(
            image=args.image,
            client=OpenAICompatibleClient(OpenAICompatibleConfig.from_environment()),
            min_regions=args.min_regions,
            max_regions=args.max_regions,
            run_id=args.run_id,
            max_attempts=args.max_attempts,
            work_dir=args.work_dir,
        )
        print(json.dumps({
            "runDir": str(result.run_dir),
            "attemptCount": result.attempt_count,
            "validation": result.validation.to_json(),
            "proposal": result.proposal,
        }, ensure_ascii=False, indent=2))
        return 0 if result.validation.valid else 2
    if args.command == "plan-region-tree":
        result = run_region_tree(
            image=args.image,
            client=OpenAICompatibleClient(OpenAICompatibleConfig.from_environment()),
            run_id=args.run_id,
            max_depth=args.max_depth,
            max_children=args.max_children,
            max_attempts=args.max_attempts,
            work_dir=args.work_dir,
        )
        print(json.dumps({
            "runDir": str(result.run_dir),
            "leafRegionCount": len(result.tree["leafGraph"]["regions"]),
            "leafEdgeCount": len(result.tree["leafGraph"]["edges"]),
            "validation": result.validation.to_json(),
        }, ensure_ascii=False, indent=2))
        return 0 if result.validation.complete else 2
    return 1


if __name__ == "__main__":
    sys.exit(main())
