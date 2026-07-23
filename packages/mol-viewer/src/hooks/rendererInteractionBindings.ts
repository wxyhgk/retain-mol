import { toolCan } from '../config/toolCapabilities.config'
import type { InteractionBindingsPort } from '../lib/interaction/contracts'
import {
  canEditInInteractionMode,
  canSelectInInteractionMode,
  type InteractionMode,
} from '../lib/interaction/interactionMode'
import type { Tool } from '../lib/types'
import type { BuilderHandlers } from './useBuilder'

export interface RendererInteractionBindingTarget extends InteractionBindingsPort {
  idleCursor: string
  setDragHoverAtom: (atomId: string | null) => void
}

export interface SelectionInteractionEffects {
  readonly selectAtom: (atomId: string, multi: boolean) => void
  readonly selectBond: (bondId: string, multi: boolean) => void
  readonly clearSelection: () => void
  readonly isAtomSelected: (atomId: string) => boolean
}

function clearEditBindings(renderer: RendererInteractionBindingTarget): void {
  renderer.onAtomDrag = undefined
  renderer.onAtomDragStart = undefined
  renderer.onAtomDragEnd = undefined
  renderer.onAtomDragCancel = undefined
  renderer.canDragAtom = undefined
  renderer.canStartBondDrag = undefined
  renderer.onBondDragStart = undefined
  renderer.onBondDragEnd = undefined
  renderer.onBondDragHover = undefined
  renderer.getGrowPreview = undefined
  renderer.getGrowGuide = undefined
  renderer.canStartFragmentTorsion = undefined
  renderer.onFragmentTorsionStart = undefined
  renderer.getFragmentTorsionPreview = undefined
  renderer.onFragmentTorsionEnd = undefined
}

export function configureRendererInteractionBindings(input: {
  readonly renderer: RendererInteractionBindingTarget
  readonly interactionMode: InteractionMode
  readonly activeTool: Tool
  readonly brushArmed: boolean
  readonly handlers: BuilderHandlers
  readonly selection: SelectionInteractionEffects
}): void {
  const {
    renderer,
    interactionMode,
    activeTool,
    brushArmed,
    handlers,
    selection,
  } = input
  const editingEnabled = canEditInInteractionMode(interactionMode)
  const canEdit = editingEnabled && toolCan(activeTool, 'canEdit')

  if (!canSelectInInteractionMode(interactionMode)) {
    renderer.idleCursor = ''
    renderer.onAtomClick = undefined
    renderer.onAtomDoubleClick = undefined
    renderer.onBondClick = undefined
    renderer.onBackgroundClick = undefined
    clearEditBindings(renderer)
    return
  }

  if (!editingEnabled) {
    renderer.idleCursor = ''
    renderer.onAtomClick = (atomId, event) => selection.selectAtom(atomId, event.shiftKey)
    renderer.onAtomDoubleClick = undefined
    renderer.onBondClick = (bondId, event) => selection.selectBond(bondId, event.shiftKey)
    renderer.onBackgroundClick = () => selection.clearSelection()
    clearEditBindings(renderer)
    return
  }

  renderer.idleCursor = canEdit && brushArmed ? 'crosshair' : ''
  renderer.onAtomClick = handlers.onAtomClick
  renderer.onAtomDoubleClick = canEdit && !brushArmed ? handlers.onAtomDoubleClick : undefined
  renderer.onBondClick = handlers.onBondClick
  renderer.onBackgroundClick = handlers.onBackgroundClick
  renderer.onAtomDrag = canEdit ? handlers.onAtomDrag : undefined
  renderer.onAtomDragStart = canEdit ? handlers.onAtomDragStart : undefined
  renderer.onAtomDragEnd = canEdit ? handlers.onAtomDragEnd : undefined
  renderer.onAtomDragCancel = canEdit ? handlers.onAtomDragCancel : undefined
  renderer.canDragAtom = canEdit ? selection.isAtomSelected : undefined
  renderer.canStartBondDrag = handlers.canStartBondDrag
  renderer.onBondDragStart = handlers.onBondDragStart
  renderer.onBondDragEnd = handlers.onBondDragEnd
  renderer.onBondDragHover = id => renderer.setDragHoverAtom(id)
  renderer.getGrowPreview = handlers.getGrowPreview
  renderer.getGrowGuide = handlers.getGrowGuide
  renderer.canStartFragmentTorsion = handlers.canStartFragmentTorsion
  renderer.onFragmentTorsionStart = handlers.onFragmentTorsionStart
  renderer.getFragmentTorsionPreview = handlers.getFragmentTorsionPreview
  renderer.onFragmentTorsionEnd = handlers.onFragmentTorsionEnd
}
