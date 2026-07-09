import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../molecule'
import { runBondDragEndCommand } from './bondDragCommands'

describe('runBondDragEndCommand', () => {
  it('adds a bond when dragging from one atom to another', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.54, 0, 0)

    const result = runBondDragEndCommand({ atoms: [c1, c2], bonds: [] }, {
      sourceId: c1.id,
      targetId: c2.id,
      dropLocal: null,
      activeElement: 'C',
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.bonds).toHaveLength(1)
    expect(result.molecule.bonds[0]).toMatchObject({ atomId1: c1.id, atomId2: c2.id })
  })

  it('grows a new atom when dragging to empty space', () => {
    const c = newAtom('C', 0, 0, 0)

    const result = runBondDragEndCommand({ atoms: [c], bonds: [] }, {
      sourceId: c.id,
      targetId: null,
      dropLocal: { x: 1.54, y: 0, z: 0 },
      activeElement: 'C',
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms.filter(atom => atom.symbol === 'C')).toHaveLength(2)
    expect(result.molecule.bonds.some(bond => bond.atomId1 === c.id || bond.atomId2 === c.id)).toBe(true)
  })

  it('lets a bonded H slot make way when dragging to a target atom', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)
    const c2 = newAtom('C', 2.5, 0, 0)
    const mol = { atoms: [c1, h, c2], bonds: [newBond(c1.id, h.id)] }

    const result = runBondDragEndCommand(mol, {
      sourceId: h.id,
      targetId: c2.id,
      dropLocal: null,
      activeElement: 'C',
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms.some(atom => atom.id === h.id)).toBe(false)
    expect(result.molecule.bonds.some(
      bond => (bond.atomId1 === c1.id && bond.atomId2 === c2.id) ||
              (bond.atomId1 === c2.id && bond.atomId2 === c1.id)
    )).toBe(true)
  })
})
