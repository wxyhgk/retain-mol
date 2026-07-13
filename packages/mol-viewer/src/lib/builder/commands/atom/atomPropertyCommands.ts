import type { Molecule } from '../../../molecule'
import { resaturateAtom } from '../../editing/atomOps'
import type { EditCommandResult } from '../shared'

function withOptionalNumberProperty<
  T extends object,
  K extends 'charge' | 'radical',
>(value: T, key: K, next: number): T & Partial<Record<K, number>> {
  if (next !== 0) return { ...value, [key]: next }
  const copy = { ...value } as T & Partial<Record<K, number>>
  delete copy[key]
  return copy
}

export function runSetAtomChargeCommand(
  molecule: Molecule,
  atomId: string,
  charge: number,
): EditCommandResult {
  if (!molecule.atoms.some(atom => atom.id === atomId)) return { ok: true, changed: false }
  const withCharge: Molecule = {
    ...molecule,
    atoms: molecule.atoms.map(atom =>
      atom.id === atomId ? withOptionalNumberProperty(atom, 'charge', charge) : atom),
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
      atom.id === atomId ? withOptionalNumberProperty(atom, 'radical', radical) : atom),
  }
  return { ok: true, changed: true, molecule: resaturateAtom(withRadical, atomId) }
}
