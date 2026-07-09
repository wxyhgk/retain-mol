import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../molecule'
import { resolveBondDragEndDecision } from './bondDragDecision'

describe('resolveBondDragEndDecision', () => {
  it('rejects a missing source atom', () => {
    expect(resolveBondDragEndDecision({ atoms: [], bonds: [] }, {
      sourceId: 'missing',
      targetId: null,
      dropLocal: null,
      activeElement: 'C',
    })).toEqual({ kind: 'error', reason: '源原子不存在' })
  })

  it('adds a normal bond when dragging to an existing heavy atom', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1, 0, 0)

    expect(resolveBondDragEndDecision({ atoms: [c1, c2], bonds: [] }, {
      sourceId: c1.id,
      targetId: c2.id,
      dropLocal: null,
      activeElement: 'C',
    })).toEqual({ kind: 'addBond', atomId1: c1.id, atomId2: c2.id })
  })

  it('uses bonded hydrogen slots as bond replacement handles', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1, 0, 0)
    const c2 = newAtom('C', 2, 0, 0)

    expect(resolveBondDragEndDecision({ atoms: [c1, h, c2], bonds: [newBond(c1.id, h.id)] }, {
      sourceId: h.id,
      targetId: c2.id,
      dropLocal: null,
      activeElement: 'C',
    })).toEqual({ kind: 'bondViaHydrogen', sourceHId: h.id, targetId: c2.id })
  })

  it('grows from a bonded hydrogen when dropping to empty space', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1, 0, 0)

    expect(resolveBondDragEndDecision({ atoms: [c, h], bonds: [newBond(c.id, h.id)] }, {
      sourceId: h.id,
      targetId: null,
      dropLocal: { x: 2, y: 0, z: 0 },
      activeElement: 'N',
    })).toEqual({ kind: 'growFromHydrogen', atomId: h.id, element: 'N' })
  })

  it('plans a grow-to-empty command from a heavy atom', () => {
    const c = newAtom('C', 0, 0, 0)

    expect(resolveBondDragEndDecision({ atoms: [c], bonds: [] }, {
      sourceId: c.id,
      targetId: null,
      dropLocal: { x: 1, y: 2, z: 3 },
      activeElement: 'O',
    })).toEqual({
      kind: 'growToEmpty',
      sourceId: c.id,
      element: 'O',
      position: { x: 1, y: 2, z: 3 },
    })
  })

  it('does nothing when the drag has no target and no drop position', () => {
    const c = newAtom('C', 0, 0, 0)

    expect(resolveBondDragEndDecision({ atoms: [c], bonds: [] }, {
      sourceId: c.id,
      targetId: null,
      dropLocal: null,
      activeElement: 'C',
    })).toEqual({ kind: 'noop' })
  })
})
