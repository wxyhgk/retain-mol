from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Protocol

from .contracts import DEFAULT_WORK_DIR


class JsonVisionClient(Protocol):
    def complete_json(
        self,
        *,
        prompt: str,
        image: Path,
        max_tokens: int = 4096,
        temperature: float = 0.0,
    ) -> dict[str, Any]: ...


@dataclass(frozen=True)
class AuditValidation:
    errors: tuple[str, ...]

    @property
    def valid(self) -> bool:
        return not self.errors

    def to_json(self) -> dict[str, Any]:
        return {"valid": self.valid, "errors": list(self.errors)}


@dataclass(frozen=True)
class AuditRun:
    run_dir: Path
    audit: dict[str, Any]
    validation: AuditValidation
    attempt_count: int


FORMULA_PART = re.compile(r"([A-Z][a-z]?)(\d*)")


def _integer(value: Any, field: str, errors: list[str]) -> int | None:
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        errors.append(f"{field} must be a non-negative integer")
        return None
    return value


def _formula_counts(formula: Any) -> dict[str, int] | None:
    if not isinstance(formula, str) or not formula:
        return None
    parts = FORMULA_PART.findall(formula)
    if not parts or "".join(symbol + count for symbol, count in parts) != formula:
        return None
    counts: dict[str, int] = {}
    for symbol, count in parts:
        counts[symbol] = counts.get(symbol, 0) + (int(count) if count else 1)
    return counts


def validate_topology_audit(payload: dict[str, Any]) -> AuditValidation:
    errors: list[str] = []
    element_counts = payload.get("elementCounts")
    if not isinstance(element_counts, dict) or not element_counts:
        errors.append("elementCounts must be a non-empty object")
        element_counts = {}
    normalized_elements: dict[str, int] = {}
    for symbol, value in element_counts.items():
        if not isinstance(symbol, str) or not re.fullmatch(r"[A-Z][a-z]?", symbol):
            errors.append(f"elementCounts contains invalid symbol {symbol!r}")
            continue
        count = _integer(value, f"elementCounts.{symbol}", errors)
        if count is not None:
            normalized_elements[symbol] = count

    heavy_atom_count = _integer(payload.get("heavyAtomCount"), "heavyAtomCount", errors)
    edge_count = _integer(payload.get("edgeCount"), "edgeCount", errors)
    cycle_rank = _integer(
        payload.get("independentCycleRank"), "independentCycleRank", errors,
    )
    implicit_hydrogens = _integer(
        payload.get("implicitHydrogenCount"), "implicitHydrogenCount", errors,
    )
    component_count = _integer(
        payload.get("connectedComponentCount"), "connectedComponentCount", errors,
    )
    if component_count is not None and component_count != 1:
        errors.append("connectedComponentCount must be 1 for the benchmark molecule")

    if heavy_atom_count is not None and sum(normalized_elements.values()) != heavy_atom_count:
        errors.append(
            "sum(elementCounts) does not equal heavyAtomCount: "
            f"{sum(normalized_elements.values())} != {heavy_atom_count}"
        )
    if None not in (edge_count, heavy_atom_count, cycle_rank, component_count):
        expected_rank = edge_count - heavy_atom_count + component_count
        if cycle_rank != expected_rank:
            errors.append(
                "independentCycleRank does not satisfy E-V+C: "
                f"{cycle_rank} != {edge_count}-{heavy_atom_count}+{component_count}"
            )

    fragments = payload.get("fragments")
    if not isinstance(fragments, list) or not fragments:
        errors.append("fragments must be a non-empty array")
        fragments = []
    owned_sum = 0
    fragment_rank_sum = 0
    for index, fragment in enumerate(fragments):
        prefix = f"fragments[{index}]"
        if not isinstance(fragment, dict):
            errors.append(f"{prefix} must be an object")
            continue
        if not isinstance(fragment.get("name"), str) or not fragment["name"].strip():
            errors.append(f"{prefix}.name must be a non-empty string")
        owned = _integer(fragment.get("ownedHeavyAtoms"), f"{prefix}.ownedHeavyAtoms", errors)
        rank = _integer(fragment.get("cycleRankContribution"), f"{prefix}.cycleRankContribution", errors)
        if owned is not None:
            owned_sum += owned
        if rank is not None and owned is not None and owned == 0 and rank > 0:
            errors.append(f"{prefix} cannot contribute cycles without owning atoms")
        if rank is not None:
            fragment_rank_sum += rank
    if heavy_atom_count is not None and owned_sum != heavy_atom_count:
        errors.append(
            "sum(fragments[].ownedHeavyAtoms) does not equal heavyAtomCount: "
            f"{owned_sum} != {heavy_atom_count}"
        )
    if cycle_rank is not None and fragment_rank_sum != cycle_rank:
        errors.append(
            "sum(fragments[].cycleRankContribution) does not equal independentCycleRank: "
            f"{fragment_rank_sum} != {cycle_rank}"
        )

    formula_counts = _formula_counts(payload.get("inferredFormula"))
    if formula_counts is None:
        errors.append("inferredFormula must be a plain molecular formula")
    else:
        for symbol, count in normalized_elements.items():
            if formula_counts.get(symbol, 0) != count:
                errors.append(
                    f"inferredFormula {symbol} count does not match elementCounts: "
                    f"{formula_counts.get(symbol, 0)} != {count}"
                )
        formula_h = formula_counts.get("H", 0)
        if implicit_hydrogens is not None and formula_h != implicit_hydrogens:
            errors.append(
                "inferredFormula H count does not match implicitHydrogenCount: "
                f"{formula_h} != {implicit_hydrogens}"
            )
    return AuditValidation(tuple(errors))


