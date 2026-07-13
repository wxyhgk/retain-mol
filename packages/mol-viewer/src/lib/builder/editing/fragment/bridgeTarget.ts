import { lookupBondLengthByOrder } from '../../../../config/geometry.config'
import type { Molecule } from '../../../molecule'
import { calcBondLength } from '../../geometry/vsepr'
import { resolveAttachFragmentTarget } from './attachTarget'
import type { BridgeTarget } from './bridgeTypes'

export function resolveBridgeTarget(
  molecule: Molecule,
  targetAtomId: string,
  fragmentCenterSymbol: string,
  order: 1 | 2 | 3,
): BridgeTarget | string {
  const requested = molecule.atoms.find(atom => atom.id === targetAtomId)
  if (!requested) return '原子不存在'
  if (requested.symbol === 'H') {
    const parentBonds = molecule.bonds.filter(bond => (
      bond.atomId1 === requested.id || bond.atomId2 === requested.id
    ))
    if (parentBonds.length !== 1) return '离去 H 必须恰好连接一个宿主原子'
  }

  const result = resolveAttachFragmentTarget(molecule, targetAtomId, order)
  if (result.ok === false) return result.reason
  if (result.host.symbol === 'H') return '离去 H 的宿主必须是重原子'
  const bondLength = lookupBondLengthByOrder(result.host.symbol, fragmentCenterSymbol, result.order)
    ?? calcBondLength(result.host.symbol, fragmentCenterSymbol)
  return {
    host: result.host,
    preferredDirection: result.direction,
    removeAtomIds: result.removeHIds,
    bondLength,
    order: result.order,
  }
}
