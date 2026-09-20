import type { Atom, Bond, Molecule } from '../../molecule'
import type {
  CanonicalAtomSnapshot,
  CanonicalBondSnapshot,
  CanonicalMoleculeSnapshot,
  ExpectedEffectChanges,
  ExpectedEffectEntityChange,
} from './contracts'
import { sha256Hex } from './sha256'

const CANONICAL_DIGEST_PREFIX = 'canonical-v3-sha256-'

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function canonicalNumber(value: number): number {
  return Object.is(value, -0) ? 0 : value
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
    chirality: atom.chirality ?? null,
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
  // Wedges are directed: atomId1 is the narrow end. Plain bonds remain unordered.
  const endpoints = [bond.atomId1, bond.atomId2]
  const [atomId1, atomId2] = bond.wedge ? endpoints : endpoints.sort(compareText)
  return {
    id: bond.id,
    atomId1: atomId1!,
    atomId2: atomId2!,
    order: bond.order,
    aromatic: bond.aromatic === true,
    wedge: bond.wedge ?? null,
    ez: bond.ez ?? null,
    coordinationSites: (bond.coordinationSites ?? [])
      .map(site => ({ atomId: site.atomId, siteId: site.siteId }))
      .sort((left, right) => compareText(left.atomId, right.atomId) || compareText(left.siteId, right.siteId)),
  }
}

/** Stable, field-normalized projection used by ExpectedEffect V2. */
export function createCanonicalMoleculeSnapshot(molecule: Molecule): CanonicalMoleculeSnapshot {
  return {
    name: molecule.name ?? null,
    atoms: molecule.atoms
      .map(canonicalAtom)
      .sort((left, right) => compareText(left.id, right.id)),
    bonds: molecule.bonds
      .map(canonicalBond)
      .sort((left, right) => compareText(left.id, right.id)),
  }
}

/** Cryptographic digest of the V2 canonical projection. */
export function computeCanonicalSnapshotDigest(snapshot: CanonicalMoleculeSnapshot): string {
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
