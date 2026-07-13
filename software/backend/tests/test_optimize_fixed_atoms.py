import asyncio
import json
from pathlib import Path
from types import SimpleNamespace

import numpy as np
import pytest
from pydantic import ValidationError

import software.backend.routers.optimize as optimize_router
from software.backend.routers.optimize import (
    Atom,
    OptimizeRequest,
    _build_xtb_command,
    _prepare_output_atoms,
)


def _atoms() -> list[Atom]:
    return [
        Atom(id="oxygen", symbol="O", x=0.0, y=0.0, z=0.0),
        Atom(id="hydrogen-1", symbol="H", x=0.0, y=0.0, z=1.0),
        Atom(id="hydrogen-2", symbol="H", x=1.0, y=0.0, z=0.0),
    ]


def _alignment_atoms() -> list[Atom]:
    return [
        Atom(id="anchor-1", symbol="C", x=0.0, y=0.0, z=0.0),
        Atom(id="anchor-2", symbol="C", x=2.0, y=0.0, z=0.0),
        Atom(id="anchor-3", symbol="C", x=0.0, y=2.0, z=0.0),
        Atom(id="free", symbol="H", x=0.5, y=0.5, z=1.0),
    ]


def _transformed_output(atoms: list[Atom]) -> list[dict]:
    coordinates = np.array([[atom.x, atom.y, atom.z] for atom in atoms])
    rotation = np.array([
        [0.0, -1.0, 0.0],
        [1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0],
    ])
    coordinates = coordinates @ rotation + np.array([5.0, -3.0, 2.0])
    return [
        {"symbol": atom.symbol, "x": xyz[0], "y": xyz[1], "z": xyz[2]}
        for atom, xyz in zip(atoms, coordinates)
    ]


def _write_output_xyz(path: Path, atoms: list[dict]) -> None:
    lines = [str(len(atoms)), ""]
    lines.extend(
        f"{atom['symbol']} {atom['x']} {atom['y']} {atom['z']}"
        for atom in atoms
    )
    path.write_text("\n".join(lines) + "\n")


def test_request_defaults_to_no_fixed_atoms(tmp_path: Path) -> None:
    req = OptimizeRequest(atoms=_atoms())

    command = _build_xtb_command(req, tmp_path / "input.xyz", tmp_path)

    assert req.fixed_atom_ids == []
    assert "--input" not in command
    assert not (tmp_path / "xcontrol").exists()


def test_fixed_atoms_follow_stable_request_order(tmp_path: Path) -> None:
    req = OptimizeRequest(
        atoms=_atoms(),
        fixed_atom_ids=["hydrogen-2", "oxygen"],
        method="gfn1",
        charge=-1,
        multiplicity=2,
        max_steps=50,
        optlevel="tight",
    )

    xyz_path = tmp_path / "input.xyz"
    command = _build_xtb_command(req, xyz_path, tmp_path)

    xcontrol_path = tmp_path / "xcontrol"
    assert xcontrol_path.read_text() == "$fix\n  atoms: 1,3\n$end\n"
    assert command == [
        "xtb", str(xyz_path),
        "--opt", "tight",
        "--gfn1",
        "--chrg", "-1",
        "--uhf", "1",
        "--cycles", "50",
        "--parallel", "1",
        "--input", str(xcontrol_path),
    ]


@pytest.mark.parametrize(
    ("fixed_atom_ids", "message"),
    [
        (["missing"], "fixed_atom_ids 包含不存在的原子 ID: missing"),
        (["oxygen", "oxygen"], "fixed_atom_ids 不得重复: oxygen"),
    ],
)
def test_fixed_atom_ids_must_exist_and_be_unique(
    fixed_atom_ids: list[str],
    message: str,
) -> None:
    with pytest.raises(ValidationError, match=message):
        OptimizeRequest(atoms=_atoms(), fixed_atom_ids=fixed_atom_ids)


def test_request_atom_ids_must_be_unique() -> None:
    atoms = _atoms()
    atoms[2] = atoms[2].model_copy(update={"id": "hydrogen-1"})

    with pytest.raises(ValidationError, match="atoms 中的 ID 不得重复: hydrogen-1"):
        OptimizeRequest(atoms=atoms, fixed_atom_ids=["hydrogen-1"])


