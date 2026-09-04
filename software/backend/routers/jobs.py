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

from fastapi import APIRouter, HTTPException, Path, Query, Response
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse
from pydantic import BaseModel, ConfigDict, Field, RootModel, model_validator

try:
    from jobs.contracts import (
        ArtifactInputSource,
        CreateJobRequest,
        InlineInputSource,
        MoleculeRevisionInputSource,
        list_task_contracts,
        resolve_task_contract,
    )
except ModuleNotFoundError:
    from ..jobs.contracts import (
        ArtifactInputSource,
        CreateJobRequest,
        InlineInputSource,
        MoleculeRevisionInputSource,
        list_task_contracts,
        resolve_task_contract,
    )

router = APIRouter(prefix="/jobs", tags=["jobs"])


class JobCreateRequest(RootModel[dict[str, Any]]):
    """Opaque job definition validated and persisted by the jobs service."""


class JobInputsRequest(RootModel[dict[str, Any]]):
    """Opaque input payload validated and persisted by the jobs service."""


class JobUpdateRequest(BaseModel):
    """Mutable task-center fields; scientific inputs remain immutable."""

    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = Field(default=None, max_length=2000)

    @model_validator(mode="after")
    def validate_patch(self) -> "JobUpdateRequest":
        if not self.model_fields_set:
            raise ValueError("provide at least one job field to update")
        if "name" in self.model_fields_set and self.name is None:
            raise ValueError("name cannot be null")
        return self


class JobCloneRequest(BaseModel):
    """Optional presentation fields for a copied immutable calculation."""

    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1, max_length=160)


class JobThumbnailRequest(BaseModel):
    """A small PNG snapshot captured from the active molecular viewport."""

    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    data_url: str = Field(alias="dataUrl", min_length=1)


class WorkflowInputLinkRequest(BaseModel):
    """One data dependency from an upstream job to a downstream job input."""

    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    target_job_id: str = Field(alias="targetJobId", min_length=1)
    target_input_name: str = Field(alias="targetInputName", min_length=1)
    source_job_id: str = Field(alias="sourceJobId", min_length=1)
    source_kind: Literal["input", "artifact"] = Field(alias="sourceKind")
    source_name: str | None = Field(default=None, alias="sourceName", min_length=1)
    source_artifact_id: str | None = Field(default=None, alias="sourceArtifactId", min_length=1)


class WorkflowRequest(BaseModel):
    """A durable DAG of persisted job ids and input links."""

    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    name: str = Field(min_length=1)
    job_ids: list[str] = Field(alias="jobIds", min_length=1)
    input_links: list[WorkflowInputLinkRequest] = Field(
        default_factory=list,
        alias="references",
    )


class TsPreparationWorkflowRequest(BaseModel):
    """Two optimized endpoint structures used to create one TS workflow draft."""

    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    name: str = Field(min_length=1, max_length=160)
    reactant_job_id: str = Field(alias="reactantJobId", min_length=1)
    reactant_artifact_id: str = Field(alias="reactantArtifactId", min_length=1)
    product_job_id: str = Field(alias="productJobId", min_length=1)
    product_artifact_id: str = Field(alias="productArtifactId", min_length=1)


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


class Psi4JobRequest(BaseModel):
    """Shared immutable input and runtime controls for Psi4 jobs."""

    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    name: str | None = Field(default=None, min_length=1, max_length=160)
    structure: XtbStructureRequest | None = None
    molecule_revision_id: str | None = Field(
        default=None, alias="moleculeRevisionId", min_length=1
    )
    artifact_id: str | None = Field(default=None, alias="artifactId", min_length=1)
    molecule: dict[str, Any] | None = None
    charge: int = Field(default=0, ge=-20, le=20)
    multiplicity: int = Field(default=1, ge=1, le=20)
    method: str = Field(default="b3lyp", min_length=1, max_length=64)
    basis: str = Field(default="def2-svp", min_length=1, max_length=64)
    reference: Literal["rhf", "uhf", "rohf"] | None = None
    scf_type: Literal["df", "pk"] = Field(default="df", alias="scfType")
    threads: int = Field(default=1, ge=1, le=16)
    memory_mb: int = Field(default=1024, ge=256, le=32768, alias="memoryMb")
    timeout_seconds: int = Field(
        default=3600, ge=5, le=86400, alias="timeoutSeconds"
    )

    @model_validator(mode="after")
    def validate_structure_source(self) -> "Psi4JobRequest":
        source_count = sum(
            source is not None
            for source in (self.structure, self.molecule_revision_id, self.artifact_id)
        )
        if source_count != 1:
            raise ValueError(
                "provide exactly one of structure, moleculeRevisionId, or artifactId"
            )
        if self.molecule is not None and self.structure is None:
            raise ValueError("molecule is only accepted with a literal structure")
        return self


