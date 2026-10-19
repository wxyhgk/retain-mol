import { describe, expect, it } from 'vitest'
import {
  applyQuat,
  multiplyQuats,
  quatFromAxisAngle,
  quatFromEuler,
  quatFromUnitVectors,
  type EulerOrder,
  type Quat,
} from './quat'
import type { Vec3 } from './vec3'

function expectVecClose(actual: Vec3, expected: Vec3): void {
  expected.forEach((value, index) => expect(actual[index]).toBeCloseTo(value, 10))
}

describe('Quat', () => {
  it('rotates between parallel, perpendicular, and opposite unit vectors', () => {
    expectVecClose(applyQuat([1, 0, 0], quatFromUnitVectors([1, 0, 0], [1, 0, 0])), [1, 0, 0])
    expectVecClose(applyQuat([1, 0, 0], quatFromUnitVectors([1, 0, 0], [0, 1, 0])), [0, 1, 0])
    expectVecClose(applyQuat([1, 0, 0], quatFromUnitVectors([1, 0, 0], [-1, 0, 0])), [-1, 0, 0])
    expectVecClose(applyQuat([2, 3, 4], quatFromUnitVectors([0, 0, 0], [1, 0, 0])), [2, 3, 4])
  })

  it('creates an axis-angle rotation and applies it to a vector', () => {
    const quarterTurn = quatFromAxisAngle([0, 0, 2], Math.PI / 2)
    expectVecClose(applyQuat([1, 0, 0], quarterTurn), [0, 1, 0])
  })

  it('creates Euler rotations with XYZ as the default order', () => {
    expectVecClose(applyQuat([0, 1, 0], quatFromEuler(Math.PI / 2, 0, 0)), [0, 0, 1])
    expectVecClose(applyQuat([1, 0, 0], quatFromEuler(0, 0, Math.PI / 2)), [0, 1, 0])
  })

  it('supports all Euler orders with the same composition convention', () => {
    const angles: Record<'X' | 'Y' | 'Z', number> = { X: 0.31, Y: -0.47, Z: 0.83 }
    const axis: Record<'X' | 'Y' | 'Z', Vec3> = {
      X: [1, 0, 0],
      Y: [0, 1, 0],
      Z: [0, 0, 1],
    }
    const orders: EulerOrder[] = ['XYZ', 'YXZ', 'ZXY', 'ZYX', 'YZX', 'XZY']

    for (const order of orders) {
      let composed: Quat = [0, 0, 0, 1]
      for (const component of order) {
        composed = multiplyQuats(
          composed,
          quatFromAxisAngle(axis[component], angles[component]),
        )
      }
      const fromEuler = quatFromEuler(angles.X, angles.Y, angles.Z, order)
      expectVecClose(applyQuat([0.2, -0.5, 1.7], fromEuler), applyQuat([0.2, -0.5, 1.7], composed))
    }
  })

  it('multiplies rotations in documented application order', () => {
    const rotateX = quatFromAxisAngle([1, 0, 0], Math.PI / 2)
    const rotateZ = quatFromAxisAngle([0, 0, 1], Math.PI / 2)
    const combined = multiplyQuats(rotateZ, rotateX)

    expectVecClose(applyQuat([0, 1, 0], combined), [0, 0, 1])
  })
})
