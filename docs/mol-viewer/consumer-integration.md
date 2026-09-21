# mol-viewer 独立宿主接入

入口：[可运行示例](../../examples/mol-viewer-consumer/README.md)、[实例级 API](./instance-api.md)。
根目录运行 `npm run example:viewer`，打开脚本输出的 `127.0.0.1:5273`。
示例安装真实 tarball，不依赖 RetainMol App、Ketcher、后端或 API 密钥。

## 安装与渲染

宿主需要 React、ReactDOM 和符合包 peer 范围的 Three.js。示例使用 React 19、
Three.js 0.184、Vite、Tailwind。每个独立编辑器分别创建 runtime 和 API：

```tsx
import { MolViewer } from '@retainmol/mol-viewer/viewer'
import { createViewerRuntime, getViewerApi } from '@retainmol/mol-viewer/runtime'

// 在宿主 effect 中创建，cleanup 中释放；完整代码见示例的 EditorPanel.tsx。
const runtime = createViewerRuntime()
const api = getViewerApi(runtime)
// JSX：<div style={{ height: 430 }}><MolViewer runtime={runtime} interactionMode="select" /></div>
```

viewer 容器必须有确定高度。包没有独立 CSS 产物，overlay 使用 Tailwind 工具类；
Tailwind 4 宿主需显式扫描安装包，例如 CSS 位于 `src/` 时：

```css
@import "tailwindcss";
@source "../node_modules/@retainmol/mol-viewer/dist";
```

宿主必须使用同一套 React/Three 实例，不要把源码 alias 到另一个拥有独立依赖的 checkout。

## 导入、构象与编辑

浏览器生成 3D 前调用 `registerForceFieldFromUrl(resourceUrl)`；示例将消费者安装的
OpenChemLib `resources.json` 复制到 `public/ocl/`，使用 Vite `BASE_URL` 构造路径。
资源必须匹配 OCL 版本。Node 使用 `Resources.registerFromNodejs()` 和 `markForceFieldReady()`。

`parseMol` → `generate3D` 后检查 `result.ok`，成功才通过 `api.setMolecule` 提交。
示例将“载入此侧”定义为新会话，随后调用 `api.history.clear()`；“重载导出”保留为
可撤销操作，直接解析已有坐标，不再次生成构象。

`api.edit.setChirality/replaceAtom` 等与手动编辑使用同一命令层。
读取 `getAtomChiralityState` 时区分 `computed`（坐标读数）和 `specified`（明确指定）；
见[手性边界](./stereochemistry.md)。自动生成的构象不代表用户指定某个对映体。

通过 `useSyncExternalStore(api.subscribe, api.getSnapshot, api.getSnapshot)` 订阅
分子、选择、历史和显示状态。相机与截图使用 `api.view`，不会误操作另一实例。
示例保留 `onRendererChange` 仅用于显示渲染器是否就绪，不依赖 renderer 内部方法。

## 多实例与生命周期

- 左右两个 runtime 都支持完整示例编辑、R/S、选择、撤销重做和导出。
- 创建与 dispose 放在同一个 effect，StrictMode 重放时创建新 runtime。
- 单独卸载视口保留该 runtime 的分子和历史；重新挂载恢复显示。
- runtime 销毁后取消 API 订阅与待发回调，旧 API 句柄报错。
- `/state` 和全局视口便捷函数只操作默认实例，不用于这两个编辑器。
- 只读模式限制交互，宿主 API 仍可以更新数据；示例同步禁用编辑按钮。

## 浏览器验收步骤

1. 初始两个视口均显示 `CC(F)(Br)I`，历史为空、指定手性为未指定。
2. 左侧指定 R，右侧指定 S；各侧标签/数据匹配，C–F / C–Br / C–I 长度不变。
3. 左侧 H→Cl、撤销、重做；右侧结构、选择、历史、相机保持独立。
4. 导出并重载 MOL，分子式与指定手性保持；未再次生成构象。
5. 在视口实际点选原子，检查高亮、API 选择快照与回调；删除后撤销，结构恢复。
6. 切换一侧显示模式、标签，适配/旋转视角并截图；另一侧不受影响。
7. 开启只读，点击/右键/拖动不得编辑或改变选择，相机交互仍可用。
8. 一侧连续卸载/挂载 10 次，结构和历史保留，另一侧持续可用；之后一次编辑只新增一次分子回调。
9. 分别载入萘（18 原子）、螺[5.5]十一烷（31 原子）、C33H68（101 原子，含 H），检查模型、选择、修改、撤销和视口适配。
10. 缩窄窗口，确认控件、canvas 尺寸和显示无异常；检查页面 console error。

## 验证状态（2026-09-21）

| 检查 | 结果 |
| --- | --- |
| 根 `npm run verify` | 通过：1151 项工作区 JS 测试 + 8 项独立消费者测试；Lean/Python、边界、类型、构建、API 报告、打包门禁全部通过 |
| 新增实例 API 单测 | 7 项通过，覆盖双实例/默认实例隔离、UI 命令通知、拒绝编辑、选择清理、历史守卫、相机/截图路由和释放 |
| 真实 tarball 消费者 | 8 项通过，包含双实例 R/S、键长、撤销重做、MOL 往返及三个新增样例 |
| 消费者严格 TypeScript / Vite 生产构建 | 通过；仍有较大 chunk 提示 |
| 浏览器初始化 | Edge 页面 DOM 确认两个实例就绪，均为 C2H3BrFI、8 原子/7 键、手性未指定、空历史；渲染器注册成功 |
| 实际三维画面、鼠标交互、左右隔离、10 次挂卸载、窄屏 | 尚未完成：截图请求后浏览器连接连续超时，不能用 DOM 状态替代 WebGL 和交互证据 |

全仓仍有 15 项既有 lint warning、无 lint error。跨浏览器兼容性、帧率和 GPU 内存泄漏未验收。

样例检查不代表一般化学正确性、复杂环编辑或任意大分子的性能保证。
