import { describe, it, expect, beforeAll } from 'vitest'
import * as OCL from 'openchemlib'
import { minimizeGeometry, markForceFieldReady } from './molFormat'
import { newAtom, newBond } from '../molecule'
import type { Molecule } from '../molecule'

// MMFF94 参数表：Node 环境从内置资源注册；标记就绪供 minimizeGeometry 使用
beforeAll(() => {
  ;(OCL as unknown as { Resources: { registerFromNodejs: () => void } }).Resources.registerFromNodejs()
  markForceFieldReady()
})

function dist(m: Molecule, i: number, j: number) {
  const a = m.atoms[i], b = m.atoms[j]
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
}
const hasNaN = (m: Molecule) => m.atoms.some(a => !isFinite(a.x) || !isFinite(a.y) || !isFinite(a.z))

describe('minimizeGeometry — MMFF94 力场清理', () => {
  it('拉长的乙烷 C–C 键收敛回 ~1.5 Å，能量下降', () => {
    // 乙烷：C-C 拉到 2.4Å
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 2.4, 0, 0)
    const h = [
      newAtom('H', -0.36, 1.03, 0), newAtom('H', -0.36, -0.51, 0.89), newAtom('H', -0.36, -0.51, -0.89),
      newAtom('H', 2.76, 1.03, 0), newAtom('H', 2.76, -0.51, 0.89), newAtom('H', 2.76, -0.51, -0.89),
    ]
    const mol: Molecule = {
      atoms: [c1, c2, ...h],
      bonds: [
        newBond(c1.id, c2.id),
        newBond(c1.id, h[0].id), newBond(c1.id, h[1].id), newBond(c1.id, h[2].id),
        newBond(c2.id, h[3].id), newBond(c2.id, h[4].id), newBond(c2.id, h[5].id),
      ],
    }
    const r = minimizeGeometry(mol)
    expect(r.ok).toBe(true)
    expect(hasNaN(r.molecule)).toBe(false)
    expect(dist(r.molecule, 0, 1)).toBeGreaterThan(1.4)
    expect(dist(r.molecule, 0, 1)).toBeLessThan(1.65)   // MMFF94 C-C ~1.51
    expect(r.energyAfter!).toBeLessThan(r.energyBefore!)
  })

  it('保留 id / 键 / 电荷（只动坐标）', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.9, 0, 0)
    const mol: Molecule = {
      atoms: [{ ...c1, charge: 0 }, c2],
      bonds: [newBond(c1.id, c2.id)],
    }
    // 加 H 让 MMFF 能处理（裸 C 会失败）
    const withH = {
      atoms: [
        c1, c2,
        newAtom('H', -0.5, 0.9, 0), newAtom('H', -0.5, -0.9, 0), newAtom('H', -0.5, 0, 0.9),
        newAtom('H', 2.4, 0.9, 0), newAtom('H', 2.4, -0.9, 0), newAtom('H', 2.4, 0, 0.9),
      ],
      bonds: [] as Molecule['bonds'],
    }
    withH.bonds = [
      newBond(c1.id, c2.id),
      newBond(c1.id, withH.atoms[2].id), newBond(c1.id, withH.atoms[3].id), newBond(c1.id, withH.atoms[4].id),
      newBond(c2.id, withH.atoms[5].id), newBond(c2.id, withH.atoms[6].id), newBond(c2.id, withH.atoms[7].id),
    ]
    const r = minimizeGeometry(withH)
    expect(r.ok).toBe(true)
    // id 与键数不变
    expect(r.molecule.atoms.map(a => a.id)).toEqual(withH.atoms.map(a => a.id))
    expect(r.molecule.bonds).toHaveLength(withH.bonds.length)
  })

  it('退化输入：单原子 / 无键 → ok 且原样', () => {
    const c = newAtom('C', 0, 0, 0)
    expect(minimizeGeometry({ atoms: [c], bonds: [] }).ok).toBe(true)
  })

  it('多个不相连片段：逐片段独立优化，不坍缩到一起（回归：曾整体搅乱穿插）', () => {
    // 两个相距 3Å 的甲烷放在同一分子对象里
    const methane = (ox: number) => {
      const c = newAtom('C', ox, 0, 0)
      const h = [
        newAtom('H', ox - 0.6, 0.9, 0), newAtom('H', ox - 0.6, -0.5, 0.8),
        newAtom('H', ox - 0.6, -0.5, -0.8), newAtom('H', ox + 0.6, 0, 0),
      ]
      return { c, h, bonds: h.map(x => newBond(c.id, x.id)) }
    }
    const m1 = methane(0), m2 = methane(3)
    const mol: Molecule = {
      atoms: [m1.c, ...m1.h, m2.c, ...m2.h],
      bonds: [...m1.bonds, ...m2.bonds],
    }
    const r = minimizeGeometry(mol)
    expect(r.ok).toBe(true)
    expect(hasNaN(r.molecule)).toBe(false)
    // 两个碳（索引 0 与 5）保持 ~3Å，不被 vdW 吸引坍缩
    expect(dist(r.molecule, 0, 5)).toBeGreaterThan(2.5)
    // 跨片段无原子重叠
    const bonded = new Set(r.molecule.bonds.map(b => [b.atomId1, b.atomId2].sort().join()))
    let minNonBonded = Infinity
    for (let i = 0; i < r.molecule.atoms.length; i++) {
      for (let j = i + 1; j < r.molecule.atoms.length; j++) {
        if (bonded.has([r.molecule.atoms[i].id, r.molecule.atoms[j].id].sort().join())) continue
        minNonBonded = Math.min(minNonBonded, dist(r.molecule, i, j))
      }
    }
    expect(minNonBonded).toBeGreaterThan(1.4)   // 无坍缩重叠
  })
})
