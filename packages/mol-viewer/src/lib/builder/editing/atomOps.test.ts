import { describe, it, expect } from 'vitest'
import { newAtom, newBond } from '../../molecule'
import { calcAngle } from '../geometry/measure'
import { autoAddHydrogens, growByReplacingH, replaceAtomSymbol } from './atomOps'

describe('autoAddHydrogens', () => {
  it('空碳补 4 个 H → CH4', () => {
    const c = newAtom('C', 0, 0, 0)
    const mol = { atoms: [c], bonds: [] }
    const result = autoAddHydrogens(mol)
    const hCount = result.atoms.filter(a => a.symbol === 'H').length
    expect(hCount).toBe(4)
    expect(result.bonds).toHaveLength(4)
  })

  it('C-C 乙烷骨架补 6 个 H → C2H6', () => {
    const c1 = newAtom('C',  0,    0, 0)
    const c2 = newAtom('C',  1.54, 0, 0)
    const bond = newBond(c1.id, c2.id)
    const mol = { atoms: [c1, c2], bonds: [bond] }
    const result = autoAddHydrogens(mol)
    const hCount = result.atoms.filter(a => a.symbol === 'H').length
    expect(hCount).toBe(6)  // 每个 C 加 3 个 H
  })

  it('C=C 骨架按键级价态补 4 个 H → C2H4', () => {
    const c1 = newAtom('C', 0,    0, 0)
    const c2 = newAtom('C', 1.34, 0, 0)
    const bond = newBond(c1.id, c2.id, 2)
    const mol = { atoms: [c1, c2], bonds: [bond] }
    const result = autoAddHydrogens(mol)
    const hCount = result.atoms.filter(a => a.symbol === 'H').length
    expect(hCount).toBe(4)  // 每个 C 已被双键占 2 价 → 各补 2 个
  })

  it('C=C-C=C 骨架按键级价态补 6 个 H → C4H6', () => {
    const c1 = newAtom('C', 0,    0, 0)
    const c2 = newAtom('C', 1.34, 0, 0)
    const c3 = newAtom('C', 2.80, 0, 0)
    const c4 = newAtom('C', 4.14, 0, 0)
    const mol = {
      atoms: [c1, c2, c3, c4],
      bonds: [
        newBond(c1.id, c2.id, 2),
        newBond(c2.id, c3.id, 1),
        newBond(c3.id, c4.id, 2),
      ],
    }
    const result = autoAddHydrogens(mol)
    const hCount = result.atoms.filter(a => a.symbol === 'H').length
    expect(hCount).toBe(6)  // 2 + 1 + 1 + 2
  })

  it('凯库勒六元环按键级价态各补 1 个 H（共 6 个）', () => {
    const atoms = Array.from({ length: 6 }, (_, i) => {
      const angle = i * Math.PI / 3
      return newAtom('C', Math.cos(angle), Math.sin(angle), 0)
    })
    const bonds = atoms.map((a, i) => newBond(a.id, atoms[(i + 1) % 6].id, i % 2 === 0 ? 2 : 1))
    const result = autoAddHydrogens({ atoms, bonds })
    const hCount = result.atoms.filter(a => a.symbol === 'H').length
    expect(hCount).toBe(6)
  })

  it('导入 aromatic flag 的六元环按芳香价态各补 1 个 H（共 6 个）', () => {
    const atoms = Array.from({ length: 6 }, (_, i) => {
      const angle = i * Math.PI / 3
      return newAtom('C', Math.cos(angle), Math.sin(angle), 0)
    })
    const bonds = atoms.map((a, i) => ({ ...newBond(a.id, atoms[(i + 1) % 6].id, 1), aromatic: true }))
    const result = autoAddHydrogens({ atoms, bonds })
    const hCount = result.atoms.filter(a => a.symbol === 'H').length
    expect(hCount).toBe(6)
  })

  it('P/S 自动补氢使用默认价态，而不是最大扩展价态', () => {
    const p = autoAddHydrogens({ atoms: [newAtom('P', 0, 0, 0)], bonds: [] })
    const s = autoAddHydrogens({ atoms: [newAtom('S', 0, 0, 0)], bonds: [] })
    expect(p.atoms.filter(a => a.symbol === 'H')).toHaveLength(3)
    expect(s.atoms.filter(a => a.symbol === 'H')).toHaveLength(2)
  })

  it('已满价的 CH4 不添加额外 H', () => {
    const c = newAtom('C', 0, 0, 0)
    const hs = [
      newAtom('H',  0.629,  0.629,  0.629),
      newAtom('H', -0.629, -0.629,  0.629),
      newAtom('H', -0.629,  0.629, -0.629),
      newAtom('H',  0.629, -0.629, -0.629),
    ]
    const bonds = hs.map(h => newBond(c.id, h.id))
    const mol = { atoms: [c, ...hs], bonds }
    const result = autoAddHydrogens(mol)
    expect(result.atoms).toHaveLength(5)  // 没变
    expect(result.bonds).toHaveLength(4)
  })

  it('指定 atomId 只对该原子补 H', () => {
    const c1 = newAtom('C', 0,    0, 0)
    const c2 = newAtom('C', 1.54, 0, 0)
    const bond = newBond(c1.id, c2.id)
    const mol = { atoms: [c1, c2], bonds: [bond] }
    const result = autoAddHydrogens(mol, c1.id)
    const hCount = result.atoms.filter(a => a.symbol === 'H').length
    expect(hCount).toBe(3)  // 只给 c1 补了 H
  })

  it('补氢后所有 H 与中心原子距离约 C-H 键长', () => {
    const c = newAtom('C', 0, 0, 0)
    const mol = { atoms: [c], bonds: [] }
    const result = autoAddHydrogens(mol)
    const hs = result.atoms.filter(a => a.symbol === 'H')
    hs.forEach(h => {
      const dx = h.x - c.x, dy = h.y - c.y, dz = h.z - c.z
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz)
      expect(dist).toBeCloseTo(1.09, 1)
    })
  })

  it('补氢后 H-C-H 键角均约 109.47°', () => {
    const c = newAtom('C', 0, 0, 0)
    const mol = { atoms: [c], bonds: [] }
    const result = autoAddHydrogens(mol)
    const hs = result.atoms.filter(a => a.symbol === 'H')
    expect(hs).toHaveLength(4)

    for (let i = 0; i < hs.length; i++) {
      for (let j = i + 1; j < hs.length; j++) {
        const angle = calcAngle(hs[i], c, hs[j])
        expect(angle).toBeCloseTo(109.47, 0.5)
      }
    }
  })

  it('不修改原始分子（不可变性验证）', () => {
    const c = newAtom('C', 0, 0, 0)
    const mol = { atoms: [c], bonds: [] }
    autoAddHydrogens(mol)
    expect(mol.atoms).toHaveLength(1)
    expect(mol.bonds).toHaveLength(0)
  })
})

