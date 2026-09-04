import { useEffect, useId } from 'react'
import { Phase } from '../../lib/animation'
import { useViewerRuntimeServices } from '../../runtime/ViewerRuntime'
import type { ThreeRendererPort } from '../../lib/molRenderer'

export interface GizmoScheduler {
  invalidate(): void
  startContinuous(reason: string): void
  stopContinuous(reason: string): void
}

/**
 * Shared gizmo lifecycle helper.
 * Wraps ticker Phase.Gizmo subscription + startContinuous/stopContinuous + controls.enabled gating.
 * RotateGizmo and BondPairAlignmentGizmo share this scheduler; BondLength uses overlay phase separately.
 */
export function useGizmoRegistry(
  renderer: ThreeRendererPort | null,
  enabled: boolean,
  create: (scheduler: GizmoScheduler) => { isValid: boolean; update(): void; dispose(): void } | null,
  reasonPrefix = 'gizmo',
): void {
  const { ticker } = useViewerRuntimeServices()
  const subscriptionId = useId()

  useEffect(() => {
    if (!renderer || !enabled) return
    const scheduler: GizmoScheduler = {
      invalidate: () => ticker.invalidate(),
      startContinuous: (reason) => ticker.startContinuous(reason),
      stopContinuous: (reason) => ticker.stopContinuous(reason),
    }
    const ctrl = create(scheduler)
    if (!ctrl || !ctrl.isValid) return
    const key = `${reasonPrefix}:${subscriptionId}`
    const unsub = ticker.subscribe(key, Phase.Gizmo, () => ctrl.update())
    ticker.invalidate()
    // Ensure controls.enabled restored on cleanup even if controller forgot
    const originalEnabled = renderer.controls.enabled
    return () => {
      unsub()
      ctrl.dispose()
      renderer.controls.enabled = originalEnabled
      // Defensive: clear any dangling continuous reasons tied to this gizmo
      ticker.stopContinuous(`${reasonPrefix}-drag`)
      ticker.stopContinuous(`${reasonPrefix}-drag:${subscriptionId}`)
    }
  }, [renderer, enabled, create, ticker, subscriptionId, reasonPrefix])
}

/**
 * Lightweight scheduler factory used by gizmo controllers/tests that need a default ticker.
 */
import { ticker as defaultTicker } from '../../lib/animation'

export const defaultGizmoScheduler: GizmoScheduler = {
  invalidate: () => defaultTicker.invalidate(),
  startContinuous: (reason) => defaultTicker.startContinuous(reason),
  stopContinuous: (reason) => defaultTicker.stopContinuous(reason),
}

/**
 * Hook to obtain a scheduler bound to the current ViewerRuntime ticker.
 * Useful when controller creation is not fully encapsulated in useGizmoRegistry.
 */
export function useGizmoScheduler(reasonPrefix: string): GizmoScheduler {
  const { ticker } = useViewerRuntimeServices()
  const id = useId()
  const reason = `${reasonPrefix}:${id}`
  return {
    invalidate: () => ticker.invalidate(),
    startContinuous: () => ticker.startContinuous(reason),
    stopContinuous: () => ticker.stopContinuous(reason),
  }
}
