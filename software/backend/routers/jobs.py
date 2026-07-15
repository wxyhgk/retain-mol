"""HTTP routes for persisted computational jobs.

The jobs package owns storage and lifecycle rules.  This router only validates
that request bodies are JSON objects and translates service failures into HTTP
responses.
"""

from __future__ import annotations

import base64
import binascii
import importlib
import inspect
from typing import Any, Awaitable, Callable, Literal

from fastapi import APIRouter, HTTPException, Path
from fastapi.concurrency import run_in_threadpool
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse
from pydantic import BaseModel, ConfigDict, Field, RootModel, model_validator

router = APIRouter(prefix="/jobs", tags=["jobs"])


class JobCreateRequest(RootModel[dict[str, Any]]):
    """Opaque job definition validated and persisted by the jobs service."""


class JobInputsRequest(RootModel[dict[str, Any]]):
    """Opaque input payload validated and persisted by the jobs service."""


class JobThumbnailRequest(BaseModel):
    """A small PNG snapshot captured from the active molecular viewport."""

    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    data_url: str = Field(alias="dataUrl", min_length=1)


class JobInputReferenceRequest(BaseModel):
    """One data dependency from an upstream job to a downstream job input."""

    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    target_job_id: str = Field(alias="targetJobId", min_length=1)
    target_input_name: str = Field(alias="targetInputName", min_length=1)
    source_job_id: str = Field(alias="sourceJobId", min_length=1)
    source_kind: Literal["input", "artifact"] = Field(alias="sourceKind")
    source_name: str | None = Field(default=None, alias="sourceName", min_length=1)
    source_artifact_id: str | None = Field(default=None, alias="sourceArtifactId", min_length=1)


class WorkflowRequest(BaseModel):
    """A durable DAG of persisted job ids and input references."""

    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    name: str = Field(min_length=1)
    job_ids: list[str] = Field(alias="jobIds", min_length=1)
    references: list[JobInputReferenceRequest] = Field(default_factory=list)


class XtbAtomRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    symbol: str = Field(min_length=1)
    x: float
    y: float
    z: float


class XtbStructureRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1)
    atoms: list[XtbAtomRequest] = Field(min_length=1)


class XtbOptimizeJobRequest(BaseModel):
    """Durable xTB optimization definition accepted by the frontend."""

    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    name: str | None = Field(default=None, min_length=1)
    structure: XtbStructureRequest | None = None
    molecule_revision_id: str | None = Field(
        default=None, alias="moleculeRevisionId", min_length=1
    )
    # The runner only needs structure; retain the editable graph for Load.
    molecule: dict[str, Any] | None = None
    charge: int
    multiplicity: int = Field(ge=1)
    method: Literal["gfn2"] = "gfn2"
    max_steps: int = Field(alias="maxSteps", ge=1, le=1000)
    opt_level: Literal[
        "crude", "sloppy", "loose", "lax", "normal", "tight", "vtight", "extreme"
    ] = Field(alias="optLevel")

    @model_validator(mode="after")
    def validate_structure_source(self) -> "XtbOptimizeJobRequest":
        has_structure = self.structure is not None
        has_revision = self.molecule_revision_id is not None
        if has_structure == has_revision:
            raise ValueError(
                "provide exactly one of structure or moleculeRevisionId"
            )
        if self.molecule is not None and not has_structure:
            raise ValueError("molecule is only accepted with a literal structure")
        return self


class JobServiceUnavailableError(RuntimeError):
    """Raised when the optional jobs persistence package is not available."""


def _load_get_job_service() -> Callable[[], Any]:
    """Import the service in both supported backend import layouts."""
    module_names = ("jobs.service", "software.backend.jobs.service")
    for module_name in module_names:
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

        raise JobServiceUnavailableError(
            f"{module_name} does not define get_job_service() or JobService"
        )

    raise JobServiceUnavailableError(
        "The jobs persistence package is not installed or has not been initialized"
    )


def _get_job_service() -> Any:
    try:
        return _load_get_job_service()()
    except JobServiceUnavailableError:
        raise
    except Exception as exc:
        raise JobServiceUnavailableError(
            f"Unable to initialize the jobs persistence service: {exc}"
        ) from exc


async def _await_if_needed(value: Any) -> Any:
    if inspect.isawaitable(value):
        return await value
    return value


