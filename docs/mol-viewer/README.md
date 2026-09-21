# mol-viewer 包结构说明

`packages/mol-viewer` 是 RetainMol 的可复用分子查看和建模核心包。它负责分子数据结构、编辑规则、viewer 状态、Three.js 渲染、样式预设、导入导出工具，以及 App 层使用的公开 API。

App 层应该把它当成一个独立的分子引擎使用。App 代码应优先通过 `@retainmol/mol-viewer/*` 公开子路径导入，不要直接深挖包内部实现。

基础字段支持、复制与保存规则见[基础字段与保真边界](./field-fidelity.md)。
基础模型、图查询、显示契约的归属及自动检查见[包内基础边界](../architecture/mol-viewer-internal-boundaries.md)。
命令的无变化、手性、稳定 ID 与历史规则见[编辑命令的一致性](./edit-command-semantics.md)。
元素数据、价态策略与预览外观的归属见[元素与预览边界](./element-boundaries.md)。
Node、后端与浏览器共用的纯编辑入口见[无界面的分子编辑 API](./headless-api.md)。

外部项目可从[独立宿主接入](./consumer-integration.md)与
[可运行示例](../../examples/mol-viewer-consumer/README.md)开始；示例安装实际 tarball，
覆盖编辑、手性、历史和 MOL 往返，并单独记录真实浏览器验收状态。

多人并行开发前先阅读 `docs/architecture/collaboration-audit-2026-07-13.md`，其中列出了可并行 owner 区域、必须协调的共享热点和剩余 P1 风险。

## 目录总览

```text
packages/mol-viewer/src
├── application/    无 UI/store 依赖的编辑会话编排
├── components/     包内 viewer 使用的 React 组件
├── config/         camera、render、bonding、geometry、tool 等共享配置
├── hooks/          把 React 事件连接到 builder command 和 store action 的 hooks
├── lib/            核心算法、分子工具、IO、renderer 内部实现
│   ├── model/      分子类型、ID、结构校验、元素参考数据；不依赖编辑器或显示
│   ├── chemistry/  元素编辑默认策略和原子/键规则
│   ├── graph/      邻居、键、连通片段查询；Builder 与 IO 共用
│   ├── presentation/ 显示、工具、测量和预览契约，默认元素色与周期表排列
│   ├── clipboard.ts 可序列化片段剪贴板数据
│   └── modeling/   AI/协作客户端使用的建模协议、校验与 dry-run 执行器
├── presets/        theme schema、内置主题、运行时主题注册表
├── public/         推荐给外部使用的窄 API 子入口
├── runtime/        实例生命周期、store 适配、viewer 提交与 React provider
├── store/          molecule scene state 和 editor state
├── styles/         style preset 和 render profile 注册体系
├── capture.ts      视口截图桥接
├── index.ts        兼容旧用法的根导出
└── optimize.ts     独立优化入口
```

## 公开 API

App 层和外部集成优先使用这些子路径：

```ts
import { MolViewer } from '@retainmol/mol-viewer/viewer'
import { createViewerRuntime, getViewerApi } from '@retainmol/mol-viewer/runtime'
import { useMoleculeStore } from '@retainmol/mol-viewer/state'
import { getModelingContext, commitEditPlan } from '@retainmol/mol-viewer/modeling'
import { newAtom, centerMolecule } from '@retainmol/mol-viewer/core'
import { parseMol, exportSdf } from '@retainmol/mol-viewer/io'
import { listFragments } from '@retainmol/mol-viewer/fragments'
import { registerStylePreset, registerTheme } from '@retainmol/mol-viewer/styles'
```

当前公开入口：

