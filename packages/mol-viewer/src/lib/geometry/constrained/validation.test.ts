import { describe, expect, it } from 'vitest'
import type { Molecule, Vector3Data } from '../../model/types'
import { calcDihedral } from '../measure'
import type { GeometryConstraint } from './contracts'
import { validateGeometryConstraints } from './validation'

function path(points: readonly (readonly [number, number, number])[]): Molecule {
  return {
    atoms: points.map(([x, y, z], index) => ({ id: `a${index}`, symbol: 'C', x, y, z })),
    bonds: points.slice(1).map((_, index) => ({ id: `b${index}`, atomId1: `a${index}`, atomId2: `a${index + 1}`, order: 1 })),
  }
}

const fourAtoms = path([[0, 1, 0], [0, 0, 0], [1, 0, 0], [1, 0, 1]])
const distance: GeometryConstraint = { id: 'distance', kind: 'distance', atomIds: ['a0', 'a1'], target: 1, tolerance: 0, strength: 'hard' }
const angle: GeometryConstraint = { id: 'angle', kind: 'angle', atomIds: ['a0', 'a1', 'a2'], targetDegrees: 90, toleranceDegrees: 0, strength: 'hard' }
const dihedral: GeometryConstraint = { id: 'dihedral', kind: 'dihedral', atomIds: ['a0', 'a1', 'a2', 'a3'], targetDegrees: -90, toleranceDegrees: 0, strength: 'hard' }
const fix: GeometryConstraint = { id: 'position', kind: 'position', atomId: 'a0', target: { x: 0, y: 1, z: 0 }, tolerance: 0, strength: 'hard' }

