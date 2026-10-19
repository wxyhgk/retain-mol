import { describe, expect, it } from 'vitest'
import type { Bond, Molecule } from '../../../molecule'
import { getFragment } from '../../fragmentLibrary'
import { placeFragmentStandalone } from './placement'
import { fuseFragmentOnBond } from './ringFuse'

/**
 * 回归：sp3 环并 sp3 环几何崩坏（multi-agent review 2026-07-26, major）。
 *
 * 根因：planRingFusePlacement 只尝试端点交换 × ±axis2 四种共面镜像构型，
 * 不绕共享键滚转对齐四面体空位；保留的 H 嵌进新环（环己烷并环己烷最近
 * 非成键 H-C 仅 1.288Å，环己烷并环戊烷 0.799Å 恰好漏过 fuseClashEps=0.7）。
 *
 * 修复：共面构型间隙不足时绕共享键按固定角步长滚转采样，以新环原子与
 * 已有原子的最小间隙最大化评分选构型；所有构型都冲突则干净拒绝。
 */

const benzene = getFragment('benzene')!
const cyclohexane = getFragment('cyclohexane')!
const cyclopentane = getFragment('cyclopentane')!

function ccBonds(mol: Molecule): Bond[] {
  const byId = new Map(mol.atoms.map(a => [a.id, a]))
  return mol.bonds.filter(b =>
    byId.get(b.atomId1)!.symbol === 'C' && byId.get(b.atomId2)!.symbol === 'C')
}

/** 全部非成键原子对的最小距离 */
function minNonBondedDistance(mol: Molecule): number {
  const bonded = new Set(mol.bonds.map(b => [b.atomId1, b.atomId2].sort().join('|')))
  let best = Infinity
  for (let i = 0; i < mol.atoms.length; i += 1) {
    for (let j = i + 1; j < mol.atoms.length; j += 1) {
      const a = mol.atoms[i]!
      const b = mol.atoms[j]!
      if (bonded.has([a.id, b.id].sort().join('|'))) continue
      best = Math.min(best, Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z))
    }
  }
  return best
}

function standalone(frag: typeof cyclohexane): Molecule {
  return placeFragmentStandalone({ atoms: [], bonds: [] }, frag, { x: 0, y: 0, z: 0 })
}

describe('sp3 环并 sp3 环：滚转对齐四面体空位，H 不再嵌进新环', () => {
  it('环己烷并环己烷（十氢萘）：无非成键原子对 < 1.2Å（修复前最近 1.288Å H-C）', () => {
    const mol = standalone(cyclohexane)
    const r = fuseFragmentOnBond(mol, cyclohexane, ccBonds(mol)[0]!.id)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.molecule.atoms.filter(a => a.symbol === 'C')).toHaveLength(10)
    expect(minNonBondedDistance(r.molecule)).toBeGreaterThanOrEqual(1.2)
  })

  it('环己烷并到环戊烷键：无原子对 < 1.2Å（修复前 0.799Å，H 几乎嵌进碳）', () => {
    const mol = standalone(cyclopentane)
    const r = fuseFragmentOnBond(mol, cyclohexane, ccBonds(mol)[0]!.id)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(minNonBondedDistance(r.molecule)).toBeGreaterThanOrEqual(1.2)
  })

  it('环戊烷并环戊烷：无原子对 < 1.2Å（修复前 1.310Å H-C）', () => {
    const mol = standalone(cyclopentane)
    const r = fuseFragmentOnBond(mol, cyclopentane, ccBonds(mol)[0]!.id)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(minNonBondedDistance(r.molecule)).toBeGreaterThanOrEqual(1.2)
  })

  it('环戊烷并到环己烷键：无原子对 < 1.2Å', () => {
    const mol = standalone(cyclohexane)
    const r = fuseFragmentOnBond(mol, cyclopentane, ccBonds(mol)[0]!.id)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(minNonBondedDistance(r.molecule)).toBeGreaterThanOrEqual(1.2)
  })

  it('平面芳环并环不受滚转影响：苯并苯保持共面（新环原子仍在分子平面内）', () => {
    const mol = standalone(benzene)
    const r = fuseFragmentOnBond(mol, benzene, ccBonds(mol)[0]!.id)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    // 苯模板放平在 z=0 平面；共面并环时所有新原子 z≈0，滚转会把它抬离平面
    for (const a of r.molecule.atoms) {
      expect(Math.abs(a.z)).toBeLessThan(1e-6)
    }
  })
})
