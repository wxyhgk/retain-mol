from __future__ import annotations

import json
import re
from copy import deepcopy
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageEnhance, ImageFont

from .contracts import DEFAULT_WORK_DIR
from .topology_audit import JsonVisionClient


PORT_KINDS = {"new-bond", "shared-atom", "shared-edge"}
REGION_KINDS = {
    "ring-system",
    "branch",
    "linker",
    "functional-group",
    "coordination-core",
    "unresolved",
}
DEFAULT_MIN_REGIONS = 1
DEFAULT_MAX_REGIONS = 16
DEFAULT_MIN_INK_COVERAGE = 0.96
INK_COLOR_DISTANCE = 45.0
BOX_COVERAGE_TOLERANCE = 0.005


@dataclass(frozen=True)
class RegionValidation:
    errors: tuple[str, ...]

    @property
    def valid(self) -> bool:
        return not self.errors

    def to_json(self) -> dict[str, Any]:
        return {"valid": self.valid, "errors": list(self.errors)}


@dataclass(frozen=True)
class RegionRun:
    run_dir: Path
    proposal: dict[str, Any]
    validation: RegionValidation
    attempt_count: int


@dataclass(frozen=True)
class RegionImageCoverage:
    ink_pixels: int
    covered_pixels: int
    multiply_covered_pixels: int

    @property
    def coverage(self) -> float:
        return self.covered_pixels / self.ink_pixels if self.ink_pixels else 1.0

    @property
    def overlap(self) -> float:
        return self.multiply_covered_pixels / self.ink_pixels if self.ink_pixels else 0.0

    def to_json(self) -> dict[str, Any]:
        return {
            "inkPixels": self.ink_pixels,
            "coveredPixels": self.covered_pixels,
            "multiplyCoveredPixels": self.multiply_covered_pixels,
            "coverage": round(self.coverage, 6),
            "overlap": round(self.overlap, 6),
        }


def repair_reciprocal_port_connections(
    proposal: dict[str, Any],
) -> tuple[dict[str, Any], tuple[dict[str, str], ...]]:
    """Repair only unambiguous one-sided port references; never infer chemistry."""
    repaired = deepcopy(proposal)
    ports = {
        port.get("id"): port
        for region in repaired.get("regions", [])
        if isinstance(region, dict)
        for port in region.get("ports", [])
        if isinstance(port, dict) and isinstance(port.get("id"), str)
    }
    incoming: dict[str, list[str]] = {}
    for port_id, port in ports.items():
        peer_id = port.get("connectsTo")
        if isinstance(peer_id, str):
            incoming.setdefault(peer_id, []).append(port_id)

    repairs: list[dict[str, str]] = []
    for target_id, source_ids in incoming.items():
        if len(source_ids) != 1 or target_id not in ports:
            continue
        source_id = source_ids[0]
        target = ports[target_id]
        source = ports[source_id]
        previous_peer = target.get("connectsTo")
        if previous_peer == source_id:
            continue
        if source.get("kind") != target.get("kind"):
            continue
        previous = ports.get(previous_peer)
        if previous is None or previous.get("connectsTo") == target_id:
            continue
        target["connectsTo"] = source_id
        repairs.append({
            "portId": target_id,
            "from": str(previous_peer),
            "to": source_id,
            "reason": "unique-reverse-reference",
        })
    return repaired, tuple(repairs)


def _coordinate(value: Any, field: str, errors: list[str]) -> float | None:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        errors.append(f"{field} must be a number")
        return None
    number = float(value)
    if not 0 <= number <= 1:
        errors.append(f"{field} must be within [0, 1]")
        return None
    return number


