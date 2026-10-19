# @retainmol/core

分子数据模型、builder command、IO、几何、图查询与无界面建模。不含 React / Three.js / Zustand，可在 Node、Worker、后端直接使用。`@retainmol/viewer` 构建在它之上。

## 铁律
* 整包运行时外部依赖只允许 `openchemlib`、`zod`（含类型导入）；源码由 `check:boundaries`、产物由 `check-dist`、真实安装由 `test:pack`（屏蔽 React/Three 加载）三重把关。UI、状态、渲染代码放 `packages/viewer`。
* 公共 API 有门禁：改任何 `src/public/*.ts` 或 `src/optimize.ts` 出口后必须 `npm run api:report --workspace @retainmol/core`（重新生成 `etc/core-*.api.md` 并提交），否则根 verify 的 `api:check` 红。
* 新公共出口的传递类型也必须同入口导出（API-Extractor 同入口规则），报什么补什么，勿预加。
* `./internal/*` 把逐文件产物暴露给 viewer（构建用 preserveModules，路径与 `src/` 一一对应）。它不承诺稳定、不进 API 报告；移动/重命名 core 文件时同步修改 viewer 的 `@retainmol/core/internal/...` 导入。viewer 精确锁定同版本 core，两包版本号同步递增。
* 改 `src/` 后必须 `npm run build --workspace @retainmol/core`，否则 viewer 与 App 用旧 dist。
* ID 一律 `genId()`（`lib/model/identity.ts`），保留非安全上下文的兼容行为。
* 基础模型在 `lib/model/`，共享图查询在 `lib/graph/`，显示/工具/预览契约在 `lib/presentation/`。类型依赖也必须遵守边界；内部代码不得继续引用旧 `lib/types.ts` 混合入口。
* 元素参考数据读 `lib/model/elements.ts`，编辑策略读 `lib/chemistry/policies/elementDefaults.ts`，默认色与排列在 `lib/presentation/`；`config/elements.config.ts` 仅保留旧公开接口的组合。化学/Builder/modeling 不得导入元素外观；`/headless` 的源码与实际 chunk 闭包均受检查。
* `/graph`、`/geometry` 不允许外部依赖；`@retainmol/core`、`/io` 仅 OpenChemLib；`/headless` 只允许 OpenChemLib/Zod。
* `lib/modeling` 是纯建模协议与执行器，不得依赖任何 store/runtime/React 概念。
* OCL 坐标 y/z 取反：导入 `-getAtomY/Z`，导出 `-a.y/-a.z` 补偿（详见根 docs）。

## 命令
* `npm run build` / `npm run api:report`（自带 build）/ `npm run test` / `npm run check:boundaries` / `npm run test:pack`（均加 `--workspace @retainmol/core`）；最后根 `npm run verify`
* `scripts/module-graph.mjs` 是两包共用的依赖图与边界检查实现（viewer 的 `check:boundaries` 也引用它）。
