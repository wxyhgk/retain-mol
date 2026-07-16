# 计算任务模型

本文件定义 RetainMol 的计算任务最小边界。第一阶段先支持本地 GFN2-xTB 几何优化；ORCA、Gaussian、过渡态搜索、频率、轨道和 cube/molden 分析都必须复用这一模型，而不是各自维护一套任务状态。

## 目标

- 每次计算都有稳定的 `jobId`、输入快照、运行日志和输出工件。
- 任务结果可以作为后续任务的输入，例如过渡态搜索引用已优化的反应物和产物。
- 浏览器只请求和展示任务；计算进程、文件和状态转换归后端管理。
- 工作目录可审计、可备份，且不进入 Git。

## 第一阶段的数据模型

```text
Job
  jobId       20260714-a1b2c3d4
  taskType    xtb-optimization
  status      queued | running | succeeded | failed | cancelled | interrupted
  metadata    任务名、可执行请求和显示信息
  inputs[]    创建任务时冻结的结构或参数
  artifacts[] 输入文件、日志、优化坐标等可复用结果
```

`jobId` 由日期和 8 位随机十六进制字符组成。xTB 当前把界面中的任务名存为 `metadata.name`；在引入多任务类型后会提升为通用的首级 `jobName` 字段。

运行时数据默认保存在：

```text
software/backend/data/
  retainmol.sqlite
  tasks/
    <jobId>/
      job.json
      input.xyz
      xtb.log
      optimized.xyz
```

SQLite 是索引和状态来源；任务目录保存可复现文件。二者每次状态或工件变更后同步更新。

## 已实现 API

| API | 职责 |
| --- | --- |
| `POST /jobs` | 创建通用持久化任务定义。 |
| `GET /jobs`、`GET /jobs/{jobId}` | 列出或读取任务。 |
| `POST /jobs/{jobId}/inputs` | 追加或更新任务输入快照。 |
| `GET /jobs/{jobId}/artifacts` | 读取已登记的工件。 |
| `POST /jobs/xtb/optimize` | 以当前 3D 分子创建 GFN2-xTB 优化任务。 |
| `POST /jobs/{jobId}/run` | 将一个 `queued` 任务提交到后台执行器，立即返回 `202`。 |
| `POST /jobs/workflows/{workflowId}/run` | 激活一个 DAG，并提交当前所有就绪节点。 |
| `GET /jobs/workflows/{workflowId}/execution` | 查询持久执行状态和各节点的派生运行状态。 |
| `POST /jobs/workflows/{workflowId}/cancel` | 持久取消 DAG，停止后续调度并取消未完成的非共享成员 Job。 |
| `POST /jobs/{jobId}/cancel` | 取消尚未执行或正在执行的任务。 |
| `POST /jobs/{jobId}/retry` | 从 `failed / cancelled / interrupted` Job 的冻结 Spec 与输入创建一个新的排队 Job，并写入 `supersedesJobId`。 |
| `GET /jobs/{jobId}/log` | 按 cursor 增量读取运行日志。 |

任何终态任务都不可原地重开。失败、取消或中断后的重新计算使用 retry API；参数实验或成功结果的派生副本使用 clone API。两者都创建新 Job 并保留旧 Job 的日志和产物，只有 retry 会通过 `supersedesJobId` 进入可审计重试链。`job_dispatches.job_id` 唯一约束让重复提交幂等，worker 通过 SQLite 租约领取 dispatch，runner 再通过条件更新领取 `queued -> running`。

## 当前后台执行模型

`software/backend/jobs/executor.py` 消费 SQLite 中的持久 dispatch：

- HTTP 请求只校验并入队，不占用整个计算时长；
- `RETAINMOL_JOB_WORKERS` 限制同时运行的计算数，默认 `1`；
- `RETAINMOL_JOB_QUEUE_SIZE` 限制等待任务数，默认 `128`；
- 同一 `jobId` 跨进程重复提交也是幂等操作；
- FastAPI 关停会通知 xTB/Psi4 停止子进程，并记录 `interrupted`；
- 未开始的租约过期后回到 `pending`，可被其他 worker 重新领取；
- 已运行任务丢失租约后标记为 `interrupted`，不会静默重复执行；
- `RETAINMOL_EXECUTION_MODE=external` 时 API 只入队，`python -m jobs.worker` 独立执行。

