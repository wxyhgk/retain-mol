import type { Atom, Molecule } from '../../molecule'
import { shiftMolecule } from '../../molecule'
import { isBetterClashScore, scoreClashes, type ClashScore } from './clash'
import { ClashSpatialIndex } from './clashSpatialIndex'

export interface PlacementVector {
  readonly x: number
  readonly y: number
  readonly z: number
}

export interface PlacementPlanOptions {
  readonly avoidClashes?: boolean
  readonly orientation?: PlacementVector
  readonly excludeAtomIds?: ReadonlySet<string>
}

export interface PlacementPlan {
  readonly molecule: Molecule
  readonly score: ClashScore
  readonly offset: PlacementVector
}

export type PlacementScore = ClashScore

const ZERO_OFFSET: PlacementVector = { x: 0, y: 0, z: 0 }

export function planMoleculePlacement(
  baseAtoms: readonly Atom[],
  placement: Molecule,
  options: PlacementPlanOptions = {},
): PlacementPlan {
  const initialScore = scoreMoleculePlacement(baseAtoms, placement, options)
  let best: PlacementPlan = {
    molecule: placement,
    score: initialScore,
    offset: ZERO_OFFSET,
  }

  if (
    options.avoidClashes === false ||
    baseAtoms.length === 0 ||
    placement.atoms.length === 0 ||
    initialScore.overlapPenalty <= 1e-9
  ) {
    return best
  }

  const clashIndex = new ClashSpatialIndex(baseAtoms, options.excludeAtomIds)

  for (const offset of placementOffsetCandidates(options.orientation)) {
    const candidate = shiftMolecule(placement, offset.x, offset.y, offset.z)
    const score = clashIndex.score(candidate.atoms)
    if (isBetterClashScore(score, best.score)) {
      best = { molecule: candidate, score, offset }
      if (score.overlapPenalty <= 1e-9) break
    }
  }

  return best.molecule === placement
    ? best
    : {
        ...best,
        score: scoreMoleculePlacement(baseAtoms, best.molecule, options),
      }
}

export function scoreMoleculePlacement(
  baseAtoms: readonly Atom[],
  placement: Molecule,
  options: Pick<PlacementPlanOptions, 'excludeAtomIds'> = {},
): ClashScore {
  return scoreClashes(placement.atoms, baseAtoms, options.excludeAtomIds)
}

export function isBetterPlacementScore(candidate: ClashScore, current: ClashScore): boolean {
  return isBetterClashScore(candidate, current)
}

export function avoidMoleculePlacementClashes(
  baseAtoms: readonly Atom[],
  placement: Molecule,
  options: PlacementPlanOptions = {},
): Molecule {
  return planMoleculePlacement(baseAtoms, placement, options).molecule
}

export function placementOffsetCandidates(
  orientation?: PlacementVector,
): PlacementVector[] {
  const normal = normalizeVector(orientation) ?? { x: 0, y: 0, z: 1 }
  const ref = Math.abs(normal.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 0, y: 1, z: 0 }
  const u = normalizeVector(crossVector(normal, ref)) ?? { x: 1, y: 0, z: 0 }
  const v = normalizeVector(crossVector(normal, u)) ?? { x: 0, y: 1, z: 0 }
  const offsets: PlacementVector[] = []
  const radii = [0.6, 1.0, 1.4, 1.9, 2.5, 3.2, 4.0, 5.0, 6.5]
  for (const radius of radii) {
    const samples = radius < 1.2 ? 8 : 16
    for (let i = 0; i < samples; i++) {
      const angle = (Math.PI * 2 * i) / samples
      offsets.push({
        x: (Math.cos(angle) * u.x + Math.sin(angle) * v.x) * radius,
        y: (Math.cos(angle) * u.y + Math.sin(angle) * v.y) * radius,
        z: (Math.cos(angle) * u.z + Math.sin(angle) * v.z) * radius,
      })
    }
  }
  return offsets
}

function normalizeVector(
  v?: PlacementVector,
): PlacementVector | null {
  if (!v) return null
  const length = Math.hypot(v.x, v.y, v.z)
  if (length < 1e-9) return null
  return { x: v.x / length, y: v.y / length, z: v.z / length }
}

function crossVector(a: PlacementVector, b: PlacementVector): PlacementVector {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }
}
