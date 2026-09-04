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


def _succeeded_structure_job(
    service: JobService, name: str
) -> tuple[object, object]:
    job = service.create_job("xtb-optimization")
    service.update_status(job.job_id, "running")
    service.update_status(job.job_id, "succeeded")
    task_directory = service.task_directory(job.job_id)
    (task_directory / "optimized.xyz").write_text(
        f"1\n{name}\nH 0.0 0.0 0.0\n", encoding="utf-8"
    )
    artifact = service.add_artifact(
        job.job_id,
        "optimized.xyz",
        "optimized.xyz",
        metadata={"role": "output", "format": "xyz"},
    )
    return service.get_job(job.job_id), artifact


def _optimization_chain(service: JobService):
    source = service.create_calculation_job(
        "xtb-optimization",
        "xtb",
        {
            "charge": 0,
            "multiplicity": 1,
            "method": "gfn2",
            "maxSteps": 50,
            "optLevel": "normal",
            "structure": {
                "atoms": [
                    {"id": "H1", "symbol": "H", "x": 0, "y": 0, "z": 0}
                ]
            },
        },
    )
    target = service.create_calculation_draft(
        "xtb-optimization",
        "xtb",
        {
            "charge": 0,
            "multiplicity": 1,
            "method": "gfn2",
            "maxSteps": 50,
            "optLevel": "normal",
        },
    )
    workflow = service.create_workflow(
        "optimization chain",
        [source.job_id, target.job_id],
        [_reference(source.job_id, target.job_id)],
    )
    return workflow, source, target


def test_workflow_persists_input_links_and_keeps_wire_aliases(tmp_path: Path) -> None:
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
    assert {(link.source_job_id, link.target_job_id) for link in reopened.input_links} == {
        (first.job_id, second.job_id),
        (second.job_id, third.job_id),
    }
    assert validate_workflow_dag(reopened.job_ids, reopened.input_links) == reopened.job_ids
    wire_payload = reopened.model_dump(mode="json", by_alias=True)
    assert "references" in wire_payload
    assert "input_links" not in wire_payload


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

    assert workflow.input_links[0].source_artifact_id == artifact.artifact_id
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


def test_ts_preparation_workflow_creates_semantic_draft_and_artifact_edges(
    tmp_path: Path,
) -> None:
    service = JobService(tmp_path / "data")
    reactant, reactant_artifact = _succeeded_structure_job(service, "reactant")
    product, product_artifact = _succeeded_structure_job(service, "product")

    workflow, target = service.create_ts_preparation_workflow(
        "SN2 transition state",
        reactant.job_id,
        reactant_artifact.artifact_id,
        product.job_id,
        product_artifact.artifact_id,
    )

    assert target.task_type == "ts-initial-guess"
    assert target.status == "created"
    assert workflow.job_ids == [reactant.job_id, product.job_id, target.job_id]
    assert {
        (link.source_artifact_id, link.target_input_name)
        for link in workflow.input_links
    } == {
        (reactant_artifact.artifact_id, "reactant"),
        (product_artifact.artifact_id, "product"),
    }
    spec = service.get_calculation_spec(target.job_id)
    assert spec is not None
    assert spec.kind == "ts-initial-guess"
    assert spec.engine == "retainmol"
    queued = service.queue_calculation_job(
        target.job_id, workflow_id=workflow.workflow_id
    )
    assert queued.status == "queued"
    assert {
        (snapshot.input_name, snapshot.artifact_id)
        for snapshot in queued.input_snapshots
    } == {
        ("reactant", reactant_artifact.artifact_id),
        ("product", product_artifact.artifact_id),
    }


def test_ts_preparation_workflow_rejects_non_succeeded_or_non_structure_sources(
    tmp_path: Path,
) -> None:
    service = JobService(tmp_path / "data")
    reactant, reactant_artifact = _succeeded_structure_job(service, "reactant")
    pending = service.create_job("xtb-optimization")
    pending_directory = service.task_directory(pending.job_id)
    (pending_directory / "optimized.xyz").write_text(
        "1\npending\nH 0 0 0\n", encoding="utf-8"
    )
    pending_artifact = service.add_artifact(
        pending.job_id,
        "optimized.xyz",
        "optimized.xyz",
        metadata={"role": "output", "format": "xyz"},
    )

    with pytest.raises(ValueError, match="must be succeeded"):
        service.create_ts_preparation_workflow(
            "invalid",
            reactant.job_id,
            reactant_artifact.artifact_id,
            pending.job_id,
            pending_artifact.artifact_id,
        )


