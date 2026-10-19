import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../../molecule'
import { runRemoveAtomCommand, runRemoveAtomsCommand } from './atomRemovalCommands'

describe('atom removal commands', () => {
  it('removes one atom, attached bonds, and stale selection ids', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.5, 0, 0)
    const bond = newBond(c1.id, c2.id)

    const result = runRemoveAtomCommand(
      { atoms: [c1, c2], bonds: [bond] },
      c1.id,
      { selectedAtomIds: new Set([c1.id, c2.id]), selectedBondIds: new Set([bond.id]) },
    )

    expect(result.moleculeChanged).toBe(true)
    expect(result.selectionChanged).toBe(true)
    expect(result.molecule.atoms.map(atom => atom.id)).toEqual([c2.id])
    expect(result.molecule.bonds).toHaveLength(0)
    expect(result.selectedAtomIds).toEqual(new Set([c2.id]))
    expect(result.selectedBondIds).toEqual(new Set())
  })

  it('removes many atoms and attached bonds in one command', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.5, 0, 0)
    const c3 = newAtom('C', 3, 0, 0)
    const b12 = newBond(c1.id, c2.id)
    const b23 = newBond(c2.id, c3.id)

    const result = runRemoveAtomsCommand(
      { atoms: [c1, c2, c3], bonds: [b12, b23] },
      [c1.id, c3.id],
      { selectedAtomIds: new Set([c1.id, c2.id, c3.id]), selectedBondIds: new Set([b12.id, b23.id]) },
    )

    expect(result.moleculeChanged).toBe(true)
    expect(result.selectionChanged).toBe(true)
    expect(result.molecule.atoms.map(atom => atom.id)).toEqual([c2.id])
    expect(result.molecule.bonds).toHaveLength(0)
    expect(result.selectedAtomIds).toEqual(new Set([c2.id]))
    expect(result.selectedBondIds).toEqual(new Set())
  })

  it('cleans stale selection even when the requested atom does not exist', () => {
    const c = newAtom('C', 0, 0, 0)
    const result = runRemoveAtomCommand(
      { atoms: [c], bonds: [] },
      'missing',
      { selectedAtomIds: new Set(['missing']), selectedBondIds: new Set(['missing-bond']) },
    )

    expect(result.moleculeChanged).toBe(false)
    expect(result.selectionChanged).toBe(true)
    expect(result.selectedAtomIds).toEqual(new Set())
    expect(result.selectedBondIds).toEqual(new Set())
  })
})
