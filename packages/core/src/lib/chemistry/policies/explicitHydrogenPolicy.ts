import type { Molecule } from '../../molecule'
import { targetValence, valenceUsed } from '../valence'

function hydrogenNeighborIds(molecule: Molecule, atomId: string): string[] {
  const result: string[] = []
  for (const bond of molecule.bonds) {
    const neighborId = bond.atomId1 === atomId
      ? bond.atomId2
      : bond.atomId2 === atomId
        ? bond.atomId1
        : null
    if (
      neighborId !== null &&
      molecule.atoms.some(atom => atom.id === neighborId && atom.symbol === 'H')
    ) {
      result.push(neighborId)
    }
  }
  return result
}

/**
 * Remove only whole terminal hydrogens that exceed the atom's target valence.
 * Fractional aromatic bookkeeping below one valence unit does not remove H.
 */
export function removeExcessHydrogens(
  molecule: Molecule,
  atomId: string,
): Molecule {
  const atom = molecule.atoms.find(candidate => candidate.id === atomId)
  if (!atom) return molecule
  const excess = valenceUsed(molecule, atomId) - targetValence(atom)
  if (excess <= 0) return molecule
  const hydrogenIds = hydrogenNeighborIds(molecule, atomId)
    .slice(0, Math.floor(excess + 1e-6))
  if (hydrogenIds.length === 0) return molecule
  const remove = new Set(hydrogenIds)
  return {
    ...molecule,
    atoms: molecule.atoms.filter(candidate => !remove.has(candidate.id)),
    bonds: molecule.bonds.filter(
      bond => !remove.has(bond.atomId1) && !remove.has(bond.atomId2),
    ),
  }
}
/**
 * Strip explicit terminal hydrogens (autoAddHydrogens 的逆操作语义）：
 *  - 无 targetAtomIds：删所有孤立 H + 所有单配位 H（桥连 H 保留）
 *  - 有 targetAtomIds：只删挂在这些原子上的 H（孤立 H 只删自身被选中者）
 * 删 H 只会降低价态占用，无需价态门控；无事可删返回同一引用。
 */
export function removeTerminalHydrogens(
  molecule: Molecule,
  targetAtomIds?: readonly string[],
): Molecule {
  const targets = targetAtomIds ? new Set(targetAtomIds) : null
  const neighborsOf = (atomId: string): string[] => {
    const result: string[] = []
    for (const bond of molecule.bonds) {
      if (bond.atomId1 === atomId) result.push(bond.atomId2)
      else if (bond.atomId2 === atomId) result.push(bond.atomId1)
    }
    return result
  }
  const remove = new Set<string>()
  for (const atom of molecule.atoms) {
    if (atom.symbol !== 'H') continue
    const neighbors = neighborsOf(atom.id)
    if (neighbors.length === 0) {
      if (targets === null || targets.has(atom.id)) remove.add(atom.id)
    } else if (neighbors.length === 1) {
      const parent = neighbors[0] as string
      if (targets === null || targets.has(parent)) remove.add(atom.id)
    }
  }
  if (remove.size === 0) return molecule
  return {
    ...molecule,
    atoms: molecule.atoms.filter(candidate => !remove.has(candidate.id)),
    bonds: molecule.bonds.filter(
      bond => !remove.has(bond.atomId1) && !remove.has(bond.atomId2),
    ),
  }
}
