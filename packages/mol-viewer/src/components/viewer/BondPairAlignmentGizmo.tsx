import { useEffect, useId, useRef } from 'react'
import { Phase } from '../../lib/animation'
import type {
  BondPairGizmoConfig,
  BondPairGizmoError,
  BondPairGizmoPhase,
  BondPairGizmoValue,
} from '../../lib/bondPairGizmo'
import { inspectBondPairGeometry } from '../../lib/builder/geometry/bondPairAlignment'
import type { ThreeRendererPort } from '../../lib/molRenderer'
import { BondPairAlignmentGizmoController } from '../../lib/molRenderer/BondPairAlignmentGizmoController'
import { createBondPairAlignmentEditSession } from '../../hooks/editSessionFactory'
import { useViewerRuntimeServices } from '../../runtime/ViewerRuntime'

interface Props {
  readonly renderer: ThreeRendererPort | null
  readonly config: BondPairGizmoConfig | undefined
  readonly disabled: boolean
  readonly onChange: ((value: BondPairGizmoValue, phase: BondPairGizmoPhase) => void) | undefined
  readonly onError: ((error: BondPairGizmoError) => void) | undefined
}

export default function BondPairAlignmentGizmo({
  renderer,
  config,
  disabled,
  onChange,
  onError,
}: Props) {
  const { moleculeStore, ticker } = useViewerRuntimeServices()
  const subscriptionId = useId()
  const onChangeRef = useRef(onChange)
  const onErrorRef = useRef(onError)
  onChangeRef.current = onChange
  onErrorRef.current = onError

  useEffect(() => {
    if (!renderer || !config?.enabled || disabled) return
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
      {
        invalidate: () => ticker.invalidate(),
        startContinuous: reason => ticker.startContinuous(reason),
        stopContinuous: reason => ticker.stopContinuous(reason),
      },
    )
    if (!controller.isValid) return

    const tickerKey = `bond-pair-gizmo:${subscriptionId}`
    const unsubscribe = ticker.subscribe(tickerKey, Phase.Gizmo, () => controller.update())
    ticker.invalidate()
    return () => {
      unsubscribe()
      controller.dispose()
      if (session.isActive) {
        session.cancel()
        if (latestValue) onChangeRef.current?.(latestValue, 'cancel')
      }
    }
  }, [
    renderer,
    disabled,
    config?.enabled,
    config?.referenceBondId,
    config?.movingBondId,
    config?.referenceAnchorAtomId,
    config?.movingAnchorAtomId,
    config?.mode,
    config?.showCoplanarHandles,
    moleculeStore,
    ticker,
    subscriptionId,
  ])

  return null
}
