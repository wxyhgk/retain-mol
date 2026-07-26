/**
 * 回归测试：removeExcessHydrogens 对芳香键产生的 0.5 分数超额用 Math.ceil，
 * Shift+点苯环键把两端的环 H 都删掉
 * （2026-07-26 多 agent 审查 · valence 集群）
 *
 * 缺陷：SDF 苯环每条环键 aromatic:true（bondValence 计 1.5）。Shift+点键把
 * 被点的键局部化成 order 2 后，环 C 的 valenceUsed = 2 + 1.5 + 1(H) = 4.5，
 * excess = 0.5 是『局部化键与 aromatic 键混排』的簿记残差，Math.ceil 把它
 * 向上取整为 1，删掉该 C 唯一的环 H（两端都删），苯 H 6 → 4。
 * 修复：与 autoAddHydrogens 对称的保守取整 Math.floor(excess + 1e-6)。
 */
import { describe, it, expect } from 'vitest'
import { newAtom, newBond, type Molecule, type Bond } from '../../molecule'
import { removeExcessHydrogens } from './atomOps'
import { cycleBondLength } from './bondOps'

/** 构造 SDF 导入形态的苯：6C 六元环，环键 order 1 + aromatic:true，每 C 一个 H */
function buildAromaticBenzene(): Molecule {
  const rC = 1.39
  const rH = 2.48
  const carbons = Array.from({ length: 6 }, (_, k) => {
    const ang = (k * Math.PI) / 3
    return newAtom('C', rC * Math.cos(ang), rC * Math.sin(ang), 0)
  })
  const hydrogens = Array.from({ length: 6 }, (_, k) => {
    const ang = (k * Math.PI) / 3
    return newAtom('H', rH * Math.cos(ang), rH * Math.sin(ang), 0)
  })
  const bonds: Bond[] = []
  for (let k = 0; k < 6; k++) {
    const c = carbons[k]!
    const cNext = carbons[(k + 1) % 6]!
    bonds.push({ ...newBond(c.id, cNext.id, 1), aromatic: true })
    bonds.push(newBond(c.id, hydrogens[k]!.id, 1))
  }
  return { atoms: [...carbons, ...hydrogens], bonds }
}

function hCount(mol: Molecule): number {
  return mol.atoms.filter(a => a.symbol === 'H').length
}

describe('removeExcessHydrogens 分数超额保守取整', () => {
  it('excess = 0.5（aromatic 1.5 价簿记残差）不删 H', () => {
    // C 中心：一条 order 2 局部化键 + 一条 aromatic 键 + 1 个 H → valenceUsed 4.5
    const c = newAtom('C', 0, 0, 0)
    const n1 = newAtom('C', 1.39, 0, 0)
    const n2 = newAtom('C', -0.7, 1.2, 0)
    const h = newAtom('H', 0, -1.09, 0)
    const mol: Molecule = {
      atoms: [c, n1, n2, h],
      bonds: [
        newBond(c.id, n1.id, 2),
        { ...newBond(c.id, n2.id, 1), aromatic: true },
        newBond(c.id, h.id, 1),
      ],
    }
    const result = removeExcessHydrogens(mol, c.id)
    expect(hCount(result)).toBe(1)
    expect(result).toBe(mol) // excess<1 → 原样返回
  })

  it('整数超额仍然照删（不因保守取整而失效）', () => {
    // C 中心：一条 order 3 键 + 2 个 H → valenceUsed 5，excess 1 → 删 1 个 H
    const c = newAtom('C', 0, 0, 0)
    const n = newAtom('C', 1.2, 0, 0)
    const h1 = newAtom('H', -1.09, 0, 0)
    const h2 = newAtom('H', 0, 1.09, 0)
    const mol: Molecule = {
      atoms: [c, n, h1, h2],
      bonds: [newBond(c.id, n.id, 3), newBond(c.id, h1.id, 1), newBond(c.id, h2.id, 1)],
    }
    const result = removeExcessHydrogens(mol, c.id)
    expect(hCount(result)).toBe(1)
  })
})

describe('Shift+点苯环键（cycleBondLength 环内分支）', () => {
  it('SDF 苯全 aromatic 键：升级一条环键后 H 数仍为 6（原缺陷：6 → 4）', () => {
    const benzene = buildAromaticBenzene()
    expect(hCount(benzene)).toBe(6)
    const ringBond = benzene.bonds.find(b => b.aromatic)!
    const result = cycleBondLength(benzene, ringBond.id)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.order).toBe(2)
    expect(result.moved).toBe(false)
    expect(hCount(result.molecule)).toBe(6)
    expect(result.molecule.atoms).toHaveLength(12)
  })
})
