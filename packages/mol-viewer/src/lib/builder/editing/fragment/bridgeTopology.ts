import { newBond, type Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { add, applyQuat, sub } from '../../math'
import { maxValence, valenceUsed } from '../../valence'
import { instantiate } from './instantiate'
import type { AttachResult } from './types'
import type { BridgePlacement, BridgeTarget, FragmentBridgeSlots } from './bridgeTypes'

const EPSILON = 1e-8

export function applyBridgeFragmentTopology(input: {
  readonly molecule: Molecule
  readonly fragment: FragmentDef
  readonly slots: FragmentBridgeSlots
  readonly first: BridgeTarget
  readonly second: BridgeTarget
  readonly placement: BridgePlacement
}): AttachResult {
  const { molecule, fragment, slots, first, second, placement } = input
  const removeAtomIds = new Set([...first.removeAtomIds, ...second.removeAtomIds])
  const { atoms, bonds, idByIndex } = instantiate(
    fragment,
    point => add(applyQuat(sub(point, slots.center), placement.rotation), placement.center),
    new Set(slots.leavingHydrogenIndices),
  )
  const centerAtomId = idByIndex.get(slots.centerIndex)
  if (!centerAtomId) return { ok: false, reason: '模板连接中心未实例化' }

  const next: Molecule = {
    ...molecule,
    atoms: [...molecule.atoms.filter(atom => !removeAtomIds.has(atom.id)), ...atoms],
    bonds: [
      ...molecule.bonds.filter(bond => (
        !removeAtomIds.has(bond.atomId1) && !removeAtomIds.has(bond.atomId2)
      )),
      newBond(first.host.id, centerAtomId, first.order),
      newBond(second.host.id, centerAtomId, second.order),
      ...bonds,
    ],
  }
  const overValent = next.atoms.find(atom => valenceUsed(next, atom.id) > maxValence(atom) + EPSILON)
  return overValent
    ? { ok: false, reason: `${overValent.symbol} 连接后超过允许价态` }
    : { ok: true, molecule: next }
}
