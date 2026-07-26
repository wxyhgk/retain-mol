"""HTTP and SSE adapters for the neutral xTB optimization engine."""

import asyncio
import json
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

try:
    from engines.xtb import (
        XtbAtom as Atom,
        XtbExecutableNotFoundError,
        XtbExecutionError,
        XtbExecutionTimeoutError,
        XtbInvalidStructureError,
        XtbOptimizationRequest as OptimizeRequest,
        run_xtb_optimization,
        stream_xtb_optimization_events,
    )
except ModuleNotFoundError:
    from software.backend.engines.xtb import (
        XtbAtom as Atom,
        XtbExecutableNotFoundError,
        XtbExecutionError,
        XtbExecutionTimeoutError,
        XtbInvalidStructureError,
        XtbOptimizationRequest as OptimizeRequest,
        run_xtb_optimization,
        stream_xtb_optimization_events,
    )

router = APIRouter(prefix="/optimize", tags=["optimize"])


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


# ── SSE 生成器 ────────────────────────────────────────────────────────────────

async def _stream_optimization(req: OptimizeRequest) -> AsyncGenerator[str, None]:
    """Encode transport-neutral xTB events as server-sent events."""
    try:
        async for event in stream_xtb_optimization_events(req):
            yield f"data: {json.dumps(event)}\n\n"
    except Exception as exc:
        yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"


# ── 端点 ──────────────────────────────────────────────────────────────────────


@router.post("", response_model=OptimizeResponse)
async def optimize(req: OptimizeRequest) -> OptimizeResponse:
    try:
        result = await asyncio.to_thread(run_xtb_optimization, req)
    except XtbInvalidStructureError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except XtbExecutableNotFoundError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except XtbExecutionTimeoutError as error:
        raise HTTPException(status_code=504, detail=str(error)) from error
    except XtbExecutionError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error

    return OptimizeResponse(
        atoms=[AtomResult.model_validate(atom) for atom in result.atoms],
        energy=result.energy,
        converged=result.converged,
        steps=result.steps,
        method=result.method,
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
