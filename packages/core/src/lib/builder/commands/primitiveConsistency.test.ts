import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../molecule'
import { applyExpectedEffectCommand } from '../../modeling/effects/semantics'
import {
  getAddOneHydrogenAvailabilityCommand,
  runAddAtomCommand,
  runAddOneHydrogenCommand,
  runSetAtomChargeCommand,
  runSetAtomRadicalCommand,
} from './atom'
import { runSetBondOrderCommand } from './bond'

describe('atom and bond primitive consistency', () => {
  it('uses the same rule for hydrogen availability and execution', () => {
    const hydrogen = newAtom('H')
    const molecule = { atoms: [hydrogen], bonds: [] }

    expect(getAddOneHydrogenAvailabilityCommand(molecule, hydrogen.id).ok).toBe(false)
    expect(runAddOneHydrogenCommand(molecule, hydrogen.id).ok).toBe(false)
  })

  it('rejects invalid atom creation inputs at the command boundary', () => {
    const molecule = { atoms: [], bonds: [] }

    expect(runAddAtomCommand(molecule, 'Unknown', 0, 0, 0).ok).toBe(false)
    expect(runAddAtomCommand(molecule, 'C', Number.NaN, 0, 0).ok).toBe(false)
  })

  it('treats repeated atom properties as no-ops and rejects invalid values', () => {
    const nitrogen = { ...newAtom('N'), charge: 1, radical: 1 }
    const molecule = { atoms: [nitrogen], bonds: [] }

    expect(runSetAtomChargeCommand(molecule, nitrogen.id, 1)).toEqual({ ok: true, changed: false })
    expect(runSetAtomRadicalCommand(molecule, nitrogen.id, 1)).toEqual({ ok: true, changed: false })
    expect(runSetAtomChargeCommand(molecule, nitrogen.id, 0.5).ok).toBe(false)
    expect(runSetAtomRadicalCommand(molecule, nitrogen.id, -1).ok).toBe(false)
  })

  it('consumes terminal hydrogens when a bond order increases', () => {
    const carbon1 = newAtom('C', 0, 0, 0)
    const carbon2 = newAtom('C', 1.54, 0, 0)
    const hydrogens = Array.from({ length: 6 }, (_, index) => newAtom('H', index, 1, 0))
    const carbonBond = newBond(carbon1.id, carbon2.id)
    const molecule = {
      atoms: [carbon1, carbon2, ...hydrogens],
      bonds: [
        carbonBond,
        ...hydrogens.slice(0, 3).map(atom => newBond(carbon1.id, atom.id)),
        ...hydrogens.slice(3).map(atom => newBond(carbon2.id, atom.id)),
      ],
    }

    const result = runSetBondOrderCommand(molecule, carbonBond.id, 2)

    expect(result.ok && result.changed).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.bonds.find(bond => bond.id === carbonBond.id)?.order).toBe(2)
    expect(result.molecule.atoms.filter(atom => atom.symbol === 'H')).toHaveLength(4)
  })

  it('rejects a bond-order increase when no removable hydrogen can restore valence', () => {
    const center = newAtom('C')
    const neighbors = Array.from({ length: 4 }, () => newAtom('C'))
    const bonds = neighbors.map(atom => newBond(center.id, atom.id))
    const molecule = { atoms: [center, ...neighbors], bonds }

    expect(runSetBondOrderCommand(molecule, bonds[0]!.id, 2)).toEqual({ ok: true, changed: false })
  })

  it('makes ExpectedEffect reject bonds that production execution rejects', () => {
    const hydrogen1 = newAtom('H')
    const hydrogen2 = newAtom('H')
    const hydrogen3 = newAtom('H')
    const existing = newBond(hydrogen1.id, hydrogen2.id)
    const molecule = { atoms: [hydrogen1, hydrogen2, hydrogen3], bonds: [existing] }

    const selfBond = applyExpectedEffectCommand(molecule, {
      commandId: 'self',
      kind: 'bond.add',
      bondId: 'self-bond',
      atomId1: hydrogen3.id,
      atomId2: hydrogen3.id,
      order: 1,
    })
    const duplicateBond = applyExpectedEffectCommand(molecule, {
      commandId: 'duplicate',
      kind: 'bond.add',
      bondId: 'duplicate-bond',
      atomId1: hydrogen1.id,
      atomId2: hydrogen2.id,
      order: 1,
    })
    const overValenceBond = applyExpectedEffectCommand(molecule, {
      commandId: 'over-valence',
      kind: 'bond.add',
      bondId: 'over-valence-bond',
      atomId1: hydrogen1.id,
      atomId2: hydrogen3.id,
      order: 1,
    })

    expect(selfBond.ok).toBe(false)
    expect(duplicateBond.ok).toBe(false)
    expect(overValenceBond.ok).toBe(false)
  })
})
