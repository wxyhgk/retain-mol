from fastapi import FastAPI
from fastapi.testclient import TestClient
from pathlib import Path

import software.backend.routers.jobs as jobs_router
from software.backend.jobs import JobService


class FakeJobService:
    def __init__(self, root: Path) -> None:
        self.jobs: dict[str, dict] = {}
        self.next_job = 1
        self.root = root

    def create_job(
        self,
        task_type: str | dict,
        *,
        metadata: dict | None = None,
        status: str = "queued",
    ) -> dict:
        job_id = f"job-{self.next_job}"
        self.next_job += 1
        if isinstance(task_type, dict):
            job = {"id": job_id, "status": status, **task_type}
        else:
            job = {
                "jobId": job_id,
                "taskType": task_type,
                "status": status,
                "metadata": metadata or {},
                "createdAt": "2026-07-14T00:00:00Z",
                "updatedAt": "2026-07-14T00:00:00Z",
                "artifacts": [],
            }
        self.jobs[job.get("id") or job["jobId"]] = job
        return job

    def list_jobs(self) -> list[dict]:
        return list(self.jobs.values())

    def get_job(self, job_id: str) -> dict:
        return self.jobs[job_id]

    def update_job(self, job_id: str, changes: dict) -> dict:
        job = self.get_job(job_id)
        job.update(changes)
        return job

    def delete_job(self, job_id: str) -> None:
        del self.jobs[job_id]

    def clone_job(self, job_id: str, *, name: str | None = None) -> dict:
        source = self.get_job(job_id)
        clone_id = f"job-{self.next_job}"
        self.next_job += 1
        clone = {**source, "status": "queued"}
        clone["metadata"] = {
            **(source.get("metadata") or {}),
            "name": name or "copy",
        }
        if "jobId" in clone:
            clone["jobId"] = clone_id
        else:
            clone["id"] = clone_id
        self.jobs[clone_id] = clone
        return clone

    def retry_job(self, job_id: str, *, name: str | None = None) -> dict:
        source = self.get_job(job_id)
        retry_id = f"job-{self.next_job}"
        self.next_job += 1
        retry = {
            **source,
            "status": "queued",
            "supersedesJobId": job_id,
            "metadata": {
                **(source.get("metadata") or {}),
                "name": name or "retry",
            },
        }
        if "jobId" in retry:
            retry["jobId"] = retry_id
        else:
            retry["id"] = retry_id
        self.jobs[retry_id] = retry
        return retry

    def cancel_job(self, job_id: str) -> dict:
        self.jobs[job_id]["status"] = "cancelled"
        return self.jobs[job_id]

    def read_job_log(self, job_id: str, *, cursor: int, limit: int) -> dict:
        self.get_job(job_id)
        return {"content": "running\n"[cursor:limit], "cursor": len("running\n"), "source": "xtb.log", "complete": False}

    async def add_inputs(self, job_id: str, inputs: dict) -> dict:
        self.jobs[job_id]["inputs"] = inputs
        return self.jobs[job_id]

    def list_artifacts(self, job_id: str) -> list[dict]:
        self.get_job(job_id)
        return [{"name": "result.xyz", "kind": "geometry"}]

    def task_directory(self, job_id: str) -> Path:
        self.get_job(job_id)
        directory = self.root / job_id
        directory.mkdir(parents=True, exist_ok=True)
        return directory

    def add_artifact(
        self,
        job_id: str,
        name: str,
        path: str,
        *,
        media_type: str | None = None,
        metadata: dict | None = None,
    ) -> dict:
        job = self.get_job(job_id)
        artifact = {
            "artifactId": f"artifact-{len(job['artifacts']) + 1}",
            "jobId": job_id,
            "name": name,
            "path": path,
            "mediaType": media_type,
            "sha256": "a" * 64,
            "metadata": metadata or {},
            "createdAt": "2026-07-14T00:00:00Z",
        }
        job["artifacts"].append(artifact)
        return artifact


def _client(monkeypatch, tmp_path: Path) -> TestClient:
    service = FakeJobService(tmp_path)
    monkeypatch.setattr(jobs_router, "_load_get_job_service", lambda: lambda: service)
    app = FastAPI()
    app.include_router(jobs_router.router)
    return TestClient(app)


def test_job_lifecycle_routes_delegate_to_persistence_service(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)

    created = client.post("/jobs", json={"engine": "xtb", "charge": -1})
    assert created.status_code == 201
    assert created.json() == {
        "id": "job-1",
        "status": "queued",
        "engine": "xtb",
        "charge": -1,
    }

    assert client.get("/jobs").json() == [created.json()]
    assert client.get("/jobs/job-1").json() == created.json()

    updated = client.post("/jobs/job-1/inputs", json={"structure": "water"})
    assert updated.status_code == 200
    assert updated.json()["inputs"] == {"structure": "water"}

    artifacts = client.get("/jobs/job-1/artifacts")
    assert artifacts.status_code == 200
    assert artifacts.json() == [{"name": "result.xyz", "kind": "geometry"}]

    renamed = client.patch("/jobs/job-1", json={"name": "Renamed", "description": "A note"})
    assert renamed.status_code == 200
    assert renamed.json()["name"] == "Renamed"
    assert renamed.json()["description"] == "A note"

    deleted = client.delete("/jobs/job-1")
    assert deleted.status_code == 204
    assert client.get("/jobs/job-1").status_code == 404


