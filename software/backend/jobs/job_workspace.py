"""Filesystem workspace for persisted Jobs."""

from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any

from .models import Job

_TERMINAL_STATUSES = {"succeeded", "failed", "cancelled", "interrupted"}
_LOG_CANDIDATES = (
    "xtb.log",
    "psi4.log",
    "psi4-process.log",
    "irc-forward/psi4.log",
    "irc-backward/psi4.log",
)


class JobWorkspace:
    """Owns task directories, exported snapshots, and incremental log reads."""

    def __init__(self, data_root: str | Path) -> None:
        self.root = Path(data_root) / "tasks"
        self.root.mkdir(parents=True, exist_ok=True)

    def directory(self, job_id: str) -> Path:
        directory = self.root / job_id
        directory.mkdir(parents=True, exist_ok=True)
        return directory

    def remove(self, job_id: str) -> None:
        shutil.rmtree(self.root / job_id, ignore_errors=True)

    def write_snapshot(self, job: Job) -> None:
        directory = self.directory(job.job_id)
        snapshot_path = directory / "job.json"
        temporary_path = directory / ".job.json.tmp"
        temporary_path.write_text(
            json.dumps(
                job.model_dump(mode="json", by_alias=True),
                ensure_ascii=True,
                indent=2,
                sort_keys=True,
            )
            + "\n",
            encoding="utf-8",
        )
        temporary_path.replace(snapshot_path)

    def read_log(
        self,
        job: Job,
        *,
        cursor: int = 0,
        limit: int = 128 * 1024,
    ) -> dict[str, Any]:
        cursor = max(0, int(cursor))
        limit = min(max(1, int(limit)), 512 * 1024)
        directory = self.root / job.job_id
        path = next(
            (
                candidate
                for relative_path in _LOG_CANDIDATES
                if (candidate := directory / relative_path).is_file()
            ),
            None,
        )
        if path is None:
            return {
                "content": "",
                "cursor": 0,
                "source": None,
                "complete": job.status in _TERMINAL_STATUSES,
            }
        size = path.stat().st_size
        if cursor > size:
            cursor = 0
        with path.open("rb") as handle:
            handle.seek(cursor)
            chunk = handle.read(limit)
        return {
            "content": chunk.decode("utf-8", errors="replace"),
            "cursor": cursor + len(chunk),
            "source": path.name,
            "complete": job.status in _TERMINAL_STATUSES,
        }
