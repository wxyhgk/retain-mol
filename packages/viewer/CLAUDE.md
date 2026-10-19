# @retainmol/viewer

React 分子查看/编辑组件：`MolViewer`、viewer runtime 与状态、Three.js 渲染层、样式预设、交互手势。分子模型、builder command、IO、几何在 `@retainmol/core`。按子入口导出（`/viewer` `/runtime` `/state` `/editing` `/modeling` `/styles` `/three` `/picking`）。

## 铁律
* 对 core 只用包名导入：公共能力用 `@retainmol/core[/entry]`，未公开的内部模块用 `@retainmol/core/internal/<src 相对路径>`（跨 builder command 领域时导入 `<domain>/index` 门面）。禁止相对路径跨出 `src`。
* `src/public/*.ts` 与 `src/index.ts` 只能转发 core 的公共入口，不得引用 `@retainmol/core/internal`；公共 API 报告里出现 internal 路径会让 `api:check` 失败——缺的类型先加到 core 合适的公共入口。
* `@retainmol/core` 是精确版本依赖（`internal/*` 不稳定），与 core 同步发版。
* 纯化学/几何/IO 逻辑放 core，不要在 viewer 里新增；viewer 只放 UI、状态、渲染与交互。
* 公共 API 有门禁：改任何 `src/public/*.ts` 出口后必须 `npm run api:report --workspace @retainmol/viewer`（重新生成 `etc/viewer-*.api.md` 并提交），否则根 verify 的 `api:check` 红。
* 新公共出口的传递类型也必须同入口导出（API-Extractor 同入口规则），报什么补什么，勿预加。
* `three` 是 peerDependency 且构建时 external——**不许**改成普通依赖（会产生双实例破坏 instanceof）。`@retainmol/core` 同样 external，保证力场注册、片段库等模块级单例只有一份。
* 改 `src/` 后必须 `npm run build --workspace @retainmol/viewer`；改了 core 先 build core。测试的 `pretest` 会先构建 core。
* ID 一律 `genId()`（core 的 `lib/model/identity.ts`）；`lib/utils.ts` 仅为 UI 工具，新分子代码不得从那里引入 ID。
* 预览几何放 core 的 Builder geometry，外观由 `styles/growPreviewAppearance.ts` 提供，hooks 组合。
* 编辑会话逻辑放 `application/editing/`，store 回调绑定放 `runtime/editingSessions.ts`；hooks/public 不从旧 `hooks/editSessionFactory.ts` 取实现。会话逻辑不得依赖 store/runtime/hooks/React 类型或值。
* 旧 `/modeling` 整体转发 `@retainmol/core/headless` 并追加 runtime 绑定，保留兼容，不能当作纯入口。

## 渲染层公共出口现状
`/three` 已导出 `MoleculeRenderer`（构造只要 THREE.Group + theme getter）与 `AromaticRingCache`，供 jobs 展柜复用。审查定论：**后续应收窄成窄门面**（消费方只用构造/render/dispose），内部重构前先做这件事。

## 命令
* `npm run build` / `npm run api:report`（自带 build）/ `npm run test` / `npm run check:boundaries` / `npm run test:pack`（均加 `--workspace @retainmol/viewer`）；最后根 `npm run verify`
