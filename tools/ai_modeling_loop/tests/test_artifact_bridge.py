from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from rdkit import Chem
from rdkit.Geometry import Point3D

from tools.ai_modeling_loop.artifact_bridge import bridge_final_sdf
from tools.ai_modeling_loop.artifact_contracts import (
    ArtifactContractError,
    coordinate_transport_atom_row_mapping_sha256,
    CoordinateTransportAtomRow,
    load_identity_map,
    sha256_file,
)
from tools.ai_modeling_loop.chemistry import write_sdf
from tools.ai_modeling_loop.formal_verdict import VerificationStatus


class ArtifactBridgeTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.snapshot = self.root / "builder-snapshot.json"
        self.identity = self.root / "identity-map.json"
        self.sdf = self.root / "candidate.sdf"
        self.output = self.root / "final-snapshot.json"
        self.coordinate_receipt = self.root / "coordinate-transport.json"

        self.snapshot.write_text(json.dumps({
            "schemaVersion": 1,
            "coordinateSpace": "angstrom",
            "molecule": {
                "name": "CO",
                "atoms": [
                    {
                        "atomId": "C:1",
                        "symbol": "C",
                        "position": [0.0, 0.0, 0.0],
                        "formalCharge": 0,
                        "radicalElectrons": 0,
                    },
                    {
                        "atomId": "O:1",
                        "symbol": "O",
                        "position": [1.2, 0.0, 0.0],
                        "formalCharge": 0,
                        "radicalElectrons": 0,
                    },
                ],
                "bonds": [{
                    "bondId": "bond:1",
                    "atomId1": "C:1",
                    "atomId2": "O:1",
                    "order": 2,
                    "aromatic": False,
                }],
            },
        }))
        self.identity.write_text(json.dumps({
            "schemaVersion": 1,
            "atomRows": [
                {"rowIndex": 1, "atomId": "C:1", "symbol": "C"},
                {"rowIndex": 2, "atomId": "O:1", "symbol": "O"},
            ],
            "bondRows": [{
                "rowIndex": 1,
                "bondId": "bond:1",
                "atomId1": "C:1",
                "atomId2": "O:1",
                "order": 2,
            }],
        }))
        editable = Chem.RWMol()
        editable.AddAtom(Chem.Atom("C"))
        editable.AddAtom(Chem.Atom("O"))
        editable.AddBond(0, 1, Chem.BondType.DOUBLE)
        molecule = editable.GetMol()
        conformer = Chem.Conformer(2)
        conformer.SetAtomPosition(0, Point3D(2.0, 3.0, 4.0))
        conformer.SetAtomPosition(1, Point3D(3.2, 3.0, 4.0))
        molecule.AddConformer(conformer)
        write_sdf(molecule, self.sdf)

    def tearDown(self) -> None:
        self.temp.cleanup()

    def test_only_coordinates_cross_the_sdf_bridge(self) -> None:
        result = bridge_final_sdf(
            builder_snapshot_path=self.snapshot,
            identity_map_path=self.identity,
            final_sdf_path=self.sdf,
            output_snapshot_path=self.output,
        )
        self.assertEqual(result.status, VerificationStatus.PASS)
        self.assertTrue(self.output.exists())
        final = json.loads(self.output.read_text())
        self.assertEqual(final["molecule"]["atoms"][0]["atomId"], "C:1")
        self.assertEqual(final["molecule"]["atoms"][0]["position"], [2.0, 3.0, 4.0])
        self.assertEqual(final["molecule"]["bonds"][0]["bondId"], "bond:1")

    def test_symbol_row_swap_is_rejected_even_for_valid_sdf(self) -> None:
        identity = json.loads(self.identity.read_text())
        identity["atomRows"][0]["symbol"] = "O"
        identity["atomRows"][1]["symbol"] = "C"
        self.identity.write_text(json.dumps(identity))
        result = bridge_final_sdf(
            builder_snapshot_path=self.snapshot,
            identity_map_path=self.identity,
            final_sdf_path=self.sdf,
        )
        self.assertEqual(result.status, VerificationStatus.REJECT)

    def test_graph_change_is_rejected(self) -> None:
        supplier = Chem.SDMolSupplier(str(self.sdf), removeHs=False)
        molecule = Chem.RWMol(supplier[0])
        molecule.RemoveBond(0, 1)
        write_sdf(molecule.GetMol(), self.sdf)
        result = bridge_final_sdf(
            builder_snapshot_path=self.snapshot,
            identity_map_path=self.identity,
            final_sdf_path=self.sdf,
        )
        self.assertEqual(result.status, VerificationStatus.REJECT)

    def test_multiple_sdf_records_are_rejected(self) -> None:
        self.sdf.write_text(self.sdf.read_text() + self.sdf.read_text())
        result = bridge_final_sdf(
            builder_snapshot_path=self.snapshot,
            identity_map_path=self.identity,
            final_sdf_path=self.sdf,
        )
        self.assertEqual(result.status, VerificationStatus.REJECT)

    def test_identity_rows_must_be_contiguous(self) -> None:
        payload = json.loads(self.identity.read_text())
        payload["atomRows"][1]["rowIndex"] = 3
        self.identity.write_text(json.dumps(payload))
        with self.assertRaises(ArtifactContractError):
            load_identity_map(self.identity)

    def test_unsupported_element_is_indeterminate_not_pass(self) -> None:
        snapshot = json.loads(self.snapshot.read_text())
        snapshot["molecule"]["atoms"][0]["symbol"] = "Fe"
        self.snapshot.write_text(json.dumps(snapshot))
        identity = json.loads(self.identity.read_text())
        identity["atomRows"][0]["symbol"] = "Fe"
        self.identity.write_text(json.dumps(identity))
        editable = Chem.RWMol()
        editable.AddAtom(Chem.Atom("Fe"))
        editable.AddAtom(Chem.Atom("O"))
        editable.AddBond(0, 1, Chem.BondType.DOUBLE)
        molecule = editable.GetMol()
        conformer = Chem.Conformer(2)
        conformer.SetAtomPosition(0, Point3D(0, 0, 0))
        conformer.SetAtomPosition(1, Point3D(1.6, 0, 0))
        molecule.AddConformer(conformer)
        write_sdf(molecule, self.sdf)
        result = bridge_final_sdf(
            builder_snapshot_path=self.snapshot,
            identity_map_path=self.identity,
            final_sdf_path=self.sdf,
        )
        self.assertEqual(result.status, VerificationStatus.INDETERMINATE)

    def _write_same_element_artifacts(self, *, swap_coordinates: bool) -> None:
        snapshot = {
            "schemaVersion": 1,
            "coordinateSpace": "angstrom",
            "molecule": {
                "name": "C2H2",
                "atoms": [
                    {"atomId": "C:left", "symbol": "C", "position": [-0.6, 0, 0], "formalCharge": 0, "radicalElectrons": 0},
                    {"atomId": "C:right", "symbol": "C", "position": [0.6, 0, 0], "formalCharge": 0, "radicalElectrons": 0},
                    {"atomId": "H:left", "symbol": "H", "position": [-1.6, 0, 0], "formalCharge": 0, "radicalElectrons": 0},
                    {"atomId": "H:right", "symbol": "H", "position": [1.6, 0, 0], "formalCharge": 0, "radicalElectrons": 0},
                ],
                "bonds": [
                    {"bondId": "CC", "atomId1": "C:left", "atomId2": "C:right", "order": 3, "aromatic": False},
                    {"bondId": "CH:left", "atomId1": "C:left", "atomId2": "H:left", "order": 1, "aromatic": False},
                    {"bondId": "CH:right", "atomId1": "C:right", "atomId2": "H:right", "order": 1, "aromatic": False},
                ],
            },
        }
        self.snapshot.write_text(json.dumps(snapshot))
        self.identity.write_text(json.dumps({
            "schemaVersion": 1,
            "atomRows": [
                {"rowIndex": 1, "atomId": "C:left", "symbol": "C"},
                {"rowIndex": 2, "atomId": "C:right", "symbol": "C"},
                {"rowIndex": 3, "atomId": "H:left", "symbol": "H"},
                {"rowIndex": 4, "atomId": "H:right", "symbol": "H"},
            ],
            "bondRows": [
                {"rowIndex": 1, "bondId": "CC", "atomId1": "C:left", "atomId2": "C:right", "order": 3},
                {"rowIndex": 2, "bondId": "CH:left", "atomId1": "C:left", "atomId2": "H:left", "order": 1},
                {"rowIndex": 3, "bondId": "CH:right", "atomId1": "C:right", "atomId2": "H:right", "order": 1},
            ],
        }))
        editable = Chem.RWMol()
        for symbol in ("C", "C", "H", "H"):
            editable.AddAtom(Chem.Atom(symbol))
        editable.AddBond(0, 1, Chem.BondType.TRIPLE)
        editable.AddBond(0, 2, Chem.BondType.SINGLE)
        editable.AddBond(1, 3, Chem.BondType.SINGLE)
        molecule = editable.GetMol()
        coordinates = [atom["position"] for atom in snapshot["molecule"]["atoms"]]
        if swap_coordinates:
            coordinates[0], coordinates[1] = coordinates[1], coordinates[0]
            coordinates[2], coordinates[3] = coordinates[3], coordinates[2]
        conformer = Chem.Conformer(4)
        for index, position in enumerate(coordinates):
            conformer.SetAtomPosition(index, Point3D(*position))
        molecule.AddConformer(conformer)
        write_sdf(molecule, self.sdf)

    def _write_coordinate_receipt(self, atom_rows: list[CoordinateTransportAtomRow]) -> None:
        self.coordinate_receipt.write_text(json.dumps({
            "schemaVersion": 1,
            "kind": "stable-atom-coordinate-transport",
            "builderSnapshotSha256": sha256_file(self.snapshot),
            "identityMapSha256": sha256_file(self.identity),
            "finalSdfSha256": sha256_file(self.sdf),
            "atomRowMappingSha256": coordinate_transport_atom_row_mapping_sha256(atom_rows),
            "atomRows": [
                {
                    "rowIndex": row.row_index,
                    "atomId": row.atom_id,
                    "symbol": row.symbol,
                    "position": list(row.position),
                }
                for row in atom_rows
            ],
        }))

    def test_same_element_coordinate_swap_without_receipt_is_indeterminate(self) -> None:
        self._write_same_element_artifacts(swap_coordinates=True)
        self.output.write_text("stale snapshot")
        result = bridge_final_sdf(
            builder_snapshot_path=self.snapshot,
            identity_map_path=self.identity,
            final_sdf_path=self.sdf,
            output_snapshot_path=self.output,
        )
        self.assertEqual(result.status, VerificationStatus.INDETERMINATE)
        self.assertEqual(result.code, "stable-atom-coordinate-proof-missing")
        self.assertIsNone(result.final_snapshot)
        self.assertFalse(self.output.exists())

    def test_same_element_coordinate_swap_with_stale_row_receipt_is_rejected(self) -> None:
        self._write_same_element_artifacts(swap_coordinates=True)
        self._write_coordinate_receipt([
            CoordinateTransportAtomRow(1, "C:left", "C", (-0.6, 0.0, 0.0)),
            CoordinateTransportAtomRow(2, "C:right", "C", (0.6, 0.0, 0.0)),
            CoordinateTransportAtomRow(3, "H:left", "H", (-1.6, 0.0, 0.0)),
            CoordinateTransportAtomRow(4, "H:right", "H", (1.6, 0.0, 0.0)),
        ])
        result = bridge_final_sdf(
            builder_snapshot_path=self.snapshot,
            identity_map_path=self.identity,
            final_sdf_path=self.sdf,
            coordinate_transport_receipt_path=self.coordinate_receipt,
        )
        self.assertEqual(result.status, VerificationStatus.REJECT)
        self.assertEqual(result.code, "artifact-contract-violation")
        self.assertIn("positions do not match", result.witness["error"])

    def test_same_element_output_row_mapping_swap_is_rejected(self) -> None:
        self._write_same_element_artifacts(swap_coordinates=True)
        self._write_coordinate_receipt([
            CoordinateTransportAtomRow(1, "C:right", "C", (0.6, 0.0, 0.0)),
            CoordinateTransportAtomRow(2, "C:left", "C", (-0.6, 0.0, 0.0)),
            CoordinateTransportAtomRow(3, "H:right", "H", (1.6, 0.0, 0.0)),
            CoordinateTransportAtomRow(4, "H:left", "H", (-1.6, 0.0, 0.0)),
        ])
        result = bridge_final_sdf(
            builder_snapshot_path=self.snapshot,
            identity_map_path=self.identity,
            final_sdf_path=self.sdf,
            coordinate_transport_receipt_path=self.coordinate_receipt,
        )
        self.assertEqual(result.status, VerificationStatus.REJECT)
        self.assertEqual(result.code, "artifact-contract-violation")
        self.assertIn("atom rows do not match identity map", result.witness["error"])

    def test_same_element_refinement_with_bound_coordinate_receipt_passes(self) -> None:
        self._write_same_element_artifacts(swap_coordinates=True)
        self._write_coordinate_receipt([
            CoordinateTransportAtomRow(1, "C:left", "C", (0.6, 0.0, 0.0)),
            CoordinateTransportAtomRow(2, "C:right", "C", (-0.6, 0.0, 0.0)),
            CoordinateTransportAtomRow(3, "H:left", "H", (1.6, 0.0, 0.0)),
            CoordinateTransportAtomRow(4, "H:right", "H", (-1.6, 0.0, 0.0)),
        ])
        result = bridge_final_sdf(
            builder_snapshot_path=self.snapshot,
            identity_map_path=self.identity,
            final_sdf_path=self.sdf,
            coordinate_transport_receipt_path=self.coordinate_receipt,
        )
        self.assertEqual(result.status, VerificationStatus.PASS)
        self.assertEqual(
            result.witness["coordinateIdentityProof"],
            "stable-atom-coordinate-transport-receipt",
        )

    def test_same_element_direct_builder_coordinates_pass_without_receipt(self) -> None:
        self._write_same_element_artifacts(swap_coordinates=False)
        result = bridge_final_sdf(
            builder_snapshot_path=self.snapshot,
            identity_map_path=self.identity,
            final_sdf_path=self.sdf,
        )
        self.assertEqual(result.status, VerificationStatus.PASS)
        self.assertEqual(
            result.witness["coordinateIdentityProof"],
            "direct-builder-coordinate-match",
        )


if __name__ == "__main__":
    unittest.main()
