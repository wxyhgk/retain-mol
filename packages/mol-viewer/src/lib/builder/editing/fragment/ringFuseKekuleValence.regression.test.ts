import { describe, expect, it } from 'vitest'
import type { Bond, Molecule } from '../../../molecule'
import { getFragment } from '../../fragmentLibrary'
import { placeFragmentStandalone } from './placement'
import { fuseFragmentOnBond } from './ringFuse'

/**
 * 回归：在凯库勒单键上并苯环产生五价碳（multi-agent review 2026-07-26, critical）。
 *
 * 根因：buildRingFuseOrderOverride 的交替起点只看 targetBondOrder —— 目标是
 * 单键就把紧邻共享原子的新键硬赋为双键，无视共享原子在旧环里已有的双键；
 * 三道防线（validateRingFuseSharedValence 硬编码 +1、最终检查只数键条数、
 * mergeCount>0 跳过校验）全部漏过。
 *
 * 修复：两个凯库勒相位都作为候选，由 remapAndMergeBonds 的最终键级和校验
 * 裁决；合并式并环（peri/bay）允许局部凯库勒重排消除超价，修不了才拒绝。
 */

const benzene = getFragment('benzene')!
const cyclohexane = getFragment('cyclohexane')!

function ccBonds(mol: Molecule): Bond[] {
  const byId = new Map(mol.atoms.map(a => [a.id, a]))
  return mol.bonds.filter(b =>
    byId.get(b.atomId1)!.symbol === 'C' && byId.get(b.atomId2)!.symbol === 'C')
}

/** 每个原子的键级和 */
function valenceSums(mol: Molecule): Map<string, number> {
  const sums = new Map<string, number>()
  for (const a of mol.atoms) sums.set(a.id, 0)
  for (const b of mol.bonds) {
    sums.set(b.atomId1, (sums.get(b.atomId1) ?? 0) + b.order)
    sums.set(b.atomId2, (sums.get(b.atomId2) ?? 0) + b.order)
  }
  return sums
}

function carbonSums(mol: Molecule): number[] {
  const sums = valenceSums(mol)
  return mol.atoms.filter(a => a.symbol === 'C').map(a => sums.get(a.id) ?? 0)
}

function heavyDeg(mol: Molecule, id: string): number {
  const byId = new Map(mol.atoms.map(a => [a.id, a]))
  return mol.bonds.filter(x => {
    const o = x.atomId1 === id ? x.atomId2 : x.atomId2 === id ? x.atomId1 : null
    return o !== null && byId.get(o)!.symbol !== 'H'
  }).length
}

function makeBenzene(): Molecule {
  return placeFragmentStandalone({ atoms: [], bonds: [] }, benzene, { x: 0, y: 0, z: 0 })
}

function makeNaphthalene(): Molecule {
  const mol = makeBenzene()
  const r = fuseFragmentOnBond(mol, benzene, ccBonds(mol)[0]!.id)
  if (!r.ok) throw new Error('naphthalene build failed')
  return r.molecule
}

describe('凯库勒单键并环不再产生五价碳', () => {
  it('苯环并到苯环的每条凯库勒单键 → 萘，所有 C 键级和恒为 4', () => {
    const mol = makeBenzene()
    const singles = ccBonds(mol).filter(b => b.order === 1)
    expect(singles.length).toBe(3)
    for (const b of singles) {
      const r = fuseFragmentOnBond(mol, benzene, b.id)
      expect(r.ok).toBe(true)
      if (!r.ok) continue
      expect(r.molecule.atoms.filter(a => a.symbol === 'C')).toHaveLength(10)
      // 修复前：两个桥头碳键级和为 5（两双键 + 一单键）
      expect(carbonSums(r.molecule).every(s => s === 4)).toBe(true)
    }
  })

  it('双键对照组不回归：苯环并到双键 → 萘，所有 C 键级和恒为 4', () => {
    const mol = makeBenzene()
    const doubles = ccBonds(mol).filter(b => b.order === 2)
    expect(doubles.length).toBe(3)
    for (const b of doubles) {
      const r = fuseFragmentOnBond(mol, benzene, b.id)
      expect(r.ok).toBe(true)
      if (!r.ok) continue
      expect(carbonSums(r.molecule).every(s => s === 4)).toBe(true)
    }
  })

  it('萘的 6 条单键逐一并环：外侧单键全 4；桥头旁（peri 合并）无超价、至多一个奇电子位', () => {
    const nap = makeNaphthalene()
    const singles = ccBonds(nap).filter(b => b.order === 1)
    expect(singles.length).toBe(6)
    for (const b of singles) {
      const r = fuseFragmentOnBond(nap, benzene, b.id)
      expect(r.ok).toBe(true)
      if (!r.ok) continue
      const sums = carbonSums(r.molecule)
      // 核心不变量：不得出现五价碳（修复前每次并环产生 2~3 个）
      expect(sums.every(s => s <= 4)).toBe(true)
      const isOuter = heavyDeg(nap, b.atomId1) === 2 && heavyDeg(nap, b.atomId2) === 2
      if (isOuter) {
        // 外侧干净并环：全部恰好为 4
        expect(sums.every(s => s === 4)).toBe(true)
      } else {
        // peri 合并 → 非那烯基骨架 C13H9：奇氢数下全 4 数学上不可能，
        // 允许恰好一个键级和为 3 的自由基位，但绝不允许超价
        const under = sums.filter(s => s < 4)
        expect(under).toEqual([3])
      }
    }
  })

  it('苯环并到环己烷 C-C 单键：共享 sp3 碳不超价（修复前产生 2 个五价碳）', () => {
    const mol = placeFragmentStandalone({ atoms: [], bonds: [] }, cyclohexane, { x: 0, y: 0, z: 0 })
    const r = fuseFragmentOnBond(mol, benzene, ccBonds(mol)[0]!.id)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(carbonSums(r.molecule).every(s => s === 4)).toBe(true)
  })

  it('稠环共享键（两端都是桥头碳）干净拒绝，不产出坏分子', () => {
    const nap = makeNaphthalene()
    const shared = ccBonds(nap).find(b => heavyDeg(nap, b.atomId1) === 3 && heavyDeg(nap, b.atomId2) === 3)!
    const r = fuseFragmentOnBond(nap, benzene, shared.id)
    expect(r.ok).toBe(false)
  })

  it('peri/bay 拼芘路径不回归：菲 bay 双原子合并 → C16H10 且所有 C 键级和恒为 4', () => {
    const nap = makeNaphthalene()
    let pyreneChecked = false
    for (const b1 of ccBonds(nap)) {
      const r1 = fuseFragmentOnBond(nap, benzene, b1.id)
      if (!r1.ok || r1.molecule.atoms.filter(a => a.symbol === 'C').length !== 14) continue
      for (const b2 of ccBonds(r1.molecule)) {
        const r2 = fuseFragmentOnBond(r1.molecule, benzene, b2.id)
        if (!r2.ok) continue
        const c = r2.molecule.atoms.filter(a => a.symbol === 'C').length
        const h = r2.molecule.atoms.filter(a => a.symbol === 'H').length
        if (c !== 16 || h !== 10) continue
        // 修复前：拼出的芘带 4 个五价碳
        expect(carbonSums(r2.molecule).every(s => s === 4)).toBe(true)
        pyreneChecked = true
      }
      if (pyreneChecked) break
    }
    expect(pyreneChecked).toBe(true)
  })
})