class _JobServiceAdapter:
    """Small adapter for the jobs service's public persistence operations."""

    def __init__(self, service: Any) -> None:
        self._service = service

    async def _call(self, operation: str, *args: Any, **kwargs: Any) -> Any:
        method = getattr(self._service, operation, None)
        if not callable(method):
            raise JobServiceUnavailableError(
                f"The jobs persistence service does not support {operation}()"
            )
        return await _await_if_needed(method(*args, **kwargs))

    async def create_job(self, definition: dict[str, Any]) -> Any:
        return await self._call("create_job", definition)

    async def list_jobs(self) -> Any:
        return await self._call("list_jobs")

    async def get_job(self, job_id: str) -> Any:
        job = await self._call("get_job", job_id)
        if job is None:
            raise KeyError(job_id)
        return job

    async def add_inputs(self, job_id: str, inputs: dict[str, Any]) -> Any:
        return await self._call("add_inputs", job_id, inputs)

    async def list_artifacts(self, job_id: str) -> Any:
        return await self._call("list_artifacts", job_id)

    async def create_workflow(self, request: WorkflowRequest) -> Any:
        return await self._call(
            "create_workflow",
            request.name,
            request.job_ids,
            [reference.model_dump(mode="json", by_alias=True) for reference in request.references],
        )

    async def list_workflows(self) -> Any:
        return await self._call("list_workflows")

    async def get_workflow(self, workflow_id: str) -> Any:
        return await self._call("get_workflow", workflow_id)

    async def update_workflow(self, workflow_id: str, request: WorkflowRequest) -> Any:
        return await self._call(
            "update_workflow",
            workflow_id,
            request.name,
            request.job_ids,
            [reference.model_dump(mode="json", by_alias=True) for reference in request.references],
        )

    async def create_xtb_optimization(self, request: XtbOptimizeJobRequest) -> Any:
        request_data = request.model_dump(mode="json", by_alias=True, exclude_none=True)
        metadata = {
            "name": request.name,
            "request": request_data,
        }
        create_calculation_job = getattr(self._service, "create_calculation_job", None)
        if callable(create_calculation_job):
            spec_payload = {
                key: value
                for key, value in request_data.items()
                if key not in {"name", "structure", "molecule", "moleculeRevisionId"}
            }
            if request.molecule_revision_id is not None:
                structure_input = {
                    "sourceKind": "molecule_revision",
                    "format": "molecule",
                    "moleculeRevisionId": request.molecule_revision_id,
                }
            else:
                structure_input = {
                    "sourceKind": "literal",
                    "format": "molecule",
                    "value": {
                        "format": "molecule",
                        "structure": request_data["structure"],
                    },
                }
                if "molecule" in request_data:
                    structure_input["value"]["molecule"] = request_data["molecule"]
            job = await _await_if_needed(
                create_calculation_job(
                    "xtb-optimization",
                    "xtb",
                    spec_payload,
                    inputs={"structure": structure_input},
                    metadata=metadata,
                )
            )
        else:
            job = await self._call("create_job", "xtb-optimization", metadata=metadata)
        job_id = _job_id(job)
        if not job_id:
            raise RuntimeError("The jobs persistence service returned a job without an id")
        if not callable(create_calculation_job):
            legacy_input = (
                request.structure.model_dump(mode="json")
                if request.structure is not None
                else {"moleculeRevisionId": request.molecule_revision_id}
            )
            await self.add_inputs(job_id, {"structure": legacy_input})
        return await self.get_job(job_id)


def _not_found_error(job_id: str) -> HTTPException:
    return HTTPException(status_code=404, detail=f"Job '{job_id}' was not found")


def _workflow_not_found_error(workflow_id: str) -> HTTPException:
    return HTTPException(status_code=404, detail=f"Workflow '{workflow_id}' was not found")


def _job_id(job: Any) -> str | None:
    if isinstance(job, dict):
        value = job.get("jobId", job.get("job_id", job.get("id")))
    else:
        value = getattr(job, "job_id", getattr(job, "id", None))
    return value if isinstance(value, str) and value else None


def _is_xtb_optimization(job: Any) -> bool:
    if not isinstance(job, dict):
        job = jsonable_encoder(job)
    return job.get("taskType", job.get("task_type")) == "xtb-optimization"


def _frontend_job(job: Any) -> Any:
    """Project persisted xTB jobs into the frontend's job contract."""
    payload = jsonable_encoder(job)
    if not isinstance(payload, dict) or not _is_xtb_optimization(payload):
        return payload

    metadata = payload.get("metadata")
    metadata = metadata if isinstance(metadata, dict) else {}
    request = metadata.get("request")
    request = request if isinstance(request, dict) else None
    structure = request.get("structure") if request else None
    structure = structure if isinstance(structure, dict) else {}
    name = metadata.get("name") or (request or {}).get("name") or structure.get("name")

    response = {
        "id": payload.get("jobId", payload.get("job_id", payload.get("id"))),
        "kind": "xtb-optimization",
        "status": payload.get("status"),
        "name": name or "xTB optimization",
        "createdAt": payload.get("createdAt", payload.get("created_at")),
        "artifacts": [_frontend_artifact(artifact) for artifact in payload.get("artifacts", [])],
    }
    if payload.get("updatedAt", payload.get("updated_at")) is not None:
        response["updatedAt"] = payload.get("updatedAt", payload.get("updated_at"))
    if request is not None:
        response["request"] = request
    if metadata.get("message") is not None:
        response["message"] = metadata["message"]
    if payload.get("error") is not None:
        response["error"] = payload["error"]
    return response


