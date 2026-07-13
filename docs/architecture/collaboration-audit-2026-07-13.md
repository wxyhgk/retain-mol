# RetainMol 多人协作架构审计

本文件记录 2026-07-13 对 `apps/retainmol` 与 `packages/mol-viewer` 的并行审计结果。它不是目录介绍，而是用于回答三个问题：哪些区域可以独立开发、哪些修改必须协调、下一轮应先拆什么。

## 结论

当前架构已经具备多人协作的基础，不需要重写：

- App 通过 `@retainmol/mol-viewer/*` 子入口使用核心包，深路径依赖由边界脚本拦截。
- Builder、Store、Renderer 的依赖方向已经明确，Builder 生产代码不依赖 React、Zustand 或 Three.js。
- 17 个公开子入口由 API Extractor 冻结，并通过独立 NodeNext 消费项目验证。
- 根级 `npm run verify` 统一执行秘密扫描、边界检查、lint、严格类型检查、测试、构建、API 和打包消费测试。

仍不能把所有目录视为完全独立。下一阶段的主要风险集中在 App 编排、Store 写入一致性和 Renderer 缓存三个区域。

## 可并行开发区

| 工作流 | 主要 owner 目录 | 对外协议 | 可以独立进行的工作 |
| --- | --- | --- | --- |
| 纯化学与拓扑 | `packages/mol-viewer/src/lib/builder/analysis`、`geometry`、`kernel` | `/core`、`/geometry`、`/graph` | 芳香性、价态、测量、图算法及单元测试 |
| 编辑命令 | `packages/mol-viewer/src/lib/builder/commands/<domain>` | Store action 或包内 effect | atom、bond、fragment、scene 各领域命令 |
| 片段与模板 | `packages/mol-viewer/src/lib/builder/fragment`、`public/fragments.ts`、`public/templates.ts` | `/fragments`、`/templates` | catalog、校验、作者工具、模板数据 |
| 样式数据 | `packages/mol-viewer/src/presets`、`styles` | `/styles` | 只使用已有 schema/profile 的 theme 和 preset |
| App 功能 | `apps/retainmol/src/features/<feature>` | `apps/retainmol/src/domain/viewer/*` | 面板、工作流和视图 model，不直接访问包内部 |
| IO 与计算接入 | `packages/mol-viewer/src/lib/io`、App application service | `/io`、`/optimize` | 格式解析、任务状态和后端 adapter |

## 必须协调的共享热点

以下文件或协议由一名集成 owner 统一合并，不适合多个任务同时修改：

| 热点 | 原因 | 协作规则 |
| --- | --- | --- |
| `packages/mol-viewer/src/index.ts` 与 `src/public/*.ts` | 任何导出都会成为下游契约 | 先在所属子入口设计窄 API，再由 API owner 更新报告 |
| `packages/mol-viewer/src/store/moleculeStore.ts`、`store/slices/types.ts` | 影响 undo、selection、scene 和所有编辑 action | 领域开发者提交 command；Store owner 负责接线和事务语义 |
| `packages/mol-viewer/src/lib/molRenderer/MolRenderer.ts` | scene、相机、资源和多对象生命周期汇合 | 新视觉优先进入独立 visual/material 模块，由 Renderer owner 编排 |
| `apps/retainmol/src/components/layout/AppShell*` | 顶栏、工具栏、画布和检查器共同装配 | feature 提供组件和 model，Shell owner 只负责布局与路由 |
| style schema 与 render profile registry | schema、preset、renderer 必须同步 | 新 profile 作为一个跨文件变更，由 Style/Renderer owner 联合审核 |
| fragment registry/catalog | 注册顺序和公开 DTO 影响所有模板 | catalog owner 管注册；算法 owner 不直接改全局 registry |

## 本轮已修正

### 编辑会话与运行时

- 编辑 session 可以显式绑定 `ViewerRuntime`，不再隐式写入全局 store。
- 原子拖拽、对象变换和坐标写入区分 `finish` 与 `cancel`。
- `pointercancel`、工具切换和组件卸载会回滚事务；正常 `pointerup` 才提交。
- runtime 切换会重新创建 session，避免旧 store 残留。

### 片段与模板

- registry 的注册、读取和列表返回防御性副本，调用方不能修改全局 catalog。
- 片段注册时校验键级、局部配位数和价态。
- 接枝与并环后校验最终分子，而不是只校验新加入的局部原子。

### 包与协作门禁

- `three` 明确为 peer dependency，`zod` 保持唯一 runtime dependency 策略。
- 声明文件重写为 NodeNext 可消费形式，并由临时项目安装 tarball 验证。
- App lint 纳入根级 `verify`；秘密扫描覆盖 tracked 与 untracked 文件。
- 17 个子入口都有独立 API 报告，避免多人开发时无意扩大公共面。

## 剩余风险与顺序

### P1：Store 写入一致性

部分 command/store 路径对 `atomPositionVersion` 的递增仍可能不一致。所有坐标写入应经过同一个 helper，并增加“一个用户操作只产生一个版本递增和一个 undo step”的集成测试。

### P1：Renderer 缓存与对象视觉状态

- display mode、主题和 render profile 切换需要统一 cache key/invalidation。
- 芳香键几何缓存依赖坐标，但缓存键尚未完整表达坐标版本。
- Publication/IboView 自定义材质需要确认 inactive opacity、selection 和主题切换不会遗留旧材质或装饰。

这部分应由 Renderer owner 统一处理，避免样式开发者分别 patch mesh。

### P2：App Shell 编排

- `ToolRail` 的全局语义仍位于 build-palette feature 内，应迁到 workspace/layout 领域。
- Template Studio 中无能力支撑的回调和 no-op 入口应删除或改为明确禁用状态。
- 工具 metadata 和快捷键定义应集中到一个 workspace tool registry。

### P2：公共可变状态面

`/state` 仍是能力较大的显式可变入口。后续应按使用场景补充 selector/command facade，再逐步减少 App 对完整 Zustand store 的依赖；不能在同一轮直接删除 `/state`。

### P2：异步生命周期

类似 `alignViewToPlane` 的 `requestAnimationFrame` 工作应具备 cancel handle，并在 viewer/runtime dispose 时统一取消。

## 推荐团队分工

```text
API owner
  public/*、package exports、API reports

Builder owners
  atom / bond / fragment / geometry / scene commands

State owner
  store slices、transaction、selection、undo

Renderer owner
  renderer lifecycle、materials、cache、picking

App workspace owner
  AppShell、ToolRail、workspace tool registry

Feature owners
  inspector、template studio、optimization、styles UI
```

每个 feature owner 只通过 App domain adapter 或 mol-viewer 公共子入口接入。需要跨层能力时，先由对应 owner 增加接口，不通过深路径临时复用。

## 合并前门禁

```bash
npm run verify
```

当前门禁覆盖：

- secrets 扫描；
- App 与核心包依赖边界；
- App lint；
- 普通 TypeScript 与覆盖全部生产源码的 strict TypeScript；
- mol-viewer 与 App 测试；
- App/Sites 构建；
- 17 个公共入口 API 报告；
- npm tarball 独立 NodeNext 消费测试。

视觉和 WebGL 行为仍需按 `docs/mol-viewer/testing/browser-smoke.md` 做人工冒烟，不应只依赖单元测试。
