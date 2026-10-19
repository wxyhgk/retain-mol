import { describe, expect, it } from 'vitest'
import type { Molecule } from '../../model/types'
import type { GeometryMotionOptions } from './contracts'
import { validateGeometryMotion } from './validation'

function molecule(coordinates: readonly (readonly [number, number, number])[], edges: readonly (readonly [number, number])[] = []): Molecule {
  return {
    atoms: coordinates.map(([x, y, z], index) => ({ id: `a${index}`, symbol: 'C', x, y, z })),
    bonds: edges.map(([first, second], index) => ({ id: `b${index}`, atomId1: `a${first}`, atomId2: `a${second}`, order: 1 })),
  }
}

const crossingBonds = (height: number): Molecule => molecule([[-2, 0, 0], [2, 0, 0], [0, -2, height], [0, 2, height]], [[0, 1], [2, 3]])

describe('validateGeometryMotion continuous linear clearance', () => {
  it('detects atom-atom crossing when both endpoint conformations are clear', () => {
    const before = molecule([[0, 0, 0], [-123, 0, 0]])
    const after = molecule([[0, 0, 0], [321, 0, 0]])
    expect(validateGeometryMotion(before, before).safe).toBe(true)
    expect(validateGeometryMotion(after, after).safe).toBe(true)
    const report = validateGeometryMotion(before, after)
    expect(report).toMatchObject({ status: 'collision', safe: false, trajectory: 'linear', unit: 'angstrom' })
    expect(report.issues[0]).toMatchObject({ kind: 'atom-atom', atomIds: ['a0', 'a1'], bondIds: [] })
    expect(report.issues[0].sampleTime).toBeGreaterThan(0.27)
    expect(report.issues[0].sampleTime).toBeLessThan(0.29)
    expect(report.issues[0].distance).toBeLessThan(0.8)
  })

  it('detects an isolated atom traversing a bond interior without atom-atom contact', () => {
    const before = molecule([[-2, 0, 0], [2, 0, 0], [0, 0, 1]], [[0, 1]])
    const after = molecule([[-2, 0, 0], [2, 0, 0], [0, 0, -1]], [[0, 1]])
    const report = validateGeometryMotion(before, after)
    expect(report).toMatchObject({ status: 'collision', safe: false })
    expect(report.issues[0]).toMatchObject({ kind: 'atom-bond', bondIds: ['b0'], sampleTime: 0.5, distance: 0 })
  })

  it('detects nonshared bond crossing while both endpoint conformations are safe', () => {
    const before = crossingBonds(1), after = crossingBonds(-1)
    const saved = JSON.stringify([before, after])
    expect(validateGeometryMotion(before, before).safe).toBe(true)
    expect(validateGeometryMotion(after, after).safe).toBe(true)
    const report = validateGeometryMotion(before, after)
    expect(report).toMatchObject({ status: 'collision', safe: false })
    expect(report.issues[0]).toMatchObject({ kind: 'bond-bond', bondIds: ['b0', 'b1'], sampleTime: 0.5, distance: 0 })
    expect(JSON.stringify([before, after])).toBe(saved)
    expect(JSON.parse(JSON.stringify(report))).toEqual(report)
  })

  it('certifies a separating trajectory with conservative interval bounds', () => {
    const report = validateGeometryMotion(crossingBonds(1), crossingBonds(2))
    expect(report).toMatchObject({ status: 'safe', safe: true, issues: [] })
    expect(report.checkedPairs).toBeGreaterThan(0)
    expect(report.evaluations).toBeGreaterThanOrEqual(report.checkedPairs)
  })

  it('distinguishes clear near-grazing, penetrating and unresolved tangent trajectories', () => {
    const pass = (clearance: number) => validateGeometryMotion(molecule([[0, 0, 0], [-2, clearance, 0]]), molecule([[0, 0, 0], [2, clearance, 0]]))
    expect(pass(0.81).status).toBe('safe')
    expect(pass(0.799).status).toBe('collision')
    expect(pass(0.8)).toMatchObject({ status: 'indeterminate', safe: false })
  })

  it('handles nearly parallel bonds without treating unstable closest-point estimates as safe', () => {
    const parallel = (height: number) => molecule([[-3, 0, 0], [3, 0, 0], [-2, -1e-10, height], [2, 1e-10, height]], [[0, 1], [2, 3]])
    expect(validateGeometryMotion(parallel(0.5), parallel(0.6)).status).toBe('safe')
    const crossing = validateGeometryMotion(parallel(0.5), parallel(-0.5))
    expect(crossing.safe).toBe(false)
    expect(crossing.status).toBe('collision')
  })

  it('reports initial and final collisions without silently exempting them', () => {
    const first = molecule([[0, 0, 0], [0.2, 0, 0]])
    const second = molecule([[0, 0, 0], [2, 0, 0]])
    expect(validateGeometryMotion(first, second).issues[0]).toMatchObject({ kind: 'atom-atom', sampleTime: 0, timeInterval: [0, 0] })
    expect(validateGeometryMotion(second, first).issues[0]).toMatchObject({ kind: 'atom-atom', sampleTime: 1, timeInterval: [1, 1] })
  })

  it('respects graph-distance exclusions and accepts zero velocity', () => {
    const bonded = molecule([[0, 0, 0], [0.1, 0, 0], [0.2, 0, 0]], [[0, 1], [1, 2]])
    expect(validateGeometryMotion(bonded, bonded)).toMatchObject({ status: 'safe', safe: true, checkedPairs: 0 })
    const disconnected = molecule([[0, 0, 0], [2, 0, 0]])
    expect(validateGeometryMotion(disconnected, disconnected).status).toBe('safe')
  })

  it('rejects zero-length endpoint bonds and mid-trajectory collapse', () => {
    const zero = molecule([[0, 0, 0], [0, 0, 0]], [[0, 1]])
    expect(validateGeometryMotion(zero, zero)).toMatchObject({ status: 'invalid-input', safe: false })
    const before = molecule([[-1, 0, 0], [1, 0, 0]], [[0, 1]])
    const after = molecule([[1, 0, 0], [-1, 0, 0]], [[0, 1]])
    const report = validateGeometryMotion(before, after)
    expect(report).toMatchObject({ status: 'invalid-input', safe: false })
    expect(report.issues[0]).toMatchObject({ kind: 'invalid-input', bondIds: ['b0'], sampleTime: 0.5, distance: 0 })
  })

  it('rejects collapse of two-bond neighbors despite excluding their ordinary atom clearance', () => {
    const before = molecule([[0, 0, 0], [1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]], [[0, 1], [0, 2], [0, 3], [0, 4]])
    const after = { ...before, atoms: before.atoms.map(atom => ({ ...atom, y: -atom.y, z: -atom.z })) }
    expect(validateGeometryMotion(before, before).safe).toBe(true)
    expect(validateGeometryMotion(after, after).safe).toBe(true)
    const report = validateGeometryMotion(before, after)
    expect(report).toMatchObject({ status: 'invalid-input', safe: false })
    expect(report.issues[0]).toMatchObject({ kind: 'invalid-input', sampleTime: 0.5, distance: 0 })
    const approximate = { ...after, atoms: after.atoms.map((atom, index) => index === 1 ? { ...atom, x: atom.x + 1e-7 } : atom) }
    const approximateReport = validateGeometryMotion(before, approximate)
    expect(approximateReport).toMatchObject({ status: 'invalid-input', safe: false })
    expect(approximateReport.issues[0].distance).toBeGreaterThan(0)
    expect(approximateReport.issues[0].distance).toBeLessThan(1e-6)
  })

  it('exhausts work and depth budgets conservatively without falsely certifying a clear endpoint', () => {
    const start = crossingBonds(1), finish = crossingBonds(-1)
    const budget = validateGeometryMotion(start, finish, { maxChecks: 1 })
    expect(budget).toMatchObject({ status: 'indeterminate', safe: false })
    expect(budget.issues[0].kind).toBe('budget-exhausted')
    expect(budget.pairVisits + budget.evaluations).toBeLessThanOrEqual(1)
    const lowDepth = validateGeometryMotion(molecule([[0, 0, 0], [-123, 0, 0]]), molecule([[0, 0, 0], [321, 0, 0]]), { maxDepth: 0 })
    expect(lowDepth).toMatchObject({ status: 'indeterminate', safe: false })
  })

  it('bounds excluded-pair preparation instead of enumerating the entire graph first', () => {
    const star = molecule(Array.from({ length: 101 }, (_, index) => index === 0 ? [0, 0, 0] : [index, 0, 0]), Array.from({ length: 100 }, (_, index) => [0, index + 1]))
    const report = validateGeometryMotion(star, star, { maxChecks: 105 })
    expect(report).toMatchObject({ status: 'indeterminate', safe: false })
    expect(report.pairVisits + report.evaluations).toBeLessThanOrEqual(105)
  })

  it('preserves classification under proper rigid motion and array reordering', () => {
    const transform = (value: Molecule): Molecule => ({
      ...value,
      atoms: [...value.atoms].reverse().map(atom => ({ ...atom, x: atom.y + 10, y: atom.z - 7, z: atom.x + 3 })),
      bonds: [...value.bonds].reverse(),
    })
    const before = crossingBonds(1), after = crossingBonds(-1)
    const expected = validateGeometryMotion(before, after)
    const transformed = validateGeometryMotion(transform(before), transform(after))
    expect(transformed).toEqual(expected)
    const reordered = { ...after, atoms: [...after.atoms].reverse(), bonds: [...after.bonds].reverse() }
    expect(validateGeometryMotion(before, reordered)).toEqual(expected)
  })

  it('removes common translational velocity from the interval speed bound', () => {
    const before = molecule([[0, 0, 0], [2, 0, 0]])
    const after = { ...before, atoms: before.atoms.map(atom => ({ ...atom, x: atom.x + 1e6 })) }
    expect(validateGeometryMotion(before, after, { maxDepth: 0 }).status).toBe('safe')
  })

  it('rejects graph changes, unstable IDs and nonfinite input', () => {
    const original = crossingBonds(1)
    const cases = [
      { ...original, atoms: original.atoms.slice(1) },
      { ...original, atoms: original.atoms.map((atom, index) => index === 0 ? { ...atom, symbol: 'N' } : atom) },
      { ...original, atoms: original.atoms.map((atom, index) => index === 0 ? { ...atom, x: NaN } : atom) },
      { ...original, atoms: original.atoms.map((atom, index) => index === 0 ? { ...atom, charge: Infinity } : atom) },
      { ...original, atoms: original.atoms.map((atom, index) => index === 0 ? { ...atom, x: 1e10 } : atom) },
      { ...original, bonds: original.bonds.map((bond, index) => index === 0 ? { ...bond, id: 'changed' } : bond) },
      { ...original, bonds: original.bonds.map((bond, index) => index === 0 ? { ...bond, order: 2 as const } : bond) },
    ]
    for (const changed of cases) expect(validateGeometryMotion(original, changed)).toMatchObject({ status: 'invalid-input', safe: false })
    const nullCharge = { ...original, atoms: original.atoms.map((atom, index) => index === 0 ? { ...atom, charge: null } : atom) } as unknown as Molecule
    expect(validateGeometryMotion(original, nullCharge).status).toBe('invalid-input')
  })

  it.each([
    null, false, [], { minAtomDistance: 0 }, { minAtomBondDistance: -1 }, { minBondDistance: NaN },
    { maxDepth: -1 }, { maxDepth: 31 }, { maxDepth: 1.5 }, { maxChecks: 0 }, { maxChecks: Infinity },
    { maxChecks: 1000001 }, { unsupported: true }, { constructor: 1 }, { minBondDistance: 1e10 },
  ].map(options => ({ options })))('rejects malformed options %# without throwing', ({ options }) => {
    const report = validateGeometryMotion(crossingBonds(1), crossingBonds(2), options as unknown as GeometryMotionOptions)
    expect(report).toMatchObject({ status: 'invalid-input', safe: false })
  })

  it('certifies a procedural 100-atom ring under the default bounded work budget', () => {
    const count = 100
    const radius = 1.5 / (2 * Math.sin(Math.PI / count))
    const ring = molecule(Array.from({ length: count }, (_, index) => [radius * Math.cos(2 * Math.PI * index / count), radius * Math.sin(2 * Math.PI * index / count), 0]), Array.from({ length: count }, (_, index) => [index, (index + 1) % count]))
    const lifted = { ...ring, atoms: ring.atoms.map((atom, index) => ({ ...atom, z: 0.1 * Math.sin(Math.PI * index / count) })) }
    const report = validateGeometryMotion(ring, lifted)
    expect(report).toMatchObject({ status: 'safe', safe: true, issues: [] })
    expect(report.checkedPairs).toBeGreaterThan(10000)
    expect(report.pairVisits + report.evaluations).toBeLessThanOrEqual(100000)
  })

  it('uses swept-box certificates to keep 260 distant static points within the default budget', () => {
    const points = molecule(Array.from({ length: 260 }, (_, index) => [index * 2, 0, 0]))
    const report = validateGeometryMotion(points, points)
    expect(report).toMatchObject({ status: 'safe', safe: true, checkedPairs: 33670, pairVisits: 33670, evaluations: 33670 })
  })

  it('does not use disjoint endpoint boxes to prune intersecting swept boxes', () => {
    const before = molecule([[-10, 0, 0], [10, 0, 0]])
    const after = molecule([[10, 0, 0], [-10, 0, 0]])
    const report = validateGeometryMotion(before, after)
    expect(report).toMatchObject({ status: 'collision', safe: false })
    expect(report.issues[0]).toMatchObject({ kind: 'atom-atom', sampleTime: 0.5, distance: 0 })
  })
})
