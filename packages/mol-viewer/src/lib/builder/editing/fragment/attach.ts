import type { Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { removeHydrogensUntilValenceFits } from './valenceFit'
import type { AttachResult } from './types'
import { planAttachFragmentPlacement } from './attachPlacement'
import { resolveAttachFragmentTarget } from './attachTarget'
import { buildAttachFragmentGeometry } from './attachGeometry'
import { applyAttachFragmentTopology } from './attachTopology'

/** 点原子连接片段：点 H 替换之；点不饱和重原子沿 VSEPR 方向生长 */
export function attachFragmentToAtom(
  mol: Molecule,
  frag: FragmentDef,
  targetAtomId: string,
): AttachResult {
  const order = frag.attachOrder ?? 1
  const target = resolveAttachFragmentTarget(mol, targetAtomId, order)
  if (target.ok === false) return { ok: false, reason: target.reason }

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
    skipIndex: frag.attachHIndex,
    excludeAtomIds: new Set([target.host.id, ...target.removeHIds]),
  })

  return {
    ok: true,
    molecule: applyAttachFragmentTopology({
      molecule: mol,
      fragment: frag,
      host: target.host,
      order,
      attachOrigin: geometry.attachOrigin,
      rotation: plan.rotation,
      anchor: geometry.anchor,
      removeAtomIds: target.removeHIds,
    }),
  }
}
