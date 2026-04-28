# 专家解答

结论先说：**值得改，而且建议按这 5 件事一起改**。你的问题本质是同一个：现在把“每帧渲染系统”“React 状态系统”“Three.js 命令式对象系统”混在一起了。

我会建议目标结构变成：

```txt
React 组件：负责挂载 / 卸载 / 订阅 store / UI 参数
Three Controller：负责 scene、geometry、material、对象更新
Ticker：负责唯一 RAF、执行顺序、按需 invalidation
Zustand：负责最终业务状态，不负责 60fps 动画中间态
```

---

## 1. RAF 合并策略：值得，但不要只做“机械合并”

**4 个独立 RAF 合成一个单例 Ticker 是值得的**，尤其你现在有：

```txt
Three.js render RAF
RotateGizmo RAF
MeasureOverlay RAF
AtomLabelOverlay RAF
```

浏览器的 `requestAnimationFrame` 本来就是“下一次重绘前调用”，而且每次调用是 one-shot，需要自己继续 request 下一帧；同一帧里的多个 rAF callback 会拿到同一个 timestamp。也就是说，多 RAF 不一定让画面更快，反而会让执行顺序、dirty 判断、停止条件更难管。([mdn2.netlify.app][1])

你应该做成**带阶段的 Ticker**，而不是简单 `callbacks.forEach()`。

例如：

```ts
type FrameContext = {
  time: number
  dt: number
}

type TickFn = (ctx: FrameContext) => void

const Phase = {
  Input: 0,
  Controls: 10,
  Gizmo: 20,
  Overlay: 30,
  Render: 100,
} as const

class Ticker {
  private items: { id: string; phase: number; fn: TickFn }[] = []
  private rafId: number | null = null
  private lastTime = 0
  private continuousReasons = new Set<string>()
  private needsFrame = false

  subscribe(id: string, phase: number, fn: TickFn) {
    this.items.push({ id, phase, fn })
    this.items.sort((a, b) => a.phase - b.phase)

    return () => {
      this.items = this.items.filter(item => item.id !== id)
    }
  }

  invalidate() {
    this.needsFrame = true
    this.ensureRunning()
  }

  startContinuous(reason: string) {
    this.continuousReasons.add(reason)
    this.ensureRunning()
  }

  stopContinuous(reason: string) {
    this.continuousReasons.delete(reason)
  }

  private ensureRunning() {
    if (this.rafId == null) {
      this.rafId = requestAnimationFrame(this.tick)
    }
  }

  private tick = (time: number) => {
    this.rafId = null

    const dt = this.lastTime ? (time - this.lastTime) / 1000 : 0
    this.lastTime = time

    this.needsFrame = false

    const ctx = { time, dt }

    for (const item of this.items) {
      item.fn(ctx)
    }

    if (this.continuousReasons.size > 0 || this.needsFrame) {
      this.ensureRunning()
    }
  }
}
```

然后注册顺序：

```ts
ticker.subscribe('controls', Phase.Controls, updateControls)
ticker.subscribe('rotate-gizmo', Phase.Gizmo, updateRotateGizmo)
ticker.subscribe('measure-overlay', Phase.Overlay, updateMeasureOverlay)
ticker.subscribe('atom-label-overlay', Phase.Overlay, updateAtomLabelOverlay)
ticker.subscribe('three-render', Phase.Render, () => {
  renderer.render(scene, camera)
})
```

**渲染必须最后**，最好用两层保护：

第一，给 render 固定最高 phase。

第二，不开放随便注册 `Phase.Render` 之后的任务。比如只提供：

```ts
ticker.beforeRender(...)
ticker.render(...)
```

而不是让所有模块随便传 priority。

如果以后迁到 r3f，它的 `useFrame` 也支持按 priority 排序，并且官方说明 callback 会在渲染前执行，priority 越高越后执行；这说明“共享帧循环 + 显式排序”是合理方向。([r3f.docs.pmnd.rs][2])

---

## 2. RotateGizmo 每帧重建 LineGeometry：应该改成 dirty flag

这个现在明显有浪费。

你这个 gizmo 的前 / 后半圆顶点依赖的大概是：

```txt
camera view direction
selected atoms / selected object
gizmo center
gizmo radius / scale
viewport / DPR
hover / active axis
```

所以它不应该每帧无脑：

```ts
computeArcPoints()
geo.setPositions(...)
```

Three.js 的 `LineGeometry.setPositions()` 本来就是设置线段位置数据的接口，`LineSegmentsGeometry.setPositions()` 还要求数组长度符合线段的 `(xyz xyz)` 格式。也就是说，这不是一个“免费操作”，应该只在位置数据真的变了时调用。([Three.js][3]) ([Three.js][4])

