import type { Bond, Molecule } from '../../../model/types'
import { genId } from '../../../model/identity'
import { inferBonds } from '../../../molecule'
import { editMolecule, type EditCommandResult } from '../shared'

function endpointKey(bond: Bond): string {
  return JSON.stringify([bond.atomId1, bond.atomId2].sort())
}

/** Re-infer connectivity/order while retaining the identity of surviving endpoint pairs. */
export function runAutoInferBondsCommand(molecule: Molecule): EditCommandResult {
  const inferred = new Map(inferBonds(molecule.atoms).map(bond => [endpointKey(bond), bond]))
  const bonds: Bond[] = []
  for (const previous of molecule.bonds) {
    const key = endpointKey(previous)
    const candidate = inferred.get(key)
    if (!candidate) continue
    inferred.delete(key)
    if (previous.order === candidate.order) {
      bonds.push(previous)
    } else {
      // Bond-order changes invalidate the previous order-dependent annotations.
      const { wedge: _wedge, ez: _ez, aromatic: _aromatic, ...retained } = previous
      bonds.push({ ...retained, order: candidate.order })
    }
  }
  const reserved = new Set(molecule.bonds.map(bond => bond.id))
  for (const candidate of inferred.values()) {
    let id = candidate.id
    while (reserved.has(id)) id = genId()
    reserved.add(id)
    bonds.push(id === candidate.id ? candidate : { ...candidate, id })
  }
  return editMolecule(molecule, { ...molecule, bonds })
}
