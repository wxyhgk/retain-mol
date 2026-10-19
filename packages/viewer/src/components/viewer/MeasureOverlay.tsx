import { useEffect, useId, useRef } from 'react'
import type { ThreeRendererPort } from '../../lib/molRenderer'
import { Phase } from '../../lib/animation'
import { useViewerRuntimeServices } from '../../runtime/ViewerRuntime'
import { MEASURE_LABEL as L } from '../../config/overlay.config'
import { prepareOverlayCanvas } from '../../viewer/overlay/useOverlayCanvas'

interface Props {
  renderer: ThreeRendererPort | null
}

export default function MeasureOverlay({ renderer }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { moleculeStore, editorStore, ticker } = useViewerRuntimeServices()
  const subscriptionId = useId()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !renderer) return

    // 同 AtomLabelOverlay：去掉 dirty flag，每帧直接读 store 当前状态
    const draw = () => {
      const prepared = prepareOverlayCanvas(canvas)
      if (!prepared) return
      const { ctx, w, h } = prepared

      const labels = renderer.measureLabelPositions
      if (labels.length === 0) return

      renderer.camera.updateMatrixWorld()

      const { fontSize } = editorStore.getState().measureStyle
      ctx.font = `${L.fontWeight} ${fontSize}px ${L.fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (const { pos, text, color } of labels) {
        const p = renderer.projectLocalToScreen(pos, w, h)
        const x = p.x + L.offsetX
        const y = p.y + L.offsetY
        const tw = ctx.measureText(text).width
        const bgX = x - tw / 2 - L.paddingX
        const bgY = y - fontSize / 2 - L.paddingYTop
        const bgW = tw + L.paddingX * 2
        const bgH = fontSize + L.paddingYTop + L.paddingYBottom
        ctx.fillStyle = L.backgroundColor
        ctx.beginPath()
        ctx.roundRect(bgX, bgY, bgW, bgH, L.radius)
        ctx.fill()
        ctx.fillStyle = color
        ctx.fillRect(bgX, bgY, L.accentBarWidth, bgH)
        ctx.fillStyle = L.textColor
        ctx.fillText(text, x, y)
      }
    }

    const invalidate = () => ticker.invalidate()

    const unsubTicker  = ticker.subscribe(`measure-overlay:${subscriptionId}`, Phase.Overlay, draw)
    const unsubMeasure = editorStore.subscribe(s => s.measurements,      invalidate)
    const unsubPending = editorStore.subscribe(s => s.pendingAtomIds,     invalidate)
    const unsubStyle   = editorStore.subscribe(s => s.measureStyle,       invalidate)

    // 相机交互 → 连续模式
    const unsubCamStart = renderer.controls.on('interactionstart', () => {
      ticker.startContinuous('measure-cam')
    })
    const unsubCamEnd = renderer.controls.on('interactionend', () => {
      ticker.stopContinuous('measure-cam')
      ticker.invalidate()
    })
    const unsubWheel = renderer.controls.on('wheel', invalidate)

    // 原子位置变化（拖动 / 旋转 gizmo）→ 连续模式
    let posTimer: ReturnType<typeof setTimeout> | null = null
    const unsubPos = moleculeStore.subscribe(s => s.atomPositionVersion, () => {
      ticker.startContinuous('measure-pos')
      if (posTimer) clearTimeout(posTimer)
      posTimer = setTimeout(() => {
        ticker.stopContinuous('measure-pos')
        ticker.invalidate()
        posTimer = null
      }, 150)
    })

    ticker.invalidate()

    return () => {
      unsubTicker()
      unsubMeasure()
      unsubPending()
      unsubStyle()
      unsubCamStart()
      unsubCamEnd()
      unsubWheel()
      unsubPos()
      if (posTimer) clearTimeout(posTimer)
      ticker.stopContinuous('measure-cam')
      ticker.stopContinuous('measure-pos')
    }
  }, [renderer, moleculeStore, editorStore, ticker, subscriptionId])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}
