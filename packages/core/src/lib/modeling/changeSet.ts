import type { Atom, Bond, Molecule } from '../molecule'
import type { ModelingChangeSet } from './contracts'

function changedIds<T extends { readonly id: string }>(
  beforeItems: readonly T[],
  afterItems: readonly T[],
): { added: string[]; removed: string[]; updated: string[] } {
  const before = new Map(beforeItems.map(item => [item.id, item]))
  const after = new Map(afterItems.map(item => [item.id, item]))
  const added = [...after.keys()].filter(id => !before.has(id))
  const removed = [...before.keys()].filter(id => !after.has(id))
  const updated = [...after.entries()]
    .filter(([id, item]) => before.has(id) && JSON.stringify(before.get(id)) !== JSON.stringify(item))
    .map(([id]) => id)
  return { added, removed, updated }
}

export function createModelingChangeSet(before: Molecule, after: Molecule): ModelingChangeSet {
  const atoms = changedIds<Atom>(before.atoms, after.atoms)
  const bonds = changedIds<Bond>(before.bonds, after.bonds)
  return {
    addedAtomIds: atoms.added,
    removedAtomIds: atoms.removed,
    updatedAtomIds: atoms.updated,
    addedBondIds: bonds.added,
    removedBondIds: bonds.removed,
    updatedBondIds: bonds.updated,
  }
}

