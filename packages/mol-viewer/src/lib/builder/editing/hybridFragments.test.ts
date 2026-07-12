import { describe, it, expect } from 'vitest'
import { placeFragmentStandalone, attachFragmentToAtom, placeHybridPrototype } from './fragment'
import { getFragment } from '../fragmentLibrary'
import { newAtom } from '../../molecule'
import type { Molecule } from '../../molecule'

const methyl    = getFragment('c-sp3')!   // –C 四面体，放空白 = CH4（attachOrder 1）
const carbonyl  = getFragment('o-sp2')!   // =O   attachOrder 2
const methylene = getFragment('c-sp2')!   // =C   attachOrder 2（=CH₂）
const ethynyl   = getFragment('c-sp')!    // ≡C   attachOrder 3（≡CH）
const imineN    = getFragment('n-sp2')!   // =N   attachOrder 2

const place = (frag = methyl): Molecule =>
  placeFragmentStandalone({ atoms: [], bonds: [] }, frag, { x: 0, y: 0, z: 0 })

const firstH = (mol: Molecule) => mol.atoms.find(a => a.symbol === 'H')!.id

function bondBetween(mol: Molecule, s1: string, s2: string) {
  const byId = new Map(mol.atoms.map(a => [a.id, a]))
  return mol.bonds.find(b => {
    const a = byId.get(b.atomId1)!.symbol, c = byId.get(b.atomId2)!.symbol
    return (a === s1 && c === s2) || (a === s2 && c === s1)
  })
}
function neighborsOfSymbol(mol: Molecule, id: string, sym: string) {
  const byId = new Map(mol.atoms.map(a => [a.id, a]))
  return mol.bonds.filter(b => {
    const other = b.atomId1 === id ? b.atomId2 : b.atomId2 === id ? b.atomId1 : null
    return other !== null && byId.get(other)!.symbol === sym
  }).length
}

describe('杂化片段 attachOrder（GaussView 式双/三键接桩）', () => {
  it('羰基 =O 接到碳上 → C=O 双键（order 2），O 不带 H', () => {
    const methane = place()
    const r = attachFragmentToAtom(methane, carbonyl, firstH(methane))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(counts(r.molecule)).toEqual({ C: 1, O: 1, H: 2 })  // CH2O，而不是 CH3=O
    expect(bondBetween(r.molecule, 'C', 'O')?.order).toBe(2)
    const oId = r.molecule.atoms.find(a => a.symbol === 'O')!.id
    expect(neighborsOfSymbol(r.molecule, oId, 'H')).toBe(0)   // 羰基氧无 H
  })

  it('亚甲基 =CH₂ 接碳 → C=C 双键，新碳带 2 个 H', () => {
    const methane = place()
    const r = attachFragmentToAtom(methane, methylene, firstH(methane))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const cc = bondBetween(r.molecule, 'C', 'C')
    expect(cc?.order).toBe(2)
    expect(counts(r.molecule)).toEqual({ C: 2, H: 4 })  // H2C=CH2
    // 新加入的碳（=CH₂ 的中心）带 2 个 H
    const newC = r.molecule.atoms.filter(a => a.symbol === 'C')
      .map(a => a.id).find(id => neighborsOfSymbol(r.molecule, id, 'H') === 2)
    expect(newC).toBeDefined()
  })

  it('炔基 ≡CH 接碳 → C≡C 三键', () => {
    const methane = place()
    const r = attachFragmentToAtom(methane, ethynyl, firstH(methane))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(bondBetween(r.molecule, 'C', 'C')?.order).toBe(3)
    expect(counts(r.molecule)).toEqual({ C: 2, H: 2 })  // HC≡CH
  })

  it('现有单键片段（甲基）attachOrder 默认 1 → 所有 C–C 仍是单键（零行为变化）', () => {
    const methane = place()
    const r = attachFragmentToAtom(methane, methyl, firstH(methane))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const byId = new Map(r.molecule.atoms.map(a => [a.id, a]))
    const cc = r.molecule.bonds.filter(b =>
      byId.get(b.atomId1)!.symbol === 'C' && byId.get(b.atomId2)!.symbol === 'C')
    expect(cc.length).toBe(1)
    expect(cc.every(b => b.order === 1)).toBe(true)
  })

  it('片段接枝时默认滚转姿态被占住，会绕连接轴避碰', () => {
    const methane = place()
    const sourceH = firstH(methane)
    const baseline = attachFragmentToAtom(methane, methyl, sourceH)
    expect(baseline.ok).toBe(true)
    if (!baseline.ok) return

    const originalIds = new Set(methane.atoms.map(a => a.id))
    const baselineNewH = baseline.molecule.atoms.find(a => !originalIds.has(a.id) && a.symbol === 'H')!
    const blocker = newAtom('C', baselineNewH.x, baselineNewH.y, baselineNewH.z)
    const blockedMol = { ...methane, atoms: [...methane.atoms, blocker] }

    const result = attachFragmentToAtom(blockedMol, methyl, sourceH)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const blockedIds = new Set(blockedMol.atoms.map(a => a.id))
    const added = result.molecule.atoms.filter(a => !blockedIds.has(a.id))
    const minDistance = Math.min(...added.map(a =>
      Math.hypot(a.x - blocker.x, a.y - blocker.y, a.z - blocker.z),
    ))
    expect(minDistance).toBeGreaterThan(0.5)
  })
})

