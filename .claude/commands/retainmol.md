# RetainMol 项目 Skill

RetainMol 是一个基于浏览器的分子建模工具，monorepo 结构。

## 项目结构

```
RetainMol/
├── packages/mol-viewer/     # 组件库（Three.js 渲染 + Zustand 状态）
│   └── src/
│       ├── components/viewer/   # MolViewer 组件 + overlays
│       ├── hooks/               # useBuilder / useRendererBinding / useMolViewerSync / useCanvasPointerRouter
│       ├── lib/
│       │   ├── molecule.ts      # Atom / Bond / Molecule 类型 + newAtom / newBond
│       │   ├── molRenderer/     # MolRenderer / MoleculeRenderer / InteractionHandler
│       │   ├── builder/         # BuilderEngine + analysis (aromaticity, fragments)
│       │   └── io/              # parseMol / parseSdf / exportMol / pasteParser
│       └── store/
│           ├── moleculeStore.ts # 分子数据 + 场景 + 选择（有 undo）
│           └── editorStore.ts   # 工具 / 显示 / 测量 / 主题（无 undo）
└── apps/retainmol/          # React 应用（Vite + Tailwind + shadcn/ui）
    └── src/
        ├── App.tsx
        ├── components/toolbar/  # Toolbar + ToolStrip
        ├── components/panels/   # RightPanel / ElementPicker / AtomListPanel
        └── features/
            ├── geometry/        # GeometryPanel
            ├── measure/         # MeasurePanel
            └── scene/           # ScenePanel（分离 + 场景管理）
```

## 技术栈

- **前端**：Vite + React + TypeScript + Tailwind CSS + shadcn/ui
- **3D 渲染**：Three.js（自定义渲染器，无 react-three-fiber）
- **状态管理**：Zustand + zundo（undo/redo）
- **化学信息学**：OpenChemLib（MOL/SDF 解析）

## 启动方式

```bash
# 先构建 mol-viewer 再启动前端（predev 脚本自动执行）
npm run dev --workspace=apps/retainmol

# 单独构建 mol-viewer（修改包后必须执行）
npm run build --workspace @retainmol/mol-viewer
```

> **重要**：修改 `packages/mol-viewer/src/` 下任何文件后，必须重新 build mol-viewer，
> 否则 app 仍使用旧的编译产物。

## 架构要点

### 构建交互模型（价态完整，2026-07 定稿）

Tool 类型只有 3 个：**select（指针）/ measure / move-object**，但工具条上「选择」和
「编辑」是两个独立按钮（互斥高亮）——都对应 select 工具，由 `editorStore.brushArmed`
区分：编辑按钮亮 = 构建态（点击只构建，十字光标、chip 高亮），选择按钮亮 = 选择态
（点击只选择；Esc/S 进入，编辑按钮/选元素/B/点灰 chip 恢复）——同一次点击绝不会
既可能选择又可能编辑。画布上永远是化学完整的分子：

- **放下即饱和**：双击空白放原子，自动补满 H（C→CH₄）；**单击空白只清除选择**（防转视角误触）
- **点 H 生长**：点一个 H = 替换为当前元素的饱和基团（`growByReplacingH`）；点重原子 = 选中
- **H 让位成键**：拖 H 到另一个 H = 删两个 H、父原子成键（闭环，`bondByReplacingH`）
- **键级哲学**（用户明确决定，勿改）：几何是真相，键级只是读数。键级只在导入时
  和 Shift+点键（`cycleBondLength`：循环标准键长，平移一侧片段，键级跟随；环内键
  退回纯键级循环）时被设置，拖原子等几何编辑永远不动键级，也不自动增删 H
- **芳香性用几何判据**：环内键长均匀落在芳香窗口（C–C 1.36~1.43 Å）即芳香，
  不依赖 Kekulé 单双键交替；SDF aromatic 标记仍优先
- **几何参数编辑**（GaussView 式）：选 2/3/4 个原子（按选择顺序）→「几何」面板点数值
  直接改距离/键角/二面角；移动末端一侧刚性片段，环内拒绝。纯函数在
  `editing/geometryOps.ts`，store action：setBondLength/setBondAngle/setDihedralAngle
- **并环自动探索**（Ketcher 式）：苯环笔刷点键并环会两侧自动尝试方向，新环原子与
  已有原子重合（<0.45Å 同元素）自动合并——桥头旁键 → peri 稠合，bay 凹区 → 芘。
  优先零合并的干净侧；稠环共享键退化拒绝。见 fragmentOps.fuseFragmentOnBond
