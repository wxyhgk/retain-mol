import { describe, expect, it } from 'vitest'
import { inferHybridization, newAtom, newBond } from './core'

describe('core hybridization export', () => {
  it('exposes the read-only hybridization inference without a builder barrel', () => {
    const center = newAtom('C')
    const oxygen = newAtom('O')
    const hydrogen = newAtom('H')
    const bonds = [
      newBond(center.id, oxygen.id, 2),
      newBond(center.id, hydrogen.id, 1),
    ]

    expect(inferHybridization(bonds, center.id)).toBe('sp2')
    expect(bonds[0].order).toBe(2)
  })
})
