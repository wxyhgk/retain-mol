/**
 * selectionSlice — 选择状态（selectedAtomIds / selectedBondIds / selectionVersion）+ 选择 action。
 *
 * selectionVersion 是脏检测计数器，不进 undo 历史；选择集本身也不进快照
 * （见 undoConfig.partializeForUndo）。
 */

import type { StateCreator } from 'zustand'
import type { MoleculeState, SelectionSlice } from './types'
import { applySelectionResult } from './helpers'
import {
  runClearSelectionCommand,
  runSelectAtomCommand,
  runSelectAtomsCommand,
  runSelectBondCommand,
} from '../../lib/builder/commands/selection'

function sceneAtomIds(state: MoleculeState): Set<string> {
  return new Set(state.objectOrder.flatMap(id =>
    state.objectsById[id]?.molecule.atoms.map(atom => atom.id) ?? [],
  ))
}

function sceneBondIds(state: MoleculeState): Set<string> {
  return new Set(state.objectOrder.flatMap(id =>
    state.objectsById[id]?.molecule.bonds.map(bond => bond.id) ?? [],
  ))
}

export const createSelectionSlice: StateCreator<MoleculeState, [], [], SelectionSlice> = (set) => ({
  selectionVersion: 0,
  selectedAtomIds:  new Set(),
  selectedBondIds:  new Set(),

  selectAtom: (id, multi = false) => set((s) => {
    if (!sceneAtomIds(s).has(id)) return {}
    const result = runSelectAtomCommand(s.selectedAtomIds, s.selectedBondIds, id, multi)
    return applySelectionResult(s, result)
  }),

  selectAtoms: (ids, mode = 'replace') => set((s) => {
    const validIds = sceneAtomIds(s)
    const result = runSelectAtomsCommand(
      s.selectedAtomIds,
      s.selectedBondIds,
      [...ids].filter(id => validIds.has(id)),
      mode,
    )
    return applySelectionResult(s, result)
  }),

  selectBond: (id, multi = false) => set((s) => {
    if (!sceneBondIds(s).has(id)) return {}
    const result = runSelectBondCommand(s.selectedAtomIds, s.selectedBondIds, id, multi)
    return applySelectionResult(s, result)
  }),

  clearSelection: () => set((s) => {
    const result = runClearSelectionCommand(s.selectedAtomIds, s.selectedBondIds)
    return applySelectionResult(s, result)
  }),
})
