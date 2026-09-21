import type { Atom, Molecule, Vector3Data } from '../../model/types'
import { cross, dot } from '../../math/vec3'
import type { Vec3 } from '../../math/vec3'
import type { GeometryConstraintIssue } from './contracts'

/**
 * Local geometric handedness of an explicitly ordered, bonded open path.
 * This is not a chemical P/M assignment or a whole-ring topological invariant.
 */
export interface HelicalPathAnalysis {
  readonly status: 'right' | 'left' | 'mixed' | 'indeterminate' | 'invalid'
  /**
   * One value for each consecutive four-atom window, in path order. Positive
   * means right-handed: (cos(t), sin(t), positivePitch * t) has positive turns
   * when sampled with steps between 0 and pi. A null value is degenerate.
   *
   * Each turn is the signed departure from the nearest coplanar arrangement,
   * in [-90, 90] degrees, not the raw chemical dihedral angle. Both coplanar
   * branches (0 and +/-180 degrees) therefore give zero. Before this folding,
   * the sign is the opposite of the project's calcDihedral convention.
   */
  readonly turnsDegrees: readonly (number | null)[]
  readonly issues: readonly GeometryConstraintIssue[]
}

const MIN_BOND_LENGTH = 1e-10
const MIN_NORMAL_LENGTH = 1e-8
const ZERO_TURN_DEGREES = 1e-10

function unit(vector: Vec3, minimumLength: number): Vec3 | null {
  const magnitude = Math.hypot(...vector)
  if (!Number.isFinite(magnitude) || magnitude <= minimumLength) return null
  return [vector[0] / magnitude, vector[1] / magnitude, vector[2] / magnitude]
}

function direction(from: Vector3Data, to: Vector3Data): Vec3 | null {
  return unit([to.x - from.x, to.y - from.y, to.z - from.z], MIN_BOND_LENGTH)
}

/** Internal per-window primitive shared by the solver and independent path analysis. */
export function measureLocalHelicalTurn(
  first: Vector3Data, second: Vector3Data, third: Vector3Data, fourth: Vector3Data,
): number | null {
  const firstBond = direction(first, second)
  const middleBond = direction(second, third)
  const lastBond = direction(third, fourth)
  if (!firstBond || !middleBond || !lastBond) return null
  const firstNormal = unit(cross(firstBond, middleBond), MIN_NORMAL_LENGTH)
  const lastNormal = unit(cross(middleBond, lastBond), MIN_NORMAL_LENGTH)
  if (!firstNormal || !lastNormal) return null
  const signedSine = dot(middleBond, cross(firstNormal, lastNormal))
  const absoluteCosine = Math.abs(dot(firstNormal, lastNormal))
  const turn = Math.atan2(signedSine, absoluteCosine) * 180 / Math.PI
  return Math.abs(turn) <= ZERO_TURN_DEGREES ? 0 : turn
}

/**
 * Analyze local turns without altering the molecule. Reversing the entire
 * path preserves handedness; reflecting coordinates reverses it. This finite
 * path heuristic deliberately makes no claim about unsampled curve segments.
 * Every consecutive pair must be bonded; the path must contain at least four unique
 * atom IDs, and minTwistDegrees must be finite and in (0, 90].
 */
export function analyzeHelicalPath(
  molecule: Molecule,
  atomIds: readonly string[],
  minTwistDegrees: number,
): HelicalPathAnalysis {
  const issues: GeometryConstraintIssue[] = []
  if (!Number.isFinite(minTwistDegrees) || minTwistDegrees <= 0 || minTwistDegrees > 90) {
    issues.push({ code: 'invalid-constraint', message: 'Minimum path twist must be in (0, 90] degrees.', atomIds })
  }
  if (atomIds.length < 4 || new Set(atomIds).size !== atomIds.length) {
    issues.push({ code: 'invalid-constraint', message: 'A helical path requires at least four distinct atom IDs.', atomIds })
  }

  const atomsById = new Map<string, Atom>()
  for (const atom of molecule.atoms) {
    if (atomsById.has(atom.id)) {
      issues.push({ code: 'invalid-input', message: 'Duplicate molecule atom ID.', atomIds: [atom.id] })
    }
    atomsById.set(atom.id, atom)
  }
  const path: Atom[] = []
  for (const id of atomIds) {
    const atom = atomsById.get(id)
    if (!atom) {
      issues.push({ code: 'invalid-constraint', message: 'Helical path atom does not exist.', atomIds: [id] })
    } else if (![atom.x, atom.y, atom.z].every(Number.isFinite)) {
      issues.push({ code: 'invalid-input', message: 'Helical path coordinates must be finite.', atomIds: [id] })
    } else {
      path.push(atom)
    }
  }
  const adjacency = new Map<string, Set<string>>()
  for (const bond of molecule.bonds) {
    if (!adjacency.has(bond.atomId1)) adjacency.set(bond.atomId1, new Set())
    if (!adjacency.has(bond.atomId2)) adjacency.set(bond.atomId2, new Set())
    adjacency.get(bond.atomId1)?.add(bond.atomId2)
    adjacency.get(bond.atomId2)?.add(bond.atomId1)
  }
  for (let index = 1; index < atomIds.length; index += 1) {
    const previousId = atomIds[index - 1]!
    const currentId = atomIds[index]!
    if (!adjacency.get(previousId)?.has(currentId)) {
      issues.push({
        code: 'invalid-constraint', message: 'Consecutive helical path atoms must be bonded.',
        atomIds: [previousId, currentId],
      })
    }
  }
  if (issues.length > 0) return { status: 'invalid', turnsDegrees: [], issues }

  const turnsDegrees: (number | null)[] = []
  for (let index = 0; index <= path.length - 4; index += 1) {
    const turn = measureLocalHelicalTurn(path[index]!, path[index + 1]!, path[index + 2]!, path[index + 3]!)
    turnsDegrees.push(turn)
    if (turn === null) {
      issues.push({
        code: 'degenerate-geometry', message: 'Path turn is undefined for coincident or collinear atoms.',
        atomIds: atomIds.slice(index, index + 4),
      })
    }
  }
  const hasRight = turnsDegrees.some(turn => turn !== null && turn >= minTwistDegrees)
  const hasLeft = turnsDegrees.some(turn => turn !== null && turn <= -minTwistDegrees)
  const allDeterminate = turnsDegrees.every(turn => turn !== null && Math.abs(turn) >= minTwistDegrees)
  const status = hasRight && hasLeft ? 'mixed'
    : !allDeterminate ? 'indeterminate'
      : hasRight ? 'right' : 'left'
  return { status, turnsDegrees, issues }
}
