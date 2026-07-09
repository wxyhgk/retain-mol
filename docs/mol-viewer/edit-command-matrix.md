# mol-viewer 编辑命令化入口矩阵

这份文档记录 `packages/mol-viewer` 当前编辑入口如何落到 command/session。目标是让后续多人协作时，新增编辑行为有固定落点，避免 UI、store slice、builder 算法互相穿透。

## 结论

当前分子编辑已经形成四层：

```text
App / React UI
  -> viewerAdapter / MolViewer hooks
    -> store action 或 edit session
      -> lib/builder/commands
        -> lib/builder/editing / geometry / analysis 纯逻辑
```

原则：

- UI 不能直接改 `Molecule`。
- `lib/builder/commands` 不能导入 Zustand store、React、renderer。
- store action 只提交 command result，不承载复杂化学算法。
- UI 只调用 command/store 暴露的可用性 gate，不复制价态、重复键、H 槽位等化学约束。
- 长手势必须用 edit session 合并 undo。
- selection 清理必须走 selection command，并 bump `selectionVersion`。

## Command 目录职责

```text
lib/builder/commands/
├── moleculeStoreCommands.ts    整分子、原子坐标、自动成键、清空、居中、优化结果包装
├── topologyStoreCommands.ts    原子/键拓扑：加键、删键、补 H、替换、H 让位
├── geometryStoreCommands.ts    键长、键角、二面角、电荷、自由基
├── clipboardStoreCommands.ts   复制/粘贴片段
├── sceneStoreCommands.ts       场景对象新增、删除、激活、显隐、锁定、重命名
├── selectionCommands.ts        选择、清选择、修剪失效选择、选中原子成键
├── atomClickCommands.ts        点击原子的编辑意图
├── bondClickCommands.ts        点击键的编辑意图
├── bondDragCommands.ts         拖拽成键/生长
├── builderIntent.ts            将 editorStore 工具态解析成统一编辑意图
├── fragmentCommands.ts         片段接枝、并环、放置 session、放置预览、避碰
├── interactionCommands.ts      交互路由的轻量判定
├── builderInteractionRouter.ts 基于 BuilderIntent 的构建态路由
└── moveCommands.ts             原子拖拽、对象平移/旋转、优化写回 session
```

## 入口矩阵

