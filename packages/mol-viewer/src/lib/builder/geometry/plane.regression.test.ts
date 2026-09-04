/**
 * ringPlaneIntersection 回归测试：ratio≈−1 相切侧的去重
 *
 * 解 A·cos t + B·sin t = D 时 dt=acos(ratio)。旧代码只对 dt<1e-6（ratio≈+1）
 * 做单点去重；ratio≈−1 时 dt≈π，phi+dt 与 phi−dt 相差 2π 是同一个切点，
 * 却按两个交点返回，消费方（生长参考 ghost 槽位）会画出两个完全重叠的点。
 */
import { describe, it, expect } from 'vitest'
import { ringPlaneIntersection } from './plane'
import type { Vec3 } from '../math/vec3'

const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

describe('ringPlaneIntersection 相切去重', () => {
  const center: Vec3 = [0, 0, 0]
  const axis: Vec3 = [0, 0, 1]

  it('ratio = −1 侧相切：只返回一个交点', () => {
    // 单位圆（xy 平面）与 x=−1 平面相切于 (−1,0,0)
    const pts = ringPlaneIntersection(center, axis, 1, { origin: [-1, 0, 0], normal: [1, 0, 0] })
    expect(pts).toHaveLength(1)
    expect(dist(pts[0]!, [-1, 0, 0])).toBeLessThan(1e-9)
  })

  it('ratio = +1 侧相切：仍只返回一个交点（原有行为不回归）', () => {
    const pts = ringPlaneIntersection(center, axis, 1, { origin: [1, 0, 0], normal: [1, 0, 0] })
    expect(pts).toHaveLength(1)
    expect(dist(pts[0]!, [1, 0, 0])).toBeLessThan(1e-9)
  })

  it('正割：返回两个不重合的交点', () => {
    const pts = ringPlaneIntersection(center, axis, 1, { origin: [0, 0, 0], normal: [1, 0, 0] })
    expect(pts).toHaveLength(2)
    expect(dist(pts[0]!, pts[1]!)).toBeGreaterThan(1.9)   // (0,±1,0)
  })
})
