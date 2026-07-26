"""Synchronous and streaming xTB optimization execution."""

from __future__ import annotations

import asyncio
import subprocess
import tempfile
from collections.abc import AsyncGenerator
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .command import build_xtb_command
from .contracts import XtbOptimizationRequest
from .errors import (
    XtbExecutableNotFoundError,
    XtbExecutionError,
    XtbExecutionTimeoutError,
    XtbInvalidStructureError,
    XtbMissingOutputError,
)
from .geometry import (
    prepare_output_atoms,
    read_first_existing_xyz,
    write_xyz,
)
from .output import frame_signature, parse_energy_steps, parse_opt_log_frames
from .process import run_xtb_process


@dataclass(frozen=True, slots=True)
class XtbOptimizationResult:
    atoms: list[dict[str, Any]]
    energy: float
    converged: bool
    steps: int
    method: str


def run_xtb_optimization(
    request: XtbOptimizationRequest,
    *,
    timeout: float = 300,
) -> XtbOptimizationResult:
    """Run one blocking xTB optimization in an isolated work directory."""
    _validate_structure(request)

    with tempfile.TemporaryDirectory(prefix="retainmol_xtb_") as temporary:
        work_directory = Path(temporary)

        try:
            process = run_xtb_process(
                request,
                work_directory=work_directory,
                log_path=work_directory / "xtb.log",
                timeout=timeout,
            )
        except FileNotFoundError as error:
            raise XtbExecutableNotFoundError(
                "xtb 命令未找到，请确认已安装并在 PATH 中"
            ) from error
        except subprocess.TimeoutExpired as error:
            raise XtbExecutionTimeoutError(
                "xTB 计算超时（> 5 min）"
                if timeout == 300
                else f"xTB 计算超时（> {timeout:g} s）"
            ) from error
        except OSError as error:
            raise XtbExecutionError(f"无法启动 xTB: {error}") from error

        output = process.stdout + process.stderr
        try:
            optimized_atoms = read_first_existing_xyz(
                work_directory / "xtbopt.xyz",
                work_directory / "input.xtbopt.xyz",
            )
        except (OSError, ValueError, IndexError) as error:
            raise XtbMissingOutputError(
                f"xTB 优化坐标无法解析: {error}"
            ) from error
        if optimized_atoms is None:
            raise XtbMissingOutputError(
                "xTB 未输出优化坐标。"
                f"返回码 {process.returncode}。\n{output[-800:]}"
            )

        energy, steps, converged = parse_energy_steps(output)
        try:
            prepared_atoms = prepare_output_atoms(optimized_atoms, request)
        except ValueError as error:
            raise XtbMissingOutputError(
                f"xTB 优化坐标与输入结构不一致: {error}"
            ) from error

        return XtbOptimizationResult(
            atoms=prepared_atoms,
            energy=energy,
            converged=converged,
            steps=steps,
            method=request.method,
        )


