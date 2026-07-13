"""
/optimize — xTB 几何优化接口

用 xtb CLI（subprocess）做几何优化，避免依赖 ASE。
流程：写临时 XYZ → xtb --opt → 读 xtbopt.xyz + 解析能量 → 删临时目录。

/optimize/stream — SSE 实时流式优化接口
流程：写临时 XYZ → xtb --opt（异步子进程）→ tail xtbopt.log → 逐帧 SSE 推送。
"""

import asyncio
import json
import re
import subprocess
import tempfile
from pathlib import Path
from typing import AsyncGenerator, Literal, Self

import numpy as np
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, model_validator

router = APIRouter(prefix="/optimize", tags=["optimize"])


# ── 数据模型 ──────────────────────────────────────────────────────────────────

class Atom(BaseModel):
    id: str
    symbol: str
    x: float
    y: float
    z: float

class OptimizeRequest(BaseModel):
    atoms: list[Atom]
    fixed_atom_ids: list[str] = Field(default_factory=list)
    charge: int = 0
    multiplicity: int = 1
    method: Literal["gfn2", "gfn1", "gfnff"] = "gfn2"
    max_steps: int = Field(default=200, ge=1, le=1000)
    optlevel: Literal["crude", "sloppy", "loose", "lax", "normal", "tight", "vtight", "extreme"] = "normal"

    @model_validator(mode="after")
    def validate_atom_ids(self) -> Self:
        atom_ids = [atom.id for atom in self.atoms]
        duplicate_atom_ids = _duplicate_ids(atom_ids)
        if duplicate_atom_ids:
            raise ValueError(f"atoms 中的 ID 不得重复: {', '.join(duplicate_atom_ids)}")

        duplicate_fixed_ids = _duplicate_ids(self.fixed_atom_ids)
        if duplicate_fixed_ids:
            raise ValueError(f"fixed_atom_ids 不得重复: {', '.join(duplicate_fixed_ids)}")

        atom_id_set = set(atom_ids)
        unknown_ids = [atom_id for atom_id in self.fixed_atom_ids if atom_id not in atom_id_set]
        if unknown_ids:
            raise ValueError(f"fixed_atom_ids 包含不存在的原子 ID: {', '.join(unknown_ids)}")

        return self

class AtomResult(BaseModel):
    id: str
    symbol: str
    x: float
    y: float
    z: float

class OptimizeResponse(BaseModel):
    atoms: list[AtomResult]
    energy: float       # Hartree
    converged: bool
    steps: int
    method: str


# ── XYZ 读写 ──────────────────────────────────────────────────────────────────

def _duplicate_ids(ids: list[str]) -> list[str]:
    seen: set[str] = set()
    duplicates: list[str] = []
    for item_id in ids:
        if item_id in seen and item_id not in duplicates:
            duplicates.append(item_id)
        seen.add(item_id)
    return duplicates

def _write_xyz(path: Path, atoms: list[Atom]) -> None:
    lines = [str(len(atoms)), ""]
    for a in atoms:
        lines.append(f"{a.symbol.capitalize():4s}  {a.x:16.10f}  {a.y:16.10f}  {a.z:16.10f}")
    path.write_text("\n".join(lines) + "\n")


def _read_xyz(path: Path) -> list[dict]:
    lines = path.read_text().splitlines()
    n = int(lines[0].strip())
    result = []
    for line in lines[2 : 2 + n]:
        parts = line.split()
        result.append({"symbol": parts[0], "x": float(parts[1]), "y": float(parts[2]), "z": float(parts[3])})
    return result


def _read_first_existing_xyz(*paths: Path) -> list[dict] | None:
    for path in paths:
        if path.exists():
            return _read_xyz(path)
    return None


def _attach_atom_ids(atoms: list[dict], source: list[Atom]) -> list[dict]:
    """XYZ does not carry ids; restore the stable request ids by preserved atom order."""
    if len(atoms) != len(source):
        raise ValueError(f"xTB 返回 {len(atoms)} 个原子，但请求包含 {len(source)} 个原子")
    result = []
    for atom, original in zip(atoms, source):
        if atom["symbol"].lower() != original.symbol.lower():
            raise ValueError(f"xTB 原子顺序发生变化：期望 {original.symbol}，得到 {atom['symbol']}")
        result.append({"id": original.id, **atom})
    return result


