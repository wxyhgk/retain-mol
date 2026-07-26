/**
 * vsepr 回归测试：'free' 几何的 bondAngle=360 哨兵值
 *
 * 终端元素（H/F/Cl/Br/I）的 inferGeometry 返回 'free'，其 bondAngle=360 是
 * 「无角约束」哨兵。findNextBondDir / findSnapBondDir 曾直接取 cos360°=1，
 * 使 n=1 时新键方向与已有键完全同向——触发链：Cl 设 +1 电荷 → 价态补 H →
 * 新 H 落在 Cl→C 连线上、嵌进 C 原子内部。
 * 修复后 'free' 退回四面体角（~109.47°）。
 */
import { describe, it, expect } from 'vitest'
import { findNextBondDir, findSnapBondDir, calcAddAtomOnExisting } from './vsepr'
import type { Atom, Bond } from '../../molecule'
import type { Vec3 } from '../math/vec3'

function angleDeg(a: Vec3, b: Vec3): number {
  const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  const la = Math.hypot(...a), lb = Math.hypot(...b)
  return Math.acos(Math.max(-1, Math.min(1, dot / (la * lb)))) * 180 / Math.PI
}

describe("终端元素中心（'free' 几何）被迫再放一个键", () => {
  it('findNextBondDir：新键不与已有键同向，成四面体角', () => {
    const d = findNextBondDir('Cl', [[1, 0, 0]], 'sp3')
    expect(angleDeg(d, [1, 0, 0])).toBeCloseTo(109.47, 1)
  })

  it('findSnapBondDir：吸附方向同样成四面体角、偏向拖拽侧', () => {
    const d = findSnapBondDir('Cl', [[1, 0, 0]], 'sp3', [0, 1, 0])
    expect(angleDeg(d, [1, 0, 0])).toBeCloseTo(109.47, 1)
    expect(d[1]).toBeGreaterThan(0)   // 偏向 preferredDir 一侧
  })

  it('端到端：给 Cl–C 的 Cl 补 H，新 H 不嵌进 C 原子内部', () => {
    // CH3Cl 简化为 Cl–C；曾经新 H 落在 Cl→C 射线上距 C 仅 ~0.33Å
    const cl: Atom = { id: 'cl', symbol: 'Cl', x: 0, y: 0, z: 0 }
    const c: Atom = { id: 'c', symbol: 'C', x: 1.77, y: 0, z: 0 }
    const atoms: Atom[] = [cl, c]
    const bonds: Bond[] = [{ id: 'b1', atomId1: 'cl', atomId2: 'c', order: 1 }]

    const { position } = calcAddAtomOnExisting(cl, bonds, atoms, 'H')
    const distToC = Math.hypot(position[0] - c.x, position[1] - c.y, position[2] - c.z)
    expect(distToC).toBeGreaterThan(1.5)
  })
})