- `src/public/core.ts`：分子类型、分子工具、scene object helper、元素配置。
- `src/public/viewer.ts`：`MolViewer`、截图和窄视口命令；现存 `useViewportStore` 属于待迁移的兼容出口，新代码从 `/state` 获取可变状态。
- `src/public/runtime.ts`：viewer 生命周期句柄、provider 与[实例级基础 API](./instance-api.md)；支持快照、编辑、选择、历史、显示和视口命令，不暴露内部 store/services。
- `src/public/state.ts`：显式的 molecule/editor mutable store 入口。
- `src/public/editing.ts`：窄化的坐标写入事务，不导出 `useBuilder`。
- `src/public/modeling.ts`：只读建模上下文、严格 `EditPlan` 协议、dry-run 和单事务提交入口。
- `src/public/headless.ts`：纯上下文、计划校验与回放，Node 使用时不加载 React/store；旧 `/modeling` 的纯函数出口仍兼容。
- `src/public/geometry.ts`：测量、几何约束校验/局部求解、路径方向分析与当前兼容的图拓扑查询；见[受约束几何编辑](constrained-geometry.md)。
- `src/public/graph.ts`：分子图连通片段和连通分量查询。
- `src/public/io.ts`：MOL/SDF/XYZ/GJF 解析导出、几何松弛 API。
- `src/public/fragments.ts`：片段列表和查询。
- `src/public/styles.ts`：theme、style preset、render profile 注册和解析。
- `src/public/three.ts`：显式依赖 Three.js 的材质工厂扩展点。
- `src/public/samples.ts`：内置示例分子。
- `src/public/pubchem.ts`：PubChem 查询。
- `src/optimize.ts`：给 worker 或 App 工作流使用的优化入口。

`src/index.ts` 仍然保留用于兼容旧导入方式，但新 App 代码和新文档都应该使用子路径。

### 多人协作时如何选入口

| 需求 | 使用入口 | 不要做 |
| --- | --- | --- |
| 展示分子、适配视口、截图 | `/viewer` | 从 `/viewer` 获取 mutable store 或 Three renderer |
| 独立编辑器的编辑、选择、历史、订阅和相机 | `/runtime` 的 `getViewerApi(runtime)` | 用默认 `/state` 或全局相机命令操作第二个实例 |
| 读取或修改全局 molecule/editor state | `/state` | 从其他子入口绕过显式可变边界 |
| 执行动画或优化坐标写入 | `/editing` | 直接调用内部 transaction 或 `useBuilder` |
| 让 AI 或协作客户端提出结构编辑 | `/modeling` | 模拟鼠标、直接改 Zustand、绕过 dry-run |
| 在 Node/后端执行分子构建与修改 | `/headless` | 为纯计划执行初始化 viewer/runtime |
| 开发纯化学和图算法 | `/core`、`/geometry`、`/graph` | 引入 React、Zustand 或 Three.js |
| 添加主题、样式和 profile | `/styles` | 在 preset 中直接操作材质对象 |
| 扩展 Three.js 材质 | `/three` | 把 Three.js 类型泄漏回 `/styles` 或 `/core` |
| 读取片段、模板、配位构型 | `/fragments`、`/templates`、`/coordination` | 依赖内部 `FragmentDef` 或 registry 实现 |

以下内容是包内实现，不是团队间可依赖的公共协议：

- `hooks/useBuilder.ts`、`builder*Handlers.ts` 和 pointer router。
- `ViewerRuntimeServices`、`ThreeRendererPort`、renderer adapter registry。
- `store/slices/*`、`lib/builder/commands/*` 的领域实现文件。
- `lib/builder/fragment/*` 的内部 model、registry 和 catalog 组装细节。

跨团队能力必须先在对应 `src/public/*.ts` 中形成窄接口，再由实现层接入。不要为了临时复用新增深路径导入。

AI 建模的协议、调用示例和后续扩展顺序见
[AI 建模框架](./ai-modeling/README.md)。

## Store 边界

状态分成两类：分子场景状态和编辑器/UI 状态。

