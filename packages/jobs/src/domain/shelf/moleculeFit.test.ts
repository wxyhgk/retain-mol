import { describe, expect, it } from 'vitest'
import { fitScaleForBox, moleculeBoundingSphere } from './moleculeFit'

describe('moleculeFit', () => {
  it('gives a single atom the margin radius at its own position', () => {
    const sphere = moleculeBoundingSphere([{ x: 1, y: 2, z: 3 }])
    expect(sphere.center).toEqual({ x: 1, y: 2, z: 3 })
    expect(sphere.radius).toBeCloseTo(0.4)
  })

  it('centers a symmetric pair and spans half the distance plus margin', () => {
    const sphere = moleculeBoundingSphere([{ x: -2, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }])
    expect(sphere.center).toEqual({ x: 0, y: 0, z: 0 })
    expect(sphere.radius).toBeCloseTo(2.4)
  })

  it('handles degenerate coincident atoms and the empty list', () => {
    expect(moleculeBoundingSphere([{ x: 5, y: 5, z: 5 }, { x: 5, y: 5, z: 5 }]).radius).toBeCloseTo(0.4)
    expect(moleculeBoundingSphere([]).radius).toBeCloseTo(0.4)
  })

  it('caps upscaling for tiny molecules and shrinks large ones', () => {
    expect(fitScaleForBox(0.4, 0.95)).toBeCloseTo(1.1)
    expect(fitScaleForBox(9.5, 0.95)).toBeCloseTo(0.1)
    expect(fitScaleForBox(0, 0.95)).toBeCloseTo(1.1)
  })
})