class Psi4TsRefineJobRequest(Psi4JobRequest):
    max_steps: int = Field(default=100, alias="maxSteps", ge=1, le=1000)
    full_hessian_every: int = Field(
        default=1, alias="fullHessianEvery", ge=0, le=100
    )
    convergence: Literal["gau_loose", "gau", "gau_tight", "gau_verytight"] = (
        "gau_tight"
    )


class Psi4FrequencyJobRequest(Psi4JobRequest):
    pass


class Psi4IrcJobRequest(Psi4JobRequest):
    direction: Literal["forward", "backward", "both"] = "both"
    points: int = Field(default=20, ge=1, le=200)
    step_size: float = Field(default=0.2, alias="stepSize", gt=0, le=2)
    max_steps: int = Field(default=300, alias="maxSteps", ge=1, le=3000)


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

    async def create_calculation(self, request: CreateJobRequest) -> Any:
        """Adapt the stable layered request to the current execution service."""
        task_contract = resolve_task_contract(
            request.definition.contract.kind,
            request.definition.contract.engine,
            request.definition.contract.version,
        )
        execution = (
            request.execution.model_dump(mode="json", by_alias=True, exclude_none=True)
            if request.execution is not None
            else None
        )
        payload = task_contract.runtime_payload(
            request.definition.parameters,
            charge=request.definition.system.charge,
            multiplicity=request.definition.system.multiplicity,
            execution=execution,
        )
        inputs = await self._resolve_create_inputs(request)
        metadata = {
            "name": request.profile.name,
            "description": request.profile.description,
            "tags": request.profile.tags,
            "schemaVersion": request.schema_version,
            "contract": request.definition.contract.model_dump(
                mode="json", by_alias=True
            ),
            "requestedOutputs": [
                output.model_dump(mode="json", by_alias=True)
                for output in request.definition.outputs
            ],
            "execution": execution or {},
        }
        job = await self._call(
            "create_calculation_job",
            task_contract.runtime_kind,
            request.definition.contract.engine,
            payload,
            inputs=inputs,
            metadata=metadata,
        )
        job_id = _job_id(job)
        if not job_id:
            raise RuntimeError("The jobs service returned a calculation without an id")
        return await self.get_job(job_id)

    async def _resolve_create_inputs(
        self, request: CreateJobRequest
    ) -> dict[str, dict[str, Any]]:
        inputs: dict[str, dict[str, Any]] = {}
        for port, source in request.inputs.ports.items():
            if isinstance(source, InlineInputSource):
                inputs[port] = {
                    "sourceKind": "literal",
                    "format": source.format,
                    "value": source.value,
                }
                continue
            if isinstance(source, MoleculeRevisionInputSource):
                revision = await self._call(
                    "get_molecule_revision", source.revision_id
                )
                revision_asset_id = _read_field(revision, "assetId", "asset_id")
                if (
                    source.molecule_id is not None
                    and revision_asset_id != source.molecule_id
                ):
                    raise ValueError(
                        f"Revision '{source.revision_id}' does not belong to molecule "
                        f"'{source.molecule_id}'"
                    )
                inputs[port] = {
                    "sourceKind": "molecule_revision",
                    "format": "molecule",
                    "moleculeRevisionId": source.revision_id,
                }
                continue
            if isinstance(source, ArtifactInputSource):
                artifact = await self._call("get_artifact", source.artifact_id)
                inputs[port] = _artifact_input_descriptor(artifact)
                continue
            raise TypeError(f"Unsupported input source for port '{port}'")
        return inputs

    async def list_jobs(self) -> Any:
        return await self._call("list_jobs")

    async def get_job(self, job_id: str) -> Any:
        job = await self._call("get_job", job_id)
        if job is None:
            raise KeyError(job_id)
        return job

    async def update_job(self, job_id: str, changes: dict[str, Any]) -> Any:
        return await self._call("update_job", job_id, changes)

    async def delete_job(self, job_id: str) -> Any:
        return await self._call("delete_job", job_id)

    async def clone_job(self, job_id: str, request: JobCloneRequest) -> Any:
        return await self._call("clone_job", job_id, name=request.name)

    async def retry_job(self, job_id: str, request: JobCloneRequest) -> Any:
        return await self._call("retry_job", job_id, name=request.name)

    async def cancel_job(self, job_id: str) -> Any:
        return await self._call("cancel_job", job_id)

    async def read_job_log(self, job_id: str, cursor: int, limit: int) -> Any:
        return await self._call(
            "read_job_log", job_id, cursor=cursor, limit=limit
        )

    async def add_inputs(self, job_id: str, inputs: dict[str, Any]) -> Any:
        return await self._call("add_inputs", job_id, inputs)

    async def list_artifacts(self, job_id: str) -> Any:
        return await self._call("list_artifacts", job_id)

    async def get_job_type_data(self, job_id: str) -> Any:
        await self.get_job(job_id)
        return await self._call("get_job_type_data", job_id)

    async def list_job_runs(self, job_id: str) -> Any:
        await self.get_job(job_id)
        return await self._call("list_job_runs", job_id)

    async def get_job_run(self, job_id: str, run_id: str) -> Any:
        await self.get_job(job_id)
        try:
            run = await self._call("get_job_run", run_id)
        except ValueError as exc:
            if exc.__class__.__name__ == "InvalidJobOperationError":
                raise KeyError(run_id) from exc
            raise
        run_job_id = _read_field(run, "jobId", "job_id")
        if run_job_id != job_id:
            raise KeyError(run_id)
        return run

    async def create_workflow(self, request: WorkflowRequest) -> Any:
        return await self._call(
            "create_workflow",
            request.name,
            request.job_ids,
            [
                link.model_dump(mode="json", by_alias=True)
                for link in request.input_links
            ],
        )

    async def create_ts_preparation_workflow(
        self, request: TsPreparationWorkflowRequest
    ) -> Any:
        return await self._call(
            "create_ts_preparation_workflow",
            request.name,
            request.reactant_job_id,
            request.reactant_artifact_id,
            request.product_job_id,
            request.product_artifact_id,
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
            [
                link.model_dump(mode="json", by_alias=True)
                for link in request.input_links
            ],
        )

    async def get_workflow_schedule(self, workflow_id: str) -> Any:
        return await self._call("get_workflow_schedule", workflow_id)

    async def cancel_workflow_execution(self, workflow_id: str) -> Any:
        return await self._call("cancel_workflow_execution", workflow_id)

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

    async def create_psi4_calculation(
        self,
        kind: Literal["psi4-ts-refine", "psi4-frequency", "psi4-irc"],
        request: Psi4JobRequest,
    ) -> Any:
        request_data = request.model_dump(mode="json", by_alias=True, exclude_none=True)
        metadata = {"name": request.name, "request": request_data}
        spec_payload = {
            key: value
            for key, value in request_data.items()
            if key
            not in {
                "name",
                "structure",
                "molecule",
                "moleculeRevisionId",
                "artifactId",
            }
        }
        if request.molecule_revision_id is not None:
            structure_input = {
                "sourceKind": "molecule_revision",
                "format": "molecule",
                "moleculeRevisionId": request.molecule_revision_id,
            }
        elif request.artifact_id is not None:
            artifact = await self._call("get_artifact", request.artifact_id)
            structure_input = {
                "sourceKind": "artifact",
                "format": artifact.format,
                "artifactId": request.artifact_id,
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
        job = await self._call(
            "create_calculation_job",
            kind,
            "psi4",
            spec_payload,
            inputs={"structure": structure_input},
            metadata=metadata,
        )
        job_id = _job_id(job)
        if not job_id:
            raise RuntimeError("The jobs persistence service returned a job without an id")
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


def _read_field(value: Any, *names: str) -> Any:
    if isinstance(value, dict):
        for name in names:
            if name in value:
                return value[name]
        return None
    for name in names:
        if hasattr(value, name):
            return getattr(value, name)
    return None


def _artifact_input_descriptor(artifact: Any) -> dict[str, Any]:
    artifact_id = _read_field(artifact, "artifactId", "artifact_id")
    artifact_format = _read_field(artifact, "format")
    if not isinstance(artifact_id, str) or not artifact_id:
        raise ValueError("Resolved artifact has no id")
    if not isinstance(artifact_format, str) or not artifact_format:
        raise ValueError(f"Artifact '{artifact_id}' has no format")
    return {
        "sourceKind": "artifact",
        "format": artifact_format,
        "artifactId": artifact_id,
    }


def _is_xtb_optimization(job: Any) -> bool:
    if not isinstance(job, dict):
        job = jsonable_encoder(job)
    return job.get("taskType", job.get("task_type")) == "xtb-optimization"


def _frontend_calculation_kind(job: Any) -> str | None:
    if not isinstance(job, dict):
        job = jsonable_encoder(job)
    kind = job.get("taskType", job.get("task_type"))
    return (
        kind
        if kind
        in {"xtb-optimization", "psi4-ts-refine", "psi4-frequency", "psi4-irc"}
        else None
    )


def _frontend_job(job: Any) -> Any:
    """Project runnable calculations into the frontend's stable job contract."""
    payload = jsonable_encoder(job)
    kind = _frontend_calculation_kind(payload) if isinstance(payload, dict) else None
    if not isinstance(payload, dict) or kind is None:
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
        "kind": kind,
        "status": payload.get("status"),
        "name": name or kind,
        "createdAt": payload.get("createdAt", payload.get("created_at")),
        "artifacts": [_frontend_artifact(artifact) for artifact in payload.get("artifacts", [])],
    }
    supersedes_job_id = payload.get(
        "supersedesJobId", payload.get("supersedes_job_id")
    )
    if supersedes_job_id is not None:
        response["supersedesJobId"] = supersedes_job_id
    if payload.get("updatedAt", payload.get("updated_at")) is not None:
        response["updatedAt"] = payload.get("updatedAt", payload.get("updated_at"))
    if request is not None:
        response["request"] = request
    if metadata.get("message") is not None:
        response["message"] = metadata["message"]
    if metadata.get("description") is not None:
        response["description"] = metadata["description"]
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
        "sha256": payload.get("sha256"),
        "sizeBytes": payload.get("byteSize", payload.get("byte_size", metadata.get("sizeBytes"))),
        "createdAt": payload.get("createdAt", payload.get("created_at")),
        "metadata": metadata,
    }
    run_id = payload.get("runId", payload.get("run_id"))
    if run_id is not None:
        response["runId"] = run_id
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
    if _frontend_calculation_kind(job) is not None:
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
        if exc.__class__.__name__ in {"InvalidJobOperationError", "JobInUseError"}:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
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


