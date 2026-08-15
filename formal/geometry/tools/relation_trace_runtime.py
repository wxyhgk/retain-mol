"""Validate and project canonical runtime molecule snapshots."""

from __future__ import annotations

import hashlib
import json
import math
from decimal import Decimal
from typing import Any

from json_to_lean import (
    MAX_ATOMS,
    MAX_BONDS,
    checked_bool,
    checked_int,
    checked_list,
    checked_string,
    decimal_number,
    strict_object,
)


COORDINATE_SCALE = 1000
MAX_ABS_COORDINATE_UNITS = 1_000_000_000
QUANTIZATION_TIE_GUARD = 1e-9
CANONICAL_DIGEST_PREFIX = "canonical-v2-sha256-"
MAX_SAFE_INTEGER = (1 << 53) - 1


def _text_key(value: str) -> bytes:
    """Match JavaScript's UTF-16 code-unit comparison used by canonical.ts."""
    return value.encode("utf-16-be", errors="surrogatepass")


def _finite_number(value: Any, field: str) -> float:
    parsed = decimal_number(value, field)
    result = float(parsed)
    if not math.isfinite(result):
        raise ValueError(f"{field} must fit a finite JavaScript number")
    if result == 0 and parsed.is_signed():
        raise ValueError(f"{field} must not be negative zero")
    return result


def _nullable_integer(value: Any, field: str, *, minimum: int | None = None) -> int | None:
    if value is None:
        return None
    return _safe_integer(value, field, minimum=minimum)


def _safe_integer(value: Any, field: str, *, minimum: int | None = None) -> int:
    result = checked_int(value, field, minimum=minimum)
    if abs(result) > MAX_SAFE_INTEGER:
        raise ValueError(f"{field} exceeds the JavaScript safe integer range")
    return result


def _vector(value: Any, field: str) -> list[float]:
    items = checked_list(value, field, maximum=3)
    if len(items) != 3:
        raise ValueError(f"{field} must contain exactly three numbers")
    return [_finite_number(item, f"{field}[{index}]") for index, item in enumerate(items)]


def _js_number(value: float) -> str:
    """Serialize the finite IEEE-754 values emitted by JSON.stringify."""
    if value == 0:
        return "0"
    absolute = abs(value)
    shortest = repr(value)
    if 1e-6 <= absolute < 1e21:
        rendered = format(Decimal(shortest), "f")
        if "." in rendered:
            rendered = rendered.rstrip("0").rstrip(".")
        return rendered
    mantissa, exponent = shortest.lower().split("e")
    if mantissa.endswith(".0"):
        mantissa = mantissa[:-2]
    exponent_value = int(exponent)
    sign = "+" if exponent_value >= 0 else ""
    return f"{mantissa}e{sign}{exponent_value}"


def _js_json(value: Any) -> str:
    if value is None:
        return "null"
    if value is True:
        return "true"
    if value is False:
        return "false"
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    if isinstance(value, (int, float, Decimal)) and not isinstance(value, bool):
        if isinstance(value, int) and abs(value) > MAX_SAFE_INTEGER:
            raise ValueError("canonical JSON integer exceeds the JavaScript safe range")
        number = float(value)
        if not math.isfinite(number):
            raise ValueError("canonical JSON number must be finite")
        return _js_number(number)
    if isinstance(value, list):
        return "[" + ",".join(_js_json(item) for item in value) + "]"
    if isinstance(value, dict):
        return "{" + ",".join(
            f"{json.dumps(key, ensure_ascii=False)}:{_js_json(item)}"
            for key, item in value.items()
        ) + "}"
    raise ValueError(f"unsupported canonical JSON value: {type(value).__name__}")


def canonical_digest(snapshot: dict[str, Any]) -> str:
    encoded = _js_json(snapshot).encode("utf-8")
    return CANONICAL_DIGEST_PREFIX + hashlib.sha256(encoded).hexdigest()