BASE_PROMPT = """你是 RetainMol 的化学结构图拓扑审计员。此阶段只分析二维图片，不生成坐标或 EditPlan。

从中心向外逐环核对所有明确画出的重原子。线条交叉不是原子；稠环共享原子只能归入一个所有权片段，不能重复计数。图片未画出的氢按中性价态推断。

最终只能输出一个 JSON 对象，字段为：
{
  "elementCounts": {"C": 0},
  "heavyAtomCount": 0,
  "edgeCount": 0,
  "connectedComponentCount": 1,
  "independentCycleRank": 0,
  "implicitHydrogenCount": 0,
  "inferredFormula": "C0H0",
  "fragments": [
    {"name": "片段名", "ownedHeavyAtoms": 0, "cycleRankContribution": 0,
     "attachments": ["与其他片段连接关系"]}
  ],
  "symmetry": "对称关系",
  "ambiguities": ["仍不确定的局部"]
}

硬性规则：
1. elementCounts 的和必须等于 heavyAtomCount。
2. fragments 的 ownedHeavyAtoms 之和必须等于 heavyAtomCount。
3. independentCycleRank 必须严格等于 edgeCount-heavyAtomCount+connectedComponentCount。
4. inferredFormula 必须与 elementCounts 和 implicitHydrogenCount 完全一致。
5. 不得输出模型自行声称的 checkSums；校验由外部程序完成。
6. 底部刚性稠环、螺中心、B/N/F 等杂原子需要单独列为可审计片段。
"""


def _retry_prompt(previous: dict[str, Any], errors: tuple[str, ...]) -> str:
    return (
        BASE_PROMPT
        + "\n上一轮 JSON 如下：\n"
        + json.dumps(previous, ensure_ascii=False)
        + "\n外部程序发现以下确定性错误：\n- "
        + "\n- ".join(errors)
        + "\n请重新查看图片并修正。不得只改数字来迎合等式，必须同步修正片段归属和分子式。"
    )


def run_topology_audit(
    *,
    image: Path,
    client: JsonVisionClient,
    run_id: str | None = None,
    max_attempts: int = 3,
    work_dir: Path = DEFAULT_WORK_DIR,
) -> AuditRun:
    if max_attempts < 1:
        raise ValueError("max_attempts must be at least 1")
    resolved_image = image.resolve()
    if not resolved_image.is_file():
        raise FileNotFoundError(resolved_image)
    identifier = run_id or datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    run_dir = work_dir / "audits" / identifier
    run_dir.mkdir(parents=True, exist_ok=False)
    prompt = BASE_PROMPT
    audit: dict[str, Any] = {}
    validation = AuditValidation(("No attempt completed",))
    previous_audit: dict[str, Any] | None = None
    for attempt in range(1, max_attempts + 1):
        attempt_dir = run_dir / f"attempt-{attempt:02d}"
        attempt_dir.mkdir()
        (attempt_dir / "prompt.txt").write_text(prompt + "\n")
        try:
            response = client.complete_json(prompt=prompt, image=resolved_image)
        except Exception as error:
            validation = AuditValidation((f"provider-error: {error}",))
            (attempt_dir / "provider-error.json").write_text(
                json.dumps({
                    "type": type(error).__name__,
                    "message": str(error),
                }, ensure_ascii=False, indent=2) + "\n"
            )
            (attempt_dir / "validation.json").write_text(
                json.dumps(validation.to_json(), ensure_ascii=False, indent=2) + "\n"
            )
            continue
        audit = response["payload"]
        validation = validate_topology_audit(audit)
        (attempt_dir / "audit.json").write_text(
            json.dumps(audit, ensure_ascii=False, indent=2) + "\n"
        )
        (attempt_dir / "validation.json").write_text(
            json.dumps(validation.to_json(), ensure_ascii=False, indent=2) + "\n"
        )
        provider_response = response.get("providerResponse")
        if provider_response is not None:
            (attempt_dir / "provider-response.json").write_text(
                json.dumps(provider_response, ensure_ascii=False, indent=2) + "\n"
            )
        if validation.valid:
            break
        if audit == previous_audit:
            validation = AuditValidation(validation.errors + (
                "planner-stagnated: response is identical to the previous invalid attempt",
            ))
            (attempt_dir / "validation.json").write_text(
                json.dumps(validation.to_json(), ensure_ascii=False, indent=2) + "\n"
            )
            break
        previous_audit = audit
        prompt = _retry_prompt(audit, validation.errors)
    summary = {
        "schemaVersion": 1,
        "image": str(resolved_image),
        "attemptCount": attempt,
        "audit": audit,
        "validation": validation.to_json(),
    }
    (run_dir / "result.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n"
    )
    return AuditRun(run_dir, audit, validation, attempt)
