import type { Vec3 } from './vec3'

/** Row-major 3x3 matrix. */
export type Mat3 = [
  number, number, number,
  number, number, number,
  number, number, number,
]

/** Right-handed orthonormal basis, represented by its x/y/z column axes. */
export type OrthonormalBasis = readonly [Vec3, Vec3, Vec3]

export function mat3FromColumns(xAxis: Vec3, yAxis: Vec3, zAxis: Vec3): Mat3 {
  return [
    xAxis[0], yAxis[0], zAxis[0],
    xAxis[1], yAxis[1], zAxis[1],
    xAxis[2], yAxis[2], zAxis[2],
  ]
}

export function transposeMat3(m: Mat3): Mat3 {
  return [
    m[0], m[3], m[6],
    m[1], m[4], m[7],
    m[2], m[5], m[8],
  ]
}

export function multiplyMat3(a: Mat3, b: Mat3): Mat3 {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
    a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
    a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
    a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
    a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
    a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
  ]
}

export function applyMat3(v: Vec3, m: Mat3): Vec3 {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ]
}

/**
 * Builds the rotation that maps coordinates expressed in source basis into
 * the corresponding target-basis directions: R = target * source transpose.
 */
export function rotationBetweenOrthonormalBases(
  source: OrthonormalBasis,
  target: OrthonormalBasis,
): Mat3 {
  const sourceMatrix = mat3FromColumns(...source)
  const targetMatrix = mat3FromColumns(...target)
  return multiplyMat3(targetMatrix, transposeMat3(sourceMatrix))
}
