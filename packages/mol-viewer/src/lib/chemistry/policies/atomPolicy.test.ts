import { describe, expect, it } from 'vitest'
import { newAtom, newBond, type Atom, type Bond, type Molecule } from '../../molecule'
import { isPotentialStereoCenter } from './atomPolicy'

function build(atoms: Atom[], bonds: Bond[]): Molecule {
  return { atoms, bonds, name: 'probe' }
}

function methylOn(centerId: string): { atoms: Atom[]; bonds: Bond[]; carbon: Atom } {
  const carbon = newAtom('C')
  const hydrogens = [newAtom('H'), newAtom('H'), newAtom('H')]
  return {
    atoms: [carbon, ...hydrogens],
    bonds: [
      newBond(centerId, carbon.id),
      ...hydrogens.map(h => newBond(carbon.id, h.id)),
    ],
    carbon,
  }
}

describe('isPotentialStereoCenter', () => {
  it('甲基碳不再误报（3 个相同 H 配体）', () => {
    const center = newAtom('C')
    const methyl = methylOn(center.id)
    const other = newAtom('C')
    const mol = build(
      [center, ...methyl.atoms, other],
      [...methyl.bonds, newBond(center.id, other.id)],
    )
    expect(isPotentialStereoCenter(mol, center.id)).toBe(false)
  })

  it('亚甲基碳不再误报（2 个 H 配体）', () => {
    const center = newAtom('C')
    const h1 = newAtom('H')
    const h2 = newAtom('H')
    const c1 = newAtom('C')
    const c2 = newAtom('C')
    const mol = build(
      [center, h1, h2, c1, c2],
      [newBond(center.id, h1.id), newBond(center.id, h2.id), newBond(center.id, c1.id), newBond(center.id, c2.id)],
    )
    expect(isPotentialStereoCenter(mol, center.id)).toBe(false)
  })

  it('叔丁基式中心不再误报（3 个相同甲基 + 1 环碳）', () => {
    const center = newAtom('C')
    const ring = newAtom('C')
    const methyls = [methylOn(center.id), methylOn(center.id), methylOn(center.id)]
    const mol = build(
      [center, ring, ...methyls.flatMap(m => m.atoms)],
      [...methyls.flatMap(m => m.bonds), newBond(center.id, ring.id)],
    )
    expect(isPotentialStereoCenter(mol, center.id)).toBe(false)
  })

  it('异丙醇中心碳不再误报（2 个相同甲基 + O + H）', () => {
    const center = newAtom('C')
    const oxygen = newAtom('O')
    const hydrogen = newAtom('H')
    const methyls = [methylOn(center.id), methylOn(center.id)]
    const mol = build(
      [center, oxygen, hydrogen, ...methyls.flatMap(m => m.atoms)],
      [
        newBond(center.id, oxygen.id),
        newBond(center.id, hydrogen.id),
        ...methyls.flatMap(m => m.bonds),
      ],
    )
    expect(isPotentialStereoCenter(mol, center.id)).toBe(false)
  })

  it('真潜在中心仍提示（H + O + 甲基 + 羧基碳，各不相同）', () => {
    const center = newAtom('C')
    const hydrogen = newAtom('H')
    const hydroxyl = newAtom('O')
    const methyl = methylOn(center.id)
    const carboxyl = newAtom('C')
    const carbonylO = newAtom('O')
    const mol = build(
      [center, hydrogen, hydroxyl, ...methyl.atoms, carboxyl, carbonylO],
      [
        newBond(center.id, hydrogen.id),
        newBond(center.id, hydroxyl.id),
        ...methyl.bonds,
        newBond(center.id, carboxyl.id),
        newBond(carboxyl.id, carbonylO.id, 2),
      ],
    )
    expect(isPotentialStereoCenter(mol, center.id)).toBe(true)
  })

  it('4 个全不相同的重原子配体仍提示', () => {
    const center = newAtom('C')
    const n = newAtom('N')
    const o = newAtom('O')
    const f = newAtom('F')
    const c = newAtom('C')
    const mol = build(
      [center, n, o, f, c],
      [newBond(center.id, n.id), newBond(center.id, o.id), newBond(center.id, f.id), newBond(center.id, c.id)],
    )
    expect(isPotentialStereoCenter(mol, center.id)).toBe(true)
  })

  it('保留原有排除项：非 C/Si、键数不足', () => {
    const nitrogen = newAtom('N')
    const ligands = [newAtom('C'), newAtom('C'), newAtom('O'), newAtom('H')]
    const molN = build(
      [nitrogen, ...ligands],
      ligands.map(l => newBond(nitrogen.id, l.id)),
    )
    expect(isPotentialStereoCenter(molN, nitrogen.id)).toBe(false)

    const center = newAtom('C')
    const threeSpokes = build(
      [center, newAtom('C'), newAtom('O'), newAtom('H')],
      [newBond(center.id, 'x-missing')],
    )
    expect(isPotentialStereoCenter(threeSpokes, center.id)).toBe(false)
  })
})
