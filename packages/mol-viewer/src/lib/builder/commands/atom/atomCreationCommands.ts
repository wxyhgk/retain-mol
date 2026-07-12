import type { Molecule } from '../../../molecule'
import { newAtom } from '../../../molecule'
import type { AddAtomCommandResult } from '../shared'

export function runAddAtomCommand(
  molecule: Molecule,
  symbol: string,
  x: number,
  y: number,
  z: number,
): AddAtomCommandResult {
  const atom = newAtom(symbol, x, y, z)
  return {
    ok: true,
    changed: true,
    molecule: { ...molecule, atoms: [...molecule.atoms, atom] },
    atomId: atom.id,
  }
}
