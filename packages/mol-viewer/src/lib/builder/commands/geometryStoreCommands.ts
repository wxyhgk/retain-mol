import type { Molecule } from '../../molecule'
import { resaturateAtom } from '../editing/atomOps'
import { cycleBondLength } from '../editing/bondOps'
import { setBondAngle, setBondLength, setDihedralAngle } from '../editing/geometryOps'
import type { EditCommandResult } from './commandResult'
import type { GeomCommandResult } from './storeCommandTypes'

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

export function runCycleBondLengthCommand(
  molecule: Molecule,
  bondId: string,
): GeomCommandResult & { readonly moved?: boolean } {
  const result = cycleBondLength(molecule, bondId)
  if (result.ok === false) return { ok: false, reason: result.reason }
  return { ok: true, changed: true, molecule: result.molecule, moved: result.moved }
}

export function runSetBondLengthCommand(
  molecule: Molecule,
  aId: string,
  bId: string,
  length: number,
): GeomCommandResult {
  const result = setBondLength(molecule, aId, bId, length)
  if (result.ok === false) return { ok: false, reason: result.reason }
  return { ok: true, changed: true, molecule: result.molecule }
}

export function runSetBondAngleCommand(
  molecule: Molecule,
  aId: string,
  bId: string,
  cId: string,
  deg: number,
): GeomCommandResult {
  const result = setBondAngle(molecule, aId, bId, cId, deg)
  if (result.ok === false) return { ok: false, reason: result.reason }
  return { ok: true, changed: true, molecule: result.molecule }
}

export function runSetDihedralAngleCommand(
  molecule: Molecule,
  aId: string,
  bId: string,
  cId: string,
  dId: string,
  deg: number,
): GeomCommandResult {
  const result = setDihedralAngle(molecule, aId, bId, cId, dId, deg)
  if (result.ok === false) return { ok: false, reason: result.reason }
  return { ok: true, changed: true, molecule: result.molecule }
}
