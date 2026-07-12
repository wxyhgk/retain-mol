import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../../molecule'
import { resolveBondSelectedAtomsDecision } from './selectedAtomBondDecision'

describe('resolveBondSelectedAtomsDecision', () => {
  it('requires exactly two selected atoms', () => {
    const c = newAtom('C', 0, 0, 0)

    expect(resolveBondSelectedAtomsDecision({ atoms: [c], bonds: [] }, {
      atomIds: [c.id],
    })).toEqual({ kind: 'error', reason: '请先选中恰好两个原子' })
  })

  it('rejects missing atoms', () => {
    const c = newAtom('C', 0, 0, 0)

    expect(resolveBondSelectedAtomsDecision({ atoms: [c], bonds: [] }, {
      atomIds: [c.id, 'missing'],
    })).toEqual({ kind: 'error', reason: '原子不存在' })
  })

  it('adds a normal bond between two non-slot atoms', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1, 0, 0)

    expect(resolveBondSelectedAtomsDecision({ atoms: [c1, c2], bonds: [] }, {
      atomIds: [c1.id, c2.id],
    })).toEqual({ kind: 'addBond', atomId1: c1.id, atomId2: c2.id })
  })

  it('uses a bonded hydrogen slot as the source to replace', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1, 0, 0)
    const c2 = newAtom('C', 2, 0, 0)

    expect(resolveBondSelectedAtomsDecision({ atoms: [c1, h, c2], bonds: [newBond(c1.id, h.id)] }, {
      atomIds: [c2.id, h.id],
    })).toEqual({ kind: 'bondViaHydrogen', sourceHId: h.id, targetId: c2.id })
  })
})
