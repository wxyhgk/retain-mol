/**
 * BoxSelectOverlay — 框选矩形的纯渲染组件
 * 不持有任何事件逻辑；由 useCanvasPointerRouter 驱动。
 */

import { useEffect, useRef } from 'react'
import type { BoxRect } from '../../hooks/useCanvasPointerRouter'
import { BOX_SELECT } from '../../config/overlay.config'

interface Props {
  rect: BoxRect | null
}

export default function BoxSelectOverlay({ rect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1

    const sync = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const r = parent.getBoundingClientRect()
      canvas.width  = Math.max(1, Math.round(r.width  * dpr))
      canvas.height = Math.max(1, Math.round(r.height * dpr))
      canvas.style.width  = `${r.width}px`
      canvas.style.height = `${r.height}px`
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(canvas.parentElement!)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (!rect || rect.w < 1 || rect.h < 1) return
    ctx.save()
    ctx.scale(dpr, dpr)
    ctx.fillStyle   = BOX_SELECT.fillColor
    ctx.strokeStyle = BOX_SELECT.strokeColor
    ctx.lineWidth   = BOX_SELECT.lineWidth
    ctx.setLineDash(BOX_SELECT.lineDash)
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h)
    ctx.restore()
  }, [rect])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}
