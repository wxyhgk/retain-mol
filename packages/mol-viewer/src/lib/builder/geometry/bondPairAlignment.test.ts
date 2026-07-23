import { describe, expect, it } from 'vitest'
import type { Molecule } from '../../molecule'
import type { SceneObject } from '../../sceneObject'
import { runAlignBondPairGeometry } from './bondPairAlignment'

function sceneObject(id: string, molecule: Molecule, locked = false): SceneObject {
  return {
    id,
    molecule,
    name: id,
    visible: true,
    locked,
    offset: { x: 0, y: 0, z: 0 },
    createdAt: 0,
  }
}

const referenceMolecule: Molecule = {
  atoms: [
    { id: 'a1', symbol: 'C', x: -1, y: 0, z: 0 },
    { id: 'a2', symbol: 'C', x: 0, y: 0, z: 0 },
  ],
  bonds: [{ id: 'bond-a', atomId1: 'a1', atomId2: 'a2', order: 1 }],
}

const movingMolecule: Molecule = {
  atoms: [
    { id: 'b1', symbol: 'C', x: 0, y: 3, z: 1 },
    { id: 'b2', symbol: 'C', x: 1, y: 3, z: 2 },
    { id: 'b3', symbol: 'H', x: 0, y: 4, z: 1 },
  ],
  bonds: [
    { id: 'bond-b', atomId1: 'b1', atomId2: 'b2', order: 1 },
    { id: 'bond-tail', atomId1: 'b1', atomId2: 'b3', order: 1 },
  ],
}

function distance(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
}

describe('runAlignBondPairGeometry', () => {
  it('moves the complete disconnected fragment rigidly and meets d/θ/coplanarity', () => {
    const objectsById = {
      reference: sceneObject('reference', referenceMolecule),
      moving: sceneObject('moving', movingMolecule),
    }
    const beforeB1 = movingMolecule.atoms[0]!
    const beforeB2 = movingMolecule.atoms[1]!
    const beforeB3 = movingMolecule.atoms[2]!

    const result = runAlignBondPairGeometry(objectsById, ['reference', 'moving'], {
      referenceBondId: 'bond-a',
      movingBondId: 'bond-b',
      referenceAnchorAtomId: 'a2',
      movingAnchorAtomId: 'b1',
      anchorDistance: 2.5,
      axisAngleDegrees: 60,
      azimuthDegrees: 35,
      coplanar: true,
      coplanarDirection: 0,
      moveWholeFragment: true,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.diagnostics.anchorDistance).toBeCloseTo(2.5, 10)
    expect(result.diagnostics.axisAngleDegrees).toBeCloseTo(60, 10)
    expect(result.diagnostics.orientedVolume).toBeCloseTo(0, 10)
    expect([...result.diagnostics.movedAtomIds]).toEqual(
      expect.arrayContaining(['b1', 'b2', 'b3']),
    )

    const moved = result.objectsById.moving!.molecule
    const afterB1 = moved.atoms.find(atom => atom.id === 'b1')!
    const afterB2 = moved.atoms.find(atom => atom.id === 'b2')!
    const afterB3 = moved.atoms.find(atom => atom.id === 'b3')!
    expect(distance(afterB1, afterB2)).toBeCloseTo(distance(beforeB1, beforeB2), 10)
    expect(distance(afterB1, afterB3)).toBeCloseTo(distance(beforeB1, beforeB3), 10)
    expect(distance(afterB2, afterB3)).toBeCloseTo(distance(beforeB2, beforeB3), 10)
    expect(result.objectsById.reference).toBe(objectsById.reference)
  })

  it('supports the opposite 180° coplanar direction', () => {
    const objectsById = {
      reference: sceneObject('reference', referenceMolecule),
      moving: sceneObject('moving', movingMolecule),
    }
    const zero = runAlignBondPairGeometry(objectsById, ['reference', 'moving'], {
      referenceBondId: 'bond-a',
      movingBondId: 'bond-b',
      referenceAnchorAtomId: 'a2',
      movingAnchorAtomId: 'b1',
      anchorDistance: 2,
      axisAngleDegrees: 45,
      azimuthDegrees: 0,
      coplanar: true,
      coplanarDirection: 0,
    })
    const reversed = runAlignBondPairGeometry(objectsById, ['reference', 'moving'], {
      referenceBondId: 'bond-a',
      movingBondId: 'bond-b',
      referenceAnchorAtomId: 'a2',
      movingAnchorAtomId: 'b1',
      anchorDistance: 2,
      axisAngleDegrees: 45,
      azimuthDegrees: 0,
      coplanar: true,
      coplanarDirection: 180,
    })

    expect(zero.ok && Math.abs(zero.diagnostics.orientedVolume)).toBeLessThan(1e-10)
    expect(reversed.ok && Math.abs(reversed.diagnostics.orientedVolume)).toBeLessThan(1e-10)
    if (!zero.ok || !reversed.ok) return
    const radialSign = (result: typeof zero) => {
      if (!result.ok) return 0
      const molecule = result.objectsById.moving!.molecule
      const b1 = molecule.atoms.find(atom => atom.id === 'b1')!
      const b2 = molecule.atoms.find(atom => atom.id === 'b2')!
      return Math.sign((b2.y - b1.y) * b1.y + (b2.z - b1.z) * b1.z)
    }
    expect(radialSign(zero)).toBe(1)
    expect(radialSign(reversed)).toBe(-1)
  })

  it('returns explicit reasons for connected and locked moving fragments', () => {
    const connected: Molecule = {
      atoms: [...referenceMolecule.atoms, ...movingMolecule.atoms],
      bonds: [
        ...referenceMolecule.bonds,
        ...movingMolecule.bonds,
        { id: 'bridge', atomId1: 'a2', atomId2: 'b1', order: 1 },
      ],
    }
    const connectedResult = runAlignBondPairGeometry(
      { all: sceneObject('all', connected) },
      ['all'],
      {
        referenceBondId: 'bond-a',
        movingBondId: 'bond-b',
        referenceAnchorAtomId: 'a2',
        movingAnchorAtomId: 'b1',
        anchorDistance: 2,
        axisAngleDegrees: 90,
        azimuthDegrees: 0,
        coplanar: false,
      },
    )
    expect(connectedResult).toMatchObject({ ok: false, code: 'connected-bond-pair' })

    const lockedResult = runAlignBondPairGeometry(
      {
        reference: sceneObject('reference', referenceMolecule),
        moving: sceneObject('moving', movingMolecule, true),
      },
      ['reference', 'moving'],
      {
        referenceBondId: 'bond-a',
        movingBondId: 'bond-b',
        referenceAnchorAtomId: 'a2',
        movingAnchorAtomId: 'b1',
        anchorDistance: 2,
        axisAngleDegrees: 90,
        azimuthDegrees: 0,
        coplanar: false,
      },
    )
    expect(lockedResult).toMatchObject({ ok: false, code: 'moving-object-locked' })
  })
})
