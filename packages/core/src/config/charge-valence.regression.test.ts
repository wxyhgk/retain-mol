/**
 * 回归测试：缺电子元素（B/Al 等）设负电荷时价态公式反向
 * （2026-07-26 多 agent 审查 · valence 集群）
 *
 * 缺陷：effectiveMaxBonds 对无孤对元素用 -|charge|，任何符号的电荷都削减成键数，
 * BH3 设 -1 被算成 2 键 → resaturateAtom 删 H 得到 BH2⁻，而化学正确结果是 BH4⁻。
 * 修复：缺电子主族元素阴离子按轨道占据算——每得一个电子先填空轨道 +1 成键位，
 * 半满后成孤对 -1（min(电子数, 2×轨道数−电子数)）；阳离子仍每失一电子 -1；
 * 有孤对元素维持 maxBonds + charge 旧语义（N⁺→4 不许回归）。
 */
import { describe, it, expect } from 'vitest'
import { effectiveMaxBonds, ELEMENT_CONFIGS } from './elements.config'
import { newAtom, newBond, type Molecule } from '../lib/molecule'
import { autoAddHydrogens, resaturateAtom } from '../lib/builder/editing/atomOps'

describe('effectiveMaxBonds 电荷矩阵', () => {
  it('缺电子元素阴离子：每得一个电子增加一个成键位（封顶于杂化轨道数 4）', () => {
    expect(effectiveMaxBonds('B', -1)).toBe(4)   // BH4⁻ / 硼酸酯 BR4⁻
    expect(effectiveMaxBonds('Al', -1)).toBe(4)  // AlH4⁻
    expect(effectiveMaxBonds('B', -2)).toBe(3)   // 超过半满，多余电子成孤对
  })

  it('缺电子元素阳离子：每失一个电子减少一个成键位', () => {
    expect(effectiveMaxBonds('B', 1)).toBe(2)
    expect(effectiveMaxBonds('C', 1)).toBe(3)    // CH3⁺
  })

  it('碳阴离子：半满轨道再得电子成孤对 → 3 键（CH3⁻），不是 5 也不是 4', () => {
    expect(effectiveMaxBonds('C', -1)).toBe(3)
    expect(effectiveMaxBonds('Si', -1)).toBe(3)  // SiH3⁻
  })

  it('有孤对元素维持现有语义（不许回归）', () => {
    expect(effectiveMaxBonds('N', 1)).toBe(4)    // NH4⁺
    expect(effectiveMaxBonds('N', -1)).toBe(2)   // NH2⁻
    expect(effectiveMaxBonds('O', -1)).toBe(1)   // OH⁻
    expect(effectiveMaxBonds('O', -2)).toBe(0)   // O²⁻
    expect(effectiveMaxBonds('O', 1)).toBe(3)    // H3O⁺
    expect(effectiveMaxBonds('Cl', -1)).toBe(0)  // Cl⁻
  })

  it('H 是 1 轨道（duet）：H⁻ 为 0 键，不套 8 电子封顶', () => {
    expect(effectiveMaxBonds('H', -1)).toBe(0)
    expect(effectiveMaxBonds('H', 1)).toBe(0)
  })

  it('超价/过渡金属（maxBonds > 4）阴离子不套轨道模型，维持 -|q| 旧语义', () => {
    expect(effectiveMaxBonds('P', -1)).toBe(4)
    expect(effectiveMaxBonds('Fe', -1)).toBe(11)
    expect(effectiveMaxBonds('Fe', 2)).toBe(10)
  })

  it('中性且无自由基时严格 == maxBonds（全表不变式）', () => {
    for (const el of Object.values(ELEMENT_CONFIGS)) {
      expect(effectiveMaxBonds(el.symbol, 0, 0)).toBe(el.maxBonds)
    }
  })

  it('自由基仍各占一个价位', () => {
    expect(effectiveMaxBonds('C', 0, 1)).toBe(3)
    expect(effectiveMaxBonds('B', -1, 1)).toBe(3)
  })
})

/** 用 autoAddHydrogens 搭出饱和分子（等价于双击空白放原子），再设电荷调 resaturateAtom */
function buildSaturated(symbol: string): { mol: Molecule; centerId: string } {
  const center = newAtom(symbol, 0, 0, 0)
  return { mol: autoAddHydrogens({ atoms: [center], bonds: [] }), centerId: center.id }
}

function setCharge(mol: Molecule, atomId: string, charge: number): Molecule {
  return {
    ...mol,
    atoms: mol.atoms.map(a => (a.id === atomId ? { ...a, charge } : a)),
  }
}

function hCount(mol: Molecule): number {
  return mol.atoms.filter(a => a.symbol === 'H').length
}

describe('resaturateAtom 电荷重饱和（端到端）', () => {
  it('BH3 设 -1 → 补 1 个 H 成 BH4⁻（原缺陷：反而删 H 成 BH2⁻）', () => {
    const { mol, centerId } = buildSaturated('B')
    expect(hCount(mol)).toBe(3)
    const result = resaturateAtom(setCharge(mol, centerId, -1), centerId)
    expect(hCount(result)).toBe(4)
  })

  it('NH3 设 +1 → NH4⁺（对照组，不许回归）', () => {
    const { mol, centerId } = buildSaturated('N')
    expect(hCount(mol)).toBe(3)
    const result = resaturateAtom(setCharge(mol, centerId, 1), centerId)
    expect(hCount(result)).toBe(4)
  })

  it('CH4 设 +1 → CH3⁺', () => {
    const { mol, centerId } = buildSaturated('C')
    const result = resaturateAtom(setCharge(mol, centerId, 1), centerId)
    expect(hCount(result)).toBe(3)
  })

  it('CH4 设 -1 → CH3⁻', () => {
    const { mol, centerId } = buildSaturated('C')
    const result = resaturateAtom(setCharge(mol, centerId, -1), centerId)
    expect(hCount(result)).toBe(3)
  })

  it('H2O 设 -1 → OH⁻', () => {
    const { mol, centerId } = buildSaturated('O')
    expect(hCount(mol)).toBe(2)
    const result = resaturateAtom(setCharge(mol, centerId, -1), centerId)
    expect(hCount(result)).toBe(1)
  })

  it('重原子邻居占位时不强删：C(-CH3)H3 设 +1 只删 H 不动重原子', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.54, 0, 0)
    let mol: Molecule = { atoms: [c1, c2], bonds: [newBond(c1.id, c2.id)] }
    mol = autoAddHydrogens(mol)
    expect(hCount(mol)).toBe(6)
    const result = resaturateAtom(setCharge(mol, c1.id, 1), c1.id)
    expect(result.atoms.filter(a => a.symbol === 'C')).toHaveLength(2)
    expect(hCount(result)).toBe(5)
  })
})