建议做成这样：

```ts
enum GizmoDirty {
  None = 0,
  Camera = 1 << 0,
  Selection = 1 << 1,
  Transform = 1 << 2,
  Viewport = 1 << 3,
  Interaction = 1 << 4,
}

class RotateGizmoController {
  private dirty = GizmoDirty.Selection | GizmoDirty.Camera | GizmoDirty.Viewport
  private visible = false

  markDirty(reason: GizmoDirty) {
    this.dirty |= reason
  }

  update() {
    if (!this.visible) return
    if (this.dirty === GizmoDirty.None) return

    if (
      this.dirty &
      (GizmoDirty.Camera |
        GizmoDirty.Selection |
        GizmoDirty.Transform |
        GizmoDirty.Viewport)
    ) {
      this.rebuildArcGeometry()
    }

    if (this.dirty & GizmoDirty.Interaction) {
      this.updateHighlightOnly()
    }

    this.dirty = GizmoDirty.None
  }

  private rebuildArcGeometry() {
    const frontPositions = this.computeFrontArcPositions()
    const backPositions = this.computeBackArcPositions()

    this.frontGeometry.setPositions(frontPositions)
    this.backGeometry.setPositions(backPositions)
  }

  dispose() {
    this.frontGeometry.dispose()
    this.backGeometry.dispose()
    this.frontMaterial.dispose()
    this.backMaterial.dispose()
  }
}
```

dirty 来源不要靠猜，每个事件明确标记：

```ts
controls.addEventListener('change', () => {
  gizmo.markDirty(GizmoDirty.Camera)
  ticker.invalidate()
})

useMoleculeStore.subscribe(
  state => state.selectionVersion,
  () => {
    gizmo.markDirty(GizmoDirty.Selection)
    ticker.invalidate()
  }
)

useMoleculeStore.subscribe(
  state => state.atomPositionVersion,
  () => {
    gizmo.markDirty(GizmoDirty.Transform)
    ticker.invalidate()
  }
)

resizeObserver.observe(container)

resizeObserverCallback = () => {
  gizmo.markDirty(GizmoDirty.Viewport)
  ticker.invalidate()
}
```

更进一步：不要深比较 atoms。给 store 里加版本号：

```ts
type MoleculeState = {
  atoms: Atom[]
  atomPositionVersion: number
  selectionVersion: number

  setAtomPositions: (positions: Float32Array) => void
  setSelection: (ids: string[]) => void
}
```

每次真正改位置：

```ts
set(state => ({
  atoms: nextAtoms,
  atomPositionVersion: state.atomPositionVersion + 1,
}))
```

这样 gizmo 不需要关心 atoms 里面具体谁变了，只看 version。

---

## 3. React 组件 vs Three.js 场景边界：保留“React 壳 + Three 内核”，但要拆干净

你现在的模式不是错的。

React 官方对 `useEffect` 的定位就是“把 React 组件和 React 外部系统同步”，例如浏览器事件、第三方动画库、非 React 控制的对象。Three.js scene 本质上就是 React 外部系统，所以用 `useEffect` 挂载 / 卸载 Three 对象是合理的。([react.dev][5])

问题是：**React 组件里不应该塞太多 Three.js 业务逻辑。**

比较干净的组织方式是：

```txt
src/
  render/
    Ticker.ts

  three/
    controllers/
      RotateGizmoController.ts
      MeasureOverlayController.ts
      AtomLabelOverlayController.ts
      MoleculeSceneController.ts

  components/
    viewport/
      MoleculeViewport.tsx
      RotateGizmoMount.tsx
      MeasureOverlayCanvas.tsx
      AtomLabelOverlayCanvas.tsx

  stores/
    moleculeStore.ts
    viewportStore.ts
```

React 组件只做这个：

```tsx
function RotateGizmoMount({
  scene,
  camera,
  renderer,
  ticker,
}: {
  scene: THREE.Scene
  camera: THREE.Camera
  renderer: THREE.WebGLRenderer
  ticker: Ticker
}) {
  useEffect(() => {
    const gizmo = new RotateGizmoController({
      scene,
      camera,
      domElement: renderer.domElement,
    })

    const unsubscribeTick = ticker.subscribe(
      'rotate-gizmo',
      Phase.Gizmo,
      () => gizmo.update()
    )

    const unsubscribeSelection = useMoleculeStore.subscribe(
      state => state.selectionVersion,
      () => {
        gizmo.markDirty(GizmoDirty.Selection)
        ticker.invalidate()
      }
    )

    const unsubscribePositions = useMoleculeStore.subscribe(
      state => state.atomPositionVersion,
      () => {
        gizmo.markDirty(GizmoDirty.Transform)
        ticker.invalidate()
      }
    )

    return () => {
      unsubscribeTick()
      unsubscribeSelection()
      unsubscribePositions()
      gizmo.dispose()
    }
  }, [scene, camera, renderer, ticker])

  return null
}
```

