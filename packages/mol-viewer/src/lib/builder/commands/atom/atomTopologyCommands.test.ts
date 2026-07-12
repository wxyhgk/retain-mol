import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../../molecule'
import {
  getAddOneHydrogenAvailabilityCommand,
  getAddOneHydrogensAvailabilityCommand,
  runAddHydrogensCommand,
  runAddOneHydrogenCommand,
  runAddOneHydrogensCommand,
  runGrowFromHydrogenCommand,
  runReplaceAtomCommand,
  runReplaceAtomsCommand,
} from './atomTopologyCommands'

describe('atom topology commands', () => {
  it('replaces one or many atom symbols without changing bonds', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.5, 0, 0)
    const h = newAtom('H', 2.5, 0, 0)
    const b12 = newBond(c1.id, c2.id)
    const b2h = newBond(c2.id, h.id)

    const one = runReplaceAtomCommand({ atoms: [c1, c2, h], bonds: [b12, b2h] }, c1.id, 'N')
    expect(one.ok && one.changed && one.molecule.atoms.find(atom => atom.id === c1.id)?.symbol).toBe('N')

    const many = runReplaceAtomsCommand({ atoms: [c1, c2, h], bonds: [b12, b2h] }, [c1.id, c2.id], 'O')
    expect(many.ok && many.changed && many.molecule.atoms.map(atom => atom.symbol)).toEqual(['O', 'O', 'H'])
    expect(many.ok && many.changed && many.molecule.bonds).toEqual([b12, b2h])
  })

  it('adds explicit hydrogens through single and batch commands', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 2, 0, 0)

    const one = runAddOneHydrogenCommand({ atoms: [c1], bonds: [] }, c1.id)
    expect(one.ok && one.changed && one.molecule.atoms.filter(atom => atom.symbol === 'H')).toHaveLength(1)

    const many = runAddOneHydrogensCommand({ atoms: [c1, c2], bonds: [] }, [c1.id, c2.id])
    expect(many.ok && many.changed && many.molecule.atoms.filter(atom => atom.symbol === 'H')).toHaveLength(2)

    const saturated = runAddHydrogensCommand({ atoms: [c1], bonds: [] }, c1.id)
    expect(saturated.ok && saturated.changed && saturated.molecule.atoms.filter(atom => atom.symbol === 'H')).toHaveLength(4)
  })

  it('reports hydrogen availability before mutating', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1, 0, 0)

    expect(getAddOneHydrogenAvailabilityCommand({ atoms: [c], bonds: [] }, c.id)).toEqual({ ok: true })
    expect(getAddOneHydrogenAvailabilityCommand({ atoms: [h], bonds: [] }, h.id)).toEqual({
      ok: false,
      reason: 'H 不能继续加 H',
    })
    expect(getAddOneHydrogensAvailabilityCommand({ atoms: [c, h], bonds: [] }, [c.id, h.id])).toEqual({
      ok: true,
      allowedAtomIds: [c.id],
    })
  })

  it('grows by replacing a bonded hydrogen slot', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)
    const bond = newBond(c.id, h.id)

    const result = runGrowFromHydrogenCommand({ atoms: [c, h], bonds: [bond] }, h.id, 'N')

    expect(result.ok && result.changed && result.molecule.atoms.find(atom => atom.id === h.id)?.symbol).toBe('N')
    expect(result.ok && result.changed && result.molecule.bonds.some(
      candidate => (candidate.atomId1 === c.id && candidate.atomId2 === h.id) ||
                   (candidate.atomId1 === h.id && candidate.atomId2 === c.id),
    )).toBe(true)
  })
})
