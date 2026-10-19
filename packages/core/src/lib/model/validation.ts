import type { Molecule } from './types'

type RecordValue = Record<string, unknown>

function invalid(path: string, message: string): never {
  throw new TypeError(`${path}: ${message}`)
}

function record(value: unknown, path: string): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid(path, 'expected an object')
  return value as RecordValue
}

function list(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) invalid(path, 'expected an array')
  return value
}

function text(value: unknown, path: string, nonempty = false): string {
  if (typeof value !== 'string' || (nonempty && !value.trim())) invalid(path, 'expected a string')
  return value
}

function finite(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) invalid(path, 'expected a finite number')
  return value
}

function integer(value: unknown, path: string, minimum = -Infinity): void {
  if (!Number.isSafeInteger(finite(value, path)) || (value as number) < minimum) {
    invalid(path, `expected an integer >= ${minimum}`)
  }
}

function oneOf(value: unknown, choices: readonly unknown[], path: string): void {
  if (!choices.includes(value)) invalid(path, `expected ${choices.join(' / ')}`)
}

function direction(value: unknown, path: string): void {
  const xyz = list(value, path)
  if (xyz.length !== 3) invalid(path, 'expected three coordinates')
  xyz.forEach((entry, i) => finite(entry, `${path}[${i}]`))
}

/** Clone JSON data without retaining caller-owned references or invoking toJSON. */
function cloneJson(value: unknown, path: string, ancestors = new Set<object>()): unknown {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') return finite(value, path)
  if (!value || typeof value !== 'object') invalid(path, 'expected JSON data')
  if (ancestors.has(value) || ancestors.size >= 64) invalid(path, 'cyclic or excessively nested data')
  const prototype = Object.getPrototypeOf(value)
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    invalid(path, 'expected a plain JSON object')
  }
  ancestors.add(value)
  try {
    if (Array.isArray(value)) return Array.from(value, (entry, i) => cloneJson(entry, `${path}[${i}]`, ancestors))
    return Object.fromEntries(Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => [key, cloneJson(entry, `${path}.${key}`, ancestors)]))
  } finally {
    ancestors.delete(value)
  }
}

/**
 * Validate the existing Molecule shape and take ownership of its JSON data.
 * Checks fields and references, not chemical feasibility or computed stereochemistry.
 * Unknown JSON fields are preserved; unsupported values are rejected, never dropped.
 */
export function parseMolecule(value: unknown): Molecule {
  const molecule = record(cloneJson(value, 'molecule'), 'molecule')
  if (molecule.name !== undefined) text(molecule.name, 'molecule.name')
  const atomIds = new Set<string>()
  const siteIds = new Map<string, Set<string>>()
  list(molecule.atoms, 'molecule.atoms').forEach((value, i) => {
    const path = `molecule.atoms[${i}]`
    const atom = record(value, path)
    const id = text(atom.id, `${path}.id`, true)
    if (atomIds.has(id)) invalid(`${path}.id`, 'duplicate atom ID')
    atomIds.add(id)
    text(atom.symbol, `${path}.symbol`, true)
    for (const key of ['x', 'y', 'z']) finite(atom[key], `${path}.${key}`)
    if (atom.charge !== undefined) integer(atom.charge, `${path}.charge`)
    if (atom.radical !== undefined) integer(atom.radical, `${path}.radical`, 0)
    if (atom.isotope !== undefined) integer(atom.isotope, `${path}.isotope`, 1)
    if (atom.label !== undefined) text(atom.label, `${path}.label`)
    if (atom.chirality !== undefined) oneOf(atom.chirality, ['R', 'S'], `${path}.chirality`)
    if (atom.coordinationGeometry !== undefined) text(atom.coordinationGeometry, `${path}.coordinationGeometry`)
    if (atom.coordinationNumber !== undefined) integer(atom.coordinationNumber, `${path}.coordinationNumber`, 0)
    if (atom.coordinationDirections !== undefined) {
      list(atom.coordinationDirections, `${path}.coordinationDirections`)
        .forEach((value, j) => direction(value, `${path}.coordinationDirections[${j}]`))
    }
    const sites = new Set<string>()
    siteIds.set(id, sites)
    if (atom.coordinationSites !== undefined) {
      list(atom.coordinationSites, `${path}.coordinationSites`).forEach((value, j) => {
        const sitePath = `${path}.coordinationSites[${j}]`
        const site = record(value, sitePath)
        const siteId = text(site.id, `${sitePath}.id`, true)
        if (sites.has(siteId)) invalid(`${sitePath}.id`, 'duplicate site ID')
        sites.add(siteId)
        text(site.label, `${sitePath}.label`)
        text(site.equivalenceGroup, `${sitePath}.equivalenceGroup`, true)
        direction(site.direction, `${sitePath}.direction`)
        oneOf(site.bondOrder, [1, 2, 3], `${sitePath}.bondOrder`)
      })
    }
  })
  const bondIds = new Set<string>()
  const edges = new Set<string>()
  list(molecule.bonds, 'molecule.bonds').forEach((value, i) => {
    const path = `molecule.bonds[${i}]`
    const bond = record(value, path)
    const id = text(bond.id, `${path}.id`, true)
    if (bondIds.has(id)) invalid(`${path}.id`, 'duplicate bond ID')
    bondIds.add(id)
    for (const key of ['atomId1', 'atomId2']) {
      if (!atomIds.has(text(bond[key], `${path}.${key}`, true))) invalid(`${path}.${key}`, 'missing atom')
    }
    if (bond.atomId1 === bond.atomId2) invalid(path, 'self bond')
    const edge = JSON.stringify([bond.atomId1, bond.atomId2].sort())
    if (edges.has(edge)) invalid(path, 'duplicate bond endpoints')
    edges.add(edge)
    oneOf(bond.order, [1, 2, 3], `${path}.order`)
    if (bond.aromatic !== undefined) oneOf(bond.aromatic, [true, false], `${path}.aromatic`)
    if (bond.wedge !== undefined) oneOf(bond.wedge, ['up', 'down'], `${path}.wedge`)
    if (bond.ez !== undefined) oneOf(bond.ez, ['E', 'Z'], `${path}.ez`)
    if (bond.coordinationSites !== undefined) {
      list(bond.coordinationSites, `${path}.coordinationSites`).forEach((value, j) => {
        const sitePath = `${path}.coordinationSites[${j}]`
        const site = record(value, sitePath)
        const atomId = text(site.atomId, `${sitePath}.atomId`, true)
        oneOf(atomId, [bond.atomId1, bond.atomId2], `${sitePath}.atomId`)
        if (!siteIds.get(atomId)?.has(text(site.siteId, `${sitePath}.siteId`, true))) {
          invalid(sitePath, 'missing coordination site')
        }
      })
    }
  })
  return molecule as unknown as Molecule
}