def test_output_is_kabsch_aligned_to_fixed_request_coordinates() -> None:
    atoms = _alignment_atoms()
    req = OptimizeRequest(
        atoms=atoms,
        fixed_atom_ids=["anchor-3", "anchor-1", "anchor-2"],
    )

    prepared = _prepare_output_atoms(_transformed_output(atoms), req)

    actual = np.array([[atom["x"], atom["y"], atom["z"]] for atom in prepared])
    expected = np.array([[atom.x, atom.y, atom.z] for atom in atoms])
    np.testing.assert_allclose(actual, expected, atol=1e-12)
    assert [atom["id"] for atom in prepared] == [atom.id for atom in atoms]


def test_drifted_fixed_atoms_are_restored_exactly() -> None:
    atoms = _alignment_atoms()
    req = OptimizeRequest(
        atoms=atoms,
        fixed_atom_ids=["anchor-1", "anchor-2", "anchor-3"],
    )
    output = _transformed_output(atoms)
    output[0]["x"] += 0.45
    output[1]["y"] -= 0.88
    output[2]["z"] += 0.61

    prepared = _prepare_output_atoms(output, req)

    for index in range(3):
        assert (prepared[index]["x"], prepared[index]["y"], prepared[index]["z"]) == (
            atoms[index].x,
            atoms[index].y,
            atoms[index].z,
        )


def test_sync_response_uses_aligned_and_restored_coordinates(monkeypatch: pytest.MonkeyPatch) -> None:
    atoms = _alignment_atoms()
    req = OptimizeRequest(atoms=atoms, fixed_atom_ids=["anchor-1", "anchor-2", "anchor-3"])
    output = _transformed_output(atoms)
    output[0]["x"] += 0.45
    output[1]["y"] -= 0.88

    def fake_run(command: list[str], *, cwd: str, **_: object) -> SimpleNamespace:
        assert "--input" in command
        _write_output_xyz(Path(cwd) / "xtbopt.xyz", output)
        return SimpleNamespace(
            stdout="TOTAL ENERGY      -10.5 Eh\nGEOMETRY OPTIMIZATION CONVERGED AFTER 4 ITERATIONS",
            stderr="",
            returncode=0,
        )

    monkeypatch.setattr(optimize_router.subprocess, "run", fake_run)

    response = asyncio.run(optimize_router.optimize(req))

    for index in range(3):
        assert (response.atoms[index].x, response.atoms[index].y, response.atoms[index].z) == (
            atoms[index].x,
            atoms[index].y,
            atoms[index].z,
        )
    assert response.energy == -10.5
    assert response.method == "gfn2"


def test_sse_frame_and_done_use_aligned_and_restored_coordinates(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    atoms = _alignment_atoms()
    req = OptimizeRequest(atoms=atoms, fixed_atom_ids=["anchor-1", "anchor-2", "anchor-3"])
    output = _transformed_output(atoms)
    output[0]["x"] += 0.45
    output[1]["y"] -= 0.88

    class FakeProcess:
        returncode = 0

        async def wait(self) -> int:
            return self.returncode

    async def fake_create_subprocess_exec(
        *_: str,
        cwd: str,
        stdout: object,
        **__: object,
    ) -> FakeProcess:
        stdout.write(
            "TOTAL ENERGY      -10.5 Eh\n"
            "GEOMETRY OPTIMIZATION CONVERGED AFTER 4 ITERATIONS"
        )
        stdout.flush()
        frame_lines = [str(len(output)), "energy: -10.5 gnorm: 0.01"]
        frame_lines.extend(
            f"{atom['symbol']} {atom['x']} {atom['y']} {atom['z']}"
            for atom in output
        )
        (Path(cwd) / "xtbopt.log").write_text("\n".join(frame_lines) + "\n")
        _write_output_xyz(Path(cwd) / "xtbopt.xyz", output)
        return FakeProcess()

    monkeypatch.setattr(optimize_router.asyncio, "create_subprocess_exec", fake_create_subprocess_exec)

    async def collect_events() -> list[dict]:
        chunks = [chunk async for chunk in optimize_router._stream_optimization(req)]
        return [json.loads(chunk.removeprefix("data: ")) for chunk in chunks]

    events = asyncio.run(collect_events())
    coordinate_events = [event for event in events if event["type"] in {"frame", "done"}]

    assert [event["type"] for event in coordinate_events] == ["frame", "done"]
    for event in coordinate_events:
        for index in range(3):
            assert (
                event["atoms"][index]["x"],
                event["atoms"][index]["y"],
                event["atoms"][index]["z"],
            ) == (atoms[index].x, atoms[index].y, atoms[index].z)