def _frontend_artifact(artifact: Any) -> dict[str, Any]:
    payload = artifact if isinstance(artifact, dict) else jsonable_encoder(artifact)
    metadata = payload.get("metadata") if isinstance(payload.get("metadata"), dict) else {}
    name = str(payload.get("name") or "artifact")
    artifact_id = payload.get("artifactId", payload.get("artifact_id", payload.get("id")))
    job_id = payload.get("jobId", payload.get("job_id"))
    response = {
        "id": artifact_id,
        "jobId": job_id,
        "role": payload.get("role") or metadata.get("role", "output"),
        "name": name,
        "format": payload.get("format") or metadata.get("format", name.rsplit(".", 1)[-1] if "." in name else "file"),
        "mediaType": payload.get("mediaType", payload.get("media_type")),
        "sizeBytes": payload.get("byteSize", payload.get("byte_size", metadata.get("sizeBytes"))),
        "createdAt": payload.get("createdAt", payload.get("created_at")),
        "metadata": metadata,
    }
    if isinstance(job_id, str) and job_id and isinstance(artifact_id, str) and artifact_id:
        response["downloadUrl"] = f"/jobs/{job_id}/artifacts/{artifact_id}/content"
    return response


def _decode_png_data_url(data_url: str) -> bytes:
    """Decode a deliberately small, browser-generated PNG preview."""
    prefix = "data:image/png;base64,"
    if not data_url.startswith(prefix):
        raise ValueError("thumbnail must be a PNG data URL")
    try:
        content = base64.b64decode(data_url[len(prefix):], validate=True)
    except (ValueError, binascii.Error) as exc:
        raise ValueError("thumbnail is not valid base64 PNG data") from exc
    if not content.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError("thumbnail is not a PNG image")
    if len(content) > 3 * 1024 * 1024:
        raise ValueError("thumbnail exceeds the 3 MB limit")
    return content


def _find_job_artifact(job: Any, artifact_id: str) -> Any | None:
    payload = jsonable_encoder(job)
    artifacts = payload.get("artifacts", []) if isinstance(payload, dict) else []
    for artifact in artifacts:
        if not isinstance(artifact, dict):
            continue
        current_id = artifact.get("artifactId", artifact.get("artifact_id", artifact.get("id")))
        if current_id == artifact_id:
            return artifact
    return None


async def _artifacts_response(service: _JobServiceAdapter, job_id: str) -> Any:
    job = await service.get_job(job_id)
    if _is_xtb_optimization(job):
        return _frontend_job(job).get("artifacts", [])
    return await service.list_artifacts(job_id)


async def _run(operation: str, job_id: str | None, call: Awaitable[Any]) -> Any:
    """Map expected persistence errors to concise, stable API responses."""
    try:
        return jsonable_encoder(await call)
    except HTTPException:
        raise
    except KeyError as exc:
        if exc.__class__.__name__.lower() == "workflownotfounderror":
            if job_id is not None:
                raise _workflow_not_found_error(job_id) from exc
        if job_id is not None:
            raise _not_found_error(job_id) from exc
        raise HTTPException(status_code=400, detail=f"Invalid job data: {exc}") from exc
    except JobServiceUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        if exc.__class__.__name__.lower() in {"jobnotfounderror", "notfounderror"}:
            if job_id is not None:
                raise _not_found_error(job_id) from exc
        raise HTTPException(
            status_code=500,
            detail=f"Unable to {operation}: {exc}",
        ) from exc


def _service_adapter() -> _JobServiceAdapter:
    try:
        return _JobServiceAdapter(_get_job_service())
    except JobServiceUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("", status_code=201)
async def create_job(request: JobCreateRequest) -> Any:
    """Create and persist a job definition."""
    service = _service_adapter()
    return await _run("create job", None, service.create_job(request.root))


@router.post("/xtb/optimize", status_code=201)
async def create_xtb_optimization_job(request: XtbOptimizeJobRequest) -> Any:
    """Persist an xTB optimization request for a future job runner."""
    service = _service_adapter()
    job = await _run("create xTB optimization job", None, service.create_xtb_optimization(request))
    return _frontend_job(job)


@router.post("/workflows", status_code=201)
async def create_workflow(request: WorkflowRequest) -> Any:
    """Persist a DAG that composes existing jobs without starting them."""
    service = _service_adapter()
    return await _run("create workflow", None, service.create_workflow(request))


