# RetainMol 后端

当前后端通过两个独立计算引擎提供能力：

- xTB：快速几何优化。
- Psi4：单点能，以及持久化的过渡态精修、频率和 IRC 任务。

## 环境安装

Psi4 和 xTB 都由 conda-forge 提供，不写入 `requirements.txt`。首次安装：

```bash
conda env create -f software/backend/environment.yml
```

更新已有环境：

```bash
conda env update -n retainmol-backend -f software/backend/environment.yml --prune
```

## 启动

```bash
conda run -n retainmol-backend \
  uvicorn main:app --app-dir software/backend --host 0.0.0.0 --port 8000 --reload
```

默认开发模式由 FastAPI 进程内启动一个计算 worker。等待任务、领取租约和心跳均保存
在 SQLite 中，不依赖 API 进程内存。可通过以下环境变量调整并发、等待上限和租约：

```bash
RETAINMOL_JOB_WORKERS=1
RETAINMOL_JOB_QUEUE_SIZE=128
RETAINMOL_JOB_LEASE_SECONDS=30
RETAINMOL_JOB_POLL_SECONDS=0.2
RETAINMOL_DATA_ROOT=/path/to/retainmol-data
```

`POST /jobs/{jobId}/run` 只负责将任务放入后台队列并返回 `202 Accepted`，不再等待
xTB 或 Psi4 完成。前端通过 Job 详情和日志接口轮询实际状态。后端正常关停时会停止
子进程并把活跃 Job 记为 `interrupted`；异常退出后，租约到期会重新领取未开始的任务，
或把已经进入 `running` 的任务记为 `interrupted`。

生产或调试进程重载时，建议把 API 与 worker 分开。两者必须使用相同的
`RETAINMOL_DATA_ROOT`：

```bash
# API：只持久化 dispatch，不启动计算线程
RETAINMOL_EXECUTION_MODE=external \
conda run -n retainmol-backend \
  uvicorn main:app --app-dir software/backend --host 0.0.0.0 --port 8000

# 独立 worker：可单独重启，也可启动多个进程竞争租约
RETAINMOL_EXECUTION_MODE=external \
PYTHONPATH=software/backend \
conda run -n retainmol-backend python -m jobs.worker
```

检查运行时：

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/quantum/psi4/status
```

## Psi4 边界

`engines/psi4_engine.py` 是后端与 Psi4 的唯一执行边界。实际计算由
`engines/psi4_worker.py` 在独立 Python 进程中运行，避免 Psi4 的全局线程、内存和
输出设置污染 FastAPI 进程。

最小单点能请求：

```bash
curl -X POST http://127.0.0.1:8000/quantum/psi4/single-point \
  -H 'Content-Type: application/json' \
  -d '{
    "atoms": [
      {"id": "h1", "symbol": "H", "x": 0, "y": 0, "z": -0.35},
      {"id": "h2", "symbol": "H", "x": 0, "y": 0, "z": 0.35}
    ],
    "method": "hf",
    "basis": "sto-3g",
    "threads": 1,
    "memoryMb": 512
  }'
```

当前同步接口只用于验证引擎链路。正式计算使用 Job API：

```text
POST /jobs/psi4/ts-refine
POST /jobs/psi4/frequency
POST /jobs/psi4/irc
POST /jobs/{jobId}/run
```

三个创建接口都要求且仅允许一种结构来源：内联 `structure`、不可变的
`moleculeRevisionId`，或成功上游任务的 `artifactId`。方法、基组、内存、线程和
收敛参数进入不可变 `CalculationSpec`，结构进入带 SHA-256 的 `JobInputBinding`。

任务产物：

- TS 精修：`transition-state.xyz`、`psi4-result.json`、`psi4.log`。
- 频率：`psi4-result.json`（含频率和虚频数）、`psi4.log`。
- IRC：每个方向的端点 XYZ、结果 JSON、日志；OptKing 提供历史时还会保存路径
  `irc-*-trajectory.json`。

Psi4 runner 位于 `jobs/psi4_runner.py`。HTTP 路由只创建任务并调用统一 Job dispatcher，
不直接持有 Psi4 或引擎进程。

## 执行边界

```text
HTTP /jobs/{id}/run
        |
        v
SQLite job_dispatches（持久排队、租约、心跳）
        |
        v
JobExecutor / 独立 worker（并发限制、续租、关停）
        |
        v
run_persisted_job（按 taskType 分派）
        |
        +-- xtb_runner
        +-- psi4_runner
        |
        v
SQLite Job 状态 + Artifact
```

`JobExecutor` 不是第二套状态存储。Job 状态与 dispatch 状态都在 SQLite 中；executor
只轮询、续租和启动 runner。当前 SQLite 方案支持同一共享磁盘上的多个 worker 进程；
真正多机部署仍需把 repository 替换为网络数据库或队列服务。
