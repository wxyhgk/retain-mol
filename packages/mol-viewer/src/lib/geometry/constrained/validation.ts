import type { Atom, Molecule, Vector3Data } from '../../model/types'
import { calcAngle, calcDihedral } from '../measure'
import { analyzeHelicalPath } from './helicity'
import type {
  GeometryConstraint,
  GeometryConstraintIssue,
  GeometryConstraintMeasurement,
  GeometryConstraintReport,
} from './contracts'

const EPSILON = 1e-10

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function id(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function nonnegative(value: unknown): value is number {
  return finite(value) && value >= 0
}

function position(value: unknown): value is Vector3Data {
  return record(value) && finite(value.x) && finite(value.y) && finite(value.z)
}

function edgeKey(first: string, second: string): string {
  return JSON.stringify([first, second].sort())
}

function distance(first: Vector3Data, second: Vector3Data): number {
  return Math.hypot(first.x - second.x, first.y - second.y, first.z - second.z)
}

function unitFrom(origin: Vector3Data, point: Vector3Data): Vector3Data | null {
  const magnitude = distance(origin, point)
  if (!Number.isFinite(magnitude) || magnitude <= EPSILON) return null
  return { x: (point.x - origin.x) / magnitude, y: (point.y - origin.y) / magnitude, z: (point.z - origin.z) / magnitude }
}

function measureAngle(first: Vector3Data, center: Vector3Data, last: Vector3Data): number | null {
  const before = unitFrom(center, first)
  const after = unitFrom(center, last)
  return before && after ? calcAngle(before, { x: 0, y: 0, z: 0 }, after) : null
}

function measureDihedral(first: Vector3Data, second: Vector3Data, third: Vector3Data, fourth: Vector3Data): number | null {
  if (!noncollinear(first, second, third) || !noncollinear(second, third, fourth)) return null
  const before = unitFrom(second, first)!
  const middle = unitFrom(second, third)!
  const after = unitFrom(third, fourth)!
  return calcDihedral(before, { x: 0, y: 0, z: 0 }, middle, { x: middle.x + after.x, y: middle.y + after.y, z: middle.z + after.z })
}

function noncollinear(first: Vector3Data, center: Vector3Data, last: Vector3Data): boolean {
  const firstLength = distance(first, center)
  const lastLength = distance(last, center)
  if (!Number.isFinite(firstLength) || !Number.isFinite(lastLength) || firstLength <= EPSILON || lastLength <= EPSILON) return false
  const x1 = (first.x - center.x) / firstLength
  const y1 = (first.y - center.y) / firstLength
  const z1 = (first.z - center.z) / firstLength
  const x2 = (last.x - center.x) / lastLength
  const y2 = (last.y - center.y) / lastLength
  const z2 = (last.z - center.z) / lastLength
  return Math.hypot(y1 * z2 - z1 * y2, z1 * x2 - x1 * z2, x1 * y2 - y1 * x2) > EPSILON
}

function wrappedDifference(actual: number, target: number): number {
  const normalizedTarget = ((target % 360) + 360) % 360
  return Math.abs((((actual - normalizedTarget) % 360) + 540) % 360 - 180)
}

function atomIdsOf(constraint: Record<string, unknown>): readonly string[] {
  if (constraint.kind === 'position') return id(constraint.atomId) ? [constraint.atomId] : []
  return Array.isArray(constraint.atomIds) ? constraint.atomIds.filter(id) : []
}

function constraintProblem(raw: Record<string, unknown>, atoms: ReadonlyMap<string, Atom>, edges: ReadonlySet<string>): string | undefined {
  if (!id(raw.id)) return 'Constraint ID must be a nonempty string.'
  if (raw.strength !== 'hard' && raw.strength !== 'soft') return 'Constraint strength must be hard or soft.'
  if (raw.weight !== undefined && (!finite(raw.weight) || raw.weight <= 0)) return 'Constraint weight must be finite and positive.'
  const atomIds = atomIdsOf(raw)
  if (raw.kind === 'position') {
    if (!id(raw.atomId) || !position(raw.target) || !nonnegative(raw.tolerance)) return 'Position constraints require an atom ID, finite target coordinates and a nonnegative tolerance.'
  } else {
    const expectedLength = raw.kind === 'distance' || raw.kind === 'minimum-distance' ? 2 : raw.kind === 'angle' ? 3 : raw.kind === 'dihedral' ? 4 : undefined
    if (raw.kind !== 'helicity' && expectedLength === undefined) return 'Unknown geometry constraint kind.'
    if (!Array.isArray(raw.atomIds) || raw.atomIds.length !== atomIds.length || new Set(atomIds).size !== atomIds.length) return 'Constraint atom IDs must be distinct, nonempty strings.'
    if (expectedLength !== undefined && atomIds.length !== expectedLength) return `This constraint requires exactly ${expectedLength} atom IDs.`
    if (raw.kind === 'distance' && (!nonnegative(raw.target) || !nonnegative(raw.tolerance))) return 'Distance target and tolerance must be finite and nonnegative.'
    if (raw.kind === 'minimum-distance' && (!nonnegative(raw.minimum) || !nonnegative(raw.tolerance))) return 'Minimum distance and tolerance must be finite and nonnegative.'
    if (raw.kind === 'angle' || raw.kind === 'dihedral') {
      if (!finite(raw.targetDegrees) || !nonnegative(raw.toleranceDegrees) || raw.toleranceDegrees > 180) return 'Angular target must be finite; angular tolerance must be between 0 and 180 degrees.'
      if (raw.kind === 'angle' && (raw.targetDegrees < 0 || raw.targetDegrees > 180)) return 'Angle target must be between 0 and 180 degrees.'
    }
    if (raw.kind === 'helicity') {
      if (atomIds.length < 4 || (raw.handedness !== 'right' && raw.handedness !== 'left') || !finite(raw.minTwistDegrees) || raw.minTwistDegrees <= 0 || raw.minTwistDegrees > 90) return 'Helicity requires at least four atoms, right or left handedness, and a minimum twist above 0 and at most 90 degrees.'
      for (let index = 1; index < atomIds.length; index += 1) {
        if (!edges.has(edgeKey(atomIds[index - 1]!, atomIds[index]!))) return 'Consecutive helicity path atoms must be bonded.'
      }
    }
  }
  if (atomIds.some(atomId => !atoms.has(atomId))) return 'Constraint references an atom that is absent from the molecule.'
  return undefined
}

/**
 * Checks only explicit geometric requirements, not chemical stability or energy.
 * Undefined measurements fail the report even for soft preferences. Their penalty
 * saturates at Number.MAX_VALUE so callers never receive NaN or Infinity.
 */
export function validateGeometryConstraints(molecule: Molecule, constraints: readonly GeometryConstraint[]): GeometryConstraintReport {
  const issues: GeometryConstraintIssue[] = []
  const measurements: GeometryConstraintMeasurement[] = []
  const atoms = new Map<string, Atom>()
  const edges = new Set<string>()
  const inputIssue = (message: string, atomIds: readonly string[] = []) => issues.push({ code: 'invalid-input', message, atomIds })
  const invalidReport = (): GeometryConstraintReport => ({ validInput: false, satisfied: false, hardViolationCount: 0, softPenalty: 0, measurements, issues })

  if (!record(molecule) || !Array.isArray(molecule.atoms) || !Array.isArray(molecule.bonds)) {
    inputIssue('Molecule must contain atom and bond arrays.')
    return invalidReport()
  }
  for (const atom of molecule.atoms as readonly Atom[]) {
    if (!record(atom) || !id(atom.id)) {
      inputIssue('Every atom must have a nonempty string ID.')
      continue
    }
    const atomId = atom.id
    if (atoms.has(atomId)) inputIssue('Atom IDs must be unique.', [atomId])
    if (!position(atom)) inputIssue('Atom coordinates must be finite.', [atomId])
    atoms.set(atomId, atom)
  }
  const bondIds = new Set<string>()
  for (const bond of molecule.bonds) {
    if (!record(bond) || !id(bond.id)) {
      inputIssue('Every bond must have a nonempty string ID.')
      continue
    }
    if (bondIds.has(bond.id)) inputIssue('Bond IDs must be unique.')
    bondIds.add(bond.id)
    if (!id(bond.atomId1) || !id(bond.atomId2) || !atoms.has(bond.atomId1) || !atoms.has(bond.atomId2)) {
      inputIssue('Bond endpoints must reference existing atoms.', [bond.atomId1, bond.atomId2].filter(id))
      continue
    }
    if (bond.atomId1 === bond.atomId2) inputIssue('Self bonds are not valid topology.', [bond.atomId1])
    const key = edgeKey(bond.atomId1, bond.atomId2)
    if (edges.has(key)) inputIssue('Only one bond is allowed between an atom pair.', [bond.atomId1, bond.atomId2])
    edges.add(key)
    if (bond.order !== 1 && bond.order !== 2 && bond.order !== 3) inputIssue('Bond order must be 1, 2, or 3.', [bond.atomId1, bond.atomId2])
  }
  if (!Array.isArray(constraints)) {
    inputIssue('Constraints must be an array.')
    return invalidReport()
  }
  const constraintIds = new Set<string>()
  for (const constraint of constraints as readonly GeometryConstraint[]) {
    if (!record(constraint)) {
      issues.push({ code: 'invalid-constraint', message: 'Each constraint must be an object.', atomIds: [] })
      continue
    }
    const problem = constraintProblem(constraint, atoms, edges)
    const duplicate = id(constraint.id) && constraintIds.has(constraint.id)
    if (id(constraint.id)) constraintIds.add(constraint.id)
    if (problem || duplicate) issues.push({ code: 'invalid-constraint', message: problem ?? 'Constraint IDs must be unique.', ...(id(constraint.id) ? { constraintId: constraint.id } : {}), atomIds: atomIdsOf(constraint) })
  }
  if (issues.length > 0) return invalidReport()

  let hardViolationCount = 0
  let softPenalty = 0
  let hasUndefinedMeasurement = false
  for (const constraint of constraints as readonly GeometryConstraint[]) {
    const atomIds = constraint.kind === 'position' ? [constraint.atomId] : constraint.atomIds
    const selected = atomIds.map(atomId => atoms.get(atomId)!)
    const first = selected[0]!
    const second = selected[1]!
    const third = selected[2]!
    const fourth = selected[3]!
    let actual: number | null = null
    let violation: number | null = null
    let unit: 'angstrom' | 'degree' = 'degree'
    switch (constraint.kind) {
      case 'distance':
        unit = 'angstrom'
        actual = distance(first, second)
        violation = Math.max(0, Math.abs(actual - constraint.target) - constraint.tolerance)
        break
      case 'minimum-distance':
        unit = 'angstrom'
        actual = distance(first, second)
        violation = Math.max(0, constraint.minimum - constraint.tolerance - actual)
        break
      case 'position':
        unit = 'angstrom'
        actual = distance(first, constraint.target)
        violation = Math.max(0, actual - constraint.tolerance)
        break
      case 'angle':
        actual = measureAngle(first, second, third)
        if (actual !== null) {
          violation = Math.max(0, Math.abs(actual - constraint.targetDegrees) - constraint.toleranceDegrees)
        }
        break
      case 'dihedral':
        actual = measureDihedral(first, second, third, fourth)
        if (actual !== null) {
          violation = Math.max(0, wrappedDifference(actual, constraint.targetDegrees) - constraint.toleranceDegrees)
        }
        break
      case 'helicity': {
        const analysis = analyzeHelicalPath(molecule, constraint.atomIds, constraint.minTwistDegrees)
        issues.push(...analysis.issues.map(issue => ({ ...issue, constraintId: constraint.id })))
        if (analysis.turnsDegrees.length > 0 && analysis.turnsDegrees.every(turn => turn !== null && Number.isFinite(turn))) {
          const sign = constraint.handedness === 'right' ? 1 : -1
          actual = analysis.turnsDegrees.reduce<number>((minimum, turn) => Math.min(minimum, sign * turn!), Infinity)
          violation = Math.max(0, constraint.minTwistDegrees - actual)
        }
        break
      }
    }
    if (actual === null || violation === null || !Number.isFinite(actual) || !Number.isFinite(violation)) {
      actual = null
      violation = null
      hasUndefinedMeasurement = true
      if (!issues.some(issue => issue.constraintId === constraint.id && issue.code === 'degenerate-geometry')) issues.push({ code: 'degenerate-geometry', constraintId: constraint.id, atomIds, message: 'Constraint cannot be measured from these coordinates.' })
    }
    // A small rounding allowance avoids rejecting exact constructions after rigid motion.
    const satisfied = violation !== null && violation <= EPSILON
    if (!satisfied && constraint.strength === 'hard') hardViolationCount += 1
    if (constraint.strength === 'soft') {
      const penalty = violation === null ? Number.MAX_VALUE : (constraint.weight ?? 1) * violation * violation
      softPenalty = Math.min(Number.MAX_VALUE, softPenalty + penalty)
    }
    measurements.push({ constraintId: constraint.id, kind: constraint.kind, strength: constraint.strength, atomIds, actual, unit, violation, satisfied })
  }
  return { validInput: true, satisfied: hardViolationCount === 0 && !hasUndefinedMeasurement, hardViolationCount, softPenalty, measurements, issues }
}
