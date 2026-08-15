import type { Atom, Bond, Molecule } from '../../molecule'
import type {
  CanonicalAtomSnapshot,
  CanonicalBondSnapshot,
  CanonicalMoleculeSnapshot,
  ExpectedEffectChanges,
  ExpectedEffectEntityChange,
} from './contracts'
import { sha256Hex } from './sha256'

const CANONICAL_DIGEST_PREFIX = 'canonical-v2-sha256-'

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function canonicalNumber(value: number): number {
  return Object.is(value, -0) ? 0 : value
}

function invalidSnapshot(path: string, message: string): never {
  throw new TypeError(`Invalid canonical molecule snapshot at ${path}: ${message}`)
}

function assertNonEmptyString(value: unknown, path: string): asserts value is string {
  if (typeof value !== 'string' || value.length === 0) {
    invalidSnapshot(path, 'expected a non-empty string')
  }
}

function assertFiniteCanonicalNumber(value: unknown, path: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    invalidSnapshot(path, 'expected a finite number')
  }
  if (Object.is(value, -0)) invalidSnapshot(path, 'negative zero is not canonical')
}

function assertNullableFiniteInteger(
  value: unknown,
  path: string,
  minimum?: number,
): asserts value is number | null {
  if (value === null) return
  assertFiniteCanonicalNumber(value, path)
  if (!Number.isInteger(value) || (minimum !== undefined && value < minimum)) {
    invalidSnapshot(path, `expected an integer${minimum === undefined ? '' : ` >= ${minimum}`}`)
  }
}

function assertVector(value: unknown, path: string): asserts value is readonly [number, number, number] {
  if (!Array.isArray(value) || value.length !== 3) {
    invalidSnapshot(path, 'expected a three-number vector')
  }
  value.forEach((coordinate, index) => assertFiniteCanonicalNumber(coordinate, `${path}[${index}]`))
}

function assertSorted<T>(
  values: readonly T[],
  compare: (left: T, right: T) => number,
  path: string,
): void {
  for (let index = 1; index < values.length; index += 1) {
    if (compare(values[index - 1]!, values[index]!) > 0) {
      invalidSnapshot(path, 'values are not in canonical order')
    }
  }
}

function compareNumberTuple(
  left: readonly number[],
  right: readonly number[],
): number {
  for (let index = 0; index < Math.min(left.length, right.length); index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0)
    if (difference !== 0) return difference
  }
  return left.length - right.length
}

function canonicalAtom(atom: Atom): CanonicalAtomSnapshot {
  return {
    id: atom.id,
    symbol: atom.symbol,
    x: canonicalNumber(atom.x),
    y: canonicalNumber(atom.y),
    z: canonicalNumber(atom.z),
    charge: atom.charge ?? null,
    radical: atom.radical ?? null,
    label: atom.label ?? null,
    coordinationGeometry: atom.coordinationGeometry ?? null,
    coordinationDirections: (atom.coordinationDirections ?? [])
      .map(direction => direction.map(canonicalNumber) as [number, number, number])
      .sort(compareNumberTuple),
    coordinationSites: (atom.coordinationSites ?? [])
      .map(site => ({
        id: site.id,
        label: site.label,
        direction: site.direction.map(canonicalNumber) as [number, number, number],
        bondOrder: site.bondOrder,
        equivalenceGroup: site.equivalenceGroup,
      }))
      .sort((left, right) => compareText(left.id, right.id)),
    coordinationNumber: atom.coordinationNumber ?? null,
  }
}

function canonicalBond(bond: Bond): CanonicalBondSnapshot {
  const [atomId1, atomId2] = [bond.atomId1, bond.atomId2].sort(compareText)
  return {
    id: bond.id,
    atomId1: atomId1!,
    atomId2: atomId2!,
    order: bond.order,
    aromatic: bond.aromatic === true,
    coordinationSites: (bond.coordinationSites ?? [])
      .map(site => ({ atomId: site.atomId, siteId: site.siteId }))
      .sort((left, right) => compareText(left.atomId, right.atomId) || compareText(left.siteId, right.siteId)),
  }
}

