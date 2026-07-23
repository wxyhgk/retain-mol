import { describe, expect, it } from 'vitest'
import type { Molecule } from '../../molecule'
import type { SceneObject } from '../../sceneObject'
import {
  inspectBondPairGeometry,
  runAlignBondPairGeometry,
} from './bondPairAlignment'

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

    const hiddenMoving = {
      ...sceneObject('moving', movingMolecule),
      visible: false,
    }
    expect(inspectBondPairGeometry(
      {
        reference: sceneObject('reference', referenceMolecule),
        moving: hiddenMoving,
      },
      ['reference', 'moving'],
      {
        referenceBondId: 'bond-a',
        movingBondId: 'bond-b',
        referenceAnchorAtomId: 'a2',
        movingAnchorAtomId: 'b1',
      },
    )).toMatchObject({ ok: false, code: 'moving-object-hidden' })
    expect(inspectBondPairGeometry(
      {
        reference: sceneObject('reference', referenceMolecule),
        moving: sceneObject('moving', movingMolecule),
      },
      ['reference', 'moving'],
      {
        referenceBondId: 'bond-a',
        movingBondId: 'bond-b',
        referenceAnchorAtomId: 'not-on-reference',
        movingAnchorAtomId: 'b1',
      },
    )).toMatchObject({ ok: false, code: 'reference-anchor-not-on-bond' })
  })

  it('changes φ and θ independently while preserving d and rigid fragment distances', () => {
    const objectsById = {
      reference: sceneObject('reference', referenceMolecule),
      moving: sceneObject('moving', movingMolecule),
    }
    const inspected = inspectBondPairGeometry(objectsById, ['reference', 'moving'], {
      referenceBondId: 'bond-a',
      movingBondId: 'bond-b',
      referenceAnchorAtomId: 'a2',
      movingAnchorAtomId: 'b1',
    })
    expect(inspected.ok).toBe(true)
    if (!inspected.ok) return

    const afterAzimuth = runAlignBondPairGeometry(objectsById, ['reference', 'moving'], {
      referenceBondId: 'bond-a',
      movingBondId: 'bond-b',
      referenceAnchorAtomId: 'a2',
      movingAnchorAtomId: 'b1',
      anchorDistance: inspected.snapshot.value.distance,
      axisAngleDegrees: inspected.snapshot.value.axisAngleDegrees,
      azimuthDegrees: 47,
      coplanar: false,
      moveWholeFragment: true,
    })
    expect(afterAzimuth.ok).toBe(true)
    if (!afterAzimuth.ok) return
    expect(afterAzimuth.diagnostics.anchorDistance).toBeCloseTo(
      inspected.snapshot.value.distance,
      10,
    )
    expect(afterAzimuth.diagnostics.axisAngleDegrees).toBeCloseTo(
      inspected.snapshot.value.axisAngleDegrees,
      10,
    )

    const beforeThetaMolecule = afterAzimuth.objectsById.moving!.molecule
    const beforeDistances = [
      distance(beforeThetaMolecule.atoms[0]!, beforeThetaMolecule.atoms[1]!),
      distance(beforeThetaMolecule.atoms[0]!, beforeThetaMolecule.atoms[2]!),
      distance(beforeThetaMolecule.atoms[1]!, beforeThetaMolecule.atoms[2]!),
    ]
    const afterTheta = runAlignBondPairGeometry(
      afterAzimuth.objectsById,
      ['reference', 'moving'],
      {
        referenceBondId: 'bond-a',
        movingBondId: 'bond-b',
        referenceAnchorAtomId: 'a2',
        movingAnchorAtomId: 'b1',
        anchorDistance: inspected.snapshot.value.distance,
        axisAngleDegrees: 123.5,
        azimuthDegrees: 0,
        coplanar: false,
        moveWholeFragment: true,
      },
    )
    expect(afterTheta.ok).toBe(true)
    if (!afterTheta.ok) return
    expect(afterTheta.diagnostics.anchorDistance).toBeCloseTo(
      inspected.snapshot.value.distance,
      10,
    )
    expect(afterTheta.diagnostics.axisAngleDegrees).toBeCloseTo(123.5, 10)
    const afterThetaMolecule = afterTheta.objectsById.moving!.molecule
    expect([
      distance(afterThetaMolecule.atoms[0]!, afterThetaMolecule.atoms[1]!),
      distance(afterThetaMolecule.atoms[0]!, afterThetaMolecule.atoms[2]!),
      distance(afterThetaMolecule.atoms[1]!, afterThetaMolecule.atoms[2]!),
    ]).toEqual(beforeDistances.map(value => expect.closeTo(value, 10)))
  })
})
