# mol-viewer 包开发者文档

> 适用版本：当前 monorepo `packages/mol-viewer`

---

## 1. 整体定位

`mol-viewer` 是一个**独立的 React 组件库**，封装了 3D 分子可视化与交互编辑的全部能力，以 Three.js 为渲染后端、Zustand 为状态管理。

上层 app（`apps/retainmol`）通过以下两种方式使用它：

- **非受控（应用模式）**：直接渲染 `<MolViewer />`，不传任何 props，内部 store 自管状态；app 通过 `useMoleculeStore` / `useEditorStore` 读写状态，实现侧边栏、工具栏等 UI 联动。
- **受控（组件库模式）**：通过 props 传入 `molecule` / `selectedAtomIds` 等，通过回调接收变更，适合嵌入外部状态机。

两种模式可以混用：只传部分 props 时，未传的字段仍由内部 store 管理。

---

## 2. 目录结构

```
packages/mol-viewer/src/
├── index.ts                  公开 API 入口，所有外部可用符号从此导出
│
├── config/                   纯常量配置，无副作用
│   ├── bonding.config.ts     键合推断参数（tolerance、minBondLength、orderMidpointBias）
│   ├── camera.config.ts      相机 FOV / 初始 Z / 控制速度
│   ├── elements.config.ts    元素周期表：共价半径、cpkRadius、maxBonds、颜色等
│   ├── geometry.config.ts    VSEPR 规则 + 标准键长表 + lookupBondLengthByOrder
│   ├── interaction.config.ts 拖拽阈值、框选最小尺寸、对象变换速度
│   ├── overlay.config.ts     测量可视化参数（虚线尺寸、弧半径、二面角平面）
│   ├── render.config.ts      球/键几何参数、芳香虚线、高亮、ghost 线样式
│   └── rotateGizmo.config.ts 旋转 Gizmo 环半径、线宽、箭头尺寸
│
├── lib/                      纯逻辑（无 React、无 store 引用）
│   ├── types.ts              跨层共享类型：Tool、DisplayMode、Measurement、MolClipboard
│   ├── utils.ts              genId（UUID 兼容 polyfill）、cn（tailwind merge）
│   ├── molecule.ts           Atom / Bond / Molecule 类型 + parseXYZ / inferBonds 等
│   ├── sceneObject.ts        SceneObject 类型 + createSceneObject
│   ├── elements.ts           元素符号列表（轻量查询用）
│   ├── pubchem.ts            fetchCompoundSdf：PubChem REST API 封装
│   ├── samples.ts            内置示例分子（苯、水、乙醇等）
│   │
│   ├── animation/
│   │   └── Ticker.ts         全局 RAF 调度器，按 Phase 排序执行帧回调
│   │
│   ├── builder/              分子编辑纯逻辑
│   │   ├── BuilderEngine.ts  re-export 索引
│   │   ├── graph.ts          分子图基础查询（degree / findBond / neighborsOf / hParentOf，唯一实现）
│   │   ├── fragmentLibrary.ts 片段库：环系/官能团预构建 3D 结构（FRAGMENTS / getFragment）
│   │   ├── analysis/
│   │   │   ├── aromaticity.ts  DFS 环检测 + Hückel 规则芳香性判断
│   │   │   ├── conjugation.ts  共轭系统分析
│   │   │   ├── hybridization.ts 杂化推断（inferHybridization，唯一实现）
│   │   │   └── fragments.ts    连通分量 / getConnectedFragment
│   │   ├── editing/
│   │   │   ├── atomOps.ts    growByReplacingH / autoAddHydrogens / replaceAtomSymbol（纯函数）
│   │   │   ├── bondOps.ts    canBond / bondByReplacingH（H 槽位成键）
│   │   │   └── fragmentOps.ts 片段（环系/官能团）放置、接入、并环
│   │   ├── geometry/
│   │   │   ├── vsepr.ts      VSEPR 坐标计算：calcGrowPosition / getGrowGuide / calcBondLength
│   │   │   ├── plane.ts      平面草图模式的几何工具
│   │   │   └── measure.ts    calcDistance / calcAngle / calcDihedral
│   │   └── math/
│   │       └── vec3.ts       轻量向量工具
│   │
│   ├── controls/
│   │   └── MolControls.ts    NGL 风格相机控制（arcball 旋转 / pan / dolly）
│   │
│   ├── io/
│   │   ├── molFormat.ts      MOL/SDF 解析与导出（via OpenChemLib）
│   │   └── pasteParser.ts    剪贴板格式自动识别（mol/gjf/xyz/raw）
│   │
│   └── molRenderer/          Three.js 渲染层
│       ├── MolRenderer.ts    场景 orchestrator（相机/灯光/动画循环）
│       ├── MoleculeRenderer.ts 原子/键 mesh 生命周期管理
│       ├── MeasureVisuals.ts   测量几何体（虚线/弧/二面角平面）
│       ├── GhostVisuals.ts     拖出生长预览（幽灵线/幽灵原子/候选槽位几何）
│       ├── InteractionHandler.ts canvas 指针事件（点击拾取/原子拖拽/bond-drag 状态机）
│       ├── RotateGizmoController.ts 旋转 Gizmo（键旋转/多原子 XYZ 旋转）
│       └── CameraUtils.ts    fitToMolecule / updateOrbitTarget / 坐标投影工具
│
├── store/
│   ├── moleculeStore.ts      分子数据 + 场景对象 + 选择状态（含 undo 历史）
│   ├── editorStore.ts        编辑器 UI 状态（工具/显示/测量/主题/剪贴板）
│   └── integrity.ts          跨 store 引用完整性（原子删除后级联清理 editor 引用）
│
├── hooks/
│   ├── useMolViewerSync.ts   受控/非受控 prop ↔ store 双向同步（防循环）
│   ├── useRendererBinding.ts 渲染器生命周期 + 场景/事件/主题绑定
│   ├── useCanvasPointerRouter.ts 指针事件统一路由（move-object / 框选 / 放行）
│   └── useBuilder.ts         分子建模交互逻辑（atom/bond 操作映射到 store）
│
├── components/
│   ├── viewer/
│   │   ├── MolViewer.tsx     顶层导出组件，组合所有 hook 与 overlay
│   │   ├── AtomContextMenu.tsx 右键上下文菜单
│   │   ├── AtomLabelOverlay.tsx 原子标签 HTML overlay
│   │   ├── BoxSelectOverlay.tsx 框选矩形 SVG overlay
│   │   ├── MeasureOverlay.tsx  测量数值标注 HTML overlay
│   │   └── RotateGizmo.tsx   React 壳：管理 RotateGizmoController 生命周期
│   └── builder/
│       └── BuilderHint.tsx   当前工具操作提示条
│
└── presets/
    ├── schema.ts             ThemeSchema（zod）+ ResolvedTheme 类型
    ├── loader.ts             resolveTheme / listThemes（含继承合并）
    └── themes/               default / dark / mono / pymol 主题 JSON
```

