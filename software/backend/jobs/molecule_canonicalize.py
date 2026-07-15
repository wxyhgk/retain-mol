"""Canonical RetainMol molecule serialization shared by persistence and jobs."""

from __future__ import annotations

import hashlib
import json
import math
from copy import deepcopy
from decimal import Decimal
from typing import Any


class InvalidMoleculeError(ValueError):
    """Raised when a submitted molecule cannot form a reproducible revision."""


def validate_molecule(value: Any) -> dict[str, Any]:
    """Validate the stable graph fields while preserving extension properties."""
    if not isinstance(value, dict):
        raise InvalidMoleculeError("molecule must be an object")
    atoms = value.get("atoms")
    bonds = value.get("bonds")
    if not isinstance(atoms, list) or not isinstance(bonds, list):
        raise InvalidMoleculeError("molecule atoms and bonds must be arrays")

    atom_ids: set[str] = set()
    for index, atom in enumerate(atoms):
        if not isinstance(atom, dict):
            raise InvalidMoleculeError(f"atom {index} must be an object")
        atom_id = atom.get("id")
        symbol = atom.get("symbol")
        if not isinstance(atom_id, str) or not atom_id:
            raise InvalidMoleculeError(f"atom {index} requires a stable id")
        if atom_id in atom_ids:
            raise InvalidMoleculeError(f"duplicate atom id: {atom_id}")
        if not isinstance(symbol, str) or not symbol:
            raise InvalidMoleculeError(f"atom '{atom_id}' requires an element symbol")
        for coordinate in ("x", "y", "z"):
            number = atom.get(coordinate)
            if (
                isinstance(number, bool)
                or not isinstance(number, (int, float))
                or not math.isfinite(float(number))
            ):
                raise InvalidMoleculeError(
                    f"atom '{atom_id}' requires a finite {coordinate} coordinate"
                )
        atom_ids.add(atom_id)

    bond_ids: set[str] = set()
    for index, bond in enumerate(bonds):
        if not isinstance(bond, dict):
            raise InvalidMoleculeError(f"bond {index} must be an object")
        bond_id = bond.get("id")
        if not isinstance(bond_id, str) or not bond_id:
            raise InvalidMoleculeError(f"bond {index} requires a stable id")
        if bond_id in bond_ids:
            raise InvalidMoleculeError(f"duplicate bond id: {bond_id}")
        atom_id_1 = bond.get("atomId1")
        atom_id_2 = bond.get("atomId2")
        if atom_id_1 not in atom_ids or atom_id_2 not in atom_ids:
            raise InvalidMoleculeError(f"bond '{bond_id}' references a missing atom")
        if atom_id_1 == atom_id_2:
            raise InvalidMoleculeError(f"bond '{bond_id}' cannot be a self bond")
        if bond.get("order") not in (1, 2, 3):
            raise InvalidMoleculeError(f"bond '{bond_id}' has an unsupported order")
        bond_ids.add(bond_id)
    return deepcopy(value)


def canonicalize_molecule(molecule: dict[str, Any]) -> str:
    normalized = deepcopy(molecule)
    normalized["atoms"] = sorted(
        (_normalize_atom(atom) for atom in molecule["atoms"]),
        key=_id_then_value,
    )
    normalized["bonds"] = sorted(
        (_normalize_bond(bond) for bond in molecule["bonds"]),
        key=_id_then_value,
    )
    return stable_canonical_json({"schemaVersion": 1, "molecule": normalized})


def canonicalize_molecule_topology(molecule: dict[str, Any]) -> str:
    atoms = sorted(
        (_topology_atom(atom) for atom in molecule["atoms"]), key=_id_then_value
    )
    bonds = sorted(
        (_topology_bond(bond) for bond in molecule["bonds"]), key=_id_then_value
    )
    return stable_canonical_json(
        {"schemaVersion": 1, "atoms": atoms, "bonds": bonds}
    )


def molecule_content_hash(molecule: dict[str, Any]) -> str:
    return _sha256(canonicalize_molecule(molecule))


