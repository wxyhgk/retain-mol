import { add, length, normalize, rotateAround, sub } from '../math/vec3'
import type { Vec3 } from '../math/vec3'

export const SINGLE_BOND_TORSION_STEP_DEGREES = 15
export const SINGLE_BOND_TORSION_ANGLES = Object.freeze(
  Array.from(
    { length: 360 / SINGLE_BOND_TORSION_STEP_DEGREES },
    (_, index) => index * SINGLE_BOND_TORSION_STEP_DEGREES,
  ),
)

export interface SingleBondTorsionCandidate {
  readonly angleDegrees: number
  readonly points: Vec3[]
}

export interface ScoredSingleBondTorsion extends SingleBondTorsionCandidate {
  readonly score: number
}

export type SingleBondTorsionScore = (points: readonly Vec3[]) => number

/** Rotate points from their supplied coordinates around a bond axis using the right-hand rule. */
export function rotatePointsAroundBondAxis(
  points: readonly Vec3[],
  bondAxis: Vec3,
  anchor: Vec3,
  angleDegrees: number,
): Vec3[] {
  if (length(bondAxis) < 1e-9) {
    throw new Error('Bond axis must have non-zero length')
  }

  const axis = normalize(bondAxis)
  const angleRadians = angleDegrees * (Math.PI / 180)

  return points.map(point => (
    add(anchor, rotateAround(sub(point, anchor), axis, angleRadians))
  ))
}

/** Generate absolute-angle candidates at 15 degree intervals from 0 through 345 degrees. */
export function generateSingleBondTorsionCandidates(
  points: readonly Vec3[],
  bondAxis: Vec3,
  anchor: Vec3,
): SingleBondTorsionCandidate[] {
  return SINGLE_BOND_TORSION_ANGLES.map(angleDegrees => ({
    angleDegrees,
    points: rotatePointsAroundBondAxis(points, bondAxis, anchor, angleDegrees),
  }))
}

/** Select the lowest-scoring absolute-angle candidate; ties retain the smaller angle. */
export function selectBestSingleBondTorsion(
  points: readonly Vec3[],
  bondAxis: Vec3,
  anchor: Vec3,
  score: SingleBondTorsionScore,
): ScoredSingleBondTorsion {
  let best: ScoredSingleBondTorsion | undefined

  for (const candidate of generateSingleBondTorsionCandidates(points, bondAxis, anchor)) {
    const candidateScore = score(candidate.points)
    if (!best || candidateScore < best.score) {
      best = { ...candidate, score: candidateScore }
    }
  }

  return best!
}

