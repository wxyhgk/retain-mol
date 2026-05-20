import { describe, it, expect } from 'vitest'
import { newAtom, newBond } from '../../molecule'
import { detectConjugation } from './conjugation'
import type { Molecule } from '../../molecule'

// ── 辅助：快速构造分子 ────────────────────────────────────────────────────────
function mol(atoms: ReturnType<typeof newAtom>[], bonds: ReturnType<typeof newBond>[]): Molecule {
  return { atoms, bonds }
}

// ── 杂化类型 ──────────────────────────────────────────────────────────────────

describe('杂化类型推断', () => {
  it('乙烯（C=C）：两个碳均为 sp2', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.3, 0, 0)
    const { hybridization } = detectConjugation(mol([c1, c2], [newBond(c1.id, c2.id, 2)]))
    expect(hybridization.get(c1.id)).toBe('sp2')
    expect(hybridization.get(c2.id)).toBe('sp2')
  })

  it('乙炔（C≡C）：两个碳均为 sp', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.2, 0, 0)
    const { hybridization } = detectConjugation(mol([c1, c2], [newBond(c1.id, c2.id, 3)]))
    expect(hybridization.get(c1.id)).toBe('sp')
    expect(hybridization.get(c2.id)).toBe('sp')
  })

  it('丙二烯（C=C=C）：中间碳为 sp（两个双键）', () => {
    const c1 = newAtom('C', 0,   0, 0)
    const c2 = newAtom('C', 1.3, 0, 0)
    const c3 = newAtom('C', 2.6, 0, 0)
    const { hybridization } = detectConjugation(mol(
      [c1, c2, c3],
      [newBond(c1.id, c2.id, 2), newBond(c2.id, c3.id, 2)],
    ))
    expect(hybridization.get(c2.id)).toBe('sp')
    expect(hybridization.get(c1.id)).toBe('sp2')
    expect(hybridization.get(c3.id)).toBe('sp2')
  })

  it('甲烷（CH4）：碳为 sp3', () => {
    const c = newAtom('C', 0, 0, 0)
    const hs = [newAtom('H'), newAtom('H'), newAtom('H'), newAtom('H')]
    const bonds = hs.map(h => newBond(c.id, h.id))
    const { hybridization } = detectConjugation(mol([c, ...hs], bonds))
    expect(hybridization.get(c.id)).toBe('sp3')
  })
})

// ── 共轭体系检测 ──────────────────────────────────────────────────────────────

describe('共轭体系检测', () => {
  it('乙烯（C=C）：形成一个两原子的共轭体系', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.3, 0, 0)
    const { systems, conjugatedAtoms } = detectConjugation(
      mol([c1, c2], [newBond(c1.id, c2.id, 2)])
    )
    expect(systems).toHaveLength(1)
    expect(systems[0]).toHaveLength(2)
    expect(conjugatedAtoms.has(c1.id)).toBe(true)
    expect(conjugatedAtoms.has(c2.id)).toBe(true)
  })

  it('1,3-丁二烯（C=C-C=C）：四个碳同属一个共轭体系', () => {
    const c1 = newAtom('C', 0,   0, 0)
    const c2 = newAtom('C', 1.3, 0, 0)
    const c3 = newAtom('C', 2.8, 0, 0)
    const c4 = newAtom('C', 4.1, 0, 0)
    const { systems } = detectConjugation(mol(
      [c1, c2, c3, c4],
      [newBond(c1.id, c2.id, 2), newBond(c2.id, c3.id), newBond(c3.id, c4.id, 2)],
    ))
    expect(systems).toHaveLength(1)
    expect(systems[0]).toHaveLength(4)
  })

  it('1,4-戊二烯（C=C-C-C=C）：两段独立的共轭体系（被 sp3 碳隔断）', () => {
    const c1 = newAtom('C', 0,   0, 0)
    const c2 = newAtom('C', 1.3, 0, 0)
    const c3 = newAtom('C', 2.8, 0, 0)  // sp3，隔断
    const c4 = newAtom('C', 4.1, 0, 0)
    const c5 = newAtom('C', 5.4, 0, 0)
    const { systems } = detectConjugation(mol(
      [c1, c2, c3, c4, c5],
      [
        newBond(c1.id, c2.id, 2),
        newBond(c2.id, c3.id),
        newBond(c3.id, c4.id),
        newBond(c4.id, c5.id, 2),
      ],
    ))
    expect(systems).toHaveLength(2)
    expect(systems.every(s => s.length === 2)).toBe(true)
  })

  it('孤立单键（乙烷 C-C）：无共轭体系', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.5, 0, 0)
    const { systems, conjugatedAtoms } = detectConjugation(
      mol([c1, c2], [newBond(c1.id, c2.id)])
    )
    expect(systems).toHaveLength(0)
    expect(conjugatedAtoms.size).toBe(0)
  })

  it('乙炔（C≡C）：sp-sp 形成共轭体系', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.2, 0, 0)
    const { systems } = detectConjugation(mol([c1, c2], [newBond(c1.id, c2.id, 3)]))
    expect(systems).toHaveLength(1)
  })
})

