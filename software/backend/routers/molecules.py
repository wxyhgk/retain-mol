"""HTTP boundary for versioned molecule assets and immutable revisions."""

from __future__ import annotations

import importlib
from typing import Any, Callable

from fastapi import APIRouter, HTTPException, Path
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, ConfigDict, Field


router = APIRouter(tags=["molecule-assets"])
_SHA256_PATTERN = r"^[0-9a-f]{64}$"


class MoleculeAssetCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=200)


class MoleculeRevisionCreateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    parent_revision_id: str | None = Field(alias="parentRevisionId")
    expected_head_revision_id: str | None = Field(alias="expectedHeadRevisionId")
    expected_version: int = Field(alias="expectedVersion", ge=1)
    molecule: dict[str, Any]
    content_hash: str = Field(alias="contentHash", pattern=_SHA256_PATTERN)
    topology_fingerprint: str = Field(
        alias="topologyFingerprint", pattern=_SHA256_PATTERN
    )
    metadata: dict[str, Any] = Field(default_factory=dict)


def _load_get_job_service() -> Callable[[], Any]:
    for module_name in ("jobs.service", "software.backend.jobs.service"):
        try:
            module = importlib.import_module(module_name)
        except ModuleNotFoundError as exc:
            if exc.name == module_name or module_name.startswith(f"{exc.name}."):
                continue
            raise
        factory = getattr(module, "get_job_service", None)
        if callable(factory):
            return factory
        service_class = getattr(module, "JobService", None)
        if callable(service_class):
            return service_class
    raise RuntimeError("The jobs persistence package is unavailable")


def _service() -> Any:
    try:
        return _load_get_job_service()()
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Unable to initialize molecule persistence: {exc}",
        ) from exc


def _asset_not_found(asset_id: str) -> HTTPException:
    return HTTPException(
        status_code=404, detail=f"Molecule asset '{asset_id}' was not found"
    )


def _revision_not_found(revision_id: str) -> HTTPException:
    return HTTPException(
        status_code=404, detail=f"Molecule revision '{revision_id}' was not found"
    )


@router.post("/molecule-assets", status_code=201)
def create_molecule_asset(request: MoleculeAssetCreateRequest) -> Any:
    try:
        return jsonable_encoder(_service().create_molecule_asset(request.name))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/molecule-assets")
def list_molecule_assets() -> Any:
    return jsonable_encoder(_service().list_molecule_assets())


@router.get("/molecule-assets/{asset_id}")
def get_molecule_asset(asset_id: str = Path(min_length=1)) -> Any:
    try:
        return jsonable_encoder(_service().get_molecule_asset(asset_id))
    except KeyError as exc:
        raise _asset_not_found(asset_id) from exc


@router.get("/molecule-assets/{asset_id}/revisions")
def list_molecule_revisions(asset_id: str = Path(min_length=1)) -> Any:
    try:
        return jsonable_encoder(_service().list_molecule_revisions(asset_id))
    except KeyError as exc:
        raise _asset_not_found(asset_id) from exc


@router.post("/molecule-assets/{asset_id}/revisions", status_code=201)
def create_molecule_revision(
    request: MoleculeRevisionCreateRequest,
    asset_id: str = Path(min_length=1),
) -> Any:
    service = _service()
    try:
        revision = service.save_molecule_revision(
            asset_id,
            request.molecule,
            parent_revision_id=request.parent_revision_id,
            expected_head_revision_id=request.expected_head_revision_id,
            expected_version=request.expected_version,
            content_hash=request.content_hash,
            topology_fingerprint=request.topology_fingerprint,
            metadata=request.metadata,
        )
        return jsonable_encoder(revision)
    except KeyError as exc:
        name = exc.__class__.__name__.lower()
        if "revision" in name:
            raise _revision_not_found(request.parent_revision_id or "") from exc
        raise _asset_not_found(asset_id) from exc
    except RuntimeError as exc:
        if exc.__class__.__name__ == "MoleculeHeadConflictError":
            raise HTTPException(
                status_code=409,
                detail={
                    "code": "molecule_head_conflict",
                    "message": str(exc),
                    "currentAsset": jsonable_encoder(getattr(exc, "asset", None)),
                },
            ) from exc
        raise
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/molecule-revisions/{revision_id}")
def get_molecule_revision(revision_id: str = Path(min_length=1)) -> Any:
    try:
        return jsonable_encoder(_service().get_molecule_revision(revision_id))
    except KeyError as exc:
        raise _revision_not_found(revision_id) from exc
