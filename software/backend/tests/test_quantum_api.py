from fastapi import FastAPI
from fastapi.testclient import TestClient

import software.backend.routers.quantum as quantum_router


def _client() -> TestClient:
    app = FastAPI()
    app.include_router(quantum_router.router)
    return TestClient(app)


def test_psi4_status_reports_active_runtime(monkeypatch) -> None:
    monkeypatch.setattr(
        quantum_router,
        "detect_psi4_runtime",
        lambda: type(
            "Runtime",
            (),
            {"to_dict": lambda self: {"available": True, "version": "1.11", "python": "/python"}},
        )(),
    )

    response = _client().get("/quantum/psi4/status")

    assert response.status_code == 200
    assert response.json()["version"] == "1.11"


def test_psi4_single_point_maps_engine_result(monkeypatch) -> None:
    monkeypatch.setattr(
        quantum_router,
        "run_psi4_single_point",
        lambda *_args, **_kwargs: {
            "energyHartree": -1.117,
            "method": "hf",
            "basis": "sto-3g",
            "psi4Version": "1.11",
        },
    )

    response = _client().post(
        "/quantum/psi4/single-point",
        json={
            "atoms": [
                {"id": "h1", "symbol": "H", "x": 0, "y": 0, "z": -0.35},
                {"id": "h2", "symbol": "H", "x": 0, "y": 0, "z": 0.35},
            ]
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "energyHartree": -1.117,
        "method": "hf",
        "basis": "sto-3g",
        "psi4Version": "1.11",
    }
