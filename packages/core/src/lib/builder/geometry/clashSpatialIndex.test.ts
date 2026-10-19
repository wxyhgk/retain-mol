import { describe, expect, it } from 'vitest'
import { newAtom } from '../../molecule'
import { scoreClashes } from './clash'
import { ClashSpatialIndex, type ClashQueryStats } from './clashSpatialIndex'

describe('ClashSpatialIndex', () => {
  it('matches brute-force overlap scoring', () => {
    const atoms = [
      newAtom('C', 0, 0, 0),
      newAtom('O', 1, 0, 0),
      newAtom('H', 8, 8, 8),
    ]
    const candidates = [
      { symbol: 'N', x: 0.25, y: 0, z: 0 },
      { symbol: 'H', x: 20, y: 20, z: 20 },
    ]

    const indexed = new ClashSpatialIndex(atoms).score(candidates)
    const bruteForce = scoreClashes(candidates, atoms)

    expect(indexed.overlapPenalty).toBeCloseTo(bruteForce.overlapPenalty, 12)
    expect(indexed.minClearance).toBeCloseTo(bruteForce.minClearance, 12)
  })

  it('checks only nearby atoms in a large sparse molecule', () => {
    const atoms = Array.from({ length: 10_000 }, (_, index) => {
      const x = (index % 100) * 5
      const y = Math.floor(index / 100) * 5
      return newAtom('C', x, y, 0)
    })
    const candidates = [{ symbol: 'C', x: 0, y: 0, z: 0 }]
    const stats: ClashQueryStats = { comparedPairs: 0 }

    const indexed = new ClashSpatialIndex(atoms).score(candidates, stats)
    const bruteForce = scoreClashes(candidates, atoms)

    expect(indexed.overlapPenalty).toBeCloseTo(bruteForce.overlapPenalty, 12)
    expect(stats.comparedPairs).toBeLessThan(100)
    expect(stats.comparedPairs).toBeLessThan(atoms.length / 100)
  })
})