def test_job_copy_cancel_and_log_routes(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)
    client.post("/jobs", json={"taskType": "xtb-optimization"})

    copied = client.post("/jobs/job-1/clone", json={"name": "Copied"})
    assert copied.status_code == 201
    assert copied.json()["name"] == "Copied"

    cancelled = client.post("/jobs/job-1/cancel")
    assert cancelled.status_code == 200
    assert cancelled.json()["status"] == "cancelled"

    retried = client.post("/jobs/job-1/retry", json={"name": "Retry"})
    assert retried.status_code == 201
    assert retried.json()["name"] == "Retry"
    assert retried.json()["supersedesJobId"] == "job-1"

    log = client.get("/jobs/job-1/log")
    assert log.status_code == 200
    assert log.json()["content"] == "running\n"


def test_xtb_optimization_job_uses_frontend_shape_on_create_and_reads(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)
    payload = {
        "name": "Water optimization",
        "structure": {
            "name": "Water",
            "atoms": [
                {"id": "o", "symbol": "O", "x": 0, "y": 0, "z": 0},
                {"id": "h1", "symbol": "H", "x": 0, "y": 0, "z": 1},
            ],
        },
        "charge": 0,
        "multiplicity": 1,
        "method": "gfn2",
        "maxSteps": 200,
        "optLevel": "normal",
    }

    created = client.post("/jobs/xtb/optimize", json=payload)

    assert created.status_code == 201
    assert created.json() == {
        "id": "job-1",
        "kind": "xtb-optimization",
        "status": "queued",
        "name": "Water optimization",
        "createdAt": "2026-07-14T00:00:00Z",
        "updatedAt": "2026-07-14T00:00:00Z",
        "request": payload,
        "artifacts": [],
    }

    listed = client.get("/jobs")
    detail = client.get("/jobs/job-1")
    artifacts = client.get("/jobs/job-1/artifacts")
    assert listed.json() == [created.json()]
    assert detail.json() == created.json()
    assert artifacts.json() == []

    service = jobs_router._get_job_service()
    assert service.jobs["job-1"]["inputs"] == {"structure": payload["structure"]}


def test_xtb_job_can_freeze_a_molecule_revision_as_its_structure(
    monkeypatch, tmp_path
) -> None:
    service = JobService(tmp_path / "data")
    asset = service.create_molecule_asset("Water")
    revision = service.save_molecule_revision(
        asset.asset_id,
        {
            "name": "Water",
            "atoms": [
                {"id": "o", "symbol": "O", "x": 0, "y": 0, "z": 0},
                {"id": "h", "symbol": "H", "x": 0, "y": 0, "z": 1},
            ],
            "bonds": [
                {"id": "oh", "atomId1": "o", "atomId2": "h", "order": 1}
            ],
        },
        parent_revision_id=None,
        expected_head_revision_id=None,
        expected_version=1,
    )
    monkeypatch.setattr(jobs_router, "_load_get_job_service", lambda: lambda: service)
    app = FastAPI()
    app.include_router(jobs_router.router)
    client = TestClient(app)

    response = client.post(
        "/jobs/xtb/optimize",
        json={
            "name": "Revision optimization",
            "moleculeRevisionId": revision.revision_id,
            "charge": 0,
            "multiplicity": 1,
            "method": "gfn2",
            "maxSteps": 200,
            "optLevel": "normal",
        },
    )

    assert response.status_code == 201
    assert response.json()["request"]["moleculeRevisionId"] == revision.revision_id
    snapshot = service.get_input_snapshots(response.json()["id"])[0]
    assert snapshot.source_kind == "molecule_revision"
    assert snapshot.molecule_revision_id == revision.revision_id
    assert snapshot.content_sha256 == revision.sha256


def test_psi4_frequency_job_freezes_literal_structure(monkeypatch, tmp_path) -> None:
    service = JobService(tmp_path / "data")
    monkeypatch.setattr(jobs_router, "_load_get_job_service", lambda: lambda: service)
    app = FastAPI()
    app.include_router(jobs_router.router)
    client = TestClient(app)

    payload = {
        "name": "Frequency check",
        "structure": {
            "name": "Hydrogen",
            "atoms": [
                {"id": "h1", "symbol": "H", "x": 0, "y": 0, "z": -0.35},
                {"id": "h2", "symbol": "H", "x": 0, "y": 0, "z": 0.35},
            ],
        },
        "charge": 0,
        "multiplicity": 1,
        "method": "hf",
        "basis": "sto-3g",
    }
    response = client.post("/jobs/psi4/frequency", json=payload)

    assert response.status_code == 201
    assert response.json()["kind"] == "psi4-frequency"
    assert response.json()["request"]["structure"] == payload["structure"]
    snapshot = service.get_input_snapshots(response.json()["id"])[0]
    assert snapshot.source_kind == "literal"
    assert service.get_calculation_spec(response.json()["id"]).engine == "psi4"


