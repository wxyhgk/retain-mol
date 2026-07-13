import type { Atom, Molecule } from '../../../molecule'
import { inferHybridization } from '../../analysis/hybridization'
import { bondsOf, otherEnd } from '../../graph'
import { findNextBondDir, getNeighborDirs } from '../../geometry/vsepr'
import { maxValence, valenceUsed } from '../../valence'
import { length, normalize, type Vec3 } from '../../math'

export type AttachTargetResult =
  | {
      readonly ok: true
      readonly host: Atom
      readonly direction: Vec3
      readonly removeHIds: Set<string>
      readonly order: 1 | 2 | 3
      readonly hostCoordinationSiteId?: string
    }
  | {
      readonly ok: false
      readonly reason: string
    }

export function resolveAttachFragmentTarget(
  molecule: Molecule,
  targetAtomId: string,
  attachOrder: 1 | 2 | 3,
): AttachTargetResult {
  const target = molecule.atoms.find(atom => atom.id === targetAtomId)
  if (!target) return { ok: false, reason: '原子不存在' }

  const removeHIds = new Set<string>()
  const hBond = target.symbol === 'H'
    ? bondsOf(molecule.bonds, targetAtomId)[0]
    : undefined

  if (target.symbol === 'H') {
    if (!hBond) return { ok: false, reason: 'H 原子没有有效的宿主键' }
    const hostId = otherEnd(hBond, targetAtomId)
    if (hostId === null) return { ok: false, reason: 'H 原子的宿主键无效' }
    const host = molecule.atoms.find(atom => atom.id === hostId)
    if (!host) return { ok: false, reason: '原子不存在' }
    removeHIds.add(targetAtomId)
    const rawDirection: Vec3 = [
      target.x - host.x,
      target.y - host.y,
      target.z - host.z,
    ]
    const direction = length(rawDirection) < 1e-9 ? [1, 0, 0] as Vec3 : normalize(rawDirection)
    const hostCoordinationSiteId = hBond.coordinationSites
      ?.find(assignment => assignment.atomId === host.id)?.siteId
    const siteOrder = hostCoordinationSiteId
      ? host.coordinationSites?.find(site => site.id === hostCoordinationSiteId)?.bondOrder
      : undefined
    return {
      ok: true,
      host,
      direction,
      removeHIds,
      order: siteOrder ?? attachOrder,
      ...(hostCoordinationSiteId !== undefined ? { hostCoordinationSiteId } : {}),
    }
  }

  if (valenceUsed(molecule, target.id) + attachOrder > maxValence(target) + 1e-6) {
    return { ok: false, reason: `${target.symbol} 已饱和 · 点击它的 H 可直接替换` }
  }
  const atomById = new Map(molecule.atoms.map(atom => [atom.id, atom]))
  const neighborDirs = getNeighborDirs(target, molecule.bonds, atomById)
  const directionTuple = findNextBondDir(
    target.symbol,
    neighborDirs,
    inferHybridization(molecule.bonds, target.id),
  )
  return {
    ok: true,
    host: target,
    direction: [directionTuple[0], directionTuple[1], directionTuple[2]],
    removeHIds,
    order: attachOrder,
  }
}
