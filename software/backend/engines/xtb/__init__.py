"""Neutral xTB contract shared by routers and durable jobs."""

from .command import build_xtb_command
from .contracts import XtbAtom, XtbOptimizationRequest
from .errors import (
    XtbExecutableNotFoundError,
    XtbExecutionError,
    XtbExecutionTimeoutError,
    XtbInvalidStructureError,
    XtbMissingOutputError,
)
from .execution import (
    XtbOptimizationResult,
    run_xtb_optimization,
    stream_xtb_optimization_events,
)
from .process import run_xtb_process
from .geometry import (
    prepare_output_atoms,
    read_first_existing_xyz,
    read_xyz,
    write_xyz,
)
from .output import frame_signature, parse_energy_steps, parse_opt_log_frames

__all__ = [
    "XtbAtom",
    "XtbExecutableNotFoundError",
    "XtbExecutionError",
    "XtbExecutionTimeoutError",
    "XtbInvalidStructureError",
    "XtbMissingOutputError",
    "XtbOptimizationRequest",
    "XtbOptimizationResult",
    "build_xtb_command",
    "frame_signature",
    "parse_energy_steps",
    "parse_opt_log_frames",
    "prepare_output_atoms",
    "read_first_existing_xyz",
    "read_xyz",
    "run_xtb_optimization",
    "run_xtb_process",
    "stream_xtb_optimization_events",
    "write_xyz",
]