---

## 3. 分层架构

```
config ──────────────────────────────────────────────────────────────────
          ↓ (只读常量，任何层都可以 import)
lib ─────────────────────────────────────────────────────────────────────
          纯逻辑，不依赖 store / React / DOM
          ↓
store ───────────────────────────────────────────────────────────────────
          可以 import lib；不可以 import hooks / components
          ↓
hooks ───────────────────────────────────────────────────────────────────
          可以 import store + lib；不可以 import components
          ↓
components ──────────────────────────────────────────────────────────────
          可以 import 所有层
```

**禁止的方向**：

| 禁止 | 原因 |
|------|------|
| `lib` import `store` | lib 必须是纯函数，可单独测试 |
| `lib` import React | 渲染器、IO、分子操作与框架无关 |
| `store` import `hooks` | hooks 依赖 React 生命周期，store 不能反向依赖 |
| `config` import 任何其他层 | 配置是静态常量 |

---

## 4. 核心数据结构

### Atom

```ts
// lib/molecule.ts
export interface Atom {
  readonly id: string       // genId() 生成的 UUID
  readonly symbol: string   // 元素符号，如 "C" "H" "O"
  readonly x: number        // 笛卡尔坐标，单位 Å
  readonly y: number
  readonly z: number
  readonly charge?: number  // 形式电荷（可选）
  readonly label?: string   // 自定义显示标签（可选）
}
```

### Bond

```ts
export interface Bond {
  readonly id: string
  readonly atomId1: string  // 指向 Atom.id，不是数组下标
  readonly atomId2: string
  readonly order: 1 | 2 | 3 // 键级（没有 4，芳香键用 aromatic 标记）
  readonly aromatic?: boolean // 从 SDF 导入时由 OCL 识别设置
}
```

### Molecule

```ts
export interface Molecule {
  readonly atoms: readonly Atom[]
  readonly bonds: readonly Bond[]
  readonly name?: string
}
```

Molecule 是不可变值对象，所有编辑操作均返回新 Molecule（immutable update）。

### SceneObject

```ts
// lib/sceneObject.ts
export interface SceneObject {
  readonly id: string
  readonly molecule: Molecule
  readonly name: string
  readonly visible: boolean
  readonly locked: boolean
  readonly offset: { readonly x: number; readonly y: number; readonly z: number }
  readonly createdAt: number
}
```

场景可以同时持有多个 SceneObject。`offset` 字段目前仅作记录，实际平移通过修改原子坐标实现（不是 Three.js 的 `group.position`）。

