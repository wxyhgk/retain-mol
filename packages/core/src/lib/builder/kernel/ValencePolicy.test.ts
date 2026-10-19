import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../molecule'
import { GraphIndex } from './GraphIndex'
import { ValencePolicy } from './ValencePolicy'

describe('ValencePolicy', () => {
  it('keeps hydrogen target separate from hard bond capacity', () => {
    const sulfur = newAtom('S')
    const policy = new ValencePolicy(new GraphIndex({ atoms: [sulfur], bonds: [] }))

    expect(policy.hydrogenTarget(sulfur)).toBe(2)
    expect(policy.max(sulfur)).toBe(6)
  })

  it('rejects duplicate bonds and saturated atoms through one policy entry', () => {
    const c = newAtom('C')
    const h = newAtom('H')
    const other = newAtom('C')
    const ch = newBond(c.id, h.id)
    const policy = new ValencePolicy(new GraphIndex({ atoms: [c, h, other], bonds: [ch] }))

    expect(policy.canAddBond(c, h).ok).toBe(false)
    expect(policy.canAddBond(h, other).ok).toBe(false)
  })

  it('counts aromatic bonds as 1.5 valence units', () => {
    const c1 = newAtom('C')
    const c2 = newAtom('C')
    const c3 = newAtom('C')
    const aromatic12 = { ...newBond(c1.id, c2.id), aromatic: true as const }
    const aromatic13 = { ...newBond(c1.id, c3.id), aromatic: true as const }
    const policy = new ValencePolicy(new GraphIndex({
      atoms: [c1, c2, c3],
      bonds: [aromatic12, aromatic13],
    }))

    expect(policy.used(c1.id)).toBe(3)
    expect(policy.availableForBond(c1)).toBe(1)
  })
})