```text
store/
├── moleculeStore.ts        store 组装、undo/redo 集成
├── editorStore.ts          工具、显示模式、theme/style、测量 UI 状态
└── slices/
    ├── sceneSlice.ts       场景对象、active object、显示/锁定/命名
    ├── editSlice.ts        编辑 action 组装层，不直接承载具体 command 落地
    ├── atomEditActions.ts      原子替换、H、原子删除、原子电荷/自由基 action
    ├── bondEditActions.ts      成键、删键、键级、H 替换成键 action
    ├── moleculeEditActions.ts  分子设置、移动、坐标写入、清空、居中 action
    ├── geometryEditActions.ts  键长、键角、二面角、几何清理 action
    ├── clipboardEditActions.ts 复制/粘贴 action
    ├── selectionEditActions.ts 基于选择集的编辑 action
    ├── transactionController.ts undo transaction 的嵌套和 pause/resume 管理
    ├── selectionSlice.ts   原子/键选择 action
    ├── helpers.ts          selector 和不可变更新 helper
    ├── types.ts            store contract
    └── undoConfig.ts       zundo 快照策略
```

规则：

- `moleculeStore` 存需要进入 undo 历史的数据。
- `editorStore` 存工具、显示、会话状态，不进入分子 undo 历史。
- 编辑分子必须走 store action 或 builder command helper，不要直接改对象。
- `editSlice.ts` 只组装 action；具体 action 应按领域放到 `atomEditActions.ts`、`bondEditActions.ts`、`moleculeEditActions.ts` 等小文件。
- selection 变化必须递增 `selectionVersion`。
- 长手势编辑必须用 `beginTransaction/endTransaction`，并用 `try/finally` 兜住异常。

## Builder 边界

Builder 逻辑在 `src/lib/builder`，目标是尽量保持纯逻辑。

```text
lib/builder/
├── kernel/         公共底座：图索引、价态策略、片段校验、统一结果类型
├── editing/        原子替换、成键、片段接枝、并环、几何编辑
├── geometry/       VSEPR 放置、草图平面、测量几何
├── analysis/       芳香性、共轭、杂化、连通片段分析
├── commands/       按 atom/bond/fragment/scene 等领域聚合的编辑命令入口
├── graph.ts        键和邻接图工具
├── queries.ts      builder 专用分子查询
├── valence.ts      价态计算 helper
├── fragment/
│   ├── model.ts            稳定的片段领域模型
│   ├── registry.ts         运行时注册与查询
│   ├── catalog.ts          只读聚合，不定义具体片段
│   └── catalogs/
│       ├── organicStubs.ts 有机/杂化桩 owner
│       ├── coordination.ts 配位片段 owner
│       └── rings.ts        环系 owner
└── fragmentLibrary.ts      兼容门面，不新增实现
```

详细导航见：

- `docs/mol-viewer/tracking/package-issues.csv`：当前问题、优先级、验收标准和顺序处理记录。
- `docs/mol-viewer/builder-guide.md`
- `docs/mol-viewer/edit-command-matrix.md`

命令化规则：

- 新的编辑行为必须先落到 `lib/builder/commands`，再由 store action 或 hook effect 应用结果。
- 包内消费者只从 `commands/atom`、`commands/bond` 等领域 `index.ts` 导入；不要深挖 `*Decision.ts` 或具体实现文件。
- `lib/builder/editing` 只放底层算法，不直接被 App、hook 或 store action 当成交互入口调用。
- command 返回 `EditCommandResult`、`EditCommandWithSelectionResult`、scene result 或 selection result，状态落地由 `store/slices/helpers.ts` 统一处理。
- builder 不提供 `BuilderEngine` 聚合入口；编辑能力必须从所属 command 领域或专用纯算法模块取得。
- Builder 生产代码禁止导入 Three.js；预览和 guide 只返回纯 tuple/DTO。
- 生长预览是 `geometry/growPreview.ts` 的只读查询，不属于修改分子的 command；只返回元素与空间位置，颜色和球大小由 `builderPreviewEffects.ts` 组合样式后交给 renderer。

`hooks/useBuilder.ts` 是 React hook 外壳；具体 pointer/click/drag 分发已经下沉到 builder adapter 文件。后续如果要改构建交互，优先看：

