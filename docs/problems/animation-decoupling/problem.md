# 动画耦合问题

## 背景

RetainMol 是基于 Vite + React + TypeScript + Three.js + Zustand 的 3D 分子建模工具。
当前动画逻辑分散在多个模块中，存在耦合和性能问题。

## 当前状况

项目中存在 **4 个独立的 `requestAnimationFrame` 循环**，各自为政：

| 位置 | 作用 |
|------|------|
| `src/lib/molRenderer/MolRenderer.ts` | Three.js 主渲染循环（controls + render） |
| `src/components/viewer/RotateGizmo.tsx` | 旋转 gizmo 更新（pivot、轴、几何体、箭头、颜色） |
| `src/components/viewer/MeasureOverlay.tsx` | 2D canvas 测量标注重绘 |
| `src/components/viewer/AtomLabelOverlay.tsx` | 2D canvas 原子序号标注重绘 |

## 具体问题

### 1. RAF 合并策略
4 个独立 RAF 同时跑。考虑用单例 Ticker 合并成一个 RAF loop。
- 合并是否值得？
- 合并后执行顺序（Three.js render 必须最后）怎么保证？

### 2. RotateGizmo 每帧重建 LineGeometry
旋转 gizmo 每帧都重新计算前/后半圆顶点并调用 `geo.setPositions()`，相机和选中状态没变时也在算。
- 有没有 dirty flag 或 observer 模式只在需要时重建？

### 3. React 组件 vs Three.js 场景的边界
`RotateGizmo` 是 React 组件但核心工作是操作 Three.js scene（`useEffect` + RAF）。
- 这种"React 壳 + Three.js 内核"模式在大项目里怎么组织最干净？
- 有无比 `useEffect` + RAF 更好的替代方案？

### 4. Overlay canvas 的驱动方式
`MeasureOverlay` 和 `AtomLabelOverlay` 每帧重绘整张 canvas，即使没有测量数据也跑。
- 应该用 RAF 持续驱动，还是监听 store 变化后按需重绘？
- 在"频繁编辑 + 偶尔查看测量"的场景下哪个更合适？

### 5. 动画与 Zustand store 的边界
旋转 gizmo 拖动时每帧调 `store.setAtomPositions()`（Zustand 写操作），会触发所有订阅组件 re-render。
- Three.js 动画帧与 React render 混在一起是否有性能问题？
- 有没有"拖动中只改 Three.js 本地坐标，松手后再提交 store"的模式？

## 期望

得到一套适合 **React + Three.js** 项目的动画架构建议，
能在不引入 react-three-fiber 等大依赖的前提下，做到：
- 动画调度集中管理
- 各动画关注点互相独立
- Three.js 渲染与 React 状态更新边界清晰
