/**
 * geometry.config 回归测试
 *
 * 1) STANDARD_BOND_LENGTHS 曾有 6 个 key（'N-H'/'O-H'/'S-H'/'P-H'/'Si-H'/'C-Br'）
 *    违反表注释的字母序约定：查表点先 [a,b].sort() 再拼 key，这些条目永远查不中，
 *    静默退化成共价半径估算（O–H 1.1232 而非 0.96，偏长 17%）。
 *    全表断言字母序约定，防止再犯。
 *
 * 2) inferGeometry 的超价磷分支曾写成 connectionCount >= 4，
 *    把普通四配位磷（磷酸根/磷酸酯/鏻盐）判成 octahedral（90°），
 *    松弛器据此生成几何上不可满足的 1-3 约束，把正确的四面体压坏且永不收敛。
 */
import { describe, it, expect } from 'vitest'
import { STANDARD_BOND_LENGTHS, lookupBondLengthByOrder, inferGeometry } from './geometry.config'

describe('STANDARD_BOND_LENGTHS key 字母序约定', () => {
  it('全表 key 都满足 [a,b].sort() 顺序（与查表点一致），否则该条目永远查不中', () => {
    for (const key of Object.keys(STANDARD_BOND_LENGTHS)) {
      const parts = key.split(/[-=#]/)
      expect(parts, `key "${key}" 应形如 A-B / A=B / A#B`).toHaveLength(2)
      const sorted = [...parts].sort()
      expect(parts, `key "${key}" 违反字母序约定，应写成 "${sorted.join(key.includes('=') ? '=' : key.includes('#') ? '#' : '-')}"`)
        .toEqual(sorted)
    }
  })

  it('曾经 miss 的五个 X–H 键长现在命中表值（而非共价半径估算）', () => {
    expect(lookupBondLengthByOrder('O', 'H', 1)).toBeCloseTo(0.96, 5)
    expect(lookupBondLengthByOrder('N', 'H', 1)).toBeCloseTo(1.01, 5)
    expect(lookupBondLengthByOrder('S', 'H', 1)).toBeCloseTo(1.34, 5)
    expect(lookupBondLengthByOrder('P', 'H', 1)).toBeCloseTo(1.42, 5)
    expect(lookupBondLengthByOrder('Si', 'H', 1)).toBeCloseTo(1.48, 5)
    // 参数顺序无关
    expect(lookupBondLengthByOrder('H', 'O', 1)).toBeCloseTo(0.96, 5)
  })

  it("同根因的 'C-Br'（'Br' 字典序在 'C' 前）也命中表值", () => {
    expect(lookupBondLengthByOrder('C', 'Br', 1)).toBeCloseTo(1.94, 5)
    expect(lookupBondLengthByOrder('Br', 'C', 1)).toBeCloseTo(1.94, 5)
  })
})

describe('inferGeometry 磷配位数语义', () => {
  it('四配位磷（磷酸根/鏻盐，connectionCount=4）是四面体，不是八面体', () => {
    expect(inferGeometry('P', 4, 'sp3')).toBe('tetrahedral')
  })

  it('真超价磷（connectionCount >= 5）仍走 octahedral', () => {
    expect(inferGeometry('P', 5, 'sp3')).toBe('octahedral')
    expect(inferGeometry('P', 6, 'sp3')).toBe('octahedral')
  })
})