---

## 5. 两个 Store 的职责边界

### moleculeStore — 数据层

**管什么：**
- `objectsById` / `objectOrder`：场景对象树
- `activeObjectId`：当前编辑的对象
- `selectedAtomIds` / `selectedBondIds`：选择集
- `atomPositionVersion` / `selectionVersion`：脏检测版本号（不进 undo 历史）
- 所有分子编辑 action：addAtom / removeAtom / moveAtom / addBond 等

**不管什么：**
- 工具状态（用哪个工具）
- 显示参数（displayMode、showAtomLabels）
- 测量（measurements、pendingAtomIds）
- 主题
- 剪贴板

**Undo 支持：** 使用 `zundo` 包裹，`temporal.getState()` 可访问 undo/redo 历史，上限 50 步。版本号字段通过 `partialize` 排除在历史之外。

```ts
// 暂停/恢复 undo 历史（批量操作用）
store.beginTransaction()  // → temporal.pause()
store.endTransaction()    // → temporal.resume()
```

### editorStore — UI 状态层

**管什么：**
- `activeTool`：当前激活工具（select / measure / move-object；select 是合并了选择与构建的智能指针）
- `activeElement`：当前构建元素符号（"C" / "N" 等）
- `activeFragmentId`：片段笔刷（环系/官能团），非空时点击/双击语义切换为片段放置
- `sketchPlane`：平面草图模式（双击 P 进入），非空时放置/拖动约束在该平面
- `displayMode`：ball-stick / spacefill / stick / wireframe
- `showAtomLabels`：是否显示原子标签
- `themeId` / `theme`：当前主题
- `measurements` / `pendingAtomIds` / `measureType` / `measureStyle`：测量状态
- `clipboard`：内部分子剪贴板

**不包 undo**：editorStore 使用普通 Zustand store，没有历史。原子被删除（含 undo/redo）后，
`store/integrity.ts` 会级联清理 `measurements` / `pendingAtomIds` / `bondingAtomId` 里指向已删原子的引用。

---

## 6. 渲染管线

### 场景图结构

```
THREE.Scene
├── rotationGroup (Group)        ← 相机旋转操作的对象
│   └── modelGroup (Group)       ← 分子内容的父节点
│       ├── [per-object Group]   ← 每个 SceneObject 一个
│       │   ├── atom meshes
│       │   └── bond groups
│       └── _measureGroup        ← 测量几何体
└── GridHelper                   ← 网格辅助线（直接挂 scene）
```

**MolControls** 的旋转/平移/缩放**只操作 rotationGroup**，从不改动 modelGroup。`fitToMolecule` 时通过设置 `modelGroup.position = -bboxCenter` 将分子质心对齐到 rotationGroup 原点，之后不再修改。

### 各类的职责

| 类 | 职责 |
|----|------|
| `MolRenderer` | Orchestrator：创建场景、灯光、相机、动画循环；持有并协调子模块 |
| `MoleculeRenderer` | 管理原子球/键柱 mesh 的创建、更新、销毁；不持有 scene/camera |
| `MeasureVisuals` | 测量几何体（Line2 虚线、角度弧、二面角平面）生成与清理 |
| `RotateGizmoController` | 键/多原子旋转圆环 Gizmo；通过 `GizmoCallbacks` 注入 store 操作 |
| `InteractionHandler` | canvas 指针事件监听：点击 raycasting、原子拖拽、ghost 预览线 |
| `MolControls` | NGL 风格 arcball：左键旋转/中键 pan/右键+滚轮缩放 |
| `Ticker` | 全局 RAF 调度器，按 Phase 排序执行（Controls=10 → Gizmo=20 → Overlay=30 → Render=100） |

### 芳香键渲染

`MolRenderer` 维护一个 `WeakMap<readonly Bond[], string[][]>` 缓存芳香环检测结果。`bonds` 数组引用不变时直接命中缓存；优化计算（只改坐标不改 bonds）期间每帧都命中，不重跑 DFS。环心坐标每帧从当前原子位置实时计算（代价低）。

芳香键渲染为：实心圆柱（外侧键）+ 朝向环心的虚线圆柱段（内侧）。

---

## 7. 构建模型与事件路由

### 价态完整构建模型（核心设计）

画布上**永远是化学完整的分子**，每个编辑操作把一个合法分子变成另一个合法分子：

| 规则 | 行为 | 实现 |
|------|------|------|
| **放下即饱和** | 双击空白放 C 得到 CH₄、放 O 得到 H₂O（放 H 本身除外） | `addAtom` + `addHydrogens`（一步 undo） |
| **点 H 生长** | 点一个 H → 替换为当前元素的饱和基团（H 就是可见的生长槽位） | `growByReplacingH`：保留 H 的 id、沿父原子方向按标准键长重定位、补满 H |
| **H 让位成键** | 拖 H 到另一个 H → 两个 H 删除、父原子成键（闭环）；拖到有空位的重原子同理 | `bondByReplacingH` |

