from datetime import UTC, datetime

import pytest

from software.backend.jobs.job_definition import JobDefinitionBuilder


def test_basic_job_definition_accepts_legacy_mapping_without_persistence() -> None:
    task_type, metadata, status = JobDefinitionBuilder.normalize_basic_request(
        {
            "taskType": "analysis",
            "status": "created",
            "metadata": {"name": "orbital analysis"},
            "priority": "normal",
        },
        {"owner": "local"},
        "queued",
    )

    assert task_type == "analysis"
    assert status == "created"
    assert metadata == {
        "name": "orbital analysis",
        "priority": "normal",
        "owner": "local",
    }


def test_basic_job_definition_rejects_terminal_initial_status() -> None:
    with pytest.raises(ValueError, match="must start"):
        JobDefinitionBuilder.normalize_basic_request("analysis", None, "succeeded")


def test_calculation_spec_separates_display_name_from_parameters() -> None:
    now = datetime(2026, 8, 15, tzinfo=UTC)
    spec, metadata = JobDefinitionBuilder.build_calculation_spec(
        "xtb-optimization",
        "xtb",
        {"name": "Optimize reactant", "method": "gfn2"},
        None,
        now,
    )

    assert metadata == {"name": "Optimize reactant"}
    assert spec.payload == {"method": "gfn2"}
    assert spec.kind == "xtb-optimization"
    assert spec.engine == "xtb"


def test_inline_structure_is_promoted_to_named_literal_input() -> None:
    payload = {
        "structure": {"atoms": [], "bonds": []},
        "molecule": {"name": "empty"},
        "charge": 0,
    }

    inputs = JobDefinitionBuilder.extract_inline_structure_input({}, payload)

    assert inputs == {
        "structure": {
            "sourceKind": "literal",
            "format": "molecule",
            "value": {
                "format": "molecule",
                "structure": {"atoms": [], "bonds": []},
                "molecule": {"name": "empty"},
            },
        }
    }
    assert payload == {"charge": 0}