@router.get("/contracts")
async def get_job_contracts() -> Any:
    """List task contracts used by forms, workflows, and AI clients."""
    return {"schemaVersion": 1, "contracts": list_task_contracts()}


@router.post("/calculations", status_code=201)
async def create_calculation_job(request: CreateJobRequest) -> Any:
    """Create a calculation through the stable layered Job contract."""
    service = _service_adapter()
    job = await _run(
        "create calculation job", None, service.create_calculation(request)
    )
    return _frontend_job(job)


@router.post("/xtb/optimize", status_code=201)
async def create_xtb_optimization_job(request: XtbOptimizeJobRequest) -> Any:
    """Persist an xTB optimization request for a future job runner."""
    service = _service_adapter()
    job = await _run("create xTB optimization job", None, service.create_xtb_optimization(request))
    return _frontend_job(job)


@router.post("/psi4/ts-refine", status_code=201)
async def create_psi4_ts_refine_job(request: Psi4TsRefineJobRequest) -> Any:
    service = _service_adapter()
    job = await _run(
        "create Psi4 TS refinement job",
        None,
        service.create_psi4_calculation("psi4-ts-refine", request),
    )
    return _frontend_job(job)


@router.post("/psi4/frequency", status_code=201)
async def create_psi4_frequency_job(request: Psi4FrequencyJobRequest) -> Any:
    service = _service_adapter()
    job = await _run(
        "create Psi4 frequency job",
        None,
        service.create_psi4_calculation("psi4-frequency", request),
    )
    return _frontend_job(job)


