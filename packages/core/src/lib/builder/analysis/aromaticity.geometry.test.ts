import { describe, it, expect } from 'vitest'
import { newAtom, newBond } from '../../molecule'
import type { Atom, Bond } from '../../molecule'
import { detectAromaticity } from './aromaticity'

describe('geometric aromaticity（键长驱动的芳香判据）', () => {
  /** 生成平面正六边形 C6 环，每个 C 挂一个径向 H */
  function makeHexRing(ccLen: number) {
    const atoms: Atom[] = []
    const bonds: Bond[] = []
    const R = ccLen / (2 * Math.sin(Math.PI / 6))  // 外接圆半径 = 边长（六边形）
    const cs: Atom[] = []
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI / 3) * i
      const c = newAtom('C', R * Math.cos(ang), R * Math.sin(ang), 0)
      cs.push(c); atoms.push(c)
      const h = newAtom('H', (R + 1.09) * Math.cos(ang), (R + 1.09) * Math.sin(ang), 0)
      atoms.push(h)
      bonds.push(newBond(c.id, h.id))
    }
    for (let i = 0; i < 6; i++) bonds.push(newBond(cs[i].id, cs[(i + 1) % 6].id, 1))
    return { atoms, bonds }
  }

  it('1.39 Å 均匀六元碳环（全单键键级）→ 芳香', () => {
    const mol = makeHexRing(1.39)
    const result = detectAromaticity(mol)
    expect(result.aromaticRings.length).toBe(1)
    expect(result.aromaticAtoms.size).toBe(6)
  })

  it('1.54 Å 六元碳环（环己烷骨架长度）→ 非芳香', () => {
    const mol = makeHexRing(1.54)
    const result = detectAromaticity(mol)
    expect(result.aromaticRings.length).toBe(0)
  })
})
