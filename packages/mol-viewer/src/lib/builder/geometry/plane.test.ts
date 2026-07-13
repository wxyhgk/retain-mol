import { describe, expect, it } from 'vitest'
import { fitPlane, ringPlaneIntersection } from './plane'

describe('fitPlane', () => {
  it('fits a translated plane and returns its centroid', () => {
    const plane = fitPlane([
      { x: -1, y: -1, z: 2 },
      { x: 1, y: -1, z: 2 },
      { x: 1, y: 1, z: 2 },
      { x: -1, y: 1, z: 2 },
    ])

    expect(plane).not.toBeNull()
    expect(plane?.origin).toEqual([0, 0, 2])
    expect(Math.abs(plane?.normal[2] ?? 0)).toBeCloseTo(1, 5)
  })

  it('rejects insufficient and coincident point sets', () => {
    expect(fitPlane([{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }])).toBeNull()
    expect(fitPlane([
      { x: 1, y: 1, z: 1 },
      { x: 1, y: 1, z: 1 },
      { x: 1, y: 1, z: 1 },
    ])).toBeNull()
  })
})

describe('ringPlaneIntersection', () => {
  it('returns two points when a plane cuts through the ring', () => {
    const points = ringPlaneIntersection(
      [0, 0, 0],
      [0, 0, 1],
      2,
      { origin: [0, 0, 0], normal: [1, 0, 0] },
    )

    expect(points).toHaveLength(2)
    for (const point of points) {
      expect(point[0]).toBeCloseTo(0, 6)
      expect(Math.hypot(point[0], point[1], point[2])).toBeCloseTo(2, 6)
    }
  })

  it('returns one point for tangency and none when separated', () => {
    const tangent = ringPlaneIntersection(
      [0, 0, 0],
      [0, 0, 1],
      1,
      { origin: [1, 0, 0], normal: [1, 0, 0] },
    )
    const separated = ringPlaneIntersection(
      [0, 0, 0],
      [0, 0, 1],
      1,
      { origin: [2, 0, 0], normal: [1, 0, 0] },
    )

    expect(tangent).toHaveLength(1)
    expect(tangent[0]?.[0]).toBeCloseTo(1, 6)
    expect(separated).toEqual([])
  })
})