const empty: Molecule = { atoms: [], bonds: [] }
const counts = (mol: Molecule) => {
  const c: Record<string, number> = {}
  for (const a of mol.atoms) c[a.symbol] = (c[a.symbol] ?? 0) + 1
  return c
}

describe('杂化桩放空白 → 最小完整原型（placeHybridPrototype）', () => {
  it('=C 放空白 → 乙烯 H₂C=CH₂（2C 4H，C=C 双键）', () => {
    const mol = placeHybridPrototype(empty, methylene, methylene, { x: 0, y: 0, z: 0 })
    expect(counts(mol)).toEqual({ C: 2, H: 4 })
    expect(bondBetween(mol, 'C', 'C')?.order).toBe(2)
  })

  it('≡C 放空白 → 乙炔 HC≡CH（2C 2H，C≡C 三键）', () => {
    const mol = placeHybridPrototype(empty, ethynyl, ethynyl, { x: 0, y: 0, z: 0 })
    expect(counts(mol)).toEqual({ C: 2, H: 2 })
    expect(bondBetween(mol, 'C', 'C')?.order).toBe(3)
  })

  it('=O 放空白 → 甲醛 H₂C=O（1C 1O 2H，C=O 双键，O 无 H）', () => {
    const mol = placeHybridPrototype(empty, carbonyl, methylene, { x: 0, y: 0, z: 0 })
    expect(counts(mol)).toEqual({ C: 1, O: 1, H: 2 })
    expect(bondBetween(mol, 'C', 'O')?.order).toBe(2)
    const oId = mol.atoms.find(a => a.symbol === 'O')!.id
    expect(neighborsOfSymbol(mol, oId, 'H')).toBe(0)
  })

  it('=N 放空白 → 甲亚胺 H₂C=NH（1C 1N 3H，C=N 双键，N 带 1 H）', () => {
    const mol = placeHybridPrototype(empty, imineN, methylene, { x: 0, y: 0, z: 0 })
    expect(counts(mol)).toEqual({ C: 1, N: 1, H: 3 })
    expect(bondBetween(mol, 'C', 'N')?.order).toBe(2)
    const nId = mol.atoms.find(a => a.symbol === 'N')!.id
    expect(neighborsOfSymbol(mol, nId, 'H')).toBe(1)
  })

  // 几何：sp 必线性、sp2 必平面（回归 —— 曾因走 VSEPR 把乙炔接成弯的）
  it('≡C 乙炔严格线性 —— 全部 4 个原子共线（H–C≡C–H）', () => {
    const mol = placeHybridPrototype(empty, ethynyl, ethynyl, { x: 0, y: 0, z: 0 })
    // 无 viewDir 时片段留在 x 轴上：所有原子 y≈0、z≈0
    for (const a of mol.atoms) {
      expect(Math.abs(a.y)).toBeLessThan(1e-6)
      expect(Math.abs(a.z)).toBeLessThan(1e-6)
    }
  })

  it('=C 乙烯严格平面 —— 全部 6 个原子共面（z≈0）', () => {
    const mol = placeHybridPrototype(empty, methylene, methylene, { x: 0, y: 0, z: 0 })
    expect(mol.atoms.length).toBe(6)
    for (const a of mol.atoms) expect(Math.abs(a.z)).toBeLessThan(1e-6)
  })
})
