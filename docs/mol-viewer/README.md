# mol-viewer 包结构说明

`packages/mol-viewer` 是 RetainMol 的可复用分子查看和建模核心包。它负责分子数据结构、编辑规则、viewer 状态、Three.js 渲染、样式预设、导入导出工具，以及 App 层使用的公开 API。

App 层应该把它当成一个独立的分子引擎使用。App 代码应优先通过 `@retainmol/mol-viewer/*` 公开子路径导入，不要直接深挖包内部实现。

## 目录总览

```text
packages/mol-viewer/src
├── components/     包内 viewer 使用的 React 组件
├── config/         camera、render、bonding、geometry、tool 等共享配置
├── hooks/          把 React 事件连接到 builder command 和 store action 的 hooks
├── lib/            核心算法、分子工具、IO、renderer 内部实现
├── presets/        theme schema、内置主题、运行时主题注册表
├── public/         推荐给外部使用的窄 API 子入口
├── store/          molecule scene state 和 editor state
├── styles/         style preset 和 render profile 注册体系
├── capture.ts      视口截图桥接
├── index.ts        兼容旧用法的根导出
└── optimize.ts     独立优化入口
```

## 公开 API

App 层和外部集成优先使用这些子路径：

```ts
import { MolViewer, useMoleculeStore } from '@retainmol/mol-viewer/viewer'
import { newAtom, centerMolecule } from '@retainmol/mol-viewer/core'
import { parseMol, exportSdf } from '@retainmol/mol-viewer/io'
import { listFragments } from '@retainmol/mol-viewer/fragments'
import { registerStylePreset, registerTheme } from '@retainmol/mol-viewer/styles'
```

当前公开入口：

- `src/public/core.ts`：分子类型、分子工具、scene object helper、元素配置。
- `src/public/viewer.ts`：`MolViewer`、viewer/editor store、builder hook、viewer 侧命令。
- `src/public/io.ts`：MOL/SDF/XYZ/GJF 解析导出、几何松弛 API。
- `src/public/fragments.ts`：片段列表和查询。
- `src/public/styles.ts`：theme、style preset、render profile 注册和解析。
- `src/public/samples.ts`：内置示例分子。
- `src/public/pubchem.ts`：PubChem 查询。
- `src/optimize.ts`：给 worker 或 App 工作流使用的优化入口。

`src/index.ts` 仍然保留用于兼容旧导入方式，但新 App 代码和新文档都应该使用子路径。

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
├── commands/       编辑命令入口：点击、拖拽、场景、选择、store action 都先产出 command result
├── graph.ts        键和邻接图工具
├── queries.ts      builder 专用分子查询
├── valence.ts      价态计算 helper
└── fragmentLibrary.ts
```

详细导航见：

- `docs/mol-viewer/builder-guide.md`
- `docs/mol-viewer/edit-command-matrix.md`

命令化规则：

- 新的编辑行为必须先落到 `lib/builder/commands`，再由 store action 或 hook effect 应用结果。
- `lib/builder/editing` 只放底层算法，不直接被 App、hook 或 store action 当成交互入口调用。
- command 返回 `EditCommandResult`、`EditCommandWithSelectionResult`、scene result 或 selection result，状态落地由 `store/slices/helpers.ts` 统一处理。
- `BuilderEngine.ts` 只作为旧导入兼容 barrel；新代码不要从这里接编辑能力。

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
├── InteractionHandler.ts           拾取、pointer 手势、ghost line 接线
├── MeasureVisuals.ts               测量几何和标签
├── GhostVisuals.ts                 构建预览视觉
├── sceneRig.ts                     灯光、fog、背景网格
├── postprocessing.ts               景深
└── publicationMaterials.ts         Publication/IboView 类 shader 材质
```

规则：

- `MolRenderer` 应该只做 scene-level 编排。
- `MoleculeRenderer` 应该只负责单个 molecule 的 atom/bond mesh 生命周期。
- 材质决策应该通过 theme/render profile helper 处理，不要全局遍历 mesh 后粗暴 patch。
- active/inactive opacity 这类 object visual state 应该传给 molecule renderer，而不是渲染后统一覆盖。
- renderer 资源必须有明确、可预测的 `dispose()` 路径。

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
      -> lib/builder and lib/molRenderer
        -> config and low-level utilities
```

避免这些模式：

- App 直接导入 `packages/mol-viewer/src/lib/...`。
- renderer 导入 App 代码。
- 纯 builder 逻辑导入 React 或 Zustand store。
- store action 依赖 React 组件。
- style preset 直接修改 renderer 内部对象。

## 当前薄弱点

这些文件目前仍然偏大，后续多人协作容易冲突：

- `src/hooks/builder*Handlers.ts`：交互 adapter 已按 atom/bond/background/preview 拆开，但模板放置仍是 commit 式。
- `src/lib/molRenderer/MoleculeRenderer.ts`：atom rendering 和 bond rendering 仍然在同一个类里。
- `src/lib/molRenderer/MolRenderer.ts`：scene orchestration 还管了较多 scene-level 细节。
- `src/lib/builder/editing/fragment/ringFuse.ts` 与 `ringFuseTopology.ts`：并环主流程已经拆开，但算法仍然复杂。

推荐下一步拆分顺序：

1. 把模板放置从 commit 式升级为 preview/session 式。
2. 把 `MoleculeRenderer.ts` 拆成 atom renderer、bond renderer、bond geometry helper。
3. 把 grid/fog/light/DOF 这些 scene-level orchestration 收到更小的 renderer services 里。
4. 逐步收窄根 `index.ts`，但保留兼容。

## 验证

改动公开边界前，至少跑：

```bash
npm run check:boundaries --workspace retainmol
npm run build --workspace @retainmol/mol-viewer
npx vitest run --project packages/mol-viewer
npm run build --workspace retainmol
npm test --workspace retainmol -- --run
```

如果改动会影响 App 行为，还需要在本地 Vite 端口做浏览器 smoke。当前本地开发默认应是 `5173`，除非端口被其他进程占用。