def _canonical_site(value: Any, field: str) -> dict[str, Any]:
    site = strict_object(value, field, {
        "id", "label", "direction", "bondOrder", "equivalenceGroup",
    })
    bond_order = checked_int(site["bondOrder"], f"{field}.bondOrder")
    if bond_order not in {1, 2, 3}:
        raise ValueError(f"{field}.bondOrder must be 1, 2, or 3")
    return {
        "id": checked_string(site["id"], f"{field}.id"),
        "label": checked_string(site["label"], f"{field}.label", allow_empty=True),
        "direction": _vector(site["direction"], f"{field}.direction"),
        "bondOrder": bond_order,
        "equivalenceGroup": checked_string(
            site["equivalenceGroup"], f"{field}.equivalenceGroup", allow_empty=True,
        ),
    }


def _canonical_atom(value: Any, field: str) -> dict[str, Any]:
    atom = strict_object(value, field, {
        "id", "symbol", "x", "y", "z", "charge", "radical", "label",
        "coordinationGeometry", "coordinationDirections", "coordinationSites",
        "coordinationNumber",
    })
    label = atom["label"]
    geometry = atom["coordinationGeometry"]
    if label is not None:
        checked_string(label, f"{field}.label", allow_empty=True)
    if geometry is not None:
        checked_string(geometry, f"{field}.coordinationGeometry", allow_empty=True)
    directions = [
        _vector(item, f"{field}.coordinationDirections[{index}]")
        for index, item in enumerate(checked_list(
            atom["coordinationDirections"], f"{field}.coordinationDirections",
        ))
    ]
    if directions != sorted(directions):
        raise ValueError(f"{field}.coordinationDirections is not canonically sorted")
    sites = [
        _canonical_site(item, f"{field}.coordinationSites[{index}]")
        for index, item in enumerate(checked_list(
            atom["coordinationSites"], f"{field}.coordinationSites",
        ))
    ]
    site_ids = [site["id"] for site in sites]
    if len(set(site_ids)) != len(site_ids):
        raise ValueError(f"{field}.coordinationSites contains duplicate ids")
    if site_ids != sorted(site_ids, key=_text_key):
        raise ValueError(f"{field}.coordinationSites is not canonically sorted")
    return {
        "id": checked_string(atom["id"], f"{field}.id"),
        "symbol": checked_string(atom["symbol"], f"{field}.symbol"),
        "x": _finite_number(atom["x"], f"{field}.x"),
        "y": _finite_number(atom["y"], f"{field}.y"),
        "z": _finite_number(atom["z"], f"{field}.z"),
        "charge": _nullable_integer(atom["charge"], f"{field}.charge"),
        "radical": _nullable_integer(atom["radical"], f"{field}.radical", minimum=0),
        "label": label,
        "coordinationGeometry": geometry,
        "coordinationDirections": directions,
        "coordinationSites": sites,
        "coordinationNumber": _nullable_integer(
            atom["coordinationNumber"], f"{field}.coordinationNumber", minimum=0,
        ),
    }


def _canonical_assignment(value: Any, field: str) -> dict[str, str]:
    assignment = strict_object(value, field, {"atomId", "siteId"})
    return {
        "atomId": checked_string(assignment["atomId"], f"{field}.atomId"),
        "siteId": checked_string(assignment["siteId"], f"{field}.siteId"),
    }