@router.get("/workflows")
async def list_workflows() -> Any:
    """List durable workflow definitions and their references."""
    service = _service_adapter()
    return await _run("list workflows", None, service.list_workflows())


@router.get("/workflows/{workflow_id}")
async def get_workflow(workflow_id: str = Path(min_length=1)) -> Any:
    """Fetch one workflow definition."""
    service = _service_adapter()
    return await _run("get workflow", workflow_id, service.get_workflow(workflow_id))


@router.put("/workflows/{workflow_id}")
async def update_workflow(
    request: WorkflowRequest,
    workflow_id: str = Path(min_length=1),
) -> Any:
    """Replace a workflow's members and dependency edges after DAG validation."""
    service = _service_adapter()
    return await _run("update workflow", workflow_id, service.update_workflow(workflow_id, request))


@router.post("/{job_id}/run")
async def run_job(job_id: str = Path(min_length=1)) -> Any:
    """Execute one persisted xTB optimization inside its durable task directory."""
    try:
        from jobs.xtb_runner import JobExecutionError, run_xtb_optimization_job
    except ModuleNotFoundError:
        from software.backend.jobs.xtb_runner import JobExecutionError, run_xtb_optimization_job

    try:
        service = _get_job_service()
    except JobServiceUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    try:
        job = await run_in_threadpool(run_xtb_optimization_job, service, job_id)
    except KeyError as exc:
        raise _not_found_error(job_id) from exc
    except JobExecutionError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return _frontend_job(job)


@router.post("/{job_id}/thumbnail", status_code=201)
async def upload_job_thumbnail(
    request: JobThumbnailRequest,
    job_id: str = Path(min_length=1),
) -> Any:
    """Persist a task preview without treating it as scientific output."""
    try:
        service = _get_job_service()
        thumbnail = _decode_png_data_url(request.data_url)
        directory = service.task_directory(job_id)
        filename = "viewport-preview.png"
        (directory / filename).write_bytes(thumbnail)
        artifact = service.add_artifact(
            job_id,
            filename,
            filename,
            media_type="image/png",
            metadata={
                "role": "preview",
                "format": "png",
                "sizeBytes": len(thumbnail),
            },
        )
    except KeyError as exc:
        raise _not_found_error(job_id) from exc
    except JobServiceUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to save thumbnail: {exc}") from exc
    return _frontend_artifact(artifact)


@router.get("")
async def list_jobs() -> Any:
    """List persisted jobs."""
    service = _service_adapter()
    jobs = await _run("list jobs", None, service.list_jobs())
    return [_frontend_job(job) for job in jobs]


@router.get("/{job_id}")
async def get_job(job_id: str = Path(min_length=1)) -> Any:
    """Fetch one persisted job."""
    service = _service_adapter()
    job = await _run("get job", job_id, service.get_job(job_id))
    return _frontend_job(job)


@router.get("/{job_id}/artifacts/{artifact_id}/content")
async def download_job_artifact(
    job_id: str = Path(min_length=1),
    artifact_id: str = Path(min_length=1),
) -> Any:
    """Serve a registered task artifact only from that task's directory."""
    try:
        service = _get_job_service()
        job = service.get_job(job_id)
        artifact = _find_job_artifact(job, artifact_id)
        if artifact is None:
            raise KeyError(artifact_id)
        storage_key = artifact.get("storageKey", artifact.get("storage_key"))
        if isinstance(storage_key, str) and storage_key.startswith("sha256/"):
            file_path = service.artifact_storage.resolve(storage_key)
            if not file_path.is_file():
                raise ValueError("artifact content is unavailable")
        else:
            relative_path = artifact.get("path")
            if not isinstance(relative_path, str) or not relative_path:
                raise ValueError("artifact has no file path")
            directory = service.task_directory(job_id).resolve()
            file_path = (directory / relative_path).resolve()
            if directory not in file_path.parents or not file_path.is_file():
                raise ValueError("artifact file is unavailable")
    except KeyError as exc:
        raise _not_found_error(job_id) from exc
    except JobServiceUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return FileResponse(
        file_path,
        media_type=artifact.get("mediaType", artifact.get("media_type")) or "application/octet-stream",
        filename=artifact.get("name") or file_path.name,
    )


@router.post("/{job_id}/inputs")
async def add_job_inputs(
    request: JobInputsRequest,
    job_id: str = Path(min_length=1),
) -> Any:
    """Attach or update a job's persisted input payload."""
    service = _service_adapter()
    return await _run("add job inputs", job_id, service.add_inputs(job_id, request.root))


@router.get("/{job_id}/artifacts")
async def list_job_artifacts(job_id: str = Path(min_length=1)) -> Any:
    """List artifacts recorded for one persisted job."""
    service = _service_adapter()
    return await _run("list job artifacts", job_id, _artifacts_response(service, job_id))
