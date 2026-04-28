# Gizmo 旋转导致浏览器卡死

## 现象

选中原子/键后显示旋转 Gizmo，拖动旋转一段时间后浏览器明显卡顿，最终卡死无响应。
自由模式（3 个环）比绕键模式（1 个环）更容易触发。

## 涉及文件

`src/components/viewer/RotateGizmo.tsx` — `updateLoop` 函数（RAF 每帧执行）

## 根本原因

`updateLoop` 每帧都在重建 Three.js 几何体：

```js
// 每帧执行，3 个环 × 60fps = 每秒 360 次
r.frontLine.geometry.dispose()
r.frontLine.geometry = new LineGeometry().setPositions(frontPts)  // ← 新建 GPU Buffer
r.backLine.geometry.dispose()
r.backLine.geometry = new LineGeometry().setPositions(backPts)    // ← 新建 GPU Buffer
r.backLine.computeLineDistances()                                  // ← 新建 Float32Array
```

`LineGeometry.setPositions()` 内部创建 `InstancedInterleavedBuffer`，每次调用都分配新的 GPU 显存。
同时每帧还有 `new Array()`、`Array.push()` 等 JS 堆对象产生，触发高频 GC。

**后果：**
- 每秒 360 次 GPU buffer alloc/dealloc（自由模式 3 环）
- GPU 命令缓冲区溢出，特别是集成显卡 / 低端设备
- JS GC 频繁 STW（Stop The World）暂停
- 最终导致浏览器主线程阻塞卡死
