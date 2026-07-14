from __future__ import annotations

import json
import math
import re
import shutil
from copy import deepcopy
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from PIL import Image

from .contracts import DEFAULT_WORK_DIR
from .region_proposal import RegionRun, run_region_proposal, validate_region_proposal
from .topology_audit import JsonVisionClient


@dataclass(frozen=True)
class RegionTreeValidation:
    errors: tuple[str, ...]
    warnings: tuple[str, ...]

    @property
    def valid(self) -> bool:
        return not self.errors

    @property
    def complete(self) -> bool:
        return self.valid and not self.warnings

    def to_json(self) -> dict[str, Any]:
        return {
            "valid": self.valid,
            "complete": self.complete,
            "errors": list(self.errors),
            "warnings": list(self.warnings),
        }


@dataclass(frozen=True)
class RegionTreeRun:
    run_dir: Path
    tree: dict[str, Any]
    validation: RegionTreeValidation


@dataclass(frozen=True)
class CropTransform:
    x_min: float
    y_min: float
    x_max: float
    y_max: float

    def point(self, position: dict[str, Any]) -> dict[str, float]:
        return {
            "x": self.x_min + float(position["x"]) * (self.x_max - self.x_min),
            "y": self.y_min + float(position["y"]) * (self.y_max - self.y_min),
        }

    def box(self, box: dict[str, Any]) -> dict[str, float]:
        top_left = self.point({"x": box["xMin"], "y": box["yMin"]})
        bottom_right = self.point({"x": box["xMax"], "y": box["yMax"]})
        return {
            "xMin": top_left["x"],
            "yMin": top_left["y"],
            "xMax": bottom_right["x"],
            "yMax": bottom_right["y"],
        }

    def to_json(self) -> dict[str, float]:
        return {
            "xMin": self.x_min,
            "yMin": self.y_min,
            "xMax": self.x_max,
            "yMax": self.y_max,
        }


def _safe_id(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]+", "-", value).strip("-") or "region"


def _crop_region(source: Image.Image, box: dict[str, Any], output: Path) -> CropTransform:
    width, height = source.size
    left = max(0, min(width - 1, math.floor(float(box["xMin"]) * width)))
    top = max(0, min(height - 1, math.floor(float(box["yMin"]) * height)))
    right = max(left + 1, min(width, math.ceil(float(box["xMax"]) * width)))
    bottom = max(top + 1, min(height, math.ceil(float(box["yMax"]) * height)))
    output.parent.mkdir(parents=True, exist_ok=True)
    source.crop((left, top, right, bottom)).save(output)
    return CropTransform(left / width, top / height, right / width, bottom / height)


def globalize_region_proposal(
    proposal: dict[str, Any],
    *,
    transform: CropTransform,
    namespace: str,
    component_id: str,
) -> dict[str, Any]:
    result = deepcopy(proposal)
    region_ids = {
        region["id"]: f'{namespace}/{region["id"]}'
        for region in result["regions"]
    }
    port_ids = {
        port["id"]: f'{namespace}/{port["id"]}'
        for region in result["regions"]
        for port in region.get("ports", [])
    }
    for region in result["regions"]:
        region["id"] = region_ids[region["id"]]
        region["componentId"] = component_id
        region["box"] = transform.box(region["box"])
        for port in region.get("ports", []):
            port["id"] = port_ids[port["id"]]
            port["connectsTo"] = port_ids[port["connectsTo"]]
            port["position"] = transform.point(port["position"])
    result["symmetryGroups"] = [
        [region_ids[region_id] for region_id in group]
        for group in result.get("symmetryGroups", [])
    ]
    return result


def _point_box_distance(position: dict[str, Any], box: dict[str, Any]) -> float:
    x = float(position["x"])
    y = float(position["y"])
    dx = max(float(box["xMin"]) - x, 0.0, x - float(box["xMax"]))
    dy = max(float(box["yMin"]) - y, 0.0, y - float(box["yMax"]))
    return math.hypot(dx, dy)


def assign_boundary_ports(
    boundary_ports: list[dict[str, Any]],
    child_regions: list[dict[str, Any]],
    *,
    tolerance: float = 0.08,
) -> tuple[dict[str, str], tuple[str, ...]]:
    assignments: dict[str, str] = {}
    errors: list[str] = []
    for port in boundary_ports:
        candidates = sorted(
            (
                (_point_box_distance(port["position"], region["box"]), region)
                for region in child_regions
            ),
            key=lambda item: (
                item[0],
                (float(item[1]["box"]["xMax"]) - float(item[1]["box"]["xMin"]))
                * (float(item[1]["box"]["yMax"]) - float(item[1]["box"]["yMin"])),
            ),
        )
        if not candidates or candidates[0][0] > tolerance:
            errors.append(
                f'boundary port {port["id"]} cannot be assigned to a child region'
            )
            continue
        assignments[port["id"]] = candidates[0][1]["id"]
    return assignments, tuple(errors)