@router.post("/psi4/irc", status_code=201)
async def create_psi4_irc_job(request: Psi4IrcJobRequest) -> Any:
    service = _service_adapter()
    job = await _run(
        "create Psi4 IRC job",
        None,
        service.create_psi4_calculation("psi4-irc", request),
    )
    return _frontend_job(job)


@router.post("/workflows", status_code=201)
async def create_workflow(request: WorkflowRequest) -> Any:
    """Persist a DAG that composes existing jobs without starting them."""
    service = _service_adapter()
    return await _run("create workflow", None, service.create_workflow(request))


@router.post("/workflows/ts-preparation", status_code=201)
async def create_ts_preparation_workflow(
    request: TsPreparationWorkflowRequest,
) -> Any:
    """Create a fixed reactant/product optimization to TS-initial-guess workflow."""
    service = _service_adapter()
    workflow, target_job = await _run(
        "create TS preparation workflow",
        None,
        service.create_ts_preparation_workflow(request),
    )
    return {"workflow": workflow, "targetJob": _frontend_job(target_job)}


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
    return await _run(
        "update workflow",
        workflow_id,
        service.update_workflow(workflow_id, request),
    )


@router.post("/workflows/{workflow_id}/run", status_code=202)
async def run_workflow(workflow_id: str = Path(min_length=1)) -> Any:
    """Activate a workflow and durably submit every currently ready node."""
    try:
        from jobs.execution import JobExecutionError
        from jobs.executor import JobNotRunnableError, JobQueueFullError
    except ModuleNotFoundError:
        from software.backend.jobs.execution import JobExecutionError
        from software.backend.jobs.executor import (
            JobNotRunnableError,
            JobQueueFullError,
        )

    try:
        service = _get_job_service()
        executor = _get_job_executor()
        schedule = executor.submit_workflow(service, workflow_id)
    except KeyError as exc:
        raise _workflow_not_found_error(workflow_id) from exc
    except (JobExecutionError, JobNotRunnableError, ValueError) as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except JobQueueFullError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return jsonable_encoder(schedule)


