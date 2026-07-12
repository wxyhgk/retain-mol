import type { Molecule } from '../../../molecule'
import { centerMolecule } from '../../../molecule'
import { editChanged, type EditCommandResult } from '../shared'
import type { MoleculeChangedCommandResult } from '../shared'

export function runSetMoleculeCommand(molecule: Molecule): MoleculeChangedCommandResult {
  return { ok: true, changed: true, molecule }
}

export function runClearMoleculeCommand(): MoleculeChangedCommandResult {
  return { ok: true, changed: true, molecule: { atoms: [], bonds: [], name: 'New Molecule' } }
}

export function runCenterMoleculeCommand(molecule: Molecule): EditCommandResult {
  return editChanged(centerMolecule(molecule))
}
