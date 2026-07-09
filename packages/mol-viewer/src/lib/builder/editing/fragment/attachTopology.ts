import * as THREE from 'three'
import type { Atom, Molecule } from '../../../molecule'
import { newBond } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { instantiate } from './instantiate'

export interface ApplyAttachFragmentTopologyInput {
  readonly molecule: Molecule
  readonly fragment: FragmentDef
  readonly host: Atom
  readonly order: 1 | 2 | 3
  readonly attachOrigin: THREE.Vector3
  readonly rotation: THREE.Quaternion
  readonly anchor: THREE.Vector3
  readonly removeAtomIds: ReadonlySet<string>
}

export function applyAttachFragmentTopology(input: ApplyAttachFragmentTopologyInput): Molecule {
  const { molecule, fragment, host, order, attachOrigin, rotation, anchor, removeAtomIds } = input
  const { atoms, bonds, idByIndex } = instantiate(
    fragment,
    p => p.sub(attachOrigin).applyQuaternion(rotation).add(anchor),
    fragment.attachHIndex,
  )
  const attachAtomId = idByIndex.get(fragment.attachIndex)
  if (attachAtomId === undefined) {
    throw new Error(`fragment attach atom ${fragment.attachIndex} was not instantiated`)
  }
  const linkBond = newBond(host.id, attachAtomId, order)

  return {
    ...molecule,
    atoms: [...molecule.atoms.filter(a => !removeAtomIds.has(a.id)), ...atoms],
    bonds: [
      ...molecule.bonds.filter(b => !removeAtomIds.has(b.atomId1) && !removeAtomIds.has(b.atomId2)),
      linkBond,
      ...bonds,
    ],
  }
}
