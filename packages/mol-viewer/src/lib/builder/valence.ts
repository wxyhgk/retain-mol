import { effectiveMaxBonds, getElementConfig } from '../../config/elements.config'
import type { Atom, Bond, Molecule } from '../molecule'
import { otherEnd } from './graph'

export function bondValence(bond: Bond): number {
  return bond.aromatic ? 1.5 : bond.order
}

export function valenceUsedByBonds(bonds: readonly Bond[], atomId: string): number {
  let used = 0
  for (const b of bonds) {
    if (b.atomId1 === atomId || b.atomId2 === atomId) used += bondValence(b)
  }
  return used
}

export function valenceUsed(mol: Molecule, atomId: string): number {
  const atom = mol.atoms.find(candidate => candidate.id === atomId)
  if (atom?.coordinationSites || atom?.coordinationNumber !== undefined) {
    return mol.bonds.filter(bond => bond.atomId1 === atomId || bond.atomId2 === atomId).length
  }
  return valenceUsedByBonds(mol.bonds, atomId)
}

export function heavyValenceUsed(mol: Molecule, atomId: string): number {
  const atomById = new Map(mol.atoms.map(a => [a.id, a]))
  let used = 0
  for (const b of mol.bonds) {
    const otherId = otherEnd(b, atomId)
    if (otherId === null) continue
    if (atomById.get(otherId)?.symbol === 'H') continue
    used += mol.atoms.find(atom => atom.id === atomId)?.coordinationSites ? 1 : bondValence(b)
  }
  return used
}

export function maxValence(atom: Atom): number {
  if (atom.coordinationSites) return atom.coordinationSites.length
  if (atom.coordinationNumber !== undefined) return atom.coordinationNumber
  return effectiveMaxBonds(atom.symbol, atom.charge ?? 0, atom.radical ?? 0)
}

export function targetValence(atom: Atom): number {
  if ((atom.charge ?? 0) !== 0 || (atom.radical ?? 0) !== 0) return maxValence(atom)
  return getElementConfig(atom.symbol).defaultValence ?? maxValence(atom)
}

export function targetValenceForSymbol(
  symbol: string,
  charge = 0,
  radical = 0,
): number {
  return targetValence({ id: '', symbol, x: 0, y: 0, z: 0, charge: charge || undefined, radical: radical || undefined })
}

export function availableValence(mol: Molecule, atom: Atom): number {
  return targetValence(atom) - valenceUsed(mol, atom.id)
}

export function availableMaxValenceByBonds(atom: Atom, bonds: readonly Bond[]): number {
  const used = atom.coordinationSites || atom.coordinationNumber !== undefined
    ? bonds.filter(bond => bond.atomId1 === atom.id || bond.atomId2 === atom.id).length
    : valenceUsedByBonds(bonds, atom.id)
  return maxValence(atom) - used
}
