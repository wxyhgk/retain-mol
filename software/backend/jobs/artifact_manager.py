"""Artifact registration and immutable-content publication."""

from __future__ import annotations

import secrets
from datetime import UTC, datetime
from pathlib import Path
from collections.abc import Callable
from typing import Any

from .artifact_storage import ArtifactStorage
from .errors import InvalidJobOperationError, JobNotFoundError
from .job_workspace import JobWorkspace
from .models import Artifact, Job
from .repository import JobRepository

JobLoader = Callable[[str], Job]


class ArtifactManager:
    """Registers Job artifacts without owning Job lifecycle transitions."""

    def __init__(
        self,
        repository: JobRepository,
        storage: ArtifactStorage,
        workspace: JobWorkspace,
        load_job: JobLoader,
    ) -> None:
        self.repository = repository
        self.storage = storage
        self.workspace = workspace
        self.tasks_root = workspace.root
        self.load_job = load_job

    def list(self, job_id: str) -> list[Artifact]:
        self._require_job(job_id)
        return self.repository.get_artifacts(job_id)

    def get(self, artifact_id: str) -> Artifact:
        artifact = self.repository.get_artifact(artifact_id)
        if artifact is None:
            raise KeyError(artifact_id)
        return artifact

    def add(
        self,
        job_id: str,
        name: str,
        path: str,
        *,
        media_type: str | None = None,
        metadata: dict[str, Any] | None = None,
        run_id: str | None = None,
    ) -> Artifact:
        self._require_job(job_id)
        self._validate_run(job_id, run_id)
        normalized_metadata = metadata or {}
        artifact = Artifact(
            artifact_id=f"artifact-{secrets.token_hex(8)}",
            job_id=job_id,
            run_id=run_id,
            name=_required_text(name, "name"),
            path=_required_text(path, "path"),
            **self._content_identity(job_id, path),
            kind=_artifact_kind(normalized_metadata.get("format")),
            role=str(normalized_metadata.get("role") or "output"),
            format=str(normalized_metadata.get("format") or _path_format(path)),
            media_type=media_type,
            metadata=normalized_metadata,
            created_at=_now(),
        )
        persisted = self.repository.add_artifact(artifact)
        if not self.repository.touch_job(job_id, _now()):
            raise JobNotFoundError(job_id)
        self.workspace.write_snapshot(self.load_job(job_id))
        return persisted

    def _validate_run(self, job_id: str, run_id: str | None) -> None:
        if run_id is None:
            return
        run = self.repository.get_job_run(run_id)
        if run is None:
            raise InvalidJobOperationError(f"JobRun '{run_id}' does not exist")
        if run.job_id != job_id:
            raise InvalidJobOperationError(
                f"JobRun '{run_id}' does not belong to Job '{job_id}'"
            )

    def _content_identity(self, job_id: str, path: str) -> dict[str, Any]:
        candidate = (self.tasks_root / job_id / path).resolve()
        task_root = (self.tasks_root / job_id).resolve()
        if task_root not in candidate.parents or not candidate.is_file():
            return {}
        published = self.storage.publish_file(candidate)
        return {
            "storage_key": published["storageKey"],
            "sha256": published["sha256"],
            "byte_size": published["byteSize"],
        }

    def _require_job(self, job_id: str) -> None:
        if self.repository.get_job(job_id) is None:
            raise JobNotFoundError(job_id)


def _now() -> datetime:
    return datetime.now(UTC)


def _required_text(value: str, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} must be a non-empty string")
    return value


def _path_format(path: str) -> str:
    suffix = Path(path).suffix.lower().lstrip(".")
    return suffix or "file"


def _artifact_kind(format_name: Any) -> str:
    normalized = str(format_name or "").lower()
    if normalized in {"xyz", "sdf", "mol", "retainmol-json"}:
        return "structure"
    if normalized == "cube":
        return "volumetric-grid"
    if normalized == "molden":
        return "wavefunction"
    if normalized in {"png", "jpg", "jpeg", "webp"}:
        return "image"
    if normalized in {"log", "out"}:
        return "log"
    if normalized == "trajectory-json":
        return "trajectory"
    return "file"