def validate_region_proposal(
    proposal: dict[str, Any],
    *,
    min_regions: int = DEFAULT_MIN_REGIONS,
    max_regions: int = DEFAULT_MAX_REGIONS,
) -> RegionValidation:
    errors: list[str] = []
    regions = proposal.get("regions")
    if not isinstance(regions, list):
        return RegionValidation(("regions must be an array",))
    region_ids: set[str] = set()
    port_ids: set[str] = set()
    connections: dict[str, str] = {}
    port_owners: dict[str, str] = {}
    port_kinds: dict[str, str] = {}
    component_regions: dict[str, set[str]] = {}
    region_edges: set[tuple[str, str]] = set()
    if not min_regions <= len(regions) <= max_regions:
        errors.append(
            f"region count must be within [{min_regions}, {max_regions}], received {len(regions)}"
        )
    for index, region in enumerate(regions):
        prefix = f"regions[{index}]"
        if not isinstance(region, dict):
            errors.append(f"{prefix} must be an object")
            continue
        region_id = region.get("id")
        kind = region.get("kind")
        component_id = region.get("componentId", "component-1")
        if not isinstance(region_id, str) or not region_id:
            errors.append(f"{prefix}.id must be a non-empty string")
        elif region_id in region_ids:
            errors.append(f"duplicate region id {region_id}")
        else:
            region_ids.add(region_id)
            if isinstance(component_id, str) and component_id:
                component_regions.setdefault(component_id, set()).add(region_id)
        if kind not in REGION_KINDS:
            errors.append(f"{prefix}.kind must be one of {sorted(REGION_KINDS)}")
        if not isinstance(component_id, str) or not component_id:
            errors.append(f"{prefix}.componentId must be a non-empty string")
        needs_subdivision = region.get("needsSubdivision")
        if not isinstance(needs_subdivision, bool):
            errors.append(f"{prefix}.needsSubdivision must be a boolean")
        complexity = region.get("complexity")
        if not isinstance(complexity, dict):
            errors.append(f"{prefix}.complexity must be an object")
        else:
            for field in ("estimatedHeavyAtoms", "estimatedCycleRank"):
                value = complexity.get(field)
                if isinstance(value, bool) or not isinstance(value, int) or value < 0:
                    errors.append(f"{prefix}.complexity.{field} must be a non-negative integer")
        box = region.get("box")
        region_box: tuple[float, float, float, float] | None = None
        if not isinstance(box, dict):
            errors.append(f"{prefix}.box must be an object")
        else:
            x_min = _coordinate(box.get("xMin"), f"{prefix}.box.xMin", errors)
            y_min = _coordinate(box.get("yMin"), f"{prefix}.box.yMin", errors)
            x_max = _coordinate(box.get("xMax"), f"{prefix}.box.xMax", errors)
            y_max = _coordinate(box.get("yMax"), f"{prefix}.box.yMax", errors)
            if None not in (x_min, x_max) and x_min >= x_max:
                errors.append(f"{prefix}.box requires xMin < xMax")
            if None not in (y_min, y_max) and y_min >= y_max:
                errors.append(f"{prefix}.box requires yMin < yMax")
            if None not in (x_min, y_min, x_max, y_max) and x_min < x_max and y_min < y_max:
                region_box = (x_min, y_min, x_max, y_max)
        ports = region.get("ports", [])
        if not isinstance(ports, list):
            errors.append(f"{prefix}.ports must be an array")
            continue
        for port_index, port in enumerate(ports):
            port_prefix = f"{prefix}.ports[{port_index}]"
            if not isinstance(port, dict):
                errors.append(f"{port_prefix} must be an object")
                continue
            port_id = port.get("id")
            if not isinstance(port_id, str) or not port_id:
                errors.append(f"{port_prefix}.id must be a non-empty string")
            elif port_id in port_ids:
                errors.append(f"duplicate port id {port_id}")
            else:
                port_ids.add(port_id)
                if isinstance(region_id, str) and region_id:
                    port_owners[port_id] = region_id
            port_kind = port.get("kind")
            if port_kind not in PORT_KINDS:
                errors.append(f"{port_prefix}.kind must be one of {sorted(PORT_KINDS)}")
            elif isinstance(port_id, str) and port_id:
                port_kinds[port_id] = port_kind
            position = port.get("position")
            if not isinstance(position, dict):
                errors.append(f"{port_prefix}.position must be an object")
            else:
                port_x = _coordinate(position.get("x"), f"{port_prefix}.position.x", errors)
                port_y = _coordinate(position.get("y"), f"{port_prefix}.position.y", errors)
                if region_box is not None and port_x is not None and port_y is not None:
                    x_min, y_min, x_max, y_max = region_box
                    if not (x_min <= port_x <= x_max and y_min <= port_y <= y_max):
                        errors.append(
                            f"{port_prefix}.position must be inside its region box"
                        )
            connects_to = port.get("connectsTo")
            if not isinstance(connects_to, str) or not connects_to:
                errors.append(f"{port_prefix}.connectsTo must be a non-empty port id")
            elif isinstance(port_id, str) and port_id:
                connections[port_id] = connects_to

    for port_id, peer_id in connections.items():
        if peer_id not in port_ids:
            errors.append(f"port {port_id} references missing peer {peer_id}")
        elif connections.get(peer_id) != port_id:
            errors.append(f"port connection must be reciprocal: {port_id} -> {peer_id}")
        else:
            owner = port_owners.get(port_id)
            peer_owner = port_owners.get(peer_id)
            if owner == peer_owner:
                errors.append(f"port {port_id} must connect to a different region")
            elif owner and peer_owner:
                region_edges.add(tuple(sorted((owner, peer_owner))))
            if port_kinds.get(port_id) != port_kinds.get(peer_id):
                errors.append(f"reciprocal ports must use the same kind: {port_id} <-> {peer_id}")

    symmetry_groups = proposal.get("symmetryGroups", [])
    if not isinstance(symmetry_groups, list):
        errors.append("symmetryGroups must be an array")
    else:
        for index, group in enumerate(symmetry_groups):
            if not isinstance(group, list) or len(group) < 2:
                errors.append(f"symmetryGroups[{index}] must contain at least two region ids")
                continue
            if not all(isinstance(region_id, str) for region_id in group):
                errors.append(f"symmetryGroups[{index}] must contain only region ids")
                continue
            if len(group) != len(set(group)):
                errors.append(f"symmetryGroups[{index}] contains duplicate region ids")
            for region_id in group:
                if region_id not in region_ids:
                    errors.append(f"symmetryGroups[{index}] references missing region {region_id}")

    adjacency = {region_id: set() for region_id in region_ids}
    for left, right in region_edges:
        adjacency[left].add(right)
        adjacency[right].add(left)
    for component_id, members in component_regions.items():
        if len(members) < 2:
            continue
        visited: set[str] = set()
        pending = [next(iter(members))]
        while pending:
            region_id = pending.pop()
            if region_id in visited:
                continue
            visited.add(region_id)
            pending.extend(adjacency[region_id] & members)
        if visited != members:
            errors.append(f"regions in {component_id} must form a connected region graph")
    return RegionValidation(tuple(errors))


