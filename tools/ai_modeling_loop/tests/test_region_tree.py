from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from typing import Any

from PIL import Image

from tools.ai_modeling_loop.region_tree import (
    CropTransform,
    assign_boundary_ports,
    globalize_region_proposal,
    run_region_tree,
)


def root_proposal() -> dict[str, Any]:
    return {
        "segmentationBasis": "chemical-boundaries",
        "symmetryGroups": [],
        "regions": [
            {
                "id": "region-01",
                "kind": "ring-system",
                "componentId": "component-1",
                "label": "large fused system",
                "box": {"xMin": 0.1, "yMin": 0.1, "xMax": 0.7, "yMax": 0.9},
                "complexity": {"estimatedHeavyAtoms": 20, "estimatedCycleRank": 6},
                "needsSubdivision": True,
                "ports": [{
                    "id": "root-a",
                    "kind": "new-bond",
                    "position": {"x": 0.68, "y": 0.5},
                    "connectsTo": "root-b",
                }],
            },
            {
                "id": "region-02",
                "kind": "functional-group",
                "componentId": "component-1",
                "label": "terminal group",
                "box": {"xMin": 0.65, "yMin": 0.3, "xMax": 0.95, "yMax": 0.7},
                "complexity": {"estimatedHeavyAtoms": 4, "estimatedCycleRank": 0},
                "needsSubdivision": False,
                "ports": [{
                    "id": "root-b",
                    "kind": "new-bond",
                    "position": {"x": 0.66, "y": 0.5},
                    "connectsTo": "root-a",
                }],
            },
        ],
    }


def child_proposal() -> dict[str, Any]:
    return {
        "segmentationBasis": "chemical-boundaries",
        "symmetryGroups": [],
        "regions": [
            {
                "id": "region-01",
                "kind": "ring-system",
                "componentId": "component-1",
                "label": "left rings",
                "box": {"xMin": 0.0, "yMin": 0.0, "xMax": 0.52, "yMax": 1.0},
                "complexity": {"estimatedHeavyAtoms": 8, "estimatedCycleRank": 2},
                "needsSubdivision": False,
                "ports": [{
                    "id": "child-a",
                    "kind": "shared-edge",
                    "position": {"x": 0.5, "y": 0.5},
                    "connectsTo": "child-b",
                }],
            },
            {
                "id": "region-02",
                "kind": "ring-system",
                "componentId": "component-1",
                "label": "right rings",
                "box": {"xMin": 0.48, "yMin": 0.0, "xMax": 1.0, "yMax": 1.0},
                "complexity": {"estimatedHeavyAtoms": 12, "estimatedCycleRank": 4},
                "needsSubdivision": False,
                "ports": [{
                    "id": "child-b",
                    "kind": "shared-edge",
                    "position": {"x": 0.5, "y": 0.5},
                    "connectsTo": "child-a",
                }],
            },
        ],
    }


class QueueClient:
    def __init__(self, payloads: list[dict[str, Any]]):
        self.payloads = iter(payloads)
        self.images: list[Path] = []

    def complete_json(self, *, prompt: str, image: Path, **kwargs):
        del prompt, kwargs
        self.images.append(image)
        return {"payload": next(self.payloads), "providerResponse": {"choices": []}}


class RegionTreeTest(unittest.TestCase):
    def test_globalize_proposal_namespaces_ids_and_coordinates(self) -> None:
        proposal = globalize_region_proposal(
            child_proposal(),
            transform=CropTransform(0.1, 0.2, 0.7, 0.8),
            namespace="parent",
            component_id="molecule-a",
        )

        first = proposal["regions"][0]
        self.assertEqual(first["id"], "parent/region-01")
        self.assertEqual(first["componentId"], "molecule-a")
        self.assertAlmostEqual(first["box"]["xMax"], 0.412)
        self.assertEqual(first["ports"][0]["connectsTo"], "parent/child-b")
        self.assertAlmostEqual(first["ports"][0]["position"]["y"], 0.5)

    def test_boundary_assignment_uses_port_location_not_region_name(self) -> None:
        regions = [
            {"id": "left", "box": {"xMin": 0.0, "yMin": 0.0, "xMax": 0.5, "yMax": 1.0}},
            {"id": "right", "box": {"xMin": 0.5, "yMin": 0.0, "xMax": 1.0, "yMax": 1.0}},
        ]
        assignments, errors = assign_boundary_ports(
            [{"id": "external", "position": {"x": 0.9, "y": 0.5}}],
            regions,
        )

        self.assertEqual(errors, ())
        self.assertEqual(assignments, {"external": "right"})

    def test_runner_recurses_and_rewires_parent_port_to_leaf(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            image = root / "molecule.png"
            Image.new("RGB", (1000, 800), "white").save(image)
            client = QueueClient([root_proposal(), child_proposal()])

            result = run_region_tree(
                image=image,
                client=client,
                run_id="tree-test",
                max_depth=1,
                max_attempts=1,
                work_dir=root,
            )

            self.assertTrue(result.validation.complete)
            self.assertEqual(len(client.images), 2)
            self.assertNotEqual(client.images[0], client.images[1])
            self.assertTrue(client.images[1].is_file())
            leaf_graph = result.tree["leafGraph"]
            self.assertEqual(len(leaf_graph["regions"]), 3)
            self.assertEqual(len(leaf_graph["edges"]), 2)
            root_edge = next(edge for edge in leaf_graph["edges"] if edge["portA"] == "root-a")
            self.assertEqual(root_edge["regionA"], "region-01/region-02")
            self.assertTrue((result.run_dir / "region-tree.json").exists())

    def test_max_depth_keeps_a_usable_leaf_and_marks_tree_incomplete(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            image = root / "molecule.png"
            Image.new("RGB", (100, 100), "white").save(image)

            result = run_region_tree(
                image=image,
                client=QueueClient([root_proposal()]),
                run_id="depth-test",
                max_depth=0,
                max_attempts=1,
                work_dir=root,
            )

            self.assertTrue(result.validation.valid)
            self.assertFalse(result.validation.complete)
            self.assertEqual(len(result.tree["leafGraph"]["regions"]), 2)
            self.assertTrue(any("max_depth" in warning for warning in result.validation.warnings))


if __name__ == "__main__":
    unittest.main()