@router.get("/workflows/{workflow_id}/execution")
async def get_workflow_execution(workflow_id: str = Path(min_length=1)) -> Any:
    """Return the persisted activation and derived state of every DAG node."""
    service = _service_adapter()
    return await _run(
        "get workflow execution",
        workflow_id,
        service.get_workflow_schedule(workflow_id),
    )


@router.post("/workflows/{workflow_id}/cancel")
async def cancel_workflow_execution(
    workflow_id: str = Path(min_length=1),
) -> Any:
    """Persistently stop scheduling and cancel unshared unfinished member jobs."""
    service = _service_adapter()
    return await _run(
        "cancel workflow execution",
        workflow_id,
        service.cancel_workflow_execution(workflow_id),
    )


def _get_job_executor() -> Any:
    try:
        from jobs.executor import get_job_executor
    except ModuleNotFoundError:
        from software.backend.jobs.executor import get_job_executor
    return get_job_executor()


@router.post("/{job_id}/run", status_code=202)
async def run_job(job_id: str = Path(min_length=1)) -> Any:
    """Submit one queued calculation and return without waiting for the engine."""
    try:
        from jobs.execution import JobExecutionError
        from jobs.executor import JobNotRunnableError, JobQueueFullError
    except ModuleNotFoundError:
        from software.backend.jobs.execution import JobExecutionError
        from software.backend.jobs.executor import (
            JobNotRunnableError,
            JobQueueFullError,
        )

    try:
        service = _get_job_service()
    except JobServiceUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    try:
        executor = _get_job_executor()
        executor.submit(service, job_id)
        job = service.get_job(job_id)
    except KeyError as exc:
        raise _not_found_error(job_id) from exc
    except (JobExecutionError, JobNotRunnableError) as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except JobQueueFullError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return _frontend_job(job)


