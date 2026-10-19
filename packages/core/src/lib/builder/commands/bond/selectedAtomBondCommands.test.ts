import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../../molecule'
import { runBondSelectedAtomsCommand } from './selectedAtomBondCommands'

describe('runBondSelectedAtomsCommand', () => {
  it('requires exactly two selected atoms', () => {
    const c = newAtom('C')
    expect(runBondSelectedAtomsCommand({ atoms: [c], bonds: [] }, {
      atomIds: [c.id],
    })).toEqual({ ok: false, reason: '请先选中恰好两个原子' })
  })

  it('adds a bond and keeps ordinary atom selection', () => {
    const c1 = newAtom('C')
    const c2 = newAtom('C', 1.54)
    const result = runBondSelectedAtomsCommand({ atoms: [c1, c2], bonds: [] }, {
      atomIds: [c1.id, c2.id],
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.bonds).toHaveLength(1)
    expect(result.atomIdsToDeselect).toEqual([])
  })

  it('normalizes duplicate-bond errors', () => {
    const c1 = newAtom('C')
    const c2 = newAtom('C', 1.54)
    const bond = newBond(c1.id, c2.id)
    expect(runBondSelectedAtomsCommand({ atoms: [c1, c2], bonds: [bond] }, {
      atomIds: [c1.id, c2.id],
    })).toEqual({ ok: false, reason: '已经存在键' })
  })

  it('returns deselection metadata when an H slot makes way', () => {
    const c1 = newAtom('C')
    const h = newAtom('H', 1.09)
    const c2 = newAtom('C', 2.5)
    const result = runBondSelectedAtomsCommand({
      atoms: [c1, h, c2], bonds: [newBond(c1.id, h.id)],
    }, { atomIds: [h.id, c2.id] })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms.some(atom => atom.id === h.id)).toBe(false)
    expect(result.atomIdsToDeselect).toEqual([h.id, c2.id])
  })

  it('closes a ring by replacing two selected H slots with a parent-parent bond', () => {
    const c1 = newAtom('C')
    const h1 = newAtom('H', 1.09)
    const c2 = newAtom('C', 2.5)
    const h2 = newAtom('H', 1.41)
    const molecule = {
      atoms: [c1, h1, c2, h2],
      bonds: [newBond(c1.id, h1.id), newBond(c2.id, h2.id)],
    }

    const result = runBondSelectedAtomsCommand(molecule, { atomIds: [h1.id, h2.id] })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms.map(atom => atom.id)).toEqual([c1.id, c2.id])
    expect(result.molecule.bonds).toHaveLength(1)
    expect(new Set([
      result.molecule.bonds[0].atomId1,
      result.molecule.bonds[0].atomId2,
    ])).toEqual(new Set([c1.id, c2.id]))
  })
})
