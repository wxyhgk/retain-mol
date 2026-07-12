import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../../molecule'
import { validateRingFuseSharedValence } from './ringFuseRules'

describe('validateRingFuseSharedValence', () => {
  it('uses bond valence instead of degree for a saturated shared endpoint', () => {
    const center = newAtom('C')
    const doubleNeighbor = newAtom('C', 1.3)
    const singleA = newAtom('C', -1.3)
    const singleB = newAtom('C', 0, 1.3)
    const molecule = {
      atoms: [center, doubleNeighbor, singleA, singleB],
      bonds: [
        newBond(center.id, doubleNeighbor.id, 2),
        newBond(center.id, singleA.id, 1),
        newBond(center.id, singleB.id, 1),
      ],
    }

    expect(validateRingFuseSharedValence(molecule, [center])).toContain('已饱和')
  })

  it('allows replacing a removable hydrogen with the new ring bond', () => {
    const center = newAtom('C')
    const neighbors = [newAtom('C', 1), newAtom('C', -1), newAtom('C', 0, 1)]
    const hydrogen = newAtom('H', 0, -1)
    const molecule = {
      atoms: [center, ...neighbors, hydrogen],
      bonds: [...neighbors.map(atom => newBond(center.id, atom.id)), newBond(center.id, hydrogen.id)],
    }

    expect(validateRingFuseSharedValence(molecule, [center])).toBeNull()
  })
})
