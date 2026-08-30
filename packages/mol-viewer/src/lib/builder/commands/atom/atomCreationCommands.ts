import type { Molecule } from '../../../molecule'
import { newAtom } from '../../../molecule'
import { validateAtomCreationInput } from '../../../chemistry/policies/atomPolicy'
import type { AddAtomCommandResult } from '../shared'

export function runAddAtomCommand(
  molecule: Molecule,
  symbol: string,
  x: number,
  y: number,
  z: number,
): AddAtomCommandResult {
  const validation = validateAtomCreationInput(symbol, x, y, z)
  if (validation.ok === false) return validation
  const atom = newAtom(symbol, x, y, z)
  return {
    ok: true,
    changed: true,
    molecule: { ...molecule, atoms: [...molecule.atoms, atom] },
    atomId: atom.id,
  }
}
