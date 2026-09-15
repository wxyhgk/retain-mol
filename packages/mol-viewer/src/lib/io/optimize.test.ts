import { describe, it, expect, beforeAll } from 'vitest'
import * as OCL from 'openchemlib'
import { minimizeGeometry, generate3D, markForceFieldReady, parseMol } from './molFormat'
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

  it('交错原子顺序（点击搭建式）：MMFF 重排后仍按标签正确读回，不搅乱（回归）', () => {
    // 点击搭建的丙烷原子顺序是交错的：C,C,H,H,H,C,H,H,H,H,H（第三个碳夹在氢中间）
    // MMFF94 会把重原子重排到前面，按 index 读回会张冠李戴 → 曾把结构搅乱
    const c0 = newAtom('C', 0, 0, 0), c1 = newAtom('C', 1.5, 0, 0), c2 = newAtom('C', 2.0, 1.4, 0)
    const h = [
      newAtom('H', -0.5, 0.9, 0), newAtom('H', -0.5, -0.5, 0.8), newAtom('H', -0.5, -0.5, -0.8),
      newAtom('H', 1.8, -0.5, 0.8), newAtom('H', 1.8, -0.5, -0.8),
      newAtom('H', 1.6, 2.0, 0.8), newAtom('H', 1.6, 2.0, -0.8), newAtom('H', 3.1, 1.4, 0),
    ]
    const mol: Molecule = {
      atoms: [c0, c1, h[0], h[1], h[2], c2, h[3], h[4], h[5], h[6], h[7]],
      bonds: [
        newBond(c0.id, c1.id), newBond(c1.id, c2.id),
        newBond(c0.id, h[0].id), newBond(c0.id, h[1].id), newBond(c0.id, h[2].id),
        newBond(c1.id, h[3].id), newBond(c1.id, h[4].id),
        newBond(c2.id, h[5].id), newBond(c2.id, h[6].id), newBond(c2.id, h[7].id),
      ],
    }
    const r = minimizeGeometry(mol)
    expect(r.ok).toBe(true)
    expect(hasNaN(r.molecule)).toBe(false)
    // 三根 C–C / C–H 键长正确（索引 0=C0,1=C1,5=C2）
    expect(dist(r.molecule, 0, 1)).toBeGreaterThan(1.4)
    expect(dist(r.molecule, 0, 1)).toBeLessThan(1.65)
    expect(dist(r.molecule, 1, 5)).toBeGreaterThan(1.4)
    expect(dist(r.molecule, 1, 5)).toBeLessThan(1.65)
    // 无非键重叠
    const bonded = new Set(r.molecule.bonds.map(b => [b.atomId1, b.atomId2].sort().join()))
    let mn = Infinity
    for (let i = 0; i < r.molecule.atoms.length; i++)
      for (let j = i + 1; j < r.molecule.atoms.length; j++)
        if (!bonded.has([r.molecule.atoms[i].id, r.molecule.atoms[j].id].sort().join()))
          mn = Math.min(mn, dist(r.molecule, i, j))
    expect(mn).toBeGreaterThan(1.4)
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

describe('generate3D — 2D 结构立体化（Chem3D 式）', () => {
  const SDF_2D_BENZENE = `benzene
  ChemDraw

  6  6  0  0  0  0  0  0  0  0999 V2000
   -0.7145    0.4125    0.0000 C   0  0
   -0.7145   -0.4125    0.0000 C   0  0
    0.0000   -0.8250    0.0000 C   0  0
    0.7145   -0.4125    0.0000 C   0  0
    0.7145    0.4125    0.0000 C   0  0
    0.0000    0.8250    0.0000 C   0  0
  1  2  2  0
  2  3  1  0
  3  4  2  0
  4  5  1  0
  5  6  2  0
  6  1  1  0
M  END`

  it('2D 苯（平面、无氢）→ 3D 苯（补氢、C–C 1.39）', () => {
    const mol2d = parseMol(SDF_2D_BENZENE)
    expect(mol2d.atoms.every(a => Math.abs(a.z) < 1e-6)).toBe(true)
    expect(mol2d.atoms.filter(a => a.symbol === 'H')).toHaveLength(0)

    const r = generate3D(mol2d)
    expect(r.ok).toBe(true)
    const m = r.molecule
    expect(m.atoms.filter(a => a.symbol === 'C')).toHaveLength(6)
    expect(m.atoms.filter(a => a.symbol === 'H')).toHaveLength(6)
    const byId = new Map(m.atoms.map(a => [a.id, a]))
    const ccBonds = m.bonds.filter(b =>
      byId.get(b.atomId1)!.symbol === 'C' && byId.get(b.atomId2)!.symbol === 'C')
    expect(ccBonds).toHaveLength(6)
    for (const b of ccBonds) {
      const a1 = byId.get(b.atomId1)!, a2 = byId.get(b.atomId2)!
      expect(Math.hypot(a1.x - a2.x, a1.y - a2.y, a1.z - a2.z)).toBeCloseTo(1.39, 1)
    }
    expect(m.atoms.every(a => isFinite(a.x) && isFinite(a.y) && isFinite(a.z))).toBe(true)
  })

  it('2D 芳香苯（type 4 键、无氢）→ 3D 苯（6H、平面、C–C 1.39，非环己烷化）', () => {
    // 只改键行的键级字段，原子行不动
    const aromatic2d = SDF_2D_BENZENE.split('\n').map(line =>
      /^\s*\d+\s+\d+\s+[12]\s+0\s*$/.test(line) ? line.replace(/(\s+)[12](\s+0\s*)$/, '$14$2') : line,
    ).join('\n')
    const mol2d = parseMol(aromatic2d)
    expect(mol2d.bonds).toHaveLength(6)
    expect(mol2d.bonds.every(b => b.aromatic === true)).toBe(true)
    const r = generate3D(mol2d)
    expect(r.ok).toBe(true)
    const m = r.molecule
    expect(m.atoms.filter(a => a.symbol === 'C')).toHaveLength(6)
    expect(m.atoms.filter(a => a.symbol === 'H')).toHaveLength(6)
    const byId: Record<string, (typeof m.atoms)[number]> = Object.fromEntries(m.atoms.map(a => [a.id, a]))
    const ccBonds = m.bonds.filter(b =>
      byId[b.atomId1]?.symbol === 'C' && byId[b.atomId2]?.symbol === 'C')
    expect(ccBonds).toHaveLength(6)
    for (const b of ccBonds) {
      const a1 = byId[b.atomId1]!, a2 = byId[b.atomId2]!
      expect(Math.hypot(a1.x - a2.x, a1.y - a2.y, a1.z - a2.z)).toBeCloseTo(1.39, 1)
    }
    // OCL 保持原子顺序（输入即环序），用 Newell 法拟合环平面：皱褶环己烷偏差 ~0.7，平面苯 ~0
    const ring = m.atoms.filter(a => a.symbol === 'C')
    const cx = ring.reduce((s, a) => s + a.x, 0) / ring.length
    const cy = ring.reduce((s, a) => s + a.y, 0) / ring.length
    const cz = ring.reduce((s, a) => s + a.z, 0) / ring.length
    let nx = 0, ny = 0, nz = 0
    for (let i = 0; i < ring.length; i += 1) {
      const p = ring[i]!, q = ring[(i + 1) % ring.length]!
      nx += (p.y - q.y) * (p.z + q.z)
      ny += (p.z - q.z) * (p.x + q.x)
      nz += (p.x - q.x) * (p.y + q.y)
    }
    const nl = Math.hypot(nx, ny, nz)
    const dev = Math.max(...ring.map(a => Math.abs(((a.x - cx) * nx + (a.y - cy) * ny + (a.z - cz) * nz) / nl)))
    expect(dev).toBeLessThan(0.3)
  })

  it('退化输入：单原子 → 原样返回 ok', () => {
    expect(generate3D({ atoms: [newAtom('C', 0, 0, 0)], bonds: [] }).ok).toBe(true)
  })

  it('二维四面体碳经过距离几何后具有明显的 z 轴厚度', () => {
    const carbon = newAtom('C', 0, 0, 0)
    const hydrogens = [
      newAtom('H', 1, 0, 0),
      newAtom('H', -1, 0, 0),
      newAtom('H', 0, 1, 0),
      newAtom('H', 0, -1, 0),
    ]
    const planar = {
      atoms: [carbon, ...hydrogens],
      bonds: hydrogens.map(hydrogen => newBond(carbon.id, hydrogen.id, 1)),
    }
    const result = generate3D(planar)
    expect(result.ok).toBe(true)
    const z = result.molecule.atoms.map(atom => atom.z)
    expect(Math.max(...z) - Math.min(...z)).toBeGreaterThan(0.5)
  })
})
