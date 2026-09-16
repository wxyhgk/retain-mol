import type { Atom, Bond, Molecule } from '@retainmol/mol-viewer/core'

const CONTENT_SCHEMA_VERSION = 1 as const
const TOPOLOGY_SCHEMA_VERSION = 1 as const

type JsonObject = Record<string, unknown>

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function serializeCanonical(value: unknown, ancestors: Set<object>): string | undefined {
  if (value === null) return 'null'

  switch (typeof value) {
    case 'string':
    case 'boolean':
      return JSON.stringify(value)
    case 'number':
      if (!Number.isFinite(value)) {
        throw new TypeError('Canonical JSON only supports finite numbers')
      }
      return JSON.stringify(value)
    case 'undefined':
    case 'function':
    case 'symbol':
      return undefined
    case 'bigint':
      throw new TypeError('Canonical JSON does not support bigint values')
  }

  const objectValue = value as object
  if (ancestors.has(objectValue)) {
    throw new TypeError('Canonical JSON does not support circular values')
  }

  ancestors.add(objectValue)
  try {
    if (Array.isArray(value)) {
      const entries = value.map(entry => serializeCanonical(entry, ancestors) ?? 'null')
      return `[${entries.join(',')}]`
    }

    const object = value as JsonObject
    const entries: string[] = []
    for (const key of Object.keys(object).sort(compareText)) {
      const serialized = serializeCanonical(object[key], ancestors)
      if (serialized !== undefined) {
        entries.push(`${JSON.stringify(key)}:${serialized}`)
      }
    }
    return `{${entries.join(',')}}`
  } finally {
    ancestors.delete(objectValue)
  }
}

/** JSON serialization with recursively sorted object keys and JSON-compatible omission rules. */
export function stableCanonicalJson(value: unknown): string {
  return serializeCanonical(value, new Set()) ?? 'null'
}

function sortByIdThenValue<T extends { readonly id: string }>(values: readonly T[]): T[] {
  return [...values].sort((left, right) => {
    const idComparison = compareText(left.id, right.id)
    return idComparison || compareText(stableCanonicalJson(left), stableCanonicalJson(right))
  })
}

function normalizeCoordinationSites<T extends { readonly id: string }>(sites: readonly T[]): T[] {
  return sortByIdThenValue(sites)
}

function normalizeAtom(atom: Atom): JsonObject {
  const normalized: JsonObject = { ...atom }
  if (atom.coordinationSites) {
    normalized.coordinationSites = normalizeCoordinationSites(atom.coordinationSites)
  }
  return normalized
}

function normalizeBond(bond: Bond): JsonObject {
  const [atomId1, atomId2] = bond.atomId1 <= bond.atomId2
    ? [bond.atomId1, bond.atomId2]
    : [bond.atomId2, bond.atomId1]
  const normalized: JsonObject = { ...bond, atomId1, atomId2 }

  if (bond.coordinationSites) {
    normalized.coordinationSites = [...bond.coordinationSites].sort((left, right) => (
      compareText(left.atomId, right.atomId)
      || compareText(left.siteId, right.siteId)
      || compareText(stableCanonicalJson(left), stableCanonicalJson(right))
    ))
  }
  return normalized
}

function sortNormalized(values: readonly JsonObject[]): JsonObject[] {
  return [...values].sort((left, right) => {
    const leftId = typeof left.id === 'string' ? left.id : ''
    const rightId = typeof right.id === 'string' ? right.id : ''
    return compareText(leftId, rightId)
      || compareText(stableCanonicalJson(left), stableCanonicalJson(right))
  })
}

function topologyAtom(atom: Atom): JsonObject {
  const normalized: JsonObject = {
    ...atom,
    x: undefined,
    y: undefined,
    z: undefined,
    coordinationDirections: undefined,
    coordinationSites: undefined,
    chirality: undefined,
  }

  if (atom.coordinationSites) {
    normalized.coordinationSites = normalizeCoordinationSites(atom.coordinationSites.map(site => ({
      ...site,
      direction: undefined,
    })))
  }
  return normalized
}

function topologyBond(bond: Bond): JsonObject {
  return { ...normalizeBond(bond), id: undefined, wedge: undefined, ez: undefined }
}

/** Canonical v1 representation of all molecule content, including coordinates. */
export function canonicalizeMolecule(molecule: Molecule): string {
  return stableCanonicalJson({
    schemaVersion: CONTENT_SCHEMA_VERSION,
    molecule: {
      ...molecule,
      atoms: sortNormalized(molecule.atoms.map(normalizeAtom)),
      bonds: sortNormalized(molecule.bonds.map(normalizeBond)),
    },
  })
}

/** Canonical v1 molecular graph representation without Cartesian coordinate data. */
export function canonicalizeMoleculeTopology(molecule: Molecule): string {
  return stableCanonicalJson({
    schemaVersion: TOPOLOGY_SCHEMA_VERSION,
    atoms: sortNormalized(molecule.atoms.map(topologyAtom)),
    bonds: sortNormalized(molecule.bonds.map(topologyBond)),
  })
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}

export function computeContentHash(molecule: Molecule): Promise<string> {
  return sha256Hex(canonicalizeMolecule(molecule))
}

export function computeTopologyFingerprint(molecule: Molecule): Promise<string> {
  return sha256Hex(canonicalizeMoleculeTopology(molecule))
}

export const computeMoleculeContentHash = computeContentHash
export const computeMoleculeTopologyFingerprint = computeTopologyFingerprint
