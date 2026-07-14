from fastapi import FastAPI
from fastapi.testclient import TestClient
from pathlib import Path

import software.backend.routers.jobs as jobs_router


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


def test_missing_job_run_returns_clear_404(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)

    response = client.post("/jobs/job-1/run")

    assert response.status_code == 404
    assert response.json() == {"detail": "Job 'job-1' was not found"}


def test_missing_job_returns_clear_404(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)

    response = client.get("/jobs/missing")

    assert response.status_code == 404
    assert response.json() == {"detail": "Job 'missing' was not found"}


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
    assert thumbnail.json()["downloadUrl"] == f"/jobs/{job['id']}/artifacts/artifact-1/content"

    content = client.get(thumbnail.json()["downloadUrl"])
    assert content.status_code == 200
    assert content.headers["content-type"] == "image/png"
    assert content.content == b"\x89PNG\r\n\x1a\n"
