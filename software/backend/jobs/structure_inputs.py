"""Resolve immutable molecular input snapshots for calculation runners."""

from __future__ import annotations

import hashlib
import json
from collections.abc import Mapping
from copy import deepcopy
from typing import Any

from .execution import JobExecutionError
from .molecule_canonicalize import molecule_content_hash


def resolve_structure_request(service: Any, job: Any) -> dict[str, Any] | None:
    """Compose an engine request from canonical type data and frozen structure."""
    spec = service.get_calculation_spec(job.job_id)
    input_snapshots = service.get_input_snapshots(job.job_id)
    request = _runtime_parameters(service, job, spec)
    if spec is not None and input_snapshots:
        snapshot = next(
            (item for item in input_snapshots if item.input_name == "structure"), None
        )
        if snapshot is None:
            raise JobExecutionError(
                f"Job '{job.job_id}' has no supported frozen structure snapshot"
            )
        if snapshot.source_kind == "molecule_revision":
            revision = service.get_molecule_revision(snapshot.molecule_revision_id or "")
            if revision.sha256 != snapshot.content_sha256:
                raise JobExecutionError(
                    f"Job '{job.job_id}' frozen molecule revision failed its digest check"
                )
            if molecule_content_hash(revision.structure) != revision.sha256:
                raise JobExecutionError(
                    f"Molecule revision '{revision.revision_id}' failed its content digest check"
                )
            request["molecule"] = deepcopy(revision.structure)
            request["structure"] = {
                key: deepcopy(value)
                for key, value in revision.structure.items()
                if key in {"name", "atoms"}
            }
            return request
        if snapshot.source_kind == "artifact":
            artifact = service.get_artifact(snapshot.artifact_id or "")
            if artifact.sha256 != snapshot.content_sha256:
                raise JobExecutionError(
                    f"Job '{job.job_id}' frozen artifact snapshot failed its digest check"
                )
            structure = artifact.metadata.get("structure")
            if isinstance(structure, Mapping):
                request["structure"] = dict(structure)
            elif artifact.format == "xyz" and artifact.storage_key:
                path = service.artifact_storage.resolve(artifact.storage_key)
                payload = path.read_bytes()
                if hashlib.sha256(payload).hexdigest() != artifact.sha256:
                    raise JobExecutionError(
                        f"Artifact '{artifact.artifact_id}' failed its content digest check"
                    )
                request["structure"] = structure_from_xyz(payload.decode("utf-8"))
            else:
                raise JobExecutionError(
                    f"Artifact '{artifact.artifact_id}' has no executable structure snapshot"
                )
            molecule = artifact.metadata.get("molecule")
            if isinstance(molecule, Mapping):
                request["molecule"] = dict(molecule)
            return request
        if snapshot.source_kind != "literal":
            raise JobExecutionError(
                f"Job '{job.job_id}' frozen structure source is not supported"
            )
        literal = snapshot.literal_value
        if canonical_json_sha256(literal) != snapshot.content_sha256:
            raise JobExecutionError(
                f"Job '{job.job_id}' frozen structure snapshot failed its digest check"
            )
        if not isinstance(literal, Mapping):
            raise JobExecutionError(
                f"Job '{job.job_id}' frozen structure snapshot is not an object"
            )
        if isinstance(literal.get("structure"), Mapping):
            request["structure"] = dict(literal["structure"])
        elif isinstance(literal.get("atoms"), list):
            request["structure"] = dict(literal)
        else:
            raise JobExecutionError(
                f"Job '{job.job_id}' frozen structure snapshot has no structure"
            )
        if isinstance(literal.get("molecule"), Mapping):
            request["molecule"] = dict(literal["molecule"])
        return request
    if spec is not None:
        return request
    request = job.metadata.get("request")
    return request if isinstance(request, dict) else None


def _runtime_parameters(service: Any, job: Any, spec: Any) -> dict[str, Any]:
    """Prefer canonical JobTypeData while retaining migrated-spec fallback."""
    request: dict[str, Any] | None = None
    get_job_type_data = getattr(service, "get_job_type_data", None)
    if callable(get_job_type_data):
        job_type_data = get_job_type_data(job.job_id)
        if job_type_data.job_type != job.task_type:
            raise JobExecutionError(
                f"Job '{job.job_id}' type data belongs to "
                f"'{job_type_data.job_type}', not '{job.task_type}'"
            )
        data = job_type_data.data
        parameters = data.get("parameters") if isinstance(data, Mapping) else None
        if isinstance(parameters, Mapping):
            if spec is not None:
                engine = data.get("engine")
                if isinstance(engine, str) and engine != spec.engine:
                    raise JobExecutionError(
                        f"Job '{job.job_id}' type data engine '{engine}' does not "
                        f"match calculation engine '{spec.engine}'"
                    )
            request = deepcopy(dict(parameters))

    # Schema 10 migrated legacy payloads without the engine/parameters envelope.
    if request is None:
        request = deepcopy(dict(spec.payload)) if spec is not None else {}

    name = job.metadata.get("name")
    if isinstance(name, str) and name.strip():
        request["name"] = name.strip()
    return request


def canonical_json_sha256(value: Any) -> str:
    payload = json.dumps(
        value,
        ensure_ascii=True,
        allow_nan=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def structure_from_xyz(payload: str) -> dict[str, Any]:
    lines = payload.splitlines()
    try:
        atom_count = int(lines[0].strip())
        atom_lines = lines[2 : 2 + atom_count]
        atoms = []
        for index, line in enumerate(atom_lines):
            symbol, x, y, z, *_ = line.split()
            atoms.append(
                {
                    "id": f"atom-{index + 1}",
                    "symbol": symbol,
                    "x": float(x),
                    "y": float(y),
                    "z": float(z),
                }
            )
    except (IndexError, TypeError, ValueError) as error:
        raise JobExecutionError(f"Invalid XYZ artifact: {error}") from error
    if len(atoms) != atom_count:
        raise JobExecutionError("Invalid XYZ artifact: atom count does not match")
    return {"atoms": atoms}


def molecule_with_coordinates(
    value: Any, structure: dict[str, Any]
) -> dict[str, Any] | None:
    """Keep a submitted graph while replacing coordinates by stable atom id."""
    if not isinstance(value, dict):
        return None
    atoms = value.get("atoms")
    bonds = value.get("bonds")
    if not isinstance(atoms, list) or not isinstance(bonds, list):
        return None
    positions = {
        atom.get("id"): atom
        for atom in structure["atoms"]
        if isinstance(atom, dict) and isinstance(atom.get("id"), str)
    }
    if len(positions) != len(atoms):
        return None
    snapshot = deepcopy(value)
    for atom in snapshot["atoms"]:
        if not isinstance(atom, dict) or not isinstance(atom.get("id"), str):
            return None
        position = positions.get(atom["id"])
        if position is None or position.get("symbol") != atom.get("symbol"):
            return None
        atom.update({key: position[key] for key in ("x", "y", "z")})
    snapshot["name"] = structure.get("name") or snapshot.get("name")
    return snapshot


__all__ = [
    "molecule_with_coordinates",
    "resolve_structure_request",
    "structure_from_xyz",
]
