import { describe, it, expect } from 'vitest'
import { newAtom, newBond } from '../molecule'
import {
  calcBondLength,
  findNextBondDir,
  calcAddAtomOnExisting,
  canBond,
  measureDistance,
  measureAngle,
  measureDihedral,
  getNeighborDirs,
  autoAddHydrogens,
  replaceAtomSymbol,
} from './BuilderEngine'
import type { Atom, Bond } from '../molecule'

// 允许的角度误差（度）
const ANGLE_TOL = 0.5
// 允许的距离误差（Å）
const DIST_TOL = 0.01

function deg(rad: number) { return rad * (180 / Math.PI) }
function angleBetween(d1: [number,number,number], d2: [number,number,number]) {
  const dot = d1[0]*d2[0] + d1[1]*d2[1] + d1[2]*d2[2]
  return deg(Math.acos(Math.max(-1, Math.min(1, dot))))
}
function vecLen(v: [number,number,number]) {
  return Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2)
}

// ─────────────────────────────────────────────────────────
// calcBondLength
// ─────────────────────────────────────────────────────────

describe('calcBondLength', () => {
  it('C-H 键长约 1.09 Å（标准表）', () => {
    expect(calcBondLength('C', 'H')).toBeCloseTo(1.09, 2)
  })

  it('C-C 键长约 1.54 Å', () => {
    expect(calcBondLength('C', 'C')).toBeCloseTo(1.54, 2)
  })

  it('参数顺序不影响结果', () => {
    expect(calcBondLength('C', 'N')).toBeCloseTo(calcBondLength('N', 'C'), 5)
  })

  it('未知元素回退到共价半径之和', () => {
    const len = calcBondLength('Xe', 'C')
    expect(len).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────
// findNextBondDir — 四面体键角验证
// ─────────────────────────────────────────────────────────

describe('findNextBondDir', () => {
  it('n=0：返回单位向量', () => {
    const d = findNextBondDir('C', [])
    expect(vecLen(d)).toBeCloseTo(1, 5)
  })

  it('n=1：与已有键成 109.47°（sp3 碳）', () => {
    const existing: [number,number,number] = [1, 0, 0]
    const next = findNextBondDir('C', [existing])
    expect(vecLen(next)).toBeCloseTo(1, 5)
    expect(angleBetween(existing, next)).toBeCloseTo(109.47, ANGLE_TOL)
  })

  it('n=1：垂直于 Y 轴的键也满足四面体角', () => {
    const existing: [number,number,number] = [0, 1, 0]
    const next = findNextBondDir('C', [existing])
    expect(angleBetween(existing, next)).toBeCloseTo(109.47, ANGLE_TOL)
  })

  it('n=2：第三个键与前两个均成 109.47°', () => {
    const d1: [number,number,number] = [1, 0, 0]
    const d2 = findNextBondDir('C', [d1])   // 第二个键方向
    const d3 = findNextBondDir('C', [d1, d2])

    expect(vecLen(d3)).toBeCloseTo(1, 5)
    expect(angleBetween(d1, d3)).toBeCloseTo(109.47, ANGLE_TOL)
    expect(angleBetween(d2, d3)).toBeCloseTo(109.47, ANGLE_TOL)
  })

  it('n=3：第四个键完成正四面体，与其余三个均成 109.47°', () => {
    const d1: [number,number,number] = [1, 0, 0]
    const d2 = findNextBondDir('C', [d1])
    const d3 = findNextBondDir('C', [d1, d2])
    const d4 = findNextBondDir('C', [d1, d2, d3])

    expect(vecLen(d4)).toBeCloseTo(1, 5)
    expect(angleBetween(d1, d4)).toBeCloseTo(109.47, ANGLE_TOL)
    expect(angleBetween(d2, d4)).toBeCloseTo(109.47, ANGLE_TOL)
    expect(angleBetween(d3, d4)).toBeCloseTo(109.47, ANGLE_TOL)
  })

  it('氮（sp3）键角约 107°', () => {
    const existing: [number,number,number] = [1, 0, 0]
    const next = findNextBondDir('N', [existing])
    expect(angleBetween(existing, next)).toBeCloseTo(107, 1)
  })
})

// ─────────────────────────────────────────────────────────
// calcAddAtomOnExisting
// ─────────────────────────────────────────────────────────

describe('calcAddAtomOnExisting', () => {
  it('在空碳上加 H：键长约 1.09 Å', () => {
    const c = newAtom('C', 0, 0, 0)
    const result = calcAddAtomOnExisting(c, [], [c], 'H')
    const dx = result.position[0] - c.x
    const dy = result.position[1] - c.y
    const dz = result.position[2] - c.z
    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz)
    expect(dist).toBeCloseTo(1.09, DIST_TOL)
  })

  it('剩余槽位数计算正确', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)
    const bond = newBond(c.id, h.id)
    const result = calcAddAtomOnExisting(c, [bond], [c, h], 'H')
    expect(result.availableSlots).toBe(3)  // C 还有 3 个槽
  })

  it('新原子位置不与中心原子重叠', () => {
    const c = newAtom('C', 0, 0, 0)
    const result = calcAddAtomOnExisting(c, [], [c], 'C')
    const [x, y, z] = result.position
    const dist = Math.sqrt(x*x + y*y + z*z)
    expect(dist).toBeGreaterThan(0.5)
  })
})

// ─────────────────────────────────────────────────────────
// canBond
// ─────────────────────────────────────────────────────────

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

describe('measureDistance', () => {
  it('两点距离：勾股定理', () => {
    const a = newAtom('C', 0, 0, 0)
    const b = newAtom('C', 3, 4, 0)
    expect(measureDistance(a, b)).toBeCloseTo(5, 5)
  })

  it('同一点距离为 0', () => {
    const a = newAtom('C', 1, 2, 3)
    expect(measureDistance(a, a)).toBeCloseTo(0, 5)
  })
})

describe('measureAngle', () => {
  it('直线排列：键角 180°', () => {
    const a = newAtom('C', -1, 0, 0)
    const b = newAtom('C',  0, 0, 0)
    const c = newAtom('C',  1, 0, 0)
    expect(measureAngle(a, b, c)).toBeCloseTo(180, ANGLE_TOL)
  })

  it('直角：键角 90°', () => {
    const a = newAtom('C', 1, 0, 0)
    const b = newAtom('C', 0, 0, 0)
    const c = newAtom('C', 0, 1, 0)
    expect(measureAngle(a, b, c)).toBeCloseTo(90, ANGLE_TOL)
  })

  it('水分子 H-O-H 键角约 104.5°', () => {
    const o = newAtom('O',  0.000,  0.000, 0.000)
    const h1 = newAtom('H',  0.757,  0.586, 0.000)
    const h2 = newAtom('H', -0.757,  0.586, 0.000)
    expect(measureAngle(h1, o, h2)).toBeCloseTo(104.5, 1)
  })
})

describe('measureDihedral', () => {
  it('共面（二面角 0°）', () => {
    const a = newAtom('C', 0, 1, 0)
    const b = newAtom('C', 0, 0, 0)
    const c = newAtom('C', 1, 0, 0)
    const d = newAtom('C', 1, 1, 0)
    expect(Math.abs(measureDihedral(a, b, c, d))).toBeCloseTo(0, ANGLE_TOL)
  })

  it('90° 二面角', () => {
    const a = newAtom('C', 0, 1, 0)
    const b = newAtom('C', 0, 0, 0)
    const c = newAtom('C', 1, 0, 0)
    const d = newAtom('C', 1, 0, 1)
    expect(Math.abs(measureDihedral(a, b, c, d))).toBeCloseTo(90, ANGLE_TOL)
  })
})

// ─────────────────────────────────────────────────────────
// canBond — 更多边界情况
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

  it('C=C 乙烯骨架按键级补 4 个 H → C2H4', () => {
    const c1 = newAtom('C', 0,    0, 0)
    const c2 = newAtom('C', 1.34, 0, 0)
    const bond = newBond(c1.id, c2.id, 2)
    const mol = { atoms: [c1, c2], bonds: [bond] }
    const result = autoAddHydrogens(mol)
    const hCount = result.atoms.filter(a => a.symbol === 'H').length
    expect(hCount).toBe(4)
  })

  it('共轭二烯 C=C-C=C 骨架补 6 个 H → C4H6', () => {
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
    expect(hCount).toBe(6)
  })

  it('苯环芳香碳每个只补 1 个 H → C6H6', () => {
    const atoms = Array.from({ length: 6 }, (_, i) => {
      const angle = i * Math.PI / 3
      return newAtom('C', Math.cos(angle), Math.sin(angle), 0)
    })
    const bonds = atoms.map((a, i) => newBond(a.id, atoms[(i + 1) % 6].id, i % 2 === 0 ? 2 : 1))
    const result = autoAddHydrogens({ atoms, bonds })
    const hCount = result.atoms.filter(a => a.symbol === 'H').length
    expect(hCount).toBe(6)
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
        const angle = measureAngle(hs[i], c, hs[j])
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
})
