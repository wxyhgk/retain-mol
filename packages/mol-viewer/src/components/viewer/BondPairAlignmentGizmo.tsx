import { useCallback, useRef } from 'react'
import type {
  BondPairGizmoConfig,
  BondPairGizmoError,
  BondPairGizmoPhase,
  BondPairGizmoValue,
} from '../../lib/bondPairGizmo'
import { inspectBondPairGeometry } from '../../lib/builder/geometry/bondPairAlignment'
import type { ThreeRendererPort } from '../../lib/molRenderer'
import { BondPairAlignmentGizmoController } from '../../viewer/gizmo/controllers/BondPairAlignmentGizmoController'
import { createBondPairAlignmentEditSession } from '../../runtime/editingSessions'
import { useViewerRuntimeServices } from '../../runtime/ViewerRuntime'
import { useGizmoRegistry, type GizmoScheduler } from '../../viewer/gizmo/useGizmoRegistry'

interface Props {
  readonly renderer: ThreeRendererPort | null
  readonly config: BondPairGizmoConfig | undefined
  readonly enabled: boolean
  readonly readOnly: boolean
  readonly onChange: ((value: BondPairGizmoValue, phase: BondPairGizmoPhase) => void) | undefined
  readonly onError: ((error: BondPairGizmoError) => void) | undefined
}

export default function BondPairAlignmentGizmo({
  renderer,
  config,
  enabled,
  readOnly,
  onChange,
  onError,
}: Props) {
  const { moleculeStore } = useViewerRuntimeServices()
  const onChangeRef = useRef(onChange)
  const onErrorRef = useRef(onError)
  onChangeRef.current = onChange
  onErrorRef.current = onError

  const isEnabled = enabled && !readOnly && Boolean(config?.enabled)

  const create = useCallback((scheduler: GizmoScheduler) => {
    if (!renderer || !config?.enabled) return null
    const session = createBondPairAlignmentEditSession(moleculeStore)
    let sessionStartAzimuth = 0
    let latestValue: BondPairGizmoValue | null = null

    const inspect = () => {
      const state = moleculeStore.getState()
      return inspectBondPairGeometry(state.objectsById, state.objectOrder, config)
    }
    const controller = new BondPairAlignmentGizmoController(
      renderer,
      config.mode ?? 'both',
      config.showCoplanarHandles ?? true,
      {
        getSnapshot: inspect,
        start: value => {
          sessionStartAzimuth = value.azimuthDegrees
          latestValue = value
          session.start()
          onChangeRef.current?.(value, 'start')
        },
        preview: value => {
          const result = session.update({
            referenceBondId: config.referenceBondId,
            movingBondId: config.movingBondId,
            referenceAnchorAtomId: config.referenceAnchorAtomId,
            movingAnchorAtomId: config.movingAnchorAtomId,
            anchorDistance: value.distance,
            axisAngleDegrees: value.axisAngleDegrees,
            azimuthDegrees: value.azimuthDegrees - sessionStartAzimuth,
            coplanar: value.coplanar !== false,
            ...(value.coplanar !== false ? { coplanarDirection: value.coplanar } : {}),
            moveWholeFragment: true,
          })
          if (result.ok === false) {
            onErrorRef.current?.({ code: result.code, reason: result.reason })
            return false
          }
          latestValue = {
            ...value,
            distance: result.diagnostics.anchorDistance,
            axisAngleDegrees: result.diagnostics.axisAngleDegrees,
          }
          onChangeRef.current?.(latestValue, 'preview')
          return true
        },
        commit: value => {
          session.end()
          latestValue = value
          onChangeRef.current?.(value, 'commit')
        },
        cancel: value => {
          session.cancel()
          latestValue = value
          onChangeRef.current?.(value, 'cancel')
        },
        error: error => onErrorRef.current?.(error),
      },
      scheduler,
    )
    if (!controller.isValid) return controller
    // Wrap dispose to also cancel session if still active
    const originalDispose = controller.dispose.bind(controller)
    controller.dispose = () => {
      originalDispose()
      if (session.isActive) {
        session.cancel()
        if (latestValue) onChangeRef.current?.(latestValue, 'cancel')
      }
    }
    return controller
  }, [renderer, config, moleculeStore])

  useGizmoRegistry(renderer, isEnabled, create as (s: GizmoScheduler)=> {isValid:boolean; update():void; dispose():void}, 'bond-pair-gizmo')

  return null
}
