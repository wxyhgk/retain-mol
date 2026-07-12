import type { Molecule } from '../../../molecule'
import { cycleBondLength } from '../../editing/bondOps'
import { setBondAngle, setBondLength, setDihedralAngle } from '../../editing/geometryOps'
import type { GeomCommandResult } from '../shared'

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