- `builderAtomHandlers.ts`
- `builderBondHandlers.ts`
- `builderBackgroundHandlers.ts`
- `builderPreviewHandlers.ts`

其中 `builder*Handlers.ts` 只负责读取当前 intent、激活对象、组装 effect；具体命令路由和 command result 应用放在 `builder*Effects.ts`。不要在 handler 文件里直接 import `lib/builder/commands/*`。

Hook 侧提交编辑结果的统一入口是 `builderEditCommandEffects.ts` 里的 `runEditCommand(molecule, command, effects)`。除这个文件外，不要直接调用 `applyEditCommandResult`，避免每个 effect 自己定义 command result 落地语义。

`useCanvasPointerRouter.ts` 只负责 DOM pointer routing、框选状态和对象拖拽手势状态。对象拖拽的命令执行与坐标提交统一放在 `useCanvasPointerRouterEffects.ts` 的 `commitObjectPointerTransform`；框选结果提交统一放在 `commitBoxSelect`。不要在 router 主文件里直接调用 `runObjectPointerTransformCommand`、`applyObjectTransformResult` 或 `resolveBoxSelectResult`。

## Renderer 边界

Three.js 渲染在 `src/lib/molRenderer`。

```text
lib/molRenderer/
├── MolRenderer.ts                  scene、camera、controls、render loop、多对象编排
├── MoleculeRenderer.ts             单个 molecule 的 mesh 生命周期
├── moleculeStylePrimitives.ts      材质、颜色、半径、透明度 helper
├── moleculeSelectionVisuals.ts     选中 halo、outline、drag hover 视觉
├── InteractionHandler.ts           raycast、坐标转换和 pointer effect 接线
├── interactionGestureState.ts      idle/atom/bond 手势状态迁移（纯函数）
├── MeasureVisuals.ts               测量几何和标签
├── GhostVisuals.ts                 拖拽成键引导视觉
├── sceneRig.ts                     灯光、fog、背景网格
├── postprocessing.ts               景深
└── publicationMaterials.ts         Publication/IboView 类 shader 材质
```

Renderer contract 分两层：

- `RendererPort` 是公共窄接口，只包含截图和视口 capability，不出现 Three.js 类型。
- `ThreeRendererPort` 是包内实现接口，供 overlays、gizmo 和 pointer router 使用，不从 `public/viewer.ts` 导出。
- renderer adapter registry 目前是包内能力，不对消费者开放；内部 adapter 必须声明 capability，并在绑定前进行运行时能力校验，禁止无校验强转。
- 只有在 overlay、picking 和交互协议都能与 Three.js 解耦后，才考虑把 renderer adapter 注册升级成公共扩展点。

规则：

- `MolRenderer` 应该只做 scene-level 编排。
- `MoleculeRenderer` 应该只负责单个 molecule 的 atom/bond mesh 生命周期。
- 材质决策应该通过 theme/render profile helper 处理，不要全局遍历 mesh 后粗暴 patch。
- active/inactive opacity 这类 object visual state 应该传给 molecule renderer，而不是渲染后统一覆盖。
- renderer 资源必须有明确、可预测的 `dispose()` 路径。
- renderer 禁止反向导入 `lib/builder`；它只消费准备好的 molecule/preview DTO。

## Style 边界

样式系统分成 theme、style preset、render profile 三层。

```text
presets/
├── schema.ts       theme schema
├── loader.ts       theme 注册和解析
└── themes/         内置 theme JSON

styles/
├── schema.ts       style preset schema
├── loader.ts       style preset 注册和解析
├── renderProfiles.ts
├── profiles/
└── presets/
```

概念上：

- Theme：元素颜色和基础视觉参数。
- Render profile：渲染行为，比如材质模型、键样式、灯光、depth cue。
- Style preset：面向用户的一组组合，包括 display mode、theme、render profile、label 等。

运行时扩展 API：

```ts
registerTheme(theme)
registerStylePreset(preset)
registerRenderProfile(profile)
```