def validate_subdivision(
    parent_region: dict[str, Any],
    child_proposal: dict[str, Any],
    boundary_ports: list[dict[str, Any]],
) -> tuple[dict[str, str], tuple[str, ...]]:
    errors: list[str] = []
    child_regions = child_proposal["regions"]
    parent_area = (
        float(parent_region["box"]["xMax"]) - float(parent_region["box"]["xMin"])
    ) * (
        float(parent_region["box"]["yMax"]) - float(parent_region["box"]["yMin"])
    )
    for child in child_regions:
        child_area = (
            float(child["box"]["xMax"]) - float(child["box"]["xMin"])
        ) * (
            float(child["box"]["yMax"]) - float(child["box"]["yMin"])
        )
        if child_area >= parent_area * 0.98:
            errors.append(
                f'child region {child["id"]} does not reduce the parent search area'
            )

    parent_heavy = int(parent_region["complexity"]["estimatedHeavyAtoms"])
    child_heavy = sum(
        int(child["complexity"]["estimatedHeavyAtoms"])
        for child in child_regions
    )
    if parent_heavy and not parent_heavy * 0.65 <= child_heavy <= parent_heavy * 1.35:
        errors.append(
            "subdivision heavy-atom estimates are inconsistent: "
            f"children={child_heavy}, parent={parent_heavy}"
        )

    assignments, assignment_errors = assign_boundary_ports(
        boundary_ports,
        child_regions,
    )
    errors.extend(assignment_errors)
    return assignments, tuple(errors)


def _proposal_edges(proposal: dict[str, Any]) -> list[dict[str, str]]:
    owners = {
        port["id"]: region["id"]
        for region in proposal["regions"]
        for port in region.get("ports", [])
    }
    ports = {
        port["id"]: port
        for region in proposal["regions"]
        for port in region.get("ports", [])
    }
    edges: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()
    for port_id, port in ports.items():
        peer_id = port["connectsTo"]
        key = tuple(sorted((port_id, peer_id)))
        if key in seen:
            continue
        seen.add(key)
        edges.append({
            "portA": port_id,
            "portB": peer_id,
            "kind": port["kind"],
            "regionA": owners[port_id],
            "regionB": owners[peer_id],
        })
    return edges


def _compile_leaf_graph(
    nodes: dict[str, dict[str, Any]],
    edges: list[dict[str, str]],
) -> dict[str, Any]:
    def resolve_owner(node_id: str, port_id: str) -> str:
        visited: set[str] = set()
        while node_id not in visited:
            visited.add(node_id)
            assignment = nodes[node_id]["subdivision"]["boundaryPortAssignments"].get(port_id)
            if not assignment:
                return node_id
            node_id = assignment
        raise ValueError(f"cyclic region hierarchy at {node_id}")

    leaf_ids = sorted(
        node_id
        for node_id, node in nodes.items()
        if node["subdivision"]["status"] != "expanded"
    )
    compiled_edges = []
    for edge in edges:
        compiled = dict(edge)
        compiled["regionA"] = resolve_owner(edge["regionA"], edge["portA"])
        compiled["regionB"] = resolve_owner(edge["regionB"], edge["portB"])
        compiled_edges.append(compiled)
    return {
        "regions": [nodes[node_id]["region"] for node_id in leaf_ids],
        "edges": compiled_edges,
    }


