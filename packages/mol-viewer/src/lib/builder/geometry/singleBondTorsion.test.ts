import { describe, expect, it, vi } from 'vitest'
import type { Vec3 } from '../math/vec3'
import {
  generateSingleBondTorsionCandidates,
  rotatePointsAroundBondAxis,
  selectBestSingleBondTorsion,
  SINGLE_BOND_TORSION_ANGLES,
} from './singleBondTorsion'

function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}

function expectPointClose(actual: Vec3, expected: Vec3): void {
  expect(actual[0]).toBeCloseTo(expected[0], 10)
  expect(actual[1]).toBeCloseTo(expected[1], 10)
  expect(actual[2]).toBeCloseTo(expected[2], 10)
}

describe('rotatePointsAroundBondAxis', () => {
  it('rotates around a non-origin anchor and normalizes the bond axis', () => {
    const points: Vec3[] = [[2, 1, 0], [2, 2, 0]]
    const rotated = rotatePointsAroundBondAxis(points, [0, 0, 4], [1, 1, 0], 90)

    expectPointClose(rotated[0], [1, 2, 0])
    expectPointClose(rotated[1], [0, 2, 0])
    expect(points).toEqual([[2, 1, 0], [2, 2, 0]])
    expect(rotated[0]).not.toBe(points[0])
  })

  it('rejects a zero-length bond axis', () => {
    expect(() => rotatePointsAroundBondAxis([[1, 0, 0]], [0, 0, 0], [0, 0, 0], 90))
      .toThrow('Bond axis must have non-zero length')
  })

  it('preserves anchor distances and all internal distances', () => {
    const anchor: Vec3 = [1.2, -0.7, 2.5]
    const points: Vec3[] = [[2, 1, 0], [-1, 3, 4], [0.5, -2, 6]]
    const rotated = rotatePointsAroundBondAxis(points, [2, -3, 4], anchor, 137)

    for (let i = 0; i < points.length; i++) {
      expect(distance(rotated[i], anchor)).toBeCloseTo(distance(points[i], anchor), 10)
      for (let j = i + 1; j < points.length; j++) {
        expect(distance(rotated[i], rotated[j])).toBeCloseTo(distance(points[i], points[j]), 10)
      }
    }
  })
})

describe('generateSingleBondTorsionCandidates', () => {
  it('generates absolute candidates from 0 through 345 degrees in 15 degree steps', () => {
    const candidates = generateSingleBondTorsionCandidates([[1, 0, 0]], [0, 0, 1], [0, 0, 0])

    expect(candidates).toHaveLength(24)
    expect(candidates.map(candidate => candidate.angleDegrees)).toEqual(
      Array.from({ length: 24 }, (_, index) => index * 15),
    )
    expect(SINGLE_BOND_TORSION_ANGLES.at(-1)).toBe(345)
    expectPointClose(candidates[6].points[0], [0, 1, 0])
    expectPointClose(candidates[12].points[0], [-1, 0, 0])
  })
})

describe('selectBestSingleBondTorsion', () => {
  it('uses the injected point scorer and returns its minimum-scoring candidate', () => {
    const score = vi.fn((points: readonly Vec3[]) => distance(points[0], [0, -1, 0]))

    const best = selectBestSingleBondTorsion(
      [[1, 0, 0]],
      [0, 0, 1],
      [0, 0, 0],
      score,
    )

    expect(score).toHaveBeenCalledTimes(24)
    expect(best.angleDegrees).toBe(270)
    expect(best.score).toBeCloseTo(0, 10)
    expectPointClose(best.points[0], [0, -1, 0])
  })

  it('keeps the smaller angle when candidates have equal scores', () => {
    const best = selectBestSingleBondTorsion(
      [[1, 0, 0]],
      [0, 0, 1],
      [0, 0, 0],
      () => 1,
    )

    expect(best.angleDegrees).toBe(0)
  })
})
