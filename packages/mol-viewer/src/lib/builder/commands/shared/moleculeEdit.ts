import type { Molecule } from '../../../model/types'
import { moleculesEqual } from '../../../model/equality'
import { reconcileAtomChirality } from '../../../stereo/perception'
import { editChanged, editUnchanged, type EditCommandResult } from './commandResult'

/** Finalize a real edit; a no-op must not repair annotations or produce history. */
export function editMolecule(previous: Molecule, candidate: Molecule, message?: string): EditCommandResult {
  if (moleculesEqual(previous, candidate)) return editUnchanged(message)
  const molecule = reconcileAtomChirality(candidate)
  return moleculesEqual(previous, molecule) ? editUnchanged(message) : editChanged(molecule, message)
}
