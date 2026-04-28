/**
 * Vec3 — 三维向量基础运算
 * 纯数学，无任何外部依赖。供 builder 其他模块内部使用。
 */

export type Vec3 = [number, number, number]

export function add(a: Vec3, b: Vec3): Vec3 { return [a[0]+b[0], a[1]+b[1], a[2]+b[2]] }
export function sub(a: Vec3, b: Vec3): Vec3 { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]] }
export function scale(v: Vec3, s: number): Vec3 { return [v[0]*s, v[1]*s, v[2]*s] }
export function dot(a: Vec3, b: Vec3): number { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2] }
export function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]
}
export function length(v: Vec3): number { return Math.sqrt(dot(v, v)) }
export function normalize(v: Vec3): Vec3 {
  const l = length(v)
  return l < 1e-9 ? [1, 0, 0] : [v[0]/l, v[1]/l, v[2]/l]
}

/** Rodrigues 旋转公式：把向量 v 绕单位轴 axis 旋转 angle 弧度 */
export function rotateAround(v: Vec3, axis: Vec3, angle: number): Vec3 {
  const cos = Math.cos(angle), sin = Math.sin(angle)
  const d = dot(axis, v)
  const c = cross(axis, v)
  return [
    v[0]*cos + c[0]*sin + axis[0]*d*(1-cos),
    v[1]*cos + c[1]*sin + axis[1]*d*(1-cos),
    v[2]*cos + c[2]*sin + axis[2]*d*(1-cos),
  ]
}

/** 两向量夹角（弧度） */
export function angleBetween(a: Vec3, b: Vec3): number {
  return Math.acos(Math.max(-1, Math.min(1, dot(normalize(a), normalize(b)))))
}
