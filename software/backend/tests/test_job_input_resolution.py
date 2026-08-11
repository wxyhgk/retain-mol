"""Focused tests for job input source dispatch and workflow resolution."""

from __future__ import annotations

import tempfile
from datetime import UTC, datetime
from pathlib import Path

import pytest

from software.backend.jobs import InvalidJobInputError, JobService
from software.backend.jobs.input_resolution import JobInputResolver


def test_resolver_freezes_literal_structure_without_job_service_branching() -> None:
    with tempfile.TemporaryDirectory() as directory:
        service = JobService(Path(directory) / "data")
        resolver = JobInputResolver(service.repository)

        snapshots = resolver.build_snapshots(
            "20260811-1234abcd",
            "xtb-optimization",
            {
                "structure": {
                    "sourceKind": "literal",
                    "format": "molecule",
                    "value": {"structure": {"atoms": []}},
                }
            },
            datetime.now(UTC),
        )

        assert len(snapshots) == 1
        assert snapshots[0].source_kind == "literal"
        assert snapshots[0].literal_value["format"] == "molecule"
        assert len(snapshots[0].content_sha256 or "") == 64


def test_resolver_rejects_unknown_source_kind_at_the_input_boundary() -> None:
    with tempfile.TemporaryDirectory() as directory:
        service = JobService(Path(directory) / "data")
        resolver = JobInputResolver(service.repository)

        with pytest.raises(InvalidJobInputError, match="is not resolvable"):
            resolver.build_snapshots(
                "20260811-1234abcd",
                "xtb-optimization",
                {
                    "structure": {
                        "sourceKind": "remote-url",
                        "format": "molecule",
                        "url": "https://example.invalid/molecule.sdf",
                    }
                },
                datetime.now(UTC),
            )


def test_resolver_rejects_target_outside_workflow() -> None:
    with tempfile.TemporaryDirectory() as directory:
        service = JobService(Path(directory) / "data")
        member = service.create_job("source")
        outsider = service.create_job("target")
        workflow = service.create_workflow("single member", [member.job_id], [])

        with pytest.raises(InvalidJobInputError, match="is not a member"):
            service.input_resolver.resolve_workflow_definitions(
                workflow.workflow_id, outsider.job_id
            )
