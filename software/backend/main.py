"""
RetainMol 后端 — FastAPI

启动：
  uvicorn main:app --reload --port 8000

当前本地执行器要求单个 API 进程：
  uvicorn main:app --host 0.0.0.0 --port 8000
"""

import re
import shutil
import subprocess
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from engines.psi4_engine import detect_psi4_runtime
from jobs.executor import execution_mode, get_job_executor
from jobs.service import JobService
from routers import jobs, molecules, optimize, prepare, quantum


@asynccontextmanager
async def lifespan(_: FastAPI):
    executor = get_job_executor()
    service = JobService()
    executor.bind(service)
    if execution_mode() == "embedded":
        executor.start(service)
    try:
        yield
    finally:
        if execution_mode() == "embedded":
            executor.shutdown()


app = FastAPI(
    title="RetainMol Backend",
    version="0.0.1",
    description="计算化学后端：xTB 结构优化与 Psi4 量子化学计算",
    lifespan=lifespan,
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
app.include_router(quantum.router)


@app.get("/health")
async def health():
    executable = shutil.which("xtb")
    xtb_version = None
    if executable:
        try:
            output = subprocess.run(
                [executable, "--version"],
                capture_output=True,
                text=True,
                timeout=5,
            ).stdout
            match = re.search(r"xtb version\s+([^\s]+)", output, re.IGNORECASE)
            xtb_version = match.group(1) if match else "unknown"
        except (OSError, subprocess.SubprocessError):
            xtb_version = "unknown"
    psi4 = detect_psi4_runtime()
    return {
        "status": "ok" if executable and psi4.available else "degraded",
        "version": app.version,
        "xtb": {"available": bool(executable), "version": xtb_version},
        "psi4": psi4.to_dict(),
        "jobExecutor": get_job_executor().snapshot(),
    }