**明确不做**：改键级不自动增删 H（共轭/芳香/立体化学的坑太深）。电荷/自由基
未来通过显式的减 H/设电荷操作实现，不破坏此模型。

### 键级哲学（GaussView 语义：几何是真相，键级只是读数）

计算化学里没有单双键，只有距离。键级在本项目中是**粘性显示属性**，只在两个时机被设置：

1. **导入时**来自文件（2D 结构的键级以文件为准）
2. **用户显式调整时**：Shift+点键 = 循环标准键长（`cycleBondLength`）——把较小一侧
   片段沿键轴平移到单/双/三键标准长度，键级跟随几何更新；**环内键**无法平移，
   退回纯键级循环（只改显示/导出值，不动几何，2D 导入修键级就是这个场景）

拖动原子等普通几何编辑**永远不会**改写键级。

### 形式电荷 / 自由基（显式偏离默认饱和）

价态完整模型下，原子默认按中性满价补 H。电荷/自由基是**显式偏离**该默认的机制：

- `effectiveMaxBonds(symbol, charge, radical)`（elements.config）：有效成键数。
  中性无自由基时严格 == `maxBonds`（不影响任何已有分子）。规则：有孤对的元素
  （N/O/S/P）正电荷 +q、负电荷 −|q|；缺电子元素（C/B/H）±电荷都 −|q|；每个未配对
  电子再 −1。
- 设电荷/自由基（右键原子菜单）→ `setAtomCharge`/`setAtomRadical` → `resaturateAtom`
  按新有效价态**增删 H**：NH₃ 点 + → NH₄⁺（长第 4 个 H）、H₂O 点 − → OH⁻（掉一个 H）。
- 所有成键/生长/饱和判断都读 `effectiveMaxBonds`（带电 N⁺ 可成 4 键）。
- 徽标：`AtomLabelOverlay` 始终绘制电荷/自由基徽标（不受原子标签开关影响，蓝=正/红=负）。
- 导出：GJF 的电荷 = 形式电荷之和、多重度 = 未配对电子数 + 1，自动写入 —— 带电/
  自由基物种可直接投 Gaussian。

### 优化跑在 Web Worker + morph 动画（不冻结、看得见过程）

3D 生成/清理原来在主线程同步跑，大分子（ConformerGenerator 嵌入 ~3s）会冻结 UI。
现在：
- **Worker**：`apps/.../workers/molOpt.worker.ts` 后台跑 generate3D/minimizeGeometry，
  主线程保持 60fps。Worker **不能 import 包的 barrel**（会拉进渲染器/three，引用 window
  崩溃）——用无 DOM 的专用入口 `@retainmol/mol-viewer/optimize`（vite 多入口 + package
  exports 子路径）。`apps/.../lib/moleculeOpt.ts` 是主线程侧转发。
- **morph 动画**：OCL 的 MMFF `minimise({maxIts:N})` 未收敛时**不写回坐标**（只有跑到
  收敛才写），拿不到中间帧。所以用 初始→最终 的插值 morph（缓出 ~0.7s）近似弛豫动画，
  整段包一个 undo 事务 → 一步 undo。generate3D/minimizeGeometry 的结果带 `initial` 字段
  供 morph 起点。清理按钮走此路径（点了看它弛豫过去）。
- **景深关闭**：`DOF.enabled=false`——大分子铺开后离焦部分糊成一团、糊掉的原子没法点，
  科学工具都不用景深。

### 2D → 3D 立体化（Chem3D 式，OCL ConformerGenerator + MMFF94）

导入/粘贴 2D 结构（ChemDraw 式平面 SDF/mol，所有 z=0）自动生成合理 3D：
`generate3D(mol)`（`io/molFormat.ts`）两步——① `ConformerGenerator.getOneConformerAsMolecule`
按连接关系用距离几何嵌入 3D 坐标（含补氢）② `ForceFieldMMFF94.minimise` 力场抛光。
返回全新分子（新 id、含氢），调用方整体替换。固定随机种子 → 可复现。

- 接入：`is2D(mol)` 为真时，`useFileIO.make3DIfFlat`（导入）和 App 粘贴处理器
  自动调用；失败退回原平面结构。都先 `await registerForceFieldFromUrl` 确保资源就绪
  （ConformerGenerator 同样需要 MMFF 资源表）。
- 这解决了旧版「2D 文件请用 RDKit/OpenBabel/Avogadro 转」的外部依赖——现在应用内直接做。

### 几何清理（MMFF94 力场最小化）