真正复杂逻辑放这里：

```ts
class RotateGizmoController {
  constructor(args: {
    scene: THREE.Scene
    camera: THREE.Camera
    domElement: HTMLElement
  }) {}

  update() {}
  markDirty(reason: GizmoDirty) {}
  dispose() {}
}
```

这样以后你换 React、换 r3f、换 store，Three 内核都不需要大改。

至于 r3f：如果你们项目已经大面积使用 React 来描述 3D scene，可以考虑。但如果现在是原生 Three.js 工程，不建议为了一个 gizmo 全量迁移。r3f 的优势是统一 React 组件生命周期和 Three 对象生命周期，它的 `useFrame`、`invalidate`、`frameloop="demand"` 很适合这种问题；但官方也提醒不要在 `useFrame` 里做 React `setState`，快速变化的状态也不应该响应式绑定到 React render 上。([r3f.docs.pmnd.rs][2]) ([r3f.docs.pmnd.rs][6])

所以我的建议是：

```txt
短期：自定义 Ticker + Controller
中期：封装 useThreeController 这类 hook
长期：如果 3D UI 越来越多，再评估 r3f
```

---

## 4. overlay canvas：不要永远 RAF，应该“按需 + 交互时连续”

`MeasureOverlay` 和 `AtomLabelOverlay` 不应该在没有数据时每帧重绘整张 canvas。

更适合你的场景的是混合模式：

```txt
平时：按需 redraw
拖动 / 相机移动 / damping 中：连续 redraw
没有测量数据 / label 不显示：不 redraw，只在状态变化时 clear 一次
```

触发 overlay dirty 的来源：

```txt
camera changed
atom positions changed
selection changed
measure data changed
label visibility changed
canvas size / DPR changed
hover target changed
```

结构类似：

```ts
class CanvasOverlayController {
  private dirty = true
  private hasContent = false
  private wasEmpty = true

  markDirty() {
    this.dirty = true
  }

  update() {
    if (!this.dirty) return

    const hasContent = this.computeHasContent()

    if (!hasContent) {
      if (!this.wasEmpty) {
        this.clear()
      }

      this.wasEmpty = true
      this.dirty = false
      return
    }

    this.wasEmpty = false
    this.clear()
    this.draw()
    this.dirty = false
  }
}
```

相机变化时：

```ts
controls.addEventListener('change', () => {
  measureOverlay.markDirty()
  atomLabelOverlay.markDirty()
  ticker.invalidate()
})
```

数据变化时：

```ts
useMoleculeStore.subscribe(
  state => state.measurementVersion,
  () => {
    measureOverlay.markDirty()
    ticker.invalidate()
  }
)
```

如果用户正在拖动分子、旋转视角、播放动画：

```ts
ticker.startContinuous('dragging')
```

松手后：

```ts
ticker.stopContinuous('dragging')
ticker.invalidate()
```

这和 r3f 的 `invalidate()` 思想类似：不是马上渲染，而是标记“需要一帧”；多次 invalidate 不应该变成多帧队列。([r3f.docs.pmnd.rs][7])

所以这里不要二选一：

```txt
不是“永远 RAF” vs “只监听 store”
而是“idle 按需，interaction 连续”
```

这最适合“频繁编辑 + 偶尔查看测量”的分子编辑器。

---

## 5. 动画与状态边界：拖动中不要每帧 setAtomPositions

这个是最大性能风险点。

现在你是：

```txt
pointer move / RAF
  -> store.setAtomPositions()
    -> Zustand 通知订阅者
      -> React 组件 re-render
        -> Three / overlay / UI 可能都跟着动
```

这会把 60fps 动画帧和 React render 混在一起。

Zustand 官方专门有 transient updates 的模式：用 `subscribe` 把高频变化写到 ref，不强迫组件 re-render；这正适合“允许直接 mutate view”的场景。([GitHub][8])

更推荐的拖动模式是：

