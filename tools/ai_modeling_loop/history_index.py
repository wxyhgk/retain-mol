from __future__ import annotations

import fcntl
import json
import os
import shutil
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from .contracts import DEFAULT_HISTORY_DIR, DEFAULT_WORK_DIR
from .formal_verdict import VerificationStatus, parse_verification_envelope
from .publication_gate import archived_publication_status


def _write_json_atomic(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    os.replace(temporary, path)


@contextmanager
def _history_lock(history_dir: Path) -> Iterator[None]:
    history_dir.mkdir(parents=True, exist_ok=True)
    lock_path = history_dir / ".index.lock"
    with lock_path.open("a+") as lock:
        fcntl.flock(lock.fileno(), fcntl.LOCK_EX)
        try:
            yield
        finally:
            fcntl.flock(lock.fileno(), fcntl.LOCK_UN)


def _history_records(history_dir: Path) -> tuple[list[tuple[Path, dict]], list[dict]]:
    records: list[tuple[Path, dict]] = []
    errors: list[dict] = []
    for path in sorted(history_dir.glob("*/*/run.json")):
        try:
            value = json.loads(path.read_text())
            if not isinstance(value, dict):
                raise ValueError("run record must be an object")
            records.append((path, value))
        except (OSError, json.JSONDecodeError, ValueError) as error:
            errors.append({
                "path": str(path.relative_to(history_dir)),
                "error": f"{type(error).__name__}: {error}",
            })
    return records, errors


def _rebuild_history_index_unlocked(history_dir: Path) -> None:
    rows = []
    records, errors = _history_records(history_dir)
    for path, value in records:
        try:
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
        except (KeyError, TypeError) as error:
            errors.append({
                "path": str(path.relative_to(history_dir)),
                "error": f"{type(error).__name__}: {error}",
            })
    _write_json_atomic(history_dir / "index.json", {
        "schemaVersion": 1,
        "runs": rows,
        "errors": errors,
    })


def _invalidate_verified_index_unlocked(history_dir: Path) -> None:
    _write_json_atomic(history_dir / "verified" / "index.json", {
        "schemaVersion": 1,
        "runs": [],
        "errors": [{
            "path": "verified/index.json",
            "error": "verified index rebuild in progress",
        }],
    })


def _rebuild_verified_index_unlocked(history_dir: Path) -> None:
    _invalidate_verified_index_unlocked(history_dir)
    rows = []
    records, errors = _history_records(history_dir)
    for path, value in records:
        try:
            verification = value.get("verification")
            evaluation = value.get("evaluation", {})
            if not isinstance(verification, dict):
                continue
            if not isinstance(evaluation, dict) or evaluation.get("passed") is not True:
                continue
            envelope = parse_verification_envelope(verification)
            if archived_publication_status(path.parent, value, envelope) is not VerificationStatus.PASS:
                continue
            rows.append({
                "runId": value["runId"],
                "caseId": evaluation["case_id"],
                "createdAt": value["createdAt"],
                "score": evaluation["score"],
                "verificationContextSha256": envelope.verification_context_sha256,
                "artifactSha256": envelope.artifact_sha256,
                "path": str(path.parent.relative_to(history_dir)),
            })
        except Exception as error:
            errors.append({
                "path": str(path.relative_to(history_dir)),
                "error": f"{type(error).__name__}: {error}",
            })
    _write_json_atomic(history_dir / "verified" / "index.json", {
        "schemaVersion": 1,
        "runs": rows,
        "errors": errors,
    })


def _rebuild_history_index(history_dir: Path) -> None:
    with _history_lock(history_dir):
        _rebuild_history_index_unlocked(history_dir)


def _rebuild_verified_index(history_dir: Path) -> None:
    with _history_lock(history_dir):
        _rebuild_verified_index_unlocked(history_dir)


def archive_run(run_dir: Path, history_dir: Path = DEFAULT_HISTORY_DIR) -> Path:
    with _history_lock(history_dir):
        _invalidate_verified_index_unlocked(history_dir)
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
        _rebuild_history_index_unlocked(history_dir)
        _rebuild_verified_index_unlocked(history_dir)
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
        if not (run_dir / "run.json").exists() or not _is_archivable_attempt(run_dir):
            continue
        archived.append(archive_run(run_dir, history_dir))
    _rebuild_history_index(history_dir)
    _rebuild_verified_index(history_dir)
    return archived