`Job.status` 表达科学计算生命周期，`JobDispatch.status` 只表达调度生命周期：
`pending -> leased -> finished`。二者不能合并。当前可在同一 SQLite/WAL 数据目录上启动
多个 worker；跨主机调度仍需网络数据库或专用队列，不能共享本地 SQLite 文件。

## Workflow 自动调度

Workflow 定义和一次执行是两个不同实体：

- `Workflow` 保存 Job 成员和 `JobInputReference`，激活前允许编辑；
- `WorkflowExecution` 保存该 DAG 是否 `active / succeeded / blocked / cancelled`；
- 激活后 Workflow 定义不可原地修改，需要创建新的 Workflow 版本；
- 节点的 `waiting / ready / queued / running / succeeded / failed / cancelled / blocked` 是根据 Job 状态和 DAG 依赖实时推导的视图，不写回 Job 状态。

调度器按拓扑顺序协调节点。上游全部成功后，目标草稿才解析引用、冻结为 `JobInputBinding` 并转为 `queued`；随后 executor 写入 durable dispatch。上游失败、取消或中断时，后代节点保持原 Job 状态，但在 Workflow 视图中标记为 `blocked`。独立分支可以继续运行，直到所有可运行分支结束后，Workflow 才进入 `blocked` 终态。

worker 在两处推进 DAG：每个 Job 结束后立即协调相关 active workflow；空闲时周期扫描所有 active execution。后者覆盖“上游已成功、下游尚未入队”期间进程退出的恢复场景。

取消操作先将 `WorkflowExecution` 原子转为 `cancelled`，再取消其 `created / queued / running` 成员。调度器在冻结下游输入并入队的同一个 SQLite 事务中校验 execution 仍为 `active`，因此取消后不会再出现新节点。若某个成员 Job 同时属于另一个 active workflow，则保留该 Job，由另一个 workflow 继续管理；已取消 workflow 只停止自己的调度。

## xTB 输入和输出约定

xTB Job 在创建时保存：

- 原子 `id`、元素和三维坐标；
- 电荷和自旋多重度；
- 方法（当前固定 `gfn2`）、优化级别与最大步数。

优化完成后保存：

- `optimized.xyz`：用于下载、复现和外部程序交接；
- `xtb.log`：完整计算日志；
- `optimized.xyz` 的 metadata：稳定原子 ID 对应的优化后坐标、能量、步数和收敛状态。

前端只在输出原子的 ID、元素和当前分子一致时才允许“载入优化结构”，避免把一个 Job 的坐标误应用到另一个分子。

## 已实现：跨任务依赖

过渡态、扫描或高层级精修不能只传文件路径。应新增显式输入引用：

```text
JobInputReference
  jobId
  inputName           reactant | product | initial-guess | geometry
  sourceJobId
  sourceArtifactId
  expectedFormat      sdf | xyz | molden | cube
```

例如 TS Job 可以引用两个已成功优化 Job 的 `optimized.xyz`。服务层应在启动前验证：来源任务成功、Artifact 存在、格式匹配、原子映射满足所需条件。

## 后续演进顺序

1. 增加按用户/队列配置的并行资源配额，并在任务中心展示重试来源树。
2. 为 ORCA/Gaussian 增加 runner adapter，只实现各自输入/输出转换，不复制 Job 生命周期。
3. 把 cube、molden、轨道、频率和扫描曲线作为 Artifact 类型接入可视化层。
4. 为 LLM 分析提供只读 Job + Artifact 上下文，不让模型直接改写原始计算记录。

## 边界

| 层 | 负责 | 不负责 |
| --- | --- | --- |
| `software/backend/jobs` | ID、SQLite、目录、状态、输入和工件 | FastAPI 参数校验、具体化学算法 |
| `software/backend/routers/jobs.py` | HTTP schema 和响应投影 | 文件写入、xTB 命令细节 |
| `software/backend/jobs/executor.py` | dispatch 轮询、租约心跳、本地并发与关停 | Job 状态真相、化学算法、HTTP 响应 |
| `software/backend/jobs/worker.py` | 独立 worker 进程入口与信号处理 | API 服务、任务定义、引擎实现 |
| `software/backend/jobs/xtb_runner.py` | xTB 工作目录、执行和结果登记 | UI 状态、Three.js、任务列表组件 |
| `apps/retainmol/src/features/jobs` | API 客户端、Zustand 状态、Jobs 界面 | 直接启动子进程、读取后端目录 |
