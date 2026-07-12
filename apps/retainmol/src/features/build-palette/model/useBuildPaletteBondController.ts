import { useShallow } from 'zustand/react/shallow'
import { connectSelectedAtoms } from '@/domain/moleculeEditCommands'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'

type BondOrder = 1 | 2 | 3

/** Selection-derived bond commands used by the Draw panel. */
export function useBuildPaletteBondController() {
  const selection = useMoleculeStore(useShallow(state => {
    const selectedBondId = state.selectedBondIds.size === 1
      ? state.selectedBondIds.values().next().value
      : undefined
    const molecule = state.activeObjectId
      ? state.objectsById[state.activeObjectId]?.molecule
      : undefined
    const selectedBond = selectedBondId
      ? molecule?.bonds.find(bond => bond.id === selectedBondId)
      : undefined

    return {
      selectedAtomCount: state.selectedAtomIds.size,
      selectedBondId,
      selectedBondOrder: selectedBond?.order,
      selectedBondAtom1Symbol: selectedBond
        ? molecule?.atoms.find(atom => atom.id === selectedBond.atomId1)?.symbol
        : undefined,
      selectedBondAtom2Symbol: selectedBond
        ? molecule?.atoms.find(atom => atom.id === selectedBond.atomId2)?.symbol
        : undefined,
      removeBond: state.removeBond,
      setBondOrder: state.setBondOrder,
    }
  }))

  const selectedBond = selection.selectedBondId && selection.selectedBondOrder
    ? {
        id: selection.selectedBondId,
        order: selection.selectedBondOrder,
        atomSymbols: [
          selection.selectedBondAtom1Symbol ?? '?',
          selection.selectedBondAtom2Symbol ?? '?',
        ] as [string, string],
      }
    : null

  return {
    selectedAtomCount: selection.selectedAtomCount,
    selectedBond,
    connectSelectedAtoms,
    setSelectedBondOrder(order: BondOrder) {
      if (selection.selectedBondId) selection.setBondOrder(selection.selectedBondId, order)
    },
    deleteSelectedBond() {
      if (selection.selectedBondId) selection.removeBond(selection.selectedBondId)
    },
  }
}
