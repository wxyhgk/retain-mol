"""xTB CLI command construction."""

from __future__ import annotations

from pathlib import Path

from .contracts import XtbOptimizationRequest


def build_xtb_command(
    request: XtbOptimizationRequest,
    input_path: Path,
    work_directory: Path,
) -> list[str]:
    method_flag = {
        "gfn2": "2",
        "gfn1": "1",
        "gfnff": "ff",
    }[request.method.lower()]
    command = [
        "xtb",
        str(input_path),
        "--opt",
        request.optlevel,
        f"--gfn{method_flag}",
        "--chrg",
        str(request.charge),
        "--uhf",
        str(request.multiplicity - 1),
        "--cycles",
        str(request.max_steps),
        "--parallel",
        "1",
    ]

    if request.fixed_atom_ids:
        fixed_ids = set(request.fixed_atom_ids)
        fixed_indices = [
            index
            for index, atom in enumerate(request.atoms, start=1)
            if atom.id in fixed_ids
        ]
        control_path = work_directory / "xcontrol"
        control_path.write_text(
            "$fix\n"
            f"  atoms: {','.join(str(index) for index in fixed_indices)}\n"
            "$end\n",
            encoding="utf-8",
        )
        command.extend(["--input", str(control_path)])

    return command


__all__ = ["build_xtb_command"]
