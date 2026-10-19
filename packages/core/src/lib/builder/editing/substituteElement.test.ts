import { describe, it, expect } from 'vitest'
import { substituteAtomElement, autoAddHydrogens } from './atomOps'
import { newAtom, newBond, type Molecule } from '../../molecule'
import { SAMPLE_MOLECULES } from '../../samples'

const counts = (mol: Molecule) => {
  const c: Record<string, number> = {}
  for (const a of mol.atoms) c[a.symbol] = (c[a.symbol] ?? 0) + 1
  return c
}
const bondOrderBetween = (mol: Molecule, s1: string, s2: string) => {
  const by = new Map(mol.atoms.map(a => [a.id, a]))
  return mol.bonds.find(b => {
    const a = by.get(b.atomId1)!.symbol, c = by.get(b.atomId2)!.symbol
    return (a === s1 && c === s2) || (a === s2 && c === s1)
  })?.order
}

describe('substituteAtomElement —— 纯元素替换，不按价态增删 H', () => {
  it('饱和 CH₄ 的 C 换 N 只改元素，保留 4 个显式 H', () => {
    const c = newAtom('C', 0, 0, 0)
    const methane = autoAddHydrogens({ atoms: [c], bonds: [] })  // CH₄
    expect(counts(methane)).toEqual({ C: 1, H: 4 })
    const r = substituteAtomElement(methane, c.id, 'N')
    expect(counts(r)).toEqual({ N: 1, H: 4 })
  })

  it('链中 CH₃ 换 O 只改元素，保留原有所有显式 H 和 C–O 键', () => {
    const c1 = newAtom('C', 0, 0, 0), c2 = newAtom('C', 1.54, 0, 0)
    const ethane = autoAddHydrogens({ atoms: [c1, c2], bonds: [newBond(c1.id, c2.id, 1)] })
    expect(counts(ethane)).toEqual({ C: 2, H: 6 })   // 乙烷
    const r = substituteAtomElement(ethane, c1.id, 'O')
    expect(counts(r)).toEqual({ C: 1, O: 1, H: 6 })
    expect(bondOrderBetween(r, 'C', 'O')).toBe(1)     // C–O 键保留
  })

  it('重原子连接数超过常规价态也允许替换，异常留给检查器提示', () => {
    const center = newAtom('C', 0, 0, 0)
    const arms = [newAtom('C', 1, 0, 0), newAtom('C', -1, 0, 0), newAtom('C', 0, 1, 0), newAtom('C', 0, -1, 0)]
    const neopentane = autoAddHydrogens({ atoms: [center, ...arms], bonds: arms.map(a => newBond(center.id, a.id, 1)) })
    const r = substituteAtomElement(neopentane, center.id, 'O')
    expect(r.atoms.find(a => a.id === center.id)?.symbol).toBe('O')
    expect(r.bonds).toHaveLength(neopentane.bonds.length)
  })

  it('裸双键骨架换元素不自动补 H，便于继续搭单双键结构', () => {
    const c1 = newAtom('C', 0, 0, 0), c2 = newAtom('C', 1.34, 0, 0)
    const skeleton: Molecule = { atoms: [c1, c2], bonds: [newBond(c1.id, c2.id, 2)] }
    const r = substituteAtomElement(skeleton, c1.id, 'N')
    expect(counts(r)).toEqual({ N: 1, C: 1 })
    expect(r.bonds).toHaveLength(1)
    expect(bondOrderBetween(r, 'N', 'C')).toBe(2)
  })

  it('裸凯库勒六元环换杂原子不自动补 H，避免手搭苯环时被补氢打断', () => {
    const atoms = Array.from({ length: 6 }, (_, i) => {
      const angle = i * Math.PI / 3
      return newAtom('C', Math.cos(angle), Math.sin(angle), 0)
    })
    const ring: Molecule = {
      atoms,
      bonds: atoms.map((a, i) => newBond(a.id, atoms[(i + 1) % 6].id, i % 2 === 0 ? 2 : 1)),
    }
    const r = substituteAtomElement(ring, atoms[0].id, 'N')
    expect(counts(r)).toEqual({ N: 1, C: 5 })
    expect(r.bonds).toHaveLength(6)
  })

  it('模板苯的 C 换 N 只改元素，不删除该位点 H', () => {
    const benzene = SAMPLE_MOLECULES.find(s => s.name.startsWith('苯'))!.mol()
    const target = benzene.atoms.find(a => a.symbol === 'C')!
    const r = substituteAtomElement(benzene, target.id, 'N')
    expect(counts(r)).toEqual({ C: 5, H: 6, N: 1 })
    expect(r.bonds.filter(b => b.aromatic)).toHaveLength(6)
  })

  it('替换 H 原子只改这个 H，不额外补氢生长基团', () => {
    const c = newAtom('C', 0, 0, 0)
    const methane = autoAddHydrogens({ atoms: [c], bonds: [] })
    const h = methane.atoms.find(a => a.symbol === 'H')!
    const r = substituteAtomElement(methane, h.id, 'N')
    expect(counts(r)).toEqual({ C: 1, H: 3, N: 1 })
    expect(r.atoms.find(a => a.id === h.id)?.symbol).toBe('N')
  })

  it('同元素 → 无操作（原样返回）', () => {
    const c = newAtom('C', 0, 0, 0)
    const methane = autoAddHydrogens({ atoms: [c], bonds: [] })
    expect(substituteAtomElement(methane, c.id, 'C')).toBe(methane)
  })
})
