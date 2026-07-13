import { useEffect, useRef, type RefObject } from 'react'
import { toolCan } from '../config/toolCapabilities.config'
import type { ThreeRendererPort } from '../lib/molRenderer'
import type { Tool } from '../lib/types'
import type { MoleculeStoreApi } from '../store/moleculeStore'
import type { BuilderHandlers } from './useBuilder'

interface Options {
  readonly rendererRef: RefObject<ThreeRendererPort | null>
  readonly moleculeStore: MoleculeStoreApi
  readonly readOnly: boolean
  readonly activeTool: Tool
  readonly brushArmed: boolean
  readonly handlers: BuilderHandlers
}

export function useRendererInteractionBinding({
  rendererRef,
  moleculeStore,
  readOnly,
  activeTool,
  brushArmed,
  handlers,
}: Options) {
  const interactionModeRef = useRef(`${readOnly}:${activeTool}:${brushArmed}`)
  const {
    onAtomClick, onAtomDoubleClick, onBondClick, onBackgroundClick,
    onAtomDragStart, onAtomDrag, onAtomDragEnd, onAtomDragCancel,
    canStartBondDrag, onBondDragStart, onBondDragEnd, getGrowPreview, getGrowGuide,
    canStartFragmentTorsion, onFragmentTorsionStart,
    getFragmentTorsionPreview, onFragmentTorsionEnd,
  } = handlers

  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer) return
    const canEdit = toolCan(activeTool, 'canEdit')
    const interactionMode = `${readOnly}:${activeTool}:${brushArmed}`
    if (interactionModeRef.current !== interactionMode) {
      renderer.cancelActiveInteraction()
      interactionModeRef.current = interactionMode
    }
    if (readOnly || !canEdit) renderer.cancelActiveInteraction()

    if (readOnly) {
      renderer.idleCursor = ''
      renderer.onAtomClick = renderer.onAtomDoubleClick = renderer.onBondClick = renderer.onBackgroundClick = undefined
      renderer.onAtomDrag = renderer.onAtomDragStart = renderer.onAtomDragEnd = renderer.onAtomDragCancel = renderer.canDragAtom = undefined
      renderer.canStartBondDrag = renderer.onBondDragStart = renderer.onBondDragEnd = renderer.onBondDragHover = undefined
      renderer.getGrowPreview = renderer.getGrowGuide = undefined
      renderer.canStartFragmentTorsion = renderer.onFragmentTorsionStart = renderer.getFragmentTorsionPreview = renderer.onFragmentTorsionEnd = undefined
      return
    }

    renderer.idleCursor = canEdit && brushArmed ? 'crosshair' : ''
    renderer.onAtomClick = onAtomClick
    renderer.onAtomDoubleClick = canEdit && !brushArmed ? onAtomDoubleClick : undefined
    renderer.onBondClick = onBondClick
    renderer.onBackgroundClick = onBackgroundClick
    renderer.onAtomDrag = canEdit ? onAtomDrag : undefined
    renderer.onAtomDragStart = canEdit ? onAtomDragStart : undefined
    renderer.onAtomDragEnd = canEdit ? onAtomDragEnd : undefined
    renderer.onAtomDragCancel = canEdit ? onAtomDragCancel : undefined
    renderer.canDragAtom = canEdit
      ? id => moleculeStore.getState().selectedAtomIds.has(id)
      : undefined
    renderer.canStartBondDrag = canStartBondDrag
    renderer.onBondDragStart = onBondDragStart
    renderer.onBondDragEnd = onBondDragEnd
    renderer.onBondDragHover = id => renderer.setDragHoverAtom(id)
    renderer.getGrowPreview = getGrowPreview
    renderer.getGrowGuide = getGrowGuide
    renderer.canStartFragmentTorsion = canStartFragmentTorsion
    renderer.onFragmentTorsionStart = onFragmentTorsionStart
    renderer.getFragmentTorsionPreview = getFragmentTorsionPreview
    renderer.onFragmentTorsionEnd = onFragmentTorsionEnd
  }, [
    readOnly, onAtomClick, onAtomDoubleClick, onBondClick, onBackgroundClick,
    onAtomDrag, onAtomDragStart, onAtomDragEnd, onAtomDragCancel,
    canStartBondDrag, onBondDragStart, onBondDragEnd, getGrowPreview, getGrowGuide,
    canStartFragmentTorsion, onFragmentTorsionStart,
    getFragmentTorsionPreview, onFragmentTorsionEnd,
    activeTool, brushArmed, rendererRef, moleculeStore,
  ])
}