| 用户/系统入口 | 当前调用点 | command/session | 状态提交点 | 说明 |
| --- | --- | --- | --- | --- |
| 点击原子替换元素 | `builderAtomHandlers.ts` | `runAtomClickCommand` -> `runReplaceAtomCommand` | `applyEditCommandResult` -> `setMolecule` | 纯替换，不自动长 H。 |
| 点击 H 生长原子 | `builderAtomHandlers.ts` | `runAtomClickCommand` -> `runGrowFromHydrogenCommand` | `setMolecule` | H 让位语义在 topology command。 |
| 片段接原子 | `builderAtomHandlers.ts` | `runAtomClickCommand` -> `runAttachFragmentToAtomCommand` | `setMolecule` | 片段几何和价态在 fragment/editing 层。 |
| 点击键切换键长/键级 | `builderBondHandlers.ts` | `runBondClickCommand` -> `runCycleBondLengthCommand` | `setMolecule` | 非环键可移动片段，环内只改键级。 |
| 点键并环 | `builderBondHandlers.ts` | `runBondClickCommand` -> `runFuseFragmentOnBondCommand` | `setMolecule` | 并环算法在 `editing/fragment`。 |
| 空白处放置原子/片段 | `builderBackgroundHandlers.ts` / `builderPreviewHandlers.ts` | `PlacementCommandSession` -> `runPlacementPreviewCommand` / `runPlacementCommand` | `setMolecule` | command 层先生成 placement preview，再 commit；renderer 只显示临时 molecule，不提交；ghost 视觉由 `placementGhostStyle` 从 theme/render profile 解析；基础避碰已在 command 内部完成。 |
| 拖 H / 拖原子成键 | `builderBondHandlers.ts` | `runBondDragEndCommand` | `setMolecule` | 包含 H 让位、自由空间长原子、补 H。 |
| 双击选片段 | `builderAtomHandlers.ts` | `runSelectConnectedFragmentCommand` | `selectAtoms` | 只改变选择，不改分子。 |
| 原子拖拽 | `useBuilder.ts` | `AtomDragCommandSession` | `setAtomPositions` | session 包住 transaction。 |
| 对象平移/旋转 | `useCanvasPointerRouter.ts` | `runTranslateAtomGroupCommand` / `runRotateAtomGroupCommand` + `ObjectTransformCommandSession` | `setObjectAtomPositions` | 多原子变换合并为一步 undo。 |
| 旋转 gizmo | `RotateGizmo.tsx` | `createObjectTransformEditSession` | `setAtomPositions` | gizmo 不直接管理 transaction。 |
| 优化/弛豫写回 | `apps/retainmol/src/lib/moleculeOpt.ts` | `createObjectPositionWriteEditSession` | `setObjectAtomPositions` | worker 结果按 session 写回。 |
| 几何面板改坐标 | `GeometryPanel.tsx` | `runMoveAtomCommand` | `moveAtom` | 单原子坐标编辑走 store command。 |
| 几何面板改键长/角/二面角 | `GeometryPanel.tsx` | `runSetBondLengthCommand` / `runSetBondAngleCommand` / `runSetDihedralAngleCommand` | 对应 store action | 几何移动在 `geometryStoreCommands`。 |
| 几何面板删除原子 | `GeometryPanel.tsx` | `runRemoveAtomsCommand` | `removeAtoms` | 批量删除，不循环调用单个删除。 |
| 几何面板删除键 | `GeometryPanel.tsx` | `runRemoveBondCommand` | `removeBond` | 同步清理 selection。 |
| 几何面板连接两原子 | `GeometryPanel.tsx` | `runBondSelectedAtomsCommand` | `bondSelectedAtoms` | 选中 H 时也支持让位成键。 |
| 右键菜单加 H | `AtomContextMenu.tsx` | `getAddOneHydrogenAvailabilityCommand` / `runAddOneHydrogenCommand` | `canAddOneHydrogen` / `addOneHydrogen` | UI 只显示 command/store gate 的结果，不再自己计算价态。 |
| 右键菜单替换元素 | `AtomContextMenu.tsx` | `runReplaceAtomsCommand` | `replaceAtoms` | 支持批量选中替换。 |
| 右键菜单删除 | `AtomContextMenu.tsx` | `runRemoveAtomsCommand` | `removeAtoms` | 支持批量删除。 |
| 右键菜单电荷/自由基 | `AtomContextMenu.tsx` | `runSetAtomChargeCommand` / `runSetAtomRadicalCommand` | 对应 store action | 电荷/自由基后按有效价态重饱和。 |
| 快捷键 B 成键 | `keyboardCommands.ts` | `runBondSelectedAtomsCommand` | `bondSelectedAtoms` | UI 只处理快捷键分发。 |
| 快捷键 H 补一个 H | `keyboardCommands.ts` | `getAddOneHydrogensAvailabilityCommand` / `runAddOneHydrogensCommand` | `canAddOneHydrogens` / `addOneHydrogens` | 先由 command/store gate 过滤可补 H 的原子，再一次提交。 |
| Delete / Backspace | `keyboardCommands.ts` | `runRemoveSelectedCommand` | `removeSelected` | 不再循环删原子/键。 |
| Copy / Paste | `clipboardCommands.ts` | `runCopySelectionCommand` / `runPasteAtomsCommand` | `copySelection` / `pasteAtoms` | 粘贴偏移在 command。 |
| 元素面板批量替换 | `ElementPicker.tsx` | `runReplaceAtomsCommand` | `replaceAtoms` | 面板不关心拓扑细节。 |
| BuildPanel / ToolStrip 模板替换当前分子 | `BuildPanel.tsx` / `ToolStrip.tsx` | `runSetMoleculeCommand` + `runResetSceneToMoleculeCommand` | `setMolecule` | App 只做模板 normalize。 |
| 文件导入替换当前分子 | `useFileIO.ts` -> `placeMoleculeInViewer` | `runSetMoleculeCommand` | `setMolecule` | 解析在 hook，center/2D->3D/动画落地集中在 placement service，最终提交走 store action。 |
| 文件导入新增对象 | `useFileIO.ts` / `importPlacementService.ts` -> `placeMoleculeInViewer` | `runAddSceneObjectCommand` | `addToScene` | 包含 center、2D->3D、auto offset 和跨对象 id 去冲突。 |
| PubChem 替换/追加 | `PubChemSearch.tsx` -> `placeMoleculeInViewer` | `runSetMoleculeCommand` / `runAddSceneObjectCommand` | `setMolecule` / `addToScene` | 搜索组件只保存查询结果，提交交给 placement service；PubChem 的 2D 结果保持提示，不自动立体化。 |
| 场景面板拆分对象 | `ScenePanel.tsx` | `runSplitSceneObjectCommand` | `splitSceneObject` | 拆分、删除原对象、创建分片对象和清选择作为一次场景编辑提交。 |
| 场景对象显隐/锁定/命名 | `ScenePanel.tsx` | `runSetSceneObjectVisibleCommand` / `runSetSceneObjectLockedCommand` / `runRenameSceneObjectCommand` | scene store action | scene metadata 也命令化。 |
| 受控 `molecule` prop 同步 | `useMolViewerSync.ts` | `runSetMoleculeCommand` | `setMolecule` | 外部 prop 写入仍走 store action。 |
| 受控 selection prop 同步 | `useMolViewerSync.ts` | `runSelectAtomsCommand` | `selectAtoms` | selection prop 不绕过 selection command。 |
| undo/redo 后选择清理 | `moleculeStore.ts` | `runPruneSelectionCommand` | `afterTimeTravel` | 只清理悬空 selection，不进 undo 历史。 |

