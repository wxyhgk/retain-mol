import { useStore } from 'zustand'
import { useMoleculeTemporal as moleculeTemporal } from '@retainmol/mol-viewer/state'

export function useMoleculeHistory() {
  const undo = useStore(moleculeTemporal, state => state.undo)
  const redo = useStore(moleculeTemporal, state => state.redo)
  const canUndo = useStore(moleculeTemporal, state => state.pastStates.length > 0)
  const canRedo = useStore(moleculeTemporal, state => state.futureStates.length > 0)
  return { undo, redo, canUndo, canRedo }
}

export function isMoleculeHistoryTracking(): boolean {
  return moleculeTemporal.getState().isTracking
}
