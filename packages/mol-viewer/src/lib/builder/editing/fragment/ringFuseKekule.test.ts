import { describe, expect, it } from 'vitest'
import { getFragment } from '../../fragmentLibrary'
import { buildRingFuseOrderOverride } from './ringFuseKekule'

const benzene = getFragment('benzene')!

describe('buildRingFuseOrderOverride', () => {
  it('alternates new ring bond order opposite to the target shared bond', () => {
    const [f1i, f2i] = benzene.attachBond!
    const isH = (index: number) => benzene.atoms[index].symbol === 'H'

    const fromSingle = buildRingFuseOrderOverride(benzene, f1i, f2i, 1, isH)
    const fromDouble = buildRingFuseOrderOverride(benzene, f1i, f2i, 2, isH)

    expect(fromSingle.size).toBeGreaterThan(0)
    expect(fromDouble.size).toBe(fromSingle.size)
    const firstKey = [...fromSingle.keys()][0]
    expect(fromSingle.get(firstKey)).toBe(2)
    expect(fromDouble.get(firstKey)).toBe(1)
  })
})
