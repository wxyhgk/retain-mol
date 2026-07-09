import { describe, expect, it } from 'vitest'
import type { Bond, Molecule } from '../../../molecule'
import { getFragment } from '../../fragmentLibrary'
import { placeFragmentStandalone } from './placement'
import { buildRingFuseFragmentFrame, buildRingFuseTargetFrame } from './ringFuseGeometry'
import { planRingFusePlacement } from './ringFusePlacement'

const benzene = getFragment('benzene')!

function ccBonds(mol: Molecule): Bond[] {
  const byId = new Map(mol.atoms.map(atom => [atom.id, atom]))
  return mol.bonds.filter(bond =>
    byId.get(bond.atomId1)?.symbol === 'C' &&
    byId.get(bond.atomId2)?.symbol === 'C',
  )
}

function counts(mol: Molecule): Record<string, number> {
  const result: Record<string, number> = {}
  for (const atom of mol.atoms) result[atom.symbol] = (result[atom.symbol] ?? 0) + 1
  return result
}

describe('planRingFusePlacement', () => {
  it('plans a benzene-on-benzene fuse candidate', () => {
    const mol = placeFragmentStandalone({ atoms: [], bonds: [] }, benzene, { x: 0, y: 0, z: 0 })
    const bond = ccBonds(mol)[0]
    const targetAtom1 = mol.atoms.find(atom => atom.id === bond.atomId1)!
    const targetAtom2 = mol.atoms.find(atom => atom.id === bond.atomId2)!
    const [f1i, f2i] = benzene.attachBond!
    const isH = (index: number) => benzene.atoms[index].symbol === 'H'
    const skip = new Set<number>([f1i, f2i])
    for (const fb of benzene.bonds) {
      if (fb.a === f1i || fb.a === f2i) {
        if (isH(fb.b)) skip.add(fb.b)
      } else if (fb.b === f1i || fb.b === f2i) {
        if (isH(fb.a)) skip.add(fb.a)
      }
    }

    const fragmentFrame = buildRingFuseFragmentFrame(benzene, f1i, f2i)
    expect(fragmentFrame).not.toBeNull()
    if (!fragmentFrame) return
    const targetFrame = buildRingFuseTargetFrame(mol, targetAtom1, targetAtom2)

    const candidate = planRingFusePlacement({
      molecule: mol,
      fragment: benzene,
      f1i,
      f2i,
      targetAtom1,
      targetAtom2,
      skip,
      isHydrogenIndex: isH,
      fragmentMidpoint: fragmentFrame.midpoint,
      fragmentAxis1: fragmentFrame.axis1,
      fragmentAxis2: fragmentFrame.axis2,
      fragmentAxis3: fragmentFrame.axis3,
      fragmentCentroid: fragmentFrame.centroid,
      targetMidpoint: targetFrame.midpoint,
      targetAxis1: targetFrame.axis1,
      preferredTargetAxis2: targetFrame.preferredAxis2,
      orderOverride: new Map(),
      atomById: new Map(mol.atoms.map(atom => [atom.id, atom])),
    })

    expect(candidate).not.toBeNull()
    if (!candidate) return
    expect(counts(candidate.molecule)).toEqual({ C: 10, H: 8 })
    expect(candidate.mergeCount).toBe(0)
  })
})
