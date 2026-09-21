# @retainmol/mol-viewer

分子查看/编辑核心库：Molecule 数据模型、Three.js 渲染层、构建引擎、IO。按子入口导出（`/core` `/viewer` `/three` `/styles` `/io` …）。

## 铁律
* 公共 API 有门禁：改任何 `src/public/*.ts` 出口后必须 `npm run api:report --workspace @retainmol/mol-viewer`（重新生成 `etc/*.api.md` 并提交），否则根 verify 的 `api:check` 红。
* 新公共出口的传递类型也必须同入口导出（API-Extractor 同入口规则），报什么补什么，勿预加。
* `three` 是 peerDependency 且构建时 external——**不许**改成普通依赖（会产生双实例破坏 instanceof）。
* 改 `src/` 后必须 `npm run build --workspace @retainmol/mol-viewer`，否则消费方用旧 dist。
* ID 一律 `genId()`（`lib/model/identity.ts`），保留非安全上下文的兼容行为；`lib/utils.ts` 仅为旧路径转发与 UI 工具，新分子代码不得从那里引入 ID。
* 基础模型在 `lib/model/`，共享图查询在 `lib/graph/`，显示/工具/预览契约在 `lib/presentation/`。类型依赖也必须遵守边界；内部代码不得继续引用旧 `lib/types.ts` 混合入口。
* 元素参考数据读 `lib/model/elements.ts`，编辑策略读 `lib/chemistry/policies/elementDefaults.ts`，默认色与排列在 `lib/presentation/`；`config/elements.config.ts` 仅保留旧公开接口的组合。预览几何放 Builder geometry，外观由 `styles/growPreviewAppearance.ts` 提供，hooks 组合。化学/Builder/modeling 不得导入元素外观；`/headless` 的源码与实际 chunk 闭包均受检查。
* `/core`、`/io` 的运行时外部依赖仅允许 OpenChemLib，`/graph`、`/geometry` 不允许外部依赖；`/headless` 只允许 OpenChemLib/Zod。源码和 dist 都检查完整导入链；旧 `/modeling` 保留 runtime 兼容，不能当作纯入口。
* 编辑会话逻辑放 `application/editing/`，store 回调绑定放 `runtime/editingSessions.ts`；hooks/public 不从旧 `hooks/editSessionFactory.ts` 取实现。`lib/modeling` 与会话逻辑不得依赖 store/runtime/hooks/React 类型或值。
* OCL 坐标 y/z 取反：导入 `-getAtomY/Z`，导出 `-a.y/-a.z` 补偿（详见根 docs）。

## 渲染层公共出口现状
`/three` 已导出 `MoleculeRenderer`（构造只要 THREE.Group + theme getter）与 `AromaticRingCache`，供 jobs 展柜复用。审查定论：**后续应收窄成窄门面**（消费方只用构造/render/dispose），内部重构前先做这件事。

## 命令
* `npm run build` / `npm run api:report`（自带 build）/ `npm run test` / `npm run check:boundaries`（均加 `--workspace @retainmol/mol-viewer`）；最后根 `npm run verify`
