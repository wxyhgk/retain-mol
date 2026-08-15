"""Stable aggregate of the route-facing Job service capabilities."""

from __future__ import annotations

from .service_job_data import JobDataServiceApi
from .service_job_definitions import JobDefinitionServiceApi
from .service_job_execution import JobExecutionServiceApi
from .service_job_records import JobRecordServiceApi


class JobServiceApi(
    JobDefinitionServiceApi,
    JobRecordServiceApi,
    JobDataServiceApi,
    JobExecutionServiceApi,
):
    """Compatibility facade composed from focused Job capability groups."""
