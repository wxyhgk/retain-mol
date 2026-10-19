import type { Molecule } from '../../../molecule'
import {
  editWithSelectionSets,
  type CommandSelectionState,
  type EditCommandWithSelectionResult,
} from '../shared'

export function runRemoveBondCommand(
  molecule: Molecule,
  bondId: string,
  selection: CommandSelectionState,
): EditCommandWithSelectionResult {
  const next: Molecule = {
    ...molecule,
    bonds: molecule.bonds.filter(bond => bond.id !== bondId),
  }
  const validAtomIds = new Set(next.atoms.map(atom => atom.id))
  const validBondIds = new Set(next.bonds.map(bond => bond.id))
  return editWithSelectionSets(
    next,
    [...selection.selectedAtomIds].filter(id => validAtomIds.has(id)),
    [...selection.selectedBondIds].filter(id => validBondIds.has(id)),
    selection,
    { moleculeChanged: next.bonds.length !== molecule.bonds.length },
  )
}
