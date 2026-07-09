import { describe, it, expect } from 'vitest'
import { newAtom, newBond } from '../molecule'
import type { Atom } from '../molecule'
import { effectiveMaxBonds } from '../../config/elements.config'
import { autoAddHydrogens, resaturateAtom } from './editing/atomOps'
import { canBond } from './editing/bondOps'

describe('电荷/自由基对有效价态与补氢的影响', () => {
  it('effectiveMaxBonds 中性时严格等于 maxBonds', () => {
    expect(effectiveMaxBonds('C', 0, 0)).toBe(4)
    expect(effectiveMaxBonds('N', 0, 0)).toBe(3)
    expect(effectiveMaxBonds('O', 0, 0)).toBe(2)
  })

  it('孤对元素：N⁺→4、N⁻→2、O⁺→3、O⁻→1', () => {
    expect(effectiveMaxBonds('N', 1)).toBe(4)   // 铵
    expect(effectiveMaxBonds('N', -1)).toBe(2)  // 氨基负离子
    expect(effectiveMaxBonds('O', 1)).toBe(3)   // 水合氢
    expect(effectiveMaxBonds('O', -1)).toBe(1)  // 羟基负离子
  })

  it('缺电子/无余电子元素：C 带任意电荷或自由基都是 3', () => {
    expect(effectiveMaxBonds('C', 1)).toBe(3)   // 碳正
    expect(effectiveMaxBonds('C', -1)).toBe(3)  // 碳负
    expect(effectiveMaxBonds('C', 0, 1)).toBe(3) // 碳自由基
  })

  it('resaturateAtom：NH₃ 设 +1 → 长出第 4 个 H（NH₄⁺）', () => {
    const n = newAtom('N', 0, 0, 0)
    const withH = autoAddHydrogens({ atoms: [n], bonds: [] })
    expect(withH.atoms.filter(a => a.symbol === 'H')).toHaveLength(3)
    const charged = {
      ...withH,
      atoms: withH.atoms.map(a => a.id === n.id ? { ...a, charge: 1 } : a),
    }
    const result = resaturateAtom(charged, n.id)
    expect(result.atoms.filter(a => a.symbol === 'H')).toHaveLength(4)
  })

  it('resaturateAtom：H₂O 设 −1 → 掉一个 H（OH⁻）', () => {
    const o = newAtom('O', 0, 0, 0)
    const water = autoAddHydrogens({ atoms: [o], bonds: [] })
    expect(water.atoms.filter(a => a.symbol === 'H')).toHaveLength(2)
    const charged = {
      ...water,
      atoms: water.atoms.map(a => a.id === o.id ? { ...a, charge: -1 } : a),
    }
    const result = resaturateAtom(charged, o.id)
    expect(result.atoms.filter(a => a.symbol === 'H')).toHaveLength(1)
    // 剩余 O–H 键不悬空
    expect(result.bonds).toHaveLength(1)
  })

  it('带电原子的 canBond 用有效价态：N⁺ 已 3 键仍可再成键', () => {
    const n = newAtom('N', 0, 0, 0)
    const nCharged: Atom = { ...n, charge: 1 }
    const c1 = newAtom('C', 1.5, 0, 0), c2 = newAtom('C', -1.5, 0, 0), c3 = newAtom('C', 0, 1.5, 0), c4 = newAtom('C', 0, -1.5, 0)
    const bonds = [newBond(n.id, c1.id), newBond(n.id, c2.id), newBond(n.id, c3.id)]
    // 中性 N 3 键已满，N⁺ 允许第 4 键
    expect(canBond(n, c4, bonds).ok).toBe(false)
    expect(canBond(nCharged, c4, bonds).ok).toBe(true)
  })
})