// ─────────────────────────────────────────────────────────
// replaceAtomSymbol
// ─────────────────────────────────────────────────────────

describe('replaceAtomSymbol', () => {
  it('替换后元素符号改变', () => {
    const c = newAtom('C', 1, 2, 3)
    const mol = { atoms: [c], bonds: [] }
    const result = replaceAtomSymbol(mol, c.id, 'N')
    expect(result.atoms[0].symbol).toBe('N')
  })

  it('坐标保持不变', () => {
    const c = newAtom('C', 1, 2, 3)
    const mol = { atoms: [c], bonds: [] }
    const result = replaceAtomSymbol(mol, c.id, 'N')
    expect(result.atoms[0].x).toBe(1)
    expect(result.atoms[0].y).toBe(2)
    expect(result.atoms[0].z).toBe(3)
  })

  it('id 保持不变', () => {
    const c = newAtom('C')
    const mol = { atoms: [c], bonds: [] }
    const result = replaceAtomSymbol(mol, c.id, 'O')
    expect(result.atoms[0].id).toBe(c.id)
  })

  it('已有键保持不变', () => {
    const c = newAtom('C')
    const h = newAtom('H')
    const bond = newBond(c.id, h.id)
    const mol = { atoms: [c, h], bonds: [bond] }
    const result = replaceAtomSymbol(mol, c.id, 'N')
    expect(result.bonds).toHaveLength(1)
    expect(result.bonds[0].atomId1).toBe(c.id)
  })

  it('不修改原始分子（不可变性）', () => {
    const c = newAtom('C')
    const mol = { atoms: [c], bonds: [] }
    replaceAtomSymbol(mol, c.id, 'N')
    expect(mol.atoms[0].symbol).toBe('C')
  })

  it('替换不存在的 id 时原样返回', () => {
    const c = newAtom('C')
    const mol = { atoms: [c], bonds: [] }
    const result = replaceAtomSymbol(mol, 'non-existent', 'N')
    expect(result.atoms[0].symbol).toBe('C')
  })

  it('纯元素替换不按常规价态拒绝，已有连接保持不变', () => {
    const c = newAtom('C')
    const h1 = newAtom('H')
    const h2 = newAtom('H')
    const mol = {
      atoms: [c, h1, h2],
      bonds: [newBond(c.id, h1.id), newBond(c.id, h2.id)],
    }
    const he = replaceAtomSymbol(mol, c.id, 'He')
    expect(he.atoms.find(a => a.id === c.id)!.symbol).toBe('He')
    expect(he.bonds).toEqual(mol.bonds)

    const accepted = replaceAtomSymbol(mol, c.id, 'O')
    expect(accepted.atoms.find(a => a.id === c.id)!.symbol).toBe('O')
    expect(accepted.bonds).toEqual(mol.bonds)
  })
})

describe('growByReplacingH', () => {
  it('带父键的 H 不能替换成 maxBonds=0 的稀有气体（He）→ 原样返回', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)
    const mol = { atoms: [c, h], bonds: [newBond(c.id, h.id)] }
    const result = growByReplacingH(mol, h.id, 'He')
    // 失败约定 = 返回原分子：He 承接不了父键，不能产生带键的 He
    expect(result).toBe(mol)
  })

  it('对照：H → O 正常生长为羟基（O 保留原 H 的 id 并补氢）', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)
    const mol = { atoms: [c, h], bonds: [newBond(c.id, h.id)] }
    const result = growByReplacingH(mol, h.id, 'O')
    const o = result.atoms.find(a => a.id === h.id)!
    expect(o.symbol).toBe('O')
    // O maxBonds=2：父键 + 补 1 个 H → 共 3 个原子
    expect(result.atoms).toHaveLength(3)
  })
})

// ─────────────────────────────────────────────────────────
// bondByReplacingH — 桥氢（多键 H）不留悬空键
// ─────────────────────────────────────────────────────────
