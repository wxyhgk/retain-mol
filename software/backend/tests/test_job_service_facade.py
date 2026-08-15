"""Architecture checks for the route-facing JobService facade."""

from __future__ import annotations

import pytest

from software.backend.jobs.service import JobService
from software.backend.jobs.service_job_data import JobDataServiceApi
from software.backend.jobs.service_job_definitions import JobDefinitionServiceApi
from software.backend.jobs.service_job_execution import JobExecutionServiceApi
from software.backend.jobs.service_job_records import JobRecordServiceApi
from software.backend.jobs.service_jobs import JobServiceApi


def test_job_service_facade_composes_focused_capabilities() -> None:
    assert JobServiceApi.__bases__ == (
        JobDefinitionServiceApi,
        JobRecordServiceApi,
        JobDataServiceApi,
        JobExecutionServiceApi,
    )


@pytest.mark.parametrize(
    ("method_name", "owner"),
    [
        ("create_calculation_job", JobDefinitionServiceApi),
        ("queue_calculation_job", JobDefinitionServiceApi),
        ("get_job", JobRecordServiceApi),
        ("clone_job", JobRecordServiceApi),
        ("add_artifact", JobDataServiceApi),
        ("get_artifact", JobDataServiceApi),
        ("claim_next_dispatch", JobExecutionServiceApi),
        ("finish_job_dispatch", JobExecutionServiceApi),
    ],
)
def test_job_service_method_remains_owned_by_capability(
    method_name: str,
    owner: type[object],
) -> None:
    assert getattr(JobService, method_name) is getattr(owner, method_name)
