import { describe, it, expect } from 'vitest'
import { parseMol, exportMol, parseSdf, exportSdf, is2D } from './molFormat'

const METHANE = `methane
  RetainMol

  5  4  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.6293    0.6293    0.6293 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.6293   -0.6293    0.6293 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.6293    0.6293   -0.6293 H   0  0  0  0  0  0  0  0  0  0  0  0
    0.6293   -0.6293   -0.6293 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  1  3  1  0  0  0  0
  1  4  1  0  0  0  0
  1  5  1  0  0  0  0
M  END`

const ETHYLENE = `ethylene
  RetainMol

  6  5  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.3400    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   -0.5400    0.9354    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.5400   -0.9354    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
    1.8800    0.9354    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
    1.8800   -0.9354    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  2  0  0  0  0
  1  3  1  0  0  0  0
  1  4  1  0  0  0  0
  2  5  1  0  0  0  0
  2  6  1  0  0  0  0
M  END`

describe('parseMol', () => {
  it('解析原子数和键数', () => {
    const mol = parseMol(METHANE)
    expect(mol.atoms.length).toBe(5)
    expect(mol.bonds.length).toBe(4)
  })

  it('读取分子名称', () => {
    expect(parseMol(METHANE).name).toBe('methane')
  })

  it('正确解析原子符号和坐标（含 y/z，OCL 内部取反应被还原）', () => {
    const mol = parseMol(METHANE)
    expect(mol.atoms[0].symbol).toBe('C')
    expect(mol.atoms[0].x).toBeCloseTo(0)
    expect(mol.atoms[0].y).toBeCloseTo(0)
    expect(mol.atoms[0].z).toBeCloseTo(0)
    // SDF 中 H1 = (0.6293, 0.6293, 0.6293)，解析后应与 SDF 一致
    expect(mol.atoms[1].symbol).toBe('H')
    expect(mol.atoms[1].x).toBeCloseTo( 0.6293)
    expect(mol.atoms[1].y).toBeCloseTo( 0.6293)
    expect(mol.atoms[1].z).toBeCloseTo( 0.6293)
    // H2 = (-0.6293, -0.6293, 0.6293)
    expect(mol.atoms[2].x).toBeCloseTo(-0.6293)
    expect(mol.atoms[2].y).toBeCloseTo(-0.6293)
    expect(mol.atoms[2].z).toBeCloseTo( 0.6293)
  })

  it('正确解析键级', () => {
    const mol = parseMol(ETHYLENE)
    const doubleBond = mol.bonds[0]
    expect(doubleBond.order).toBe(2)
    expect(mol.bonds[1].order).toBe(1)
  })

  it('键正确引用原子 id', () => {
    const mol = parseMol(METHANE)
    expect(mol.bonds[0].atomId1).toBe(mol.atoms[0].id)
    expect(mol.bonds[0].atomId2).toBe(mol.atoms[1].id)
  })

})

describe('parseMol V3000', () => {
  const V3000_BENZENE = `benzene
  ChemDraw

  0  0  0     0  0              0 V3000
M  V30 BEGIN CTAB
M  V30 COUNTS 6 6 0 0 0
M  V30 BEGIN ATOM
M  V30 1 C 1.2124 0.7000 0.0000 0
M  V30 2 C 1.2124 -0.7000 0.0000 0
M  V30 3 C 0.0000 -1.4000 0.0000 0
M  V30 4 C -1.2124 -0.7000 0.0000 0
M  V30 5 C -1.2124 0.7000 0.0000 0
M  V30 6 C 0.0000 1.4000 0.0000 0
M  V30 END ATOM
M  V30 BEGIN BOND
M  V30 1 2 1 2
M  V30 2 1 2 3
M  V30 3 2 3 4
M  V30 4 1 4 5
M  V30 5 2 5 6
M  V30 6 1 6 1
M  V30 END BOND
M  V30 END CTAB
M  END`

  it('解析 V3000 原子和键', () => {
    const mol = parseMol(V3000_BENZENE)
    expect(mol.atoms.length).toBe(6)
    expect(mol.bonds.length).toBe(6)
    expect(mol.atoms[0].symbol).toBe('C')
  })

  it('V3000 键级保留', () => {
    const mol = parseMol(V3000_BENZENE)
    expect(mol.bonds[0].order).toBe(2) // 第一条键是双键
    expect(mol.bonds[1].order).toBe(1)
  })

  it('V3000 键引用正确的原子', () => {
    const mol = parseMol(V3000_BENZENE)
    expect(mol.bonds[0].atomId1).toBe(mol.atoms[0].id)
    expect(mol.bonds[0].atomId2).toBe(mol.atoms[1].id)
  })

  it('兼容 Windows 换行（CRLF）', () => {
    const crlf = V3000_BENZENE.replace(/\n/g, '\r\n')
    const mol = parseMol(crlf)
    expect(mol.atoms.length).toBe(6)
  })
})