手搭/导入的粗糙结构用「清理几何」按钮弛豫到物理合理（正确键长/键角、无重叠）。
**不自己造力场**——用 OpenChemLib 内置的 MMFF94（小分子力场金标准，已是依赖）：

- `minimizeGeometry(mol)`（`io/molFormat.ts`）：`moleculeToOCL` → `ForceFieldMMFF94`
  → `minimise()` → 原序读回坐标（`-getAtomY/-getAtomZ` 还原翻转）。只动坐标，
  保留 id/键/电荷/自由基。一步 undo。
- **参数表**（`resources.json`，1.35MB）：`registerForceFieldFromUrl(url)` 在 app 启动时
  后台 fetch 注册（`main.tsx`）；app 的 `predev/prebuild` 用 `scripts/copy-ocl-resources.mjs`
  把它从 node_modules 拷进 `public/ocl/`。未就绪 / MMFF 无法处理（异种元素/怪价态）时
  `minimizeGeometry` 原样返回并带 reason，按钮 flashHint 提示。
- 教训：几何优化这种「别人论证好的算法」直接用成熟库，不手写力场。

### 并环的方向探索与原子自动合并（Ketcher 式铺环系）

苯环笔刷点击已有键（`fuseFragmentOnBond`）的行为：

1. **两侧自动尝试**：优先把新环放在远离已有取代基的一侧；该侧被占则自动翻面。
2. **重合原子自动合并**：新环原子落在已有同元素原子上（< 0.45 Å）→ 合并共用该
   原子而不是拒绝，并删掉它被新键顶替的 H。这让新环能"自动探索左右的键"：
   - 萘的**桥头旁键**并环 → 新环与邻环 α 碳自动合并 → peri 稠合三环（C13H9）
   - 菲的 **bay 凹区**并环 → 双原子合并 → 芘（C16H10）
3. **决策规则**：两侧都可行时优先零合并的干净并环（外侧）；模板原子全部重合
   （点了稠环共享键）视为退化，拒绝。
4. 合并原子有价态检查（删 1 H 后加新键不得超 maxBonds），超价一侧作废。

连点几下即可铺出蒽/菲/芘等稠环系，测试见 `editing/fuseChain.test.ts`。

### 几何参数编辑（GaussView 式）

选中 2/3/4 个原子（**按选择顺序**，Set 保持插入序）后，右侧「几何」面板的数值可直接点击修改：

| 选中 | 参数 | 语义 |
|------|------|------|
| 2 原子 A、B | 距离 | 沿 A→B 轴平移 B 端片段（无键但异片段 → 平移 B 的整个片段） |
| 3 原子 A、B、C | 键角（B 为顶点） | 绕 BA×BC 轴旋转 C 端片段 |
| 4 原子 A、B、C、D | 二面角（有符号） | 绕 B–C 轴旋转 C 端片段（需 B–C 有键） |

被移动的永远是**末端一侧的刚性片段**（内部几何不变）；环内约束（切不开）
一律拒绝并提示，不做变形。纯函数在 `editing/geometryOps.ts`
（`setBondLength` / `setBondAngle` / `setDihedralAngle`），store action 同名，
每次修改 = 一步 undo。只动坐标，从不动键级。

**芳香性不依赖 Kekulé 交替**：`detectAromaticity` 三条路径按序尝试——
① SDF 导入的 `aromatic` 标记 → ② **几何判据**（5~7 元简单环、环原子连接数 ≤ 3、
环内每条键长落在 `AROMATIC_LENGTH_WINDOWS` 芳香窗口，如 C–C 1.36~1.43 Å）→
③ Hückel 规则（兜底，服务带 Kekulé 键级的导入结构）。苯环片段的生成坐标是
1.39 Å 均匀六边形，放下即芳香。

### 指针工具（select）：笔刷武装态显式分流

select 是唯一的指针工具，但**构建和选择是两个显式可见的态**（`editorStore.brushArmed`），
消除"同一次点击既可能选择又可能编辑"的歧义：

- **构建态（武装）**：工具条「编辑」按钮（铅笔）高亮；选元素/片段、点编辑按钮、B 键、
  点灰色 chip 均可进入。十字光标、元素 chip 高亮、状态栏显示「编辑 · C」。点击只做构建。
- **选择态（解除）**：工具条「选择」按钮（箭头）高亮；Esc / S 键 / 点选择按钮进入。
  默认光标、chip 变灰、状态栏显示「选择」。点击只做选择。
- 两个按钮互斥高亮（同一指针工具的两个显式态）。启动默认武装 C 笔刷（建模优先）。

