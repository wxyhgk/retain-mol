from __future__ import annotations

import json
import hashlib
import os
import subprocess
import sys
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor
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
from tools.ai_modeling_loop.artifact_contracts import sha256_file, sha256_json
from tools.ai_modeling_loop.evaluator import evaluate_candidate
from tools.ai_modeling_loop.runner import (
    _rebuild_verified_index,
    _refine_conformer_ensemble,
    _refine_with_xtb_fallback,
    archive_run,
    record_run,
)
from tools.ai_modeling_loop.run_manifest import load_run_manifest
from tools.ai_modeling_loop.workspace import prepare_task_bundle


class LoopContractsTest(unittest.TestCase):
    def _write_verified_run(
        self,
        root: Path,
        name: str,
        *,
        verification_status: str = "pass",
        evaluation_passed: bool = True,
    ) -> Path:
        run_dir = root / name
        verification_dir = run_dir / "verification"
        verification_dir.mkdir(parents=True)

        evidence = {
            "builder-snapshot.json": {"kind": "builder", "run": name},
            "identity-map.json": {"kind": "identity", "run": name},
            "execution.json": {"kind": "execution", "run": name},
            "expected-effect.json": {"kind": "expected-effect", "run": name},
            "enforced-plan.json": {"kind": "plan", "run": name},
            "coordinate-transport.json": {"kind": "coordinate", "run": name},
        }
        for relative_path, value in evidence.items():
            (run_dir / relative_path).write_text(json.dumps(value) + "\n")
        (run_dir / "edit-plan.json").write_text(
            json.dumps({"schemaVersion": 1, "planId": name, "commands": []}) + "\n"
        )
        (run_dir / "candidate.sdf").write_text(f"candidate:{name}\n")
        final_snapshot = verification_dir / "final-snapshot.json"
        final_snapshot.write_text(json.dumps({"run": name}) + "\n")
        geometry_request = {"policy": {"policyId": "test-policy-v1"}}
        (verification_dir / "geometry-request.json").write_text(
            json.dumps(geometry_request) + "\n"
        )

        evaluation = {
            "case_id": "case-a",
            "score": 1.0 if evaluation_passed else 0.0,
            "passed": evaluation_passed,
            "failures": [] if evaluation_passed else ["failed"],
        }
        (run_dir / "target-reference.sdf").write_bytes(b"reference")
        (run_dir / "target-evaluator.py").write_text("# archived evaluator\n")
        reference_digest = sha256_file(run_dir / "target-reference.sdf")
        evaluator_digest = sha256_file(run_dir / "target-evaluator.py")
        coordinate_digest = sha256_file(run_dir / "coordinate-transport.json")
        run_manifest = {
            "schemaVersion": 1,
            "runId": name,
            "createdAt": "2026-08-14T00:00:00+00:00",
            "caseId": "case-a",
            "gitCommit": None,
            "gitDirty": None,
            "executor": "test-executor",
            "editPlanSha256": sha256_file(run_dir / "edit-plan.json"),
            "referenceSdfSha256": reference_digest,
            "evaluatorSourceSha256": evaluator_digest,
        }
        (run_dir / "run-manifest.json").write_text(json.dumps(run_manifest) + "\n")
        context = {
            "schemaVersion": 1,
            "verifierVersion": "test-v1",
            "geometryPolicyVersion": "test-policy-v1",
            "builderSnapshotSha256": sha256_file(run_dir / "builder-snapshot.json"),
            "identityMapSha256": sha256_file(run_dir / "identity-map.json"),
            "finalSdfSha256": sha256_file(run_dir / "candidate.sdf"),
            "executionReceiptSha256": sha256_file(run_dir / "execution.json"),
            "expectedEffectSha256": sha256_file(run_dir / "expected-effect.json"),
            "enforcedPlanSha256": sha256_file(run_dir / "enforced-plan.json"),
            "executorOutputSha256": sha256_file(run_dir / "candidate.sdf"),
            "runManifestSha256": sha256_file(run_dir / "run-manifest.json"),
            "geometryRequestSha256": sha256_file(verification_dir / "geometry-request.json"),
            "transportEvidence": {
                "kind": "direct-no-refinement",
                "coordinateTransportReceiptSha256": coordinate_digest,
            },
            "coordinateTransportReceiptSha256": coordinate_digest,
            "evaluationSha256": sha256_json(evaluation),
            "targetEvidence": {
                "referenceSdfSha256": reference_digest,
                "evaluatorSourceSha256": evaluator_digest,
            },
            "formalCheckerEvidence": {"checker": "test"},
        }
        (verification_dir / "verification-context.json").write_text(
            json.dumps(context) + "\n"
        )
        artifact_digest = sha256_file(final_snapshot)
        context_digest = sha256_json(context)
        axis_statuses = {
            "execution": verification_status,
            "safety": "pass" if verification_status == "pass" else "indeterminate",
            "target": "pass" if evaluation_passed else "reject",
        }
        axes = {
            axis: {
                "status": status,
                "code": f"{axis}-{status}",
                "checker": f"{axis}-checker",
                "artifactSha256": artifact_digest,
                "policySha256": sha256_json(geometry_request["policy"]),
                "verificationContextSha256": context_digest,
                "witness": None,
            }
            for axis, status in axis_statuses.items()
        }
        verification = {
            "schemaVersion": 2,
            "status": verification_status,
            "artifactSha256": artifact_digest,
            "policySha256": sha256_json(geometry_request["policy"]),
            "expectedGraphSha256": context["builderSnapshotSha256"],
            "enforcedPlanSha256": context["enforcedPlanSha256"],
            "verifierVersion": "test-v1",
            "verificationContextSha256": context_digest,
            "axes": axes,
        }
        (verification_dir / "verification.json").write_text(json.dumps(verification) + "\n")
        (run_dir / "run.json").write_text(json.dumps({
            "runId": name,
            "createdAt": "2026-08-14T00:00:00+00:00",
            "gitCommit": None,
            "gitDirty": None,
            "executor": "test-executor",
            "editPlanSha256": sha256_file(run_dir / "edit-plan.json"),
            "verification": verification,
            "evaluation": evaluation,
            "candidateSha256": context["finalSdfSha256"],
            "executionReceiptSha256": context["executionReceiptSha256"],
            "coordinateTransportReceiptSha256": coordinate_digest,
            "referenceSdfSha256": reference_digest,
            "evaluatorSourceSha256": evaluator_digest,
        }))
        return run_dir

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
        def execute(
            *,
            initial,
            edit_plan,
            candidate,
            metadata,
            receipt,
            snapshot,
            identity_map,
            coordinate_transport_receipt,
            expected_effect,
            enforced_plan,
        ):
            del edit_plan, snapshot, identity_map, coordinate_transport_receipt, expected_effect, enforced_plan
            candidate.write_bytes(candidate_source.read_bytes())
            metadata.write_text(json.dumps({
                "builder": "retainmol-edit-plan",
                "anchorAtomIndices": {
                    anchor.anchor_id: anchor.atom_index for anchor in case.anchors
                },
            }))
            receipt.write_text(json.dumps({
                "status": "completed",
                "inputSha256": hashlib.sha256(initial.read_bytes()).hexdigest(),
            }))
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
            fake = Path(directory) / "fake xtb"
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
            self.assertEqual(result.command[0], str(fake.resolve()))
            self.assertEqual(result.executable_sha256, hashlib.sha256(fake.read_bytes()).hexdigest())
            self.assertGreater(result.anchor_rmsd_before_projection, 0.0)
            for anchor in case.anchors:
                expected = molecule.GetConformer().GetAtomPosition(anchor.atom_index - 1)
                actual = result.molecule.GetConformer().GetAtomPosition(anchor.atom_index - 1)
                self.assertAlmostEqual(actual.x, expected.x, places=9)
                self.assertAlmostEqual(actual.y, expected.y, places=9)
                self.assertAlmostEqual(actual.z, expected.z, places=9)

    def test_xtb_adapter_rejects_multi_token_wrapper_without_executing_it(self) -> None:
        case = load_case("GDG1476")
        molecule = embed_distance_geometry(case, 47)
        with tempfile.TemporaryDirectory() as directory:
            wrapper = Path(directory) / "wrapper.py"
            marker = Path(directory) / "wrapper-ran"
            wrapper.write_text(
                "import pathlib\n"
                f"pathlib.Path({str(marker)!r}).write_text('executed')\n"
            )

            with self.assertRaisesRegex(ValueError, "single executable path"):
                optimize_with_xtb(
                    molecule,
                    charge=0,
                    multiplicity=1,
                    fixed_atom_indices=(),
                    xtb=f"{sys.executable} {wrapper}",
                )

            self.assertFalse(marker.exists())

    def test_xtb_adapter_rejects_executable_changed_during_run(self) -> None:
        case = load_case("GDG1476")
        molecule = embed_distance_geometry(case, 53)
        with tempfile.TemporaryDirectory() as directory:
            fake = Path(directory) / "mutable-xtb"
            fake.write_text(
                f"#!{sys.executable}\n"
                "import pathlib, sys\n"
                "script = pathlib.Path(__file__)\n"
                "source = pathlib.Path(sys.argv[1]).read_text()\n"
                "pathlib.Path('xtbopt.xyz').write_text(source)\n"
                "script.write_text(script.read_text() + '# changed\\n')\n"
                "print('TOTAL ENERGY -1.0 Eh')\n"
                "print('GEOMETRY OPTIMIZATION CONVERGED AFTER 1 ITERATIONS')\n"
            )
            os.chmod(fake, 0o755)

            with self.assertRaisesRegex(RuntimeError, "changed while the calculation was running"):
                optimize_with_xtb(
                    molecule,
                    charge=0,
                    multiplicity=1,
                    fixed_atom_indices=(),
                    xtb=str(fake),
                )

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

            def invalid_executor(
                *,
                initial,
                edit_plan,
                candidate,
                metadata,
                receipt,
                snapshot,
                identity_map,
                coordinate_transport_receipt,
                expected_effect,
                enforced_plan,
            ):
                del initial, edit_plan, metadata, snapshot, identity_map, coordinate_transport_receipt, expected_effect, enforced_plan
                candidate.write_text("not an sdf\n")
                receipt.write_text(json.dumps({"status": "completed"}))
                return subprocess.CompletedProcess(["node"], 0, "", "")

            with patch("tools.ai_modeling_loop.runner._execute_edit_plan", invalid_executor):
                run_dir, result = record_run(case, plan, work_dir=root)

            self.assertEqual(result.failures, ("candidate-invalid", "formal-indeterminate"))
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
                executable_sha256="a" * 64,
                input_xyz_sha256=hashlib.sha256(b"input xyz").hexdigest(),
                output_xyz_sha256=hashlib.sha256(b"output xyz").hexdigest(),
                input_xyz_text="input xyz",
                output_xyz_text="output xyz",
                input_molecule=molecule,
            )

            with patch(
                "tools.ai_modeling_loop.runner.optimize_with_xtb",
                return_value=fake_result,
            ) as optimize, patch(
                "tools.ai_modeling_loop.runner._execute_edit_plan",
                self._successful_executor(case, case.reference_sdf),
            ), patch(
                "tools.ai_modeling_loop.runner._write_coordinate_transport_receipt",
                return_value="a" * 64,
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
            self.assertEqual(record["verification"]["status"], "indeterminate")
            self.assertEqual(record["verification"]["code"], "verification-artifacts-missing")
            self.assertIn("formal-indeterminate", record["evaluation"]["failures"])
            fixed_indices = tuple(optimize.call_args.kwargs["fixed_atom_indices"])
            self.assertEqual(fixed_indices, tuple(anchor.atom_index for anchor in case.anchors))

    def test_runner_records_verifier_failure_as_indeterminate(self) -> None:
        case = load_case("GDG1476")
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            molecule = Chem.SDMolSupplier(str(case.reference_sdf), removeHs=False)[0]
            self._write_reference_bundle(molecule, root / "references" / case.case_id)
            plan = self._write_plan(root, case.case_id)

            def evidence_executor(
                *,
                initial,
                edit_plan,
                candidate,
                metadata,
                receipt,
                snapshot,
                identity_map,
                coordinate_transport_receipt,
                expected_effect,
                enforced_plan,
            ):
                del edit_plan
                candidate.write_bytes(case.reference_sdf.read_bytes())
                metadata.write_text(json.dumps({
                    "builder": "retainmol-edit-plan",
                    "anchorAtomIndices": {
                        anchor.anchor_id: anchor.atom_index for anchor in case.anchors
                    },
                }))
                for path in (
                    receipt,
                    snapshot,
                    identity_map,
                    coordinate_transport_receipt,
                    expected_effect,
                    enforced_plan,
                ):
                    path.write_text("{}\n")
                receipt.write_text(json.dumps({
                    "inputSha256": hashlib.sha256(initial.read_bytes()).hexdigest(),
                }))
                return subprocess.CompletedProcess(["node"], 0, "", "")

            with patch(
                "tools.ai_modeling_loop.runner._execute_edit_plan",
                evidence_executor,
            ), patch(
                "tools.ai_modeling_loop.runner.verify_final_artifact",
                side_effect=RuntimeError("Lean tool unavailable"),
            ):
                run_dir, result = record_run(case, plan, work_dir=root)

            record = json.loads((run_dir / "run.json").read_text())
            self.assertFalse(result.passed)
            self.assertIn("formal-indeterminate", result.failures)
            self.assertEqual(record["verification"]["status"], "indeterminate")
            self.assertEqual(record["verification"]["code"], "verification-tool-failed")

    def test_runner_freezes_initial_molecule_inside_run(self) -> None:
        case = load_case("GDG1476")
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            molecule = Chem.SDMolSupplier(str(case.reference_sdf), removeHs=False)[0]
            self._write_reference_bundle(molecule, root / "references" / case.case_id)
            plan = self._write_plan(root, case.case_id)
            prepare_task_bundle(case, root)
            shared_initial = root / "tasks" / case.case_id / "initial-molecule.json"
            original = shared_initial.read_bytes()
            observed_initial: list[Path] = []

            def executor(**kwargs):
                initial = kwargs["initial"]
                observed_initial.append(initial)
                shared_initial.write_text('{"mutated": true}\n')
                self._successful_executor(case, case.reference_sdf)(**kwargs)
                return subprocess.CompletedProcess(["node"], 0, "", "")

            with patch("tools.ai_modeling_loop.runner._execute_edit_plan", executor):
                run_dir, _ = record_run(case, plan, work_dir=root)

            frozen = run_dir / "inputs" / "initial-molecule.json"
            manifest = json.loads((run_dir / "run-manifest.json").read_text())
            run_spec = json.loads((run_dir / "run-spec.json").read_text())
            self.assertEqual(observed_initial, [frozen])
            self.assertEqual(frozen.read_bytes(), original)
            self.assertEqual(manifest["schemaVersion"], 2)
            self.assertEqual(manifest["initialMoleculeSha256"], hashlib.sha256(original).hexdigest())
            self.assertEqual(run_spec["schemaVersion"], 2)
            self.assertEqual(
                run_spec["geometryPolicy"],
                case.geometry_policy_spec.to_json(),
            )
            self.assertEqual(
                manifest["runSpecSha256"],
                hashlib.sha256((run_dir / "run-spec.json").read_bytes()).hexdigest(),
            )

            malformed = dict(manifest)
            malformed["initialMoleculeSha256"] = 123
            (run_dir / "run-manifest.json").write_text(json.dumps(malformed) + "\n")
            with self.assertRaisesRegex(ValueError, "initialMoleculeSha256"):
                load_run_manifest(run_dir / "run-manifest.json")

            (run_dir / "run-manifest.json").write_text(json.dumps(manifest) + "\n")
            frozen.write_text('{"tampered": true}\n')
            with self.assertRaisesRegex(ValueError, "initialMoleculeSha256"):
                load_run_manifest(run_dir / "run-manifest.json")

    def test_concurrent_runs_allocate_distinct_directories(self) -> None:
        case = load_case("GDG1476")
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            molecule = Chem.SDMolSupplier(str(case.reference_sdf), removeHs=False)[0]
            self._write_reference_bundle(molecule, root / "references" / case.case_id)
            plan = self._write_plan(root, case.case_id)
            prepare_task_bundle(case, root)

            with patch(
                "tools.ai_modeling_loop.runner._execute_edit_plan",
                self._successful_executor(case, case.reference_sdf),
            ):
                with ThreadPoolExecutor(max_workers=2) as executor:
                    completed = list(executor.map(
                        lambda _: record_run(case, plan, work_dir=root)[0],
                        range(2),
                    ))

            self.assertEqual(len(set(completed)), 2)
            self.assertTrue(all((run_dir / "run.json").is_file() for run_dir in completed))

    def test_runner_rejects_execution_from_unfrozen_input(self) -> None:
        case = load_case("GDG1476")
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            molecule = Chem.SDMolSupplier(str(case.reference_sdf), removeHs=False)[0]
            self._write_reference_bundle(molecule, root / "references" / case.case_id)
            plan = self._write_plan(root, case.case_id)

            def executor(**kwargs):
                self._successful_executor(case, case.reference_sdf)(**kwargs)
                kwargs["receipt"].write_text(json.dumps({"inputSha256": "0" * 64}))
                for name in (
                    "snapshot", "identity_map", "coordinate_transport_receipt",
                    "expected_effect", "enforced_plan",
                ):
                    kwargs[name].write_text("{}\n")
                return subprocess.CompletedProcess(["node"], 0, "", "")

            with patch("tools.ai_modeling_loop.runner._execute_edit_plan", executor), patch(
                "tools.ai_modeling_loop.runner.verify_final_artifact"
            ) as verifier:
                run_dir, result = record_run(case, plan, work_dir=root)

            record = json.loads((run_dir / "run.json").read_text())
            self.assertFalse(result.passed)
            self.assertIn("formal-reject", result.failures)
            self.assertEqual(record["verification"]["code"], "execution-input-binding-reject")
            verifier.assert_not_called()

    def test_runner_rejects_manifest_snapshot_drift_before_final_verifier(self) -> None:
        case = load_case("GDG1476")
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            molecule = Chem.SDMolSupplier(str(case.reference_sdf), removeHs=False)[0]
            self._write_reference_bundle(molecule, root / "references" / case.case_id)
            plan = self._write_plan(root, case.case_id)

            def executor(**kwargs):
                self._successful_executor(case, case.reference_sdf)(**kwargs)
                for name in (
                    "snapshot", "identity_map", "coordinate_transport_receipt",
                    "expected_effect", "enforced_plan",
                ):
                    kwargs[name].write_text("{}\n")
                frozen = kwargs["initial"]
                frozen.write_text('{"replaced": true}\n')
                manifest_path = frozen.parents[1] / "run-manifest.json"
                manifest = json.loads(manifest_path.read_text())
                manifest["initialMoleculeSha256"] = hashlib.sha256(frozen.read_bytes()).hexdigest()
                manifest_path.write_text(json.dumps(manifest) + "\n")
                kwargs["receipt"].write_text(json.dumps({
                    "inputSha256": manifest["initialMoleculeSha256"],
                }))
                return subprocess.CompletedProcess(["node"], 0, "", "")

            with patch("tools.ai_modeling_loop.runner._execute_edit_plan", executor), patch(
                "tools.ai_modeling_loop.runner.verify_final_artifact"
            ) as verifier:
                run_dir, result = record_run(case, plan, work_dir=root)

            record = json.loads((run_dir / "run.json").read_text())
            self.assertFalse(result.passed)
            self.assertIn("formal-indeterminate", result.failures)
            self.assertEqual(
                record["verification"]["code"],
                "execution-input-binding-unavailable",
            )
            verifier.assert_not_called()

    def test_failed_refinement_does_not_publish_partial_final_candidate(self) -> None:
        case = load_case("GDG1476")
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            molecule = Chem.SDMolSupplier(str(case.reference_sdf), removeHs=False)[0]
            self._write_reference_bundle(molecule, root / "references" / case.case_id)
            plan = self._write_plan(root, case.case_id)
            incomplete = XtbResult(molecule, -1.0, True, 0, "missing provenance", 0.0)

            with patch(
                "tools.ai_modeling_loop.runner._execute_edit_plan",
                self._successful_executor(case, case.reference_sdf),
            ), patch(
                "tools.ai_modeling_loop.runner.optimize_with_xtb",
                return_value=incomplete,
            ):
                run_dir, result = record_run(case, plan, work_dir=root, refine=True)

            record = json.loads((run_dir / "run.json").read_text())
            self.assertIn("xtb-failed", result.failures)
            self.assertFalse((run_dir / "candidate.sdf").exists())
            self.assertFalse((run_dir / ".candidate.refined.sdf.tmp").exists())
            self.assertEqual(
                record["candidateSha256"],
                hashlib.sha256((run_dir / "candidate.raw.sdf").read_bytes()).hexdigest(),
            )

    def test_archive_verified_index_contains_only_formally_verified_passes(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            history = root / "history"

            archive_run(self._write_verified_run(root, "pass-run"), history)
            archive_run(self._write_verified_run(
                root,
                "reject-run",
                verification_status="reject",
                evaluation_passed=False,
            ), history)
            archive_run(self._write_verified_run(
                root,
                "fake-pass-run",
                evaluation_passed=False,
            ), history)

            all_runs = json.loads((history / "index.json").read_text())["runs"]
            verified_runs = json.loads((history / "verified" / "index.json").read_text())["runs"]
            self.assertEqual(len(all_runs), 3)
            self.assertEqual([row["runId"] for row in verified_runs], ["pass-run"])

    def test_concurrent_archives_publish_one_complete_index(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            history = root / "history"
            first = self._write_verified_run(root, "parallel-a")
            second = self._write_verified_run(root, "parallel-b")

            with ThreadPoolExecutor(max_workers=2) as executor:
                list(executor.map(lambda run: archive_run(run, history), (first, second)))

            index = json.loads((history / "verified" / "index.json").read_text())
            self.assertEqual(
                {row["runId"] for row in index["runs"]},
                {"parallel-a", "parallel-b"},
            )
            self.assertEqual(index["errors"], [])

    def test_verified_index_rejects_modified_geometry_request(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            history = root / "history"
            archived = archive_run(self._write_verified_run(root, "geometry-drift"), history)
            request = archived / "verification" / "geometry-request.json"
            value = json.loads(request.read_text())
            value["unexpected"] = True
            request.write_text(json.dumps(value) + "\n")

            _rebuild_verified_index(history)

            index = json.loads((history / "verified" / "index.json").read_text())
            self.assertEqual(index["runs"], [])
            self.assertIn("geometry request hash mismatch", index["errors"][0]["error"])

    def test_verified_index_rejects_modified_run_identity(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            history = root / "history"
            archived = archive_run(self._write_verified_run(root, "manifest-drift"), history)
            record_path = archived / "run.json"
            record = json.loads(record_path.read_text())
            record["createdAt"] = "2099-01-01T00:00:00+00:00"
            record_path.write_text(json.dumps(record) + "\n")

            _rebuild_verified_index(history)

            index = json.loads((history / "verified" / "index.json").read_text())
            self.assertEqual(index["runs"], [])
            self.assertIn("run record metadata differs", index["errors"][0]["error"])

    def test_verified_index_rejects_modified_edit_plan(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            history = root / "history"
            archived = archive_run(self._write_verified_run(root, "edit-plan-drift"), history)
            edit_plan = archived / "edit-plan.json"
            value = json.loads(edit_plan.read_text())
            value["commands"].append({"type": "unexpected"})
            edit_plan.write_text(json.dumps(value) + "\n")

            _rebuild_verified_index(history)

            index = json.loads((history / "verified" / "index.json").read_text())
            self.assertEqual(index["runs"], [])
            self.assertIn("edit-plan.json", index["errors"][0]["error"])

    def test_verified_index_rejects_pass_with_missing_upstream_receipt(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            history = root / "history"
            run_dir = self._write_verified_run(root, "missing-receipt")
            (run_dir / "execution.json").unlink()

            archive_run(run_dir, history)

            index = json.loads((history / "verified" / "index.json").read_text())
            self.assertEqual(index["runs"], [])
            self.assertIn("missing archived evidence", index["errors"][0]["error"])

    def test_verified_index_rejects_pass_without_archived_target_evidence(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            history = root / "history"
            run_dir = self._write_verified_run(root, "missing-target-evidence")
            (run_dir / "target-reference.sdf").unlink()

            archive_run(run_dir, history)

            index = json.loads((history / "verified" / "index.json").read_text())
            self.assertEqual(index["runs"], [])
            self.assertIn("target-reference.sdf", index["errors"][0]["error"])

    def test_verified_index_malformed_record_clears_stale_publication(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            history = root / "history"
            archived = archive_run(self._write_verified_run(root, "valid-pass"), history)
            stale_index = history / "verified" / "index.json"
            self.assertEqual(len(json.loads(stale_index.read_text())["runs"]), 1)
            malformed = json.loads((archived / "run.json").read_text())
            del malformed["runId"]
            (archived / "run.json").write_text(json.dumps(malformed))

            _rebuild_verified_index(history)

            index = json.loads(stale_index.read_text())
            self.assertEqual(index["runs"], [])
            self.assertIn("run record metadata differs", index["errors"][0]["error"])

    def test_archive_skips_corrupt_history_and_rebuilds_indexes_without_new_runs(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            history = root / "history"
            corrupt = history / "case-a" / "broken" / "run.json"
            corrupt.parent.mkdir(parents=True)
            corrupt.write_text("{broken")

            from tools.ai_modeling_loop.runner import archive_existing_runs

            archived = archive_existing_runs(root / "empty-work", history)

            self.assertEqual(archived, [])
            history_index = json.loads((history / "index.json").read_text())
            verified_index = json.loads((history / "verified" / "index.json").read_text())
            self.assertEqual(history_index["runs"], [])
            self.assertEqual(verified_index["runs"], [])
            self.assertEqual(len(history_index["errors"]), 1)
            self.assertEqual(len(verified_index["errors"]), 1)

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