// ── 杂原子孤对电子 ────────────────────────────────────────────────────────────

describe('杂原子孤对电子参与共轭', () => {
  it('乙烯胺（C=C-N）：N 的孤对电子延伸共轭体系', () => {
    const c1 = newAtom('C', 0,   0, 0)
    const c2 = newAtom('C', 1.3, 0, 0)
    const n  = newAtom('N', 2.8, 0, 0)
    const { systems, conjugatedAtoms, hybridization } = detectConjugation(mol(
      [c1, c2, n],
      [newBond(c1.id, c2.id, 2), newBond(c2.id, n.id)],
    ))
    expect(systems).toHaveLength(1)
    expect(systems[0]).toHaveLength(3)
    expect(conjugatedAtoms.has(n.id)).toBe(true)
    expect(hybridization.get(n.id)).toBe('sp2')
  })

  it('乙烯醇（C=C-O）：O 的孤对电子延伸共轭体系', () => {
    const c1 = newAtom('C', 0,   0, 0)
    const c2 = newAtom('C', 1.3, 0, 0)
    const o  = newAtom('O', 2.8, 0, 0)
    const { systems } = detectConjugation(mol(
      [c1, c2, o],
      [newBond(c1.id, c2.id, 2), newBond(c2.id, o.id)],
    ))
    expect(systems).toHaveLength(1)
    expect(systems[0]).toHaveLength(3)
  })

  it('孤立 N（与 sp3 相邻）：不参与共轭', () => {
    const c = newAtom('C', 0, 0, 0)
    const n = newAtom('N', 1.5, 0, 0)
    const { conjugatedAtoms } = detectConjugation(mol([c, n], [newBond(c.id, n.id)]))
    expect(conjugatedAtoms.size).toBe(0)
  })
})

// ── 共轭键 ────────────────────────────────────────────────────────────────────

describe('共轭键', () => {
  it('1,3-丁二烯：中间单键也属于共轭键', () => {
    const c1 = newAtom('C', 0,   0, 0)
    const c2 = newAtom('C', 1.3, 0, 0)
    const c3 = newAtom('C', 2.8, 0, 0)
    const c4 = newAtom('C', 4.1, 0, 0)
    const b12 = newBond(c1.id, c2.id, 2)
    const b23 = newBond(c2.id, c3.id)     // 中间单键
    const b34 = newBond(c3.id, c4.id, 2)
    const { conjugatedBonds } = detectConjugation(mol([c1, c2, c3, c4], [b12, b23, b34]))
    expect(conjugatedBonds.has(b12.id)).toBe(true)
    expect(conjugatedBonds.has(b23.id)).toBe(true)  // 中间单键是共轭键
    expect(conjugatedBonds.has(b34.id)).toBe(true)
  })

  it('1,4-戊二烯：中间 sp3 碳的两侧单键不是共轭键', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.3, 0, 0)
    const c3 = newAtom('C', 2.8, 0, 0)  // sp3
    const c4 = newAtom('C', 4.1, 0, 0)
    const c5 = newAtom('C', 5.4, 0, 0)
    const b23 = newBond(c2.id, c3.id)
    const b34 = newBond(c3.id, c4.id)
    const { conjugatedBonds } = detectConjugation(mol(
      [c1, c2, c3, c4, c5],
      [newBond(c1.id, c2.id, 2), b23, b34, newBond(c4.id, c5.id, 2)],
    ))
    expect(conjugatedBonds.has(b23.id)).toBe(false)
    expect(conjugatedBonds.has(b34.id)).toBe(false)
  })
})

// ── 纯函数验证 ────────────────────────────────────────────────────────────────

describe('纯函数', () => {
  it('不修改原始分子', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.3, 0, 0)
    const m = mol([c1, c2], [newBond(c1.id, c2.id, 2)])
    const originalAtomCount = m.atoms.length
    detectConjugation(m)
    expect(m.atoms.length).toBe(originalAtomCount)
  })

  it('空分子：无共轭体系', () => {
    const { systems, conjugatedAtoms } = detectConjugation(mol([], []))
    expect(systems).toHaveLength(0)
    expect(conjugatedAtoms.size).toBe(0)
  })
})