def test_psi4_job_requires_exactly_one_structure_source(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)
    common = {
        "charge": 0,
        "multiplicity": 1,
        "method": "hf",
        "basis": "sto-3g",
    }

    missing = client.post("/jobs/psi4/irc", json=common)
    conflicting = client.post(
        "/jobs/psi4/irc",
        json={
            **common,
            "moleculeRevisionId": "rev-1",
            "artifactId": "artifact-1",
        },
    )

    assert missing.status_code == 422
    assert conflicting.status_code == 422


def test_missing_job_run_returns_clear_404(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)

    response = client.post("/jobs/job-1/run")

    assert response.status_code == 404
    assert response.json() == {"detail": "Job 'job-1' was not found"}


def test_job_run_submits_to_background_executor(monkeypatch, tmp_path) -> None:
    service = FakeJobService(tmp_path)
    service.create_job("xtb-optimization")
    submitted: list[str] = []

    class FakeExecutor:
        def submit(self, submitted_service, job_id: str) -> bool:
            assert submitted_service is service
            submitted.append(job_id)
            return True

    monkeypatch.setattr(jobs_router, "_load_get_job_service", lambda: lambda: service)
    monkeypatch.setattr(jobs_router, "_get_job_executor", lambda: FakeExecutor())
    app = FastAPI()
    app.include_router(jobs_router.router)

    response = TestClient(app).post("/jobs/job-1/run")

    assert response.status_code == 202
    assert response.json()["status"] == "queued"
    assert submitted == ["job-1"]


def test_missing_job_returns_clear_404(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)

    response = client.get("/jobs/missing")

    assert response.status_code == 404
    assert response.json() == {"detail": "Job 'missing' was not found"}


def test_job_update_validates_patch_fields(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)
    client.post("/jobs", json={"engine": "xtb"})

    assert client.patch("/jobs/job-1", json={}).status_code == 422
    assert client.patch("/jobs/job-1", json={"name": None}).status_code == 422
    assert client.patch("/jobs/job-1", json={"status": "failed"}).status_code == 422


def test_delete_job_conflicts_with_running_or_workflow_reference(monkeypatch, tmp_path) -> None:
    service = JobService(tmp_path / "data")
    running = service.create_job("geometry-optimization")
    assert service.claim_queued_job(running.job_id) is not None
    referenced = service.create_job("single-point")
    service.create_workflow("screening", [referenced.job_id], [])
    monkeypatch.setattr(jobs_router, "_load_get_job_service", lambda: lambda: service)
    app = FastAPI()
    app.include_router(jobs_router.router)
    client = TestClient(app)

    running_response = client.delete(f"/jobs/{running.job_id}")
    referenced_response = client.delete(f"/jobs/{referenced.job_id}")

    assert running_response.status_code == 409
    assert "running jobs" in running_response.json()["detail"]
    assert referenced_response.status_code == 409
    assert "referenced by workflow" in referenced_response.json()["detail"]


def test_unavailable_persistence_service_returns_503(monkeypatch) -> None:
    monkeypatch.setattr(
        jobs_router,
        "_load_get_job_service",
        lambda: (_ for _ in ()).throw(
            jobs_router.JobServiceUnavailableError("Job storage is unavailable")
        ),
    )
    app = FastAPI()
    app.include_router(jobs_router.router)

    response = TestClient(app).get("/jobs")

    assert response.status_code == 503
    assert response.json() == {"detail": "Job storage is unavailable"}


def test_xtb_job_thumbnail_is_persisted_and_served(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)
    job = client.post("/jobs/xtb/optimize", json={
        "structure": {
            "atoms": [
                {"id": "o", "symbol": "O", "x": 0, "y": 0, "z": 0},
                {"id": "h", "symbol": "H", "x": 0, "y": 0, "z": 1},
            ],
        },
        "charge": 0,
        "multiplicity": 1,
        "method": "gfn2",
        "maxSteps": 200,
        "optLevel": "normal",
    }).json()

    thumbnail = client.post(
        f"/jobs/{job['id']}/thumbnail",
        json={"dataUrl": "data:image/png;base64,iVBORw0KGgo="},
    )

    assert thumbnail.status_code == 201
    assert thumbnail.json()["role"] == "preview"
    assert thumbnail.json()["format"] == "png"
    assert thumbnail.json()["sha256"] == "a" * 64
    assert thumbnail.json()["downloadUrl"] == f"/jobs/{job['id']}/artifacts/artifact-1/content"

    content = client.get(thumbnail.json()["downloadUrl"])
    assert content.status_code == 200
    assert content.headers["content-type"] == "image/png"
    assert content.content == b"\x89PNG\r\n\x1a\n"
