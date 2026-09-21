import type { Atom, Molecule } from '../../model/types'
import { calcAngle, calcDihedral, calcDistance } from '../measure'
import type {
  ConstrainedGeometryRequest, ConstrainedGeometryResult, GeometryConstraint,
  GeometryConstraintIssue, GeometryConstraintReport,
} from './contracts'
import { validateGeometryConstraints } from './validation'
import { measureLocalHelicalTurn } from './helicity'
import { checkPreservedStereoGeometry } from './stereochemistry'
import { leastSquaresStep, numericalJacobian, objective } from './solverHelpers'
import type { NumericalTerm } from './solverHelpers'

type MutableAtom = Omit<Atom, 'x' | 'y' | 'z'> & { x: number; y: number; z: number }
const AXES = ['x', 'y', 'z'] as const
const DEGREE_SCALE = Math.PI / 120
const DEFAULT_ITERATIONS = 200
const MAX_ITERATIONS = 2000

function failed(
  molecule: Molecule, report: GeometryConstraintReport, iterations: number,
  reason: string, invalid = false, attemptReport?: GeometryConstraintReport,
): ConstrainedGeometryResult {
  return {
    ok: false, status: invalid ? 'invalid-input' : 'not-converged', molecule, report,
    ...(attemptReport ? { attemptReport } : {}), iterations, movedAtomIds: [], reason,
  }
}

function withIssues(report: GeometryConstraintReport, issues: readonly GeometryConstraintIssue[]): GeometryConstraintReport {
  return { ...report, validInput: false, satisfied: false, issues: [...report.issues, ...issues] }
}

/** Preserve measured geometry, not idealized chemical bond lengths or angles. */
function implicitConstraints(
  molecule: Molecule, request: ConstrainedGeometryRequest,
): GeometryConstraint[] {
  const constraints: GeometryConstraint[] = []
  const usedIds = new Set(request.constraints.map(constraint => constraint.id))
  const uniqueId = (label: string): string => {
    let id = `geometry-preserve:${label}`
    while (usedIds.has(id)) id += ':'
    usedIds.add(id)
    return id
  }
  const atoms = new Map(molecule.atoms.map(atom => [atom.id, atom]))
  const neighbors = new Map(molecule.atoms.map(atom => [atom.id, new Set<string>()]))
  for (const bond of molecule.bonds) {
    const first = atoms.get(bond.atomId1)!
    const second = atoms.get(bond.atomId2)!
    neighbors.get(first.id)!.add(second.id)
    neighbors.get(second.id)!.add(first.id)
    constraints.push({
      id: uniqueId(`bond:${bond.id}`), kind: 'distance', strength: 'hard',
      atomIds: [first.id, second.id], target: calcDistance(first, second),
      tolerance: request.bondLengthTolerance ?? 0.03,
    })
  }
  for (const center of molecule.atoms) {
    const adjacent = [...neighbors.get(center.id)!].sort()
    for (let first = 0; first < adjacent.length; first += 1) {
      for (let second = first + 1; second < adjacent.length; second += 1) {
        const firstId = adjacent[first]!
        const secondId = adjacent[second]!
        constraints.push({
          id: uniqueId(`angle:${JSON.stringify([firstId, center.id, secondId])}`),
          kind: 'angle', strength: 'hard', atomIds: [firstId, center.id, secondId],
          targetDegrees: calcAngle(atoms.get(firstId)!, center, atoms.get(secondId)!),
          toleranceDegrees: request.angleToleranceDegrees ?? 10,
        })
      }
    }
  }
  const minimum = request.nonbondedMinimumDistance ?? 0.8
  if (minimum > 0) for (let first = 0; first < molecule.atoms.length; first += 1) {
    const firstAtom = molecule.atoms[first]!
    const close = new Set([firstAtom.id, ...neighbors.get(firstAtom.id)!])
    for (const neighbor of neighbors.get(firstAtom.id)!) {
      for (const secondNeighbor of neighbors.get(neighbor)!) close.add(secondNeighbor)
    }
    for (let second = first + 1; second < molecule.atoms.length; second += 1) {
      const secondAtom = molecule.atoms[second]!
      if (close.has(secondAtom.id)) continue
      constraints.push({
        id: uniqueId(`nonbonded:${JSON.stringify([firstAtom.id, secondAtom.id])}`),
        kind: 'minimum-distance', strength: 'hard', atomIds: [firstAtom.id, secondAtom.id],
        minimum, tolerance: 1e-4,
      })
    }
  }
  return constraints
}

function outsideRange(delta: number, tolerance: number): number {
  return Math.sign(delta) * Math.max(0, Math.abs(delta) - tolerance)
}

function wrappedDegrees(value: number): number {
  return ((value % 360) + 540) % 360 - 180
}

/**
 * Residuals use the actual allowed ranges: shrinking every hard tolerance can
 * turn overlapping requirements into an artificial conflict. Hard acceptance
 * is independently checked afterwards, including rounding at a range boundary.
 */
