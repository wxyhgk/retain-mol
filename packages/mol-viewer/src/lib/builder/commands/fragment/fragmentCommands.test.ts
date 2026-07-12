import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../../molecule'
import { getFragment } from '../../fragmentLibrary'
import {
  runAttachFragmentToAtomCommand,
  runFuseFragmentOnBondCommand,
} from './fragmentCommands'

describe('fragment commands', () => {
  it('attaches a fragment to an atom', () => {
    const c = newAtom('C', 0, 0, 0)
    const benzene = getFragment('benzene')
    expect(benzene).toBeDefined()
    if (!benzene) return

    const result = runAttachFragmentToAtomCommand({ atoms: [c], bonds: [] }, {
      atomId: c.id,
      fragment: benzene,
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms.length).toBeGreaterThan(1)
    expect(result.molecule.bonds.length).toBeGreaterThan(0)
  })

  it('fuses a ring fragment onto a bond', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.4, 0, 0)
    const bond = newBond(c1.id, c2.id)
    const benzene = getFragment('benzene')
    expect(benzene).toBeDefined()
    if (!benzene) return

    const result = runFuseFragmentOnBondCommand({ atoms: [c1, c2], bonds: [bond] }, {
      bondId: bond.id,
      fragment: benzene,
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms.length).toBeGreaterThan(2)
  })
})
