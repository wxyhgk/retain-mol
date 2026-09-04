"""Read-side assembly for persisted job aggregates."""

from __future__ import annotations

from .errors import InvalidJobOperationError, JobNotFoundError
from .models import CalculationSpec, Job, JobInputSnapshot, JobTypeData
from .repository import JobRepository


class JobQueryManager:
    """Loads jobs together with their persisted inputs, snapshots, and artifacts."""

    def __init__(self, repository: JobRepository) -> None:
        self.repository = repository

    def list(self) -> list[Job]:
        jobs = self.repository.list_jobs()
        for job in jobs:
            self._populate_relations(job)
        return jobs

    def get(self, job_id: str) -> Job:
        job = self.repository.get_job(job_id)
        if job is None:
            raise JobNotFoundError(job_id)
        self._populate_relations(job)
        return job

    def get_calculation_spec(self, job_id: str) -> CalculationSpec | None:
        job = self.get(job_id)
        return (
            self.repository.get_calculation_spec(job.spec_id) if job.spec_id else None
        )

    def get_input_snapshots(self, job_id: str) -> list[JobInputSnapshot]:
        self.get(job_id)
        return self.repository.list_job_input_snapshots(job_id)

    def get_job_type_data(self, job_id: str) -> JobTypeData:
        self.get(job_id)
        job_type_data = self.repository.get_job_type_data(job_id)
        if job_type_data is None:
            raise InvalidJobOperationError(
                f"Job '{job_id}' has no persisted JobType data"
            )
        return job_type_data

    def _populate_relations(self, job: Job) -> None:
        job.inputs = self.repository.get_inputs(job.job_id)
        job.input_snapshots = self.repository.list_job_input_snapshots(job.job_id)
        job.artifacts = self.repository.get_artifacts(job.job_id)