def _prepare_output_atoms(atoms: list[dict], req: OptimizeRequest) -> list[dict]:
    """Align xTB output to fixed request coordinates and restore stable atom ids."""
    result = _attach_atom_ids(atoms, req.atoms)
    if not req.fixed_atom_ids:
        return result

    fixed_ids = set(req.fixed_atom_ids)
    fixed_indices = [index for index, atom in enumerate(req.atoms) if atom.id in fixed_ids]
    coordinates = np.array(
        [[atom["x"], atom["y"], atom["z"]] for atom in result],
        dtype=float,
    )
    fixed_output = coordinates[fixed_indices]
    fixed_target = np.array(
        [[req.atoms[index].x, req.atoms[index].y, req.atoms[index].z] for index in fixed_indices],
        dtype=float,
    )

    output_centroid = fixed_output.mean(axis=0)
    target_centroid = fixed_target.mean(axis=0)
    rotation = np.eye(3)
    if len(fixed_indices) > 1:
        covariance = (fixed_output - output_centroid).T @ (fixed_target - target_centroid)
        left, _, right_transpose = np.linalg.svd(covariance)
        rotation = left @ right_transpose
        if np.linalg.det(rotation) < 0:
            left[:, -1] *= -1
            rotation = left @ right_transpose

    coordinates = (coordinates - output_centroid) @ rotation + target_centroid

    # xTB may report constrained atoms with residual drift; the API contract is exact.
    coordinates[fixed_indices] = fixed_target
    for atom, coordinate in zip(result, coordinates):
        atom["x"], atom["y"], atom["z"] = map(float, coordinate)

    return result


def _build_xtb_command(req: OptimizeRequest, xyz_in: Path, work: Path) -> list[str]:
    method_flag = {"gfn2": "2", "gfn1": "1", "gfnff": "ff"}.get(req.method.lower(), "2")
    cmd = [
        "xtb", str(xyz_in),
        "--opt", req.optlevel,
        f"--gfn{method_flag}",
        "--chrg", str(req.charge),
        "--uhf", str(req.multiplicity - 1),
        "--cycles", str(req.max_steps),
        "--parallel", "1",
    ]

    if req.fixed_atom_ids:
        fixed_ids = set(req.fixed_atom_ids)
        fixed_indices = [index for index, atom in enumerate(req.atoms, start=1) if atom.id in fixed_ids]
        xcontrol = work / "xcontrol"
        xcontrol.write_text(
            "$fix\n"
            f"  atoms: {','.join(str(index) for index in fixed_indices)}\n"
            "$end\n"
        )
        cmd.extend(["--input", str(xcontrol)])

    return cmd


_ENERGY_RE = re.compile(r"TOTAL ENERGY\s+([-\d.]+)\s+Eh")
_STEPS_RE  = re.compile(r"GEOMETRY OPTIMIZATION CONVERGED AFTER\s+(\d+)\s+ITERATIONS")
_STEPS_RE2 = re.compile(r"FAILED TO CONVERGE GEOMETRY OPTIMIZATION IN\s+(\d+)\s+CYCLES")


def _parse_energy_steps(log: str) -> tuple[float, int, bool]:
    energies = _ENERGY_RE.findall(log)
    energy = float(energies[-1]) if energies else 0.0

    m = _STEPS_RE.search(log)
    if m:
        return energy, int(m.group(1)), True

    m = _STEPS_RE2.search(log)
    if m:
        return energy, int(m.group(1)), False

    # 没找到收敛标志：视为未收敛，步数取最后一个 cycle 号
    cycle_nums = re.findall(r"\*\s+(\d+)\s+\*", log)
    steps = int(cycle_nums[-1]) if cycle_nums else 0
    return energy, steps, False


# ── xtbopt.log 帧解析 ─────────────────────────────────────────────────────────

_FRAME_ENERGY_RE = re.compile(r"energy:\s*([-\d.]+)")
_FRAME_GNORM_RE  = re.compile(r"gnorm:\s*([-\d.]+)")