| 操作 | 构建态（武装） | 选择态（解除） |
|------|--------------|--------------|
| 单击 H（有键） | 生长（替换为当前元素饱和基团） | 选中 |
| 单击重原子 | 未饱和 → VSEPR 生长；饱和 → 闪提示（不选中） | 选中 |
| 单击键 | 选中键 | 选中键 |
| Shift+单击原子 | 多选（两态通用） | 多选 |
| Shift+单击键 | 循环标准键长，键级随几何；环内键退回纯键级循环（两态通用） | 同左 |
| 双击原子 | 选中整个连通片段 | 同左 |
| 双击空白 | 放置原子/片段（自动补 H） | 无操作 |
| 单击空白 | 清除选择 | 清除选择 |
| 拖未选中的 H / 未饱和原子 | bond-drag 手势（成键/生长，GhostVisuals 预览） | 转相机 |
| 拖已选中的原子 | 移动整个选择集（两态通用） | 同左 |
| 拖饱和重原子 / 空白 | 转相机 | 转相机 |
| 片段笔刷 | 点 H/原子 = 接上，点键 = 并环，双击空白 = 放置 | （选片段即武装，不存在此态） |

**防误触**：`InteractionHandler` 记录 pointerdown 位置，抬起时位移超过
`INTERACTION.dragStartThreshold`（4px）的 click/dblclick 一律忽略——浏览器在拖拽
（转相机）松手后仍会派发 click，不拦会导致转个视角就清空选择。

### 事件路由

```
DOM pointerdown (container capture 阶段)
        │
        ▼
useCanvasPointerRouter (最高优先级)
        │
        ├─ activeTool === 'move-object'
        │        │
        │        └─ handleTransformDown → setObjectAtomPositions (直接调 store)
        │           ┌ drag: 平移 → screenDeltaToModelLocal
        │           └ Alt+drag: 绕质心旋转（纯矩阵运算）
        │
        ├─ Shift+左键 or 右键（空白）→ 框选
        │        │
        │        └─ finishBoxSelect → selectAtoms (投影所有原子到屏幕坐标判断是否在矩形内)
        │
        └─ 放行 → InteractionHandler (canvas 内部监听器)
                    │
                    ├─ pointerdown 在原子上 → onBondDragStart 返回 true？
                    │       ├─ 是 → bond-drag 状态机（GhostVisuals 预览）→ onBondDragEnd
                    │       └─ 否 → canDragAtom？→ 原子拖拽（移动选择集）
                    ├─ click → raycasting → onAtomClick / onBondClick / onBackgroundClick
                    └─ dblclick → onAtomDoubleClick / onBackgroundDoubleClick（放置）
                                │
                                ▼
                        useBuilder (BuilderHandlers)
                                │
                                ├─ activeTool === 'select'  → 智能指针语义（见上表）
                                ├─ activeTool === 'measure' → addMeasureAtom
                                └─ activeTool === 'move-object' → （由路由层处理）
```

`useCanvasPointerRouter` 挂在 **container 的 capture 阶段**，比 canvas 上所有监听器都先触发，调用 `stopImmediatePropagation` 可完全截断事件。

---

## 8. Hook 分工

### `useMolViewerSync`

解决受控/非受控双模式的**防循环同步**问题：
- `moleculeProp` 写入 store 时记录引用（`lastPropMolRef`），store 变更回调时跳过相同引用，避免回调 → prop → store 循环。
- 选择状态用 `selectionVersion` 版本号防循环：prop 写入后记录当前版本，subscription 收到同版本时跳过。
- 返回最终生效值（`displayMode` / `showAtomLabels` / `theme`），prop 优先，缺省退回 store。

### `useRendererBinding`

- **生命周期**：canvas mount 时创建 `MolRenderer`，unmount 时 dispose（依赖数组为空，只跑一次）。
- **事件绑定**：`readOnly` 或 `activeTool` 变化时更新 renderer 的 callback 属性。只有 `select` 工具才绑定拖拽 handler。
- **场景同步**：`sceneObjects` / `displayMode` / `selectedAtomIds` 任意变化 → `renderScene`。
- **视角跟随**：分子名变化或 activeObjectId 切换时 `fitToMolecule`，否则只调 `updateOrbitTarget`。**`move-object` 工具激活时跳过**（否则 modelGroup 偏移导致所有分子一起移动）。
- **ResizeObserver**：监听 container 尺寸变化，调用 `renderer.resize`。

### `useCanvasPointerRouter`

见第 7 节事件路由，负责 `move-object` 工具（平移/旋转片段）和框选（矩形区域选原子）的高优先级拦截。

### `useBuilder`

