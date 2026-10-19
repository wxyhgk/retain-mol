import { useEffect } from 'react'
import type { RendererSceneLifecycleBindingOptions } from './rendererSceneBindingTypes'

export function useRendererSceneLifecycleBinding({
  containerRef,
  rendererRef,
  sketchPlane,
}: RendererSceneLifecycleBindingOptions) {
  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer) return

    renderer.setSketchPlane(sketchPlane)
    if (sketchPlane) renderer.alignViewToPlane(sketchPlane.normal)
  }, [sketchPlane, rendererRef])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(entries => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      rendererRef.current?.resize(width, height)
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [containerRef, rendererRef])
}
