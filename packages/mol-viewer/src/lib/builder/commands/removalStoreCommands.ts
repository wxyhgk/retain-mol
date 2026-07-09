import type { Molecule } from '../../molecule'
import {
  editWithSelectionSets,
  type CommandSelectionState,
  type EditCommandWithSelectionResult,
} from './storeCommandTypes'

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
  return editWithSelectionSets(
    next,
    [...selection.selectedAtomIds].filter(id => !removeAtomIds.has(id)),
    [...selection.selectedBondIds].filter(id => !removedBondIds.has(id)),
    { changed: next.atoms.length !== molecule.atoms.length || next.bonds.length !== molecule.bonds.length },
  )
}

export function runRemoveBondCommand(
  molecule: Molecule,
  bondId: string,
  selection: CommandSelectionState,
): EditCommandWithSelectionResult {
  const next: Molecule = {
    ...molecule,
    bonds: molecule.bonds.filter(bond => bond.id !== bondId),
  }
  return editWithSelectionSets(
    next,
    selection.selectedAtomIds,
    [...selection.selectedBondIds].filter(id => id !== bondId),
    { changed: next.bonds.length !== molecule.bonds.length },
  )
}

export function runRemoveSelectedCommand(
  molecule: Molecule,
  selection: CommandSelectionState,
): EditCommandWithSelectionResult {
  const removeAtomIds = new Set(selection.selectedAtomIds)
  const removeBondIds = new Set(selection.selectedBondIds)
  const next: Molecule = {
    ...molecule,
    atoms: molecule.atoms.filter(atom => !removeAtomIds.has(atom.id)),
    bonds: molecule.bonds.filter(bond =>
      !removeBondIds.has(bond.id) &&
      !removeAtomIds.has(bond.atomId1) &&
      !removeAtomIds.has(bond.atomId2)
    ),
  }
  return editWithSelectionSets(
    next,
    [],
    [],
    { changed: next.atoms.length !== molecule.atoms.length || next.bonds.length !== molecule.bonds.length },
  )
}