把 `InteractionHandler` 的回调映射到具体的 store 操作（智能指针语义见第 7 节）：
- **点击分发**：`onAtomClick` 按目标类型分发（H → `growFromHydrogen`，重原子 → `selectAtom`，片段笔刷 → `attachFragmentToAtom`）。
- **放置**：`onBackgroundDoubleClick` → `addAtom` + `addHydrogens`（一步 undo）；单击空白只 `clearSelection`。
- **bond-drag**：`onBondDragStart` 决定是否进入手势（槽位 H / 未饱和原子，且未被选中）；`onBondDragEnd` 按落点分发（H 让位成键 / 普通成键 / 槽位替换生长）；`getGrowPreview` / `getGrowGuide` 提供 GhostVisuals 的预览数据。
- **原子拖拽**：`onAtomDragStart` 时快照当前选中原子坐标 + `beginTransaction`（undo 暂停），拖拽期间批量更新坐标，`onAtomDragEnd` 时 `endTransaction`（undo 恢复，整次拖拽作为一个 undo 步骤）。
- **双击原子**：选中整个连通片段（`getConnectedFragment`）。

---

## 9. IO 层

### 支持格式

| 格式 | 解析入口 | 导出入口 |
|------|---------|---------|
| MOL/SDF (V2000/V3000) | `parseMol` / `parseSdf` | `exportMol` / `exportSdf` |
| XYZ | `parseXYZ` | `exportXYZ` |
| Gaussian GJF | `parseGJF` | — |
| 裸原子坐标 (`C x y z` 每行) | `parseRawCoords` | — |

统一入口：`parseClipboard(text)` 自动调 `detectPasteFormat` 识别格式后分发。

### OCL 的已知问题

**坐标翻转**：OCL 内部对 y / z 轴取反。从 SDF 读入时需 `-getAtomY` / `-getAtomZ` 还原；写出时需 `setAtomY(-y)` / `setAtomZ(-z)` 补偿：

```ts
// oclToMolecule：读取时翻转
atoms.push(newAtom(
   oclMol.getAtomX(i),
  -oclMol.getAtomY(i),   // 取反
  -oclMol.getAtomZ(i),   // 取反
))

// moleculeToOCL：写入时翻转
oclMol.setAtomY(idx, -a.y)
oclMol.setAtomZ(idx, -a.z)
```

**芳香键 type-4**：SDF V2000 中芳香键类型为 4，OCL 不直接映射为 `order=2` 而是通过 `isAromaticBond()` 判断。代码通过反射调用该方法并在 Bond 上设置 `aromatic: true`，后续芳香性检测会优先信任此标记。

**`addBond` 键级无效**：OCL 的 `addBond` 第三个参数被忽略，必须用 `addOrChangeBond` 才能设置键级（也通过反射调用）。

**MOL 头格式修复**：`normalizeMolHeader` 修复 OpenBabel 等工具输出的只有 2 行头的非标准格式，确保 counts 行在第 4 行。

---

## 10. 键合推断

`inferBonds(atoms)` 是 O(n²) 全对全遍历，判断两原子是否成键：

```ts
// 1. 距离过滤
const maxBond = (r1 + r2) * BONDING.tolerance  // 默认 tolerance = 1.3
if (dist < maxBond && dist > BONDING.minBondLength) {  // minBondLength = 0.4 Å
  const order = inferBondOrder(sym1, sym2, dist)
  ...
}
```

**键级判断** (`inferBondOrder`)：

```ts
function inferBondOrder(sym1, sym2, dist): 1 | 2 | 3 {
  const d1 = lookupBondLengthByOrder(sym1, sym2, 1)  // 查标准单键长
  const d2 = lookupBondLengthByOrder(sym1, sym2, 2)  // 查标准双键长，不在表中返回 null
  const d3 = lookupBondLengthByOrder(sym1, sym2, 3)  // 查标准三键长

  const bias = BONDING.orderMidpointBias  // 0.02 Å，收紧阈值减少误判

  if (d3 && d2 && dist <= (d2 + d3) / 2 - bias) return 3
  if (d2 && dist <= (d1 + d2) / 2 - bias)        return 2
  return 1
}
```

键长查找表在 `config/geometry.config.ts` 的 `STANDARD_BOND_LENGTHS`（键格式 `"C=C"`、`"C#N"` 等）。对单键，若不在表中，用 `(r1 + r2) * 1.08` 估算（共价半径之和乘修正系数）。

**相关配置**：

```ts
// config/bonding.config.ts
export const BONDING = {
  tolerance: 1.3,          // 调高会多连非键；调低会漏键
  minBondLength: 0.4,       // 过滤坐标重合的错误数据
  singleBondRadiusFactor: 1.08,
  orderMidpointBias: 0.02,  // 减少双键/三键误判
}
```

---

## 11. 常见坑

### 新增运行时依赖必须同步 externals

`vite.config.ts` 的 `externals` 名单是手工维护的：不在名单里的依赖会被**整库内联**
进 `dist/index.js`。曾经 `openchemlib`（~3MB）漏加，导致产物从 265KB 膨胀到 3.4MB。
新增依赖时两处都要改：`vite.config.ts` externals + `package.json` dependencies。

