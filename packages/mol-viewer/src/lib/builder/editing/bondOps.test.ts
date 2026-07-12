import { describe, it, expect } from 'vitest'
import { newAtom, newBond } from '../../molecule'
import type { Atom, Bond } from '../../molecule'
import { calcDistance } from '../geometry/measure'
import { autoAddHydrogens } from './atomOps'
import { bondByReplacingH, canBond, cycleBondLength } from './bondOps'

const DIST_TOL = 0.01

describe('canBond', () => {
  it('两个空原子可以成键', () => {
    const c1 = newAtom('C')
    const c2 = newAtom('C')
    expect(canBond(c1, c2, []).ok).toBe(true)
  })

  it('已存在键时不允许重复成键', () => {
    const c1 = newAtom('C')
    const c2 = newAtom('C')
    const bond = newBond(c1.id, c2.id)
    const result = canBond(c1, c2, [bond])
    expect(result.ok).toBe(false)
    expect(result.reason).toContain('已存在')
  })

  it('H 已有 1 个键时不能再成键', () => {
    const h = newAtom('H')
    const c = newAtom('C')
    const other = newAtom('C')
    const existingBond = newBond(h.id, c.id)
    const result = canBond(h, other, [existingBond])
    expect(result.ok).toBe(false)
    expect(result.reason).toContain('最大键数')
  })

  it('C 最多 4 键，第 5 个应拒绝', () => {
    const c = newAtom('C')
    const neighbors = [
      newAtom('H'), newAtom('H'), newAtom('H'), newAtom('H'),
    ]
    const bonds: Bond[] = neighbors.map(h => newBond(c.id, h.id))
    const extra = newAtom('H')
    const result = canBond(c, extra, bonds)
    expect(result.ok).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────
// 测量函数
// ─────────────────────────────────────────────────────────

describe('canBond 边界情况', () => {
  it('惰性气体（He maxBonds=0）不能成键', () => {
    const he = newAtom('He')
    const c  = newAtom('C')
    expect(canBond(he, c, []).ok).toBe(false)
  })

  it('同一原子不能与自身成键', () => {
    const c = newAtom('C')
    // 同一 id 视为重复键
    const selfBond = newBond(c.id, c.id)
    expect(canBond(c, c, [selfBond]).ok).toBe(false)
  })

  it('error message 包含原子符号', () => {
    const h = newAtom('H')
    const c1 = newAtom('C')
    const c2 = newAtom('C')
    const bond = newBond(h.id, c1.id)
    const result = canBond(h, c2, [bond])
    expect(result.reason).toContain('H')
  })
})

// ─────────────────────────────────────────────────────────
// autoAddHydrogens
// ─────────────────────────────────────────────────────────

describe('bondByReplacingH', () => {
  /** 断言分子里没有引用已删原子的悬空键 */
  function expectNoDanglingBonds(mol: { atoms: readonly Atom[]; bonds: readonly Bond[] }) {
    const ids = new Set(mol.atoms.map(a => a.id))
    for (const b of mol.bonds) {
      expect(ids.has(b.atomId1)).toBe(true)
      expect(ids.has(b.atomId2)).toBe(true)
    }
  }

  it('目标是多键桥氢（乙硼烷式）：删除它触及的所有键，不留悬空键', () => {
    // inferBonds 按距离推键，桥氢可以同时连两个 B
    const b1 = newAtom('B', 0, 0, 0)
    const b2 = newAtom('B', 1.78, 0, 0)
    const bridgeH = newAtom('H', 0.89, 1.0, 0)
    const c = newAtom('C', -2, 0, 0)
    const srcH = newAtom('H', -3.09, 0, 0)
    const mol = {
      atoms: [b1, b2, bridgeH, c, srcH],
      bonds: [
        newBond(b1.id, b2.id),
        newBond(b1.id, bridgeH.id),
        newBond(b2.id, bridgeH.id),   // 桥氢的第二条键
        newBond(c.id, srcH.id),
      ],
    }
    const result = bondByReplacingH(mol, srcH.id, bridgeH.id)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expectNoDanglingBonds(result.molecule)
    // 父原子（C 与桥氢的第一条键的父 B1）之间成了新键
    expect(result.molecule.bonds.some(
      b => (b.atomId1 === c.id && b.atomId2 === b1.id) ||
           (b.atomId1 === b1.id && b.atomId2 === c.id))).toBe(true)
  })

  it('源是多键桥氢、目标是重原子：同样清掉源 H 的所有键', () => {
    const b1 = newAtom('B', 0, 0, 0)
    const b2 = newAtom('B', 1.78, 0, 0)
    const bridgeH = newAtom('H', 0.89, 1.0, 0)
    const c = newAtom('C', -2, 0, 0)
    const mol = {
      atoms: [b1, b2, bridgeH, c],
      bonds: [
        newBond(b1.id, b2.id),
        newBond(b1.id, bridgeH.id),
        newBond(b2.id, bridgeH.id),
      ],
    }
    const result = bondByReplacingH(mol, bridgeH.id, c.id)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expectNoDanglingBonds(result.molecule)
  })
})

describe('cycleBondLength', () => {
  // C-C 单键骨架（乙烷去 H，仅拓扑）+ 各挂一个 H
  function makeEthaneSkeleton() {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.54, 0, 0)
    const h1 = newAtom('H', -1.09, 0, 0)
    const h2 = newAtom('H', 1.54 + 1.09, 0, 0)
    return {
      atoms: [c1, c2, h1, h2],
      bonds: [newBond(c1.id, c2.id, 1), newBond(c1.id, h1.id), newBond(c2.id, h2.id)],
      ids: { c1: c1.id, c2: c2.id, h2: h2.id },
    }
  }

  it('非环键：循环到双键时平移一侧到标准 C=C 键长，键级跟随', () => {
    const { atoms, bonds, ids } = makeEthaneSkeleton()
    const ccBond = bonds[0]
    const result = cycleBondLength({ atoms, bonds }, ccBond.id)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.order).toBe(2)
    expect(result.moved).toBe(true)
    const m = result.molecule
    const c1 = m.atoms.find(a => a.id === ids.c1)!
    const c2 = m.atoms.find(a => a.id === ids.c2)!
    const d = Math.hypot(c1.x - c2.x, c1.y - c2.y, c1.z - c2.z)
    expect(Math.abs(d - 1.34)).toBeLessThan(DIST_TOL)
    // 被移动一侧的 H 跟着整体平移（C2-H2 距离不变）
    const h2 = m.atoms.find(a => a.id === ids.h2)!
    expect(Math.abs(Math.hypot(c2.x - h2.x, c2.y - h2.y, c2.z - h2.z) - 1.09)).toBeLessThan(DIST_TOL)
    expect(m.bonds[0].order).toBe(2)
  })

  it('饱和乙烷 C-C 循环到双键时按价态删 H → C2H4', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.54, 0, 0)
    const ethane = autoAddHydrogens({ atoms: [c1, c2], bonds: [newBond(c1.id, c2.id, 1)] })
    expect(ethane.atoms.filter(a => a.symbol === 'H')).toHaveLength(6)
    const cc = ethane.bonds.find(b => b.atomId1 === c1.id || b.atomId2 === c1.id)!
    const result = cycleBondLength(ethane, cc.id)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.order).toBe(2)
    expect(result.molecule.atoms.filter(a => a.symbol === 'H')).toHaveLength(4)
  })

  it('连续循环：1 → 2 → 3 → 1', () => {
    const { atoms, bonds } = makeEthaneSkeleton()
    let mol = { atoms, bonds } as { atoms: readonly Atom[]; bonds: readonly Bond[] }
    const orders: number[] = []
    for (let i = 0; i < 3; i++) {
      const r = cycleBondLength(mol, mol.bonds[0].id)
      expect(r.ok).toBe(true)
      if (!r.ok) return
      orders.push(r.order)
      mol = r.molecule
    }
    expect(orders).toEqual([2, 3, 1])
  })

  it('环内键：只切换键级，几何不变', () => {
    // 三元环 C3
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.5, 0, 0)
    const c3 = newAtom('C', 0.75, 1.3, 0)
    const b12 = newBond(c1.id, c2.id, 1)
    const mol = {
      atoms: [c1, c2, c3],
      bonds: [b12, newBond(c2.id, c3.id, 1), newBond(c3.id, c1.id, 1)],
    }
    const result = cycleBondLength(mol, b12.id)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.moved).toBe(false)
    expect(result.order).toBe(2)
    // 坐标完全不变
    for (const a of result.molecule.atoms) {
      const orig = mol.atoms.find(x => x.id === a.id)!
      expect(a.x).toBe(orig.x); expect(a.y).toBe(orig.y); expect(a.z).toBe(orig.z)
    }
  })

  it('C-H 只有单键档位 → 拒绝', () => {
    const { atoms, bonds } = makeEthaneSkeleton()
    const chBond = bonds[1]
    const result = cycleBondLength({ atoms, bonds }, chBond.id)
    expect(result.ok).toBe(false)
  })
})
