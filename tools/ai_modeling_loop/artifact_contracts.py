from __future__ import annotations

import hashlib
import json
import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Mapping


SNAPSHOT_SCHEMA_VERSION = 1
IDENTITY_MAP_SCHEMA_VERSION = 1
COORDINATE_TRANSPORT_RECEIPT_SCHEMA_VERSION = 1


class ArtifactContractError(ValueError):
    """A persisted artifact does not satisfy the lossless exchange contract."""


def canonical_json_bytes(value: Any) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
        allow_nan=False,
    ).encode("utf-8")


def sha256_json(value: Any) -> str:
    return hashlib.sha256(canonical_json_bytes(value)).hexdigest()


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_strict_json(path: Path) -> Any:
    def reject_duplicate_keys(pairs: Iterable[tuple[str, Any]]) -> dict[str, Any]:
        result: dict[str, Any] = {}
        for key, value in pairs:
            if key in result:
                raise ArtifactContractError(f"duplicate JSON field: {key}")
            result[key] = value
        return result

    def reject_constant(value: str) -> None:
        raise ArtifactContractError(f"non-finite JSON number is forbidden: {value}")

    try:
        return json.loads(
            path.read_text(encoding="utf-8"),
            object_pairs_hook=reject_duplicate_keys,
            parse_constant=reject_constant,
        )
    except (OSError, json.JSONDecodeError) as error:
        raise ArtifactContractError(f"cannot read strict JSON {path}: {error}") from error


def _strict_object(
    value: Any,
    field: str,
    *,
    required: set[str],
    optional: set[str] | None = None,
) -> Mapping[str, Any]:
    if not isinstance(value, dict):
        raise ArtifactContractError(f"{field} must be an object")
    optional = optional or set()
    missing = required - set(value)
    unknown = set(value) - required - optional
    if missing:
        raise ArtifactContractError(f"{field} missing fields: {sorted(missing)}")
    if unknown:
        raise ArtifactContractError(f"{field} unknown fields: {sorted(unknown)}")
    return value


