"""HTTP contract tests for molecule assets and immutable revisions."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient

import software.backend.routers.molecules as molecules_router
from software.backend.jobs import JobService
from software.backend.jobs.molecule_canonicalize import (
    molecule_content_hash,
    molecule_topology_fingerprint,
)


def _molecule() -> dict:
    return {
        "name": "water",
        "atoms": [
            {"id": "o", "symbol": "O", "x": 0, "y": 0, "z": 0},
            {"id": "h", "symbol": "H", "x": 0, "y": 0, "z": 1},
        ],
        "bonds": [
            {"id": "oh", "atomId1": "o", "atomId2": "h", "order": 1}
        ],
    }


def _client(monkeypatch, tmp_path) -> TestClient:
    service = JobService(tmp_path / "data")
    monkeypatch.setattr(
        molecules_router, "_load_get_job_service", lambda: lambda: service
    )
    app = FastAPI()
    app.include_router(molecules_router.router)
    return TestClient(app)


def _revision_payload(molecule: dict, *, parent=None, version=1) -> dict:
    return {
        "parentRevisionId": parent,
        "expectedHeadRevisionId": parent,
        "expectedVersion": version,
        "molecule": molecule,
        "contentHash": molecule_content_hash(molecule),
        "topologyFingerprint": molecule_topology_fingerprint(molecule),
    }


def test_asset_revision_lifecycle_and_optimistic_conflict(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)
    created_asset = client.post("/molecule-assets", json={"name": "Water"})
    assert created_asset.status_code == 201
    asset = created_asset.json()
    assert asset["headRevisionId"] is None
    assert asset["version"] == 1

    molecule = _molecule()
    created_revision = client.post(
        f"/molecule-assets/{asset['assetId']}/revisions",
        json=_revision_payload(molecule),
    )
    assert created_revision.status_code == 201
    revision = created_revision.json()
    assert revision["molecule"] == molecule
    assert revision["contentHash"] == molecule_content_hash(molecule)
    assert revision["metadata"] == {}

    current = client.get(f"/molecule-assets/{asset['assetId']}").json()
    assert current["headRevisionId"] == revision["revisionId"]
    assert current["version"] == 2
    assert client.get(
        f"/molecule-assets/{asset['assetId']}/revisions"
    ).json() == [revision]
    assert client.get(f"/molecule-revisions/{revision['revisionId']}").json() == revision

    stale = client.post(
        f"/molecule-assets/{asset['assetId']}/revisions",
        json=_revision_payload(molecule),
    )
    assert stale.status_code == 409
    assert stale.json()["detail"]["code"] == "molecule_head_conflict"
    assert stale.json()["detail"]["currentAsset"]["version"] == 2


def test_revision_persists_provenance_metadata(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)
    asset_id = client.post("/molecule-assets", json={"name": "Water"}).json()[
        "assetId"
    ]
    payload = _revision_payload(_molecule())
    payload["metadata"] = {
        "derivedFromJobId": "job-1",
        "derivedFromArtifactId": "artifact-1",
    }

    revision = client.post(
        f"/molecule-assets/{asset_id}/revisions", json=payload
    ).json()

    assert revision["metadata"] == payload["metadata"]
    assert client.get(
        f"/molecule-revisions/{revision['revisionId']}"
    ).json()["metadata"] == payload["metadata"]


def test_revision_rejects_tampered_hash_and_invalid_graph(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)
    asset_id = client.post("/molecule-assets", json={"name": "Water"}).json()[
        "assetId"
    ]
    payload = _revision_payload(_molecule())
    payload["contentHash"] = "0" * 64
    rejected = client.post(f"/molecule-assets/{asset_id}/revisions", json=payload)
    assert rejected.status_code == 422
    assert "contentHash" in rejected.json()["detail"]

    invalid = _molecule()
    invalid["bonds"][0]["atomId2"] = "missing"
    payload = _revision_payload(invalid)
    rejected = client.post(f"/molecule-assets/{asset_id}/revisions", json=payload)
    assert rejected.status_code == 422
    assert "missing atom" in rejected.json()["detail"]
