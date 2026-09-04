from __future__ import annotations

import copy
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping

from rdkit import Chem

from .artifact_contracts import (
    ArtifactContractError,
    CoordinateTransportReceipt,
    IdentityMap,
    ensure_identity_matches_snapshot,
    load_builder_snapshot,
    load_coordinate_transport_receipt,
    load_identity_map,
    sha256_file,
    sha256_json,
)
from .formal_verdict import VerificationStatus


# Keep the first formally supported chemistry domain intentionally narrow.  The
# bridge must say "indeterminate" when semantics have not been modeled yet.
FORMALLY_SUPPORTED_ELEMENTS = frozenset({"H", "B", "C", "N", "O", "F"})


@dataclass(frozen=True)
class ArtifactBridgeResult:
    status: VerificationStatus
    code: str
    final_snapshot: Mapping[str, Any] | None
    witness: Mapping[str, Any]

    def to_json(self) -> dict[str, Any]:
        return {
            "status": self.status.value,
            "code": self.code,
            "finalSnapshotSha256": (
                sha256_json(self.final_snapshot) if self.final_snapshot is not None else None
            ),
            "witness": dict(self.witness),
        }


def _require_single_sdf_record(path: Path) -> None:
    text = path.read_text(encoding="utf-8", errors="strict")
    records = [item for item in text.split("$$$$") if item.strip()]
    if len(records) != 1 or text.count("$$$$") != 1:
        raise ArtifactContractError("final SDF must contain exactly one terminated record")


def _load_single_sdf(path: Path) -> Chem.Mol:
    _require_single_sdf_record(path)
    # Do not let RDKit aromatize an explicit Kekule graph during transport.
    # The authoritative graph is the builder snapshot and is compared to the
    # literal CTAB bond orders below.
    supplier = Chem.SDMolSupplier(str(path), removeHs=False, sanitize=False, strictParsing=True)
    molecules = [molecule for molecule in supplier if molecule is not None]
    if len(molecules) != 1:
        raise ArtifactContractError("RDKit did not parse exactly one final SDF molecule")
    molecule = molecules[0]
    if molecule.GetNumConformers() != 1:
        raise ArtifactContractError("final SDF must contain exactly one conformer")
    return molecule


def _rdkit_graph(molecule: Chem.Mol, identity: IdentityMap) -> dict[tuple[str, str], float]:
    row_to_atom_id = {row.row_index - 1: row.atom_id for row in identity.atom_rows}
    graph: dict[tuple[str, str], float] = {}
    for bond in molecule.GetBonds():
        atom1 = row_to_atom_id[bond.GetBeginAtomIdx()]
        atom2 = row_to_atom_id[bond.GetEndAtomIdx()]
        key = tuple(sorted((atom1, atom2)))
        if key in graph:
            raise ArtifactContractError(f"duplicate final SDF bond endpoints: {key}")
        graph[key] = float(bond.GetBondTypeAsDouble())
    return graph


def _snapshot_graph(snapshot: Mapping[str, Any]) -> dict[tuple[str, str], float]:
    return {
        tuple(sorted((bond["atomId1"], bond["atomId2"]))): float(bond["order"])
        for bond in snapshot["molecule"]["bonds"]
    }


def _sdf_positions(molecule: Chem.Mol) -> tuple[tuple[float, float, float], ...]:
    conformer = molecule.GetConformer()
    return tuple(
        (
            float(conformer.GetAtomPosition(index).x),
            float(conformer.GetAtomPosition(index).y),
            float(conformer.GetAtomPosition(index).z),
        )
        for index in range(molecule.GetNumAtoms())
    )


def _snapshot_positions(snapshot: Mapping[str, Any]) -> tuple[tuple[float, float, float], ...]:
    return tuple(
        tuple(float(value) for value in atom["position"])
        for atom in snapshot["molecule"]["atoms"]
    )


def _has_ambiguous_symbols(identity: IdentityMap) -> bool:
    symbols = [row.symbol for row in identity.atom_rows]
    return len(symbols) != len(set(symbols))


