import { describe, expect, it } from 'vitest'
import type { Molecule } from '../../model/types'
import { calcAngle, calcDihedral, calcDistance } from '../measure'
import { analyzeHelicalPath } from './helicity'
import { solveConstrainedGeometry } from './solver'
import { validateGeometryConstraints } from './validation'
import type { ConstrainedGeometryRequest, GeometryConstraint } from './contracts'

function ring(): Molecule {
  return {
    name: 'procedural six-membered ring',
    atoms: Array.from({ length: 6 }, (_, index) => ({
      id: `ring-${index}`, symbol: 'C', label: `Atom ${index}`,
      x: 1.5 * Math.cos(index * Math.PI / 3), y: 1.5 * Math.sin(index * Math.PI / 3), z: 0,
    })),
    bonds: Array.from({ length: 6 }, (_, index) => ({
      id: `bond-${index}`, atomId1: `ring-${index}`, atomId2: `ring-${(index + 1) % 6}`, order: 1 as const,
    })),
  }
}

function deformationRequest(molecule: Molecule): ConstrainedGeometryRequest {
  const atom = molecule.atoms[3]!
  return {
    movableAtomIds: molecule.atoms.slice(1).map(item => item.id),
    constraints: [{ id: 'lift', kind: 'position', strength: 'hard', atomId: atom.id,
      target: { x: atom.x, y: atom.y, z: 0.5 }, tolerance: 0.03 }],
  }
}

function zigzag(): Molecule {
  return { atoms: [[0, 0], [1, 0], [1, 1], [2, 1]].map(([x, y], index) => ({
    id: `a${index}`, symbol: 'C', x: x!, y: y!, z: 0,
  })), bonds: [0, 1, 2].map(index => ({ id: `b${index}`, atomId1: `a${index}`, atomId2: `a${index + 1}`, order: 1 as const })) }
}