function assertCanonicalMoleculeSnapshot(snapshot: CanonicalMoleculeSnapshot): void {
  if (snapshot === null || typeof snapshot !== 'object') {
    invalidSnapshot('$', 'expected an object')
  }
  if (snapshot.name !== null && typeof snapshot.name !== 'string') {
    invalidSnapshot('name', 'expected a string or null')
  }
  if (!Array.isArray(snapshot.atoms)) invalidSnapshot('atoms', 'expected an array')
  if (!Array.isArray(snapshot.bonds)) invalidSnapshot('bonds', 'expected an array')

  const atomIds = new Set<string>()
  const sitesByAtomId = new Map<string, Set<string>>()
  snapshot.atoms.forEach((atom, atomIndex) => {
    const path = `atoms[${atomIndex}]`
    assertNonEmptyString(atom.id, `${path}.id`)
    if (atomIds.has(atom.id)) invalidSnapshot(`${path}.id`, `duplicate atom ID ${atom.id}`)
    atomIds.add(atom.id)
    assertNonEmptyString(atom.symbol, `${path}.symbol`)
    assertFiniteCanonicalNumber(atom.x, `${path}.x`)
    assertFiniteCanonicalNumber(atom.y, `${path}.y`)
    assertFiniteCanonicalNumber(atom.z, `${path}.z`)
    assertNullableFiniteInteger(atom.charge, `${path}.charge`)
    assertNullableFiniteInteger(atom.radical, `${path}.radical`, 0)
    if (atom.label !== null && typeof atom.label !== 'string') {
      invalidSnapshot(`${path}.label`, 'expected a string or null')
    }
    if (atom.coordinationGeometry !== null && typeof atom.coordinationGeometry !== 'string') {
      invalidSnapshot(`${path}.coordinationGeometry`, 'expected a string or null')
    }
    if (!Array.isArray(atom.coordinationDirections)) {
      invalidSnapshot(`${path}.coordinationDirections`, 'expected an array')
    }
    atom.coordinationDirections.forEach((
      direction: CanonicalAtomSnapshot['coordinationDirections'][number],
      index: number,
    ) => {
      assertVector(direction, `${path}.coordinationDirections[${index}]`)
    })
    assertSorted(atom.coordinationDirections, compareNumberTuple, `${path}.coordinationDirections`)
    if (!Array.isArray(atom.coordinationSites)) {
      invalidSnapshot(`${path}.coordinationSites`, 'expected an array')
    }
    const siteIds = new Set<string>()
    atom.coordinationSites.forEach((
      site: CanonicalAtomSnapshot['coordinationSites'][number],
      siteIndex: number,
    ) => {
      const sitePath = `${path}.coordinationSites[${siteIndex}]`
      assertNonEmptyString(site.id, `${sitePath}.id`)
      if (siteIds.has(site.id)) invalidSnapshot(`${sitePath}.id`, `duplicate site ID ${site.id}`)
      siteIds.add(site.id)
      if (typeof site.label !== 'string') invalidSnapshot(`${sitePath}.label`, 'expected a string')
      assertVector(site.direction, `${sitePath}.direction`)
      if (site.bondOrder !== 1 && site.bondOrder !== 2 && site.bondOrder !== 3) {
        invalidSnapshot(`${sitePath}.bondOrder`, 'expected bond order 1, 2, or 3')
      }
      if (typeof site.equivalenceGroup !== 'string') {
        invalidSnapshot(`${sitePath}.equivalenceGroup`, 'expected a string')
      }
    })
    assertSorted(
      atom.coordinationSites,
      (left: CanonicalAtomSnapshot['coordinationSites'][number], right) =>
        compareText(left.id, right.id),
      `${path}.coordinationSites`,
    )
    sitesByAtomId.set(atom.id, siteIds)
    assertNullableFiniteInteger(atom.coordinationNumber, `${path}.coordinationNumber`, 0)
  })
  assertSorted(snapshot.atoms, (left, right) => compareText(left.id, right.id), 'atoms')

  const bondIds = new Set<string>()
  const endpointPairs = new Set<string>()
  snapshot.bonds.forEach((bond, bondIndex) => {
    const path = `bonds[${bondIndex}]`
    assertNonEmptyString(bond.id, `${path}.id`)
    if (bondIds.has(bond.id)) invalidSnapshot(`${path}.id`, `duplicate bond ID ${bond.id}`)
    bondIds.add(bond.id)
    assertNonEmptyString(bond.atomId1, `${path}.atomId1`)
    assertNonEmptyString(bond.atomId2, `${path}.atomId2`)
    if (!atomIds.has(bond.atomId1) || !atomIds.has(bond.atomId2)) {
      invalidSnapshot(path, 'bond endpoint does not exist')
    }
    if (compareText(bond.atomId1, bond.atomId2) >= 0) {
      invalidSnapshot(path, 'bond endpoints are not distinct and canonically ordered')
    }
    const endpointPair = `${bond.atomId1}\u0000${bond.atomId2}`
    if (endpointPairs.has(endpointPair)) invalidSnapshot(path, 'duplicate bond endpoint pair')
    endpointPairs.add(endpointPair)
    if (bond.order !== 1 && bond.order !== 2 && bond.order !== 3) {
      invalidSnapshot(`${path}.order`, 'expected bond order 1, 2, or 3')
    }
    if (typeof bond.aromatic !== 'boolean') invalidSnapshot(`${path}.aromatic`, 'expected a boolean')
    if (!Array.isArray(bond.coordinationSites)) {
      invalidSnapshot(`${path}.coordinationSites`, 'expected an array')
    }
    const assignments = new Set<string>()
    bond.coordinationSites.forEach((
      assignment: CanonicalBondSnapshot['coordinationSites'][number],
      assignmentIndex: number,
    ) => {
      const assignmentPath = `${path}.coordinationSites[${assignmentIndex}]`
      assertNonEmptyString(assignment.atomId, `${assignmentPath}.atomId`)
      assertNonEmptyString(assignment.siteId, `${assignmentPath}.siteId`)
      if (assignment.atomId !== bond.atomId1 && assignment.atomId !== bond.atomId2) {
        invalidSnapshot(assignmentPath, 'coordination site atom is not a bond endpoint')
      }
      if (!sitesByAtomId.get(assignment.atomId)?.has(assignment.siteId)) {
        invalidSnapshot(assignmentPath, 'coordination site does not exist on its atom')
      }
      const key = `${assignment.atomId}\u0000${assignment.siteId}`
      if (assignments.has(key)) invalidSnapshot(assignmentPath, 'duplicate coordination site assignment')
      assignments.add(key)
    })
    assertSorted(
      bond.coordinationSites,
      (left: CanonicalBondSnapshot['coordinationSites'][number], right) =>
        compareText(left.atomId, right.atomId) || compareText(left.siteId, right.siteId),
      `${path}.coordinationSites`,
    )
  })
  assertSorted(snapshot.bonds, (left, right) => compareText(left.id, right.id), 'bonds')
}

