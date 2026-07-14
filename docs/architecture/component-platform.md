# RetainMol 组件平台边界

本文说明 RetainMol 在扩展任务、分析、数据库、工作流和协作能力时，各层分别负责什么。目标不是增加目录数量，而是防止分子编辑状态、后端缓存和重型第三方组件互相污染。

## 状态归属

| 数据 | 唯一归属 | 说明 |
|---|---|---|
| 分子、选择、编辑工具、视口、撤销事务 | Zustand + `@retainmol/mol-viewer` | 需要低延迟同步更新的本地编辑状态 |
| Job、Artifact、Workflow、模板库、分子数据库 | TanStack Query | 后端是事实来源，禁止复制进 Zustand |
| 计算提交参数 | React Hook Form + Zod | 每种计算方法有独立 schema |
| 后端请求校验 | Pydantic | 最终权威校验，错误映射回前端字段 |
| 布局与基础交互 | shadcn/Radix、Tailwind | 不包含化学业务语义 |

## 组件三层

```text
components/ui
  无业务语义的按钮、对话框、输入框、标签页

components/data
  DataTable、VirtualList、FileDropzone、AsyncBoundary、ChartFrame
  只负责通用数据展示与交互

features/*/components
  JobCard、XtbJobForm、AnalysisWorkspace、WorkflowCanvas
  组合领域状态、应用命令和共享组件
```

依赖方向只能从 Feature 指向共享组件。`components/ui` 和 `components/data` 不能反向导入 Feature。

## 第三方 Adapter

重型或高耦合库只能从指定入口导入：

| 库 | 入口 |
|---|---|
| `@tanstack/react-table` | `components/data/DataTable.tsx` |
| `react-virtuoso` | `components/data/VirtualList.tsx` |
| `react-dropzone` | `components/data/FileDropzone.tsx` |
| `echarts` | `features/analysis/infrastructure/echartsAdapter.ts` |
| `@xyflow/react` | `features/workflows/components/WorkflowCanvas.tsx` |

ECharts 与 React Flow 通过工作区懒加载，不进入 Build 首屏的同步依赖链。

## 当前纵向工作流

### xTB 任务

`XtbJobForm` 校验参数并创建任务，TanStack Query 管理列表、详情、Artifact 和运行状态。任务执行后生成优化结构、日志和真实 `optimization-trajectory.json`。运行状态为终态后自动停止轮询。

### 文件导入

`FileDropzone` 只处理选择、拖拽、类型、大小和拒绝反馈。`MoleculeFileDropzone` 定义编辑器可接受的 XYZ、MOL、SDF；真正解析仍属于 `molecule-placement` 或模板工作台。

### 分析

Analyze 工作区读取已完成任务的轨迹 Artifact。ECharts 只渲染后端解析出的能量和梯度，不补齐或伪造缺失数据。

### 跨任务工作流

React Flow 只编辑 Job DAG。边被持久化为 `JobInputReference`，引用来源 Job 的命名 Input 或 Artifact。分子结构本身仍由 `mol-viewer` 管理，不能存入 React Flow 节点状态。

### 协作

`CollaborationOperation` 只能携带现有 `EditPlan`，通过 `baseRevision` 做乐观冲突检测。Presence 单独同步选择、光标和相机，不进入分子历史。未来 Yjs 或 WebSocket 只能替换传输 Provider，不能绕开化学命令层。

## 自动检查

执行：

```bash
npm run check:boundaries --workspace retainmol
```

检查会阻止共享组件依赖 Feature、页面直接调用 `fetch`、第三方组件绕过 Adapter，以及 Feature model 从 infrastructure 复制后端缓存。
