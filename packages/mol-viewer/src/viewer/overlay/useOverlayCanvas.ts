import { useEffect, useRef } from 'react'

/**
 * Shared canvas helper for viewer overlays.
 * Merges duplicated dpr + ResizeObserver logic from MeasureOverlay, AtomLabelOverlay, BoxSelectOverlay.
 * Keeps 3 separate canvases; only the sizing/prepare logic is deduplicated.
 */

export function prepareOverlayCanvas(
  canvas: HTMLCanvasElement,
): { ctx: CanvasRenderingContext2D; w: number; h: number } | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const w = canvas.offsetWidth
  const h = canvas.offsetHeight
  const dpr = window.devicePixelRatio || 1
  const bw = Math.max(1, Math.round(w * dpr))
  const bh = Math.max(1, Math.round(h * dpr))
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw
    canvas.height = bh
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  return { ctx, w, h }
}

export function syncOverlayCanvasSize(canvas: HTMLCanvasElement): void {
  const parent = canvas.parentElement
  if (!parent) return
  const rect = parent.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  const bw = Math.max(1, Math.round(rect.width * dpr))
  const bh = Math.max(1, Math.round(rect.height * dpr))
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw
    canvas.height = bh
  }
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`
}

/**
 * Hook that provides a canvas ref with automatic ResizeObserver sync.
 * For overlays that draw only on prop change (e.g. BoxSelectOverlay), this keeps
 * the bitmap size in sync with the parent container without per-frame prepare.
 * Overlays that draw every tick (Measure/AtomLabel) can also use it, but they
 * already call prepareOverlayCanvas each frame which re-syncs size.
 */
export function useOverlayCanvas(): React.RefObject<HTMLCanvasElement> {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    const sync = () => syncOverlayCanvasSize(canvas)
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [])

  return canvasRef as React.RefObject<HTMLCanvasElement>
}
