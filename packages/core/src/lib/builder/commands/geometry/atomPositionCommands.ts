import type { Molecule } from '../../../molecule'
import { editMolecule, editUnchanged, type EditCommandResult } from '../shared'

export function runMoveAtomCommand(
  molecule: Molecule,
  atomId: string,
  x: number,
  y: number,
  z: number,
): EditCommandResult {
  const atom = molecule.atoms.find(candidate => candidate.id === atomId)
  if (!atom) return editUnchanged()
  if (atom.x === x && atom.y === y && atom.z === z) return editUnchanged()
  return editMolecule(molecule, {
    ...molecule,
    atoms: molecule.atoms.map(atom => atom.id === atomId ? { ...atom, x, y, z } : atom),
  })
}

export function runSetAtomPositionsCommand(
  molecule: Molecule,
  positions: ReadonlyMap<string, { readonly x: number; readonly y: number; readonly z: number }>,
): EditCommandResult {
  let changed = false
  const atoms = molecule.atoms.map(atom => {
    const position = positions.get(atom.id)
    if (!position) return atom
    if (atom.x !== position.x || atom.y !== position.y || atom.z !== position.z) changed = true
    return { ...atom, x: position.x, y: position.y, z: position.z }
  })
  return changed ? editMolecule(molecule, { ...molecule, atoms }) : editUnchanged()
}
