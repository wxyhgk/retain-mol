import type { Molecule } from '../../../molecule'
import { inferBonds } from '../../../molecule'
import { editChanged, type EditCommandResult } from '../shared'

export function runAutoInferBondsCommand(molecule: Molecule): EditCommandResult {
  return editChanged({ ...molecule, bonds: inferBonds(molecule.atoms) })
}