def _validate_coordinate_transport_receipt(
    receipt: CoordinateTransportReceipt,
    *,
    builder_snapshot_path: Path,
    identity_map_path: Path,
    final_sdf_path: Path,
    identity: IdentityMap,
    sdf_positions: tuple[tuple[float, float, float], ...],
) -> None:
    if receipt.builder_snapshot_sha256 != sha256_file(builder_snapshot_path):
        raise ArtifactContractError("coordinate transport builder snapshot hash mismatch")
    if receipt.identity_map_sha256 != sha256_file(identity_map_path):
        raise ArtifactContractError("coordinate transport identity map hash mismatch")
    if receipt.final_sdf_sha256 != sha256_file(final_sdf_path):
        raise ArtifactContractError("coordinate transport final SDF hash mismatch")
    expected_rows = [
        (row.row_index, row.atom_id, row.symbol)
        for row in identity.atom_rows
    ]
    actual_rows = [
        (row.row_index, row.atom_id, row.symbol)
        for row in receipt.atom_rows
    ]
    if actual_rows != expected_rows:
        raise ArtifactContractError("coordinate transport atom rows do not match identity map")
    receipt_positions = tuple(row.position for row in receipt.atom_rows)
    if receipt_positions != sdf_positions:
        raise ArtifactContractError("coordinate transport positions do not match decoded final SDF")


def _eligibility_issues(snapshot: Mapping[str, Any], molecule: Chem.Mol) -> list[str]:
    issues: list[str] = []
    for atom in snapshot["molecule"]["atoms"]:
        if atom["symbol"] not in FORMALLY_SUPPORTED_ELEMENTS:
            issues.append(f"unsupported-element:{atom['symbol']}")
        if atom["formalCharge"] != 0:
            issues.append(f"formal-charge:{atom['atomId']}")
        if atom["radicalElectrons"] != 0:
            issues.append(f"radical:{atom['atomId']}")
        if any(key in atom for key in (
            "coordinationGeometry",
            "coordinationDirections",
            "coordinationSites",
            "coordinationNumber",
        )):
            issues.append(f"coordination:{atom['atomId']}")
    for bond in snapshot["molecule"]["bonds"]:
        if bond["aromatic"]:
            issues.append(f"aromatic-bond-flag:{bond['bondId']}")
        if "coordinationSites" in bond:
            issues.append(f"coordination-bond:{bond['bondId']}")
    for atom in molecule.GetAtoms():
        if atom.GetIsotope() != 0:
            issues.append(f"isotope-row:{atom.GetIdx() + 1}")
        if atom.GetChiralTag() != Chem.ChiralType.CHI_UNSPECIFIED:
            issues.append(f"stereo-atom-row:{atom.GetIdx() + 1}")
        if atom.GetFormalCharge() != 0 or atom.GetNumRadicalElectrons() != 0:
            issues.append(f"sdf-electronic-state-row:{atom.GetIdx() + 1}")
    for bond in molecule.GetBonds():
        if bond.GetIsAromatic() or bond.GetBondType() == Chem.BondType.AROMATIC:
            issues.append(f"aromatic-sdf-bond:{bond.GetIdx() + 1}")
        if bond.GetStereo() != Chem.BondStereo.STEREONONE:
            issues.append(f"stereo-bond-row:{bond.GetIdx() + 1}")
    if len(Chem.GetMolFrags(molecule)) != 1:
        issues.append("disconnected-molecule")
    if molecule.GetNumBonds() == 0:
        issues.append("no-bond-geometry-policy")
    return sorted(set(issues))


