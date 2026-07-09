import * as THREE from 'three'
import { lookupBondLengthByOrder } from '../../../../config/geometry.config'
import type { Atom } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { calcBondLength } from '../../geometry/vsepr'

export interface AttachFragmentGeometryInput {
  readonly fragment: FragmentDef
  readonly host: Atom
  readonly direction: THREE.Vector3
  readonly order: 1 | 2 | 3
}

export interface AttachFragmentGeometry {
  readonly attachOrigin: THREE.Vector3
  readonly alignedRotation: THREE.Quaternion
  readonly anchor: THREE.Vector3
}

export function buildAttachFragmentGeometry(input: AttachFragmentGeometryInput): AttachFragmentGeometry {
  const attachAtom = input.fragment.atoms[input.fragment.attachIndex]
  const attachHydrogen = input.fragment.atoms[input.fragment.attachHIndex]
  const attachOrigin = new THREE.Vector3(attachAtom.x, attachAtom.y, attachAtom.z)
  const attachDirection = new THREE.Vector3(
    attachHydrogen.x - attachAtom.x,
    attachHydrogen.y - attachAtom.y,
    attachHydrogen.z - attachAtom.z,
  ).normalize()

  const alignedRotation = new THREE.Quaternion().setFromUnitVectors(
    attachDirection,
    input.direction.clone().negate(),
  )
  const bondLength = lookupBondLengthByOrder(input.host.symbol, attachAtom.symbol, input.order)
    ?? calcBondLength(input.host.symbol, attachAtom.symbol)
  const anchor = new THREE.Vector3(input.host.x, input.host.y, input.host.z)
    .addScaledVector(input.direction, bondLength)

  return { attachOrigin, alignedRotation, anchor }
}