function termsFor(
  constraints: readonly GeometryConstraint[], atoms: ReadonlyMap<string, MutableAtom>,
  variables: ReadonlyMap<string, readonly number[]>,
): NumericalTerm[] {
  const terms: NumericalTerm[] = []
  for (const constraint of constraints) {
    const ids = constraint.kind === 'position' ? [constraint.atomId] : constraint.atomIds
    const points = ids.map(id => atoms.get(id)!)
    const factor = constraint.strength === 'hard' ? 1 : Math.sqrt(constraint.weight ?? 1) * 0.1
    const add = (value: () => number, involved = ids): void => {
      terms.push({ variables: involved.flatMap(id => variables.get(id) ?? []), value: () => value() * factor })
    }
    switch (constraint.kind) {
      case 'distance':
        add(() => outsideRange(calcDistance(points[0]!, points[1]!) - constraint.target, constraint.tolerance))
        break
      case 'minimum-distance':
        add(() => Math.min(0, calcDistance(points[0]!, points[1]!) - constraint.minimum + constraint.tolerance))
        break
      case 'angle':
        add(() => outsideRange(calcAngle(points[0]!, points[1]!, points[2]!) - constraint.targetDegrees, constraint.toleranceDegrees) * DEGREE_SCALE)
        break
      case 'dihedral':
        add(() => outsideRange(wrappedDegrees(calcDihedral(points[0]!, points[1]!, points[2]!, points[3]!) - wrappedDegrees(constraint.targetDegrees)), constraint.toleranceDegrees) * DEGREE_SCALE)
        break
      case 'position':
        for (const axis of AXES) add(() => {
          const distance = calcDistance(points[0]!, constraint.target)
          if (distance <= constraint.tolerance || distance === 0) return 0
          return (points[0]![axis] - constraint.target[axis]) * (1 - constraint.tolerance / distance)
        })
        break
      case 'helicity':
        for (let start = 0; start <= points.length - 4; start += 1) {
          const window = points.slice(start, start + 4)
          add(() => {
            const turn = measureLocalHelicalTurn(window[0]!, window[1]!, window[2]!, window[3]!)
            if (turn === null) return NaN
            const aligned = turn * (constraint.handedness === 'right' ? 1 : -1)
            return Math.min(0, aligned - constraint.minTwistDegrees) * DEGREE_SCALE
          }, ids.slice(start, start + 4))
        }
        break
    }
  }
  return terms
}

/**
 * Deterministic, bounded local coordinate deformation. Every original bond
 * (including ring closures) and adjacent angle is constrained. This is not a
 * force field, global conformer generator, or continuous collision guarantee.
 * Only explicitly movable atoms are variables. Hard feasibility gates success;
 * soft preferences are improved when possible but cannot authorize violations.
 */
