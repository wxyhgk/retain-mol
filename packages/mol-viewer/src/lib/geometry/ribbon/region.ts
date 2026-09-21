import type { Molecule } from '../../model/types'
import type { GeometryRibbonIssue, GeometryRibbonRegion, GeometryRibbonValidation } from './contracts'

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function id(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function pairKey(first: string, second: string): string {
  return JSON.stringify([first, second].sort())
}

/** Validate an explicitly supplied region without guessing a ring or adding any connectivity. */
export function validateRibbonRegion(molecule: Molecule, region: GeometryRibbonRegion): GeometryRibbonValidation {
  const issues: GeometryRibbonIssue[] = []
  const atomIds: string[] = []
  const reject = (code: GeometryRibbonIssue['code'], message: string, affected: readonly string[] = [], sectionIndex?: number): void => {
    issues.push({ code, message, atomIds: affected, ...(sectionIndex === undefined ? {} : { sectionIndex }) })
  }
  if (!record(molecule) || !Array.isArray(molecule.atoms) || !Array.isArray(molecule.bonds)) {
    reject('invalid-input', 'Molecule must contain atom and bond arrays.')
    return { ok: false, atomIds, issues }
  }
  if (!record(region) || !id(region.id) || !Array.isArray(region.sections) || region.sections.length < 3 || region.sections.length > 500
    || !['open', 'parallel', 'crossed'].includes(region.closure)) {
    reject('invalid-region', 'Ribbon region requires an ID, 3 through 500 ordered sections, and an explicit closure.')
    return { ok: false, atomIds, issues }
  }
  const atoms = new Map<string, Record<string, unknown>>()
  for (const atom of molecule.atoms) {
    if (!record(atom) || !id(atom.id)) {
      reject('invalid-input', 'Molecule atom IDs must be nonempty strings.')
      continue
    }
    if (atoms.has(atom.id)) reject('invalid-input', 'Molecule atom IDs must be unique.', [atom.id])
    atoms.set(atom.id, atom)
  }
  const seen = new Set<string>()
  for (const [index, section] of region.sections.entries()) {
    if (!record(section) || !id(section.leftAtomId) || !id(section.rightAtomId)) {
      reject('invalid-region', 'Each section requires left and right atom IDs.', [], index)
      continue
    }
    for (const atomId of [section.leftAtomId, section.rightAtomId]) {
      atomIds.push(atomId)
      if (seen.has(atomId)) reject('invalid-region', 'An atom cannot occupy more than one ribbon section side.', [atomId], index)
      seen.add(atomId)
      const atom = atoms.get(atomId)
      if (!atom) reject('invalid-region', 'Ribbon atom does not exist.', [atomId], index)
      else if (![atom.x, atom.y, atom.z].every(Number.isFinite)) reject('invalid-input', 'Ribbon coordinates must be finite.', [atomId], index)
    }
  }
  const edges = new Set<string>()
  const bondIds = new Set<string>()
  for (const bond of molecule.bonds) {
    if (!record(bond) || !id(bond.id) || !id(bond.atomId1) || !id(bond.atomId2)
      || !atoms.has(bond.atomId1) || !atoms.has(bond.atomId2) || bond.atomId1 === bond.atomId2) {
      reject('invalid-input', 'Bonds require stable IDs and two distinct existing endpoints.')
      continue
    }
    const key = pairKey(bond.atomId1, bond.atomId2)
    if (bondIds.has(bond.id) || edges.has(key)) reject('invalid-input', 'Duplicate bond ID or atom-pair edge.', [bond.atomId1, bond.atomId2])
    bondIds.add(bond.id)
    edges.add(key)
  }
  if (issues.length > 0) return { ok: false, atomIds, issues }
  const rail = (first: string, second: string, sectionIndex: number): void => {
    if (!edges.has(pairKey(first, second))) reject('missing-rail-bond', 'Declared ribbon rail connection is absent.', [first, second], sectionIndex)
  }
  for (let index = 0; index < region.sections.length - 1; index += 1) {
    const first = region.sections[index]!
    const second = region.sections[index + 1]!
    rail(first.leftAtomId, second.leftAtomId, index)
    rail(first.rightAtomId, second.rightAtomId, index)
  }
  if (region.closure !== 'open') {
    const first = region.sections[0]!
    const last = region.sections.at(-1)!
    rail(last.leftAtomId, region.closure === 'crossed' ? first.rightAtomId : first.leftAtomId, region.sections.length - 1)
    rail(last.rightAtomId, region.closure === 'crossed' ? first.leftAtomId : first.rightAtomId, region.sections.length - 1)
  }
  return { ok: issues.length === 0, atomIds, issues }
}
