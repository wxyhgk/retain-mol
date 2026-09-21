import type { Atom, Bond, Molecule } from '../../model/types'
import { validateGeometryConstraints } from '../constrained/validation'
import { distanceBounds, dot, interpolate, norm, subtract } from './distance'
import type { Point } from './distance'
import type { GeometryMotionIssue, GeometryMotionOptions, GeometryMotionReport } from './contracts'

interface MovingAtom { readonly id: string; readonly start: Point; readonly end: Point; readonly velocity: Point }
interface MovingBond { readonly id: string; readonly atoms: readonly [MovingAtom, MovingAtom] }
interface Pair {
  readonly kind: 'atom-atom' | 'atom-bond' | 'bond-bond'
  readonly first: readonly MovingAtom[]
  readonly second: readonly MovingAtom[]
  readonly bondIds: readonly string[]
  readonly threshold: number
  readonly speed: number
}

const DEFAULTS = { minAtomDistance: 0.8, minAtomBondDistance: 0.15, minBondDistance: 0.1, maxDepth: 20, maxChecks: 100000 } as const
const MAX_COORDINATE = 1e9
const MAX_OBJECTS = 10000
const DEGENERATE_DISTANCE = 1e-6
const orderIds = (first: { id: string }, second: { id: string }): number => first.id < second.id ? -1 : first.id > second.id ? 1 : 0
const point = (atom: Atom): Point => [atom.x, atom.y, atom.z]

function metadataJson(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) => {
    if ((typeof item === 'number' && !Number.isFinite(item)) || typeof item === 'bigint' || typeof item === 'function' || typeof item === 'symbol') throw new Error('Invalid metadata value.')
    return item
  })
}

function sameAtom(first: Atom, second: Atom): boolean {
  const metadata = (atom: Atom) => ({ symbol: atom.symbol, isotope: atom.isotope, charge: atom.charge, radical: atom.radical, chirality: atom.chirality, coordinationGeometry: atom.coordinationGeometry, coordinationDirections: atom.coordinationDirections, coordinationSites: atom.coordinationSites, coordinationNumber: atom.coordinationNumber })
  return metadataJson(metadata(first)) === metadataJson(metadata(second))
}

function sameBond(first: Bond, second: Bond): boolean {
  const metadata = (bond: Bond) => ({ atomId1: bond.atomId1, atomId2: bond.atomId2, order: bond.order, aromatic: bond.aromatic, wedge: bond.wedge, ez: bond.ez, coordinationSites: bond.coordinationSites })
  return metadataJson(metadata(first)) === metadataJson(metadata(second))
}

function pairIssue(pair: Pair, message: string, timeInterval: readonly [number, number], sampleTime?: number, distance?: number): GeometryMotionIssue {
  return {
    kind: pair.kind, message, atomIds: [...pair.first, ...pair.second].map(atom => atom.id), bondIds: pair.bondIds, timeInterval,
    ...(sampleTime === undefined ? {} : { sampleTime }), ...(distance === undefined ? {} : { distance }),
  }
}

function sweptLowerBound(first: readonly MovingAtom[], second: readonly MovingAtom[], margin: number): number {
  const gaps = [0, 0, 0]
  for (const axis of [0, 1, 2] as const) {
    let firstMinimum = Infinity, firstMaximum = -Infinity, secondMinimum = Infinity, secondMaximum = -Infinity
    for (const atom of first) {
      firstMinimum = Math.min(firstMinimum, atom.start[axis], atom.end[axis])
      firstMaximum = Math.max(firstMaximum, atom.start[axis], atom.end[axis])
    }
    for (const atom of second) {
      secondMinimum = Math.min(secondMinimum, atom.start[axis], atom.end[axis])
      secondMaximum = Math.max(secondMaximum, atom.start[axis], atom.end[axis])
    }
    gaps[axis] = Math.max(firstMinimum - secondMaximum, secondMinimum - firstMaximum, 0)
  }
  // Every point of either moving primitive remains in its swept box throughout
  // the linear trajectory. Box separation is therefore a whole-path lower bound.
  return Math.max(0, Math.hypot(...gaps) * (1 - 32 * Number.EPSILON) - margin)
}