def test_ts_preparation_workflow_route_returns_workflow_and_target_job(
    monkeypatch, tmp_path: Path
) -> None:
    service = JobService(tmp_path / "data")
    reactant, reactant_artifact = _succeeded_structure_job(service, "reactant")
    product, product_artifact = _succeeded_structure_job(service, "product")
    monkeypatch.setattr(jobs_router, "_load_get_job_service", lambda: lambda: service)
    app = FastAPI()
    app.include_router(jobs_router.router)
    client = TestClient(app)

    response = client.post(
        "/jobs/workflows/ts-preparation",
        json={
            "name": "Route TS preparation",
            "reactantJobId": reactant.job_id,
            "reactantArtifactId": reactant_artifact.artifact_id,
            "productJobId": product.job_id,
            "productArtifactId": product_artifact.artifact_id,
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["workflow"]["name"] == "Route TS preparation"
    assert payload["targetJob"]["taskType"] == "ts-initial-guess"
    assert payload["targetJob"]["status"] == "created"


def test_workflow_scheduler_freezes_downstream_inputs_after_source_succeeds(
    tmp_path: Path,
) -> None:
    service = JobService(tmp_path / "data")
    workflow, source, target = _optimization_chain(service)

    started = service.start_workflow_execution(workflow.workflow_id)
    assert started.execution.status == "active"
    assert started.ready_job_ids == [source.job_id]
    assert [node.state for node in started.nodes] == ["ready", "waiting"]

    assert service.claim_queued_job(source.job_id) is not None
    output = service.task_directory(source.job_id) / "optimized.xyz"
    output.write_text("1\nsource\nH 0 0 0\n", encoding="utf-8")
    artifact = service.add_artifact(
        source.job_id,
        "optimized.xyz",
        "optimized.xyz",
        metadata={"role": "output", "format": "xyz"},
    )
    service.update_status(source.job_id, "succeeded")

    advanced = service.advance_workflow_execution(workflow.workflow_id)
    assert advanced.ready_job_ids == [target.job_id]
    assert service.get_job(target.job_id).status == "queued"
    assert service.get_input_snapshots(target.job_id)[0].artifact_id == artifact.artifact_id

    assert service.claim_queued_job(target.job_id) is not None
    service.update_status(target.job_id, "succeeded")
    finished = service.advance_workflow_execution(workflow.workflow_id)
    assert finished.execution.status == "succeeded"
    assert finished.ready_job_ids == []


def test_workflow_scheduler_blocks_descendants_of_failed_jobs(tmp_path: Path) -> None:
    service = JobService(tmp_path / "data")
    workflow, source, target = _optimization_chain(service)
    service.start_workflow_execution(workflow.workflow_id)
    assert service.claim_queued_job(source.job_id) is not None
    service.update_status(
        source.job_id,
        "failed",
        error_code="engine_failed",
        error="xTB failed",
    )

    schedule = service.advance_workflow_execution(workflow.workflow_id)

    assert schedule.execution.status == "blocked"
    assert schedule.execution.error_code == "workflow_dependency_failed"
    assert schedule.nodes[0].state == "failed"
    assert schedule.nodes[1].state == "blocked"
    assert schedule.nodes[1].blocked_by == [source.job_id]
    assert service.get_job(target.job_id).status == "created"


def test_workflow_cancellation_is_durable_and_idempotent(tmp_path: Path) -> None:
    data_root = tmp_path / "data"
    service = JobService(data_root)
    workflow, source, target = _optimization_chain(service)
    service.start_workflow_execution(workflow.workflow_id)

    cancelled = service.cancel_workflow_execution(workflow.workflow_id)

    assert cancelled.execution.status == "cancelled"
    assert cancelled.ready_job_ids == []
    assert [node.state for node in cancelled.nodes] == ["cancelled", "cancelled"]
    assert service.get_job(source.job_id).status == "cancelled"
    assert service.get_job(target.job_id).status == "cancelled"
    assert service.cancel_workflow_execution(workflow.workflow_id).execution.status == "cancelled"

    reopened = JobService(data_root)
    assert workflow.workflow_id not in reopened.list_active_workflow_ids()
    assert reopened.get_workflow_schedule(workflow.workflow_id).execution.status == "cancelled"
    with pytest.raises(ValueError, match="cannot be restarted"):
        reopened.start_workflow_execution(workflow.workflow_id)


def test_workflow_cancellation_does_not_cancel_a_job_shared_with_an_active_workflow(
    tmp_path: Path,
) -> None:
    service = JobService(tmp_path / "data")
    first_workflow, source, first_target = _optimization_chain(service)
    second_target = service.create_calculation_draft(
        "xtb-optimization",
        "xtb",
        {
            "charge": 0,
            "multiplicity": 1,
            "method": "gfn2",
            "maxSteps": 50,
            "optLevel": "normal",
        },
    )
    second_workflow = service.create_workflow(
        "shared source",
        [source.job_id, second_target.job_id],
        [_reference(source.job_id, second_target.job_id)],
    )
    service.start_workflow_execution(first_workflow.workflow_id)
    service.start_workflow_execution(second_workflow.workflow_id)

    service.cancel_workflow_execution(first_workflow.workflow_id)

    assert service.get_job(source.job_id).status == "queued"
    assert service.get_job(first_target.job_id).status == "cancelled"
    assert service.get_job(second_target.job_id).status == "created"
    assert service.get_workflow_schedule(second_workflow.workflow_id).execution.status == "active"


def test_manual_workflow_queue_cannot_freeze_an_unfinished_source(tmp_path: Path) -> None:
    service = JobService(tmp_path / "data")
    workflow, source, target = _optimization_chain(service)

    with pytest.raises(ValueError, match="must be succeeded"):
        service.queue_calculation_job(
            target.job_id, workflow_id=workflow.workflow_id
        )

    assert service.get_job(source.job_id).status == "queued"
    assert service.get_job(target.job_id).status == "created"


def test_workflow_run_route_activates_and_returns_runtime_state(
    monkeypatch, tmp_path: Path
) -> None:
    service = JobService(tmp_path / "data")
    workflow, source, _target = _optimization_chain(service)

    class FakeExecutor:
        def submit_workflow(self, current_service, workflow_id):
            assert current_service is service
            return current_service.start_workflow_execution(workflow_id)

    monkeypatch.setattr(jobs_router, "_load_get_job_service", lambda: lambda: service)
    monkeypatch.setattr(jobs_router, "_get_job_executor", lambda: FakeExecutor())
    app = FastAPI()
    app.include_router(jobs_router.router)
    client = TestClient(app)

    response = client.post(f"/jobs/workflows/{workflow.workflow_id}/run")
    assert response.status_code == 202
    assert response.json()["execution"]["status"] == "active"
    assert response.json()["readyJobIds"] == [source.job_id]

    status = client.get(f"/jobs/workflows/{workflow.workflow_id}/execution")
    assert status.status_code == 200
    assert status.json()["nodes"][0]["state"] == "ready"


def test_workflow_cancel_route_returns_persisted_cancelled_schedule(
    monkeypatch, tmp_path: Path
) -> None:
    service = JobService(tmp_path / "data")
    workflow, source, target = _optimization_chain(service)
    service.start_workflow_execution(workflow.workflow_id)
    monkeypatch.setattr(jobs_router, "_load_get_job_service", lambda: lambda: service)
    app = FastAPI()
    app.include_router(jobs_router.router)
    client = TestClient(app)

    response = client.post(f"/jobs/workflows/{workflow.workflow_id}/cancel")

    assert response.status_code == 200
    assert response.json()["execution"]["status"] == "cancelled"
    assert response.json()["readyJobIds"] == []
    assert service.get_job(source.job_id).status == "cancelled"
    assert service.get_job(target.job_id).status == "cancelled"
