import { describe, expect, it } from 'vitest'
import { bondDepthStyle, projectCoordinationDirections } from './CoordinationGeometryGlyph'

describe('coordination geometry glyph projection', () => {
  it('preserves every site and sorts back-to-front', () => {
    const projected = projectCoordinationDirections([
      [1, 1, 1],
      [1, -1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
    ], 'tetrahedral')

    expect(projected).toHaveLength(4)
    expect(projected.map(site => site.depth)).toEqual(
      [...projected.map(site => site.depth)].sort((a, b) => a - b),
    )
  })

  it('uses depth to vary projected position', () => {
    const projected = projectCoordinationDirections([
      [0, 0, -1],
      [0, 0, 1],
    ], 'octahedral-d3d')

    expect(projected[0]?.x).not.toBe(projected[1]?.x)
    expect(projected[0]?.y).not.toBe(projected[1]?.y)
  })

  it('maps camera depth to hashed, plain, and solid wedge bonds', () => {
    expect(bondDepthStyle(-0.19)).toBe('back')
    expect(bondDepthStyle(0)).toBe('plane')
    expect(bondDepthStyle(0.19)).toBe('front')
  })

  it('keeps explicitly planar geometries in one depth plane', () => {
    const projected = projectCoordinationDirections([
      [1, 0, 0],
      [0, 1, 0],
      [-1, 0, 0],
      [0, -1, 0],
    ], 'square-planar')

    expect(projected.every(site => Math.abs(site.depth) < 1e-8)).toBe(true)
  })
})
