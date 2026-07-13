import { lookupBondLengthByOrder } from '../../../../config/geometry.config'
import type { Atom } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { calcBondLength } from '../../geometry/vsepr'
import { add, normalize, quatFromUnitVectors, scale, type Quat, type Vec3 } from '../../math'
import { requireFragmentAtomAttachment } from './fragmentGuards'

export interface AttachFragmentGeometryInput {
  readonly fragment: FragmentDef
  readonly host: Atom
  readonly direction: Vec3
  readonly order: 1 | 2 | 3
}

export interface AttachFragmentGeometry {
  readonly attachOrigin: Vec3
  readonly alignedRotation: Quat
  readonly anchor: Vec3
}

export function buildAttachFragmentGeometry(input: AttachFragmentGeometryInput): AttachFragmentGeometry {
  const attachment = requireFragmentAtomAttachment(input.fragment)
  const attachAtom = attachment.attachAtom
  const attachOrigin: Vec3 = [attachAtom.x, attachAtom.y, attachAtom.z]
  const attachDirection = normalize(attachment.authoredDirection)

  const alignedRotation = quatFromUnitVectors(
    attachDirection,
    scale(input.direction, -1),
  )
  const bondLength = lookupBondLengthByOrder(input.host.symbol, attachAtom.symbol, input.order)
    ?? calcBondLength(input.host.symbol, attachAtom.symbol)
  const anchor = add(
    [input.host.x, input.host.y, input.host.z],
    scale(input.direction, bondLength),
  )

  return { attachOrigin, alignedRotation, anchor }
}