def _canonical_bond(value: Any, field: str) -> dict[str, Any]:
    bond = strict_object(value, field, {
        "id", "atomId1", "atomId2", "order", "aromatic", "coordinationSites",
    })
    order = checked_int(bond["order"], f"{field}.order")
    if order not in {1, 2, 3}:
        raise ValueError(f"{field}.order must be 1, 2, or 3")
    assignments = [
        _canonical_assignment(item, f"{field}.coordinationSites[{index}]")
        for index, item in enumerate(checked_list(
            bond["coordinationSites"], f"{field}.coordinationSites",
        ))
    ]
    assignment_keys = [(item["atomId"], item["siteId"]) for item in assignments]
    if len(set(assignment_keys)) != len(assignment_keys):
        raise ValueError(f"{field}.coordinationSites contains duplicates")
    if assignment_keys != sorted(assignment_keys, key=lambda item: (_text_key(item[0]), _text_key(item[1]))):
        raise ValueError(f"{field}.coordinationSites is not canonically sorted")
    return {
        "id": checked_string(bond["id"], f"{field}.id"),
        "atomId1": checked_string(bond["atomId1"], f"{field}.atomId1"),
        "atomId2": checked_string(bond["atomId2"], f"{field}.atomId2"),
        "order": order,
        "aromatic": checked_bool(bond["aromatic"], f"{field}.aromatic"),
        "coordinationSites": assignments,
    }


def canonical_snapshot(value: Any, field: str) -> dict[str, Any]:
    snapshot = strict_object(value, field, {"name", "atoms", "bonds"})
    name = snapshot["name"]
    if name is not None:
        checked_string(name, f"{field}.name", allow_empty=True)
    atoms = [
        _canonical_atom(item, f"{field}.atoms[{index}]")
        for index, item in enumerate(checked_list(
            snapshot["atoms"], f"{field}.atoms", maximum=MAX_ATOMS,
        ))
    ]
    bonds = [
        _canonical_bond(item, f"{field}.bonds[{index}]")
        for index, item in enumerate(checked_list(
            snapshot["bonds"], f"{field}.bonds", maximum=MAX_BONDS,
        ))
    ]
    atom_ids = [atom["id"] for atom in atoms]
    bond_ids = [bond["id"] for bond in bonds]
    if len(set(atom_ids)) != len(atom_ids):
        raise ValueError(f"{field}.atoms contains duplicate ids")
    if len(set(bond_ids)) != len(bond_ids):
        raise ValueError(f"{field}.bonds contains duplicate ids")
    if atom_ids != sorted(atom_ids, key=_text_key):
        raise ValueError(f"{field}.atoms is not canonically sorted")
    if bond_ids != sorted(bond_ids, key=_text_key):
        raise ValueError(f"{field}.bonds is not canonically sorted")
    atom_by_id = {atom["id"]: atom for atom in atoms}
    endpoint_pairs: set[tuple[str, str]] = set()
    site_ids = {
        atom["id"]: {site["id"] for site in atom["coordinationSites"]}
        for atom in atoms
    }
    for index, bond in enumerate(bonds):
        bond_field = f"{field}.bonds[{index}]"
        endpoints = (bond["atomId1"], bond["atomId2"])
        if endpoints[0] not in atom_by_id or endpoints[1] not in atom_by_id:
            raise ValueError(f"{bond_field} has a missing endpoint")
        if _text_key(endpoints[0]) >= _text_key(endpoints[1]):
            raise ValueError(f"{bond_field} endpoints are not canonically ordered")
        if endpoints in endpoint_pairs:
            raise ValueError(f"{field}.bonds contains duplicate endpoint pairs")
        endpoint_pairs.add(endpoints)
        for assignment in bond["coordinationSites"]:
            if assignment["atomId"] not in endpoints:
                raise ValueError(f"{bond_field}.coordinationSites has a non-endpoint atom")
            if assignment["siteId"] not in site_ids[assignment["atomId"]]:
                raise ValueError(f"{bond_field}.coordinationSites references a missing site")
    return {"name": name, "atoms": atoms, "bonds": bonds}


def _math_round(value: float) -> int:
    return math.floor(value + 0.5)


def _quantize_coordinate(value: float, field: str) -> int:
    scaled = value * COORDINATE_SCALE
    distance_to_tie = abs((scaled - math.floor(scaled)) - 0.5)
    if distance_to_tie <= QUANTIZATION_TIE_GUARD:
        raise ValueError(f"{field} is inside the coordinate quantization boundary")
    return _math_round(scaled)


