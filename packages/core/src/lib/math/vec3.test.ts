import { describe, expect, it } from 'vitest'
import { add, distance, normalize, scale, sub } from './vec3'

describe('Vec3', () => {
  it('adds, subtracts, and scales vectors without mutating the inputs', () => {
    const a: [number, number, number] = [1, -2, 3]
    const b: [number, number, number] = [4, 5, -6]

    expect(add(a, b)).toEqual([5, 3, -3])
    expect(sub(a, b)).toEqual([-3, -7, 9])
    expect(scale(a, -2)).toEqual([-2, 4, -6])
    expect(a).toEqual([1, -2, 3])
    expect(b).toEqual([4, 5, -6])
  })

  it('normalizes non-zero vectors and provides a stable zero-vector fallback', () => {
    expect(normalize([3, 0, 4])).toEqual([0.6, 0, 0.8])
    expect(normalize([0, 0, 0])).toEqual([1, 0, 0])
  })

  it('computes Euclidean distance', () => {
    expect(distance([1, 2, 3], [4, 6, 3])).toBe(5)
  })
})
