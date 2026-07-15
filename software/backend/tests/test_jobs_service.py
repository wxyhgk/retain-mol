"""Unit tests for durable RetainMol jobs."""

from __future__ import annotations

import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

from software.backend.jobs import (
    InvalidJobInputError,
    InvalidJobTransitionError,
    JobNotFoundError,
    JobService,
)


class JobServiceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.data_root = Path(self.temporary_directory.name) / "data"
        self.service = JobService(self.data_root)

    def tearDown(self) -> None:
        self.temporary_directory.cleanup()

    def test_create_job_persists_record_and_snapshot(self) -> None:
        metadata = {
            "engine": "xtb",
            "request": {
                "charge": -1,
                "method": "gfn2",
                "constraints": {"fixedAtomIds": ["oxygen", "hydrogen-1"]},
            },
        }
        job = self.service.create_job("geometry-optimization", metadata=metadata)

        self.assertRegex(job.job_id, r"^\d{8}-[0-9a-f]{8}$")
        self.assertEqual(job.status, "queued")
        self.assertEqual(job.metadata, metadata)
        self.assertEqual(self.service.get_job(job.job_id), job)
        reopened_service = JobService(self.data_root)
        self.assertEqual(reopened_service.get_job(job.job_id), job)

        snapshot = self._snapshot(job.job_id)
        self.assertEqual(snapshot["jobId"], job.job_id)
        self.assertEqual(snapshot["taskType"], "geometry-optimization")
        self.assertEqual(snapshot["inputs"], [])
        self.assertEqual(snapshot["artifacts"], [])
        self.assertEqual(snapshot["metadata"], metadata)
        self.assertTrue((self.data_root / "retainmol.sqlite").is_file())
        self.assertEqual(self.service.job_directory(job.job_id), self.service.task_directory(job.job_id))

    def test_inputs_artifacts_and_status_refresh_the_snapshot(self) -> None:
        job = self.service.create_job("geometry-optimization")

        job_input = self.service.add_input(
            job.job_id,
            "structure",
            {"format": "xyz", "content": "H 0 0 0"},
            metadata={"source": "editor"},
        )
        artifact = self.service.add_artifact(
            job.job_id,
            "optimized-structure",
            "outputs/optimized.xyz",
            media_type="chemical/x-xyz",
        )
        claimed = self.service.claim_queued_job(job.job_id)
        self.assertIsNotNone(claimed)
        updated = self.service.update_status(job.job_id, "completed")

        self.assertEqual(updated.status, "succeeded")
        found = self.service.get_job(job.job_id)
        assert found is not None
        self.assertEqual(found.inputs, [job_input])
        self.assertEqual(found.artifacts, [artifact])

        snapshot = self._snapshot(job.job_id)
        self.assertEqual(snapshot["status"], "succeeded")
        self.assertEqual(snapshot["inputs"][0]["inputId"], job_input.input_id)
        self.assertEqual(snapshot["inputs"][0]["value"]["format"], "xyz")
        self.assertEqual(snapshot["artifacts"][0]["artifactId"], artifact.artifact_id)
        self.assertEqual(snapshot["artifacts"][0]["mediaType"], "chemical/x-xyz")
        self.assertGreater(updated.updated_at, job.created_at)

    def test_list_jobs_returns_newest_job_first_with_relations(self) -> None:
        older = self.service.create_job("older")
        self.service.add_input(older.job_id, "value", 1)
        newer = self.service.create_job("newer")

        jobs = self.service.list_jobs()

        self.assertEqual([job.job_id for job in jobs], [newer.job_id, older.job_id])
        self.assertEqual(jobs[1].inputs[0].value, 1)

    def test_unknown_jobs_are_not_silently_mutated(self) -> None:
        with self.assertRaises(JobNotFoundError):
            self.service.get_job("20260714-deadbeef")
        with self.assertRaises(JobNotFoundError):
            self.service.add_input("20260714-deadbeef", "value", 1)
        with self.assertRaises(JobNotFoundError):
            self.service.add_artifact("20260714-deadbeef", "result", "result.xyz")
        with self.assertRaises(JobNotFoundError):
            self.service.update_status("20260714-deadbeef", "failed")

    def test_database_uses_foreign_keys_for_child_records(self) -> None:
        job = self.service.create_job("single-point")
        with sqlite3.connect(self.data_root / "retainmol.sqlite") as connection:
            connection.execute("PRAGMA foreign_keys = ON")
            with self.assertRaises(sqlite3.IntegrityError):
                connection.execute(
                    "INSERT INTO job_inputs VALUES (?, ?, ?, ?, ?, ?)",
                    ("input-invalid", "missing", "value", "1", "{}", job.created_at.isoformat()),
                )

    def test_route_compatible_creation_and_batch_inputs(self) -> None:
        job = self.service.create_job({"engine": "xtb", "charge": -1})
        updated = self.service.add_inputs(job.job_id, {"structure": "water", "charge": -1})

        self.assertEqual(job.task_type, "job")
        self.assertEqual(job.metadata, {"engine": "xtb", "charge": -1})
        self.assertEqual({item.name: item.value for item in updated.inputs}, {
            "structure": "water",
            "charge": -1,
        })
        self.assertEqual(self.service.list_artifacts(job.job_id), [])

    def test_only_one_runner_can_claim_a_queued_job(self) -> None:
        job = self.service.create_job("geometry-optimization")

        first_claim = self.service.claim_queued_job(job.job_id)
        second_claim = self.service.claim_queued_job(job.job_id)

        self.assertIsNotNone(first_claim)
        self.assertEqual(first_claim.status, "running")
        self.assertIsNone(second_claim)
        self.assertEqual(self.service.get_job(job.job_id).status, "running")

    def test_calculation_spec_is_persisted_separately_from_the_run(self) -> None:
        payload = {"method": "gfn2", "charge": 0, "structure": {"atoms": []}}
        job = self.service.create_calculation_job(
            "xtb-optimization",
            "xtb",
            payload,
            metadata={"name": "spec smoke"},
        )

        spec = JobService(self.data_root).get_calculation_spec(job.job_id)
        self.assertIsNotNone(spec)
        assert spec is not None
        self.assertEqual(spec.spec_id, job.spec_id)
        self.assertEqual(spec.engine, "xtb")
        self.assertEqual(spec.payload, {"method": "gfn2", "charge": 0})
        persisted = self.service.get_job(job.job_id)
        self.assertEqual(persisted.status, "queued")
        self.assertEqual(persisted.state_version, 1)
        self.assertIsNotNone(persisted.queued_at)
        self.assertEqual(len(persisted.bindings), 1)
        self.assertEqual(persisted.bindings[0].input_name, "structure")
        self.assertEqual(persisted.bindings[0].literal_value["structure"], payload["structure"])
        self.assertRegex(persisted.bindings[0].content_sha256 or "", r"^[0-9a-f]{64}$")

    def test_invalid_calculation_inputs_leave_no_partial_job(self) -> None:
        with self.assertRaises(InvalidJobInputError):
            self.service.create_calculation_job(
                "xtb-optimization",
                "xtb",
                {"method": "gfn2", "charge": 0},
                metadata={"name": "invalid"},
            )

        self.assertEqual(self.service.list_jobs(), [])

    def test_created_draft_freezes_explicit_input_before_queueing(self) -> None:
        draft = self.service.create_calculation_draft(
            "xtb-optimization",
            "xtb",
            {
                "method": "gfn2",
                "charge": 0,
                "multiplicity": 1,
                "maxSteps": 250,
                "optLevel": "normal",
            },
        )

        queued = self.service.queue_calculation_job(
            draft.job_id,
            {
                "structure": {
                    "sourceKind": "literal",
                    "format": "molecule",
                    "value": {"format": "molecule", "structure": {"atoms": []}},
                }
            },
        )

        self.assertEqual(queued.status, "queued")
        self.assertEqual(queued.state_version, 1)
        self.assertEqual(queued.bindings[0].source_kind, "literal")

    def test_workflow_artifact_reference_resolves_to_frozen_binding(self) -> None:
        source = self.service.create_job("xtb-optimization")
        self.assertIsNotNone(self.service.claim_queued_job(source.job_id))
        output = self.service.task_directory(source.job_id) / "optimized.xyz"
        output.write_text("1\n\nH 0 0 0\n", encoding="utf-8")
        artifact = self.service.add_artifact(
            source.job_id,
            "optimized.xyz",
            "optimized.xyz",
            metadata={"role": "output", "format": "xyz"},
        )
        self.service.update_status(source.job_id, "succeeded")
        draft = self.service.create_calculation_draft(
            "xtb-optimization",
            "xtb",
            {
                "method": "gfn2",
                "charge": 0,
                "multiplicity": 1,
                "maxSteps": 250,
                "optLevel": "normal",
            },
        )
        workflow = self.service.create_workflow(
            "optimization chain",
            [source.job_id, draft.job_id],
            [
                {
                    "targetJobId": draft.job_id,
                    "targetInputName": "structure",
                    "sourceJobId": source.job_id,
                    "sourceArtifactId": artifact.artifact_id,
                    "sourceKind": "artifact",
                    "sourceName": artifact.name,
                }
            ],
        )

        queued = self.service.queue_calculation_job(
            draft.job_id, workflow_id=workflow.workflow_id
        )

        self.assertEqual(queued.status, "queued")
        self.assertEqual(queued.bindings[0].source_kind, "artifact")
        self.assertEqual(queued.bindings[0].artifact_id, artifact.artifact_id)
        self.assertEqual(
            queued.bindings[0].resolved_from_reference_id,
            workflow.references[0].reference_id,
        )

    def test_job_state_machine_rejects_skips_and_terminal_reentry(self) -> None:
        job = self.service.create_job("geometry-optimization")
        with self.assertRaises(InvalidJobTransitionError):
            self.service.update_status(job.job_id, "succeeded")
        self.assertIsNotNone(self.service.claim_queued_job(job.job_id))
        completed = self.service.update_status(job.job_id, "succeeded")
        self.assertEqual(completed.state_version, 2)
        with self.assertRaises(InvalidJobTransitionError):
            self.service.update_status(job.job_id, "running")

    def test_existing_output_is_published_to_immutable_artifact_storage(self) -> None:
        job = self.service.create_job("geometry-optimization")
        output = self.service.task_directory(job.job_id) / "result.xyz"
        output.write_text("1\n\nH 0 0 0\n", encoding="utf-8")

        artifact = self.service.add_artifact(
            job.job_id,
            "result.xyz",
            "result.xyz",
            metadata={"role": "output", "format": "xyz"},
        )

        self.assertIsNotNone(artifact.storage_key)
        self.assertEqual(artifact.byte_size, output.stat().st_size)
        assert artifact.storage_key is not None
        published = self.service.artifact_storage.resolve(artifact.storage_key)
        self.assertEqual(published.read_bytes(), output.read_bytes())

    def _snapshot(self, job_id: str) -> dict:
        path = self.data_root / "tasks" / job_id / "job.json"
        return json.loads(path.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
