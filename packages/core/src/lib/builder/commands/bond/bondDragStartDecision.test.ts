import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../../molecule'
import { resolveBondDragStartDecision } from './bondDragStartDecision'

describe('resolveBondDragStartDecision', () => {
  it('allows unsaturated heavy atoms', () => {
    const c = newAtom('C', 0, 0, 0)

    expect(resolveBondDragStartDecision({ atoms: [c], bonds: [] }, {
      sourceId: c.id,
      selectedAtomIds: new Set(),
      hasActiveFragment: false,
    })).toEqual({ kind: 'allow', sourceId: c.id, viaHydrogenSlot: false })
  })

  it('allows bonded hydrogen slots', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1, 0, 0)

    expect(resolveBondDragStartDecision({ atoms: [c, h], bonds: [newBond(c.id, h.id)] }, {
      sourceId: h.id,
      selectedAtomIds: new Set(),
      hasActiveFragment: false,
    })).toEqual({ kind: 'allow', sourceId: h.id, viaHydrogenSlot: true })
  })

  it('denies active fragment and selected source gestures before molecule checks', () => {
    const c = newAtom('C', 0, 0, 0)

    expect(resolveBondDragStartDecision({ atoms: [c], bonds: [] }, {
      sourceId: c.id,
      selectedAtomIds: new Set(),
      hasActiveFragment: true,
    })).toEqual({ kind: 'deny', reason: 'active-fragment' })
    expect(resolveBondDragStartDecision({ atoms: [c], bonds: [] }, {
      sourceId: c.id,
      selectedAtomIds: new Set([c.id]),
      hasActiveFragment: false,
    })).toEqual({ kind: 'deny', reason: 'source-selected' })
  })

  it('denies missing and saturated source atoms', () => {
    const c = newAtom('C', 0, 0, 0)
    const hydrogens = [
      newAtom('H', 1, 0, 0),
      newAtom('H', -1, 0, 0),
      newAtom('H', 0, 1, 0),
      newAtom('H', 0, -1, 0),
    ]
    const saturated = {
      atoms: [c, ...hydrogens],
      bonds: hydrogens.map(h => newBond(c.id, h.id)),
    }

    expect(resolveBondDragStartDecision({ atoms: [], bonds: [] }, {
      sourceId: 'missing',
      selectedAtomIds: new Set(),
      hasActiveFragment: false,
    })).toEqual({ kind: 'deny', reason: 'missing-source' })
    expect(resolveBondDragStartDecision(saturated, {
      sourceId: c.id,
      selectedAtomIds: new Set(),
      hasActiveFragment: false,
    })).toEqual({ kind: 'deny', reason: 'saturated-source' })
  })
})
