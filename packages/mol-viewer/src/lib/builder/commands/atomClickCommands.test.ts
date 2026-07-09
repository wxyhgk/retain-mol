import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../molecule'
import { runAtomClickCommand } from './atomClickCommands'

describe('runAtomClickCommand', () => {
  it('replaces a clicked atom without adding hydrogens', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)
    const mol = { atoms: [c, h], bonds: [newBond(c.id, h.id)] }

    const result = runAtomClickCommand(mol, {
      atomId: c.id,
      activeElement: 'N',
      atomClickMode: 'replace',
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms.find(atom => atom.id === c.id)?.symbol).toBe('N')
    expect(result.molecule.atoms).toHaveLength(2)
    expect(result.molecule.bonds).toHaveLength(1)
  })

  it('returns noop message when replacing with the same element', () => {
    const c = newAtom('C', 0, 0, 0)
    const result = runAtomClickCommand({ atoms: [c], bonds: [] }, {
      atomId: c.id,
      activeElement: 'C',
      atomClickMode: 'replace',
    })

    expect(result).toEqual({ ok: true, changed: false, message: '已是 C' })
  })

  it('grows from a bonded H in grow mode', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)
    const mol = { atoms: [c, h], bonds: [newBond(c.id, h.id)] }

    const result = runAtomClickCommand(mol, {
      atomId: h.id,
      activeElement: 'C',
      atomClickMode: 'grow',
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms.find(atom => atom.id === h.id)?.symbol).toBe('C')
    expect(result.molecule.atoms.filter(atom => atom.symbol === 'H').length).toBeGreaterThan(0)
  })
})
