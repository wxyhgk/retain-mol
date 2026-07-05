import { describe, it, expect } from 'vitest'
import { placeFragmentStandalone, fuseFragmentOnBond } from './fragmentOps'
import { getFragment } from '../../../config/fragments.config'
import type { Molecule, Bond } from '../../molecule'

const benzene = getFragment('benzene')!

function counts(mol: Molecule) {
  return {
    C: mol.atoms.filter(a => a.symbol === 'C').length,
    H: mol.atoms.filter(a => a.symbol === 'H').length,
    bonds: mol.bonds.length,
  }
}

/** 所有 C–C 键 */
function ccBonds(mol: Molecule): Bond[] {
  const byId = new Map(mol.atoms.map(a => [a.id, a]))
  return mol.bonds.filter(b =>
    byId.get(b.atomId1)!.symbol === 'C' && byId.get(b.atomId2)!.symbol === 'C')
}

/** 重原子连接数 */
function heavyDeg(mol: Molecule, id: string): number {
  const byId = new Map(mol.atoms.map(a => [a.id, a]))
  return mol.bonds.filter(x => {
    const o = x.atomId1 === id ? x.atomId2 : x.atomId2 === id ? x.atomId1 : null
    return o !== null && byId.get(o)!.symbol !== 'H'
  }).length
}

function makeNaphthalene(): Molecule {
  const mol: Molecule = placeFragmentStandalone(
    { atoms: [], bonds: [] }, benzene, { x: 0, y: 0, z: 0 })
  const r = fuseFragmentOnBond(mol, benzene, ccBonds(mol)[0].id)
  if (!r.ok) throw new Error('naphthalene build failed')
  return r.molecule
}

describe('连续并环（Ketcher 式铺环系，自动探索相邻原子合并）', () => {
  it('苯 → 萘：C10H8', () => {
    const mol = makeNaphthalene()
    expect(counts(mol)).toEqual({ C: 10, H: 8, bonds: 19 })  // 11 CC + 8 CH
  })

  it('萘的每条键并第三个环：外侧键 → 蒽/菲 C14H10；桥头旁键 → peri 稠合 C13H9；共享键拒绝', () => {
    const mol = makeNaphthalene()
    let outer = 0, periFused = 0
    for (const b of ccBonds(mol)) {
      const d1 = heavyDeg(mol, b.atomId1), d2 = heavyDeg(mol, b.atomId2)
      const r = fuseFragmentOnBond(mol, benzene, b.id)
      if (d1 === 3 && d2 === 3) {
        expect(r.ok).toBe(false)   // 稠环共享键：两侧都退化/被占
        continue
      }
      expect(r.ok).toBe(true)
      if (!r.ok) continue
      const c = counts(r.molecule)
      if (d1 === 2 && d2 === 2) {
        // 外侧键：干净并环 → 蒽/菲
        expect([c.C, c.H]).toEqual([14, 10])
        outer++
      } else {
        // 桥头旁的键（用户"红键"场景）：新环自动与相邻环的 α 碳合并
        // → peri 稠合三环（非那烯基骨架 C13H9）
        expect([c.C, c.H]).toEqual([13, 9])
        periFused++
      }
      for (const a of r.molecule.atoms) {
        expect(isFinite(a.x) && isFinite(a.y) && isFinite(a.z)).toBe(true)
      }
    }
    expect(outer).toBe(6)
    expect(periFused).toBe(4)
  })

  it('菲的凹区（bay）并环双原子合并 → 芘 C16H10', () => {
    // 萘 → 在外侧 1,2-键并环得到菲/蒽（都记 C14H10），逐个键尝试找出能拼出芘的
    const nap = makeNaphthalene()
    let pyreneFound = false
    for (const b1 of ccBonds(nap)) {
      const r1 = fuseFragmentOnBond(nap, benzene, b1.id)
      if (!r1.ok || counts(r1.molecule).C !== 14) continue
      const three = r1.molecule
      for (const b2 of ccBonds(three)) {
        const r2 = fuseFragmentOnBond(three, benzene, b2.id)
        if (!r2.ok) continue
        const c = counts(r2.molecule)
        if (c.C === 16 && c.H === 10) {
          // 芘：19 CC + 10 CH = 29 键
          expect(c.bonds).toBe(29)
          pyreneFound = true
        }
      }
      if (pyreneFound) break
    }
    expect(pyreneFound).toBe(true)
  })
})
