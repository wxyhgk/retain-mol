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
