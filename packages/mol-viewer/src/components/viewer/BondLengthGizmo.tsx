import type { MolRenderer } from '../../lib/molRenderer'
import { useViewerRuntime } from '../../runtime/ViewerRuntime'
import { BondLengthGizmoView } from './BondLengthGizmoView'
import { useBondLengthGizmoController } from './useBondLengthGizmoController'

interface Props {
  renderer: MolRenderer | null
  visible: boolean
  readOnly?: boolean
}

export default function BondLengthGizmo({ renderer, visible, readOnly = false }: Props) {
  const { moleculeStore } = useViewerRuntime()
  const selectedAtomIds = moleculeStore(state => state.selectedAtomIds)
  const atomIds = selectedAtomIds.size === 2
    ? [...selectedAtomIds] as [string, string]
    : null
  const controller = useBondLengthGizmoController({ renderer, visible, readOnly, atomIds })

  if (!controller.active) return null
  return (
    <BondLengthGizmoView
      ref={controller.viewRef}
      editable={controller.editable}
      reason={controller.reason}
      onBeginDrag={controller.onBeginDrag}
      onPointerMove={controller.onPointerMove}
      onPointerUp={controller.onPointerUp}
      onPointerCancel={controller.onPointerCancel}
      onSubmitExactLength={controller.onSubmitExactLength}
    />
  )
}