def project_snapshot(snapshot: dict[str, Any]) -> dict[str, Any]:
    aromatic_ids = {
        atom_id
        for bond in snapshot["bonds"] if bond["aromatic"]
        for atom_id in (bond["atomId1"], bond["atomId2"])
    }
    atoms = []
    for atom in snapshot["atoms"]:
        units = [
            _quantize_coordinate(atom[axis], f"runtime atom {atom['id']}.{axis}")
            for axis in ("x", "y", "z")
        ]
        if any(abs(value) > MAX_ABS_COORDINATE_UNITS for value in units):
            raise ValueError(f"runtime atom {atom['id']} exceeds formal coordinate limits")
        atoms.append({
            "atomId": atom["id"],
            "symbol": atom["symbol"],
            "positionUnits": units,
            "formalCharge": atom["charge"] or 0,
            "radicalElectrons": atom["radical"] or 0,
            "aromatic": atom["id"] in aromatic_ids,
        })
    bonds = [{
        "bondId": bond["id"],
        "atomId1": bond["atomId1"],
        "atomId2": bond["atomId2"],
        "order": "aromatic" if bond["aromatic"] else {1: "single", 2: "double", 3: "triple"}[bond["order"]],
    } for bond in snapshot["bonds"]]
    return {"atoms": atoms, "bonds": bonds}


def formal_snapshot(value: Any, field: str) -> dict[str, Any]:
    molecule = strict_object(value, field, {"atoms", "bonds"})
    atoms = []
    for index, item in enumerate(checked_list(molecule["atoms"], f"{field}.atoms", maximum=MAX_ATOMS)):
        atom_field = f"{field}.atoms[{index}]"
        atom = strict_object(item, atom_field, {
            "atomId", "symbol", "positionUnits", "formalCharge", "radicalElectrons", "aromatic",
        })
        positions = checked_list(atom["positionUnits"], f"{atom_field}.positionUnits", maximum=3)
        if len(positions) != 3:
            raise ValueError(f"{atom_field}.positionUnits must contain three integers")
        parsed_positions = [
            checked_int(position, f"{atom_field}.positionUnits[{axis}]")
            for axis, position in enumerate(positions)
        ]
        if any(abs(position) > MAX_ABS_COORDINATE_UNITS for position in parsed_positions):
            raise ValueError(f"{atom_field}.positionUnits exceeds coordinate limits")
        atoms.append({
            "atomId": checked_string(atom["atomId"], f"{atom_field}.atomId"),
            "symbol": checked_string(atom["symbol"], f"{atom_field}.symbol"),
            "positionUnits": parsed_positions,
            "formalCharge": _safe_integer(atom["formalCharge"], f"{atom_field}.formalCharge"),
            "radicalElectrons": _safe_integer(
                atom["radicalElectrons"], f"{atom_field}.radicalElectrons", minimum=0,
            ),
            "aromatic": checked_bool(atom["aromatic"], f"{atom_field}.aromatic"),
        })
    bonds = []
    for index, item in enumerate(checked_list(molecule["bonds"], f"{field}.bonds", maximum=MAX_BONDS)):
        bond_field = f"{field}.bonds[{index}]"
        bond = strict_object(item, bond_field, {"bondId", "atomId1", "atomId2", "order"})
        order = checked_string(bond["order"], f"{bond_field}.order")
        if order not in {"single", "double", "triple", "aromatic"}:
            raise ValueError(f"{bond_field}.order is unsupported")
        bonds.append({
            "bondId": checked_string(bond["bondId"], f"{bond_field}.bondId"),
            "atomId1": checked_string(bond["atomId1"], f"{bond_field}.atomId1"),
            "atomId2": checked_string(bond["atomId2"], f"{bond_field}.atomId2"),
            "order": order,
        })
    return {"atoms": atoms, "bonds": bonds}
