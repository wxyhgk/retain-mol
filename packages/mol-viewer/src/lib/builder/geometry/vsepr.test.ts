import { describe, it, expect } from 'vitest'
import { newAtom, newBond } from '../../molecule'
import { calcAddAtomOnExisting, calcBondLength, findNextBondDir } from './vsepr'

const ANGLE_TOL = 0.5
const DIST_TOL = 0.01

function deg(rad: number) { return rad * (180 / Math.PI) }
function angleBetween(d1: [number,number,number], d2: [number,number,number]) {
  const dot = d1[0]*d2[0] + d1[1]*d2[1] + d1[2]*d2[2]
  return deg(Math.acos(Math.max(-1, Math.min(1, dot))))
}
function vecLen(v: [number,number,number]) {
  return Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2)
}

describe('calcBondLength', () => {
  it('C-H 键长约 1.09 Å（标准表）', () => {
    expect(calcBondLength('C', 'H')).toBeCloseTo(1.09, 2)
  })

  it('C-C 键长约 1.54 Å', () => {
    expect(calcBondLength('C', 'C')).toBeCloseTo(1.54, 2)
  })

  it('参数顺序不影响结果', () => {
    expect(calcBondLength('C', 'N')).toBeCloseTo(calcBondLength('N', 'C'), 5)
  })

  it('未知元素回退到共价半径之和', () => {
    const len = calcBondLength('Xe', 'C')
    expect(len).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────
// findNextBondDir — 四面体键角验证
// ─────────────────────────────────────────────────────────

describe('findNextBondDir', () => {
  it('n=0：返回单位向量', () => {
    const d = findNextBondDir('C', [])
    expect(vecLen(d)).toBeCloseTo(1, 5)
  })

  it('n=1：与已有键成 109.47°（sp3 碳）', () => {
    const existing: [number,number,number] = [1, 0, 0]
    const next = findNextBondDir('C', [existing])
    expect(vecLen(next)).toBeCloseTo(1, 5)
    expect(angleBetween(existing, next)).toBeCloseTo(109.47, ANGLE_TOL)
  })

  it('n=1：垂直于 Y 轴的键也满足四面体角', () => {
    const existing: [number,number,number] = [0, 1, 0]
    const next = findNextBondDir('C', [existing])
    expect(angleBetween(existing, next)).toBeCloseTo(109.47, ANGLE_TOL)
  })

  it('n=2：第三个键与前两个均成 109.47°', () => {
    const d1: [number,number,number] = [1, 0, 0]
    const d2 = findNextBondDir('C', [d1])   // 第二个键方向
    const d3 = findNextBondDir('C', [d1, d2])

    expect(vecLen(d3)).toBeCloseTo(1, 5)
    expect(angleBetween(d1, d3)).toBeCloseTo(109.47, ANGLE_TOL)
    expect(angleBetween(d2, d3)).toBeCloseTo(109.47, ANGLE_TOL)
  })

  it('n=3：第四个键完成正四面体，与其余三个均成 109.47°', () => {
    const d1: [number,number,number] = [1, 0, 0]
    const d2 = findNextBondDir('C', [d1])
    const d3 = findNextBondDir('C', [d1, d2])
    const d4 = findNextBondDir('C', [d1, d2, d3])

    expect(vecLen(d4)).toBeCloseTo(1, 5)
    expect(angleBetween(d1, d4)).toBeCloseTo(109.47, ANGLE_TOL)
    expect(angleBetween(d2, d4)).toBeCloseTo(109.47, ANGLE_TOL)
    expect(angleBetween(d3, d4)).toBeCloseTo(109.47, ANGLE_TOL)
  })

  it('氮（sp3）键角约 107°', () => {
    const existing: [number,number,number] = [1, 0, 0]
    const next = findNextBondDir('N', [existing])
    expect(angleBetween(existing, next)).toBeCloseTo(107, 1)
  })
})

// ─────────────────────────────────────────────────────────
// calcAddAtomOnExisting
// ─────────────────────────────────────────────────────────

describe('calcAddAtomOnExisting', () => {
  it('在空碳上加 H：键长约 1.09 Å', () => {
    const c = newAtom('C', 0, 0, 0)
    const result = calcAddAtomOnExisting(c, [], [c], 'H')
    const dx = result.position[0] - c.x
    const dy = result.position[1] - c.y
    const dz = result.position[2] - c.z
    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz)
    expect(dist).toBeCloseTo(1.09, DIST_TOL)
  })

  it('剩余槽位数计算正确', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)
    const bond = newBond(c.id, h.id)
    const result = calcAddAtomOnExisting(c, [bond], [c, h], 'H')
    expect(result.availableSlots).toBe(3)  // C 还有 3 个槽
  })

  it('新原子位置不与中心原子重叠', () => {
    const c = newAtom('C', 0, 0, 0)
    const result = calcAddAtomOnExisting(c, [], [c], 'C')
    const [x, y, z] = result.position
    const dist = Math.sqrt(x*x + y*y + z*z)
    expect(dist).toBeGreaterThan(0.5)
  })

  it('默认 VSEPR 方向被已有原子占住时，选择同一候选环上的避碰方向', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)
    const bond = newBond(c.id, h.id)
    const defaultDir = findNextBondDir('C', [[1, 0, 0]])
    const blocker = newAtom('C', defaultDir[0] * 1.09, defaultDir[1] * 1.09, defaultDir[2] * 1.09)

    const result = calcAddAtomOnExisting(c, [bond], [c, h, blocker], 'H')
    const distToBlocker = Math.hypot(
      result.position[0] - blocker.x,
      result.position[1] - blocker.y,
      result.position[2] - blocker.z,
    )

    expect(distToBlocker).toBeGreaterThan(0.7)
  })
})

// ─────────────────────────────────────────────────────────
// canBond
// ─────────────────────────────────────────────────────────
