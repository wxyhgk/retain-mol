from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from typing import Any

from PIL import Image

from tools.ai_modeling_loop.region_proposal import (
    analyze_region_image_coverage,
    repair_reciprocal_port_connections,
    run_region_proposal,
    validate_region_image_coverage,
    validate_region_proposal,
)


def valid_proposal() -> dict[str, Any]:
    return {
        "segmentationBasis": "chemical-boundaries",
        "symmetryGroups": [["region-02", "region-03"]],
        "regions": [
            {
                "id": "region-01",
                "kind": "coordination-core",
                "componentId": "component-1",
                "label": "central core",
                "box": {"xMin": 0.3, "yMin": 0.2, "xMax": 0.7, "yMax": 0.8},
                "complexity": {"estimatedHeavyAtoms": 10, "estimatedCycleRank": 2},
                "needsSubdivision": False,
                "ports": [
                    {
                        "id": "port-01-left",
                        "kind": "new-bond",
                        "position": {"x": 0.32, "y": 0.5},
                        "connectsTo": "port-02-core",
                    },
                    {
                        "id": "port-01-right",
                        "kind": "new-bond",
                        "position": {"x": 0.68, "y": 0.5},
                        "connectsTo": "port-03-core",
                    },
                ],
            },
            {
                "id": "region-02",
                "kind": "ring-system",
                "componentId": "component-1",
                "label": "ring system A",
                "box": {"xMin": 0.05, "yMin": 0.1, "xMax": 0.35, "yMax": 0.9},
                "complexity": {"estimatedHeavyAtoms": 13, "estimatedCycleRank": 3},
                "needsSubdivision": False,
                "ports": [{
                    "id": "port-02-core",
                    "kind": "new-bond",
                    "position": {"x": 0.34, "y": 0.5},
                    "connectsTo": "port-01-left",
                }],
            },
            {
                "id": "region-03",
                "kind": "functional-group",
                "componentId": "component-1",
                "label": "substituent B",
                "box": {"xMin": 0.65, "yMin": 0.1, "xMax": 0.95, "yMax": 0.9},
                "complexity": {"estimatedHeavyAtoms": 4, "estimatedCycleRank": 0},
                "needsSubdivision": False,
                "ports": [{
                    "id": "port-03-core",
                    "kind": "new-bond",
                    "position": {"x": 0.66, "y": 0.5},
                    "connectsTo": "port-01-right",
                }],
            },
        ],
    }


class FakeClient:
    def __init__(self, proposal: dict[str, Any]):
        self.proposal = proposal

    def complete_json(self, **kwargs):
        del kwargs
        return {"payload": self.proposal, "providerResponse": {"choices": []}}


class RegionProposalTest(unittest.TestCase):
    def test_image_coverage_rejects_visible_structure_outside_boxes(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            image = Path(directory) / "target.png"
            source = Image.new("RGB", (100, 100), "white")
            for x in range(10, 91):
                source.putpixel((x, 50), (0, 0, 0))
            source.save(image)
            proposal = valid_proposal()
            proposal["regions"] = [
                proposal["regions"][0]
                | {
                    "box": {
                        "xMin": 0.05,
                        "yMin": 0.4,
                        "xMax": 0.45,
                        "yMax": 0.6,
                    },
                    "ports": [],
                }
            ]

            validation, coverage = validate_region_image_coverage(
                image=image,
                proposal=proposal,
            )

            self.assertFalse(validation.valid)
            self.assertLess(coverage.coverage, 0.6)

    def test_image_coverage_accepts_fully_enclosed_structure(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            image = Path(directory) / "target.png"
            source = Image.new("RGB", (100, 100), "white")
            for x in range(30, 71):
                source.putpixel((x, 50), (0, 0, 0))
            source.save(image)

            coverage = analyze_region_image_coverage(
                image=image,
                proposal=valid_proposal(),
            )

            self.assertGreaterEqual(coverage.coverage, 0.99)

    def test_repair_fixes_only_unique_reverse_reference(self) -> None:
        proposal = valid_proposal()
        proposal["regions"][0]["ports"][1]["connectsTo"] = "port-02-core"

        repaired, repairs = repair_reciprocal_port_connections(proposal)

        self.assertEqual(len(repairs), 1)
        self.assertEqual(
            repaired["regions"][0]["ports"][1]["connectsTo"],
            "port-03-core",
        )
        self.assertTrue(validate_region_proposal(repaired).valid)

    def test_validator_accepts_dynamic_regions(self) -> None:
        self.assertTrue(validate_region_proposal(valid_proposal()).valid)

    def test_validator_accepts_single_region_molecule(self) -> None:
        proposal = valid_proposal()
        proposal["symmetryGroups"] = []
        proposal["regions"] = [proposal["regions"][0] | {"ports": []}]

        self.assertTrue(validate_region_proposal(proposal).valid)

    def test_validator_rejects_dangling_nonreciprocal_port(self) -> None:
        proposal = valid_proposal()
        proposal["regions"][0]["ports"][0]["connectsTo"] = "missing-port"

        result = validate_region_proposal(proposal)

        self.assertFalse(result.valid)
        self.assertTrue(any("missing peer" in error for error in result.errors))

    def test_validator_requires_port_to_be_inside_region_box(self) -> None:
        proposal = valid_proposal()
        proposal["regions"][1]["ports"][0]["position"] = {"x": 0.9, "y": 0.5}

        result = validate_region_proposal(proposal)

        self.assertFalse(result.valid)
        self.assertTrue(any("inside its region box" in error for error in result.errors))

    def test_validator_rejects_disconnected_regions_in_same_component(self) -> None:
        proposal = valid_proposal()
        proposal["regions"][2]["ports"] = []
        proposal["regions"][0]["ports"] = proposal["regions"][0]["ports"][:1]

        result = validate_region_proposal(proposal)

        self.assertFalse(result.valid)
        self.assertTrue(any("connected region graph" in error for error in result.errors))

    def test_validator_rejects_unknown_region_kind(self) -> None:
        proposal = valid_proposal()
        proposal["regions"][0]["kind"] = "left-arm"

        result = validate_region_proposal(proposal)

        self.assertFalse(result.valid)
        self.assertTrue(any("kind must be one of" in error for error in result.errors))

    def test_validator_handles_invalid_symmetry_member_without_crashing(self) -> None:
        proposal = valid_proposal()
        proposal["symmetryGroups"] = [["region-02", {"id": "region-03"}]]

        result = validate_region_proposal(proposal)

        self.assertFalse(result.valid)
        self.assertTrue(any("only region ids" in error for error in result.errors))

    def test_runner_renders_dynamic_overview_highlights_and_crops(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            image = root / "target.png"
            Image.new("RGB", (640, 480), "white").save(image)

            result = run_region_proposal(
                image=image,
                client=FakeClient(valid_proposal()),
                run_id="region-test",
                work_dir=root,
            )

            self.assertTrue(result.validation.valid)
            images = result.run_dir / "images"
            self.assertTrue((images / "regions-overview.png").exists())
            self.assertTrue((images / "regions-uncovered.png").exists())
            self.assertEqual(len(list(images.glob("*-highlight.png"))), 3)
            self.assertEqual(len(list(images.glob("*-crop.png"))), 3)


if __name__ == "__main__":
    unittest.main()
