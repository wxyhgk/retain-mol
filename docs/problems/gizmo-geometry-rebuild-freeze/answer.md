# 解决方案

## 核心原则

**不要在 RAF 循环里创建 / 销毁 GPU 资源。**
几何体在组件挂载时分配一次，每帧只做数据写入。

## 方案：预分配缓冲 + 原地更新

### 替换 Line2 → THREE.Line

| 旧方案 | 新方案 |
|--------|--------|
| `Line2` + `LineGeometry` + `LineMaterial` | `THREE.Line` + `THREE.BufferGeometry` + `THREE.LineBasicMaterial` |
| 每帧 `new LineGeometry().setPositions()` | 构造时预分配 `Float32Array`，只分配一次 |
| 每帧 `geometry.dispose()` + 重建 | 每帧原地写 buffer + `needsUpdate = true` |
| 需要每帧更新 `resolution` | 无需额外更新 |

### 关键代码（挂载时，只执行一次）

```ts
const MAX_PTS = GIZMO_RING.segments + 2  // 预分配最大容量

const frontPositions = new Float32Array(MAX_PTS * 3)  // 整个生命周期复用
const backPositions  = new Float32Array(MAX_PTS * 3)
const frontPosAttr = new THREE.BufferAttribute(frontPositions, 3)
const backPosAttr  = new THREE.BufferAttribute(backPositions, 3)

const frontGeo = new THREE.BufferGeometry()
frontGeo.setAttribute('position', frontPosAttr)
const backGeo = new THREE.BufferGeometry()
backGeo.setAttribute('position', backPosAttr)

const frontLine = new THREE.Line(frontGeo, new THREE.LineBasicMaterial({ ... }))
const backLine  = new THREE.Line(backGeo,  new THREE.LineDashedMaterial({ ... }))
```

### 关键代码（每帧，原地写入）

```ts
// 原地填充，不产生任何新对象
let frontCount = 0, backCount = 0
for (let i = 0; i <= seg; i++) {
  const θ = (i / seg) * Math.PI * 2
  const x = Math.cos(θ) * radius
  const y = Math.sin(θ) * radius
  if (Math.cos(θ - psi) < 0) {
    frontPositions[frontCount * 3]     = x
    frontPositions[frontCount * 3 + 1] = y
    frontPositions[frontCount * 3 + 2] = 0
    frontCount++
  } else {
    backPositions[backCount * 3]     = x
    backPositions[backCount * 3 + 1] = y
    backPositions[backCount * 3 + 2] = 0
    backCount++
  }
}

// 控制渲染点数，无 GPU alloc
frontGeo.setDrawRange(0, frontCount)
frontPosAttr.needsUpdate = true
backGeo.setDrawRange(0, backCount)
backPosAttr.needsUpdate = true
backLine.computeLineDistances()  // 虚线仍需调用，但开销极小
```

## 代价

- `THREE.Line` 的 `linewidth` 在 WebGL1（多数浏览器）下固定为 1px，无法变粗
- 对 Gizmo 辅助线而言视觉可接受；如需粗线可后续探索 WebGL2 或自定义 shader

## 通用原则（Three.js 性能）

> **RAF 里只做数据读写，不做资源分配。**
> 以下操作绝对不能出现在每帧更新中：
> - `new BufferGeometry()` / `new LineGeometry()`
> - `geometry.dispose()` + 重建
> - `new Float32Array()` / `new Array()`（大量、频繁）
> - `new THREE.Material()`
>
> 正确模式：挂载时分配，每帧只写 `attribute.array[i] = value` + `attribute.needsUpdate = true`