def _background_color(source: Image.Image) -> tuple[int, int, int]:
    width, height = source.size
    samples = [
        source.getpixel((0, 0)),
        source.getpixel((width - 1, 0)),
        source.getpixel((0, height - 1)),
        source.getpixel((width - 1, height - 1)),
        source.getpixel((width // 2, 0)),
        source.getpixel((width // 2, height - 1)),
        source.getpixel((0, height // 2)),
        source.getpixel((width - 1, height // 2)),
    ]
    return tuple(
        sorted(pixel[channel] for pixel in samples)[len(samples) // 2]
        for channel in range(3)
    )


def _is_ink(pixel: tuple[int, int, int], background: tuple[int, int, int]) -> bool:
    distance_squared = sum(
        (pixel[channel] - background[channel]) ** 2 for channel in range(3)
    )
    return distance_squared >= INK_COLOR_DISTANCE ** 2


def analyze_region_image_coverage(
    *,
    image: Path,
    proposal: dict[str, Any],
    tolerance: float = BOX_COVERAGE_TOLERANCE,
) -> RegionImageCoverage:
    """Measure whether region boxes cover all visible chemical drawing ink."""
    source = Image.open(image).convert("RGB")
    width, height = source.size
    background = _background_color(source)
    boxes = [
        region["box"]
        for region in proposal.get("regions", [])
        if isinstance(region, dict) and isinstance(region.get("box"), dict)
    ]
    ink_pixels = 0
    covered_pixels = 0
    multiply_covered_pixels = 0
    for y in range(height):
        normalized_y = (y + 0.5) / height
        for x in range(width):
            if not _is_ink(source.getpixel((x, y)), background):
                continue
            ink_pixels += 1
            normalized_x = (x + 0.5) / width
            coverage_count = sum(
                1
                for box in boxes
                if float(box["xMin"]) - tolerance
                <= normalized_x
                <= float(box["xMax"]) + tolerance
                and float(box["yMin"]) - tolerance
                <= normalized_y
                <= float(box["yMax"]) + tolerance
            )
            if coverage_count:
                covered_pixels += 1
            if coverage_count > 1:
                multiply_covered_pixels += 1
    return RegionImageCoverage(
        ink_pixels,
        covered_pixels,
        multiply_covered_pixels,
    )


def validate_region_image_coverage(
    *,
    image: Path,
    proposal: dict[str, Any],
    minimum_coverage: float = DEFAULT_MIN_INK_COVERAGE,
) -> tuple[RegionValidation, RegionImageCoverage]:
    coverage = analyze_region_image_coverage(image=image, proposal=proposal)
    errors: list[str] = []
    if coverage.coverage < minimum_coverage:
        errors.append(
            "region boxes cover only "
            f"{coverage.coverage:.1%} of visible structure ink; required at least "
            f"{minimum_coverage:.1%}. Expand or add chemically meaningful regions "
            "for every omitted substituent."
        )
    return RegionValidation(tuple(errors)), coverage


def _proposal_prompt(min_regions: int, max_regions: int) -> str:
    return f"""你是通用化学结构图的语义分区规划器。只定位区域和区域间的化学连接边界，不生成分子图或 EditPlan。不得假设分子具有中心母核、左右臂、螺芴或任何固定拓扑。

你必须根据当前图片决定 {min_regions} 到 {max_regions} 个区域。区域 id 使用 region-01、region-02 等中性编号。kind 只能是：
- ring-system：应保持完整的稠合、多环或刚性环系；
- branch：由一处边界接出的取代支链；
- linker：连接两个较大区域的桥连单元；
- functional-group：羧酸、硝基等有独立化学语义的官能团；
- coordination-core：金属或配位中心及不能安全拆开的第一配位层；
- unresolved：图片不足以可靠分类的区域。

优先在可旋转的环外单键处切分。螺环共享一个原子，必须使用 shared-atom；普通片段连接使用 new-bond。稠合环默认保持为一个 ring-system，只有单一区域过大时才允许沿完整共享边使用 shared-edge 递归细分。不要按图片左右位置机械切割，也不要切断一个普通苯环。小取代基默认随最近刚性环保留，除非它本身是明确官能团。

每个区域使用归一化矩形 box，坐标范围 0 到 1，原点在图片左上。区域允许重叠，必须完整覆盖其结构，并在可见结构外保留约 5% 余量。每个区域给出估计重原子数和独立环数；当重原子数大于 24 或独立环数大于 5 时设置 needsSubdivision=true，供下一阶段递归处理。

端口类型：
- new-bond：两个片段通过一根普通键连接；
- shared-atom：螺环等结构共享同一个原子；
- shared-edge：并环结构共享两个原子和一条边。

每条连接必须在两侧各声明一个端口，connectsTo 互相引用。端口 position 是共享原子或连接键中点的归一化坐标。端口 id 全局唯一。

只输出以下 JSON：
{{
  "segmentationBasis": "chemical-boundaries",
  "symmetryGroups": [["region-02", "region-03"]],
  "regions": [
    {{
      "id": "region-01",
      "kind": "ring-system",
      "componentId": "component-1",
      "label": "可读的局部结构名称",
      "box": {{"xMin": 0.0, "yMin": 0.0, "xMax": 1.0, "yMax": 1.0}},
      "complexity": {{"estimatedHeavyAtoms": 12, "estimatedCycleRank": 2}},
      "needsSubdivision": false,
      "ports": [
        {{"id": "port-01-a", "kind": "new-bond", "position": {{"x": 0.4, "y": 0.5}}, "connectsTo": "port-02-a"}}
      ]
    }}
  ]
}}

如果图片包含多个不成键的分子或离子，用不同 componentId；同一 componentId 内的区域必须通过端口形成连通图。每条连接必须在两侧各声明一个端口，connectsTo 互相引用且 kind 相同。new-bond 的两个 position 分别位于各自区域的成键端点；shared-atom/shared-edge 的 position 位于共享位置。端口 id 全局唯一。没有可靠对称关系时 symmetryGroups 返回空数组。最终只输出 JSON。"""


def _retry_prompt(
    previous: dict[str, Any],
    errors: tuple[str, ...],
    min_regions: int,
    max_regions: int,
) -> str:
    return (
        _proposal_prompt(min_regions, max_regions)
        + "\n上一轮区域提案：\n"
        + json.dumps(previous, ensure_ascii=False)
        + "\n外部校验错误：\n- "
        + "\n- ".join(errors)
        + "\n请重新查看原图并返回完整修正版。"
    )


def _pixel_box(box: dict[str, Any], width: int, height: int) -> tuple[int, int, int, int]:
    return (
        round(float(box["xMin"]) * width),
        round(float(box["yMin"]) * height),
        round(float(box["xMax"]) * width),
        round(float(box["yMax"]) * height),
    )


def render_region_proposal(
    *,
    image: Path,
    proposal: dict[str, Any],
    output_dir: Path,
) -> None:
    source = Image.open(image).convert("RGB")
    width, height = source.size
    output_dir.mkdir(parents=True, exist_ok=True)
    colors = ["#0f172a", "#2563eb", "#dc2626", "#059669", "#9333ea"]
    font_size = max(14, width // 70)
    font_path = Path("/System/Library/Fonts/Hiragino Sans GB.ttc")
    font = (
        ImageFont.truetype(str(font_path), size=font_size)
        if font_path.exists()
        else ImageFont.load_default(size=font_size)
    )
    overview = source.copy()
    overview_draw = ImageDraw.Draw(overview)
    port_lookup: dict[str, tuple[int, int, str]] = {}
    for index, region in enumerate(proposal["regions"]):
        color = colors[index % len(colors)]
        pixel_box = _pixel_box(region["box"], width, height)
        overview_draw.rectangle(pixel_box, outline=color, width=max(3, width // 300))
        overview_draw.text(
            (pixel_box[0] + 6, pixel_box[1] + 4),
            f'{index + 1} {region.get("label", region["kind"])}',
            fill=color,
            font=font,
            stroke_width=2,
            stroke_fill="white",
        )
        for port in region.get("ports", []):
            position = port["position"]
            port_lookup[port["id"]] = (
                round(float(position["x"]) * width),
                round(float(position["y"]) * height),
                color,
            )
    drawn_connections: set[tuple[str, str]] = set()
    for region in proposal["regions"]:
        for port in region.get("ports", []):
            connection = tuple(sorted((port["id"], port["connectsTo"])))
            if connection in drawn_connections or port["connectsTo"] not in port_lookup:
                continue
            drawn_connections.add(connection)
            start_x, start_y, _ = port_lookup[port["id"]]
            end_x, end_y, _ = port_lookup[port["connectsTo"]]
            overview_draw.line(
                (start_x, start_y, end_x, end_y),
                fill="#111827",
                width=max(2, width // 500),
            )
    for port_id, (x, y, color) in port_lookup.items():
        radius = max(7, width // 120)
        overview_draw.ellipse(
            (x - radius, y - radius, x + radius, y + radius),
            fill="white",
            outline=color,
            width=3,
        )
        overview_draw.text(
            (x + radius + 2, y - radius),
            port_id,
            fill=color,
            font=font,
            stroke_width=2,
            stroke_fill="white",
        )
    overview.save(output_dir / "regions-overview.png")

    background = _background_color(source)
    uncovered = source.copy()
    uncovered_pixels = uncovered.load()
    region_boxes = [region["box"] for region in proposal["regions"]]
    for y in range(height):
        normalized_y = (y + 0.5) / height
        for x in range(width):
            pixel = source.getpixel((x, y))
            if not _is_ink(pixel, background):
                continue
            normalized_x = (x + 0.5) / width
            is_covered = any(
                float(box["xMin"]) - BOX_COVERAGE_TOLERANCE
                <= normalized_x
                <= float(box["xMax"]) + BOX_COVERAGE_TOLERANCE
                and float(box["yMin"]) - BOX_COVERAGE_TOLERANCE
                <= normalized_y
                <= float(box["yMax"]) + BOX_COVERAGE_TOLERANCE
                for box in region_boxes
            )
            if not is_covered:
                uncovered_pixels[x, y] = (239, 68, 68)
    uncovered.save(output_dir / "regions-uncovered.png")

    for index, region in enumerate(proposal["regions"]):
        color = colors[index % len(colors)]
        pixel_box = _pixel_box(region["box"], width, height)
        dimmed = ImageEnhance.Contrast(source).enhance(0.35)
        white = Image.new("RGB", source.size, "white")
        dimmed = Image.blend(dimmed, white, 0.72)
        highlighted = dimmed.copy()
        highlighted.paste(source.crop(pixel_box), pixel_box[:2])
        draw = ImageDraw.Draw(highlighted)
        draw.rectangle(pixel_box, outline=color, width=max(4, width // 250))
        draw.text(
            (pixel_box[0] + 8, max(4, pixel_box[1] + 6)),
            region.get("label", region["kind"]),
            fill=color,
            font=font,
            stroke_width=2,
            stroke_fill="white",
        )
        for port in region.get("ports", []):
            position = port["position"]
            x = round(float(position["x"]) * width)
            y = round(float(position["y"]) * height)
            radius = max(8, width // 90)
            draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill="white", outline=color, width=3)
            draw.text((x + radius + 3, y - radius), port["id"], fill=color, font=font, stroke_width=2, stroke_fill="white")
        safe_id = re.sub(r"[^A-Za-z0-9._-]+", "-", region["id"])
        highlighted.save(output_dir / f'{index + 1:02d}-{safe_id}-highlight.png')

        margin_x = round((pixel_box[2] - pixel_box[0]) * 0.12)
        margin_y = round((pixel_box[3] - pixel_box[1]) * 0.12)
        crop_box = (
            max(0, pixel_box[0] - margin_x),
            max(0, pixel_box[1] - margin_y),
            min(width, pixel_box[2] + margin_x),
            min(height, pixel_box[3] + margin_y),
        )
        source.crop(crop_box).save(output_dir / f'{index + 1:02d}-{safe_id}-crop.png')


def run_region_proposal(
    *,
    image: Path,
    client: JsonVisionClient,
    min_regions: int = DEFAULT_MIN_REGIONS,
    max_regions: int = DEFAULT_MAX_REGIONS,
    run_id: str | None = None,
    max_attempts: int = 3,
    work_dir: Path = DEFAULT_WORK_DIR,
) -> RegionRun:
    if max_attempts < 1:
        raise ValueError("max_attempts must be at least 1")
    if min_regions < 1 or max_regions < min_regions:
        raise ValueError("region bounds must satisfy 1 <= min_regions <= max_regions")
    resolved_image = image.resolve()
    if not resolved_image.is_file():
        raise FileNotFoundError(resolved_image)
    identifier = run_id or datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    run_dir = work_dir / "regions" / identifier
    run_dir.mkdir(parents=True, exist_ok=False)
    prompt = _proposal_prompt(min_regions, max_regions)
    proposal: dict[str, Any] = {}
    validation = RegionValidation(("No attempt completed",))
    previous: dict[str, Any] | None = None
    for attempt in range(1, max_attempts + 1):
        attempt_dir = run_dir / f"attempt-{attempt:02d}"
        attempt_dir.mkdir()
        (attempt_dir / "prompt.txt").write_text(prompt + "\n")
        try:
            response = client.complete_json(prompt=prompt, image=resolved_image)
        except Exception as error:
            validation = RegionValidation((f"provider-error: {error}",))
            (attempt_dir / "provider-error.json").write_text(
                json.dumps({"type": type(error).__name__, "message": str(error)}, ensure_ascii=False, indent=2) + "\n"
            )
            continue
        raw_proposal = response["payload"]
        proposal, repairs = repair_reciprocal_port_connections(raw_proposal)
        validation = validate_region_proposal(
            proposal,
            min_regions=min_regions,
            max_regions=max_regions,
        )
        coverage: RegionImageCoverage | None = None
        if validation.valid:
            coverage_validation, coverage = validate_region_image_coverage(
                image=resolved_image,
                proposal=proposal,
            )
            validation = RegionValidation(
                validation.errors + coverage_validation.errors
            )
        if repairs:
            (attempt_dir / "proposal.raw.json").write_text(
                json.dumps(raw_proposal, ensure_ascii=False, indent=2) + "\n"
            )
            (attempt_dir / "repairs.json").write_text(
                json.dumps(list(repairs), ensure_ascii=False, indent=2) + "\n"
            )
        (attempt_dir / "proposal.json").write_text(json.dumps(proposal, ensure_ascii=False, indent=2) + "\n")
        (attempt_dir / "validation.json").write_text(json.dumps(validation.to_json(), ensure_ascii=False, indent=2) + "\n")
        if coverage is not None:
            (attempt_dir / "coverage.json").write_text(
                json.dumps(coverage.to_json(), ensure_ascii=False, indent=2) + "\n"
            )
        if response.get("providerResponse") is not None:
            (attempt_dir / "provider-response.json").write_text(json.dumps(response["providerResponse"], ensure_ascii=False, indent=2) + "\n")
        if validation.valid:
            break
        if proposal == previous:
            validation = RegionValidation(validation.errors + (
                "planner-stagnated: response is identical to the previous invalid attempt",
            ))
            (attempt_dir / "validation.json").write_text(json.dumps(validation.to_json(), ensure_ascii=False, indent=2) + "\n")
            break
        previous = proposal
        prompt = _retry_prompt(proposal, validation.errors, min_regions, max_regions)
    if validation.valid:
        render_region_proposal(image=resolved_image, proposal=proposal, output_dir=run_dir / "images")
    (run_dir / "result.json").write_text(json.dumps({
        "schemaVersion": 2,
        "image": str(resolved_image),
        "attemptCount": attempt,
        "segmentationPolicy": "dynamic-chemical-region-graph-v1",
        "regionBounds": {"min": min_regions, "max": max_regions},
        "proposal": proposal,
        "validation": validation.to_json(),
    }, ensure_ascii=False, indent=2) + "\n")
    return RegionRun(run_dir, proposal, validation, attempt)
