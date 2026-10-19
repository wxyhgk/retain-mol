import { describe, it, expect } from 'vitest'
import { newAtom, newBond } from '../../molecule'
import { detectAromaticity, findRings } from './aromaticity'
import type { Molecule } from '../../molecule'

function mol(
  atoms: ReturnType<typeof newAtom>[],
  bonds: ReturnType<typeof newBond>[],
): Molecule {
  return { atoms, bonds }
}

// ── 构造辅助：苯环（6 个 C，交替单双键）────────────────────────────────────
function makeBenzene() {
  const cs = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 6
    return newAtom('C', Math.cos(angle), Math.sin(angle), 0)
  })
  const bonds = cs.map((c, i) =>
    newBond(c.id, cs[(i + 1) % 6].id, i % 2 === 0 ? 2 : 1)
  )
  return { atoms: cs, bonds }
}

// ── findRings ─────────────────────────────────────────────────────────────────

describe('findRings', () => {
  it('苯：找到恰好 1 个 6 元环', () => {
    const { atoms, bonds } = makeBenzene()
    const rings = findRings(atoms, bonds)
    expect(rings.length).toBe(1)
    expect(rings[0].length).toBe(6)
  })

  it('开链分子（乙烷）：无环', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.5, 0, 0)
    expect(findRings([c1, c2], [newBond(c1.id, c2.id)])).toHaveLength(0)
  })

  it('环丙烷：找到 1 个 3 元环', () => {
    const cs = [newAtom('C', 0, 0, 0), newAtom('C', 1, 0, 0), newAtom('C', 0.5, 1, 0)]
    const bonds = [
      newBond(cs[0].id, cs[1].id),
      newBond(cs[1].id, cs[2].id),
      newBond(cs[2].id, cs[0].id),
    ]
    expect(findRings(cs, bonds)).toHaveLength(1)
  })

  it('萘（两个稠合 6 元环）：找到 2 个 6 元环', () => {
    // C1-C2=C3-C4=C5-C6=C1  (ring1)
    // C4-C7=C8-C9=C10-C5    (ring2, shared C4-C5)
    const cs = Array.from({ length: 10 }, (_, i) => newAtom('C', i, 0, 0))
    const [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10] = cs
    const bonds = [
      newBond(c1.id, c2.id, 2), newBond(c2.id, c3.id), newBond(c3.id, c4.id, 2),
      newBond(c4.id, c5.id),    newBond(c5.id, c6.id, 2), newBond(c6.id, c1.id),
      newBond(c4.id, c7.id, 2), newBond(c7.id, c8.id),   newBond(c8.id, c9.id, 2),
      newBond(c9.id, c10.id),   newBond(c10.id, c5.id),
    ]
    const rings = findRings(cs, bonds, 8)
    const sixRings = rings.filter(r => r.length === 6)
    expect(sixRings.length).toBe(2)
  })
})

// ── 芳香性检测 ────────────────────────────────────────────────────────────────

describe('detectAromaticity — 芳香体系', () => {
  it('苯：芳香（6 π 电子）', () => {
    const { atoms, bonds } = makeBenzene()
    const { aromaticRings, aromaticAtoms } = detectAromaticity(mol(atoms, bonds))
    expect(aromaticRings).toHaveLength(1)
    expect(aromaticAtoms.size).toBe(6)
  })

  it('吡啶（C5H5N，N 有双键）：芳香（6 π 电子）', () => {
    // 5 个 C + 1 个 N，交替单双键，N 参与双键
    const cs = Array.from({ length: 5 }, (_, i) => {
      const a = (i * Math.PI * 2) / 6
      return newAtom('C', Math.cos(a), Math.sin(a), 0)
    })
    const n = newAtom('N', Math.cos(5 * Math.PI / 3), Math.sin(5 * Math.PI / 3), 0)
    const ring = [...cs, n]
    const bonds = ring.map((a, i) =>
      newBond(a.id, ring[(i + 1) % 6].id, i % 2 === 0 ? 2 : 1)
    )
    const { aromaticRings } = detectAromaticity(mol(ring, bonds))
    expect(aromaticRings).toHaveLength(1)
    expect(aromaticRings[0]).toContain(n.id)
  })

  it('吡咯（N-H，N 无双键在环内）：芳香（6 π 电子，N 贡献孤对）', () => {
    // 4 个 C + 1 个 N，N 无双键在环内（sp3 贡献孤对）
    const n  = newAtom('N', 0, 0, 0)
    const c1 = newAtom('C', 1, 0, 0)
    const c2 = newAtom('C', 1.5, 1, 0)
    const c3 = newAtom('C', 0.5, 1.5, 0)
    const c4 = newAtom('C', -0.5, 1, 0)
    const bonds = [
      newBond(n.id,  c1.id),        // N-C 单键（N 贡献孤对）
      newBond(c1.id, c2.id, 2),     // C=C
      newBond(c2.id, c3.id),        // C-C
      newBond(c3.id, c4.id, 2),     // C=C
      newBond(c4.id, n.id),         // C-N 单键
    ]
    const { aromaticRings, aromaticAtoms } = detectAromaticity(
      mol([n, c1, c2, c3, c4], bonds)
    )
    expect(aromaticRings).toHaveLength(1)
    expect(aromaticAtoms.has(n.id)).toBe(true)
  })

  it('呋喃（O 无双键在环内）：芳香（6 π 电子）', () => {
    const o  = newAtom('O', 0, 0, 0)
    const c1 = newAtom('C', 1, 0, 0)
    const c2 = newAtom('C', 1.5, 1, 0)
    const c3 = newAtom('C', 0.5, 1.5, 0)
    const c4 = newAtom('C', -0.5, 1, 0)
    const bonds = [
      newBond(o.id,  c1.id),
      newBond(c1.id, c2.id, 2),
      newBond(c2.id, c3.id),
      newBond(c3.id, c4.id, 2),
      newBond(c4.id, o.id),
    ]
    const { aromaticRings } = detectAromaticity(mol([o, c1, c2, c3, c4], bonds))
    expect(aromaticRings).toHaveLength(1)
  })

  it('噻吩（S 无双键在环内）：芳香', () => {
    const s  = newAtom('S', 0, 0, 0)
    const c1 = newAtom('C', 1, 0, 0)
    const c2 = newAtom('C', 1.5, 1, 0)
    const c3 = newAtom('C', 0.5, 1.5, 0)
    const c4 = newAtom('C', -0.5, 1, 0)
    const bonds = [
      newBond(s.id,  c1.id),
      newBond(c1.id, c2.id, 2),
      newBond(c2.id, c3.id),
      newBond(c3.id, c4.id, 2),
      newBond(c4.id, s.id),
    ]
    const { aromaticRings } = detectAromaticity(mol([s, c1, c2, c3, c4], bonds))
    expect(aromaticRings).toHaveLength(1)
  })
})