describe('solveConstrainedGeometry', () => {
  it('collaboratively bends a closed ring while keeping its closure, angles, and pinned atom', () => {
    const molecule = ring()
    const before = structuredClone(molecule)
    const request = deformationRequest(molecule)
    const result = solveConstrainedGeometry(molecule, request)
    expect(result.ok, JSON.stringify(result.report)).toBe(true)
    expect(result.iterations).toBeGreaterThan(0)
    expect(result.iterations).toBeLessThanOrEqual(200)
    expect(result.movedAtomIds.length).toBeGreaterThan(1)
    expect(result.movedAtomIds).not.toContain('ring-0')
    expect(result.molecule.atoms[0]).toBe(molecule.atoms[0])
    expect(result.molecule.bonds).toBe(molecule.bonds)
    expect(result.molecule.name).toBe(molecule.name)
    expect(molecule).toEqual(before)
    expect(validateGeometryConstraints(result.molecule, request.constraints).satisfied).toBe(true)
    for (let index = 0; index < 6; index += 1) {
      const first = result.molecule.atoms[index]!
      const second = result.molecule.atoms[(index + 1) % 6]!
      const third = result.molecule.atoms[(index + 2) % 6]!
      expect(Math.abs(calcDistance(first, second) - 1.5)).toBeLessThanOrEqual(0.030000001)
      expect(Math.abs(calcAngle(first, second, third) - 120)).toBeLessThanOrEqual(10.00000001)
      expect(first.label).toBe(`Atom ${index}`)
    }
    expect(result.report.measurements.filter(item => item.constraintId.startsWith('geometry-preserve:bond:'))).toHaveLength(6)
  })

  it('returns the original input with diagnostics when all atoms are locked', () => {
    const molecule = ring()
    const result = solveConstrainedGeometry(molecule, { ...deformationRequest(molecule), movableAtomIds: [] })
    expect(result.ok).toBe(false)
    expect(result.status).toBe('not-converged')
    expect(result.molecule).toBe(molecule)
    expect(result.movedAtomIds).toEqual([])
    expect(result.iterations).toBe(0)
    expect(result.report.measurements.find(item => item.constraintId === 'lift')?.satisfied).toBe(false)
  })

  it('fails an impossible bonded distance without returning a partial deformation', () => {
    const molecule = ring()
    const result = solveConstrainedGeometry(molecule, {
      movableAtomIds: molecule.atoms.map(atom => atom.id), maxIterations: 25,
      constraints: [{ id: 'stretch', kind: 'distance', strength: 'hard', atomIds: ['ring-0', 'ring-1'], target: 4, tolerance: 0.001 }],
    })
    expect(result.ok).toBe(false)
    expect(result.molecule).toBe(molecule)
    expect(result.movedAtomIds).toEqual([])
    expect(result.report.hardViolationCount).toBeGreaterThan(0)
    expect(result.iterations).toBeLessThanOrEqual(25)
    expect(result.report.measurements.find(item => item.constraintId === 'stretch')?.actual).toBeCloseTo(1.5)
    expect(result.attemptReport?.measurements.find(item => item.constraintId === 'stretch')?.actual).not.toBeCloseTo(1.5)
  })

  it.each([0, 1])('honors an iteration budget of %d', maxIterations => {
    const molecule = ring()
    const result = solveConstrainedGeometry(molecule, { ...deformationRequest(molecule), maxIterations })
    expect(result.ok).toBe(false)
    expect(result.molecule).toBe(molecule)
    expect(result.iterations).toBeLessThanOrEqual(maxIterations)
  })

  it('is deterministic and accepts frozen immutable input', () => {
    const molecule = ring()
    molecule.atoms.forEach(Object.freeze)
    molecule.bonds.forEach(Object.freeze)
    Object.freeze(molecule.atoms)
    Object.freeze(molecule.bonds)
    Object.freeze(molecule)
    const request = deformationRequest(molecule)
    expect(solveConstrainedGeometry(molecule, request)).toEqual(solveConstrainedGeometry(molecule, request))
  })

  it('improves a soft preference without allowing it to override hard preservation', () => {
    const molecule = ring()
    const request = deformationRequest(molecule)
    const constraints = request.constraints.map(constraint => ({ ...constraint, strength: 'soft' as const }))
    const result = solveConstrainedGeometry(molecule, { ...request, constraints })
    expect(result.ok).toBe(true)
    expect(result.report.hardViolationCount).toBe(0)
    expect(result.report.softPenalty).toBeLessThan(validateGeometryConstraints(molecule, constraints).softPenalty)
  })

  it('retains a feasible starting point when a soft request is incompatible with it', () => {
    const molecule = ring()
    const result = solveConstrainedGeometry(molecule, {
      movableAtomIds: [],
      constraints: [{ id: 'preference', kind: 'position', strength: 'soft', atomId: 'ring-3', target: { x: 0, y: 0, z: 1 }, tolerance: 0.01 }],
    })
    expect(result.ok).toBe(true)
    expect(result.molecule).toBe(molecule)
    expect(result.report.softPenalty).toBeGreaterThan(0)
  })

  it('checks nonbonded overlap even when both atoms are fixed and the graph is disconnected', () => {
    const molecule: Molecule = { atoms: [
      { id: 'a', symbol: 'B', x: 0, y: 0, z: 0 },
      { id: 'b', symbol: 'N', x: 0.2, y: 0, z: 0 },
    ], bonds: [] }
    const result = solveConstrainedGeometry(molecule, { movableAtomIds: [], constraints: [] })
    expect(result.ok).toBe(false)
    expect(result.report.measurements[0]?.kind).toBe('minimum-distance')
    expect(solveConstrainedGeometry(molecule, { movableAtomIds: [], constraints: [], nonbondedMinimumDistance: 0 }).ok).toBe(true)
  })

  it('moves a nonbonded pair apart without moving the unlisted atom', () => {
    const molecule: Molecule = { atoms: [
      { id: 'a', symbol: 'F', x: 0, y: 0, z: 0 },
      { id: 'b', symbol: 'B', x: 0.2, y: 0, z: 0 },
    ], bonds: [] }
    const result = solveConstrainedGeometry(molecule, { movableAtomIds: ['b'], constraints: [] })
    expect(result.ok).toBe(true)
    expect(result.molecule.atoms[0]).toBe(molecule.atoms[0])
    expect(calcDistance(result.molecule.atoms[0]!, result.molecule.atoms[1]!)).toBeGreaterThanOrEqual(0.8 - 1e-4)
  })

  it.each([
    { movableAtomIds: ['missing'] }, { movableAtomIds: ['ring-1', 'ring-1'] }, { movableAtomIds: new Array<string>(1) },
    { maxIterations: -1 }, { maxIterations: 2001 }, { maxIterations: NaN },
    { angleToleranceDegrees: 181 }, { bondLengthTolerance: -0.1 },
    { nonbondedMinimumDistance: Infinity },
  ])('rejects invalid local request options %j', invalid => {
    const molecule = ring()
    const result = solveConstrainedGeometry(molecule, { ...deformationRequest(molecule), ...invalid })
    expect(result.status).toBe('invalid-input')
    expect(result.molecule).toBe(molecule)
    expect(result.iterations).toBe(0)
  })

  it('rejects nonfinite or degenerate starting geometry', () => {
    const molecule = ring()
    const nonfinite = { ...molecule, atoms: molecule.atoms.map((atom, index) => index === 0 ? { ...atom, x: NaN } : atom) }
    expect(solveConstrainedGeometry(nonfinite, deformationRequest(molecule)).status).toBe('invalid-input')
    const coincident = { ...molecule, atoms: molecule.atoms.map((atom, index) => index === 0 ? { ...atom, ...{ x: molecule.atoms[1]!.x, y: molecule.atoms[1]!.y } } : atom) }
    expect(solveConstrainedGeometry(coincident, deformationRequest(molecule)).status).toBe('invalid-input')
  })

  it('does not collide caller IDs with derived requirements', () => {
    const molecule = ring()
    const constraints: GeometryConstraint[] = [{ id: 'geometry-preserve:bond:bond-0', kind: 'distance', strength: 'hard', atomIds: ['ring-0', 'ring-1'], target: 1.5, tolerance: 0.001 }]
    const result = solveConstrainedGeometry(molecule, { movableAtomIds: [], constraints })
    expect(result.ok).toBe(true)
    expect(new Set(result.report.measurements.map(measurement => measurement.constraintId)).size).toBe(result.report.measurements.length)
  })

  it('can satisfy an angle request near the edge of its preserved-angle range', () => {
    const molecule = zigzag()
    const result = solveConstrainedGeometry(molecule, {
      movableAtomIds: ['a3'], constraints: [{ id: 'angle', kind: 'angle', strength: 'hard',
        atomIds: ['a1', 'a2', 'a3'], targetDegrees: 100, toleranceDegrees: 1 }],
    })
    expect(result.ok, JSON.stringify(result.attemptReport)).toBe(true)
    const angle = calcAngle(result.molecule.atoms[1]!, result.molecule.atoms[2]!, result.molecule.atoms[3]!)
    expect(angle).toBeGreaterThanOrEqual(99 - 1e-10)
    expect(angle).toBeLessThanOrEqual(100 + 1e-10)
  })

  it('accepts hard distance ranges that meet exactly at a boundary', () => {
    const molecule: Molecule = { atoms: [
      { id: 'a', symbol: 'C', x: 0, y: 0, z: 0 },
      { id: 'b', symbol: 'C', x: 1, y: 0, z: 0 },
    ], bonds: [] }
    const result = solveConstrainedGeometry(molecule, { movableAtomIds: ['b'], constraints: [
      { id: 'first', kind: 'distance', strength: 'hard', atomIds: ['a', 'b'], target: 1, tolerance: 1 },
      { id: 'second', kind: 'distance', strength: 'hard', atomIds: ['a', 'b'], target: 3, tolerance: 1 },
    ] })
    expect(result.ok, JSON.stringify(result.attemptReport)).toBe(true)
    expect(calcDistance(result.molecule.atoms[0]!, result.molecule.atoms[1]!)).toBeCloseTo(2, 9)
  })

  it('changes a dihedral with preserved adjacent bond lengths and angles', () => {
    const molecule = zigzag()
    const result = solveConstrainedGeometry(molecule, { movableAtomIds: ['a3'], constraints: [
      { id: 'dihedral', kind: 'dihedral', strength: 'hard', atomIds: ['a0', 'a1', 'a2', 'a3'], targetDegrees: 90, toleranceDegrees: 1 },
    ] })
    expect(result.ok, JSON.stringify(result.attemptReport)).toBe(true)
    expect(Math.abs(calcDihedral(result.molecule.atoms[0]!, result.molecule.atoms[1]!, result.molecule.atoms[2]!, result.molecule.atoms[3]!) - 90)).toBeLessThanOrEqual(1 + 1e-10)
  })

  it('normalizes large finite angular targets before subtracting measured angles', () => {
    const molecule = zigzag()
    const solve = (targetDegrees: number) => solveConstrainedGeometry(molecule, { movableAtomIds: ['a3'], constraints: [
      { id: 'dihedral', kind: 'dihedral', strength: 'hard', atomIds: ['a0', 'a1', 'a2', 'a3'], targetDegrees, toleranceDegrees: 1 },
    ] })
    expect(solve(1e20)).toEqual(solve(1e20 % 360))
  })

  it('creates the requested local handedness from a nondegenerate planar path', () => {
    const molecule = zigzag()
    const ids = molecule.atoms.map(atom => atom.id)
    const result = solveConstrainedGeometry(molecule, { movableAtomIds: ['a3'], constraints: [
      { id: 'turn', kind: 'helicity', strength: 'hard', atomIds: ids, handedness: 'right', minTwistDegrees: 20 },
    ] })
    expect(result.ok, JSON.stringify(result.attemptReport)).toBe(true)
    expect(analyzeHelicalPath(result.molecule, ids, 20 - 1e-10).status).toBe('right')
  })

  it('rejects a mirrored coordinate solution carrying an unchanged authored R/S label', () => {
    const molecule: Molecule = {
      atoms: [
        { id: 'c', symbol: 'C', x: 0, y: 0, z: 0, chirality: 'S' },
        { id: 'f', symbol: 'F', x: 1, y: 1, z: 1 },
        { id: 'cl', symbol: 'Cl', x: -1, y: -1, z: 1 },
        { id: 'br', symbol: 'Br', x: -1, y: 1, z: -1 },
        { id: 'h', symbol: 'H', x: 1, y: -1, z: -1 },
      ],
      bonds: ['f', 'cl', 'br', 'h'].map(id => ({ id: `c-${id}`, atomId1: 'c', atomId2: id, order: 1 })),
    }
    const request: ConstrainedGeometryRequest = {
      movableAtomIds: molecule.atoms.slice(1).map(atom => atom.id),
      angleToleranceDegrees: 180, bondLengthTolerance: 10,
      constraints: molecule.atoms.slice(1).map(atom => ({ id: atom.id, kind: 'position', strength: 'hard',
        atomId: atom.id, target: { x: -atom.x, y: atom.y, z: atom.z }, tolerance: 0.001 })),
    }
    const result = solveConstrainedGeometry(molecule, request)
    expect(result.ok).toBe(false)
    expect(result.molecule).toBe(molecule)
    expect(result.attemptReport?.issues.some(issue => issue.code === 'stereochemistry-violation')).toBe(true)
    expect(result.report.issues.some(issue => issue.code === 'stereochemistry-violation')).toBe(false)
  })

  it('rejects indeterminate E/Z coordinates produced by twisting a marked double bond', () => {
    const molecule: Molecule = {
      atoms: [
        { id: 'a', symbol: 'C', x: 0, y: 0, z: 0 },
        { id: 'b', symbol: 'C', x: 1.4, y: 0, z: 0 },
        { id: 'f', symbol: 'F', x: 0, y: 1, z: 0 },
        { id: 'cl', symbol: 'Cl', x: 1.4, y: 1, z: 0 },
      ],
      bonds: [
        { id: 'ab', atomId1: 'a', atomId2: 'b', order: 2, ez: 'Z' },
        { id: 'af', atomId1: 'a', atomId2: 'f', order: 1 },
        { id: 'bcl', atomId1: 'b', atomId2: 'cl', order: 1 },
      ],
    }
    const result = solveConstrainedGeometry(molecule, { movableAtomIds: ['cl'], constraints: [
      { id: 'twist', kind: 'position', strength: 'hard', atomId: 'cl', target: { x: 1.4, y: 0, z: 1 }, tolerance: 0.001 },
    ] })
    expect(result.ok).toBe(false)
    expect(result.molecule).toBe(molecule)
    expect(result.attemptReport?.issues.some(issue => issue.code === 'stereochemistry-violation')).toBe(true)
  })

  it.each([null, undefined, [], { movableAtomIds: [] }, { constraints: [], movableAtomIds: null }])('returns diagnostics for malformed runtime request %j', request => {
    const molecule = ring()
    const result = solveConstrainedGeometry(molecule, request as unknown as ConstrainedGeometryRequest)
    expect(result.status).toBe('invalid-input')
    expect(result.molecule).toBe(molecule)
  })
})