export function solveConstrainedGeometry(
  molecule: Molecule,
  request: ConstrainedGeometryRequest,
): ConstrainedGeometryResult {
  if (typeof request !== 'object' || request === null || Array.isArray(request)) {
    const report = withIssues(validateGeometryConstraints(molecule, []), [{ code: 'invalid-input', message: 'A local geometry request must be an object.', atomIds: [] }])
    return failed(molecule, report, 0, 'Invalid local solver request.', true)
  }
  const inputReport = validateGeometryConstraints(molecule, request.constraints)
  if (!inputReport.validInput) return failed(molecule, inputReport, 0, 'Invalid molecule or geometry constraints.', true)
  const issues: GeometryConstraintIssue[] = []
  const atomIds = new Set(molecule.atoms.map(atom => atom.id))
  if (!Array.isArray(request.movableAtomIds) || request.movableAtomIds.length > 1000 || new Set(request.movableAtomIds).size !== request.movableAtomIds.length
    || Array.from(request.movableAtomIds).some(id => !atomIds.has(id))) {
    issues.push({ code: 'invalid-input', message: 'Movable atom IDs must be unique existing atom IDs (at most 1000).', atomIds: [] })
  }
  if (request.constraints.length > 1000 || request.constraints.some(constraint => constraint.kind === 'helicity' && constraint.atomIds.length > 1000)) {
    issues.push({ code: 'invalid-input', message: 'A request permits at most 1000 constraints and at most 1000 atoms per helical path.', atomIds: [] })
  }
  const maxIterations = request.maxIterations ?? DEFAULT_ITERATIONS
  if (!Number.isInteger(maxIterations) || maxIterations < 0 || maxIterations > MAX_ITERATIONS) {
    issues.push({ code: 'invalid-input', message: `Iteration limit must be an integer in [0, ${MAX_ITERATIONS}].`, atomIds: [] })
  }
  for (const [name, value] of Object.entries({
    bondLengthTolerance: request.bondLengthTolerance ?? 0.03,
    angleToleranceDegrees: request.angleToleranceDegrees ?? 10,
    nonbondedMinimumDistance: request.nonbondedMinimumDistance ?? 0.8,
  })) {
    if (!Number.isFinite(value) || value < 0 || (name === 'angleToleranceDegrees' && value > 180)) {
      issues.push({ code: 'invalid-input', message: `${name} must be finite, nonnegative, and within its geometric domain.`, atomIds: [] })
    }
  }
  if (issues.length > 0) return failed(molecule, withIssues(inputReport, issues), 0, 'Invalid local solver request.', true)

  const constraints = [...request.constraints, ...implicitConstraints(molecule, request)]
  const evaluate = (candidate: Molecule): GeometryConstraintReport => {
    const report = validateGeometryConstraints(candidate, constraints)
    const stereoIssues = checkPreservedStereoGeometry(molecule, candidate)
    if (stereoIssues.length === 0) return report
    return {
      ...report, satisfied: false, hardViolationCount: report.hardViolationCount + stereoIssues.length,
      issues: [...report.issues, ...stereoIssues],
    }
  }
  const initialReport = evaluate(molecule)
  if (!initialReport.validInput || initialReport.issues.length > 0) {
    const invalid = initialReport.issues.some(issue => issue.code !== 'stereochemistry-violation')
    return failed(molecule, initialReport, 0, 'Starting geometry contains invalid or degenerate measurements.', invalid)
  }
  const movable = new Set(request.movableAtomIds)
  const movingAtoms: MutableAtom[] = []
  const currentAtoms = molecule.atoms.map(atom => {
    if (!movable.has(atom.id)) return atom
    const copy = { ...atom }
    movingAtoms.push(copy)
    return copy
  })
  const atomMap = new Map(currentAtoms.map(atom => [atom.id, atom]))
  const variables = new Map(movingAtoms.map((atom, index) => [atom.id, [index * 3, index * 3 + 1, index * 3 + 2]]))
  const read = (index: number): number => movingAtoms[Math.floor(index / 3)]![AXES[index % 3]!]!
  const write = (index: number, value: number): void => { movingAtoms[Math.floor(index / 3)]![AXES[index % 3]!] = value }
  const count = movingAtoms.length * 3
  const coordinates = (): Float64Array => Float64Array.from({ length: count }, (_, index) => read(index))
  const restore = (saved: Float64Array): void => { saved.forEach((value, index) => write(index, value)) }
  const currentMolecule: Molecule = { ...molecule, atoms: currentAtoms }
  const terms = termsFor(constraints, atomMap, variables)
  let best: { coordinates: Float64Array; report: GeometryConstraintReport } | undefined
  let currentReport = initialReport
  const remember = (): void => {
    if (currentReport.satisfied && (!best || currentReport.softPenalty < best.report.softPenalty)) {
      best = { coordinates: coordinates(), report: currentReport }
    }
  }
  remember()
  let cost = objective(terms)
  let damping = 1e-3
  let iterations = 0
  for (; iterations < maxIterations && count > 0; iterations += 1) {
    if (currentReport.satisfied && currentReport.softPenalty <= 1e-14) break
    const jacobian = numericalJacobian(terms, read, write)
    if (!jacobian) break
    const step = leastSquaresStep(jacobian, count, damping)
    const longest = Math.max(0, ...movingAtoms.map((_, index) => Math.hypot(step[index * 3]!, step[index * 3 + 1]!, step[index * 3 + 2]!)))
    if (!Number.isFinite(longest) || longest < 1e-12) break
    // A trust region limits nonlinear distortion even for a distant target.
    const scale = Math.min(1, 0.25 / longest)
    const before = coordinates()
    let accepted = false
    for (let trial = 0; trial < 12; trial += 1) {
      const fraction = scale * 2 ** -trial
      for (let index = 0; index < count; index += 1) write(index, before[index]! + fraction * step[index]!)
      const trialCost = objective(terms)
      if (trialCost < cost - Math.max(1e-30, cost * 1e-12)) {
        cost = trialCost
        accepted = true
        damping = Math.max(1e-8, damping * 0.5)
        currentReport = evaluate(currentMolecule)
        remember()
        break
      }
    }
    if (!accepted) {
      restore(before)
      damping *= 10
      if (damping > 1e8) break
    }
  }
  if (!best) return failed(molecule, initialReport, iterations,
    'Local geometry requirements could not be satisfied within the iteration limit; input coordinates were preserved.',
    false, currentReport === initialReport ? undefined : currentReport)
  restore(best.coordinates)
  // Never trust just the objective, or a report made before restoring a point.
  const finalReport = evaluate(currentMolecule)
  if (!finalReport.satisfied) return failed(molecule, initialReport, iterations, 'Final hard constraint validation failed; input coordinates were preserved.', false, finalReport)
  const movedAtomIds = molecule.atoms.filter(atom => {
    const current = atomMap.get(atom.id)!
    return atom.x !== current.x || atom.y !== current.y || atom.z !== current.z
  }).map(atom => atom.id)
  return {
    ok: true, status: 'converged', molecule: movedAtomIds.length > 0 ? currentMolecule : molecule,
    report: finalReport, iterations, movedAtomIds,
  }
}