@router.post("/{job_id}/clone", status_code=201)
async def clone_job(
    request: JobCloneRequest,
    job_id: str = Path(min_length=1),
) -> Any:
    """Create a new queued job from the source's frozen spec and bindings."""
    service = _service_adapter()
    job = await _run("clone job", job_id, service.clone_job(job_id, request))
    return _frontend_job(job)


@router.post("/{job_id}/retry", status_code=201)
async def retry_job(
    request: JobCloneRequest,
    job_id: str = Path(min_length=1),
) -> Any:
    """Create a queued run that explicitly supersedes a failed attempt."""
    service = _service_adapter()
    job = await _run("retry job", job_id, service.retry_job(job_id, request))
    return _frontend_job(job)


@router.post("/{job_id}/cancel")
async def cancel_job(job_id: str = Path(min_length=1)) -> Any:
    """Cancel one created, queued, or actively running job."""
    service = _service_adapter()
    job = await _run("cancel job", job_id, service.cancel_job(job_id))
    return _frontend_job(job)


@router.get("/{job_id}/log")
async def read_job_log(
    job_id: str = Path(min_length=1),
    cursor: int = Query(default=0, ge=0),
    limit: int = Query(default=128 * 1024, ge=1, le=512 * 1024),
) -> Any:
    """Return the next available log chunk for lightweight polling."""
    service = _service_adapter()
    return await _run(
        "read job log",
        job_id,
        service.read_job_log(job_id, cursor, limit),
    )


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


@router.get("/{job_id}/type-data")
async def get_job_type_data(job_id: str = Path(min_length=1)) -> Any:
    """Return the immutable, versioned request interpreted by the JobType."""
    service = _service_adapter()
    return await _run(
        "get job type data",
        job_id,
        service.get_job_type_data(job_id),
    )


@router.get("/{job_id}/runs")
async def list_job_runs(job_id: str = Path(min_length=1)) -> Any:
    """List concrete execution attempts for one durable Job."""
    service = _service_adapter()
    return await _run(
        "list job runs",
        job_id,
        service.list_job_runs(job_id),
    )


@router.get("/{job_id}/runs/{run_id}")
async def get_job_run(
    job_id: str = Path(min_length=1),
    run_id: str = Path(min_length=1),
) -> Any:
    """Return one execution attempt after verifying Job ownership."""
    service = _service_adapter()
    return await _run(
        "get job run",
        job_id,
        service.get_job_run(job_id, run_id),
    )


@router.patch("/{job_id}")
async def update_job(
    request: JobUpdateRequest,
    job_id: str = Path(min_length=1),
) -> Any:
    """Rename or describe a task without mutating its frozen calculation input."""
    service = _service_adapter()
    changes = request.model_dump(mode="json", exclude_unset=True)
    job = await _run("update job", job_id, service.update_job(job_id, changes))
    return _frontend_job(job)


@router.delete("/{job_id}", status_code=204)
async def delete_job(job_id: str = Path(min_length=1)) -> Response:
    """Delete a task only when no active run or workflow still depends on it."""
    service = _service_adapter()
    await _run("delete job", job_id, service.delete_job(job_id))
    return Response(status_code=204)


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