### `genId` 代替 `crypto.randomUUID`

**直接调用 `crypto.randomUUID()` 会在非 HTTPS / 非 localhost 环境下抛出 `TypeError`（安全上下文限制）。** 始终用 `genId()`：

```ts
import { genId } from '../lib/utils'
// genId 内部优先用 crypto.randomUUID，失败则退回 Math.random polyfill
```

### `move-object` 时跳过 `updateOrbitTarget`

`useRendererBinding` 里视角跟随逻辑有一条守卫：

```ts
if (activeTool === 'move-object') return
```

原因：`updateOrbitTarget` 通过设置 `modelGroup.position`（= -bboxCenter）来更新旋转轴心。`move-object` 工具在 `useCanvasPointerRouter` 里直接修改原子坐标，如果同时触发 `updateOrbitTarget`，会导致整个 modelGroup 随质心偏移，使所有分子一起位移，视觉表现为分子"飞走"。

### `GizmoCallbacks` 注入模式

`RotateGizmoController` 是 `lib/` 层的纯 Three.js 类，不能直接 import store（违反分层规则）。store 操作通过 `GizmoCallbacks` 接口注入：

```ts
export interface GizmoCallbacks {
  getMolecule: () => Molecule
  setAtomPositions: (positions: ReadonlyMap<string, ...>) => void
  beginTransaction: () => void
  endTransaction: () => void
}
```

React 壳 `RotateGizmo.tsx` 在构造时绑定 store 方法作为回调传入。这是 lib 层引用 store 的标准绕过方式。

### `canDragAtom` 被 Gizmo 劫持

`RotateGizmoController` 构造时保存原来的 `renderer.canDragAtom`，然后替换为自己的版本（Gizmo 环 hover 时禁止拖原子）。`dispose()` 时恢复原函数。中间不要直接覆盖 `renderer.canDragAtom`，否则会破坏 Gizmo 的 hover 锁定逻辑。

### 芳香键的 `aromatic` 标记 vs Hückel 检测

`detectAromaticity` 里有两条路径：
1. 若环内所有键都带 `aromatic: true`（SDF 导入时由 OCL 设置），直接认定为芳香环，跳过 Hückel 计算。
2. 否则走 Hückel 规则（isFullyConjugatedRing + countPiElectrons）。

手工建模时键没有 `aromatic` 标记，要靠 Hückel 路径识别苯环等结构。

### `beginTransaction` / `endTransaction` 的批量 undo

原子拖拽期间每帧都会调 `setAtomPositions`，每次都会进 undo 历史。`beginTransaction` 调用 `zundo` 的 `pause()`，期间所有 store 更新不写入历史；`endTransaction` 调用 `resume()`，此时将累积的差值作为一个 undo 步骤提交。**务必成对调用，否则 undo 历史会被永久暂停。**

### 图查询统一走 `graph.ts`

原子连接数、键存在性、邻居/H 宿主等分子图基础查询统一用 `lib/builder/graph.ts`
（`degree` / `findBond` / `neighborsOf` / `hNeighborsOf` / `hParentOf` / `bondsOf` / `otherEnd`），
不要再内联 `bonds.filter(b => b.atomId1 === id || b.atomId2 === id)` 重写一份。
注意 `degree` 数的是邻居条数（不计键级）——价态完整模型的硬规则。

### Ticker Phase 顺序

Gizmo 更新（Phase 20）必须在 Three.js 渲染（Phase 100）之前，否则当帧 Gizmo 位置不对。加新的帧回调时按含义选择合适 Phase：

```ts
ticker.subscribe('my-overlay', Phase.Overlay, fn)  // Phase.Overlay = 30
```

---

## 12. 公开 API 速查

通过 `packages/mol-viewer/src/index.ts` 导出的主要符号：

```ts
// 组件
MolViewer, MolViewerProps

// 数据类型
Molecule, Atom, Bond, SceneObject, DisplayMode, Tool, Measurement

// Store
useMoleculeStore, useEditorStore, useMoleculeTemporal
selectActiveMolecule, selectActiveMoleculeOrEmpty

// IO
parseMol, parseSdf, exportMol, exportSdf
parseXYZ, exportXYZ, parseClipboard

// 分子工具函数
newAtom, newBond, inferBonds, centerMolecule, shiftMolecule
calcDistance, calcAngle, calcDihedral, canBond

// 建模 hook
useBuilder, bondSelectedAtoms

// 元素配置
getElementConfig, COMMON_ELEMENT_SYMBOLS

// 主题
resolveTheme, listThemes

// 其他
fetchCompoundSdf, SAMPLE_MOLECULES, getConnectedFragment, splitConnectedComponents
```
