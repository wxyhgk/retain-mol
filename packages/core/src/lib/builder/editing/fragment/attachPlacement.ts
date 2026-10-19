import type { Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { isBetterPlacementScore, scoreMoleculePlacement } from '../../geometry/placementPlanner'
import { SINGLE_BOND_TORSION_ANGLES } from '../../geometry/singleBondTorsion'
import {
  add,
  applyQuat,
  multiplyQuats,
  quatFromAxisAngle,
  sub,
  type Quat,
  type Vec3,
} from '../../math'

export interface AttachPlacementInput {
  readonly molecule: Molecule
  readonly fragment: FragmentDef
  readonly attachOrigin: Vec3
  readonly alignedRotation: Quat
  readonly anchor: Vec3
  readonly axis: Vec3
  readonly skipIndex: number
  readonly excludeAtomIds: ReadonlySet<string>
  /** Explicit single-bond roll. Undefined selects the least-clashing angle automatically. */
  readonly torsionAngleDegrees?: number
}

export interface AttachPlacementPlan {
  readonly rotation: Quat
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
  const roll = quatFromAxisAngle(input.axis, angleRadians)
  return multiplyQuats(roll, input.alignedRotation)
}

function scoreAttachRotation(input: AttachPlacementInput, rotation: Quat) {
  const candidates = input.fragment.atoms
    .map((atom, index) => {
      if (index === input.skipIndex) return null
      const p = add(applyQuat(sub([atom.x, atom.y, atom.z], input.attachOrigin), rotation), input.anchor)
      return { id: `${index}`, symbol: atom.symbol, x: p[0], y: p[1], z: p[2] }
    })
    .filter((p): p is { id: string; symbol: string; x: number; y: number; z: number } => p !== null)
  return scoreMoleculePlacement(
    input.molecule.atoms,
    { atoms: candidates, bonds: [] },
    { excludeAtomIds: input.excludeAtomIds },
  )
}