function closestApproach(first: MovingAtom, second: MovingAtom): { time: number; distance: number } {
  const initial = subtract(first.start, second.start)
  const velocity = subtract(first.velocity, second.velocity)
  const speedSquared = dot(velocity, velocity)
  const time = speedSquared === 0 ? 0 : Math.max(0, Math.min(1, -dot(initial, velocity) / speedSquared))
  return { time, distance: norm(subtract(interpolate(first.start, first.end, time), interpolate(second.start, second.end, time))) }
}

/**
 * Certifies geometric clearance throughout linear atom interpolation. Every
 * accepted interval has a separating-projection distance lower bound minus a
 * Lipschitz motion bound; samples alone never establish safety. Near the
 * numerical boundary or on budget exhaustion, the result is indeterminate.
 * This does not certify nonlinear animation paths, chemical energy or topology
 * of an unsampled molecular surface. Coordinates must be within 1e9 angstroms
 * of the origin and each input is limited to 10000 atoms and 10000 bonds.
 * Bonded and two-bond neighbors cannot approach within 1e-6 angstroms (or the
 * larger numerical margin), even though normal atom clearance excludes them.
 */
export function validateGeometryMotion(before: Molecule, after: Molecule, options?: GeometryMotionOptions): GeometryMotionReport {
  let evaluations = 0
  let checkedPairs = 0
  let pairVisits = 0
  const result = (status: GeometryMotionReport['status'], issues: readonly GeometryMotionIssue[] = []): GeometryMotionReport => ({ status, safe: status === 'safe', trajectory: 'linear', unit: 'angstrom', issues, checkedPairs, pairVisits, evaluations })
  const invalid = (message: string, atomIds: readonly string[] = [], bondIds: readonly string[] = []): GeometryMotionReport => result('invalid-input', [{ kind: 'invalid-input', message, atomIds, bondIds }])
  if (options !== undefined && (typeof options !== 'object' || options === null || Array.isArray(options))) return invalid('Motion options must be an object.')
  const settings: Required<GeometryMotionOptions> = {
    minAtomDistance: options?.minAtomDistance === undefined ? DEFAULTS.minAtomDistance : options.minAtomDistance,
    minAtomBondDistance: options?.minAtomBondDistance === undefined ? DEFAULTS.minAtomBondDistance : options.minAtomBondDistance,
    minBondDistance: options?.minBondDistance === undefined ? DEFAULTS.minBondDistance : options.minBondDistance,
    maxDepth: options?.maxDepth === undefined ? DEFAULTS.maxDepth : options.maxDepth,
    maxChecks: options?.maxChecks === undefined ? DEFAULTS.maxChecks : options.maxChecks,
  }
  if (options && Object.keys(options).some(key => !Object.hasOwn(DEFAULTS, key))) return invalid('Unknown motion option.')
  for (const name of ['minAtomDistance', 'minAtomBondDistance', 'minBondDistance'] as const) {
    if (typeof settings[name] !== 'number' || !Number.isFinite(settings[name]) || settings[name] <= 0 || settings[name] > MAX_COORDINATE) return invalid(`${name} must be finite, positive, and at most 1e9 angstroms.`)
  }
  if (!Number.isInteger(settings.maxDepth) || settings.maxDepth < 0 || settings.maxDepth > 30) return invalid('maxDepth must be an integer in [0, 30].')
  if (!Number.isInteger(settings.maxChecks) || settings.maxChecks < 1 || settings.maxChecks > 1000000) return invalid('maxChecks must be an integer in [1, 1000000].')
  for (const molecule of [before, after]) {
    if (typeof molecule !== 'object' || molecule === null || !Array.isArray(molecule.atoms) || !Array.isArray(molecule.bonds)) return invalid('Both inputs must contain atom and bond arrays.')
    if (molecule.atoms.length > MAX_OBJECTS || molecule.bonds.length > MAX_OBJECTS) return invalid('Each input is limited to 10000 atoms and 10000 bonds.')
    const validation = validateGeometryConstraints(molecule, [])
    if (!validation.validInput) return result('invalid-input', validation.issues.map(issue => ({ kind: 'invalid-input', message: issue.message, atomIds: issue.atomIds, bondIds: [] })))
    for (const atom of molecule.atoms) {
      if (typeof atom.symbol !== 'string' || atom.symbol.length === 0) return invalid('Atom elements must be nonempty strings.', [atom.id])
      if (Math.max(Math.abs(atom.x), Math.abs(atom.y), Math.abs(atom.z)) > MAX_COORDINATE) return invalid('Coordinate magnitude exceeds the supported numerical range of 1e9 angstroms.', [atom.id])
    }
  }
  if (before.atoms.length !== after.atoms.length || before.bonds.length !== after.bonds.length) return invalid('Motion requires identical atom and bond IDs and topology.')
  const afterAtoms = new Map(after.atoms.map(atom => [atom.id, atom]))
  const afterBonds = new Map(after.bonds.map(bond => [bond.id, bond]))
  try {
    for (const atom of before.atoms) {
      const counterpart = afterAtoms.get(atom.id)
      if (!counterpart || !sameAtom(atom, counterpart)) return invalid('Atom IDs and chemical metadata must remain unchanged.', [atom.id])
    }
    for (const bond of before.bonds) {
      const counterpart = afterBonds.get(bond.id)
      if (!counterpart || !sameBond(bond, counterpart)) return invalid('Bond IDs, endpoints and chemical metadata must remain unchanged.', [bond.atomId1, bond.atomId2], [bond.id])
    }
  } catch {
    return invalid('Chemical metadata must be JSON serializable.')
  }
  const atoms: MovingAtom[] = [...before.atoms].sort(orderIds).map(atom => {
    const start = point(atom), end = point(afterAtoms.get(atom.id)!)
    return { id: atom.id, start, end, velocity: subtract(end, start) }
  })
  const byId = new Map(atoms.map(atom => [atom.id, atom]))
  const bonds: MovingBond[] = [...before.bonds].sort(orderIds).map(bond => ({ id: bond.id, atoms: [byId.get(bond.atomId1)!, byId.get(bond.atomId2)!] }))
  const adjacency = new Map(atoms.map(atom => [atom.id, new Set<string>()]))
  for (const bond of bonds) {
    adjacency.get(bond.atoms[0].id)!.add(bond.atoms[1].id)
    adjacency.get(bond.atoms[1].id)!.add(bond.atoms[0].id)
  }
  let coordinateScale = 1
  for (const atom of atoms) for (const value of [...atom.start, ...atom.end]) coordinateScale = Math.max(coordinateScale, Math.abs(value))
  // Input range bounds all arithmetic. This covers interpolation, projections,
  // witness construction and subtraction, including cancellation after translation.
  const margin = 512 * Number.EPSILON * coordinateScale
  const hasBudget = (): boolean => pairVisits + evaluations < settings.maxChecks
  const exhausted = (pair?: Pair, interval?: readonly [number, number]): GeometryMotionReport => result('indeterminate', [{
    kind: 'budget-exhausted', message: 'The work budget or subdivision limit could not certify the complete linear trajectory.',
    atomIds: pair ? [...pair.first, ...pair.second].map(atom => atom.id) : [], bondIds: pair?.bondIds ?? [],
    ...(interval ? { timeInterval: interval } : {}),
  }])
  // A bond can collapse between valid endpoints. The squared relative endpoint
  // distance is quadratic, so its minimum over the trajectory is analytic.
  for (const bond of bonds) {
    if (!hasBudget()) return exhausted()
    evaluations += 1
    const { time, distance: separation } = closestApproach(bond.atoms[0], bond.atoms[1])
    if (separation <= Math.max(DEGENERATE_DISTANCE, margin)) return result('invalid-input', [{ kind: 'invalid-input', message: 'A bond is zero length or numerically degenerate during the linear trajectory.', atomIds: bond.atoms.map(atom => atom.id), bondIds: [bond.id], timeInterval: [time, time], sampleTime: time, distance: separation }])
  }
  const speedBound = (first: readonly MovingAtom[], second: readonly MovingAtom[]): number => {
    // Subtract a common velocity to avoid penalizing shared rigid translation.
    const reference = first[0]!.velocity
    const left = Math.max(...first.map(atom => norm(subtract(atom.velocity, reference))))
    const right = Math.max(...second.map(atom => norm(subtract(atom.velocity, reference))))
    return (left + right) * (1 + 32 * Number.EPSILON) + margin
  }
  const pairs: Pair[] = []
  let early: GeometryMotionReport | undefined
  const prepare = (kind: Pair['kind'], first: readonly MovingAtom[], second: readonly MovingAtom[], bondIds: readonly string[], threshold: number): void => {
    const pair: Pair = { kind, first, second, bondIds, threshold, speed: speedBound(first, second) }
    checkedPairs += 1
    if (!hasBudget()) { early = exhausted(pair, [0, 1]); return }
    evaluations += 1
    if (sweptLowerBound(first, second, margin) > threshold) return
    for (const time of [0, 1]) {
      if (!hasBudget()) { early = exhausted(pair, [time, time]); return }
      evaluations += 1
      const bounds = distanceBounds(first.map(atom => time === 0 ? atom.start : atom.end), second.map(atom => time === 0 ? atom.start : atom.end), margin)
      if (bounds.upper + margin < threshold) {
        early = result('collision', [pairIssue(pair, 'Geometric clearance is violated at a trajectory endpoint.', [time, time], time, bounds.upper)])
        return
      }
    }
    pairs.push(pair)
  }
  // Every visit, even one excluded by topology, consumes budget. No unbounded
  // all-pairs preparation precedes the capped narrow-phase work.
  for (let first = 0; first < atoms.length; first += 1) {
    const left = atoms[first]!
    const excluded = new Set([left.id, ...adjacency.get(left.id)!])
    for (const neighbor of adjacency.get(left.id)!) for (const secondNeighbor of adjacency.get(neighbor)!) {
      if (!hasBudget()) return exhausted()
      pairVisits += 1
      excluded.add(secondNeighbor)
    }
    for (let second = first + 1; second < atoms.length; second += 1) {
      if (!hasBudget()) return exhausted()
      pairVisits += 1
      const right = atoms[second]!
      if (excluded.has(right.id)) {
        // The 1-3 exclusion removes the ordinary atom clearance requirement,
        // but must not authorize a singular interpolation collapsing neighbors.
        if (!adjacency.get(left.id)!.has(right.id)) {
          if (!hasBudget()) return exhausted()
          evaluations += 1
          const approach = closestApproach(left, right)
          if (approach.distance <= Math.max(DEGENERATE_DISTANCE, margin)) return result('invalid-input', [{
            kind: 'invalid-input', message: 'Atoms two bonds apart become coincident or numerically degenerate during the linear trajectory.',
            atomIds: [left.id, right.id], bondIds: [], timeInterval: [approach.time, approach.time], sampleTime: approach.time, distance: approach.distance,
          }])
        }
        continue
      }
      prepare('atom-atom', [left], [right], [], settings.minAtomDistance)
      if (early) return early
    }
  }
  for (const atom of atoms) for (const bond of bonds) {
    if (!hasBudget()) return exhausted()
    pairVisits += 1
    if (bond.atoms.some(endpoint => endpoint.id === atom.id || adjacency.get(atom.id)!.has(endpoint.id))) continue
    prepare('atom-bond', [atom], bond.atoms, [bond.id], settings.minAtomBondDistance)
    if (early) return early
  }
  for (let first = 0; first < bonds.length; first += 1) for (let second = first + 1; second < bonds.length; second += 1) {
    if (!hasBudget()) return exhausted()
    pairVisits += 1
    const left = bonds[first]!, right = bonds[second]!
    if (left.atoms.some(atom => right.atoms.some(other => atom.id === other.id))) continue
    prepare('bond-bond', left.atoms, right.atoms, [left.id, right.id], settings.minBondDistance)
    if (early) return early
  }
  for (const pair of pairs) {
    const intervals: { start: number; end: number; depth: number }[] = [{ start: 0, end: 1, depth: 0 }]
    while (intervals.length > 0) {
      const interval = intervals.pop()!
      const range: readonly [number, number] = [interval.start, interval.end]
      if (!hasBudget()) return exhausted(pair, range)
      evaluations += 1
      const time = (interval.start + interval.end) / 2
      const bounds = distanceBounds(pair.first.map(atom => interpolate(atom.start, atom.end, time)), pair.second.map(atom => interpolate(atom.start, atom.end, time)), margin)
      if (bounds.upper + margin < pair.threshold) return result('collision', [pairIssue(pair, 'Geometric clearance is violated inside the linear trajectory.', range, time, bounds.upper)])
      if (bounds.lower - pair.speed * ((interval.end - interval.start) / 2) > pair.threshold) continue
      if (interval.depth >= settings.maxDepth) return exhausted(pair, range)
      intervals.push({ start: time, end: interval.end, depth: interval.depth + 1 }, { start: interval.start, end: time, depth: interval.depth + 1 })
    }
  }
  return result('safe')
}
