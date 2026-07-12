import * as THREE from 'three'
import type { Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { isBetterPlacementScore, scoreMoleculePlacement } from '../../geometry/placementPlanner'
import { SINGLE_BOND_TORSION_ANGLES } from '../../geometry/singleBondTorsion'

export interface AttachPlacementInput {
  readonly molecule: Molecule
  readonly fragment: FragmentDef
  readonly attachOrigin: THREE.Vector3
  readonly alignedRotation: THREE.Quaternion
  readonly anchor: THREE.Vector3
  readonly axis: THREE.Vector3
  readonly skipIndex: number
  readonly excludeAtomIds: ReadonlySet<string>
  /** Explicit single-bond roll. Undefined selects the least-clashing angle automatically. */
  readonly torsionAngleDegrees?: number
}

export interface AttachPlacementPlan {
  readonly rotation: THREE.Quaternion
}

export function planAttachFragmentPlacement(input: AttachPlacementInput): AttachPlacementPlan {
  if (input.torsionAngleDegrees !== undefined) {
    return {
      rotation: rotationAtAngle(input, input.torsionAngleDegrees * Math.PI / 180),
    }
  }
  const angles = SINGLE_BOND_TORSION_ANGLES.map(deg => (deg * Math.PI) / 180)
  let best = input.alignedRotation
  let bestScore = scoreAttachRotation(input, best)

  for (const angle of angles.slice(1)) {
    const rotation = rotationAtAngle(input, angle)
    const score = scoreAttachRotation(input, rotation)
    if (isBetterPlacementScore(score, bestScore)) {
      best = rotation
      bestScore = score
    }
  }

  return { rotation: best }
}

function rotationAtAngle(input: AttachPlacementInput, angleRadians: number) {
  const roll = new THREE.Quaternion().setFromAxisAngle(input.axis, angleRadians)
  return roll.multiply(input.alignedRotation.clone())
}

function scoreAttachRotation(input: AttachPlacementInput, rotation: THREE.Quaternion) {
  const candidates = input.fragment.atoms
    .map((atom, index) => {
      if (index === input.skipIndex) return null
      const p = new THREE.Vector3(atom.x, atom.y, atom.z)
        .sub(input.attachOrigin)
        .applyQuaternion(rotation)
        .add(input.anchor)
      return { id: `${index}`, symbol: atom.symbol, x: p.x, y: p.y, z: p.z }
    })
    .filter((p): p is { id: string; symbol: string; x: number; y: number; z: number } => p !== null)
  return scoreMoleculePlacement(
    input.molecule.atoms,
    { atoms: candidates, bonds: [] },
    { excludeAtomIds: input.excludeAtomIds },
  )
}
