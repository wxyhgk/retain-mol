import { useEffect } from 'react'
import { createViewportController } from '../../viewport'
import type { RendererPort } from '../../lib/molRenderer'
import { useViewerRuntimeServices } from '../../runtime/ViewerRuntime'

/** Registers the narrow app-facing capture and viewport command surfaces. */
export function useViewerRuntimeBridge(
  renderer: RendererPort | null,
  gridVisible: boolean | undefined,
) {
  const { capture, viewport, moleculeStore } = useViewerRuntimeServices()

  useEffect(() => {
    if (!renderer) return
    return capture.register(scale => renderer.captureImage(scale))
  }, [renderer, capture])

  useEffect(() => {
    if (!renderer) return
    return viewport.register(
      createViewportController(renderer, moleculeStore.getState),
    )
  }, [renderer, viewport, moleculeStore])

  useEffect(() => {
    if (!renderer || gridVisible === undefined) return
    renderer.setGridVisible(gridVisible)
  }, [renderer, gridVisible])
}