// ── 非芳香体系 ────────────────────────────────────────────────────────────────

describe('detectAromaticity — 非芳香体系', () => {
  it('环己烷（全 sp3）：非芳香', () => {
    const cs = Array.from({ length: 6 }, (_, i) => {
      const a = (i * Math.PI * 2) / 6
      return newAtom('C', Math.cos(a), Math.sin(a), 0)
    })
    const bonds = cs.map((c, i) => newBond(c.id, cs[(i + 1) % 6].id))
    const { aromaticRings } = detectAromaticity(mol(cs, bonds))
    expect(aromaticRings).toHaveLength(0)
  })

  it('环丁二烯（4 π 电子，反芳香）：非芳香', () => {
    const cs = [
      newAtom('C', 0, 0, 0), newAtom('C', 1, 0, 0),
      newAtom('C', 1, 1, 0), newAtom('C', 0, 1, 0),
    ]
    const bonds = [
      newBond(cs[0].id, cs[1].id, 2), newBond(cs[1].id, cs[2].id),
      newBond(cs[2].id, cs[3].id, 2), newBond(cs[3].id, cs[0].id),
    ]
    const { aromaticRings } = detectAromaticity(mol(cs, bonds))
    expect(aromaticRings).toHaveLength(0)
  })

  it('1,3-环己二烯（2 个双键，非完全共轭）：非芳香', () => {
    const cs = Array.from({ length: 6 }, (_, i) => {
      const a = (i * Math.PI * 2) / 6
      return newAtom('C', Math.cos(a), Math.sin(a), 0)
    })
    // 只有 2 个双键，有 2 个 sp3 碳 → 4 π 电子，不满足 Hückel
    const bonds = [
      newBond(cs[0].id, cs[1].id, 2), newBond(cs[1].id, cs[2].id),
      newBond(cs[2].id, cs[3].id, 2), newBond(cs[3].id, cs[4].id),
      newBond(cs[4].id, cs[5].id),    newBond(cs[5].id, cs[0].id),
    ]
    const { aromaticRings } = detectAromaticity(mol(cs, bonds))
    expect(aromaticRings).toHaveLength(0)
  })

  it('开链共轭体系（1,3-丁二烯）：无环，非芳香', () => {
    const cs = Array.from({ length: 4 }, (_, i) => newAtom('C', i, 0, 0))
    const bonds = [
      newBond(cs[0].id, cs[1].id, 2),
      newBond(cs[1].id, cs[2].id),
      newBond(cs[2].id, cs[3].id, 2),
    ]
    const { aromaticRings } = detectAromaticity(mol(cs, bonds))
    expect(aromaticRings).toHaveLength(0)
  })
})

// ── 芳香键 ────────────────────────────────────────────────────────────────────

describe('aromaticBonds', () => {
  it('苯：6 个键全部是芳香键', () => {
    const { atoms, bonds } = makeBenzene()
    const { aromaticBonds } = detectAromaticity(mol(atoms, bonds))
    expect(aromaticBonds.size).toBe(6)
  })
})

// ── 纯函数 ────────────────────────────────────────────────────────────────────

describe('纯函数', () => {
  it('空分子：无芳香环', () => {
    const { aromaticRings } = detectAromaticity(mol([], []))
    expect(aromaticRings).toHaveLength(0)
  })

  it('不修改原始分子', () => {
    const { atoms, bonds } = makeBenzene()
    const m = mol(atoms, bonds)
    detectAromaticity(m)
    expect(m.atoms.length).toBe(6)
  })
})
