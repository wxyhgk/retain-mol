/**
 * 全局唯一 RAF 调度器。
 *
 * 取代各模块自己维护 requestAnimationFrame 的散乱状态。
 * 用法：
 *   - ticker.subscribe(id, Phase.Gizmo, fn)  → 注册帧回调，返回取消函数
 *   - ticker.invalidate()                     → 请求下一帧（单次）
 *   - ticker.startContinuous(reason)          → 持续运行（如相机拖拽）
 *   - ticker.stopContinuous(reason)           → 停止持续运行
 *
 * 执行顺序由 phase 值决定：Controls(10) → Gizmo(20) → Overlay(30) → Render(100)
 * 确保 Three.js 渲染永远在最后。
 */

export type FrameContext = { time: number; dt: number }
export type TickFn = (ctx: FrameContext) => void

export const Phase = {
  Controls: 10,
  Gizmo: 20,
  Overlay: 30,
  Render: 100,
} as const

type PhaseValue = (typeof Phase)[keyof typeof Phase]

class Ticker {
  private items: { id: string; phase: number; fn: TickFn }[] = []
  private rafId: number | null = null
  private lastTime = 0
  private continuousReasons = new Set<string>()
  private needsFrame = false

  /**
   * 注册帧回调。同 id 重复注册时自动替换旧的。
   * 返回取消函数，在组件 unmount 时调用。
   */
  subscribe(id: string, phase: PhaseValue, fn: TickFn): () => void {
    this.items = this.items.filter(i => i.id !== id)
    this.items.push({ id, phase, fn })
    this.items.sort((a, b) => a.phase - b.phase)
    return () => { this.items = this.items.filter(i => i.id !== id) }
  }

  /** 请求渲染下一帧（单次，适合数据变化后触发一次重绘） */
  invalidate() {
    this.needsFrame = true
    this.ensureRunning()
  }

  /** 开启持续渲染（适合相机拖拽、原子拖拽等需要连续帧的场景） */
  startContinuous(reason: string) {
    this.continuousReasons.add(reason)
    this.ensureRunning()
  }

  /** 停止持续渲染（不影响其他 reason） */
  stopContinuous(reason: string) {
    this.continuousReasons.delete(reason)
  }

  private ensureRunning() {
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(this.tick)
    }
  }

  private tick = (time: number) => {
    this.rafId = null
    const dt = this.lastTime ? (time - this.lastTime) / 1000 : 0
    this.lastTime = time
    this.needsFrame = false

    const ctx: FrameContext = { time, dt }
    for (const { fn } of this.items) fn(ctx)

    if (this.continuousReasons.size > 0 || this.needsFrame) {
      this.ensureRunning()
    }
  }
}

export const ticker = new Ticker()
