import { describe, it, expect } from 'vitest'
import { newAtom } from '@retainmol/mol-viewer'
import { calcFormula, calcMW } from './useMoleculeInfo'

describe('calcFormula', () => {
  it('空分子返回 —', () => {
    expect(calcFormula([])).toBe('—')
  })

  it('Hill 顺序：C 最先，H 其次，其余字母序', () => {
    // 甲醇 CH3OH = 1C + 4H + 1O
    const atoms = [
      newAtom('C'),
      newAtom('H'), newAtom('H'), newAtom('H'), newAtom('H'),
      newAtom('O'),
    ]
    expect(calcFormula(atoms)).toBe('CH4O')
  })

  it('单个原子不加数字', () => {
    expect(calcFormula([newAtom('C')])).toBe('C')
  })

  it('多个相同原子加数字', () => {
    const atoms = [newAtom('C'), newAtom('C'), newAtom('C')]
    expect(calcFormula(atoms)).toBe('C3')
  })

  it('苯 C6H6', () => {
    const atoms = Array.from({ length: 6 }, () => newAtom('C'))
      .concat(Array.from({ length: 6 }, () => newAtom('H')))
    expect(calcFormula(atoms)).toBe('C6H6')
  })
})

describe('calcMW', () => {
  it('空分子分子量为 0', () => {
    expect(calcMW([])).toBe(0)
  })

  it('单个碳原子约 12.011', () => {
    expect(calcMW([newAtom('C')])).toBeCloseTo(12.011, 3)
  })

  it('水 H2O ≈ 18.015', () => {
    const atoms = [newAtom('O'), newAtom('H'), newAtom('H')]
    expect(calcMW(atoms)).toBeCloseTo(18.015, 2)
  })

  it('甲烷 CH4 ≈ 16.043', () => {
    const atoms = [
      newAtom('C'),
      newAtom('H'), newAtom('H'), newAtom('H'), newAtom('H'),
    ]
    expect(calcMW(atoms)).toBeCloseTo(16.043, 2)
  })
})
