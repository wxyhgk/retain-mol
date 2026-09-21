import type { ReactNode } from 'react'
import { toolCan } from '../../config/toolCapabilities.config'
import type { ThreeRendererPort } from '../../lib/molRenderer'
import type { Tool } from '../../lib/presentation/types'
import BuilderHint from '../builder/BuilderHint'
import AtomContextMenu from './AtomContextMenu'
import AtomLabelOverlay from './AtomLabelOverlay'
import BondLengthGizmo from './BondLengthGizmo'
import BoxSelectOverlay from './BoxSelectOverlay'
import MeasureOverlay from './MeasureOverlay'
import RotateGizmo from './RotateGizmo'
import BondPairAlignmentGizmo from './BondPairAlignmentGizmo'
import type {
  BondPairGizmoConfig,
  BondPairGizmoError,
  BondPairGizmoPhase,
  BondPairGizmoValue,
} from '../../lib/bondPairGizmo'
import type { BoxRect } from '../../hooks/useCanvasPointerRouter'
import {
  canEditInInteractionMode,
  type InteractionMode,
} from '../../lib/interaction/interactionMode'

interface Props {
  readonly renderer: ThreeRendererPort | null
  readonly activeTool: Tool
  readonly brushArmed: boolean
  readonly interactionMode: InteractionMode
  readonly boxRect: BoxRect | null
  readonly bondPairGizmo: BondPairGizmoConfig | undefined
  readonly onBondPairGizmoChange: ((value: BondPairGizmoValue, phase: BondPairGizmoPhase) => void) | undefined
  readonly onBondPairGizmoError: ((error: BondPairGizmoError) => void) | undefined
  readonly children?: ReactNode
}

/** Declarative overlay stack rendered above the WebGL canvas. */
export function MolViewerOverlays({
  renderer,
  activeTool,
  brushArmed,
  interactionMode,
  boxRect,
  bondPairGizmo,
  onBondPairGizmoChange,
  onBondPairGizmoError,
  children,
}: Props) {
  const editingEnabled = canEditInInteractionMode(interactionMode)
  return (
    <>
      <MeasureOverlay renderer={renderer} />
      <AtomLabelOverlay renderer={renderer} />
      <RotateGizmo
        renderer={renderer}
        enabled={editingEnabled && toolCan(activeTool, 'canEdit') && !bondPairGizmo?.enabled}
        readOnly={!editingEnabled}
      />
      <BondPairAlignmentGizmo
        renderer={renderer}
        config={bondPairGizmo}
        enabled={Boolean(bondPairGizmo?.enabled)}
        readOnly={interactionMode === 'read-only'}
        onChange={onBondPairGizmoChange}
        onError={onBondPairGizmoError}
      />
      <BondLengthGizmo
        renderer={renderer}
        enabled={toolCan(activeTool, 'canEdit') && brushArmed}
        readOnly={!editingEnabled}
      />
      <BoxSelectOverlay rect={editingEnabled ? boxRect : null} />
      {editingEnabled && <AtomContextMenu renderer={renderer} />}
      {children}
      {editingEnabled && <BuilderHint />}
    </>
  )
}
