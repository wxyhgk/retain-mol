from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from rdkit import Chem

from tools.ai_modeling_loop.chemistry import (
    XtbResult,
    _xcontrol,
    embed_candidate_distance_geometry,
    embed_distance_geometry,
    optimize_with_xtb,
    project_to_fixed_frame,
    with_explicit_hydrogens,
    write_sdf,
)
from tools.ai_modeling_loop.contracts import list_cases, load_case
from tools.ai_modeling_loop.evaluator import evaluate_candidate
from tools.ai_modeling_loop.runner import (
    _refine_conformer_ensemble,
    _refine_with_xtb_fallback,
    record_run,
)
from tools.ai_modeling_loop.workspace import prepare_task_bundle


class LoopContractsTest(unittest.TestCase):
    def _write_reference_bundle(self, molecule: Chem.Mol, directory: Path) -> None:
        directory.mkdir(parents=True, exist_ok=True)
        write_sdf(molecule, directory / "reference.sdf")

    def _write_plan(self, root: Path, case_id: str) -> Path:
        plan = root / "edit-plan.json"
        plan.write_text(json.dumps({
            "schemaVersion": 1,
            "planId": "test-plan",
            "source": "ai",
            "targetObjectId": f"benchmark:{case_id}",
            "commands": [],
        }))
        return plan

    def _successful_executor(self, case, candidate_source: Path):
        def execute(*, initial, edit_plan, candidate, metadata, receipt):
            del initial, edit_plan
            candidate.write_bytes(candidate_source.read_bytes())
            metadata.write_text(json.dumps({
                "builder": "retainmol-edit-plan",
                "anchorAtomIndices": {
                    anchor.anchor_id: anchor.atom_index for anchor in case.anchors
                },
            }))
            receipt.write_text(json.dumps({"status": "completed"}))
            return subprocess.CompletedProcess(["node"], 0, "", "")
        return execute

    def test_manifests_and_anchor_indices_are_valid(self) -> None:
        for case in list_cases():
            molecule = Chem.SDMolSupplier(str(case.reference_sdf), removeHs=False)[0]
            self.assertIsNotNone(molecule)
            for anchor in case.anchors:
                self.assertEqual(molecule.GetAtomWithIdx(anchor.atom_index - 1).GetSymbol(), anchor.symbol)

    def test_task_bundle_does_not_publish_hidden_reference(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            task = prepare_task_bundle(load_case("GDG1223"), Path(directory))
            names = {path.name for path in task.iterdir()}
            self.assertEqual(
                names,
                {"README.md", "initial-molecule.json", "protocol.json", "target.png", "task.json"},
            )
            payload = (task / "task.json").read_text()
            self.assertNotIn("referenceAtomIndex", payload)
            self.assertNotIn("hiddenReference", payload)
            self.assertEqual(
                set(json.loads(payload)["requiredOutputs"]),
                {"editPlan", "notes"},
            )
            protocol = json.loads((task / "protocol.json").read_text())
            self.assertEqual(protocol["plan"]["commandCount"], [1, 512])
            self.assertIn("fragment.bridge", protocol["commands"])
            self.assertIn("geometry.rotateGroup", protocol["commands"])

    def test_distance_geometry_keeps_anchor_frame(self) -> None:
        case = load_case("GDG1476")
        molecule = embed_distance_geometry(case, 17)
        conformer = molecule.GetConformer()
        for anchor in case.anchors:
            point = conformer.GetAtomPosition(anchor.atom_index - 1)
            self.assertAlmostEqual(point.x, anchor.position.x, places=6)
            self.assertAlmostEqual(point.y, anchor.position.y, places=6)
            self.assertAlmostEqual(point.z, anchor.position.z, places=6)

    def test_candidate_distance_geometry_keeps_public_anchor_frame(self) -> None:
        case = load_case("GDG1476")
        molecule = Chem.SDMolSupplier(str(case.reference_sdf), removeHs=False)[0]
        embedded = embed_candidate_distance_geometry(
            molecule,
            fixed_atom_indices=(anchor.atom_index for anchor in case.anchors),
            seed=19,
        )
        for anchor in case.anchors:
            expected = molecule.GetConformer().GetAtomPosition(anchor.atom_index - 1)
            actual = embedded.GetConformer().GetAtomPosition(anchor.atom_index - 1)
            self.assertAlmostEqual(actual.x, expected.x, places=9)
            self.assertAlmostEqual(actual.y, expected.y, places=9)
            self.assertAlmostEqual(actual.z, expected.z, places=9)

    def test_xcontrol_uses_one_based_sorted_indices(self) -> None:
        self.assertEqual(_xcontrol([9, 2, 9]), "$fix\n  atoms: 2,9\n$end\n")

    def test_fixed_frame_projection_restores_exact_anchor_coordinates(self) -> None:
        case = load_case("GDG1476")
        reference = embed_distance_geometry(case, 41)
        moved = Chem.Mol(reference)
        conformer = moved.GetConformer()
        for index in range(moved.GetNumAtoms()):
            point = conformer.GetAtomPosition(index)
            conformer.SetAtomPosition(index, (point.x + 4.0, point.y - 2.0, point.z + 1.0))
        projected, _ = project_to_fixed_frame(
            moved, reference, (anchor.atom_index for anchor in case.anchors),
        )
        for anchor in case.anchors:
            expected = reference.GetConformer().GetAtomPosition(anchor.atom_index - 1)
            actual = projected.GetConformer().GetAtomPosition(anchor.atom_index - 1)
            self.assertAlmostEqual(actual.x, expected.x, places=9)
            self.assertAlmostEqual(actual.y, expected.y, places=9)
            self.assertAlmostEqual(actual.z, expected.z, places=9)

    def test_xtb_adapter_materializes_generator_before_writing_and_projection(self) -> None:
        case = load_case("GDG1476")
        molecule = embed_distance_geometry(case, 43)
        with tempfile.TemporaryDirectory() as directory:
            fake = Path(directory) / "fake-xtb"
            fake.write_text(
                f"#!{sys.executable}\n"
                "import pathlib, sys\n"
                "source = pathlib.Path(sys.argv[1]).read_text().splitlines()\n"
                "out = source[:2]\n"
                "for index, line in enumerate(source[2:]):\n"
                "    p = line.split()\n"
                "    out.append(f'{p[0]} {float(p[1])+4+index*0.001} {float(p[2])-2} {float(p[3])+1}')\n"
                "pathlib.Path('xtbopt.xyz').write_text('\\n'.join(out) + '\\n')\n"
                "print('TOTAL ENERGY -1.0 Eh')\n"
                "print('GEOMETRY OPTIMIZATION CONVERGED AFTER 1 ITERATIONS')\n"
            )
            os.chmod(fake, 0o755)
            result = optimize_with_xtb(
                molecule,
                charge=0,
                multiplicity=1,
                fixed_atom_indices=(anchor.atom_index for anchor in case.anchors),
                xtb=str(fake),
            )
            self.assertGreater(result.anchor_rmsd_before_projection, 0.0)
            for anchor in case.anchors:
                expected = molecule.GetConformer().GetAtomPosition(anchor.atom_index - 1)
                actual = result.molecule.GetConformer().GetAtomPosition(anchor.atom_index - 1)
                self.assertAlmostEqual(actual.x, expected.x, places=9)
                self.assertAlmostEqual(actual.y, expected.y, places=9)
                self.assertAlmostEqual(actual.z, expected.z, places=9)

    def test_evaluator_exact_match_passes_for_non_clashing_3d(self) -> None:
        case = load_case("GDG1476")
        molecule = embed_distance_geometry(case, 31)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            reference_dir = root / "references" / case.case_id
            self._write_reference_bundle(molecule, reference_dir)
            candidate = root / "candidate.sdf"
            write_sdf(molecule, candidate)
            metadata = root / "candidate.json"
            metadata.write_text(json.dumps({
                "anchorAtomIndices": {
                    anchor.anchor_id: anchor.atom_index for anchor in case.anchors
                }
            }))
            result = evaluate_candidate(case, candidate, candidate_metadata=metadata, work_dir=root)
            self.assertTrue(result.formula_match)
            self.assertTrue(result.topology_match)
            self.assertEqual(result.anchor_max_displacement, 0.0)
            self.assertEqual(result.heavy_atom_rmsd, 0.0)

    def test_evaluator_accepts_ordered_anchor_index_list(self) -> None:
        case = load_case("GDG1476")
        molecule = embed_distance_geometry(case, 37)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            reference_dir = root / "references" / case.case_id
            self._write_reference_bundle(molecule, reference_dir)
            candidate = root / "candidate.sdf"
            write_sdf(molecule, candidate)
            metadata = root / "candidate.json"
            metadata.write_text(json.dumps({
                "anchorAtomIndices": [anchor.atom_index for anchor in case.anchors]
            }))

            result = evaluate_candidate(case, candidate, candidate_metadata=metadata, work_dir=root)

            self.assertTrue(result.topology_match)
            self.assertEqual(result.anchor_max_displacement, 0.0)

    def test_evaluator_matches_implicit_candidate_to_explicit_reference(self) -> None:
        case = load_case("GDG1223")
        source = Chem.SDMolSupplier(str(case.reference_sdf), removeHs=False)[0]
        explicit = with_explicit_hydrogens(source)
        implicit = Chem.RemoveHs(explicit)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._write_reference_bundle(explicit, root / "references" / case.case_id)
            candidate = root / "candidate.sdf"
            write_sdf(implicit, candidate)
            metadata = root / "candidate.json"
            metadata.write_text(json.dumps({
                "anchorAtomIndices": {
                    anchor.anchor_id: sum(
                        explicit.GetAtomWithIdx(index).GetSymbol() != "H"
                        for index in range(anchor.atom_index)
                    )
                    for anchor in case.anchors
                }
            }))

            result = evaluate_candidate(case, candidate, candidate_metadata=metadata, work_dir=root)

            self.assertTrue(result.formula_match)
            self.assertTrue(result.topology_match)
            self.assertEqual(result.anchor_max_displacement, 0.0)

    def test_explicit_hydrogen_normalization_preserves_existing_atom_order(self) -> None:
        case = load_case("GDG1223")
        source = Chem.SDMolSupplier(str(case.reference_sdf), removeHs=False)[0]
        explicit = with_explicit_hydrogens(source)
        implicit = Chem.RemoveHs(explicit)

        normalized = with_explicit_hydrogens(implicit)

        self.assertEqual(normalized.GetNumAtoms(), explicit.GetNumAtoms())
        self.assertEqual(
            [
                normalized.GetAtomWithIdx(index).GetSymbol()
                for index in range(implicit.GetNumAtoms())
            ],
            [atom.GetSymbol() for atom in implicit.GetAtoms()],
        )

    def test_runner_records_invalid_candidate_instead_of_crashing(self) -> None:
        case = load_case("GDG1476")
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            reference_dir = root / "references" / case.case_id
            molecule = Chem.SDMolSupplier(str(case.reference_sdf), removeHs=False)[0]
            self._write_reference_bundle(molecule, reference_dir)
            plan = self._write_plan(root, case.case_id)

            def invalid_executor(*, initial, edit_plan, candidate, metadata, receipt):
                del initial, edit_plan, metadata
                candidate.write_text("not an sdf\n")
                receipt.write_text(json.dumps({"status": "completed"}))
                return subprocess.CompletedProcess(["node"], 0, "", "")

            with patch("tools.ai_modeling_loop.runner._execute_edit_plan", invalid_executor):
                run_dir, result = record_run(case, plan, work_dir=root)

            self.assertEqual(result.failures, ("candidate-invalid",))
            self.assertEqual(result.score, 0.0)
            self.assertTrue((run_dir / "run.json").exists())
            self.assertTrue((run_dir / "report.md").exists())

    def test_runner_records_raw_and_refined_evaluations(self) -> None:
        case = load_case("GDG1476")
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            reference_dir = root / "references" / case.case_id
            reference_molecule = Chem.SDMolSupplier(str(case.reference_sdf), removeHs=False)[0]
            self._write_reference_bundle(reference_molecule, reference_dir)
            plan = self._write_plan(root, case.case_id)
            molecule = Chem.SDMolSupplier(str(case.reference_sdf), removeHs=False)[0]
            fake_result = XtbResult(
                molecule=molecule,
                energy=-12.5,
                converged=True,
                return_code=0,
                log_tail="ok",
                anchor_rmsd_before_projection=0.02,
            )

            with patch(
                "tools.ai_modeling_loop.runner.optimize_with_xtb",
                return_value=fake_result,
            ) as optimize, patch(
                "tools.ai_modeling_loop.runner._execute_edit_plan",
                self._successful_executor(case, case.reference_sdf),
            ):
                run_dir, _ = record_run(
                    case,
                    plan,
                    work_dir=root,
                    refine=True,
                )

            record = json.loads((run_dir / "run.json").read_text())
            self.assertTrue((run_dir / "candidate.raw.sdf").exists())
            self.assertTrue((run_dir / "candidate.sdf").exists())
            self.assertEqual(record["refinement"]["status"], "completed")
            self.assertEqual(record["refinement"]["energyEh"], -12.5)
            fixed_indices = tuple(optimize.call_args.kwargs["fixed_atom_indices"])
            self.assertEqual(fixed_indices, tuple(anchor.atom_index for anchor in case.anchors))

    def test_refinement_falls_back_to_gfnff_and_hot_gfn2(self) -> None:
        case = load_case("GDG1476")
        molecule = Chem.SDMolSupplier(str(case.reference_sdf), removeHs=False)[0]
        pre_relaxed = XtbResult(molecule, -10.0, True, 0, "gfnff", 0.0)
        refined = XtbResult(molecule, -11.0, True, 0, "gfn2", 0.01)

        with patch(
            "tools.ai_modeling_loop.runner.optimize_with_xtb",
            side_effect=[RuntimeError("SCC failed"), pre_relaxed, refined],
        ) as optimize:
            result, stages = _refine_with_xtb_fallback(
                molecule,
                case=case,
                fixed_atom_indices=tuple(anchor.atom_index for anchor in case.anchors),
                xtb=None,
            )

        self.assertIs(result, refined)
        self.assertEqual([stage["status"] for stage in stages], ["failed", "completed", "completed"])
        self.assertEqual(
            [call.kwargs["method"] for call in optimize.call_args_list],
            ["gfn2", "gfnff", "gfn2"],
        )
        self.assertEqual(optimize.call_args_list[-1].kwargs["electronic_temperature"], 1000)

    def test_conformer_ensemble_selects_lowest_gfnff_energy(self) -> None:
        case = load_case("GDG1476")
        molecule = Chem.SDMolSupplier(str(case.reference_sdf), removeHs=False)[0]
        results = [
            XtbResult(molecule, -1.0, True, 0, "input", 0.0),
            XtbResult(molecule, -3.0, True, 0, "seed1", 0.0),
            XtbResult(molecule, -2.0, True, 0, "seed2", 0.0),
            XtbResult(molecule, -4.0, True, 0, "gfn2", 0.0),
        ]
        with patch(
            "tools.ai_modeling_loop.runner.embed_candidate_distance_geometry",
            return_value=molecule,
        ), patch(
            "tools.ai_modeling_loop.runner.optimize_with_xtb",
            side_effect=results,
        ) as optimize:
            refined, stages, selected = _refine_conformer_ensemble(
                molecule,
                case=case,
                fixed_atom_indices=tuple(anchor.atom_index for anchor in case.anchors),
                seeds=(1, 2),
                xtb=None,
            )

        self.assertIs(refined, results[-1])
        self.assertEqual(selected, "etkdg-1")
        self.assertEqual(len(stages), 4)
        self.assertEqual(
            [call.kwargs["method"] for call in optimize.call_args_list],
            ["gfnff", "gfnff", "gfnff", "gfn2"],
        )


if __name__ == "__main__":
    unittest.main()
