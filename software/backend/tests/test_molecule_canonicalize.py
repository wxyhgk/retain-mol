"""Cross-runtime vectors for immutable molecule revision hashing."""

from __future__ import annotations

import pytest

from software.backend.jobs.molecule_canonicalize import (
    InvalidMoleculeError,
    molecule_content_hash,
    molecule_topology_fingerprint,
    stable_canonical_json,
    validate_molecule,
)


def _formaldehyde() -> dict:
    return {
        "name": "formaldehyde",
        "atoms": [
            {"id": "o1", "symbol": "O", "x": 1.2, "y": 0, "z": 0, "charge": 0},
            {"id": "c1", "symbol": "C", "x": 0, "y": 0, "z": 0},
            {"id": "h2", "symbol": "H", "x": -0.5, "y": -0.9, "z": 0},
            {"id": "h1", "symbol": "H", "x": -0.5, "y": 0.9, "z": 0},
        ],
        "bonds": [
            {"id": "ch2", "atomId1": "h2", "atomId2": "c1", "order": 1},
            {"id": "co", "atomId1": "o1", "atomId2": "c1", "order": 2},
            {"id": "ch1", "atomId1": "c1", "atomId2": "h1", "order": 1},
        ],
    }


def test_hashes_match_the_typescript_reference_vectors() -> None:
    molecule = _formaldehyde()

    assert molecule_content_hash(molecule) == (
        "f9f24291a3baf1221a190390850207b0c2a2356aaf26831a1f2171d011998eca"
    )
    assert molecule_topology_fingerprint(molecule) == (
        "1ac6afe908abdf88c92e3e75a1b93f6600440597c6c0b0d64695103e57b11c43"
    )

    moved = _formaldehyde()
    moved["atoms"][0]["x"] = 1.21
    assert molecule_content_hash(moved) == (
        "c4fafc1f63983cc6723e7809d2d0eaa0cd43f941a38a420586eaad102f1cf022"
    )
    assert molecule_topology_fingerprint(moved) == molecule_topology_fingerprint(
        molecule
    )


def test_canonical_json_and_graph_validation_are_strict() -> None:
    assert stable_canonical_json({"z": 1, "a": {"d": 4, "b": 2}}) == (
        '{"a":{"b":2,"d":4},"z":1}'
    )
    invalid = _formaldehyde()
    invalid["bonds"].append(
        {"id": "bad", "atomId1": "c1", "atomId2": "missing", "order": 1}
    )
    with pytest.raises(InvalidMoleculeError, match="missing atom"):
        validate_molecule(invalid)
    with pytest.raises(InvalidMoleculeError, match="finite"):
        stable_canonical_json({"coordinate": float("nan")})


def _chiral_molecule(
    chirality: str | None = None,
    wedge: str | None = None,
    ez: str | None = None,
) -> dict:
    center: dict = {"id": "c1", "symbol": "C", "x": 0, "y": 0, "z": 0}
    if chirality is not None:
        center["chirality"] = chirality
    wedge_bond: dict = {"id": "b1", "atomId1": "c1", "atomId2": "n1", "order": 1}
    if wedge is not None:
        wedge_bond["wedge"] = wedge
    ez_bond: dict = {"id": "b5", "atomId1": "c2", "atomId2": "c3", "order": 2}
    if ez is not None:
        ez_bond["ez"] = ez
    return {
        "name": "chiral",
        "atoms": [
            center,
            {"id": "n1", "symbol": "N", "x": 1, "y": 0, "z": 0},
            {"id": "o1", "symbol": "O", "x": 0, "y": 1, "z": 0},
            {"id": "h1", "symbol": "H", "x": 0, "y": 0, "z": 1},
            {"id": "c2", "symbol": "C", "x": -1, "y": 0, "z": 0},
            {"id": "c3", "symbol": "C", "x": -2.3, "y": 0, "z": 0},
        ],
        "bonds": [
            wedge_bond,
            {"id": "b2", "atomId1": "c1", "atomId2": "o1", "order": 1},
            {"id": "b3", "atomId1": "c1", "atomId2": "h1", "order": 1},
            {"id": "b4", "atomId1": "c1", "atomId2": "c2", "order": 1},
            ez_bond,
        ],
    }


def test_content_hash_distinguishes_stereo_chemistry() -> None:
    assert molecule_content_hash(_chiral_molecule(chirality="R")) != (
        molecule_content_hash(_chiral_molecule(chirality="S"))
    )
    assert molecule_content_hash(_chiral_molecule()) != (
        molecule_content_hash(_chiral_molecule(chirality="R"))
    )
    assert molecule_content_hash(_chiral_molecule(wedge="up")) != (
        molecule_content_hash(_chiral_molecule(wedge="down"))
    )
    assert molecule_content_hash(_chiral_molecule(ez="E")) != (
        molecule_content_hash(_chiral_molecule(ez="Z"))
    )


def test_topology_fingerprint_ignores_stereo_chemistry() -> None:
    plain = molecule_topology_fingerprint(_chiral_molecule())
    assert molecule_topology_fingerprint(_chiral_molecule(chirality="R")) == plain
    assert molecule_topology_fingerprint(_chiral_molecule(chirality="S")) == plain
    assert molecule_topology_fingerprint(_chiral_molecule(wedge="up")) == plain
    assert molecule_topology_fingerprint(_chiral_molecule(wedge="down")) == plain
    assert molecule_topology_fingerprint(_chiral_molecule(ez="E")) == plain
    assert molecule_topology_fingerprint(_chiral_molecule(ez="Z")) == plain
    changed = _chiral_molecule()
    changed["bonds"][1]["order"] = 2
    assert molecule_topology_fingerprint(changed) != plain