describe('is2D', () => {
  it('z 全为 0 返回 true', () => {
    const mol = parseMol(`flat
  test

  0  0  0     0  0              0 V3000
M  V30 BEGIN CTAB
M  V30 COUNTS 2 1 0 0 0
M  V30 BEGIN ATOM
M  V30 1 C 0.0 0.0 0.0 0
M  V30 2 C 1.0 0.0 0.0 0
M  V30 END ATOM
M  V30 BEGIN BOND
M  V30 1 1 1 2
M  V30 END BOND
M  V30 END CTAB
M  END`)
    expect(is2D(mol)).toBe(true)
  })

  it('有 z 变化返回 false', () => {
    const mol = parseMol(`3d
  test

  0  0  0     0  0              0 V3000
M  V30 BEGIN CTAB
M  V30 COUNTS 2 1 0 0 0
M  V30 BEGIN ATOM
M  V30 1 C 0.0 0.0 0.0 0
M  V30 2 C 1.0 0.5 0.5 0
M  V30 END ATOM
M  V30 BEGIN BOND
M  V30 1 1 1 2
M  V30 END BOND
M  V30 END CTAB
M  END`)
    expect(is2D(mol)).toBe(false)
  })
})

describe('exportMol', () => {
  it('导出后再导入，原子数和键数一致', () => {
    const mol = parseMol(METHANE)
    const reimported = parseMol(exportMol(mol))
    expect(reimported.atoms.length).toBe(mol.atoms.length)
    expect(reimported.bonds.length).toBe(mol.bonds.length)
  })

  it('round-trip 保留坐标精度（4 位小数）', () => {
    const mol = parseMol(METHANE)
    const reimported = parseMol(exportMol(mol))
    mol.atoms.forEach((a, i) => {
      expect(reimported.atoms[i].x).toBeCloseTo(a.x, 4)
      expect(reimported.atoms[i].y).toBeCloseTo(a.y, 4)
      expect(reimported.atoms[i].z).toBeCloseTo(a.z, 4)
    })
  })

  it('round-trip 保留键级', () => {
    const mol = parseMol(ETHYLENE)
    const reimported = parseMol(exportMol(mol))
    mol.bonds.forEach((b, i) => {
      expect(reimported.bonds[i].order).toBe(b.order)
    })
  })
})

describe('parseSdf', () => {
  it('解析多个分子', () => {
    const sdf = exportSdf(parseMol(METHANE)) + exportSdf(parseMol(ETHYLENE))
    const mols = parseSdf(sdf)
    expect(mols.length).toBe(2)
    expect(mols[0].atoms.length).toBe(5)
    expect(mols[1].atoms.length).toBe(6)
  })

  it('忽略无效块，返回合法分子', () => {
    const sdf = exportSdf(parseMol(METHANE)) + '\nbad block\n$$$$\n' + exportSdf(parseMol(ETHYLENE))
    const mols = parseSdf(sdf)
    expect(mols.length).toBe(2)
  })
})
