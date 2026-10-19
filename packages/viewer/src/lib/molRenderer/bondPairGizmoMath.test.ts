import { describe, expect, it } from 'vitest'
import {
  applyBondPairGizmoDelta,
  applyGizmoAngleModifiers,
  clampAxisAngleDegrees,
  unwrapAngleDegrees,
} from './bondPairGizmoMath'

describe('bondPairGizmoMath', () => {
  it('unwraps repeatedly across the ±180° seam without jumps', () => {
    let continuous = 170
    for (const wrapped of [179, -179, -170, -90, 0, 90, 179, -179]) {
      const next = unwrapAngleDegrees(continuous, wrapped)
      expect(Math.abs(next - continuous)).toBeLessThan(100)
      continuous = next
    }
    expect(continuous).toBeCloseTo(541, 10)
  })

  it('snaps Shift to 5° and applies Alt fine adjustment', () => {
    expect(applyGizmoAngleModifiers(12.4, { shiftKey: true, altKey: false })).toBe(10)
    expect(applyGizmoAngleModifiers(27, { shiftKey: true, altKey: true })).toBe(5)
    expect(applyGizmoAngleModifiers(25, { shiftKey: false, altKey: true })).toBe(5)
  })

  it('clamps θ while leaving φ continuous beyond one revolution', () => {
    expect(clampAxisAngleDegrees(-20)).toBe(0.5)
    expect(clampAxisAngleDegrees(200)).toBe(179.5)
    const start = {
      distance: 2,
      axisAngleDegrees: 90,
      azimuthDegrees: 350,
      coplanar: false as const,
    }
    expect(applyBondPairGizmoDelta(start, 'azimuth', 30).azimuthDegrees).toBe(380)
    expect(applyBondPairGizmoDelta(start, 'axis-angle', 200).axisAngleDegrees).toBe(179.5)
  })
})
