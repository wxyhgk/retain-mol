from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping

from .artifact_contracts import (
    ArtifactContractError,
    load_builder_snapshot,
    load_strict_json,
    sha256_file,
)
from .formal_verdict import VerificationStatus


CANONICAL_DIGEST_PREFIX = "canonical-v2-sha256-"


@dataclass(frozen=True)
class RelationTerminalBindingResult:
    status: VerificationStatus
    code: str
    witness: Mapping[str, Any]

    def to_json(self) -> dict[str, Any]:
        return {
            "status": self.status.value,
            "code": self.code,
            "witness": dict(self.witness),
        }


def _mapping(value: Any, field: str) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        raise ArtifactContractError(f"{field} must be an object")
    return value


def _canonical_number(value: Any) -> Any:
    if isinstance(value, float) and value == 0:
        return 0
    return value


def _chemistry_default_zero(value: Any) -> Any:
    return 0 if value is None else value


def canonicalize_builder_snapshot(snapshot: Mapping[str, Any]) -> dict[str, Any]:
    molecule = _mapping(snapshot.get("molecule"), "builder snapshot molecule")
    atoms = molecule.get("atoms")
    bonds = molecule.get("bonds")
    if not isinstance(atoms, list) or not isinstance(bonds, list):
        raise ArtifactContractError("builder snapshot atoms and bonds must be arrays")

    canonical_atoms = []
    for index, raw in enumerate(atoms):
        atom = _mapping(raw, f"builder atom {index}")
        position = atom.get("position")
        if not isinstance(position, list) or len(position) != 3:
            raise ArtifactContractError(f"builder atom {index} position is invalid")
        canonical_atoms.append({
            "id": atom.get("atomId"),
            "symbol": atom.get("symbol"),
            "x": _canonical_number(position[0]),
            "y": _canonical_number(position[1]),
            "z": _canonical_number(position[2]),
            "charge": _chemistry_default_zero(atom.get("formalCharge")),
            "radical": _chemistry_default_zero(atom.get("radicalElectrons")),
            "label": atom.get("label"),
            "coordinationGeometry": atom.get("coordinationGeometry"),
            "coordinationDirections": sorted(
                [list(map(_canonical_number, item)) for item in atom.get("coordinationDirections", [])]
            ),
            "coordinationSites": sorted(
                [
                    {
                        "id": site["id"],
                        "label": site["label"],
                        "direction": list(map(_canonical_number, site["direction"])),
                        "bondOrder": site["bondOrder"],
                        "equivalenceGroup": site["equivalenceGroup"],
                    }
                    for site in atom.get("coordinationSites", [])
                ],
                key=lambda item: item["id"],
            ),
            "coordinationNumber": atom.get("coordinationNumber"),
        })

    canonical_bonds = []
    for index, raw in enumerate(bonds):
        bond = _mapping(raw, f"builder bond {index}")
        atom_id1, atom_id2 = sorted((bond.get("atomId1"), bond.get("atomId2")))
        canonical_bonds.append({
            "id": bond.get("bondId"),
            "atomId1": atom_id1,
            "atomId2": atom_id2,
            "order": bond.get("order"),
            "aromatic": bond.get("aromatic") is True,
            "coordinationSites": sorted(
                [
                    {"atomId": item["atomId"], "siteId": item["siteId"]}
                    for item in bond.get("coordinationSites", [])
                ],
                key=lambda item: (item["atomId"], item["siteId"]),
            ),
        })

    return {
        "name": molecule.get("name"),
        "atoms": sorted(canonical_atoms, key=lambda item: item["id"]),
        "bonds": sorted(canonical_bonds, key=lambda item: item["id"]),
    }


def canonical_snapshot_digest(snapshot: Mapping[str, Any]) -> str:
    encoded = json.dumps(
        snapshot,
        ensure_ascii=False,
        separators=(",", ":"),
        allow_nan=False,
    ).encode("utf-8")
    return CANONICAL_DIGEST_PREFIX + hashlib.sha256(encoded).hexdigest()


