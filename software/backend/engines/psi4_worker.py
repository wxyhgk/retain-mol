"""Private command-line worker used by the Psi4 execution adapter."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any


BOHR_TO_ANGSTROM = 0.529177210903


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: psi4_worker.py REQUEST_JSON", file=sys.stderr)
        return 2

    request = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    output_path = Path(request["outputPath"])
    log_path = Path(request["logPath"])

    import psi4

    psi4.core.set_output_file(str(log_path), False)
    psi4.set_num_threads(int(request.get("threads", 1)))
    psi4.set_memory(f"{int(request.get('memoryMb', 512))} MB")

    molecule = psi4.geometry(_molecule_text(request))
    options: dict[str, Any] = {"scf_type": request.get("scfType", "df")}
    reference = request.get("reference")
    if reference:
        options["reference"] = reference
    psi4.set_options(options)

    method = request["method"]
    basis = request["basis"]
    operation = request.get("operation", "single-point")
    model = f"{method}/{basis}"
    if operation == "single-point":
        energy = psi4.energy(model, molecule=molecule)
        result = _base_result(request, psi4, energy)
    elif operation == "frequency":
        energy, wavefunction = psi4.frequency(
            model, molecule=molecule, return_wfn=True
        )
        frequencies = _signed_frequencies(wavefunction.frequencies().to_array())
        result = {
            **_base_result(request, psi4, energy),
            "frequenciesCm1": frequencies,
            "imaginaryFrequencyCount": sum(value < 0 for value in frequencies),
        }
    elif operation in {"ts-refine", "irc"}:
        options.update(_optimization_options(request, operation))
        psi4.set_options(options)
        energy, wavefunction = psi4.optimize(
            model, molecule=molecule, return_wfn=True
        )
        result = {
            **_base_result(request, psi4, energy),
            "structure": _structure(wavefunction.molecule(), request["atoms"]),
        }
        if operation == "irc":
            result["direction"] = request.get("direction", "forward")
            result["pointLimit"] = int(request.get("points", 20))
            history = _read_irc_history(Path.cwd())
            if history is not None:
                trajectory_path = Path.cwd() / "irc-trajectory.json"
                trajectory_path.write_text(json.dumps(history), encoding="utf-8")
                points = history.get("extras", {}).get("irc_rxn_path", [])
                result["ircPointCount"] = len(points)
                result["ircEnergiesHartree"] = [
                    float(point["energy"])
                    for point in points
                    if isinstance(point, dict) and "energy" in point
                ]
    else:
        raise ValueError(f"Unsupported Psi4 operation: {operation}")
    output_path.write_text(
        json.dumps(result),
        encoding="utf-8",
    )
    psi4.core.clean()
    return 0


def _molecule_text(request: dict[str, Any]) -> str:
    lines = [
        f"{request.get('charge', 0)} {request.get('multiplicity', 1)}",
    ]
    for atom in request["atoms"]:
        lines.append(
            f"{atom['symbol']} {atom['x']:.12f} {atom['y']:.12f} {atom['z']:.12f}"
        )
    lines.extend(["units angstrom", "symmetry c1", "no_reorient", "no_com"])
    return "\n".join(lines)


def _base_result(request: dict[str, Any], psi4: Any, energy: float) -> dict[str, Any]:
    return {
        "operation": request.get("operation", "single-point"),
        "energyHartree": float(energy),
        "method": request["method"],
        "basis": request["basis"],
        "psi4Version": psi4.__version__,
    }


def _optimization_options(request: dict[str, Any], operation: str) -> dict[str, Any]:
    if operation == "ts-refine":
        return {
            "opt_type": "ts",
            "geom_maxiter": int(request.get("maxSteps", 100)),
            "full_hess_every": int(request.get("fullHessianEvery", 1)),
            "g_convergence": request.get("convergence", "gau_tight"),
        }
    return {
        "opt_type": "irc",
        "irc_direction": request.get("direction", "forward"),
        "irc_points": int(request.get("points", 20)),
        "irc_step_size": float(request.get("stepSize", 0.2)),
        "geom_maxiter": int(request.get("maxSteps", 300)),
        "full_hess_every": 0,
        "write_opt_history": True,
    }


def _signed_frequencies(values: Any) -> list[float]:
    result: list[float] = []
    for value in values.reshape(-1):
        complex_value = complex(value)
        if abs(complex_value.imag) > 1e-8:
            result.append(-abs(float(complex_value.imag)))
        else:
            result.append(float(complex_value.real))
    return result


def _structure(molecule: Any, input_atoms: list[dict[str, Any]]) -> dict[str, Any]:
    geometry = molecule.geometry().to_array()
    atoms = []
    for index in range(molecule.natom()):
        atoms.append(
            {
                "id": input_atoms[index].get("id", f"atom-{index + 1}"),
                "symbol": molecule.symbol(index),
                "x": float(geometry[index][0]) * BOHR_TO_ANGSTROM,
                "y": float(geometry[index][1]) * BOHR_TO_ANGSTROM,
                "z": float(geometry[index][2]) * BOHR_TO_ANGSTROM,
            }
        )
    return {"atoms": atoms}


def _read_irc_history(work: Path) -> dict[str, Any] | None:
    for path in sorted(work.glob("*.opt.json")):
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        if isinstance(payload, dict) and isinstance(
            payload.get("extras", {}).get("irc_rxn_path"), list
        ):
            return payload
    return None


if __name__ == "__main__":
    raise SystemExit(main())
