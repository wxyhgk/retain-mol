import type { Molecule } from '../../../molecule'
import { clearChirality, flipChirality, flipChiralityAvailability, resaturateAtom, setChirality, type FlipChiralityAvailability } from '../../editing/atomOps'
import { editChanged, editFailed, editUnchanged, type EditCommandResult } from '../shared'

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
  if (!Number.isInteger(charge)) return editFailed('形式电荷必须是整数')
  const target = molecule.atoms.find(atom => atom.id === atomId)
  if (!target || (target.charge ?? 0) === charge) return editUnchanged()
  const withCharge: Molecule = {
    ...molecule,
    atoms: molecule.atoms.map(atom =>
      atom.id === atomId ? withOptionalNumberProperty(atom, 'charge', charge) : atom),
  }
  return editChanged(resaturateAtom(withCharge, atomId))
}

export function runSetAtomRadicalCommand(
  molecule: Molecule,
  atomId: string,
  radical: number,
): EditCommandResult {
  if (!Number.isInteger(radical) || radical < 0) return editFailed('自由基电子数必须是非负整数')
  const target = molecule.atoms.find(atom => atom.id === atomId)
  if (!target || (target.radical ?? 0) === radical) return editUnchanged()
  const withRadical: Molecule = {
    ...molecule,
    atoms: molecule.atoms.map(atom =>
      atom.id === atomId ? withOptionalNumberProperty(atom, 'radical', radical) : atom),
  }
  return editChanged(resaturateAtom(withRadical, atomId))
}

export function runFlipChiralityCommand(molecule: Molecule, atomId: string): EditCommandResult {
  const availability = flipChiralityAvailability(molecule, atomId)
  if (availability.ok === false) return editFailed(availability.reason)
  const next = flipChirality(molecule, atomId)
  return next === molecule ? editUnchanged() : editChanged(next)
}

export function getFlipChiralityAvailabilityCommand(
  molecule: Molecule,
  atomId: string,
): FlipChiralityAvailability {
  return flipChiralityAvailability(molecule, atomId)
}

export function runSetChiralityCommand(
  molecule: Molecule,
  atomId: string,
  chirality: 'R' | 'S' | 'none',
): EditCommandResult {
  if (chirality !== 'R' && chirality !== 'S' && chirality !== 'none') {
    return editFailed('无效手性标记')
  }
  const center = molecule.atoms.find(atom => atom.id === atomId)
  if (!center) return editFailed('原子不存在')
  if (chirality === 'none') {
    const next = clearChirality(molecule, atomId)
    return next === molecule ? editUnchanged() : editChanged(next)
  }
  const availability = flipChiralityAvailability(molecule, atomId)
  if (availability.ok === false) return editFailed(availability.reason)
  const next = setChirality(molecule, atomId, chirality)
  return next === molecule ? editUnchanged() : editChanged(next)
}

export function runSetAtomChargesCommand(
  molecule: Molecule,
  atomIds: readonly string[],
  charge: number,
): EditCommandResult {
  if (!Number.isInteger(charge)) return editFailed('形式电荷必须是整数')
  let next = molecule
  for (const atomId of atomIds) {
    const target = next.atoms.find(atom => atom.id === atomId)
    if (!target || (target.charge ?? 0) === charge) continue
    const withCharge: Molecule = {
      ...next,
      atoms: next.atoms.map(atom =>
        atom.id === atomId ? withOptionalNumberProperty(atom, 'charge', charge) : atom),
    }
    next = resaturateAtom(withCharge, atomId)
  }
  return next === molecule
    ? editUnchanged()
    : editChanged(next)
}