def canonicalize_runtime_snapshot(
    snapshot: Mapping[str, Any],
    *,
    normalize_chemistry_defaults: bool = True,
) -> dict[str, Any]:
    atoms = snapshot.get("atoms")
    bonds = snapshot.get("bonds")
    if not isinstance(atoms, list) or not isinstance(bonds, list):
        raise ArtifactContractError("runtime snapshot atoms and bonds must be arrays")
    return {
        "name": snapshot.get("name"),
        "atoms": sorted(
            [
                {
                    "id": atom["id"],
                    "symbol": atom["symbol"],
                    "x": _canonical_number(atom["x"]),
                    "y": _canonical_number(atom["y"]),
                    "z": _canonical_number(atom["z"]),
                    "charge": (
                        _chemistry_default_zero(atom.get("charge"))
                        if normalize_chemistry_defaults
                        else atom.get("charge")
                    ),
                    "radical": (
                        _chemistry_default_zero(atom.get("radical"))
                        if normalize_chemistry_defaults
                        else atom.get("radical")
                    ),
                    "label": atom.get("label"),
                    "coordinationGeometry": atom.get("coordinationGeometry"),
                    "coordinationDirections": sorted(
                        [
                            list(map(_canonical_number, direction))
                            for direction in atom.get("coordinationDirections", [])
                        ]
                    ),
                    "coordinationSites": sorted(
                        [
                            {
                                "id": site["id"],
                                "label": site["label"],
                                "direction": list(
                                    map(_canonical_number, site["direction"])
                                ),
                                "bondOrder": site["bondOrder"],
                                "equivalenceGroup": site["equivalenceGroup"],
                            }
                            for site in atom.get("coordinationSites", [])
                        ],
                        key=lambda item: item["id"],
                    ),
                    "coordinationNumber": atom.get("coordinationNumber"),
                }
                for atom in atoms
            ],
            key=lambda item: item["id"],
        ),
        "bonds": sorted(
            [
                {
                    "id": bond["id"],
                    "atomId1": min(bond["atomId1"], bond["atomId2"]),
                    "atomId2": max(bond["atomId1"], bond["atomId2"]),
                    "order": bond["order"],
                    "aromatic": bond.get("aromatic") is True,
                    "coordinationSites": sorted(
                        [
                            {"atomId": item["atomId"], "siteId": item["siteId"]}
                            for item in bond.get("coordinationSites", [])
                        ],
                        key=lambda item: (item["atomId"], item["siteId"]),
                    ),
                }
                for bond in bonds
            ],
            key=lambda item: item["id"],
        ),
    }


def verify_relation_terminal_binding(
    *,
    relation_trace_path: Path,
    execution_receipt_path: Path,
    builder_snapshot_path: Path,
    identity_map_path: Path,
    coordinate_transport_receipt_path: Path,
    final_sdf_path: Path,
) -> RelationTerminalBindingResult:
    """Bind the Lean relation trace to the exact executor artifact bundle."""

    try:
        trace = _mapping(load_strict_json(relation_trace_path), "relation trace")
        execution = _mapping(load_strict_json(execution_receipt_path), "execution receipt")
        identity = _mapping(trace.get("identity"), "relation trace identity")
        actual_effect = _mapping(
            execution.get("actualEffectReceipt"),
            "execution actual effect receipt",
        )
        steps = trace.get("steps")
        if not isinstance(steps, list) or not steps:
            raise ArtifactContractError("relation trace steps must be non-empty")
        final_step = _mapping(steps[-1], "relation trace final step")
        runtime_value = _mapping(final_step.get("runtimeAfter"), "relation runtimeAfter")
        runtime_after = canonicalize_runtime_snapshot(runtime_value)
        receipt_runtime = canonicalize_runtime_snapshot(
            runtime_value,
            normalize_chemistry_defaults=False,
        )
        builder = load_builder_snapshot(builder_snapshot_path)
        canonical_builder = canonicalize_builder_snapshot(builder)
        builder_digest = canonical_snapshot_digest(canonical_builder)
        trace_digest = canonical_snapshot_digest(receipt_runtime)
        semantic_trace_digest = canonical_snapshot_digest(runtime_after)

        expected_digest = identity.get("finalDigest")
        receipt_digest = actual_effect.get("finalDigest")
        receipt_digests = (trace_digest, expected_digest, receipt_digest)
        if any(not isinstance(item, str) for item in receipt_digests):
            raise ArtifactContractError("relation terminal digests must be strings")
        if (
            len(set(receipt_digests)) != 1
            or semantic_trace_digest != builder_digest
            or dict(runtime_after) != canonical_builder
        ):
            return RelationTerminalBindingResult(
                VerificationStatus.REJECT,
                "relation-terminal-snapshot-mismatch",
                {
                    "builderCanonicalDigest": builder_digest,
                    "traceCanonicalDigest": trace_digest,
                    "traceSemanticDigest": semantic_trace_digest,
                    "traceIdentityFinalDigest": expected_digest,
                    "executionFinalDigest": receipt_digest,
                },
            )

        artifact_bindings = {
            "outputSha256": sha256_file(final_sdf_path),
            "builderSnapshotSha256": sha256_file(builder_snapshot_path),
            "identityMapSha256": sha256_file(identity_map_path),
            "coordinateTransportReceiptSha256": sha256_file(
                coordinate_transport_receipt_path
            ),
        }
        mismatches = sorted(
            field
            for field, expected in artifact_bindings.items()
            if execution.get(field) != expected
        )
        if mismatches:
            return RelationTerminalBindingResult(
                VerificationStatus.REJECT,
                "relation-execution-artifact-binding-mismatch",
                {"mismatchedFields": mismatches, **artifact_bindings},
            )
        return RelationTerminalBindingResult(
            VerificationStatus.PASS,
            "relation-terminal-bound-to-artifact-bundle",
            {"canonicalFinalDigest": builder_digest, **artifact_bindings},
        )
    except (ArtifactContractError, OSError, TypeError, ValueError) as error:
        return RelationTerminalBindingResult(
            VerificationStatus.REJECT,
            "relation-terminal-binding-invalid",
            {"error": f"{type(error).__name__}: {error}"},
        )