def bridge_final_sdf(
    *,
    builder_snapshot_path: Path,
    identity_map_path: Path,
    final_sdf_path: Path,
    output_snapshot_path: Path | None = None,
    coordinate_transport_receipt_path: Path | None = None,
) -> ArtifactBridgeResult:
    """Reattach stable IDs to transported coordinates without trusting SDF rows.

    Graph/electronic data come exclusively from the authoritative builder
    snapshot. Repeated element symbols require either unchanged builder
    coordinates or a hash-bound stable-atom coordinate transport receipt.
    """
    try:
        if output_snapshot_path is not None:
            output_snapshot_path.unlink(missing_ok=True)
        snapshot = load_builder_snapshot(builder_snapshot_path)
        identity = load_identity_map(identity_map_path)
        ensure_identity_matches_snapshot(identity, snapshot)
        molecule = _load_single_sdf(final_sdf_path)
        atoms = snapshot["molecule"]["atoms"]
        if molecule.GetNumAtoms() != len(atoms):
            raise ArtifactContractError(
                f"final SDF atom count {molecule.GetNumAtoms()} != snapshot {len(atoms)}"
            )
        for index, row in enumerate(identity.atom_rows):
            symbol = molecule.GetAtomWithIdx(index).GetSymbol()
            if symbol != row.symbol:
                raise ArtifactContractError(
                    f"final SDF symbol mismatch at row {index + 1}: {symbol} != {row.symbol}"
                )
        if _rdkit_graph(molecule, identity) != _snapshot_graph(snapshot):
            raise ArtifactContractError("final SDF changed graph endpoints or bond orders")

        sdf_positions = _sdf_positions(molecule)
        proof_mode = "unique-symbol-row-identity"
        coordinate_receipt_sha256: str | None = None
        if _has_ambiguous_symbols(identity):
            if coordinate_transport_receipt_path is not None:
                receipt = load_coordinate_transport_receipt(coordinate_transport_receipt_path)
                _validate_coordinate_transport_receipt(
                    receipt,
                    builder_snapshot_path=builder_snapshot_path,
                    identity_map_path=identity_map_path,
                    final_sdf_path=final_sdf_path,
                    identity=identity,
                    sdf_positions=sdf_positions,
                )
                proof_mode = "stable-atom-coordinate-transport-receipt"
                coordinate_receipt_sha256 = sha256_file(coordinate_transport_receipt_path)
            elif sdf_positions == _snapshot_positions(snapshot):
                proof_mode = "direct-builder-coordinate-match"
            else:
                return ArtifactBridgeResult(
                    VerificationStatus.INDETERMINATE,
                    "stable-atom-coordinate-proof-missing",
                    None,
                    {
                        "builderSnapshotSha256": sha256_file(builder_snapshot_path),
                        "identityMapSha256": sha256_file(identity_map_path),
                        "finalSdfSha256": sha256_file(final_sdf_path),
                        "ambiguousSymbols": sorted({
                            row.symbol
                            for row in identity.atom_rows
                            if sum(item.symbol == row.symbol for item in identity.atom_rows) > 1
                        }),
                    },
                )

        final_snapshot = copy.deepcopy(snapshot)
        for index, atom in enumerate(final_snapshot["molecule"]["atoms"]):
            atom["position"] = list(sdf_positions[index])

        issues = _eligibility_issues(snapshot, molecule)
        if output_snapshot_path is not None:
            output_snapshot_path.parent.mkdir(parents=True, exist_ok=True)
            output_snapshot_path.write_text(
                json.dumps(final_snapshot, ensure_ascii=False, sort_keys=True, indent=2) + "\n",
                encoding="utf-8",
            )
        witness = {
            "builderSnapshotSha256": sha256_file(builder_snapshot_path),
            "identityMapSha256": sha256_file(identity_map_path),
            "finalSdfSha256": sha256_file(final_sdf_path),
            "atomCount": molecule.GetNumAtoms(),
            "bondCount": molecule.GetNumBonds(),
            "eligibilityIssues": issues,
            "coordinateIdentityProof": proof_mode,
            "coordinateTransportReceiptSha256": coordinate_receipt_sha256,
        }
        if issues:
            return ArtifactBridgeResult(
                VerificationStatus.INDETERMINATE,
                "unsupported-chemistry-semantics",
                final_snapshot,
                witness,
            )
        return ArtifactBridgeResult(
            VerificationStatus.PASS,
            "identity-and-graph-preserved",
            final_snapshot,
            witness,
        )
    except (ArtifactContractError, OSError, ValueError) as error:
        return ArtifactBridgeResult(
            VerificationStatus.REJECT,
            "artifact-contract-violation",
            None,
            {"error": f"{type(error).__name__}: {error}"},
        )
