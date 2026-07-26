"""Contract and API tests for the layered calculation creation request."""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import ValidationError

import software.backend.routers.jobs as jobs_router
from software.backend.jobs import JobService
from software.backend.jobs.contracts import CreateJobRequest, list_task_contracts


def _xtb_request() -> dict:
    return {
        "schemaVersion": 1,
        "profile": {
            "name": " Water optimization ",
            "description": "Contract v1 smoke test",
            "tags": ["water", "water", "xtb"],
        },
        "definition": {
            "contract": {
                "kind": "geometry-optimization",
                "engine": "xtb",
                "version": 1,
            },
            "system": {"charge": 0, "multiplicity": 1},
            "parameters": {
                "method": "gfn2-xtb",
                "optimizationLevel": "tight",
                "maxIterations": 300,
            },
            "outputs": [
                {
                    "type": "optimized-structure",
                    "format": "sdf",
                }
            ],
        },
        "inputs": {
            "ports": {
                "structure": {
                    "type": "inline",
                    "format": "molecule",
                    "value": {
                        "format": "molecule",
                        "structure": {
                            "name": "Water",
                            "atoms": [
                                {
                                    "id": "o",
                                    "symbol": "O",
                                    "x": 0,
                                    "y": 0,
                                    "z": 0,
                                },
                                {
                                    "id": "h",
                                    "symbol": "H",
                                    "x": 0,
                                    "y": 0,
                                    "z": 1,
                                },
                            ],
                        },
                    },
                }
            }
        },
        "execution": {
            "priority": "normal",
            "resources": {
                "cores": 2,
                "memoryMb": 2048,
                "wallTimeSeconds": 600,
            },
        },
    }


def test_create_job_request_normalizes_each_layer() -> None:
    request = CreateJobRequest.model_validate(_xtb_request())

    assert request.profile.name == "Water optimization"
    assert request.profile.tags == ["water", "xtb"]
    assert request.definition.parameters == {
        "method": "gfn2-xtb",
        "optimizationLevel": "tight",
        "maxIterations": 300,
    }
    assert request.inputs.ports["structure"].type == "inline"
    assert request.execution is not None
    assert request.execution.resources is not None
    assert request.execution.resources.memory_mb == 2048


def test_create_job_request_rejects_engine_parameters_outside_contract() -> None:
    payload = _xtb_request()
    payload["definition"]["parameters"]["basis"] = "def2-svp"

    with pytest.raises(ValidationError, match="basis"):
        CreateJobRequest.model_validate(payload)


def test_create_job_request_rejects_unsupported_task_engine_pair() -> None:
    payload = _xtb_request()
    payload["definition"]["contract"]["engine"] = "psi4"

    with pytest.raises(ValidationError, match="Unsupported task contract"):
        CreateJobRequest.model_validate(payload)


def test_single_job_inputs_reject_unresolved_job_outputs() -> None:
    payload = _xtb_request()
    payload["inputs"] = {
        "ports": {
            "structure": {
                "type": "job-output",
                "jobId": "job-upstream",
                "output": "optimized-structure",
            }
        }
    }

    with pytest.raises(ValidationError, match="union_tag_invalid"):
        CreateJobRequest.model_validate(payload)


def test_task_contract_registry_exposes_parameters_and_input_ports() -> None:
    contracts = list_task_contracts()
    xtb = next(
        contract
        for contract in contracts
        if contract["kind"] == "geometry-optimization"
        and contract["engine"] == "xtb"
    )

    assert "optimizationLevel" in xtb["parametersSchema"]["properties"]
    assert xtb["inputs"] == [
        {
            "name": "structure",
            "required": True,
            "formatsBySourceType": {
                "artifact": ["mol", "retainmol-json", "sdf", "xyz"],
                "inline": ["molecule", "structure"],
                "molecule-revision": ["molecule"],
            },
        }
    ]


def test_layered_api_creates_runtime_spec_and_frozen_input(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    service = JobService(tmp_path / "data")
    monkeypatch.setattr(
        jobs_router, "_load_get_job_service", lambda: lambda: service
    )
    app = FastAPI()
    app.include_router(jobs_router.router)
    client = TestClient(app)

    response = client.post("/jobs/calculations", json=_xtb_request())

    assert response.status_code == 201, response.text
    body = response.json()
    assert body["kind"] == "xtb-optimization"
    assert body["status"] == "queued"
    assert body["name"] == "Water optimization"

    job = service.get_job(body["id"])
    spec = service.get_calculation_spec(job.job_id)
    assert spec is not None
    assert spec.kind == "xtb-optimization"
    assert spec.engine == "xtb"
    assert spec.payload == {
        "charge": 0,
        "multiplicity": 1,
        "method": "gfn2",
        "maxSteps": 300,
        "optLevel": "tight",
        "threads": 2,
        "memoryMb": 2048,
        "timeoutSeconds": 600,
    }
    snapshots = service.get_input_snapshots(job.job_id)
    assert len(snapshots) == 1
    assert snapshots[0].input_name == "structure"
    assert snapshots[0].source_kind == "literal"
    assert snapshots[0].content_sha256
    assert "createRequest" not in job.metadata
    assert job.metadata["contract"] == {
        "kind": "geometry-optimization",
        "engine": "xtb",
        "version": 1,
    }
    assert job.metadata["requestedOutputs"] == [
        {
            "type": "optimized-structure",
            "format": "sdf",
            "required": True,
        }
    ]


def test_contract_listing_route_does_not_require_a_job_service() -> None:
    app = FastAPI()
    app.include_router(jobs_router.router)
    client = TestClient(app)

    response = client.get("/jobs/contracts")

    assert response.status_code == 200
    assert response.json()["schemaVersion"] == 1
    assert len(response.json()["contracts"]) == 4
