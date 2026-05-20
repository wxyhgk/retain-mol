"""
/prepare — structure preparation helpers

Uses Open Babel CLI to add explicit hydrogens and generate a 3D conformer.
"""

import shutil
import subprocess
import tempfile
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/prepare", tags=["prepare"])


class Prepare3DRequest(BaseModel):
    mol: str = Field(description="Input MOL/SDF block")
    input_format: str = Field(default="mol", description="mol | sdf")
    output_format: str = Field(default="mol", description="mol | sdf")
    add_hydrogens: bool = True
    gen3d: bool = True
    best: bool = True


class Prepare3DResponse(BaseModel):
    mol: str
    format: str
    atom_count: int
    hydrogen_count: int


def _count_atoms_from_mol(text: str) -> tuple[int, int]:
    lines = text.replace("\r\n", "\n").replace("\r", "\n").splitlines()
    counts_idx = next((i for i, line in enumerate(lines[:20]) if "V2000" in line or "V3000" in line), -1)
    if counts_idx < 0:
        return 0, 0
    if "V3000" in lines[counts_idx]:
        atom_lines = [line for line in lines if line.strip().startswith("M  V30 ") and len(line.split()) >= 4]
        atoms = [line.split()[3] for line in atom_lines if line.split()[2].isdigit()]
        return len(atoms), sum(1 for sym in atoms if sym == "H")
    parts = lines[counts_idx].split()
    try:
        n = int(parts[0])
    except Exception:
        return 0, 0
    atom_lines = lines[counts_idx + 1 : counts_idx + 1 + n]
    symbols = [line[31:34].strip() for line in atom_lines if len(line) >= 34]
    return len(symbols), sum(1 for sym in symbols if sym == "H")


@router.post("/3d", response_model=Prepare3DResponse)
async def prepare_3d(req: Prepare3DRequest) -> Prepare3DResponse:
    obabel = shutil.which("obabel")
    if not obabel:
        raise HTTPException(status_code=503, detail="Open Babel CLI (obabel) 未找到，请先安装 Open Babel")

    in_fmt = req.input_format.lower()
    out_fmt = req.output_format.lower()
    if in_fmt not in {"mol", "sdf"}:
        raise HTTPException(status_code=400, detail="input_format 只支持 mol 或 sdf")
    if out_fmt not in {"mol", "sdf"}:
        raise HTTPException(status_code=400, detail="output_format 只支持 mol 或 sdf")

    with tempfile.TemporaryDirectory(prefix="retainmol_prepare_") as tmpdir:
        work = Path(tmpdir)
        in_path = work / f"input.{in_fmt}"
        out_path = work / f"prepared.{out_fmt}"
        in_path.write_text(req.mol)

        cmd = [obabel, str(in_path), "-O", str(out_path)]
        if req.add_hydrogens:
            cmd.append("-h")
        if req.gen3d:
            cmd.append("--gen3d")
        if req.best:
            cmd.append("--best")

        proc = subprocess.run(cmd, cwd=str(work), capture_output=True, text=True, timeout=120)
        if proc.returncode != 0 or not out_path.exists():
            detail = (proc.stderr or proc.stdout or f"obabel exited with code {proc.returncode}")[-1200:]
            raise HTTPException(status_code=500, detail=detail)

        prepared = out_path.read_text()
        atom_count, hydrogen_count = _count_atoms_from_mol(prepared)
        return Prepare3DResponse(
            mol=prepared,
            format=out_fmt,
            atom_count=atom_count,
            hydrogen_count=hydrogen_count,
        )