def molecule_topology_fingerprint(molecule: dict[str, Any]) -> str:
    return _sha256(canonicalize_molecule_topology(molecule))


def stable_canonical_json(value: Any) -> str:
    if value is None:
        return "null"
    if value is True:
        return "true"
    if value is False:
        return "false"
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    if isinstance(value, int):
        if abs(value) > 9_007_199_254_740_991:
            raise InvalidMoleculeError("integers must fit JavaScript safe-integer semantics")
        return str(value)
    if isinstance(value, float):
        return _javascript_number(value)
    if isinstance(value, list):
        return "[" + ",".join(stable_canonical_json(item) for item in value) + "]"
    if isinstance(value, dict):
        entries = []
        for key in sorted(value, key=_utf16_sort_key):
            if not isinstance(key, str):
                raise InvalidMoleculeError("canonical JSON object keys must be strings")
            entries.append(
                f"{json.dumps(key, ensure_ascii=False)}:{stable_canonical_json(value[key])}"
            )
        return "{" + ",".join(entries) + "}"
    raise InvalidMoleculeError(f"unsupported canonical JSON value: {type(value).__name__}")


def _normalize_atom(atom: dict[str, Any]) -> dict[str, Any]:
    normalized = deepcopy(atom)
    sites = normalized.get("coordinationSites")
    if isinstance(sites, list):
        normalized["coordinationSites"] = sorted(sites, key=_id_then_value)
    return normalized


def _normalize_bond(bond: dict[str, Any]) -> dict[str, Any]:
    normalized = deepcopy(bond)
    if _utf16_sort_key(str(normalized["atomId2"])) < _utf16_sort_key(
        str(normalized["atomId1"])
    ):
        normalized["atomId1"], normalized["atomId2"] = (
            normalized["atomId2"],
            normalized["atomId1"],
        )
    sites = normalized.get("coordinationSites")
    if isinstance(sites, list):
        normalized["coordinationSites"] = sorted(
            sites,
            key=lambda item: (
                _utf16_sort_key(str(item.get("atomId", ""))),
                _utf16_sort_key(str(item.get("siteId", ""))),
                stable_canonical_json(item),
            ),
        )
    return normalized


def _topology_atom(atom: dict[str, Any]) -> dict[str, Any]:
    normalized = _normalize_atom(atom)
    for key in ("x", "y", "z", "coordinationDirections"):
        normalized.pop(key, None)
    sites = normalized.get("coordinationSites")
    if isinstance(sites, list):
        normalized["coordinationSites"] = [
            {key: value for key, value in site.items() if key != "direction"}
            for site in sites
        ]
    return normalized


def _topology_bond(bond: dict[str, Any]) -> dict[str, Any]:
    normalized = _normalize_bond(bond)
    normalized.pop("id", None)
    return normalized


def _id_then_value(value: dict[str, Any]) -> tuple[tuple[int, ...], str]:
    return (_utf16_sort_key(str(value.get("id", ""))), stable_canonical_json(value))


def _utf16_sort_key(value: str) -> tuple[int, ...]:
    encoded = value.encode("utf-16-be", errors="surrogatepass")
    return tuple(int.from_bytes(encoded[index : index + 2], "big") for index in range(0, len(encoded), 2))


def _javascript_number(value: float) -> str:
    if not math.isfinite(value):
        raise InvalidMoleculeError("canonical JSON only supports finite numbers")
    if value == 0:
        return "0"
    absolute = abs(value)
    representation = repr(value).lower()
    if 1e-6 <= absolute < 1e21:
        if "e" in representation:
            return format(Decimal(representation), "f")
        if representation.endswith(".0"):
            return representation[:-2]
        return representation
    if "e" not in representation:
        representation = format(value, ".15e")
    mantissa, exponent = representation.split("e")
    mantissa = mantissa.rstrip("0").rstrip(".")
    exponent_value = int(exponent)
    sign = "+" if exponent_value >= 0 else ""
    return f"{mantissa}e{sign}{exponent_value}"


def _sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()
