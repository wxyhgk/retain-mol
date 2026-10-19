import { describe, expect, it } from 'vitest'
import { getFragment, type FragmentDef } from '../../fragmentLibrary'
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

  it('terminates and follows the selected ring when the aromatic graph branches', () => {
    const fragment: FragmentDef = {
      id: 'branched-ring',
      name: 'Branched ring',
      short: 'BR',
      formula: 'C7',
      group: 'ring',
      attachIndex: 0,
      attachHIndex: -1,
      attachBond: [0, 1],
      atoms: Array.from({ length: 7 }, (_, index) => ({ symbol: 'C', x: index, y: 0, z: 0 })),
      bonds: [
        { a: 0, b: 1, order: 2 },
        // This branch is intentionally listed first. The previous greedy walk
        // entered its cycle forever instead of returning to atom 0.
        { a: 1, b: 4, order: 1 },
        { a: 4, b: 5, order: 2 },
        { a: 5, b: 6, order: 1 },
        { a: 6, b: 4, order: 1 },
        { a: 1, b: 2, order: 1 },
        { a: 2, b: 3, order: 2 },
        { a: 3, b: 0, order: 1 },
      ],
    }

    const result = buildRingFuseOrderOverride(fragment, 0, 1, 1, () => false)

    expect([...result.keys()]).toEqual(['1-2', '2-3', '0-3'])
    expect(result.has('1-4')).toBe(false)
  })
})
