import type { Atom, Bond, Molecule, Vector3Data } from '../../model/types'
import { cross, dot } from '../../math/vec3'
import type { Vec3 } from '../../math/vec3'
import type { GeometryConstraintIssue } from './contracts'

const MIN_LENGTH = 1e-10
const MIN_DIRECTION = 1e-8
const MIN_NORMALIZED_VOLUME = 1e-6
const COPLANAR_COSINE = Math.cos(15 * Math.PI / 180)

function unit(value: Vec3, minimum: number): Vec3 | null {
  const length = Math.hypot(...value)
  return Number.isFinite(length) && length > minimum
    ? [value[0] / length, value[1] / length, value[2] / length] : null
}

function direction(from: Vector3Data, to: Vector3Data): Vec3 | null {
  return unit([to.x - from.x, to.y - from.y, to.z - from.z], MIN_LENGTH)
}

function neighbors(molecule: Molecule, atomId: string): string[] {
  const result = new Set<string>()
  for (const bond of molecule.bonds) {
    if (bond.atomId1 === atomId) result.add(bond.atomId2)
    if (bond.atomId2 === atomId) result.add(bond.atomId1)
  }
  return [...result].sort()
}

function sameIds(first: readonly string[], second: readonly string[]): boolean {
  return first.length === second.length && first.every((id, index) => id === second[index])
}

function tetrahedralSign(atoms: ReadonlyMap<string, Atom>, centerId: string, neighborIds: readonly string[]): number | null {
  // Four explicit ligands define a tetrahedron; with three explicit ligands,
  // use their vectors from the center and treat the fourth as implicit.
  const origin = atoms.get(neighborIds.length === 4 ? neighborIds[3]! : centerId)
  if (!origin) return null
  const vectors = neighborIds.slice(0, 3).map(id => {
    const atom = atoms.get(id)
    return atom ? direction(origin, atom) : null
  })
  if (vectors.some(vector => vector === null)) return null
  const signedVolume = dot(vectors[0]!, cross(vectors[1]!, vectors[2]!))
  return Number.isFinite(signedVolume) && Math.abs(signedVolume) > MIN_NORMALIZED_VOLUME ? Math.sign(signedVolume) : null
}

function substituentProjections(
  atoms: ReadonlyMap<string, Atom>, centerId: string, otherEndId: string, substituentIds: readonly string[],
): Vec3[] | null {
  const center = atoms.get(centerId)
  const otherEnd = atoms.get(otherEndId)
  if (!center || !otherEnd) return null
  const axis = direction(center, otherEnd)
  if (!axis) return null
  const result: Vec3[] = []
  for (const id of substituentIds) {
    const atom = atoms.get(id)
    if (!atom) return null
    const bond = direction(center, atom)
    if (!bond) return null
    const axial = dot(bond, axis)
    const projected = unit([
      bond[0] - axial * axis[0], bond[1] - axial * axis[1], bond[2] - axial * axis[2],
    ], MIN_DIRECTION)
    if (!projected) return null
    result.push(projected)
  }
  // Two explicit substituents at one alkene endpoint must project to opposite
  // sides. Otherwise selecting just the first could hide ambiguous geometry.
  if (result.length === 2 && dot(result[0]!, result[1]!) > -COPLANAR_COSINE) return null
  return result
}

function alkeneSigns(
  atoms: ReadonlyMap<string, Atom>, bond: Bond, firstIds: readonly string[], secondIds: readonly string[],
): number[] | null {
  const first = substituentProjections(atoms, bond.atomId1, bond.atomId2, firstIds)
  const second = substituentProjections(atoms, bond.atomId2, bond.atomId1, secondIds)
  if (!first || !second) return null
  const signs: number[] = []
  for (const a of first) for (const b of second) {
    const cosine = dot(a, b)
    // A twisted 90-degree or collinear arrangement has no accepted E/Z here.
    if (!Number.isFinite(cosine) || Math.abs(cosine) < COPLANAR_COSINE) return null
    signs.push(Math.sign(cosine))
  }
  return signs
}

/**
 * Guard authored stereochemistry during coordinate-only deformation.
 * Molecule topology is expected to have passed ordinary input validation.
 * This preserves the baseline's oriented geometry; it does not perform CIP
 * ranking, assign R/S or E/Z, or prove continuity between the two poses.
 * Undefined marked geometry is rejected even when before and after coincide.
 */
export function checkPreservedStereoGeometry(before: Molecule, after: Molecule): readonly GeometryConstraintIssue[] {
  const issues: GeometryConstraintIssue[] = []
  const beforeAtoms = new Map(before.atoms.map(atom => [atom.id, atom]))
  const afterAtoms = new Map(after.atoms.map(atom => [atom.id, atom]))
  const afterBonds = new Map(after.bonds.map(bond => [bond.id, bond]))
  const reject = (message: string, atomIds: readonly string[]): void => {
    issues.push({ code: 'stereochemistry-violation', message, atomIds })
  }

  for (const center of before.atoms) {
    if (!center.chirality) continue
    const neighborIds = neighbors(before, center.id)
    const next = afterAtoms.get(center.id)
    if (!next || next.chirality !== center.chirality || (neighborIds.length !== 3 && neighborIds.length !== 4)
      || !sameIds(neighborIds, neighbors(after, center.id))) {
      reject('An authored tetrahedral center has missing, changed, or unsupported ligand topology or annotation.', [center.id, ...neighborIds])
      continue
    }
    const originalSign = tetrahedralSign(beforeAtoms, center.id, neighborIds)
    const nextSign = tetrahedralSign(afterAtoms, center.id, neighborIds)
    if (originalSign === null || nextSign === null || originalSign !== nextSign) {
      reject('Authored tetrahedral geometry changed handedness or became indeterminate.', [center.id, ...neighborIds])
    }
  }

  for (const bond of before.bonds) {
    if (!bond.ez) continue
    const next = afterBonds.get(bond.id)
    const firstIds = neighbors(before, bond.atomId1).filter(id => id !== bond.atomId2)
    const secondIds = neighbors(before, bond.atomId2).filter(id => id !== bond.atomId1)
    const affectedIds = [bond.atomId1, bond.atomId2, ...firstIds, ...secondIds]
    if (bond.order !== 2 || bond.aromatic || !next || next.order !== 2 || next.aromatic || next.ez !== bond.ez
      || next.atomId1 !== bond.atomId1 || next.atomId2 !== bond.atomId2
      || firstIds.length < 1 || firstIds.length > 2 || secondIds.length < 1 || secondIds.length > 2
      || !sameIds(firstIds, neighbors(after, bond.atomId1).filter(id => id !== bond.atomId2))
      || !sameIds(secondIds, neighbors(after, bond.atomId2).filter(id => id !== bond.atomId1))) {
      reject('An authored E/Z bond has missing, changed, or unsupported substituent topology or annotation.', affectedIds)
      continue
    }
    const originalSigns = alkeneSigns(beforeAtoms, bond, firstIds, secondIds)
    const nextSigns = alkeneSigns(afterAtoms, next, firstIds, secondIds)
    if (!originalSigns || !nextSigns || originalSigns.some((sign, index) => sign !== nextSigns[index])) {
      reject('Authored E/Z geometry changed orientation or is not sufficiently coplanar to verify.', affectedIds)
    }
  }
  return issues
}