def run_region_tree(
    *,
    image: Path,
    client: JsonVisionClient,
    run_id: str | None = None,
    max_depth: int = 2,
    max_children: int = 8,
    max_attempts: int = 3,
    work_dir: Path = DEFAULT_WORK_DIR,
) -> RegionTreeRun:
    if max_depth < 0:
        raise ValueError("max_depth must be non-negative")
    if max_children < 2:
        raise ValueError("max_children must be at least 2")
    resolved_image = image.resolve()
    if not resolved_image.is_file():
        raise FileNotFoundError(resolved_image)
    identifier = run_id or datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    run_dir = work_dir / "region-trees" / identifier
    run_dir.mkdir(parents=True, exist_ok=False)
    source_path = run_dir / "source" / resolved_image.name
    source_path.parent.mkdir()
    shutil.copy2(resolved_image, source_path)
    source = Image.open(resolved_image).convert("RGB")

    root_run = run_region_proposal(
        image=resolved_image,
        client=client,
        run_id="root",
        max_attempts=max_attempts,
        work_dir=run_dir / "planner" / "root",
    )
    errors: list[str] = []
    warnings: list[str] = []
    nodes: dict[str, dict[str, Any]] = {}
    edges: list[dict[str, str]] = []

    if not root_run.validation.valid:
        errors.extend(f"root: {error}" for error in root_run.validation.errors)
    else:
        edges.extend(_proposal_edges(root_run.proposal))
        for region in root_run.proposal["regions"]:
            nodes[region["id"]] = {
                "nodeId": region["id"],
                "parentNodeId": None,
                "depth": 0,
                "region": deepcopy(region),
                "inheritedPorts": [],
                "subdivision": {
                    "status": "leaf",
                    "plannerRun": None,
                    "children": [],
                    "boundaryPortAssignments": {},
                    "diagnostics": [],
                },
            }

    def expand(node_id: str) -> None:
        node = nodes[node_id]
        region = node["region"]
        if not region["needsSubdivision"]:
            return
        if node["depth"] >= max_depth:
            node["subdivision"]["status"] = "max-depth"
            warning = f"{node_id}: requires subdivision beyond max_depth={max_depth}"
            node["subdivision"]["diagnostics"].append(warning)
            warnings.append(warning)
            return

        crop_path = run_dir / "crops" / f'{_safe_id(node_id)}.png'
        transform = _crop_region(source, region["box"], crop_path)
        planner_work = run_dir / "planner" / _safe_id(node_id)
        child_run: RegionRun = run_region_proposal(
            image=crop_path,
            client=client,
            run_id="children",
            min_regions=2,
            max_regions=max_children,
            max_attempts=max_attempts,
            work_dir=planner_work,
        )
        node["subdivision"]["plannerRun"] = str(child_run.run_dir.relative_to(run_dir))
        if not child_run.validation.valid:
            node["subdivision"]["status"] = "planner-rejected"
            diagnostics = [
                f"{node_id}: child planner: {error}"
                for error in child_run.validation.errors
            ]
            node["subdivision"]["diagnostics"].extend(diagnostics)
            warnings.extend(diagnostics)
            return

        child_proposal = globalize_region_proposal(
            child_run.proposal,
            transform=transform,
            namespace=node_id,
            component_id=region["componentId"],
        )
        global_validation = validate_region_proposal(
            child_proposal,
            min_regions=2,
            max_regions=max_children,
        )
        boundary_ports = [*region.get("ports", []), *node["inheritedPorts"]]
        assignments, subdivision_errors = validate_subdivision(
            region,
            child_proposal,
            boundary_ports,
        )
        diagnostics = [*global_validation.errors, *subdivision_errors]
        if diagnostics:
            node["subdivision"]["status"] = "subdivision-rejected"
            qualified = [f"{node_id}: {error}" for error in diagnostics]
            node["subdivision"]["diagnostics"].extend(qualified)
            warnings.extend(qualified)
            return

        child_by_id = {child["id"]: child for child in child_proposal["regions"]}
        for child_id, child in child_by_id.items():
            inherited = [
                deepcopy(port)
                for port in boundary_ports
                if assignments.get(port["id"]) == child_id
            ]
            nodes[child_id] = {
                "nodeId": child_id,
                "parentNodeId": node_id,
                "depth": node["depth"] + 1,
                "region": child,
                "inheritedPorts": inherited,
                "subdivision": {
                    "status": "leaf",
                    "plannerRun": None,
                    "children": [],
                    "boundaryPortAssignments": {},
                    "diagnostics": [],
                },
            }
        edges.extend(_proposal_edges(child_proposal))
        node["subdivision"].update({
            "status": "expanded",
            "children": sorted(child_by_id),
            "boundaryPortAssignments": assignments,
            "crop": str(crop_path.relative_to(run_dir)),
            "cropTransform": transform.to_json(),
        })
        for child_id in sorted(child_by_id):
            expand(child_id)

    for root_id in sorted(nodes):
        if nodes[root_id]["parentNodeId"] is None:
            expand(root_id)

    leaf_graph = _compile_leaf_graph(nodes, edges) if nodes else {"regions": [], "edges": []}
    validation = RegionTreeValidation(tuple(errors), tuple(warnings))
    tree = {
        "schemaVersion": 1,
        "segmentationPolicy": "recursive-chemical-region-tree-v1",
        "image": str(resolved_image),
        "rootPlannerRun": str(root_run.run_dir.relative_to(run_dir)),
        "settings": {
            "maxDepth": max_depth,
            "maxChildren": max_children,
            "maxAttempts": max_attempts,
        },
        "nodes": [nodes[node_id] for node_id in sorted(nodes)],
        "leafGraph": leaf_graph,
        "validation": validation.to_json(),
    }
    (run_dir / "region-tree.json").write_text(
        json.dumps(tree, ensure_ascii=False, indent=2) + "\n"
    )
    return RegionTreeRun(run_dir, tree, validation)
