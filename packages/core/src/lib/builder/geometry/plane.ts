/**
 * plane.ts — 平面草图模式的几何支持
 *  - fitPlane：点集最佳拟合平面（质心 + 协方差最小特征向量，幂迭代求解）
 *  - ringPlaneIntersection：VSEPR 候选圆环与草图平面的交点（0/1/2 个）
 */

import type { Vec3 } from '../math/vec3'
import { sub, dot, cross, normalize, length, scale, add } from '../math/vec3'

export interface SketchPlane {
  origin: Vec3
  normal: Vec3
}

/** 点集的最佳拟合平面；点数 < 3 返回 null */
export function fitPlane(points: readonly { x: number; y: number; z: number }[]): SketchPlane | null {
  const n = points.length
  if (n < 3) return null

  let cx = 0, cy = 0, cz = 0
  for (const p of points) { cx += p.x; cy += p.y; cz += p.z }
  cx /= n; cy /= n; cz /= n

  // 协方差矩阵（对称 3x3）
  let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0
  for (const p of points) {
    const dx = p.x - cx, dy = p.y - cy, dz = p.z - cz
    xx += dx*dx; xy += dx*dy; xz += dx*dz
    yy += dy*dy; yz += dy*dz; zz += dz*dz
  }

  // 法向 = C 的最小特征向量 = (trace·I − C) 的最大特征向量，幂迭代求解
  const t = xx + yy + zz
  if (t < 1e-12) return null   // 所有点重合
  const B: readonly [Vec3, Vec3, Vec3] = [
    [t - xx, -xy, -xz],
    [-xy, t - yy, -yz],
    [-xz, -yz, t - zz],
  ]
  let v: Vec3 = [0.267, 0.535, 0.802]   // 非对称初始向量，避免恰好正交于解
  for (let i = 0; i < 48; i++) {
    const w: Vec3 = [
      B[0][0]*v[0] + B[0][1]*v[1] + B[0][2]*v[2],
      B[1][0]*v[0] + B[1][1]*v[1] + B[1][2]*v[2],
      B[2][0]*v[0] + B[2][1]*v[1] + B[2][2]*v[2],
    ]
    const l = length(w)
    if (l < 1e-12) return null
    v = scale(w, 1 / l)
  }

  return { origin: [cx, cy, cz], normal: v }
}

/**
 * 圆环（圆心 c、轴 axis、半径 R）与平面的交点。
 * 解 A·cos t + B·sin t = D；无交返回 []。
 */
export function ringPlaneIntersection(
  center: Vec3,
  axis: Vec3,
  radius: number,
  plane: SketchPlane,
): Vec3[] {
  const a = normalize(axis)
  // 环面内基
  let u = cross(a, [0, 1, 0])
  if (length(u) < 1e-6) u = cross(a, [1, 0, 0])
  u = normalize(u)
  const v = normalize(cross(a, u))

  const n = normalize(plane.normal)
  const A = radius * dot(n, u)
  const B = radius * dot(n, v)
  const D = dot(n, sub(plane.origin, center))
  const amp = Math.hypot(A, B)
  if (amp < 1e-9) return []                       // 环与平面平行
  const ratio = D / amp
  if (Math.abs(ratio) > 1) return []              // 不相交

  const phi = Math.atan2(B, A)
  const dt = Math.acos(Math.max(-1, Math.min(1, ratio)))
  // 相切时只有一个交点：ratio≈+1 侧 dt≈0（phi±dt 收敛到 phi）；
  // ratio≈−1 侧 dt≈π（phi+dt 与 phi−dt 相差 2π，是同一个点），两侧都要去重
  const ts = dt < 1e-6 ? [phi]
    : Math.PI - dt < 1e-6 ? [phi + Math.PI]
    : [phi + dt, phi - dt]

  return ts.map(tAng => add(
    center,
    add(scale(u, radius * Math.cos(tAng)), scale(v, radius * Math.sin(tAng))),
  ))
}
