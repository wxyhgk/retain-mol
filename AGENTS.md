# 安全要求
* 不得在仓库、日志、Issue、PR 或 AI 指令文件中记录密码、令牌、私钥等凭据。
* 需要提权或外部服务凭据时，由操作者通过系统安全通道在运行时提供。

# Monorepo 包结构
* `apps/retainmol`：应用壳与产品 UI。
* `packages/mol-viewer`（`@retainmol/mol-viewer`）：分子查看/编辑核心库，按子入口导出。
* `packages/ui-kit`（`@retainmol/ui-kit`）：无业务语义的共享 UI 层，禁止依赖业务包。
* `packages/molecule-assets`（`@retainmol/molecule-assets`）：分子资产与版本能力。
* `packages/jobs`（`@retainmol/jobs`）：任务管理能力。
* 依赖方向固定为 ui-kit → mol-viewer/molecule-assets → jobs → app，禁止反向；各包 `npm run check:boundaries` 把关。
* 包内不读 `import.meta.env`；后端地址等配置由 app 在启动时注入（如 `configureJobsApiBase`）。
* 根 `npm run verify` 做全量校验；改动跨包时先 `npm run build:packages`。
* 各包根目录有自己的 `CLAUDE.md`（职责/铁律/命令），在某个包内工作时以它为准。

# 并行开发（git worktree）
* 每个独立任务开一个 worktree + 分支：`git worktree add ../RetainMol-<task> -b wt/<task>`；**禁止多个会话共用主工作区**。
* 任务描述必须限定作用域（如「只动 packages/ui-kit」）；越界由各包 check:boundaries 与根 verify 把关。
* worktree 内完成后先 `npm run verify` 全绿，再回主仓 merge；用完 `git worktree remove` 清理。
* 主工作区保持小步 checkpoint 提交，不让大量改动悬空。

# 前端要求
*  Vite
*	TypeScript
*	shadcn/ui
*	Tailwind CSS
*	three.js
*  zustand 管状态
*  react-resizable-panels 做可拖拽布
