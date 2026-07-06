/**
 * selectionSlice — 选择状态（selectedAtomIds / selectedBondIds / selectionVersion）+ 选择 action。
 *
 * selectionVersion 是脏检测计数器，不进 undo 历史；选择集本身也不进快照
 * （见 undoConfig.partializeForUndo）。
 */

import type { StateCreator } from 'zustand'
import type { MoleculeState, SelectionSlice } from './types'

export const createSelectionSlice: StateCreator<MoleculeState, [], [], SelectionSlice> = (set) => ({
  selectionVersion: 0,
  selectedAtomIds:  new Set(),
  selectedBondIds:  new Set(),

  selectAtom: (id, multi = false) => set((s) => {
    if (multi) {
      const next = new Set(s.selectedAtomIds)
      next.has(id) ? next.delete(id) : next.add(id)
      return { selectedAtomIds: next, selectionVersion: s.selectionVersion + 1 }
    }
    return { selectedAtomIds: new Set([id]), selectedBondIds: new Set(), selectionVersion: s.selectionVersion + 1 }
  }),

  selectAtoms: (ids, mode = 'replace') => set((s) => {
    const incoming = new Set<string>(ids)
    if (mode === 'replace') return { selectedAtomIds: incoming, selectedBondIds: new Set(), selectionVersion: s.selectionVersion + 1 }
    const next = new Set(s.selectedAtomIds)
    if (mode === 'add') incoming.forEach(id => next.add(id))
    else incoming.forEach(id => next.delete(id))
    return { selectedAtomIds: next, selectionVersion: s.selectionVersion + 1 }
  }),

  selectBond: (id, multi = false) => set((s) => {
    if (multi) {
      const next = new Set(s.selectedBondIds)
      next.has(id) ? next.delete(id) : next.add(id)
      return { selectedBondIds: next, selectionVersion: s.selectionVersion + 1 }
    }
    return { selectedBondIds: new Set([id]), selectedAtomIds: new Set(), selectionVersion: s.selectionVersion + 1 }
  }),

  clearSelection: () => set((s) => ({
    selectedAtomIds: new Set(),
    selectedBondIds: new Set(),
    selectionVersion: s.selectionVersion + 1,
  })),
})
