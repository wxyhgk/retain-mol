import type { Molecule } from '../../../molecule'
import {
  editWithSelectionSets,
  type CommandSelectionState,
  type EditCommandWithSelectionResult,
} from '../shared'

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
    selection,
    { moleculeChanged: next.atoms.length !== molecule.atoms.length || next.bonds.length !== molecule.bonds.length },
  )
}
