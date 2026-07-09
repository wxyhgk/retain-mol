import * as THREE from 'three'
import type { Atom, Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'

export interface RingFuseFragmentFrame {
  readonly midpoint: THREE.Vector3
  readonly axis1: THREE.Vector3
  readonly axis2: THREE.Vector3
  readonly axis3: THREE.Vector3
  readonly centroid: THREE.Vector3
}

export interface RingFuseTargetFrame {
  readonly midpoint: THREE.Vector3
  readonly axis1: THREE.Vector3
  readonly preferredAxis2: THREE.Vector3
}

export function buildRingFuseFragmentFrame(
  fragment: FragmentDef,
  f1i: number,
  f2i: number,
): RingFuseFragmentFrame | null {
  const fragmentAtom1 = new THREE.Vector3(fragment.atoms[f1i].x, fragment.atoms[f1i].y, fragment.atoms[f1i].z)
  const fragmentAtom2 = new THREE.Vector3(fragment.atoms[f2i].x, fragment.atoms[f2i].y, fragment.atoms[f2i].z)
  const midpoint = fragmentAtom1.clone().add(fragmentAtom2).multiplyScalar(0.5)
  const axis1 = fragmentAtom2.clone().sub(fragmentAtom1).normalize()
  const heavyAtoms = fragment.atoms.filter(atom => atom.symbol !== 'H')
  const centroid = new THREE.Vector3()
  for (const atom of heavyAtoms) centroid.add(new THREE.Vector3(atom.x, atom.y, atom.z))
  centroid.divideScalar(heavyAtoms.length)

  const axis2 = centroid.clone().sub(midpoint)
  axis2.addScaledVector(axis1, -axis2.dot(axis1))
  if (axis2.lengthSq() < 1e-9) return null
  axis2.normalize()
  const axis3 = axis1.clone().cross(axis2)

  return { midpoint, axis1, axis2, axis3, centroid }
}

export function buildRingFuseTargetFrame(
  molecule: Molecule,
  targetAtom1: Atom,
  targetAtom2: Atom,
): RingFuseTargetFrame {
  const targetVector1 = new THREE.Vector3(targetAtom1.x, targetAtom1.y, targetAtom1.z)
  const targetVector2 = new THREE.Vector3(targetAtom2.x, targetAtom2.y, targetAtom2.z)
  const midpoint = targetVector1.clone().add(targetVector2).multiplyScalar(0.5)
  const axis1 = targetVector2.clone().sub(targetVector1).normalize()
  const atomById = new Map(molecule.atoms.map(atom => [atom.id, atom]))
  const away = new THREE.Vector3()

  for (const bond of molecule.bonds) {
    for (const [self, selfVector] of [[targetAtom1, targetVector1], [targetAtom2, targetVector2]] as const) {
      let otherId: string | null = null
      if (bond.atomId1 === self.id) otherId = bond.atomId2
      else if (bond.atomId2 === self.id) otherId = bond.atomId1
      if (!otherId || otherId === targetAtom1.id || otherId === targetAtom2.id) continue
      const other = atomById.get(otherId)
      if (!other || other.symbol === 'H') continue
      away.add(new THREE.Vector3(other.x - selfVector.x, other.y - selfVector.y, other.z - selfVector.z).normalize())
    }
  }

  let preferredAxis2 = away.multiplyScalar(-1)
  preferredAxis2.addScaledVector(axis1, -preferredAxis2.dot(axis1))
  if (preferredAxis2.lengthSq() < 1e-6) {
    preferredAxis2 = Math.abs(axis1.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)
    preferredAxis2.addScaledVector(axis1, -preferredAxis2.dot(axis1))
  }
  preferredAxis2.normalize()

  return { midpoint, axis1, preferredAxis2 }
}