async def stream_xtb_optimization_events(
    request: XtbOptimizationRequest,
) -> AsyncGenerator[dict[str, Any], None]:
    """Yield transport-neutral status, frame, and completion events."""
    _validate_structure(request)

    temporary = tempfile.TemporaryDirectory(prefix="retainmol_xtb_stream_")
    try:
        work_directory = Path(temporary.name)
        input_path = work_directory / "input.xyz"
        write_xyz(input_path, request.atoms)
        command = build_xtb_command(request, input_path, work_directory)

        yield {"type": "status", "message": "xTB 已启动，等待优化轨迹..."}

        output_path = work_directory / "xtb.out"
        trajectory_path = work_directory / "xtbopt.log"
        output_handle = output_path.open("w", encoding="utf-8")
        try:
            try:
                process = await asyncio.create_subprocess_exec(
                    *command,
                    cwd=str(work_directory),
                    stdout=output_handle,
                    stderr=output_handle,
                )
            except FileNotFoundError as error:
                raise XtbExecutableNotFoundError(
                    "xtb 命令未找到，请确认已安装并在 PATH 中"
                ) from error

            frames_sent = 0
            last_signature: tuple[int, float | None] | None = None
            last_status_at = 0.0
            while process.returncode is None:
                await asyncio.sleep(0.05)

                if not trajectory_path.exists():
                    loop_time = asyncio.get_running_loop().time()
                    if loop_time - last_status_at > 2.0:
                        last_status_at = loop_time
                        yield {
                            "type": "status",
                            "message": "xTB 计算中，尚未生成轨迹帧...",
                        }
                    continue

                frames = parse_opt_log_frames(
                    trajectory_path.read_text(errors="replace")
                )
                for frame_index in range(frames_sent, len(frames)):
                    frame = frames[frame_index]
                    last_signature = frame_signature(frame)
                    yield _frame_event(frame_index + 1, frame, request)
                frames_sent = len(frames)

            await process.wait()
        finally:
            output_handle.close()

        if trajectory_path.exists():
            frames = parse_opt_log_frames(
                trajectory_path.read_text(errors="replace")
            )
            for frame_index in range(frames_sent, len(frames)):
                frame = frames[frame_index]
                last_signature = frame_signature(frame)
                yield _frame_event(frame_index + 1, frame, request)
            frames_sent = len(frames)

        output = (
            output_path.read_text(errors="replace")
            if output_path.exists()
            else ""
        )
        energy, steps, converged = parse_energy_steps(output)
        final_atoms: list[dict[str, Any]] | None = None

        if energy == 0.0 and frames_sent > 0 and trajectory_path.exists():
            frames = parse_opt_log_frames(
                trajectory_path.read_text(errors="replace")
            )
            if frames:
                energy = frames[-1]["energy"]
                final_atoms = frames[-1]["atoms"]

        if final_atoms is None:
            final_atoms = read_first_existing_xyz(
                work_directory / "xtbopt.xyz",
                work_directory / "input.xtbopt.xyz",
                work_directory / "xtblast.xyz",
                work_directory / "input.xtblast.xyz",
            )

        if process.returncode not in (0, None) and final_atoms is None:
            diagnostic = (
                output[-1200:]
                if output
                else f"xTB exited with code {process.returncode}"
            )
            raise XtbMissingOutputError(diagnostic)

        if final_atoms:
            final_signature = frame_signature({"atoms": final_atoms})
            if final_signature != last_signature:
                frames_sent += 1
                yield {
                    "type": "frame",
                    "step": frames_sent,
                    "energy": energy,
                    "gnorm": 0.0,
                    "atoms": prepare_output_atoms(final_atoms, request),
                }

        yield {
            "type": "done",
            "converged": converged and process.returncode == 0,
            "steps": steps if steps > 0 else frames_sent,
            "energy": energy,
            "atoms": (
                prepare_output_atoms(final_atoms, request)
                if final_atoms
                else None
            ),
            "warning": (
                output[-1200:]
                if process.returncode not in (0, None)
                else None
            ),
        }
    finally:
        temporary.cleanup()


def _validate_structure(request: XtbOptimizationRequest) -> None:
    if len(request.atoms) < 2:
        raise XtbInvalidStructureError("至少需要 2 个原子")


def _frame_event(
    step: int,
    frame: dict[str, Any],
    request: XtbOptimizationRequest,
) -> dict[str, Any]:
    return {
        "type": "frame",
        "step": step,
        "energy": frame["energy"],
        "gnorm": frame["gnorm"],
        "atoms": prepare_output_atoms(frame["atoms"], request),
    }


__all__ = [
    "XtbExecutableNotFoundError",
    "XtbExecutionError",
    "XtbExecutionTimeoutError",
    "XtbInvalidStructureError",
    "XtbMissingOutputError",
    "XtbOptimizationResult",
    "run_xtb_optimization",
    "stream_xtb_optimization_events",
]
