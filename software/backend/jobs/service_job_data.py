"""Job input and artifact methods exposed by :class:`JobService`."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from .artifact_manager import ArtifactManager
from .legacy_inputs import LegacyJobInputManager
from .models import Artifact, Job, JobInput


class JobDataServiceApi:
    """Manage persisted inputs and reusable output artifacts for a job."""

    artifact_manager: ArtifactManager
    legacy_inputs: LegacyJobInputManager

    def add_inputs(self, job_id: str, inputs: Mapping[str, Any]) -> Job:
        """Add a batch of named inputs, as submitted by the jobs HTTP route."""
        return self.legacy_inputs.add_many(job_id, inputs)

    def list_artifacts(self, job_id: str) -> list[Artifact]:
        """Return every artifact registered for a job."""
        return self.artifact_manager.list(job_id)

    def get_artifact(self, artifact_id: str) -> Artifact:
        return self.artifact_manager.get(artifact_id)

    def add_input(
        self,
        job_id: str,
        name: str,
        value: Any,
        *,
        metadata: dict[str, Any] | None = None,
    ) -> JobInput:
        return self.legacy_inputs.add(job_id, name, value, metadata=metadata)

    def add_artifact(
        self,
        job_id: str,
        name: str,
        path: str,
        *,
        media_type: str | None = None,
        metadata: dict[str, Any] | None = None,
        run_id: str | None = None,
    ) -> Artifact:
        return self.artifact_manager.add(
            job_id,
            name,
            path,
            media_type=media_type,
            metadata=metadata,
            run_id=run_id,
        )
