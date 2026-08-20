import type { ThreeRendererPort } from '../../lib/molRenderer'
import { useViewerRuntimeServices } from '../../runtime/ViewerRuntime'
import { BondLengthGizmoView } from './BondLengthGizmoView'
import { useBondLengthGizmoController } from './useBondLengthGizmoController'

interface Props {
  renderer: ThreeRendererPort | null
  enabled: boolean
  readOnly: boolean
}

export default function BondLengthGizmo({ renderer, enabled, readOnly }: Props) {
  const { moleculeStore } = useViewerRuntimeServices()
  const selectedAtomIds = moleculeStore(state => state.selectedAtomIds)
  const atomIds = selectedAtomIds.size === 2
    ? [...selectedAtomIds] as [string, string]
    : null
  const controller = useBondLengthGizmoController({ renderer, enabled, readOnly, atomIds })

  if (!controller.active) return null
  return (
    <BondLengthGizmoView
      ref={controller.viewRef}
      editable={controller.editable}
      {...(controller.reason !== undefined ? { reason: controller.reason } : {})}
      onBeginDrag={controller.onBeginDrag}
      onPointerMove={controller.onPointerMove}
      onPointerUp={controller.onPointerUp}
      onPointerCancel={controller.onPointerCancel}
      onSubmitExactLength={controller.onSubmitExactLength}
    />
  )
}