describe('validateGeometryConstraints', () => {
  it('measures distance, angle, signed project dihedral and positional displacement', () => {
    const before = structuredClone(fourAtoms)
    const report = validateGeometryConstraints(fourAtoms, [distance, angle, dihedral, fix])
    expect(report).toMatchObject({ validInput: true, satisfied: true, hardViolationCount: 0, softPenalty: 0, issues: [] })
    expect(report.measurements.map(measurement => measurement.actual)).toEqual([1, 90, -90, 0])
    expect(report.measurements[2].actual).toBe(calcDihedral(...fourAtoms.atoms as [typeof fourAtoms.atoms[number], typeof fourAtoms.atoms[number], typeof fourAtoms.atoms[number], typeof fourAtoms.atoms[number]]))
    expect(fourAtoms).toEqual(before)
  })

  it('preserves measurements under proper rigid motion with transformed position targets', () => {
    const transform = (point: Vector3Data) => ({ x: point.y + 10, y: point.z - 7, z: point.x + 3 })
    const moved = { ...fourAtoms, atoms: fourAtoms.atoms.map(atom => ({ ...atom, ...transform(atom) })) }
    const first = validateGeometryConstraints(fourAtoms, [distance, angle, dihedral, fix])
    const second = validateGeometryConstraints(moved, [distance, angle, dihedral, { ...fix, target: transform(fix.target) }])
    expect(second).toEqual(first)
  })

  it('wraps dihedral errors across the -180/180 boundary and normalizes equivalent targets', () => {
    const radians = -179 * Math.PI / 180
    const molecule = path([[0, 1, 0], [0, 0, 0], [1, 0, 0], [1, Math.cos(radians), Math.sin(radians)]])
    const report = validateGeometryConstraints(molecule, [{ ...dihedral, targetDegrees: -179, toleranceDegrees: 1 }])
    expect(report.measurements[0]).toMatchObject({ satisfied: false })
    expect(report.measurements[0].actual).toBeCloseTo(179)
    expect(report.measurements[0].violation).toBeCloseTo(1)
    const equivalent = validateGeometryConstraints(molecule, [{ ...dihedral, targetDegrees: 179 + 720, toleranceDegrees: 0 }])
    expect(equivalent.satisfied).toBe(true)
  })

  it('normalizes huge finite dihedral targets before subtracting measured angles', () => {
    const report = validateGeometryConstraints(fourAtoms, [{ ...dihedral, targetDegrees: 1e20 }])
    // 1e20 % 360 = 280 = -80 degrees; the measured -90 differs by 10.
    expect(report.measurements[0]).toMatchObject({ actual: -90, violation: 10, satisfied: false })
  })

  it('gates on hard constraints while keeping violated soft preferences measurable', () => {
    const soft: GeometryConstraint = { ...distance, strength: 'soft', target: 3, tolerance: 0.5, weight: 2 }
    const preferred = validateGeometryConstraints(fourAtoms, [soft])
    expect(preferred).toMatchObject({ validInput: true, satisfied: true, hardViolationCount: 0, softPenalty: 4.5 })
    expect(preferred.measurements[0]).toMatchObject({ actual: 1, violation: 1.5, satisfied: false })
    const required = validateGeometryConstraints(fourAtoms, [{ ...soft, strength: 'hard' }])
    expect(required).toMatchObject({ satisfied: false, hardViolationCount: 1, softPenalty: 0 })
  })

  it('treats minimum distance as a one-sided lower bound with tolerance', () => {
    const minimum: GeometryConstraint = { id: 'separation', kind: 'minimum-distance', atomIds: ['a0', 'a1'], minimum: 1.5, tolerance: 0.1, strength: 'hard' }
    const report = validateGeometryConstraints(fourAtoms, [minimum])
    expect(report.measurements[0].violation).toBeCloseTo(0.4)
    expect(validateGeometryConstraints(fourAtoms, [{ ...minimum, minimum: 0.5 }]).satisfied).toBe(true)
  })

  it('reports undefined angles and dihedrals instead of accepting fallback zero or 90 degrees', () => {
    const coincident = path([[0, 0, 0], [0, 0, 0], [1, 0, 0], [2, 0, 0]])
    const report = validateGeometryConstraints(coincident, [angle, dihedral])
    expect(report).toMatchObject({ validInput: true, satisfied: false, hardViolationCount: 2 })
    expect(report.measurements.every(measurement => measurement.actual === null && measurement.violation === null)).toBe(true)
    expect(report.issues).toHaveLength(2)
    expect(report.issues.every(issue => issue.code === 'degenerate-geometry')).toBe(true)
    const soft = validateGeometryConstraints(coincident, [{ ...angle, strength: 'soft' }])
    expect(soft).toMatchObject({ satisfied: false, hardViolationCount: 0, softPenalty: Number.MAX_VALUE })
  })

  it('keeps saturated penalties and unusable extreme coordinates finite', () => {
    const report = validateGeometryConstraints(fourAtoms, [{ ...distance, strength: 'soft', target: 1e200, weight: 1e200 }])
    expect(report.softPenalty).toBe(Number.MAX_VALUE)
    const extreme = path([[Number.MAX_VALUE, 0, 0], [-Number.MAX_VALUE, 0, 0]])
    const undefinedDistance = validateGeometryConstraints(extreme, [distance])
    expect(undefinedDistance.measurements[0]).toMatchObject({ actual: null, violation: null, satisfied: false })
    expect(undefinedDistance.issues[0].code).toBe('degenerate-geometry')
  })

  it('avoids squared-length overflow when measuring representable angles', () => {
    const molecule = path([[1e200, 1e200, 0], [0, 0, 0], [1e200, 0, 0], [1e200, 0, 1e200]])
    const report = validateGeometryConstraints(molecule, [{ ...angle, targetDegrees: 45 }, dihedral])
    expect(report.satisfied).toBe(true)
    expect(report.measurements[0].actual).toBeCloseTo(45)
    expect(report.measurements[1].actual).toBeCloseTo(-90)
  })

  it.each([
    { ...distance, atomIds: ['a0', 'missing'] },
    { ...distance, atomIds: ['a0'] },
    { ...distance, atomIds: ['a0', 'a0'] },
    { ...distance, atomIds: new Array(2) },
    { ...distance, target: Number.NaN },
    { ...distance, tolerance: -1 },
    { ...distance, weight: 0 },
    { ...distance, strength: 'unknown' },
    { ...angle, targetDegrees: 181 },
    { ...angle, toleranceDegrees: Infinity },
    { ...fix, target: { x: 0, y: 0 } },
    { ...distance, kind: 'unknown' },
    null,
  ])('rejects malformed constraint %# without throwing', constraint => {
    const report = validateGeometryConstraints(fourAtoms, [constraint] as unknown as GeometryConstraint[])
    expect(report).toMatchObject({ validInput: false, satisfied: false, measurements: [] })
    expect(report.issues[0].code).toBe('invalid-constraint')
  })

  it('rejects duplicate constraint IDs before evaluating any constraints', () => {
    const report = validateGeometryConstraints(fourAtoms, [distance, { ...distance, target: 3 }])
    expect(report.validInput).toBe(false)
    expect(report.issues[0]).toMatchObject({ code: 'invalid-constraint', constraintId: distance.id })
    expect(report.measurements).toEqual([])
  })

  it.each([
    { ...fourAtoms, atoms: [...fourAtoms.atoms, fourAtoms.atoms[0]] },
    { ...fourAtoms, atoms: fourAtoms.atoms.map((atom, index) => index === 0 ? { ...atom, x: Infinity } : atom) },
    { ...fourAtoms, bonds: [...fourAtoms.bonds, { ...fourAtoms.bonds[0], id: 'extra' }] },
    { ...fourAtoms, bonds: [...fourAtoms.bonds, { ...fourAtoms.bonds[0], atomId1: 'a0', atomId2: 'a3' }] },
    { ...fourAtoms, bonds: [{ ...fourAtoms.bonds[0], atomId1: 'missing' }] },
    { ...fourAtoms, bonds: [{ ...fourAtoms.bonds[0], atomId2: 'a0' }] },
    { ...fourAtoms, bonds: [{ ...fourAtoms.bonds[0], order: 4 }] },
    { atoms: [null], bonds: [] },
    null,
  ])('rejects malformed molecule %# before geometric evaluation', molecule => {
    const report = validateGeometryConstraints(molecule as unknown as Molecule, [])
    expect(report).toMatchObject({ validInput: false, satisfied: false, measurements: [] })
    expect(report.issues[0].code).toBe('invalid-input')
  })

  it('rejects non-array constraints and reports no required constraints as satisfied', () => {
    expect(validateGeometryConstraints(fourAtoms, null as unknown as GeometryConstraint[]).validInput).toBe(false)
    expect(validateGeometryConstraints(fourAtoms, [])).toMatchObject({ validInput: true, satisfied: true, measurements: [] })
  })

  it('validates every local helical turn and distinguishes a mirror image', () => {
    const helix = path(Array.from({ length: 7 }, (_, index) => {
      const parameter = index * Math.PI / 3
      return [Math.cos(parameter), Math.sin(parameter), parameter * 0.5] as const
    }))
    const constraint: GeometryConstraint = { id: 'hand', kind: 'helicity', atomIds: helix.atoms.map(atom => atom.id), handedness: 'right', minTwistDegrees: 5, strength: 'hard' }
    const accepted = validateGeometryConstraints(helix, [constraint])
    expect(accepted.satisfied).toBe(true)
    expect(accepted.measurements[0].actual).toBeGreaterThan(5)
    const mirror = { ...helix, atoms: helix.atoms.map(atom => ({ ...atom, x: -atom.x })) }
    const rejected = validateGeometryConstraints(mirror, [constraint])
    expect(rejected).toMatchObject({ validInput: true, satisfied: false, hardViolationCount: 1 })
    expect(rejected.measurements[0].actual).toBeCloseTo(-accepted.measurements[0].actual)
    expect(validateGeometryConstraints(mirror, [{ ...constraint, handedness: 'left' }]).satisfied).toBe(true)
  })

  it('does not label planar or unbonded paths as a satisfied helicity', () => {
    const planar = path([[0, 1, 0], [0, 0, 0], [1, 0, 0], [1, -1, 0]])
    const constraint: GeometryConstraint = { id: 'hand', kind: 'helicity', atomIds: planar.atoms.map(atom => atom.id), handedness: 'right', minTwistDegrees: 5, strength: 'hard' }
    const report = validateGeometryConstraints(planar, [constraint])
    expect(report).toMatchObject({ validInput: true, satisfied: false })
    expect(report.measurements[0]).toMatchObject({ actual: 0, violation: 5 })
    expect(validateGeometryConstraints({ ...planar, bonds: [] }, [constraint]).validInput).toBe(false)
    expect(validateGeometryConstraints(planar, [{ ...constraint, minTwistDegrees: 0 }]).validInput).toBe(false)
  })

  it('retains attributed degeneracy diagnostics for an undefined helical path', () => {
    const collinear = path([[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0]])
    const constraint: GeometryConstraint = { id: 'hand', kind: 'helicity', atomIds: collinear.atoms.map(atom => atom.id), handedness: 'right', minTwistDegrees: 5, strength: 'soft' }
    const report = validateGeometryConstraints(collinear, [constraint])
    expect(report).toMatchObject({ validInput: true, satisfied: false, softPenalty: Number.MAX_VALUE })
    expect(report.measurements[0]).toMatchObject({ actual: null, violation: null })
    expect(report.issues).toEqual([{ code: 'degenerate-geometry', constraintId: 'hand', atomIds: ['a0', 'a1', 'a2', 'a3'], message: expect.any(String) }])
  })
})
