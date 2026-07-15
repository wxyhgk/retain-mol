from __future__ import annotations

from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

import software.backend.routers.jobs as jobs_router
from software.backend.jobs import JobService
from software.backend.jobs.workflows import WorkflowValidationError, validate_workflow_dag


def _reference(source: str, target: str, target_input: str = "structure") -> dict[str, str]:
    return {
        "sourceJobId": source,
        "sourceKind": "artifact",
        "sourceName": "optimized.xyz",
        "targetJobId": target,
        "targetInputName": target_input,
    }


def test_workflow_persists_references_and_returns_topological_order(tmp_path: Path) -> None:
    service = JobService(tmp_path / "data")
    first = service.create_job("seed")
    second = service.create_job("optimize")
    third = service.create_job("analyze")

    workflow = service.create_workflow(
        "Three stage workflow",
        [first.job_id, second.job_id, third.job_id],
        [_reference(first.job_id, second.job_id), _reference(second.job_id, third.job_id, "geometry")],
    )

    reopened = JobService(tmp_path / "data").get_workflow(workflow.workflow_id)
    assert reopened.name == "Three stage workflow"
    assert reopened.job_ids == [first.job_id, second.job_id, third.job_id]
    assert {(reference.source_job_id, reference.target_job_id) for reference in reopened.references} == {
        (first.job_id, second.job_id),
        (second.job_id, third.job_id),
    }
    assert validate_workflow_dag(reopened.job_ids, reopened.references) == reopened.job_ids


def test_workflow_rejects_cycles_and_references_outside_membership(tmp_path: Path) -> None:
    service = JobService(tmp_path / "data")
    first = service.create_job("first")
    second = service.create_job("second")
    third = service.create_job("third")

    with pytest.raises(WorkflowValidationError, match="cycle"):
        service.create_workflow(
            "cyclic",
            [first.job_id, second.job_id],
            [_reference(first.job_id, second.job_id), _reference(second.job_id, first.job_id)],
        )
    with pytest.raises(WorkflowValidationError, match="belong"):
        service.create_workflow("external", [first.job_id], [_reference(first.job_id, third.job_id)])


def test_workflow_routes_create_read_and_reject_invalid_dag(monkeypatch, tmp_path: Path) -> None:
    service = JobService(tmp_path / "data")
    first = service.create_job("seed")
    second = service.create_job("optimize")
    monkeypatch.setattr(jobs_router, "_load_get_job_service", lambda: lambda: service)
    app = FastAPI()
    app.include_router(jobs_router.router)
    client = TestClient(app)

    payload = {
        "name": "Route workflow",
        "jobIds": [first.job_id, second.job_id],
        "references": [_reference(first.job_id, second.job_id)],
    }
    created = client.post("/jobs/workflows", json=payload)
    assert created.status_code == 201
    assert created.json()["jobIds"] == payload["jobIds"]
    assert created.json()["references"][0]["targetInputName"] == "structure"

    workflow_id = created.json()["workflowId"]
    assert client.get(f"/jobs/workflows/{workflow_id}").json() == created.json()

    cyclic = {**payload, "references": [_reference(first.job_id, second.job_id), _reference(second.job_id, first.job_id)]}
    rejected = client.put(f"/jobs/workflows/{workflow_id}", json=cyclic)
    assert rejected.status_code == 400
    assert "cycle" in rejected.json()["detail"]

    missing = client.get("/jobs/workflows/missing")
    assert missing.status_code == 404
    assert missing.json() == {"detail": "Workflow 'missing' was not found"}


def test_workflow_artifact_reference_uses_stable_artifact_identity(tmp_path: Path) -> None:
    service = JobService(tmp_path / "data")
    source = service.create_job("optimize")
    target = service.create_job("analyze")
    artifact = service.add_artifact(
        source.job_id,
        "optimized.xyz",
        "optimized.xyz",
        metadata={"role": "output", "format": "xyz"},
    )

    workflow = service.create_workflow(
        "artifact identity",
        [source.job_id, target.job_id],
        [{
            "sourceJobId": source.job_id,
            "sourceArtifactId": artifact.artifact_id,
            "sourceKind": "artifact",
            "sourceName": artifact.name,
            "targetJobId": target.job_id,
            "targetInputName": "structure",
        }],
    )

    assert workflow.references[0].source_artifact_id == artifact.artifact_id
    with pytest.raises(ValueError, match="does not belong"):
        service.create_workflow(
            "invalid artifact",
            [source.job_id, target.job_id],
            [{
                "sourceJobId": source.job_id,
                "sourceArtifactId": "artifact-missing",
                "sourceKind": "artifact",
                "sourceName": "optimized.xyz",
                "targetJobId": target.job_id,
                "targetInputName": "structure",
            }],
        )
