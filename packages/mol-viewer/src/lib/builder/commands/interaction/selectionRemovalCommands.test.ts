import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../../molecule'
import { runRemoveSelectedCommand } from './selectionRemovalCommands'

describe('selection removal commands', () => {
  it('removes selected atoms and explicit selected bonds together', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.5, 0, 0)
    const c3 = newAtom('C', 3, 0, 0)
    const b12 = newBond(c1.id, c2.id)
    const b23 = newBond(c2.id, c3.id)

    const result = runRemoveSelectedCommand(
      { atoms: [c1, c2, c3], bonds: [b12, b23] },
      { selectedAtomIds: new Set([c1.id]), selectedBondIds: new Set([b23.id]) },
    )

    expect(result.moleculeChanged).toBe(true)
    expect(result.selectionChanged).toBe(true)
    expect(result.molecule.atoms.map(atom => atom.id)).toEqual([c2.id, c3.id])
    expect(result.molecule.bonds).toHaveLength(0)
    expect(result.selectedAtomIds).toEqual(new Set())
    expect(result.selectedBondIds).toEqual(new Set())
  })

  it('clears stale selection without reporting a molecule change', () => {
    const c = newAtom('C', 0, 0, 0)
    const result = runRemoveSelectedCommand(
      { atoms: [c], bonds: [] },
      { selectedAtomIds: new Set(['missing-a']), selectedBondIds: new Set(['missing-b']) },
    )

    expect(result.moleculeChanged).toBe(false)
    expect(result.selectionChanged).toBe(true)
    expect(result.selectedAtomIds).toEqual(new Set())
    expect(result.selectedBondIds).toEqual(new Set())
  })
})