def _string(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value:
        raise ArtifactContractError(f"{field} must be a non-empty string")
    return value


def _integer(value: Any, field: str, *, minimum: int | None = None) -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        raise ArtifactContractError(f"{field} must be an integer")
    if minimum is not None and value < minimum:
        raise ArtifactContractError(f"{field} must be at least {minimum}")
    return value


def _finite(value: Any, field: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ArtifactContractError(f"{field} must be a number")
    result = float(value)
    if not math.isfinite(result):
        raise ArtifactContractError(f"{field} must be finite")
    return result


def _sha256(value: Any, field: str) -> str:
    result = _string(value, field)
    if re.fullmatch(r"[0-9a-f]{64}", result) is None:
        raise ArtifactContractError(f"{field} must be a lowercase SHA-256 digest")
    return result


@dataclass(frozen=True)
class AtomRow:
    row_index: int
    atom_id: str
    symbol: str


@dataclass(frozen=True)
class BondRow:
    row_index: int
    bond_id: str
    atom_id1: str
    atom_id2: str
    order: int


@dataclass(frozen=True)
class IdentityMap:
    atom_rows: tuple[AtomRow, ...]
    bond_rows: tuple[BondRow, ...]


@dataclass(frozen=True)
class CoordinateTransportAtomRow:
    row_index: int
    atom_id: str
    symbol: str
    position: tuple[float, float, float]


@dataclass(frozen=True)
class CoordinateTransportReceipt:
    builder_snapshot_sha256: str
    identity_map_sha256: str
    final_sdf_sha256: str
    atom_row_mapping_sha256: str
    atom_rows: tuple[CoordinateTransportAtomRow, ...]
    transport_provenance: Mapping[str, Any] | None = None


def coordinate_transport_atom_rows_json(
    atom_rows: Iterable[CoordinateTransportAtomRow],
) -> list[dict[str, Any]]:
    def canonical_coordinate(value: float) -> int | float:
        if value == 0:
            return 0
        if value.is_integer():
            return int(value)
        return value

    return [
        {
            "rowIndex": row.row_index,
            "atomId": row.atom_id,
            "symbol": row.symbol,
            # JSON has one number type, but Python serializes 0.0 differently
            # from JavaScript. Normalize integral coordinates so receipts have
            # one cross-language canonical digest.
            "position": [canonical_coordinate(value) for value in row.position],
        }
        for row in atom_rows
    ]


def coordinate_transport_atom_row_mapping_sha256(
    atom_rows: Iterable[CoordinateTransportAtomRow],
) -> str:
    return sha256_json({
        "schemaVersion": COORDINATE_TRANSPORT_RECEIPT_SCHEMA_VERSION,
        "atomRows": coordinate_transport_atom_rows_json(atom_rows),
    })


def load_coordinate_transport_receipt(path: Path) -> CoordinateTransportReceipt:
    payload = _strict_object(
        load_strict_json(path),
        "coordinateTransportReceipt",
        required={
            "schemaVersion",
            "kind",
            "builderSnapshotSha256",
            "identityMapSha256",
            "finalSdfSha256",
            "atomRowMappingSha256",
            "atomRows",
        },
        optional={"transportProvenance"},
    )
    if (
        _integer(payload["schemaVersion"], "coordinateTransportReceipt.schemaVersion")
        != COORDINATE_TRANSPORT_RECEIPT_SCHEMA_VERSION
    ):
        raise ArtifactContractError("unsupported coordinateTransportReceipt schemaVersion")
    if payload["kind"] != "stable-atom-coordinate-transport":
        raise ArtifactContractError("unsupported coordinateTransportReceipt kind")
    if not isinstance(payload["atomRows"], list):
        raise ArtifactContractError("coordinateTransportReceipt.atomRows must be an array")

    atom_rows: list[CoordinateTransportAtomRow] = []
    for index, raw in enumerate(payload["atomRows"]):
        item = _strict_object(
            raw,
            f"coordinateTransportReceipt.atomRows[{index}]",
            required={"rowIndex", "atomId", "symbol", "position"},
        )
        position = item["position"]
        if not isinstance(position, list) or len(position) != 3:
            raise ArtifactContractError(
                f"coordinateTransportReceipt.atomRows[{index}].position must contain 3 numbers"
            )
        atom_rows.append(CoordinateTransportAtomRow(
            row_index=_integer(
                item["rowIndex"],
                f"coordinateTransportReceipt.atomRows[{index}].rowIndex",
                minimum=1,
            ),
            atom_id=_string(
                item["atomId"],
                f"coordinateTransportReceipt.atomRows[{index}].atomId",
            ),
            symbol=_string(
                item["symbol"],
                f"coordinateTransportReceipt.atomRows[{index}].symbol",
            ),
            position=tuple(
                _finite(
                    value,
                    f"coordinateTransportReceipt.atomRows[{index}].position[{coordinate}]",
                )
                for coordinate, value in enumerate(position)
            ),
        ))

    _require_contiguous_rows([item.row_index for item in atom_rows], "coordinate atomRows")
    _require_unique([item.atom_id for item in atom_rows], "coordinate atomRows.atomId")
    transport_provenance = None
    if "transportProvenance" in payload:
        raw_provenance = _strict_object(
            payload["transportProvenance"],
            "coordinateTransportReceipt.transportProvenance",
            required={
                "kind",
                "sourceSdfSha256",
                "inputXyzSha256",
                "outputXyzSha256",
                "executableSha256",
                "rowOrderContract",
                "postProcessing",
                "fixedAtomRows",
            },
        )
        if raw_provenance["kind"] != "xtb-coordinate-transport":
            raise ArtifactContractError("unsupported coordinate transport provenance kind")
        fixed_atom_rows = raw_provenance["fixedAtomRows"]
        if not isinstance(fixed_atom_rows, list):
            raise ArtifactContractError(
                "coordinateTransportReceipt.transportProvenance.fixedAtomRows must be an array"
            )
        transport_provenance = {
            "kind": raw_provenance["kind"],
            "sourceSdfSha256": _sha256(
                raw_provenance["sourceSdfSha256"],
                "coordinateTransportReceipt.transportProvenance.sourceSdfSha256",
            ),
            "inputXyzSha256": _sha256(
                raw_provenance["inputXyzSha256"],
                "coordinateTransportReceipt.transportProvenance.inputXyzSha256",
            ),
            "outputXyzSha256": _sha256(
                raw_provenance["outputXyzSha256"],
                "coordinateTransportReceipt.transportProvenance.outputXyzSha256",
            ),
            "executableSha256": _sha256(
                raw_provenance["executableSha256"],
                "coordinateTransportReceipt.transportProvenance.executableSha256",
            ),
            "rowOrderContract": _string(
                raw_provenance["rowOrderContract"],
                "coordinateTransportReceipt.transportProvenance.rowOrderContract",
            ),
            "postProcessing": _string(
                raw_provenance["postProcessing"],
                "coordinateTransportReceipt.transportProvenance.postProcessing",
            ),
            "fixedAtomRows": tuple(
                _integer(
                    item,
                    f"coordinateTransportReceipt.transportProvenance.fixedAtomRows[{index}]",
                    minimum=1,
                )
                for index, item in enumerate(fixed_atom_rows)
            ),
        }
        if len(set(transport_provenance["fixedAtomRows"])) != len(
            transport_provenance["fixedAtomRows"]
        ):
            raise ArtifactContractError(
                "coordinateTransportReceipt.transportProvenance.fixedAtomRows must be unique"
            )
    receipt = CoordinateTransportReceipt(
        builder_snapshot_sha256=_sha256(
            payload["builderSnapshotSha256"],
            "coordinateTransportReceipt.builderSnapshotSha256",
        ),
        identity_map_sha256=_sha256(
            payload["identityMapSha256"],
            "coordinateTransportReceipt.identityMapSha256",
        ),
        final_sdf_sha256=_sha256(
            payload["finalSdfSha256"],
            "coordinateTransportReceipt.finalSdfSha256",
        ),
        atom_row_mapping_sha256=_sha256(
            payload["atomRowMappingSha256"],
            "coordinateTransportReceipt.atomRowMappingSha256",
        ),
        atom_rows=tuple(atom_rows),
        transport_provenance=transport_provenance,
    )
    expected_mapping_sha256 = coordinate_transport_atom_row_mapping_sha256(receipt.atom_rows)
    if receipt.atom_row_mapping_sha256 != expected_mapping_sha256:
        raise ArtifactContractError("coordinateTransportReceipt atom row mapping hash mismatch")
    return receipt


def load_identity_map(path: Path) -> IdentityMap:
    payload = _strict_object(
        load_strict_json(path),
        "identityMap",
        required={"schemaVersion", "atomRows", "bondRows"},
    )
    if _integer(payload["schemaVersion"], "identityMap.schemaVersion") != IDENTITY_MAP_SCHEMA_VERSION:
        raise ArtifactContractError("unsupported identityMap schemaVersion")
    if not isinstance(payload["atomRows"], list) or not isinstance(payload["bondRows"], list):
        raise ArtifactContractError("identityMap rows must be arrays")

    atoms: list[AtomRow] = []
    for index, raw in enumerate(payload["atomRows"]):
        item = _strict_object(
            raw,
            f"identityMap.atomRows[{index}]",
            required={"rowIndex", "atomId", "symbol"},
        )
        atoms.append(AtomRow(
            _integer(item["rowIndex"], f"atomRows[{index}].rowIndex", minimum=1),
            _string(item["atomId"], f"atomRows[{index}].atomId"),
            _string(item["symbol"], f"atomRows[{index}].symbol"),
        ))

    bonds: list[BondRow] = []
    for index, raw in enumerate(payload["bondRows"]):
        item = _strict_object(
            raw,
            f"identityMap.bondRows[{index}]",
            required={"rowIndex", "bondId", "atomId1", "atomId2", "order"},
        )
        order = _integer(item["order"], f"bondRows[{index}].order")
        if order not in (1, 2, 3):
            raise ArtifactContractError(f"bondRows[{index}].order must be 1, 2 or 3")
        bonds.append(BondRow(
            _integer(item["rowIndex"], f"bondRows[{index}].rowIndex", minimum=1),
            _string(item["bondId"], f"bondRows[{index}].bondId"),
            _string(item["atomId1"], f"bondRows[{index}].atomId1"),
            _string(item["atomId2"], f"bondRows[{index}].atomId2"),
            order,
        ))

    _require_contiguous_rows([item.row_index for item in atoms], "atomRows")
    _require_contiguous_rows([item.row_index for item in bonds], "bondRows")
    _require_unique([item.atom_id for item in atoms], "atomRows.atomId")
    _require_unique([item.bond_id for item in bonds], "bondRows.bondId")
    atom_ids = {item.atom_id for item in atoms}
    for item in bonds:
        if item.atom_id1 == item.atom_id2:
            raise ArtifactContractError(f"self bond in identity map: {item.bond_id}")
        if item.atom_id1 not in atom_ids or item.atom_id2 not in atom_ids:
            raise ArtifactContractError(f"bond endpoint missing in identity map: {item.bond_id}")
    return IdentityMap(tuple(atoms), tuple(bonds))


def _require_contiguous_rows(values: list[int], field: str) -> None:
    if values != list(range(1, len(values) + 1)):
        raise ArtifactContractError(f"{field} must be contiguous and 1-based")


def _require_unique(values: list[str], field: str) -> None:
    if len(values) != len(set(values)):
        raise ArtifactContractError(f"{field} must be unique")


def load_builder_snapshot(path: Path) -> dict[str, Any]:
    payload = _strict_object(
        load_strict_json(path),
        "snapshot",
        required={"schemaVersion", "coordinateSpace", "molecule"},
    )
    if _integer(payload["schemaVersion"], "snapshot.schemaVersion") != SNAPSHOT_SCHEMA_VERSION:
        raise ArtifactContractError("unsupported snapshot schemaVersion")
    if payload["coordinateSpace"] != "angstrom":
        raise ArtifactContractError("snapshot.coordinateSpace must be angstrom")
    molecule = _strict_object(
        payload["molecule"],
        "snapshot.molecule",
        required={"atoms", "bonds"},
        optional={"name"},
    )
    if not isinstance(molecule["atoms"], list) or not isinstance(molecule["bonds"], list):
        raise ArtifactContractError("snapshot molecule atoms/bonds must be arrays")

    atom_ids: list[str] = []
    for index, raw in enumerate(molecule["atoms"]):
        atom = _strict_object(
            raw,
            f"snapshot.molecule.atoms[{index}]",
            required={"atomId", "symbol", "position", "formalCharge", "radicalElectrons"},
            optional={"label", "coordinationGeometry", "coordinationDirections", "coordinationSites", "coordinationNumber"},
        )
        atom_ids.append(_string(atom["atomId"], f"atoms[{index}].atomId"))
        _string(atom["symbol"], f"atoms[{index}].symbol")
        position = atom["position"]
        if not isinstance(position, list) or len(position) != 3:
            raise ArtifactContractError(f"atoms[{index}].position must contain 3 numbers")
        for coordinate, value in enumerate(position):
            _finite(value, f"atoms[{index}].position[{coordinate}]")
        _integer(atom["formalCharge"], f"atoms[{index}].formalCharge")
        _integer(atom["radicalElectrons"], f"atoms[{index}].radicalElectrons", minimum=0)
    _require_unique(atom_ids, "snapshot atom ids")
    atom_id_set = set(atom_ids)

    bond_ids: list[str] = []
    endpoint_pairs: list[tuple[str, str]] = []
    for index, raw in enumerate(molecule["bonds"]):
        bond = _strict_object(
            raw,
            f"snapshot.molecule.bonds[{index}]",
            required={"bondId", "atomId1", "atomId2", "order", "aromatic"},
            optional={"coordinationSites"},
        )
        bond_id = _string(bond["bondId"], f"bonds[{index}].bondId")
        atom1 = _string(bond["atomId1"], f"bonds[{index}].atomId1")
        atom2 = _string(bond["atomId2"], f"bonds[{index}].atomId2")
        if atom1 == atom2 or atom1 not in atom_id_set or atom2 not in atom_id_set:
            raise ArtifactContractError(f"bonds[{index}] has invalid endpoints")
        order = _integer(bond["order"], f"bonds[{index}].order")
        if order not in (1, 2, 3):
            raise ArtifactContractError(f"bonds[{index}].order must be 1, 2 or 3")
        if not isinstance(bond["aromatic"], bool):
            raise ArtifactContractError(f"bonds[{index}].aromatic must be boolean")
        bond_ids.append(bond_id)
        endpoint_pairs.append(tuple(sorted((atom1, atom2))))
    _require_unique(bond_ids, "snapshot bond ids")
    if len(endpoint_pairs) != len(set(endpoint_pairs)):
        raise ArtifactContractError("snapshot contains duplicate bond endpoints")
    return dict(payload)


def ensure_identity_matches_snapshot(identity: IdentityMap, snapshot: Mapping[str, Any]) -> None:
    molecule = snapshot["molecule"]
    atoms = molecule["atoms"]
    bonds = molecule["bonds"]
    expected_atoms = [(atom["atomId"], atom["symbol"]) for atom in atoms]
    actual_atoms = [(row.atom_id, row.symbol) for row in identity.atom_rows]
    if actual_atoms != expected_atoms:
        raise ArtifactContractError("identityMap atom rows do not exactly match snapshot order")
    expected_bonds = [
        (bond["bondId"], bond["atomId1"], bond["atomId2"], bond["order"])
        for bond in bonds
    ]
    actual_bonds = [
        (row.bond_id, row.atom_id1, row.atom_id2, row.order)
        for row in identity.bond_rows
    ]
    if actual_bonds != expected_bonds:
        raise ArtifactContractError("identityMap bond rows do not exactly match snapshot order")