```txt
pointer down:
  从 store 读取原始 atom positions
  复制一份 local draft positions
  开始 drag transaction

pointer move / RAF:
  根据鼠标计算 rotation
  修改 Three.js 本地对象 / BufferGeometry / Object3D
  更新 gizmo / overlay
  ticker.invalidate()
  不写 Zustand

pointer up:
  把最终 positions commit 到 Zustand 一次
  写入 undo history
  结束 transaction

pointer cancel / escape:
  恢复原始 positions
  不 commit
```

伪代码：

```ts
class RotateDragController {
  private dragging = false
  private basePositions: Float32Array | null = null
  private draftPositions: Float32Array | null = null

  beginDrag() {
    const state = useMoleculeStore.getState()

    this.basePositions = state.getSelectedAtomPositions()
    this.draftPositions = new Float32Array(this.basePositions)

    this.dragging = true
    ticker.startContinuous('rotate-drag')
  }

  updateDrag(rotation: THREE.Quaternion) {
    if (!this.dragging || !this.basePositions || !this.draftPositions) return

    applyRotation({
      from: this.basePositions,
      to: this.draftPositions,
      rotation,
    })

    moleculeSceneController.setAtomPositionsLocal(this.draftPositions)

    rotateGizmo.markDirty(GizmoDirty.Transform)
    measureOverlay.markDirty()
    atomLabelOverlay.markDirty()

    ticker.invalidate()
  }

  commitDrag() {
    if (!this.dragging || !this.draftPositions) return

    useMoleculeStore.getState().setAtomPositions(this.draftPositions, {
      source: 'rotate-gizmo',
      history: true,
    })

    this.cleanup()
  }

  cancelDrag() {
    if (this.basePositions) {
      moleculeSceneController.setAtomPositionsLocal(this.basePositions)
    }

    this.cleanup()
  }

  private cleanup() {
    this.dragging = false
    this.basePositions = null
    this.draftPositions = null
    ticker.stopContinuous('rotate-drag')
    ticker.invalidate()
  }
}
```

这套模式在编辑器里很常见，可以叫：

```txt
local draft state
transaction state
commit-on-end
optimistic scene mutation
```

Store 只保存“业务真相”：

```txt
最终原子坐标
选择状态
测量数据
undo / redo history
文件是否 dirty
```

Three.js controller 保存“交互中间态”：

```txt
拖动中的临时坐标
hover 轴
当前 pointer delta
临时 gizmo transform
本帧是否需要 redraw
```

React 组件保存“UI 状态”：

```txt
按钮开关
面板展开
当前工具
是否显示 label / measure
```

---

## 我建议的改造顺序

第一步，先加 `Ticker`，把 4 个 RAF 合并进去，但先不改内部逻辑。确保顺序是：

```txt
controls / input
gizmo update
overlay update
renderer.render
```

第二步，把 `MeasureOverlay` 和 `AtomLabelOverlay` 改成 dirty redraw。没有内容时，不进入持续绘制。

第三步，把 `RotateGizmo` 拆成：

```txt
RotateGizmoMount.tsx
RotateGizmoController.ts
```

然后加 dirty flag，只在 camera / selection / transform / viewport 变化时 `setPositions()`。

第四步，把 gizmo 拖动从：

```ts
每帧 store.setAtomPositions()
```

改成：

```ts
拖动中改 Three.js local positions
松手后 store.setAtomPositions()
```

第五步，再考虑是否迁 r3f。现在最优解不是马上 r3f，而是先把“帧循环、dirty、controller、store commit”这几个边界理清楚。

一句话总结：

```txt
React 管生命周期和 UI。
Zustand 管最终业务状态。
Three.js controller 管实时图形对象。
Ticker 管每帧顺序和按需执行。
拖动中不要写 store，松手再提交。
```

[1]: https://mdn2.netlify.app/en-us/docs/web/api/window/requestanimationframe/ "Window.requestAnimationFrame() - Web APIs | MDN"
[2]: https://r3f.docs.pmnd.rs/api/hooks "Hooks - React Three Fiber"
[3]: https://threejs.org/docs/pages/LineGeometry.html "LineGeometry - Three.js Docs"
[4]: https://threejs.org/docs/pages/LineSegmentsGeometry.html "LineSegmentsGeometry - Three.js Docs"
[5]: https://react.dev/reference/react/useEffect "useEffect – React"
[6]: https://r3f.docs.pmnd.rs/advanced/pitfalls "Performance pitfalls - React Three Fiber"
[7]: https://r3f.docs.pmnd.rs/advanced/scaling-performance "Scaling performance - React Three Fiber"
[8]: https://github.com/pmndrs/zustand "GitHub - pmndrs/zustand:  Bear necessities for state management in React · GitHub"