/** Stable, field-normalized projection used by ExpectedEffect V1. */
export function createCanonicalMoleculeSnapshot(molecule: Molecule): CanonicalMoleculeSnapshot {
  const snapshot: CanonicalMoleculeSnapshot = {
    name: molecule.name ?? null,
    atoms: molecule.atoms
      .map(canonicalAtom)
      .sort((left, right) => compareText(left.id, right.id)),
    bonds: molecule.bonds
      .map(canonicalBond)
      .sort((left, right) => compareText(left.id, right.id)),
  }
  assertCanonicalMoleculeSnapshot(snapshot)
  return snapshot
}

/** Cryptographic digest of the V1 canonical projection. */
export function computeCanonicalSnapshotDigest(snapshot: CanonicalMoleculeSnapshot): string {
  assertCanonicalMoleculeSnapshot(snapshot)
  return `${CANONICAL_DIGEST_PREFIX}${sha256Hex(JSON.stringify(snapshot))}`
}

export function computeCanonicalMoleculeDigest(molecule: Molecule): string {
  return computeCanonicalSnapshotDigest(createCanonicalMoleculeSnapshot(molecule))
}

function entityChanges<T extends { readonly id: string }>(
  beforeItems: readonly T[],
  afterItems: readonly T[],
): ExpectedEffectEntityChange<T>[] {
  const before = new Map(beforeItems.map(item => [item.id, item]))
  const after = new Map(afterItems.map(item => [item.id, item]))
  const ids = [...new Set([...before.keys(), ...after.keys()])].sort(compareText)
  return ids.flatMap(id => {
    const previous = before.get(id) ?? null
    const next = after.get(id) ?? null
    return JSON.stringify(previous) === JSON.stringify(next)
      ? []
      : [{ id, before: previous, after: next }]
  })
}

export function createCanonicalEffectChanges(
  before: CanonicalMoleculeSnapshot,
  after: CanonicalMoleculeSnapshot,
): ExpectedEffectChanges {
  return {
    atoms: entityChanges(before.atoms, after.atoms),
    bonds: entityChanges(before.bonds, after.bonds),
  }
}
