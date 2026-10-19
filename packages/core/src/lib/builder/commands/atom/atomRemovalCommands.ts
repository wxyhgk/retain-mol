import type { Molecule } from '../../../molecule'
import {
  editWithSelectionSets,
  type CommandSelectionState,
  type EditCommandWithSelectionResult,
} from '../shared'

export function runRemoveAtomCommand(
  molecule: Molecule,
  atomId: string,
  selection: CommandSelectionState,
): EditCommandWithSelectionResult {
  return runRemoveAtomsCommand(molecule, [atomId], selection)
}

export function runRemoveAtomsCommand(
  molecule: Molecule,
  atomIds: readonly string[],
  selection: CommandSelectionState,
): EditCommandWithSelectionResult {
  const removeAtomIds = new Set(atomIds)
  const removedBondIds = new Set(
    molecule.bonds
      .filter(bond => removeAtomIds.has(bond.atomId1) || removeAtomIds.has(bond.atomId2))
      .map(bond => bond.id),
  )
  const next: Molecule = {
    ...molecule,
    atoms: molecule.atoms.filter(atom => !removeAtomIds.has(atom.id)),
    bonds: molecule.bonds.filter(bond => !removedBondIds.has(bond.id)),
  }
  const validAtomIds = new Set(next.atoms.map(atom => atom.id))
  const validBondIds = new Set(next.bonds.map(bond => bond.id))
  return editWithSelectionSets(
    next,
    [...selection.selectedAtomIds].filter(id => validAtomIds.has(id)),
    [...selection.selectedBondIds].filter(id => validBondIds.has(id)),
    selection,
    { moleculeChanged: next.atoms.length !== molecule.atoms.length || next.bonds.length !== molecule.bonds.length },
  )
}
