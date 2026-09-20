# mol-viewer 独立宿主接入

入口：[可运行示例](../../examples/mol-viewer-consumer/README.md)。
在根目录运行 `npm run example:viewer`，浏览器打开脚本输出的 `127.0.0.1:5273`。
示例不依赖 RetainMol App、Ketcher、后端或 API 密钥。

## 安装与渲染

宿主需要 React、ReactDOM 和符合包 peer 范围的 Three.js。示例使用 React 19，
Three.js 0.184，Vite 与 Tailwind 版本与本仓库技术栈一致。

```tsx
import { MolViewer } from '@retainmol/mol-viewer/viewer'

<div style={{ height: 430 }}>
  <MolViewer interactionMode="select" />
</div>
```

viewer 的容器必须有确定高度。当前包没有独立 CSS 产物，overlay 使用 Tailwind 工具类；
Tailwind 4 宿主需在 CSS 中显式扫描安装包，例如 CSS 位于 `src/` 时：

```css
@import "tailwindcss";
@source "../node_modules/@retainmol/mol-viewer/dist";
```

宿主必须使用同一套 React/Three 实例，不要把源码目录 alias 到一个拥有另一份依赖的 checkout。

## 导入、构象与编辑

浏览器生成 3D 前调用 `registerForceFieldFromUrl(resourceUrl)`；示例将消费者自己安装的
OpenChemLib `resources.json` 复制到 `public/ocl/`，并按 Vite `BASE_URL` 构造资源路径。
资源应与所用 OCL 版本匹配，不要从其他版本的 App 拷贝旧参数表。

`parseMol` → `generate3D` 后检查 `result.ok`，成功才通过
`useMoleculeStore.getState().setMolecule(result.molecule)` 提交。
示例把“导入并生成 3D”定义为新会话，因此之后清空历史；“重载导出”保留为可撤销操作，
直接 `parseMol` 已导出的坐标，不再次生成构象。

宿主提供的手动编辑按钮调用 `/state` action，例如 `replaceAtom`、`setChirality`。
读取 `getAtomChiralityState` 时要区分 `computed`（坐标读数）和 `specified`（明确指定）；
两者的解释见[手性边界](./stereochemistry.md)。自动生成的构象不代表用户指定了某个对映体。

`useMoleculeStore.temporal` 提供 `undo`、`redo`、`clear` 与历史订阅。
示例通过 React `useSyncExternalStore` 订阅历史长度，让按钮状态随撤销和重做更新。
AI 提案仍应通过 `/modeling` 的 dry-run / commit 流程；不要把手动按钮示例当作 AI 直接改 store 的方案。

## 多实例与生命周期边界

| 能力 | 当前接入方式 |
| --- | --- |
| 单个编辑器的完整 store action / history | `/state` 导出的默认实例 |
| 第二个独立 viewer | 创建 runtime，传 `runtime` 和受控 `molecule` prop |
| 实例实际状态核对 | `getModelingContext(runtime)` |
| 每个实例适配相机 | 通过 `onRendererChange` 获取该实例 `RendererPort`，调用 `fitToMolecule` |
| 受控变更 | `onMoleculeChange` / `onSelectionChange`，宿主保持不可变更新 |
| 只读交互 | `interactionMode="read-only"`，只保留相机交互 |

`/state` 和 `fitViewport()` 等全局便捷命令仍绑定默认实例。
不能把它们当作第二个 runtime 的编辑/相机命令。`RendererPort` 是窄公开接口，
可用于实例相机控制；不要向内部 renderer 或 runtime services 深路径导入。

`MolViewer` 卸载会释放自己的 renderer；由宿主创建的 runtime 由宿主释放。
示例在 effect 内创建副本 runtime，并在同一 effect 的 cleanup 中 dispose，
使 React StrictMode 的 effect 重放能获得新实例。不要在 `useState` 初始化中创建 runtime，
却在会被 StrictMode 重放的 effect cleanup 中提前释放它。默认共享 runtime 不由单个 viewer 释放。

当前示例只证明“一份默认可编辑实例 + 一份隔离只读实例”的接入方案；
两份独立完整编辑器的 R/S action 与 undo/redo 公共门面仍是后续 API 工作。

## 人工验收步骤

测试分子仅为 `CC(F)(Br)I` 及其一次 H→Cl 修改，以下步骤需在真实浏览器执行。
记录浏览器版本、包提交、实际结果和截图；不要仅根据 Node 测试或页面 HTTP 状态勾选。

1. 填入测试 MOL，导入并生成 3D：两个视口均有可见球棍模型；点击“检查副本”，
   初始分子式和构型读数与编辑实例相同，指定为“未指定”。
2. 指定 R，再指定 S：标签与读数匹配，C–F / C–Br / C–I 长度保持不变；
   “检查副本”仍为初始状态。只读副本的分子/选择回调保持 0。
3. 执行 H→Cl、撤销、重做：分子式相应变化、恢复、再次变化。
   单次操作只需一次撤销；重做按钮在新编辑后失效。
4. 导出 MOL、重载导出：分子式与指定手性保持；坐标四位小数舍入允许键长误差
   小于 0.0002 Å。文本能从页面复制。
5. 真实点击左侧原子：已选原子计数更新。点击、右键、拖动只读副本：
   可旋转相机，无编辑菜单、选择变化或分子回调。两侧“适配视口”各自生效。
6. 连续卸载/重新挂载 10 次：卸载时视口消失；挂载后两个模型恢复且可交互，
   编辑数据保留，副本恢复导入快照。一次编辑只新增一次回调，避免重复订阅。
7. 窗口缩小/放大后两个 canvas 仍非零、无拉伸或空白；检查本次页面的 console error。

## 本次验证状态（2026-09-20）

以下自动检查在独立任务 worktree 完成。示例经 `npm pack` 安装到仓库外临时目录，
通过本地生产预览服务提供页面；HTTP 200 仅确认可访问，不作为交互通过证据。

| 项目 | 状态 |
| --- | --- |
| 安装真实 tarball，无 workspace 源码链接 | 通过，测试断言解析结果为消费者安装的实际文件 |
| Node 公共 API：R/S、所有键长、undo/redo、MOL 往返、H→Cl | 通过，4 项消费者回归；其中 runtime 隔离检查仅覆盖空实例不受默认 store 编辑影响及 dispose |
| 消费者严格 TypeScript 与 Vite 生产构建 | 通过，React 19.2.5 / Three.js 0.184.0；构建仍有大 chunk 提示 |
| 根 `npm run verify` | 通过：原有 1144 项 JS 测试 + 4 项消费者测试、Lean/Python 几何检查、类型/构建/API/打包门禁；15 项既有 lint warning、无 lint error |
| 实际 WebGL、选择、双实例、只读交互、10 次挂卸载 | 未完成：浏览器连接在实际操作时反复超时，尚无本示例的交互/截图证据 |
| 浏览器兼容性、较大分子性能、GPU 内存泄漏 | 未覆盖 |

这份示例是集成基线，不能据此扩大复杂手性、化学正确性或生产就绪承诺。
