import { describe, it, expect } from 'vitest'
import {
  newAtom, newBond,
  inferBonds, centerMolecule,
  parseXYZ, exportXYZ,
} from './molecule'

// ─────────────────────────────────────────────────────────
// newAtom / newBond
// ─────────────────────────────────────────────────────────

describe('newAtom', () => {
  it('默认坐标为原点', () => {
    const a = newAtom('C')
    expect(a.x).toBe(0)
    expect(a.y).toBe(0)
    expect(a.z).toBe(0)
  })

  it('每次生成唯一 id', () => {
    const a = newAtom('C')
    const b = newAtom('C')
    expect(a.id).not.toBe(b.id)
  })

  it('保存传入的坐标', () => {
    const a = newAtom('N', 1, 2, 3)
    expect(a.symbol).toBe('N')
    expect(a.x).toBe(1)
    expect(a.y).toBe(2)
    expect(a.z).toBe(3)
  })
})

describe('newBond', () => {
  it('默认键级为单键', () => {
    const b = newBond('a1', 'a2')
    expect(b.order).toBe(1)
  })

  it('可以指定键级', () => {
    const b = newBond('a1', 'a2', 2)
    expect(b.order).toBe(2)
  })
})

// ─────────────────────────────────────────────────────────
// inferBonds
// ─────────────────────────────────────────────────────────

describe('inferBonds', () => {
  it('水分子：O-H 键长约 0.96 Å，应推断出 2 个键', () => {
    const atoms = [
      newAtom('O',  0.000,  0.000, 0.000),
      newAtom('H',  0.757,  0.586, 0.000),
      newAtom('H', -0.757,  0.586, 0.000),
    ]
    const bonds = inferBonds(atoms)
    expect(bonds).toHaveLength(2)
    expect(bonds.every(b => b.order === 1)).toBe(true)
  })

  it('两原子距离超过共价半径之和 × 1.3 时不成键', () => {
    const atoms = [
      newAtom('C', 0, 0, 0),
      newAtom('C', 10, 0, 0),  // 10 Å，远超 C-C 键长
    ]
    expect(inferBonds(atoms)).toHaveLength(0)
  })

  it('原子重叠（距离 < 0.4 Å）时不成键', () => {
    const atoms = [
      newAtom('C', 0, 0, 0),
      newAtom('C', 0.1, 0, 0),
    ]
    expect(inferBonds(atoms)).toHaveLength(0)
  })

  it('甲烷：1 个 C + 4 个 H，应推断出 4 个键', () => {
    const atoms = [
      newAtom('C',  0.000,  0.000,  0.000),
      newAtom('H',  0.629,  0.629,  0.629),
      newAtom('H', -0.629, -0.629,  0.629),
      newAtom('H', -0.629,  0.629, -0.629),
      newAtom('H',  0.629, -0.629, -0.629),
    ]
    expect(inferBonds(atoms)).toHaveLength(4)
  })
})

// ─────────────────────────────────────────────────────────
// centerMolecule
// ─────────────────────────────────────────────────────────

describe('centerMolecule', () => {
  it('空分子直接返回', () => {
    const mol = { atoms: [], bonds: [], name: 'empty' }
    expect(centerMolecule(mol)).toBe(mol)
  })

  it('居中后所有原子坐标的均值为 (0,0,0)', () => {
    const atoms = [
      newAtom('C', 1, 2, 3),
      newAtom('C', 3, 4, 5),
      newAtom('C', 5, 6, 7),
    ]
    const mol = centerMolecule({ atoms, bonds: [] })
    const cx = mol.atoms.reduce((s, a) => s + a.x, 0) / mol.atoms.length
    const cy = mol.atoms.reduce((s, a) => s + a.y, 0) / mol.atoms.length
    const cz = mol.atoms.reduce((s, a) => s + a.z, 0) / mol.atoms.length
    expect(cx).toBeCloseTo(0)
    expect(cy).toBeCloseTo(0)
    expect(cz).toBeCloseTo(0)
  })

  it('不修改原始分子', () => {
    const a = newAtom('C', 1, 2, 3)
    const mol = { atoms: [a], bonds: [] }
    centerMolecule(mol)
    expect(a.x).toBe(1)  // 原始对象未被修改
  })

  it('原子间相对距离保持不变', () => {
    const atoms = [newAtom('C', 0, 0, 0), newAtom('C', 1.54, 0, 0)]
    const centered = centerMolecule({ atoms, bonds: [] })
    const dx = centered.atoms[1].x - centered.atoms[0].x
    expect(dx).toBeCloseTo(1.54)
  })
})

// ─────────────────────────────────────────────────────────
// parseXYZ / exportXYZ
// ─────────────────────────────────────────────────────────

describe('parseXYZ', () => {
  const xyzStr = `3
water
O  0.000000  0.000000  0.000000
H  0.757000  0.586000  0.000000
H -0.757000  0.586000  0.000000`

  it('正确解析原子数', () => {
    expect(parseXYZ(xyzStr).atoms).toHaveLength(3)
  })

  it('正确解析分子名', () => {
    expect(parseXYZ(xyzStr).name).toBe('water')
  })

  it('正确解析坐标', () => {
    const mol = parseXYZ(xyzStr)
    expect(mol.atoms[0].symbol).toBe('O')
    expect(mol.atoms[0].x).toBeCloseTo(0)
    expect(mol.atoms[1].symbol).toBe('H')
    expect(mol.atoms[1].x).toBeCloseTo(0.757)
  })
})

describe('exportXYZ', () => {
  it('导出行数 = 原子数 + 2（头两行）', () => {
    const mol = {
      atoms: [newAtom('O', 0, 0, 0), newAtom('H', 1, 0, 0)],
      bonds: [],
      name: 'test',
    }
    const lines = exportXYZ(mol).split('\n')
    expect(lines).toHaveLength(4)
    expect(lines[0]).toBe('2')
    expect(lines[1]).toBe('test')
  })

  it('parseXYZ → exportXYZ 往返一致', () => {
    const original = `3\nwater\nO  0.000000  0.000000  0.000000\nH  0.757000  0.586000  0.000000\nH -0.757000  0.586000  0.000000`
    const mol = parseXYZ(original)
    const exported = exportXYZ(mol)
    const reparsed = parseXYZ(exported)
    expect(reparsed.atoms).toHaveLength(mol.atoms.length)
    reparsed.atoms.forEach((a, i) => {
      expect(a.symbol).toBe(mol.atoms[i].symbol)
      expect(a.x).toBeCloseTo(mol.atoms[i].x, 4)
      expect(a.y).toBeCloseTo(mol.atoms[i].y, 4)
      expect(a.z).toBeCloseTo(mol.atoms[i].z, 4)
    })
  })
})
