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
  cycleBondLength,
  setBondLength,
  setBondAngle,
  setDihedralAngle,
} from './BuilderEngine'
import { detectAromaticity } from './analysis/aromaticity'
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

describe('geometric aromaticity（键长驱动的芳香判据）', () => {
  /** 生成平面正六边形 C6 环，每个 C 挂一个径向 H */
  function makeHexRing(ccLen: number) {
    const atoms: Atom[] = []
    const bonds: Bond[] = []
    const R = ccLen / (2 * Math.sin(Math.PI / 6))  // 外接圆半径 = 边长（六边形）
    const cs: Atom[] = []
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI / 3) * i
      const c = newAtom('C', R * Math.cos(ang), R * Math.sin(ang), 0)
      cs.push(c); atoms.push(c)
      const h = newAtom('H', (R + 1.09) * Math.cos(ang), (R + 1.09) * Math.sin(ang), 0)
      atoms.push(h)
      bonds.push(newBond(c.id, h.id))
    }
    for (let i = 0; i < 6; i++) bonds.push(newBond(cs[i].id, cs[(i + 1) % 6].id, 1))
    return { atoms, bonds }
  }

  it('1.39 Å 均匀六元碳环（全单键键级）→ 芳香', () => {
    const mol = makeHexRing(1.39)
    const result = detectAromaticity(mol)
    expect(result.aromaticRings.length).toBe(1)
    expect(result.aromaticAtoms.size).toBe(6)
  })

  it('1.54 Å 六元碳环（环己烷骨架长度）→ 非芳香', () => {
    const mol = makeHexRing(1.54)
    const result = detectAromaticity(mol)
    expect(result.aromaticRings.length).toBe(0)
  })
})

describe('geometryOps（键长/键角/二面角编辑）', () => {
  /** 丁烷式骨架 a-b-c-d（带一个挂在 c 上的支链 e，验证刚体旋转） */
  function makeChain() {
    const a = newAtom('C', 0, 0, 0)
    const b = newAtom('C', 1.54, 0, 0)
    const c = newAtom('C', 2.3, 1.3, 0)
    const d = newAtom('C', 3.84, 1.3, 0.2)
    const e = newAtom('H', 2.3, 1.9, 1.0)   // c 的支链
    return {
      atoms: [a, b, c, d, e],
      bonds: [newBond(a.id, b.id), newBond(b.id, c.id), newBond(c.id, d.id), newBond(c.id, e.id)],
      ids: { a: a.id, b: b.id, c: c.id, d: d.id, e: e.id },
    }
  }
  const get = (m: { atoms: readonly Atom[] }, id: string) => m.atoms.find(x => x.id === id)!

  it('setBondLength：平移 B 端片段到目标距离，片段内部几何不变', () => {
    const mol = makeChain()
    const result = setBondLength(mol, mol.ids.a, mol.ids.b, 2.0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const m = result.molecule
    expect(Math.abs(measureDistance(get(m, mol.ids.a), get(m, mol.ids.b)) - 2.0)).toBeLessThan(1e-6)
    // b–c 距离（同侧内部）不变
    const before = measureDistance(get(mol as never, mol.ids.b), get(mol as never, mol.ids.c))
    const after  = measureDistance(get(m, mol.ids.b), get(m, mol.ids.c))
    expect(Math.abs(after - before)).toBeLessThan(1e-9)
  })

  it('setBondAngle：以 B 为顶点转 C 端到目标角，支链跟随刚体旋转', () => {
    const mol = makeChain()
    const result = setBondAngle(mol, mol.ids.a, mol.ids.b, mol.ids.c, 90)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const m = result.molecule
    expect(Math.abs(measureAngle(get(m, mol.ids.a), get(m, mol.ids.b), get(m, mol.ids.c)) - 90)).toBeLessThan(0.01)
    // c–d、c–e 内部距离不变（刚体）
    expect(Math.abs(
      measureDistance(get(m, mol.ids.c), get(m, mol.ids.d)) -
      measureDistance(get(mol as never, mol.ids.c), get(mol as never, mol.ids.d))
    )).toBeLessThan(1e-9)
  })

  it('setDihedralAngle：绕 B–C 轴转到目标二面角（含符号）', () => {
    const mol = makeChain()
    for (const target of [60, -60, 175]) {
      const result = setDihedralAngle(mol, mol.ids.a, mol.ids.b, mol.ids.c, mol.ids.d, target)
      expect(result.ok).toBe(true)
      if (!result.ok) return
      const m = result.molecule
      const got = measureDihedral(get(m, mol.ids.a), get(m, mol.ids.b), get(m, mol.ids.c), get(m, mol.ids.d))
      expect(Math.abs(got - target)).toBeLessThan(0.01)
      // A、B 不动
      expect(get(m, mol.ids.a).x).toBe(get(mol as never, mol.ids.a).x)
      expect(get(m, mol.ids.b).y).toBe(get(mol as never, mol.ids.b).y)
    }
  })

  it('环内键长/二面角 → 拒绝', () => {
    // 三元环
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.5, 0, 0)
    const c3 = newAtom('C', 0.75, 1.3, 0)
    const mol = {
      atoms: [c1, c2, c3],
      bonds: [newBond(c1.id, c2.id), newBond(c2.id, c3.id), newBond(c3.id, c1.id)],
    }
    expect(setBondLength(mol, c1.id, c2.id, 2.0).ok).toBe(false)
    expect(setDihedralAngle(mol, c3.id, c1.id, c2.id, c3.id, 30).ok).toBe(false)
  })

  it('无键且同片段的两原子 → 拒绝调距离', () => {
    const mol = makeChain()
    expect(setBondLength(mol, mol.ids.a, mol.ids.c, 2.5).ok).toBe(false)
  })
})
