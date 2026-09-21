import { useEffect, useRef, type RefObject } from 'react'
import { toolCan } from '../config/toolCapabilities.config'
import type { ThreeRendererPort } from '../lib/molRenderer'
import type { Tool } from '../lib/presentation/types'
import type { MoleculeStoreApi } from '../store/moleculeStore'
import type { BuilderHandlers } from './useBuilder'
import { canEditInInteractionMode, type InteractionMode } from '../lib/interaction/interactionMode'
import { configureRendererInteractionBindings } from './rendererInteractionBindings'

interface Options {
  readonly rendererRef: RefObject<ThreeRendererPort | null>
  readonly moleculeStore: MoleculeStoreApi
  readonly interactionMode: InteractionMode
  readonly activeTool: Tool
  readonly brushArmed: boolean
  readonly handlers: BuilderHandlers
}

export function useRendererInteractionBinding({
  rendererRef,
  moleculeStore,
  interactionMode,
  activeTool,
  brushArmed,
  handlers,
}: Options) {
  const interactionStateRef = useRef(`${interactionMode}:${activeTool}:${brushArmed}`)
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
    const editingEnabled = canEditInInteractionMode(interactionMode)
    const canEdit = editingEnabled && toolCan(activeTool, 'canEdit')
    const interactionState = `${interactionMode}:${activeTool}:${brushArmed}`
    if (interactionStateRef.current !== interactionState) {
      renderer.cancelActiveInteraction()
      interactionStateRef.current = interactionState
    }
    if (!editingEnabled || !canEdit) renderer.cancelActiveInteraction()

    configureRendererInteractionBindings({
      renderer,
      interactionMode,
      activeTool,
      brushArmed,
      handlers,
      selection: {
        selectAtom: (atomId, multi) => moleculeStore.getState().selectAtom(atomId, multi),
        selectBond: (bondId, multi) => moleculeStore.getState().selectBond(bondId, multi),
        clearSelection: () => moleculeStore.getState().clearSelection(),
        isAtomSelected: atomId => moleculeStore.getState().selectedAtomIds.has(atomId),
      },
    })
  }, [
    interactionMode, onAtomClick, onAtomDoubleClick, onBondClick, onBackgroundClick,
    onAtomDrag, onAtomDragStart, onAtomDragEnd, onAtomDragCancel,
    canStartBondDrag, onBondDragStart, onBondDragEnd, getGrowPreview, getGrowGuide,
    canStartFragmentTorsion, onFragmentTorsionStart,
    getFragmentTorsionPreview, onFragmentTorsionEnd,
    activeTool, brushArmed, rendererRef, moleculeStore,
  ])
}