- 删除没有专门工具：选中 + Delete 键，或右键菜单

详细语义见 `apps/retainmol/mol-view.md` 第 7 节。

### 两个 Store 的职责边界

| moleculeStore | editorStore |
|--------------|------------|
| objectsById / objectOrder / activeObjectId | activeTool / activeElement |
| selectedAtomIds / selectedBondIds | displayMode / bondingAtomId |
| 所有分子编辑 action | showAtomLabels / theme / themeId |
| addToScene / removeSceneObject | measurements / measureStyle |
| **进入 undo 历史** | **不进入 undo 历史** |

### 事件路由层级

```
Container（capture） → useCanvasPointerRouter
  ├── move-object tool → 对象变换（平移/旋转片段）
  ├── Shift+左键/右键空白 → 框选
  └── 其他 → 放行给 InteractionHandler（canvas capture）
```

### mol-viewer 包的 hook 分工

| Hook | 职责 |
|------|------|
| `useMolViewerSync` | props ↔ store 双向同步（受控/非受控） |
| `useRendererBinding` | 渲染器生命周期 / 事件绑定 / 场景同步 |
| `useCanvasPointerRouter` | 统一指针事件路由 + 框选逻辑 |
| `useBuilder` | 工具点击/拖拽的业务逻辑 |

## 常见坑

### crypto.randomUUID 在非安全上下文不可用

**症状**：`Uncaught TypeError: crypto.randomUUID is not a function`

**原因**：通过局域网 IP（如 192.168.x.x）访问时，浏览器不认为是安全上下文，`crypto.randomUUID` 未定义。

**规范**：项目中**禁止直接使用 `crypto.randomUUID()`**，统一使用 `genId()`：

```ts
import { genId } from '../utils'  // mol-viewer 内部
// 或
import { genId } from '@retainmol/mol-viewer'  // app 层（如需）
```

`genId()` 在 `packages/mol-viewer/src/lib/utils.ts`，会自动降级到 `Math.random()` polyfill。

### OCL y/z 坐标取反

OpenChemLib 内部对 y 和 z 取反：

- **导入**（`oclToMolecule`）：用 `-getAtomY(i)` / `-getAtomZ(i)` 还原
- **导出**（`moleculeToOCL`）：用 `-a.y` / `-a.z` 补偿

### 芳香键（SDF type-4）检测

PubChem/ChemDraw 导出的 SDF 用 bond type 4 表示芳香键，OCL 读进来后
`getBondOrder()` 返回 1（全单键）。  
`oclToMolecule` 通过 `isAromaticBond(i)` 检测并设置 `bond.aromatic = true`，
`detectAromaticity` 会直接信任该标志而不走 Hückel 计算。

### move-object 工具与框选的按键分工

| 操作 | 按键 |
|------|------|
| 框选多个原子 | Shift + 左键拖拽 |
| 移动/平移片段 | V 工具 + 左键拖拽 |
| 旋转片段 | V 工具 + Alt + 拖拽 |
| 旋转整个活跃分子 | V 工具 + Alt + 拖拽空白处 |

**注意**：Shift 和 move-object 工具冲突时，路由层 `useCanvasPointerRouter` 的
container capture 会优先拦截 move-object，Shift 只在非 move-object 工具下触发框选。

### updateOrbitTarget 与多分子场景

`updateOrbitTarget` 通过移动 `modelGroup` 让相机跟随活跃分子质心。
在 `move-object` 工具激活时，必须跳过此逻辑（`useRendererBinding` 里有 `if (activeTool === 'move-object') return`），
否则平移一个分子时 `modelGroup` 偏移会导致所有分子视觉上一起移动。

## 开发规范

1. **ID 生成**：一律用 `genId()`，不用 `crypto.randomUUID()`
2. **editor 状态**（工具/显示/测量）从 `useEditorStore` 读写
3. **分子数据**（原子/键/场景对象）从 `useMoleculeStore` 读写
4. **修改 mol-viewer 后**：必须 `npm run build --workspace @retainmol/mol-viewer`
5. **新增工具**：在 `editorStore` 的 `Tool` 类型里加，在 `useCanvasPointerRouter` 里
   添加路由分支，在 `ToolStrip` 里加按钮
6. **mol-viewer 新增运行时依赖**：必须同时加进 `vite.config.ts` 的 externals 名单
   和 `package.json` dependencies，否则整库内联进 dist（openchemlib 3MB 教训）
