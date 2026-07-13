import type { Atom, Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { add, cross, dot, length, normalize, scale, sub, type Vec3 } from '../../math'
import { findFragmentBond, getFragmentAtom } from './fragmentGuards'

export interface RingFuseFragmentFrame {
  readonly midpoint: Vec3
  readonly axis1: Vec3
  readonly axis2: Vec3
  readonly axis3: Vec3
  readonly centroid: Vec3
}

export interface RingFuseTargetFrame {
  readonly midpoint: Vec3
  readonly axis1: Vec3
  readonly preferredAxis2: Vec3
}

export function buildRingFuseFragmentFrame(
  fragment: FragmentDef,
  f1i: number,
  f2i: number,
): RingFuseFragmentFrame | null {
  const atom1 = getFragmentAtom(fragment, f1i)
  const atom2 = getFragmentAtom(fragment, f2i)
  if (!atom1 || !atom2 || atom1.symbol === 'H' || atom2.symbol === 'H') return null
  if (!findFragmentBond(fragment, f1i, f2i)) return null
  const fragmentAtom1: Vec3 = [atom1.x, atom1.y, atom1.z]
  const fragmentAtom2: Vec3 = [atom2.x, atom2.y, atom2.z]
  const midpoint = scale(add(fragmentAtom1, fragmentAtom2), 0.5)
  const axis1 = normalize(sub(fragmentAtom2, fragmentAtom1))
  const heavyAtoms = fragment.atoms.filter(atom => atom.symbol !== 'H')
  if (heavyAtoms.length === 0) return null
  let centroid: Vec3 = [0, 0, 0]
  for (const atom of heavyAtoms) centroid = add(centroid, [atom.x, atom.y, atom.z])
  centroid = scale(centroid, 1 / heavyAtoms.length)

  let axis2 = sub(centroid, midpoint)
  axis2 = add(axis2, scale(axis1, -dot(axis2, axis1)))
  if (length(axis2) < 1e-9) return null
  axis2 = normalize(axis2)
  const axis3 = cross(axis1, axis2)

  return { midpoint, axis1, axis2, axis3, centroid }
}

export function buildRingFuseTargetFrame(
  molecule: Molecule,
  targetAtom1: Atom,
  targetAtom2: Atom,
): RingFuseTargetFrame {
  const targetVector1: Vec3 = [targetAtom1.x, targetAtom1.y, targetAtom1.z]
  const targetVector2: Vec3 = [targetAtom2.x, targetAtom2.y, targetAtom2.z]
  const midpoint = scale(add(targetVector1, targetVector2), 0.5)
  const axis1 = normalize(sub(targetVector2, targetVector1))
  const atomById = new Map(molecule.atoms.map(atom => [atom.id, atom]))
  let away: Vec3 = [0, 0, 0]

  for (const bond of molecule.bonds) {
    for (const [self, selfVector] of [[targetAtom1, targetVector1], [targetAtom2, targetVector2]] as const) {
      let otherId: string | null = null
      if (bond.atomId1 === self.id) otherId = bond.atomId2
      else if (bond.atomId2 === self.id) otherId = bond.atomId1
      if (!otherId || otherId === targetAtom1.id || otherId === targetAtom2.id) continue
      const other = atomById.get(otherId)
      if (!other || other.symbol === 'H') continue
      away = add(away, normalize([
        other.x - selfVector[0],
        other.y - selfVector[1],
        other.z - selfVector[2],
      ]))
    }
  }

  let preferredAxis2 = scale(away, -1)
  preferredAxis2 = add(preferredAxis2, scale(axis1, -dot(preferredAxis2, axis1)))
  if (length(preferredAxis2) < 1e-6) {
    preferredAxis2 = Math.abs(axis1[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]
    preferredAxis2 = add(preferredAxis2, scale(axis1, -dot(preferredAxis2, axis1)))
  }
  preferredAxis2 = normalize(preferredAxis2)

  return { midpoint, axis1, preferredAxis2 }
}
