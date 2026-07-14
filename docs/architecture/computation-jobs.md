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
  status      queued | running | succeeded | failed | cancelled
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
| `POST /jobs/{jobId}/run` | 在该任务目录执行一个处于 `queued` 的 xTB 任务。 |

成功任务不可原地重跑。需要更改参数或重新计算时，创建新 Job 并保留旧 Job 的日志和产物；这避免一个 ID 对应多次互相覆盖的计算。第一个 runner 通过 SQLite 条件更新原子地领取 `queued -> running`，并发请求不能重复执行同一任务目录。

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

## 下一阶段：跨任务依赖

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

1. 引入 `JobInputReference` 和任务依赖图。
2. 把同步 xTB runner 放入队列/worker，支持取消、排队和进度流。
3. 为 ORCA/Gaussian 增加 runner adapter，只实现各自输入/输出转换，不复制 Job 生命周期。
4. 把 cube、molden、轨道、频率和扫描曲线作为 Artifact 类型接入可视化层。
5. 为 LLM 分析提供只读 Job + Artifact 上下文，不让模型直接改写原始计算记录。

## 边界

| 层 | 负责 | 不负责 |
| --- | --- | --- |
| `software/backend/jobs` | ID、SQLite、目录、状态、输入和工件 | FastAPI 参数校验、具体化学算法 |
| `software/backend/routers/jobs.py` | HTTP schema 和响应投影 | 文件写入、xTB 命令细节 |
| `software/backend/jobs/xtb_runner.py` | xTB 工作目录、执行和结果登记 | UI 状态、Three.js、任务列表组件 |
| `apps/retainmol/src/features/jobs` | API 客户端、Zustand 状态、Jobs 界面 | 直接启动子进程、读取后端目录 |
