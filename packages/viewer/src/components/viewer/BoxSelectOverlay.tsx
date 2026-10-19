/**
 * BoxSelectOverlay — 框选矩形的纯渲染组件
 * 不持有任何事件逻辑；由 useCanvasPointerRouter 驱动。
 */

import { useEffect } from 'react'
import type { BoxRect } from '../../hooks/useCanvasPointerRouter'
import { BOX_SELECT } from '../../config/overlay.config'
import { prepareOverlayCanvas, useOverlayCanvas } from '../../viewer/overlay/useOverlayCanvas'

interface Props {
  rect: BoxRect | null
}

export default function BoxSelectOverlay({ rect }: Props) {
  const canvasRef = useOverlayCanvas()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const prepared = prepareOverlayCanvas(canvas)
    if (!prepared) return
    const { ctx } = prepared
    if (!rect || rect.w < 1 || rect.h < 1) return
    ctx.fillStyle   = BOX_SELECT.fillColor
    ctx.strokeStyle = BOX_SELECT.strokeColor
    ctx.lineWidth   = BOX_SELECT.lineWidth
    ctx.setLineDash(BOX_SELECT.lineDash)
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h)
  }, [rect, canvasRef])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}