def _parse_opt_log_frames(content: str) -> list[dict]:
    """
    解析 xtbopt.log 的多帧 XYZ 内容，返回帧列表。
    每帧格式：
        N
         energy: <float> gnorm: <float> ...
        sym x y z
        ...
    """
    lines = content.splitlines()
    frames = []
    i = 0
    while i < len(lines):
        # 找到原子数行
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        try:
            n = int(line)
        except ValueError:
            i += 1
            continue

        # 需要至少 2 + n 行
        if i + 1 + n >= len(lines):
            break

        comment = lines[i + 1]
        m_e = _FRAME_ENERGY_RE.search(comment)
        m_g = _FRAME_GNORM_RE.search(comment)
        if not m_e or not m_g:
            i += 1
            continue

        energy = float(m_e.group(1))
        gnorm  = float(m_g.group(1))

        atoms = []
        valid = True
        for j in range(n):
            parts = lines[i + 2 + j].split()
            if len(parts) < 4:
                valid = False
                break
            atoms.append({
                "symbol": parts[0],
                "x": float(parts[1]),
                "y": float(parts[2]),
                "z": float(parts[3]),
            })

        if valid and len(atoms) == n:
            frames.append({"energy": energy, "gnorm": gnorm, "atoms": atoms})

        i += 2 + n

    return frames


def _frame_signature(frame: dict) -> tuple[int, float | None]:
    atoms = frame.get("atoms") or []
    first = atoms[0] if atoms else {}
    return (
        len(atoms),
        round(float(first.get("x", 0.0)), 8) if first else None,
    )


# ── SSE 生成器 ────────────────────────────────────────────────────────────────

async def _stream_optimization(req: OptimizeRequest) -> AsyncGenerator[str, None]:
    """异步生成器：运行 xtb，tail xtbopt.log，逐帧发送 SSE 事件。"""

    if len(req.atoms) < 2:
        yield f"data: {json.dumps({'type': 'error', 'message': '至少需要 2 个原子'})}\n\n"
        return

    tmpdir_obj = tempfile.TemporaryDirectory(prefix="retainmol_xtb_stream_")
    try:
        work = Path(tmpdir_obj.name)
        xyz_in = work / "input.xyz"
        _write_xyz(xyz_in, req.atoms)

        cmd = _build_xtb_command(req, xyz_in, work)

        yield f"data: {json.dumps({'type': 'status', 'message': 'xTB 已启动，等待优化轨迹...'})}\n\n"

        xtb_out = work / "xtb.out"
        opt_log = work / "xtbopt.log"

        # 用文件接收 stdout，避免 PIPE 缓冲区阻塞
        xtb_fh = open(xtb_out, "w")
        try:
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                cwd=str(work),
                stdout=xtb_fh,
                stderr=xtb_fh,
            )
        except FileNotFoundError:
            xtb_fh.close()
            yield f"data: {json.dumps({'type': 'error', 'message': 'xtb 命令未找到，请确认已安装并在 PATH 中'})}\n\n"
            return

        frames_sent = 0
        last_sent_signature: tuple[int, float | None] | None = None
        last_status_at = 0.0
        try:
            # 轮询 xtbopt.log，直到 xtb 进程结束
            while proc.returncode is None:
                await asyncio.sleep(0.05)

                if not opt_log.exists():
                    loop_time = asyncio.get_running_loop().time()
                    if loop_time - last_status_at > 2.0:
                        last_status_at = loop_time
                        yield f"data: {json.dumps({'type': 'status', 'message': 'xTB 计算中，尚未生成轨迹帧...'})}\n\n"
                    continue

                content = opt_log.read_text(errors="replace")
                frames = _parse_opt_log_frames(content)

                for idx in range(frames_sent, len(frames)):
                    frame = frames[idx]
                    last_sent_signature = _frame_signature(frame)
                    event = {
                        "type": "frame",
                        "step": idx + 1,
                        "energy": frame["energy"],
                        "gnorm": frame["gnorm"],
                        "atoms": _prepare_output_atoms(frame["atoms"], req),
                    }
                    yield f"data: {json.dumps(event)}\n\n"

                frames_sent = len(frames)

            # 等待进程彻底结束
            await proc.wait()
        finally:
            xtb_fh.close()

        # xtb 已结束，冲刷剩余帧
        if opt_log.exists():
            content = opt_log.read_text(errors="replace")
            frames = _parse_opt_log_frames(content)

            for idx in range(frames_sent, len(frames)):
                frame = frames[idx]
                last_sent_signature = _frame_signature(frame)
                event = {
                    "type": "frame",
                    "step": idx + 1,
                    "energy": frame["energy"],
                    "gnorm": frame["gnorm"],
                    "atoms": _prepare_output_atoms(frame["atoms"], req),
                }
                yield f"data: {json.dumps(event)}\n\n"

            frames_sent = len(frames)

        # 读 xtb.out 文件解析最终能量 / 收敛信息
        log = xtb_out.read_text(errors="replace") if xtb_out.exists() else ""

        energy, steps, converged = _parse_energy_steps(log)

        # 如果 stdout 里没有步数信息，用已发帧数作为 steps
        if steps == 0 and frames_sent > 0:
            steps = frames_sent

        final_atoms: list[dict] | None = None

        # 如果 stdout 里没有能量，用最后一帧能量，同时获取最终原子坐标
        if energy == 0.0 and frames_sent > 0 and opt_log.exists():
            content = opt_log.read_text(errors="replace")
            frames = _parse_opt_log_frames(content)
            if frames:
                energy = frames[-1]["energy"]
                final_atoms = frames[-1]["atoms"]

        # 如果还没有最终原子坐标，从 xtbopt.xyz 读取
        if final_atoms is None:
            final_atoms = _read_first_existing_xyz(
                work / "xtbopt.xyz",
                work / "input.xtbopt.xyz",
                work / "xtblast.xyz",
                work / "input.xtblast.xyz",
            )

        if proc.returncode not in (0, None) and final_atoms is None:
            tail = log[-1200:] if log else f"xTB exited with code {proc.returncode}"
            yield f"data: {json.dumps({'type': 'error', 'message': tail})}\n\n"
            return

        # 有些 xtb 版本不会在运行中持续写 xtbopt.log，至少把最终结构作为最后一帧推给前端。
        if final_atoms:
            final_signature = _frame_signature({"atoms": final_atoms})
            if final_signature != last_sent_signature:
                frames_sent += 1
                final_frame_event = {
                    "type": "frame",
                    "step": frames_sent,
                    "energy": energy,
                    "gnorm": 0.0,
                    "atoms": _prepare_output_atoms(final_atoms, req),
                }
                yield f"data: {json.dumps(final_frame_event)}\n\n"

        done_event = {
            "type": "done",
            "converged": converged and proc.returncode == 0,
            "steps": steps if steps > 0 else frames_sent,
            "energy": energy,
            "atoms": _prepare_output_atoms(final_atoms, req) if final_atoms else None,
            "warning": log[-1200:] if proc.returncode not in (0, None) else None,
        }
        yield f"data: {json.dumps(done_event)}\n\n"

    except Exception as exc:
        yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"
    finally:
        tmpdir_obj.cleanup()


