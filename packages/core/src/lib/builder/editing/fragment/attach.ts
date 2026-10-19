import type { Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { removeHydrogensUntilValenceFits } from './valenceFit'
import type { AttachResult } from './types'
import { planAttachFragmentPlacement } from './attachPlacement'
import { resolveAttachFragmentTarget } from './attachTarget'
import { buildAttachFragmentGeometry } from './attachGeometry'
import { applyAttachFragmentTopology } from './attachTopology'
import { maxValence, valenceUsed } from '../../valence'
import { resolveFragmentAtomAttachment } from './fragmentGuards'

/** 点原子连接片段：点 H 替换之；点不饱和重原子沿 VSEPR 方向生长 */
export function attachFragmentToAtom(
  mol: Molecule,
  frag: FragmentDef,
  targetAtomId: string,
  options: { torsionAngleDegrees?: number } = {},
): AttachResult {
  const fragmentAttachment = resolveFragmentAtomAttachment(frag)
  if (fragmentAttachment.ok === false) return { ok: false, reason: fragmentAttachment.reason }
  const requestedOrder = frag.attachOrder ?? 1
  const target = resolveAttachFragmentTarget(mol, targetAtomId, requestedOrder)
  if (target.ok === false) return { ok: false, reason: target.reason }
  const order = target.order

  const geometry = buildAttachFragmentGeometry({
    fragment: frag,
    host: target.host,
    direction: target.direction,
    order,
  })
  if (target.removeHIds.size > 0 && !removeHydrogensUntilValenceFits(mol, target.host, target.removeHIds, order)) {
    return { ok: false, reason: `${target.host.symbol} 没有足够 H 可让位` }
  }
  const plan = planAttachFragmentPlacement({
    molecule: mol,
    fragment: frag,
    attachOrigin: geometry.attachOrigin,
    alignedRotation: geometry.alignedRotation,
    anchor: geometry.anchor,
    axis: target.direction,
    skipIndex: fragmentAttachment.value.attachHydrogenIndex ?? -1,
    excludeAtomIds: new Set([target.host.id, ...target.removeHIds]),
    ...(order === 1 && options.torsionAngleDegrees !== undefined
      ? { torsionAngleDegrees: options.torsionAngleDegrees }
      : {}),
  })

  const molecule = applyAttachFragmentTopology({
    molecule: mol,
    fragment: frag,
    host: target.host,
    order,
    attachOrigin: geometry.attachOrigin,
    rotation: plan.rotation,
    anchor: geometry.anchor,
    removeAtomIds: target.removeHIds,
    ...(target.hostCoordinationSiteId !== undefined
      ? { hostCoordinationSiteId: target.hostCoordinationSiteId }
      : {}),
  })
  const overValent = molecule.atoms.find(atom => (
    valenceUsed(molecule, atom.id) > maxValence(atom) + 1e-6
  ))
  if (overValent) {
    return { ok: false, reason: `${overValent.symbol} 连接后超过允许价态` }
  }
  return { ok: true, molecule }
}
