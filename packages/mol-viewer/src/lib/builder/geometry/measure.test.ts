import { describe, it, expect } from 'vitest'
import { newAtom } from '../../molecule'
import { measureAngle, measureDihedral, measureDistance } from './measure'

const ANGLE_TOL = 0.5

describe('measureDistance', () => {
  it('两点距离：勾股定理', () => {
    const a = newAtom('C', 0, 0, 0)
    const b = newAtom('C', 3, 4, 0)
    expect(measureDistance(a, b)).toBeCloseTo(5, 5)
  })

  it('同一点距离为 0', () => {
    const a = newAtom('C', 1, 2, 3)
    expect(measureDistance(a, a)).toBeCloseTo(0, 5)
  })
})

describe('measureAngle', () => {
  it('直线排列：键角 180°', () => {
    const a = newAtom('C', -1, 0, 0)
    const b = newAtom('C',  0, 0, 0)
    const c = newAtom('C',  1, 0, 0)
    expect(measureAngle(a, b, c)).toBeCloseTo(180, ANGLE_TOL)
  })

  it('直角：键角 90°', () => {
    const a = newAtom('C', 1, 0, 0)
    const b = newAtom('C', 0, 0, 0)
    const c = newAtom('C', 0, 1, 0)
    expect(measureAngle(a, b, c)).toBeCloseTo(90, ANGLE_TOL)
  })

  it('水分子 H-O-H 键角约 104.5°', () => {
    const o = newAtom('O',  0.000,  0.000, 0.000)
    const h1 = newAtom('H',  0.757,  0.586, 0.000)
    const h2 = newAtom('H', -0.757,  0.586, 0.000)
    expect(measureAngle(h1, o, h2)).toBeCloseTo(104.5, 1)
  })
})

describe('measureDihedral', () => {
  it('共面（二面角 0°）', () => {
    const a = newAtom('C', 0, 1, 0)
    const b = newAtom('C', 0, 0, 0)
    const c = newAtom('C', 1, 0, 0)
    const d = newAtom('C', 1, 1, 0)
    expect(Math.abs(measureDihedral(a, b, c, d))).toBeCloseTo(0, ANGLE_TOL)
  })

  it('90° 二面角', () => {
    const a = newAtom('C', 0, 1, 0)
    const b = newAtom('C', 0, 0, 0)
    const c = newAtom('C', 1, 0, 0)
    const d = newAtom('C', 1, 0, 1)
    expect(Math.abs(measureDihedral(a, b, c, d))).toBeCloseTo(90, ANGLE_TOL)
  })
})

// ─────────────────────────────────────────────────────────
// canBond — 更多边界情况
// ─────────────────────────────────────────────────────────
