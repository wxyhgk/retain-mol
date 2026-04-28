"""
RetainMol 后端 — FastAPI

启动：
  uvicorn main:app --reload --port 8000

生产：
  uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import optimize

app = FastAPI(
    title="RetainMol Backend",
    version="0.0.1",
    description="计算化学后端：xTB 优化、Gaussian/ORCA 任务管理（规划中）",
)

# ── CORS（开发阶段允许前端 localhost:5173 跨域）────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 路由 ──────────────────────────────────────────────────────────────────────
app.include_router(optimize.router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": app.version}
