/**
 * measure.ts — 几何测量
 * 距离、键角、二面角的纯函数计算。
 */

import type { Atom } from '../../molecule'
import { sub, dot, cross, length, normalize } from '../math/vec3'
import type { Vec3 } from '../math/vec3'

/** 两原子间距（Å） */
export function calcDistance(a1: Atom, a2: Atom): number {
  const d = sub([a2.x, a2.y, a2.z], [a1.x, a1.y, a1.z])
  return length(d)
}

/** 以 a2 为顶点的键角（度） */
export function calcAngle(a1: Atom, a2: Atom, a3: Atom): number {
  const v1 = normalize(sub([a1.x, a1.y, a1.z], [a2.x, a2.y, a2.z]))
  const v2 = normalize(sub([a3.x, a3.y, a3.z], [a2.x, a2.y, a2.z]))
  return Math.acos(Math.max(-1, Math.min(1, dot(v1, v2)))) * (180 / Math.PI)
}

/** a1-a2-a3-a4 的二面角（度，-180~180） */
export function calcDihedral(a1: Atom, a2: Atom, a3: Atom, a4: Atom): number {
  const b1 = sub([a2.x, a2.y, a2.z], [a1.x, a1.y, a1.z])
  const b2 = sub([a3.x, a3.y, a3.z], [a2.x, a2.y, a2.z])
  const b3 = sub([a4.x, a4.y, a4.z], [a3.x, a3.y, a3.z])
  const n1 = cross(b1, b2)
  const n2 = cross(b2, b3)
  const m1 = cross(n1, normalize(b2))
  return Math.atan2(dot(m1 as Vec3, n2), dot(n1, n2)) * (180 / Math.PI)
}

// 别名（向后兼容）
export const measureDistance = calcDistance
export const measureAngle    = (a: Atom, center: Atom, b: Atom) => calcAngle(a, center, b)
export const measureDihedral = calcDihedral
