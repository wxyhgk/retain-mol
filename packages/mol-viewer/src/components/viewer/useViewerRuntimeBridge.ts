import { useEffect } from 'react'
import { createViewportController } from '../../viewport'
import type { MolRenderer } from '../../lib/molRenderer'
import { useViewerRuntime } from '../../runtime/ViewerRuntime'

/** Registers the narrow app-facing capture and viewport command surfaces. */
export function useViewerRuntimeBridge(
  renderer: MolRenderer | null,
  gridVisible: boolean | undefined,
) {
  const runtime = useViewerRuntime()

  useEffect(() => {
    if (!renderer) return
    return runtime.capture.register(scale => renderer.captureImage(scale))
  }, [renderer, runtime])

  useEffect(() => {
    if (!renderer) return
    return runtime.viewport.register(
      createViewportController(renderer, runtime.moleculeStore.getState),
    )
  }, [renderer, runtime])

  useEffect(() => {
    if (!renderer || gridVisible === undefined) return
    renderer.setGridVisible(gridVisible)
  }, [renderer, gridVisible])
}
