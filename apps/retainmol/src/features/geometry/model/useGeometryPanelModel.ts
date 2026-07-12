import { useMemo } from 'react'
import { connectSelectedAtoms } from '@/domain/editorCommands'
import { useEditorStore } from '@/domain/viewer/editorState'
import { selectLiveGeometry } from './geometryEditModel'
import { useGeometryEditActions } from './useGeometryEditActions'
import {
  useGeometryMoleculeSummary,
  useGeometryPanelActions,
  useGeometrySelection,
} from './useGeometryPanelSubscriptions'

export type { LiveGeometryModel } from './geometryEditModel'

export function useGeometryPanelModel() {
  const { molecule, formula, molecularWeight } = useGeometryMoleculeSummary()
  const { atomById, selectedAtoms, selectedBonds, orderedAtoms } = useGeometrySelection(molecule)
  const actions = useGeometryPanelActions()
  const editActions = useGeometryEditActions()
  const flashHint = useEditorStore(state => state.flashHint)
  const liveGeometry = useMemo(
    () => selectLiveGeometry(orderedAtoms, editActions),
    [orderedAtoms, editActions],
  )

  return {
    molecule,
    formula,
    molecularWeight,
    atomById,
    selectedAtoms,
    selectedBonds,
    liveGeometry,
    flashHint,
    connectSelectedAtoms,
    ...actions,
    ...editActions,
  }
}

export type GeometryPanelModel = ReturnType<typeof useGeometryPanelModel>
