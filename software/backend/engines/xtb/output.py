"""Parsers for xTB text output and native optimization trajectories."""

from __future__ import annotations

import re
from typing import Any


_ENERGY_RE = re.compile(r"TOTAL ENERGY\s+([-\d.]+)\s+Eh")
_STEPS_RE = re.compile(
    r"GEOMETRY OPTIMIZATION CONVERGED AFTER\s+(\d+)\s+ITERATIONS"
)
_FAILED_STEPS_RE = re.compile(
    r"FAILED TO CONVERGE GEOMETRY OPTIMIZATION IN\s+(\d+)\s+CYCLES"
)
_FRAME_ENERGY_RE = re.compile(r"energy:\s*([-\d.]+)")
_FRAME_GNORM_RE = re.compile(r"gnorm:\s*([-\d.]+)")


def parse_energy_steps(output: str) -> tuple[float, int, bool]:
    energies = _ENERGY_RE.findall(output)
    energy = float(energies[-1]) if energies else 0.0

    converged = _STEPS_RE.search(output)
    if converged:
        return energy, int(converged.group(1)), True

    failed = _FAILED_STEPS_RE.search(output)
    if failed:
        return energy, int(failed.group(1)), False

    cycle_numbers = re.findall(r"\*\s+(\d+)\s+\*", output)
    steps = int(cycle_numbers[-1]) if cycle_numbers else 0
    return energy, steps, False


def parse_opt_log_frames(content: str) -> list[dict[str, Any]]:
    lines = content.splitlines()
    frames: list[dict[str, Any]] = []
    index = 0
    while index < len(lines):
        line = lines[index].strip()
        if not line:
            index += 1
            continue
        try:
            atom_count = int(line)
        except ValueError:
            index += 1
            continue

        if index + 1 + atom_count >= len(lines):
            break

        comment = lines[index + 1]
        energy_match = _FRAME_ENERGY_RE.search(comment)
        gradient_match = _FRAME_GNORM_RE.search(comment)
        if not energy_match or not gradient_match:
            index += 1
            continue

        atoms: list[dict[str, Any]] = []
        valid = True
        for atom_offset in range(atom_count):
            parts = lines[index + 2 + atom_offset].split()
            if len(parts) < 4:
                valid = False
                break
            atoms.append(
                {
                    "symbol": parts[0],
                    "x": float(parts[1]),
                    "y": float(parts[2]),
                    "z": float(parts[3]),
                }
            )

        if valid and len(atoms) == atom_count:
            frames.append(
                {
                    "energy": float(energy_match.group(1)),
                    "gnorm": float(gradient_match.group(1)),
                    "atoms": atoms,
                }
            )
        index += 2 + atom_count

    return frames


def frame_signature(frame: dict[str, Any]) -> tuple[int, float | None]:
    atoms = frame.get("atoms") or []
    first = atoms[0] if atoms else {}
    return (
        len(atoms),
        round(float(first.get("x", 0.0)), 8) if first else None,
    )


__all__ = ["frame_signature", "parse_energy_steps", "parse_opt_log_frames"]
