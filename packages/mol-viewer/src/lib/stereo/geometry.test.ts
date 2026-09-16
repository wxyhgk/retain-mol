import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../molecule'
import type { Molecule } from '../molecule'
import {
  checkTetraCenter,
  flipTetraBranches,
  parityFromCoords,
  signedTetraVolume,
  STEREO_VOLUME_EPS,
} from './geometry'

const LIGANDS = [
  { x: 1, y: 1, z: 1 },
  { x: 1, y: -1, z: -1 },
  { x: -1, y: 1, z: -1 },
  { x: -1, y: -1, z: 1 },
] as const

describe('signedTetraVolume', () => {
  const t = (p: { x: number; y: number; z: number }): [number, number, number] => [p.x, p.y, p.z]

  it('交换两顶点必变号', () => {
    const [p, q, r, s] = [t(LIGANDS[0]!), t(LIGANDS[1]!), t(LIGANDS[2]!), t(LIGANDS[3]!)]
    const v = signedTetraVolume(p, q, r, s)
    expect(Math.abs(v)).toBeGreaterThan(STEREO_VOLUME_EPS)
    expect(signedTetraVolume(q, p, r, s)).toBeCloseTo(-v, 10)
  })

  it('共面退化体积为零', () => {
    const v = signedTetraVolume(t({ x: 0, y: 0, z: 0 }), t({ x: 1, y: 0, z: 0 }), t({ x: 0, y: 1, z: 0 }), t({ x: 1, y: 1, z: 0 }))
    expect(v).toBeCloseTo(0, 10)
  })
})

describe('parityFromCoords / checkTetraCenter', () => {
  it('正常返回 ±1，退化返回 0', () => {
    expect(parityFromCoords([LIGANDS[0]!, LIGANDS[1]!, LIGANDS[2]!, LIGANDS[3]!])).not.toBe(0)
    expect(
      parityFromCoords([
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 1, y: 1, z: 0 },
      ]),
    ).toBe(0)
  })

  it('真值表：ok / inverted / degenerate / unspecified', () => {
    const ring: [typeof LIGANDS[number], typeof LIGANDS[number], typeof LIGANDS[number], typeof LIGANDS[number]] =
      [LIGANDS[0]!, LIGANDS[1]!, LIGANDS[2]!, LIGANDS[3]!]
    const parity = parityFromCoords(ring)
    expect(parity).not.toBe(0)
    if (parity === 0) return
    expect(checkTetraCenter(parity, ring)).toBe('ok')
    expect(checkTetraCenter(parity === 1 ? -1 : 1, ring)).toBe('inverted')
    expect(checkTetraCenter(undefined, ring)).toBe('unspecified')
    expect(
      checkTetraCenter(parity, [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 1, y: 1, z: 0 },
      ]),
    ).toBe('degenerate')
  })
})

function chiralMolecule(): { mol: Molecule; centerId: string; ligandIds: [string, string, string, string] } {
  const center = newAtom('C', 0, 0, 0)
  const ligands = LIGANDS.map(() => newAtom('H', 0, 0, 0))
  const positioned = ligands.map((l, i) => ({ ...l, ...LIGANDS[i]! }))
  // 第一个配体挂一个甲基分支，验证刚性整体搬运
  const methyl = newAtom('C', positioned[0]!.x + 1.1, positioned[0]!.y, positioned[0]!.z)
  const methylH = newAtom('H', positioned[0]!.x + 1.7, positioned[0]!.y + 0.9, positioned[0]!.z)
  return {
    mol: {
      atoms: [center, ...positioned, methyl, methylH],
      bonds: [
        ...positioned.map(l => newBond(center.id, l.id, 1)),
        newBond(positioned[0]!.id, methyl.id, 1),
        newBond(methyl.id, methylH.id, 1),
      ],
    },
    centerId: center.id,
    ligandIds: [positioned[0]!.id, positioned[1]!.id, positioned[2]!.id, positioned[3]!.id],
  }
}

describe('flipTetraBranches', () => {
  it('交换两分支后体积变号、分支内部几何不变、其余原子不动', () => {
    const { mol, centerId, ligandIds } = chiralMolecule()
    const [a, b] = [ligandIds[0]!, ligandIds[1]!]
    const before = parityFromCoords([
      mol.atoms.find(x => x.id === ligandIds[0])!,
      mol.atoms.find(x => x.id === ligandIds[1])!,
      mol.atoms.find(x => x.id === ligandIds[2])!,
      mol.atoms.find(x => x.id === ligandIds[3])!,
    ])
    expect(before).not.toBe(0)

    const result = flipTetraBranches(mol, centerId, a, b)
    expect(result).not.toBeNull()
    if (!result) return
    const { molecule: flipped, result: info } = result
    expect(info).toEqual({ flippedAId: a, flippedBId: b })
    const methylAtom = mol.atoms.find(x => x.symbol === 'C' && x.id !== centerId)!
    const methylHAtom = mol.atoms.find(x => x.symbol === 'H' && !ligandIds.includes(x.id))!

    // 体积变号（同一配体序读翻转后坐标）
    const after = parityFromCoords([
      flipped.atoms.find(x => x.id === ligandIds[0])!,
      flipped.atoms.find(x => x.id === ligandIds[1])!,
      flipped.atoms.find(x => x.id === ligandIds[2])!,
      flipped.atoms.find(x => x.id === ligandIds[3])!,
    ])
    expect(after).toBe(before === 1 ? -1 : 1)

    // 甲基分支内部 C–H 距离不变（刚性搬运）
    const dist = (m: Molecule, x: string, y: string): number => {
      const pa = m.atoms.find(z => z.id === x)!
      const pb = m.atoms.find(z => z.id === y)!
      return Math.hypot(pa.x - pb.x, pa.y - pb.y, pa.z - pb.z)
    }
    expect(dist(flipped, methylAtom.id, methylHAtom.id)).toBeCloseTo(
      dist(mol, methylAtom.id, methylHAtom.id),
      10,
    )

    // 未参与原子坐标不变，拓扑（id/键）不变
    for (const atom of mol.atoms) {
      if (atom.id === a || atom.id === b) continue
      if (atom.id === methylAtom.id || atom.id === methylHAtom.id) continue
      expect(flipped.atoms.find(x => x.id === atom.id)).toMatchObject({
        x: atom.x,
        y: atom.y,
        z: atom.z,
      })
    }
    expect(flipped.bonds).toEqual(mol.bonds)
  })

  it('非法输入返回 null', () => {
    const { mol, centerId, ligandIds } = chiralMolecule()
    expect(flipTetraBranches(mol, centerId, ligandIds[0]!, ligandIds[0]!)).toBeNull()
    expect(flipTetraBranches(mol, centerId, ligandIds[0]!, 'missing')).toBeNull()
    expect(flipTetraBranches(mol, 'missing', ligandIds[0]!, ligandIds[1]!)).toBeNull()
  })
})
