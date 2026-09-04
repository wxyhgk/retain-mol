from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from rdkit import Chem
from rdkit.Geometry import Point3D

from tools.ai_modeling_loop.chemistry import write_sdf, write_xyz
from tools.ai_modeling_loop.coordinate_semantics import (
    CoordinateSemanticError,
    verify_xtb_coordinate_chain,
)


def _molecule(*, swap_fluorines: bool = False) -> Chem.Mol:
    editable = Chem.RWMol()
    for symbol in ("B", "F", "F", "C", "N"):
        editable.AddAtom(Chem.Atom(symbol))
    editable.AddBond(0, 1, Chem.BondType.SINGLE)
    editable.AddBond(0, 2, Chem.BondType.SINGLE)
    editable.AddBond(0, 3, Chem.BondType.SINGLE)
    editable.AddBond(3, 4, Chem.BondType.SINGLE)
    molecule = editable.GetMol()
    coordinates = [
        (0.0, 0.0, 0.0),
        (1.3, 0.0, 0.0),
        (-1.3, 0.0, 0.0),
        (0.0, 1.4, 0.0),
        (0.0, 1.4, 1.3),
    ]
    if swap_fluorines:
        coordinates[1], coordinates[2] = coordinates[2], coordinates[1]
    conformer = Chem.Conformer(len(coordinates))
    for index, position in enumerate(coordinates):
        conformer.SetAtomPosition(index, Point3D(*position))
    molecule.AddConformer(conformer)
    return molecule


class CoordinateSemanticsTests(unittest.TestCase):
    def test_same_element_rows_remain_in_their_identity_regions(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = _molecule()
            write_sdf(source, root / "source.sdf")
            write_xyz(source, root / "input.xyz")
            write_xyz(source, root / "output.xyz")
            write_sdf(source, root / "final.sdf")

            verify_xtb_coordinate_chain(
                source_sdf_path=root / "source.sdf",
                input_xyz_path=root / "input.xyz",
                output_xyz_path=root / "output.xyz",
                final_sdf_path=root / "final.sdf",
                fixed_atom_rows=(1, 4, 5),
            )

    def test_same_element_coordinate_exchange_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = _molecule()
            swapped = _molecule(swap_fluorines=True)
            write_sdf(source, root / "source.sdf")
            write_xyz(source, root / "input.xyz")
            write_xyz(swapped, root / "output.xyz")
            write_sdf(swapped, root / "final.sdf")

            with self.assertRaisesRegex(
                CoordinateSemanticError,
                "cannot prove stable same-element identity",
            ):
                verify_xtb_coordinate_chain(
                    source_sdf_path=root / "source.sdf",
                    input_xyz_path=root / "input.xyz",
                    output_xyz_path=root / "output.xyz",
                    final_sdf_path=root / "final.sdf",
                    fixed_atom_rows=(1, 4, 5),
                )

    def test_repeated_elements_without_a_stable_frame_are_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = _molecule()
            write_sdf(source, root / "source.sdf")
            write_xyz(source, root / "input.xyz")
            write_xyz(source, root / "output.xyz")
            write_sdf(source, root / "final.sdf")

            with self.assertRaisesRegex(
                CoordinateSemanticError,
                "at least three fixed atom rows",
            ):
                verify_xtb_coordinate_chain(
                    source_sdf_path=root / "source.sdf",
                    input_xyz_path=root / "input.xyz",
                    output_xyz_path=root / "output.xyz",
                    final_sdf_path=root / "final.sdf",
                    fixed_atom_rows=(),
                )


if __name__ == "__main__":
    unittest.main()
