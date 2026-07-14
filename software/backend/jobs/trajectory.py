"""Parse xTB optimization logs into a durable trajectory artifact."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any


class TrajectoryParseError(ValueError):
    """Raised when xTB output does not contain a usable optimization trajectory."""


_NUMBER = r"[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[EeDd][-+]?\d+)?"
_ENERGY_RE = re.compile(rf"\benergy\s*[:=]\s*({_NUMBER})", re.IGNORECASE)
_GRADIENT_RE = re.compile(
    rf"\b(?:gnorm|gradient(?:\s+norm)?)\s*[:=]\s*({_NUMBER})",
    re.IGNORECASE,
)
_STEP_RE = re.compile(r"\b(?:step|cycle|iteration)\s*[:=#]?\s*(\d+)", re.IGNORECASE)
_CYCLE_RE = re.compile(
    r"\b(?:geometry\s+optimization\s+)?cycle\s*(?:no\.?\s*)?(\d+)\b",
    re.IGNORECASE,
)


def parse_xtb_trajectory(content: str, output: str = "") -> dict[str, Any]:
    """Parse xTB's ``xtbopt.log`` multi-frame XYZ output.

    Each accepted frame must contain both ``energy`` and ``gnorm`` (or
    ``gradient norm``) in its XYZ comment line.  This deliberately rejects
    coordinate-only frames so no gradient or energy is invented.
    """
    lines = content.splitlines()
    output_steps = _cycle_steps(output)
    frames: list[dict[str, Any]] = []
    index = 0

    while index < len(lines):
        atom_count = _atom_count(lines[index])
        if atom_count is None:
            index += 1
            continue
        if index + atom_count + 1 >= len(lines):
            break

        comment = lines[index + 1]
        energy = _metric(_ENERGY_RE, comment)
        gradient = _metric(_GRADIENT_RE, comment)
        if energy is None or gradient is None:
            index += 1
            continue

        atoms = _parse_atoms(lines[index + 2 : index + 2 + atom_count])
        if atoms is None:
            index += 1
            continue

        step_match = _STEP_RE.search(comment)
        frame_index = len(frames)
        frames.append(
            {
                "step": (
                    int(step_match.group(1))
                    if step_match
                    else output_steps[frame_index] if frame_index < len(output_steps) else frame_index + 1
                ),
                "energy": energy,
                "gradient": gradient,
                "atoms": atoms,
            }
        )
        index += atom_count + 2

    if not frames:
        raise TrajectoryParseError(
            "xTB trajectory contains no complete frames with energy and gradient"
        )

    return {
        "schemaVersion": 1,
        "engine": "xtb",
        "frames": frames,
    }


def write_xtb_trajectory(
    source_path: str | Path,
    destination_path: str | Path,
    *,
    output: str = "",
) -> dict[str, Any]:
    """Parse an xTB ``xtbopt.log`` file and atomically write its JSON artifact."""
    source = Path(source_path)
    destination = Path(destination_path)
    if not source.is_file():
        raise TrajectoryParseError(f"xTB trajectory log was not produced: {source.name}")

    trajectory = parse_xtb_trajectory(
        source.read_text(encoding="utf-8", errors="replace"),
        output=output,
    )
    temporary_path = destination.with_name(f".{destination.name}.tmp")
    temporary_path.write_text(
        json.dumps(trajectory, ensure_ascii=True, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    temporary_path.replace(destination)
    return trajectory


def _atom_count(line: str) -> int | None:
    try:
        atom_count = int(line.strip())
    except ValueError:
        return None
    return atom_count if atom_count > 0 else None


def _metric(pattern: re.Pattern[str], text: str) -> float | None:
    match = pattern.search(text)
    return _number(match.group(1)) if match else None


def _number(value: str) -> float:
    return float(value.replace("D", "E").replace("d", "e"))


def _parse_atoms(lines: list[str]) -> list[dict[str, Any]] | None:
    atoms: list[dict[str, Any]] = []
    for line in lines:
        parts = line.split()
        if len(parts) < 4:
            return None
        try:
            atoms.append(
                {
                    "symbol": parts[0],
                    "x": _number(parts[1]),
                    "y": _number(parts[2]),
                    "z": _number(parts[3]),
                }
            )
        except ValueError:
            return None
    return atoms


def _cycle_steps(output: str) -> list[int]:
    return [int(match.group(1)) for match in _CYCLE_RE.finditer(output)]