# ── 端点 ──────────────────────────────────────────────────────────────────────

@router.post("", response_model=OptimizeResponse)
async def optimize(req: OptimizeRequest) -> OptimizeResponse:
    if len(req.atoms) < 2:
        raise HTTPException(status_code=400, detail="至少需要 2 个原子")

    with tempfile.TemporaryDirectory(prefix="retainmol_xtb_") as tmpdir:
        work = Path(tmpdir)
        xyz_in = work / "input.xyz"
        _write_xyz(xyz_in, req.atoms)

        cmd = _build_xtb_command(req, xyz_in, work)

        try:
            proc = subprocess.run(
                cmd,
                cwd=str(work),
                capture_output=True,
                text=True,
                timeout=300,
            )
        except FileNotFoundError:
            raise HTTPException(status_code=503, detail="xtb 命令未找到，请确认已安装并在 PATH 中")
        except subprocess.TimeoutExpired:
            raise HTTPException(status_code=504, detail="xTB 计算超时（> 5 min）")

        log = proc.stdout + proc.stderr

        # xtb 把优化结果写到 xtbopt.xyz（和输入文件同名加 opt 后缀）
        opt_xyz = work / "xtbopt.xyz"
        if not opt_xyz.exists():
            # 也可能叫 input.xtbopt.xyz（旧版）
            alt = work / "input.xtbopt.xyz"
            if alt.exists():
                opt_xyz = alt
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"xTB 未输出优化坐标。返回码 {proc.returncode}。\n{log[-800:]}",
                )

        opt_atoms = _read_xyz(opt_xyz)
        energy, steps, converged = _parse_energy_steps(log)

    prepared_atoms = _prepare_output_atoms(opt_atoms, req)
    result_atoms = [
        AtomResult(id=a["id"], symbol=req.atoms[i].symbol, x=a["x"], y=a["y"], z=a["z"])
        for i, a in enumerate(prepared_atoms)
    ]

    return OptimizeResponse(
        atoms=result_atoms,
        energy=energy,
        converged=converged,
        steps=steps,
        method=req.method,
    )


@router.post("/stream")
async def optimize_stream(req: OptimizeRequest) -> StreamingResponse:
    """SSE 流式几何优化：逐帧推送 xtbopt.log 中的优化轨迹。"""
    return StreamingResponse(
        _stream_optimization(req),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
