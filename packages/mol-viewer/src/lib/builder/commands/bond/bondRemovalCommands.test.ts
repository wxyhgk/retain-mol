import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../../molecule'
import { runRemoveBondCommand } from './bondRemovalCommands'

describe('bond removal commands', () => {
  it('removes one bond without clearing selected atoms', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.5, 0, 0)
    const bond = newBond(c1.id, c2.id)

    const result = runRemoveBondCommand(
      { atoms: [c1, c2], bonds: [bond] },
      bond.id,
      { selectedAtomIds: new Set([c1.id]), selectedBondIds: new Set([bond.id]) },
    )

    expect(result.moleculeChanged).toBe(true)
    expect(result.selectionChanged).toBe(true)
    expect(result.molecule.bonds).toHaveLength(0)
    expect(result.selectedAtomIds).toEqual(new Set([c1.id]))
    expect(result.selectedBondIds).toEqual(new Set())
  })

  it('cleans stale selection even when the requested bond does not exist', () => {
    const c = newAtom('C', 0, 0, 0)
    const result = runRemoveBondCommand(
      { atoms: [c], bonds: [] },
      'missing',
      { selectedAtomIds: new Set([c.id, 'missing-a']), selectedBondIds: new Set(['missing']) },
    )

    expect(result.moleculeChanged).toBe(false)
    expect(result.selectionChanged).toBe(true)
    expect(result.selectedAtomIds).toEqual(new Set([c.id]))
    expect(result.selectedBondIds).toEqual(new Set())
  })
})
