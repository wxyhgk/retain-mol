# RetainMol

> ⚠️ **测试阶段**:接口、界面与数据格式随时可能变更，请勿用于生产数据。

分子查看 / 编辑平台：2D 草图（Ketcher）↔ 3D 编辑（three.js）同处一个工作区，
附带任务管理、分子资产与工作流能力。

## 仓库结构（Monorepo）

| 路径 | 包名 | 职责 |
| --- | --- | --- |
| `apps/retainmol` | `retainmol` | 应用壳与产品 UI（开发端口 `5300`） |
| `packages/mol-viewer` | `@retainmol/mol-viewer` | 分子数据模型、Three.js 渲染、构建引擎、IO（按子入口导出） |
| `packages/ui-kit` | `@retainmol/ui-kit` | 无业务语义的共享 UI（禁止依赖业务包） |
| `packages/molecule-assets` | `@retainmol/molecule-assets` | 不可变 Revision + CAS 并发的分子资产 |
| `packages/jobs` | `@retainmol/jobs` | 任务提交 / 管理 + 3D 展柜 |
| `examples/mol-viewer-consumer` | 独立消费者示例（非 workspace） | 通过真实打包产物验证外部 React 宿主接入 |

依赖方向（由 `check:boundaries` 强制）：
`ui-kit → mol-viewer / molecule-assets → jobs → app`，禁止反向依赖。

## 技术栈

Vite · TypeScript · Tailwind CSS · shadcn/ui · three.js · zustand · react-resizable-panels ·
TanStack Query · Ketcher（2D）· OpenChemLib

## 快速开始

前置要求：Node 20+、npm 10+。Ketcher 相关包已 vendoring 进 `third-party/ketcher`
（含预构建 `dist`，见该目录 README），无需外部目录；`predev` / `prebuild` 会把它的静态资源拷到
`apps/retainmol/public/ketcher-dist`（生成物，已忽略，不提交）。

```bash
npm install
npm run build:packages   # 依次构建 ui-kit → mol-viewer → molecule-assets → jobs
npm run dev --workspace retainmol
```

## 校验

```bash
npm run verify   # 凭据扫描 → 形式化几何 → 边界检查 → lint → 类型 → 测试 → 构建 → API 门禁 → 打包自测
npm run example:viewer  # 独立宿主示例，http://127.0.0.1:5273
npm run verify:viewer-consumer  # tarball 安装、公共 API 回归、消费者类型与生产构建
```

外部项目接入步骤、实例边界及浏览器验收状态见
[mol-viewer 独立宿主接入](docs/mol-viewer/consumer-integration.md)。
应用检查器布局、键盘作用域及本次验收边界见
[检查器与快捷键](docs/UI/inspector-and-shortcuts.md)。

几点约定：

- `packages/mol-viewer`：`three` 只能是 peer 依赖；改 `src/public/*` 后必须跑
  `npm run api:report --workspace @retainmol/mol-viewer`；改 `src` 后必须重新构建，
  否则消费方用到的是旧 `dist`。
- 各包不读 `import.meta.env`；后端地址由 app 在启动时注入（如 `configureJobsApiBase`）。
- 跨 feature 引用只走门面（`@/features/<name>`），规则见
  `apps/retainmol/scripts/check-boundaries.mjs`。
- 并行开发一个任务一个 worktree + 分支
  （`git worktree add ../RetainMol-<task> -b wt/<task>`），`npm run verify` 全绿才合回。

## 安全

不得在仓库、日志、Issue、PR 中记录密码、令牌、私钥等凭据，
运行时凭据走系统安全通道提供（见 `SECURITY.md`）。
