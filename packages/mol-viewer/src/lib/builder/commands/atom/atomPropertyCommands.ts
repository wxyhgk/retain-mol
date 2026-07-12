import type { Molecule } from '../../../molecule'
import { resaturateAtom } from '../../editing/atomOps'
import type { EditCommandResult } from '../shared'

export function runSetAtomChargeCommand(
  molecule: Molecule,
  atomId: string,
  charge: number,
): EditCommandResult {
  if (!molecule.atoms.some(atom => atom.id === atomId)) return { ok: true, changed: false }
  const withCharge: Molecule = {
    ...molecule,
    atoms: molecule.atoms.map(atom =>
      atom.id === atomId ? { ...atom, charge: charge || undefined } : atom),
  }
  return { ok: true, changed: true, molecule: resaturateAtom(withCharge, atomId) }
}

export function runSetAtomRadicalCommand(
  molecule: Molecule,
  atomId: string,
  radical: number,
): EditCommandResult {
  if (!molecule.atoms.some(atom => atom.id === atomId)) return { ok: true, changed: false }
  const withRadical: Molecule = {
    ...molecule,
    atoms: molecule.atoms.map(atom =>
      atom.id === atomId ? { ...atom, radical: radical || undefined } : atom),
  }
  return { ok: true, changed: true, molecule: resaturateAtom(withRadical, atomId) }
}
