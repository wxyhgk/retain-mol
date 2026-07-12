import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { selectActiveMoleculeOrEmpty, useMoleculeStore } from '@/domain/viewer/moleculeState'
import {
  selectGeometrySelection,
  selectMoleculeSummary,
} from '../domain/geometryPanelSelectors'

export function useGeometryMoleculeSummary() {
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)
  const summary = useMemo(() => selectMoleculeSummary(molecule), [molecule])

  return { molecule, ...summary }
}

export function useGeometrySelection(molecule: ReturnType<typeof selectActiveMoleculeOrEmpty>) {
  const selectionIds = useMoleculeStore(useShallow(state => ({
    selectedAtomIds: state.selectedAtomIds,
    selectedBondIds: state.selectedBondIds,
  })))

  return useMemo(
    () => selectGeometrySelection(molecule, selectionIds),
    [molecule, selectionIds],
  )
}

export function useGeometryPanelActions() {
  return useMoleculeStore(useShallow(state => ({
    removeAtoms: state.removeAtoms,
    removeBond: state.removeBond,
    cycleBondOrder: state.cycleBondOrder,
    addHydrogens: state.addHydrogens,
    moveAtom: state.moveAtom,
  })))
}
