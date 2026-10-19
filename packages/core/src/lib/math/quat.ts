import type { Vec3 } from './vec3'
import { dot, length, normalize } from './vec3'

/** Quaternion in [x, y, z, w] order. */
export type Quat = [number, number, number, number]

export type EulerOrder = 'XYZ' | 'YXZ' | 'ZXY' | 'ZYX' | 'YZX' | 'XZY'

const IDENTITY_QUAT: Quat = [0, 0, 0, 1]
const OPPOSITE_VECTOR_EPSILON = 1e-6
const VECTOR_EPSILON = 1e-9

export function identityQuat(): Quat {
  return [...IDENTITY_QUAT]
}

export function normalizeQuat(q: Quat): Quat {
  const magnitude = Math.hypot(q[0], q[1], q[2], q[3])
  if (magnitude < Number.EPSILON) return identityQuat()
  return [q[0] / magnitude, q[1] / magnitude, q[2] / magnitude, q[3] / magnitude]
}

/**
 * Returns the shortest rotation from one unit direction to another.
 * Inputs are normalized defensively so callers can safely pass measured axes.
 */
export function quatFromUnitVectors(from: Vec3, to: Vec3): Quat {
  if (length(from) < VECTOR_EPSILON || length(to) < VECTOR_EPSILON) {
    return identityQuat()
  }
  const fromUnit = normalize(from)
  const toUnit = normalize(to)
  const real = dot(fromUnit, toUnit) + 1

  let x: number
  let y: number
  let z: number

  if (real < OPPOSITE_VECTOR_EPSILON) {
    // There are infinitely many 180-degree rotations. Pick a stable axis
    // perpendicular to the source direction, matching Three.js semantics.
    if (Math.abs(fromUnit[0]) > Math.abs(fromUnit[2])) {
      x = -fromUnit[1]
      y = fromUnit[0]
      z = 0
    } else {
      x = 0
      y = -fromUnit[2]
      z = fromUnit[1]
    }
  } else {
    x = fromUnit[1] * toUnit[2] - fromUnit[2] * toUnit[1]
    y = fromUnit[2] * toUnit[0] - fromUnit[0] * toUnit[2]
    z = fromUnit[0] * toUnit[1] - fromUnit[1] * toUnit[0]
  }

  return normalizeQuat([x, y, z, real])
}

export function quatFromAxisAngle(axis: Vec3, angleRadians: number): Quat {
  if (length(axis) < VECTOR_EPSILON) return identityQuat()
  const unit = normalize(axis)
  const halfAngle = angleRadians / 2
  const sine = Math.sin(halfAngle)
  return [unit[0] * sine, unit[1] * sine, unit[2] * sine, Math.cos(halfAngle)]
}

/** Creates a quaternion from intrinsic Tait-Bryan angles, in radians. */
export function quatFromEuler(
  x: number,
  y: number,
  z: number,
  order: EulerOrder = 'XYZ',
): Quat {
  const c1 = Math.cos(x / 2)
  const c2 = Math.cos(y / 2)
  const c3 = Math.cos(z / 2)
  const s1 = Math.sin(x / 2)
  const s2 = Math.sin(y / 2)
  const s3 = Math.sin(z / 2)

  switch (order) {
    case 'XYZ':
      return [
        s1 * c2 * c3 + c1 * s2 * s3,
        c1 * s2 * c3 - s1 * c2 * s3,
        c1 * c2 * s3 + s1 * s2 * c3,
        c1 * c2 * c3 - s1 * s2 * s3,
      ]
    case 'YXZ':
      return [
        s1 * c2 * c3 + c1 * s2 * s3,
        c1 * s2 * c3 - s1 * c2 * s3,
        c1 * c2 * s3 - s1 * s2 * c3,
        c1 * c2 * c3 + s1 * s2 * s3,
      ]
    case 'ZXY':
      return [
        s1 * c2 * c3 - c1 * s2 * s3,
        c1 * s2 * c3 + s1 * c2 * s3,
        c1 * c2 * s3 + s1 * s2 * c3,
        c1 * c2 * c3 - s1 * s2 * s3,
      ]
    case 'ZYX':
      return [
        s1 * c2 * c3 - c1 * s2 * s3,
        c1 * s2 * c3 + s1 * c2 * s3,
        c1 * c2 * s3 - s1 * s2 * c3,
        c1 * c2 * c3 + s1 * s2 * s3,
      ]
    case 'YZX':
      return [
        s1 * c2 * c3 + c1 * s2 * s3,
        c1 * s2 * c3 + s1 * c2 * s3,
        c1 * c2 * s3 - s1 * s2 * c3,
        c1 * c2 * c3 - s1 * s2 * s3,
      ]
    case 'XZY':
      return [
        s1 * c2 * c3 - c1 * s2 * s3,
        c1 * s2 * c3 - s1 * c2 * s3,
        c1 * c2 * s3 + s1 * s2 * c3,
        c1 * c2 * c3 + s1 * s2 * s3,
      ]
  }
}

/** Hamilton product a * b. Applying the result applies b first, then a. */
export function multiplyQuats(a: Quat, b: Quat): Quat {
  return [
    a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
    a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
    a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
    a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
  ]
}

export function applyQuat(v: Vec3, q: Quat): Vec3 {
  const [qx, qy, qz, qw] = normalizeQuat(q)
  const [x, y, z] = v

  const ix = qw * x + qy * z - qz * y
  const iy = qw * y + qz * x - qx * z
  const iz = qw * z + qx * y - qy * x
  const iw = -qx * x - qy * y - qz * z

  return [
    ix * qw + iw * -qx + iy * -qz - iz * -qy,
    iy * qw + iw * -qy + iz * -qx - ix * -qz,
    iz * qw + iw * -qz + ix * -qy - iy * -qx,
  ]
}
