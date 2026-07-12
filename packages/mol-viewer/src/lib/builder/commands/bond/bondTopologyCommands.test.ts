import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../../molecule'
import {
  canBond,
  runAddBondCommand,
  runBondViaHydrogenCommand,
  runCycleBondOrderCommand,
  runSetBondOrderCommand,
} from './bondTopologyCommands'

describe('bond topology commands', () => {
  it('checks bond availability through the command boundary', () => {
    const c1 = newAtom('C')
    const c2 = newAtom('C')
    const bond = newBond(c1.id, c2.id)

    expect(canBond(c1, c2, []).ok).toBe(true)
    expect(canBond(c1, c2, [bond]).ok).toBe(false)
  })

  it('adds bonds through the valence policy', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.34, 0, 0)

    const result = runAddBondCommand({ atoms: [c1, c2], bonds: [] }, {
      atomId1: c1.id,
      atomId2: c2.id,
      order: 2,
    })

    expect(result.ok).toBe(true)
    expect(result.ok && result.changed && result.molecule.bonds[0]).toMatchObject({
      atomId1: c1.id,
      atomId2: c2.id,
      order: 2,
    })
  })

  it('rejects invalid bonds', () => {
    const h1 = newAtom('H', 0, 0, 0)
    const h2 = newAtom('H', 0.75, 0, 0)
    const h3 = newAtom('H', 1.5, 0, 0)
    const existing = newBond(h1.id, h2.id)

    expect(runAddBondCommand({ atoms: [h1, h2, h3], bonds: [] }, {
      atomId1: h1.id,
      atomId2: h1.id,
    }).ok).toBe(false)
    expect(runAddBondCommand({ atoms: [h1, h2, h3], bonds: [existing] }, {
      atomId1: h1.id,
      atomId2: h2.id,
    }).ok).toBe(false)
    expect(runAddBondCommand({ atoms: [h1, h2, h3], bonds: [existing] }, {
      atomId1: h1.id,
      atomId2: h3.id,
    }).ok).toBe(false)
  })

  it('cycles bond order only through supported orders', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.54, 0, 0)
    const bond = newBond(c1.id, c2.id, 1)

    const result = runCycleBondOrderCommand({ atoms: [c1, c2], bonds: [bond] }, bond.id)

    expect(result.ok && result.changed && result.molecule.bonds[0].order).toBe(2)
  })

  it('sets a supported bond order directly and clears aromatic metadata', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.54, 0, 0)
    const bond = { ...newBond(c1.id, c2.id, 1), aromatic: true }
    const molecule = { atoms: [c1, c2], bonds: [bond] }

    const result = runSetBondOrderCommand(molecule, bond.id, 2)

    expect(result.ok && result.changed).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms).toBe(molecule.atoms)
    expect(result.molecule.bonds[0]).toMatchObject({ id: bond.id, order: 2 })
    expect(result.molecule.bonds[0].aromatic).toBeUndefined()
  })

  it('treats missing, unsupported, invalid, and unchanged orders as safe no-ops', () => {
    const h1 = newAtom('H', 0, 0, 0)
    const h2 = newAtom('H', 0.75, 0, 0)
    const bond = newBond(h1.id, h2.id, 1)
    const molecule = { atoms: [h1, h2], bonds: [bond] }

    expect(runSetBondOrderCommand(molecule, 'missing-bond', 1)).toEqual({
      ok: true,
      changed: false,
    })
    expect(runSetBondOrderCommand(molecule, bond.id, 2)).toEqual({
      ok: true,
      changed: false,
    })
    expect(runSetBondOrderCommand(molecule, bond.id, 4 as 1 | 2 | 3)).toEqual({
      ok: true,
      changed: false,
    })
    expect(runSetBondOrderCommand(molecule, bond.id, 1)).toEqual({
      ok: true,
      changed: false,
    })
  })

  it('bonds through a hydrogen slot and removes that slot', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)
    const c2 = newAtom('C', 2.5, 0, 0)
    const result = runBondViaHydrogenCommand(
      { atoms: [c1, h, c2], bonds: [newBond(c1.id, h.id)] },
      h.id,
      c2.id,
    )

    expect(result.ok && result.changed && result.molecule.atoms.some(atom => atom.id === h.id)).toBe(false)
    expect(result.ok && result.changed && result.molecule.bonds.some(
      bond => (bond.atomId1 === c1.id && bond.atomId2 === c2.id) ||
              (bond.atomId1 === c2.id && bond.atomId2 === c1.id),
    )).toBe(true)
  })
})
