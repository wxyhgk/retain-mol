import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { selectActiveMoleculeOrEmpty, useMoleculeStore } from '@/domain/viewer/moleculeState'
import { buildInspectorModel } from '../model/inspectorModel'
import {
  AtomInspector,
  BondInspector,
  MoleculeInspector,
  MultiSelectionInspector,
} from './SelectionInspectorViews'

export function SelectionInspector() {
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)
  const { selectedAtomIds, selectedBondIds } = useMoleculeStore(useShallow(state => ({
    selectedAtomIds: state.selectedAtomIds,
    selectedBondIds: state.selectedBondIds,
  })))
  const model = useMemo(
    () => buildInspectorModel(molecule, selectedAtomIds, selectedBondIds),
    [molecule, selectedAtomIds, selectedBondIds],
  )

  switch (model.mode) {
    case 'molecule': return <MoleculeInspector model={model} />
    case 'atom': return <AtomInspector key={model.atom.atom.id} model={model} />
    case 'bond': return <BondInspector key={model.bond.id} model={model} />
    case 'multi': return <MultiSelectionInspector model={model} />
  }
}
