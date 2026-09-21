import type { Atom, Molecule } from '../../../molecule'
import { hNeighborsOf, otherEnd } from '../../../graph/queries'
import { bondValence, maxValence } from '../../valence'

export function valenceAfterRemovingHydrogens(
  mol: Molecule,
  hostId: string,
  removeHIds: ReadonlySet<string>,
  addedOrder: number,
): number {
  let used = addedOrder
  for (const b of mol.bonds) {
    if (b.atomId1 !== hostId && b.atomId2 !== hostId) continue
    const other = otherEnd(b, hostId)
    if (other !== null && removeHIds.has(other)) continue
    used += bondValence(b)
  }
  return used
}

export function removeHydrogensUntilValenceFits(
  mol: Molecule,
  host: Atom,
  removeHIds: Set<string>,
  addedOrder: number,
): boolean {
  const hs = hNeighborsOf(mol, host.id).filter(h => !removeHIds.has(h.id))
  while (valenceAfterRemovingHydrogens(mol, host.id, removeHIds, addedOrder) > maxValence(host) + 1e-6) {
    const h = hs.shift()
    if (!h) return false
    removeHIds.add(h.id)
  }
  return true
}
