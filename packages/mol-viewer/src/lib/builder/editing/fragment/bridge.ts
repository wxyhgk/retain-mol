import type { Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { chooseBridgePlacement, resolveFragmentBridgeSlots } from './bridgeGeometry'
import { resolveBridgeTarget } from './bridgeTarget'
import { applyBridgeFragmentTopology } from './bridgeTopology'
import type { BridgeFragmentOptions } from './bridgeTypes'
import type { AttachResult } from './types'

export type { BridgeFragmentOptions } from './bridgeTypes'

/**
 * Connect one rigid fragment center to two existing targets without moving either target host.
 * Passing H atom ids replaces those H atoms; unsaturated heavy atoms may be passed directly.
 */
export function bridgeFragmentBetweenAtoms(
  molecule: Molecule,
  fragment: FragmentDef,
  targetAtomId1: string,
  targetAtomId2: string,
  options: BridgeFragmentOptions = {},
): AttachResult {
  if (targetAtomId1 === targetAtomId2) return { ok: false, reason: '双锚点必须引用两个不同目标' }
  const slots = resolveFragmentBridgeSlots(fragment)
  if (typeof slots === 'string') return { ok: false, reason: slots }
  const centerAtom = fragment.atoms[slots.centerIndex]
  if (!centerAtom) return { ok: false, reason: '模板连接中心不存在' }

  const first = resolveBridgeTarget(molecule, targetAtomId1, centerAtom.symbol, slots.orders[0])
  if (typeof first === 'string') return { ok: false, reason: `第一个目标：${first}` }
  const second = resolveBridgeTarget(molecule, targetAtomId2, centerAtom.symbol, slots.orders[1])
  if (typeof second === 'string') return { ok: false, reason: `第二个目标：${second}` }
  if (first.host.id === second.host.id) return { ok: false, reason: '双锚点不能连接到同一个宿主原子' }

  const placement = chooseBridgePlacement(
    molecule,
    fragment,
    slots,
    first,
    second,
    options.orientationDegrees,
  )
  if (typeof placement === 'string') return { ok: false, reason: placement }
  return applyBridgeFragmentTopology({ molecule, fragment, slots, first, second, placement })
}
