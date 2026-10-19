import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../../molecule'
import {
  canStartBondDragCommand,
} from './bondDragStartCommands'

describe('canStartBondDragCommand', () => {
  it('allows unsaturated heavy atoms to start a bond drag', () => {
    const c = newAtom('C', 0, 0, 0)

    expect(canStartBondDragCommand({ atoms: [c], bonds: [] }, {
      sourceId: c.id,
      selectedAtomIds: new Set(),
      hasActiveFragment: false,
    })).toBe(true)
  })

  it('rejects selected atoms, active fragments, missing atoms and saturated atoms', () => {
    const c = newAtom('C', 0, 0, 0)
    const hydrogens = [
      newAtom('H', 1, 0, 0),
      newAtom('H', -1, 0, 0),
      newAtom('H', 0, 1, 0),
      newAtom('H', 0, -1, 0),
    ]
    const mol = {
      atoms: [c, ...hydrogens],
      bonds: hydrogens.map(h => newBond(c.id, h.id)),
    }

    expect(canStartBondDragCommand({ atoms: [c], bonds: [] }, {
      sourceId: c.id,
      selectedAtomIds: new Set([c.id]),
      hasActiveFragment: false,
    })).toBe(false)
    expect(canStartBondDragCommand({ atoms: [c], bonds: [] }, {
      sourceId: c.id,
      selectedAtomIds: new Set(),
      hasActiveFragment: true,
    })).toBe(false)
    expect(canStartBondDragCommand({ atoms: [c], bonds: [] }, {
      sourceId: 'missing',
      selectedAtomIds: new Set(),
      hasActiveFragment: false,
    })).toBe(false)
    expect(canStartBondDragCommand(mol, {
      sourceId: c.id,
      selectedAtomIds: new Set(),
      hasActiveFragment: false,
    })).toBe(false)
  })

  it('allows bonded H slots to start a bond drag', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)

    expect(canStartBondDragCommand({ atoms: [c, h], bonds: [newBond(c.id, h.id)] }, {
      sourceId: h.id,
      selectedAtomIds: new Set(),
      hasActiveFragment: false,
    })).toBe(true)
  })
})
