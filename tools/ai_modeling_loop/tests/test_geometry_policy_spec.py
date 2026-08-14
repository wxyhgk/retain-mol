from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from tools.ai_modeling_loop.artifact_contracts import ArtifactContractError
from tools.ai_modeling_loop.geometry_policy_spec import (
    MAX_RIGID_PAIR_BUDGET,
    load_run_geometry_policy_spec,
    parse_geometry_policy_spec,
)


def run_spec(*, schema_version: int, geometry_policy: dict | None = None) -> dict:
    value = {
        "schemaVersion": schema_version,
        "caseId": "case-a",
        "charge": 0,
        "multiplicity": 1,
        "anchors": [
            {
                "id": "anchor-b",
                "referenceAtomIndex": 1,
                "symbol": "B",
                "position": {"x": 0, "y": 0, "z": 0},
            },
            {
                "id": "anchor-n",
                "referenceAtomIndex": 2,
                "symbol": "N",
                "position": {"x": 1, "y": 0, "z": 0},
            },
        ],
        "refinement": {
            "enabled": False,
            "xtb": None,
            "conformerSeeds": [],
            "trustedExecutableSha256": None,
        },
    }
    if geometry_policy is not None:
        value["geometryPolicy"] = geometry_policy
    return value


class GeometryPolicySpecTests(unittest.TestCase):
    def load(self, value: dict):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "run-spec.json"
            path.write_text(json.dumps(value), encoding="utf-8")
            return load_run_geometry_policy_spec(path)

    def test_v1_run_spec_derives_fixed_anchor_policy(self) -> None:
        spec = self.load(run_spec(schema_version=1))

        self.assertEqual(spec.policy_id, "case-a-anchored-geometry-v1")
        self.assertEqual(spec.fixed_atom_ids, ("anchor-b", "anchor-n"))
        self.assertEqual(spec.orientation_checks, ())
        self.assertEqual(spec.rigid_atom_groups, ())

    def test_v2_run_spec_loads_frozen_geometry_intent(self) -> None:
        policy = {
            "schemaVersion": 1,
            "policyId": "case-a-core-v1",
            "fixedAtomIds": ["anchor-n", "anchor-b"],
            "orientationChecks": [{
                "atomIds": ["anchor-b", "anchor-n", "c1", "c2"],
                "minAbsVolume6": 100,
            }],
            "rigidAtomGroups": [{
                "atomIds": ["c2", "anchor-b", "c1"],
                "maxSquaredDistanceDelta": 25,
            }],
        }

        spec = self.load(run_spec(schema_version=2, geometry_policy=policy))

        self.assertEqual(spec.fixed_atom_ids, ("anchor-b", "anchor-n"))
        self.assertEqual(spec.orientation_checks[0].atom_ids, (
            "anchor-b", "anchor-n", "c1", "c2",
        ))
        self.assertEqual(spec.rigid_atom_groups[0].atom_ids, (
            "anchor-b", "c1", "c2",
        ))

    def test_v2_policy_must_fix_exactly_the_run_anchors(self) -> None:
        policy = {
            "schemaVersion": 1,
            "policyId": "bad",
            "fixedAtomIds": ["anchor-b"],
            "orientationChecks": [],
            "rigidAtomGroups": [],
        }

        with self.assertRaisesRegex(ArtifactContractError, "exactly match"):
            self.load(run_spec(schema_version=2, geometry_policy=policy))

    def test_duplicate_orientation_and_rigid_group_are_rejected(self) -> None:
        base = {
            "schemaVersion": 1,
            "policyId": "duplicates",
            "fixedAtomIds": [],
            "orientationChecks": [
                {"atomIds": ["a", "b", "c", "d"], "minAbsVolume6": 1},
                {"atomIds": ["a", "b", "c", "d"], "minAbsVolume6": 2},
            ],
            "rigidAtomGroups": [],
        }
        with self.assertRaisesRegex(ArtifactContractError, "orientationChecks must be unique"):
            parse_geometry_policy_spec(base)

        base["orientationChecks"] = []
        base["rigidAtomGroups"] = [
            {"atomIds": ["b", "a"], "maxSquaredDistanceDelta": 1},
            {"atomIds": ["a", "b"], "maxSquaredDistanceDelta": 2},
        ]
        with self.assertRaisesRegex(ArtifactContractError, "rigidAtomGroups must be unique"):
            parse_geometry_policy_spec(base)

    def test_rigid_pair_budget_fails_closed(self) -> None:
        groups = []
        pair_count = 0
        index = 0
        while pair_count <= MAX_RIGID_PAIR_BUDGET:
            atom_ids = [f"g{index}-a{atom_index}" for atom_index in range(64)]
            groups.append({
                "atomIds": atom_ids,
                "maxSquaredDistanceDelta": 1,
            })
            pair_count += len(atom_ids) * (len(atom_ids) - 1) // 2
            index += 1
        policy = {
            "schemaVersion": 1,
            "policyId": "too-expensive",
            "fixedAtomIds": [],
            "orientationChecks": [],
            "rigidAtomGroups": groups,
        }

        with self.assertRaisesRegex(ArtifactContractError, "pair budget"):
            parse_geometry_policy_spec(policy)


if __name__ == "__main__":
    unittest.main()