`styles/` 是声明式层，禁止导入 `lib/molRenderer`。profile 注册不验证 Three.js
材质工厂；具体 renderer 在组合或实际渲染时解析 `materialModel`。
需要返回 `THREE.Material` 的插件只能从 `@retainmol/mol-viewer/three` 导入。

相关文档：

- `docs/styles/README.md`
- `docs/styles/style-extension-quickstart.md`
- `docs/rendering/mol-renderer-boundary.md`

## Components 和 hooks

`src/components/viewer` 是包内 viewer 外壳：

- `MolViewer.tsx`：可复用 React viewer 组件。
- `AtomLabelOverlay.tsx`、`MeasureOverlay.tsx`、`BoxSelectOverlay.tsx`：canvas/DOM overlay。
- `AtomContextMenu.tsx`、`RotateGizmo.tsx`：viewer 侧控件。

`src/hooks` 负责把 React、renderer、store 接起来：

- `useRendererBinding.ts`：renderer 生命周期和 callback binding。
- `useCanvasPointerRouter.ts`：pointer routing、对象拖拽会话状态、框选；具体 object transform 和 box select 提交放在 `useCanvasPointerRouterEffects.ts`。
- `useMolViewerSync.ts`：受控 props 和 store 同步。
- `useBuilder.ts`：建模交互 hook 外壳，负责暴露 stable handlers。
- `builderPointerHandlers.ts`：建模 pointer handler barrel。
- `builderAtomHandlers.ts`、`builderBondHandlers.ts`、`builderBackgroundHandlers.ts`、`builderPreviewHandlers.ts`：从 store/editor 组装 command input。

## 依赖方向

目标依赖方向：

```text
App layer
  -> @retainmol/mol-viewer public subpaths
    -> components/hooks/store
      -> lib/modeling -> lib/builder commands
      -> lib/builder and lib/molRenderer
        -> config and low-level utilities
```

避免这些模式：

- App 直接导入 `packages/mol-viewer/src/lib/...`。
- renderer 导入 App 代码。
- 纯 builder 逻辑导入 React 或 Zustand store。
- store action 依赖 React 组件。
- style preset 直接修改 renderer 内部对象。
- App 从 `/viewer` 获取 mutable store；状态必须经 `/state` 和 App 的 `domain/viewer/*` adapter。
- AI provider 直接调用 store action 或内部 builder 文件；必须先输出 `/modeling` 的 `EditPlan`。

## 当前薄弱点

这些区域仍然是后续多人协作的主要风险：

- `src/hooks/builder*Handlers.ts`：交互 adapter 已按 atom/bond/background/preview 拆开，但模板放置仍是 commit 式。
- `src/lib/molRenderer/InteractionHandler.ts`：仍混合 pointer、grow preview、torsion 等多种交互语义。
- `src/store/slices/helpers.ts`：仍集中 command application、selection patch 和 scene patch，多团队扩展时容易冲突。
- 根 `src/index.ts`：兼容面仍然较宽，新能力禁止默认继续堆入根入口。

推荐下一步拆分顺序：

1. 把 `InteractionHandler` 拆成 input/pick、gesture intent 和 preview rendering。
2. 继续逐目录纳入 `tsconfig.strict.json`；VSEPR、renderer 和 store 必须分批修复，禁止批量 `!`。
3. 把 `/geometry` 中保留的图拓扑兼容导出安排到下一次 breaking window 移除。

## 验证

改动公开边界前，至少跑：

```bash
npm run verify
```

如果改动会影响 App 行为，还需要在本地 Vite 端口做浏览器 smoke。RetainMol App 配置端口为 `5300`；独立消费者示例使用 `5273`，端口占用时先确认监听者，不停止其他服务。

具体步骤见 [浏览器 Smoke](./testing/browser-smoke.md)。

涉及建模交互、模板连接、并环方向或视觉体验时，还应执行
[编辑器人工冒烟检查表](../qa/editor-smoke-checklist.md)，并将发现登记到
[`docs/qa/known-issues.csv`](../qa/known-issues.csv)。