## 纯数据转换，不属于提交入口

这些函数会创建新的 `Molecule` 对象，但不是编辑提交点。它们必须由上层 store action 或 command 负责落盘：

- `centerMolecule(...)`
- `createCenteredMoleculeFromTemplate(...)`
- `parseXYZ/parseMol/parseSdf/parseGjf(...)`
- `placeMoleculeInViewer(...)` 中的 center、2D 到 3D 转换和动画落地准备
- `splitConnectedComponents(...)`
- worker 优化结果计算

规则：如果函数只返回数据，不写 store，不触发 undo，就可以留在 data transform 层。

## 允许存在的直接 setState

当前只允许这些例外：

- `moleculeStore.ts` 的 `afterTimeTravel()`：undo/redo 后 bump version，并通过 `runPruneSelectionCommand` 清理失效选择。它不改分子拓扑，不进入 undo 历史。
- `integrity.ts` 的 editor store 清理：moleculeStore 变化后清理 editorStore 中失效的测量/待选 atom id。它属于跨 store UI 引用完整性，不是 molecule 编辑。
- `editSlice.ts` 的 zundo temporal `setState`：用于 transaction 的 undo 历史管理，不改分子内容。

除这些例外外，新增编辑入口不应直接 `useMoleculeStore.setState(...)`。

## 公共 API 边界

- `@retainmol/mol-viewer/viewer` 只暴露 store、viewer 组件和编辑 session，不再暴露旧的独立编辑函数。
- `@retainmol/mol-viewer/viewer` 可以暴露只读几何测量函数，但不能直接暴露 `BuilderEngine` 里的构建/编辑算法。
- 新 app 代码必须通过 `useMoleculeStore.getState().xxx` 或 hook 取出的 store action 调用编辑能力。
- 根入口保留少量历史兼容导出时，只用于旧代码过渡；不要在新代码和文档示例里继续引用。

## 新增编辑功能的落点

新增编辑行为时按这个顺序做：

1. 先确认 `builderIntent.ts` 是否已经能表达这个编辑意图；不够就扩展 intent，而不是让 hook 自己拼 `activeTool/brushArmed/activeFragmentId`。
2. 在 `lib/builder/editing`、`geometry` 或 `analysis` 写纯算法。
3. 在 `lib/builder/commands` 包一层 `runXxxCommand(...)` 或 session，返回明确 result。
4. 在 store action 或 edit session 中提交 result。
5. UI 只调用 store action/session，不直接修改 molecule。
6. 加 command 测试；如果涉及 undo、selection、scene object，再加 store 测试。

## 审计命令

常用扫描：

```bash
rg -n "store/|useMoleculeStore|patchActiveMol|setState\\(" packages/mol-viewer/src/lib/builder/commands
rg -n "useMoleculeStore\\.setState|molecule\\.atoms\\s*=|molecule\\.bonds\\s*=" packages/mol-viewer/src apps/retainmol/src --glob '!**/*.test.ts'
rg -n "beginTransaction\\(|endTransaction\\(" packages/mol-viewer/src apps/retainmol/src --glob '!**/*.test.ts'
```

当前期望：

- `lib/builder/commands` 不应出现 store 反向依赖。
- `beginTransaction/endTransaction` 只应集中在 edit session factory 或 transaction 实现。
- UI、app workflow 和 renderer 控制器不直接调用 `beginTransaction/endTransaction`；需要合并 undo 时必须创建 edit session。
- App 层不应直接 `useMoleculeStore.setState`。
- builder 交互路由只接受 `BuilderIntent`，不再接受散落的 `activeTool/brushArmed/activeFragmentId` 组合。

## 验证

这类边界改动至少跑：

```bash
npm run check:boundaries --workspace retainmol
npx vitest run src/lib/builder src/store --config vite.config.ts
npm run build --workspace @retainmol/mol-viewer
npm run build --workspace retainmol
```

## 尚未完成的方向

命令化已经覆盖主要编辑入口，但还不能说架构完全结束：

- placement preview 已经接到 renderer ghost，半径和颜色已从 theme/render profile 解析；材质仍使用透明 Phong，因为当前 publication/IboView shader 还没有 alpha 通道。
- 碰撞规避已经进入 placement command，但只是轻量平移搜索，后续还要支持旋转搜索、吸附和显式冲突提示。
- renderer 交互、ghost preview 与 builder command 的边界还可以继续收窄。
