import type { ReactNode } from 'react'
import { toolCan } from '../../config/toolCapabilities.config'
import type { ThreeRendererPort } from '../../lib/molRenderer'
import type { Tool } from '../../lib/types'
import BuilderHint from '../builder/BuilderHint'
import AtomContextMenu from './AtomContextMenu'
import AtomLabelOverlay from './AtomLabelOverlay'
import BondLengthGizmo from './BondLengthGizmo'
import BoxSelectOverlay from './BoxSelectOverlay'
import MeasureOverlay from './MeasureOverlay'
import RotateGizmo from './RotateGizmo'
import type { BoxRect } from '../../hooks/useCanvasPointerRouter'

interface Props {
  readonly renderer: ThreeRendererPort | null
  readonly activeTool: Tool
  readonly brushArmed: boolean
  readonly readOnly: boolean
  readonly boxRect: BoxRect | null
  readonly children?: ReactNode
}

/** Declarative overlay stack rendered above the WebGL canvas. */
export function MolViewerOverlays({
  renderer,
  activeTool,
  brushArmed,
  readOnly,
  boxRect,
  children,
}: Props) {
  return (
    <>
      <MeasureOverlay renderer={renderer} />
      <AtomLabelOverlay renderer={renderer} />
      <RotateGizmo renderer={renderer} readOnly={readOnly} />
      <BondLengthGizmo
        renderer={renderer}
        visible={toolCan(activeTool, 'canEdit') && brushArmed}
        readOnly={readOnly}
      />
      <BoxSelectOverlay rect={readOnly ? null : boxRect} />
      {!readOnly && <AtomContextMenu renderer={renderer} />}
      {children}
      {!readOnly && <BuilderHint />}
    </>
  )
}
