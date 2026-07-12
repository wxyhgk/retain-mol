import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../../molecule'
import { runBondClickCommand } from './bondClickCommands'

describe('runBondClickCommand', () => {
  it('cycles bond length when requested', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.54, 0, 0)
    const bond = newBond(c1.id, c2.id, 1)

    const result = runBondClickCommand({ atoms: [c1, c2], bonds: [bond] }, {
      bondId: bond.id,
      cycleLength: true,
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.bonds[0].order).toBe(2)
  })

  it('does nothing for a plain bond click', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.54, 0, 0)
    const bond = newBond(c1.id, c2.id, 1)

    expect(runBondClickCommand({ atoms: [c1, c2], bonds: [bond] }, {
      bondId: bond.id,
    })).toEqual({ ok: true, changed: false })
  })
})
