"""
RetainMol 后端 — FastAPI

启动：
  uvicorn main:app --reload --port 8000

生产：
  uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
"""

import re
import shutil
import subprocess

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import jobs, molecules, optimize, prepare

app = FastAPI(
    title="RetainMol Backend",
    version="0.0.1",
    description="计算化学后端：xTB 优化、Gaussian/ORCA 任务管理（规划中）",
)

# ── CORS（开发阶段全放开）────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 路由 ──────────────────────────────────────────────────────────────────────
app.include_router(optimize.router)
app.include_router(prepare.router)
app.include_router(jobs.router)
app.include_router(molecules.router)


@app.get("/health")
async def health():
    executable = shutil.which("xtb")
    xtb_version = None
    if executable:
        try:
            output = subprocess.run(
                [executable, "--version"], capture_output=True, text=True, timeout=5,
            ).stdout
            match = re.search(r"xtb version\s+([^\s]+)", output, re.IGNORECASE)
            xtb_version = match.group(1) if match else "unknown"
        except (OSError, subprocess.SubprocessError):
            xtb_version = "unknown"
    return {
        "status": "ok" if executable else "degraded",
        "version": app.version,
        "xtb": {"available": bool(executable), "version": xtb_version},
    }
