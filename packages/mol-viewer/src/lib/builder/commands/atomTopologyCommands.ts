import type { Molecule } from '../../molecule'
import { autoAddHydrogens, addOneHydrogen, growByReplacingH, substituteAtomElement } from '../editing/atomOps'
import { maxValence, valenceUsed } from '../valence'
import { editChanged, editUnchanged, type EditCommandResult } from './commandResult'

export function runAddHydrogensCommand(
  molecule: Molecule,
  atomId?: string,
): EditCommandResult {
  const next = autoAddHydrogens(molecule, atomId)
  return next === molecule
    ? editUnchanged()
    : editChanged(next)
}

export function runAddOneHydrogenCommand(
  molecule: Molecule,
  atomId: string,
): EditCommandResult {
  const next = addOneHydrogen(molecule, atomId)
  return next === molecule
    ? editUnchanged()
    : editChanged(next)
}

export interface AddOneHydrogenAvailability {
  readonly ok: boolean
  readonly reason?: string
}

export interface AddOneHydrogensAvailability {
  readonly ok: boolean
  readonly allowedAtomIds: readonly string[]
  readonly reason?: string
}

export function getAddOneHydrogenAvailabilityCommand(
  molecule: Molecule,
  atomId: string,
): AddOneHydrogenAvailability {
  const atom = molecule.atoms.find(candidate => candidate.id === atomId)
  if (!atom) return { ok: false, reason: '原子不存在' }
  if (atom.symbol === 'H') return { ok: false, reason: 'H 不能继续加 H' }
  const max = maxValence(atom)
  if (max <= 0) return { ok: false, reason: '该元素不能成键' }
  if (valenceUsed(molecule, atomId) >= max) return { ok: false, reason: '已满键，无法加 H' }
  return { ok: true }
}

export function getAddOneHydrogensAvailabilityCommand(
  molecule: Molecule,
  atomIds: readonly string[],
): AddOneHydrogensAvailability {
  const allowedAtomIds = atomIds.filter(atomId =>
    getAddOneHydrogenAvailabilityCommand(molecule, atomId).ok,
  )
  if (allowedAtomIds.length > 0) return { ok: true, allowedAtomIds }
  if (atomIds.length === 0) return { ok: false, allowedAtomIds, reason: '没有选中原子' }
  if (atomIds.length === 1) {
    return {
      ...getAddOneHydrogenAvailabilityCommand(molecule, atomIds[0]),
      allowedAtomIds,
    }
  }
  return { ok: false, allowedAtomIds, reason: '选中原子都无法加 H' }
}

export function runAddOneHydrogensCommand(
  molecule: Molecule,
  atomIds: readonly string[],
): EditCommandResult {
  let next = molecule
  for (const atomId of atomIds) {
    next = addOneHydrogen(next, atomId)
  }
  return next === molecule
    ? editUnchanged()
    : editChanged(next)
}

export function runReplaceAtomCommand(
  molecule: Molecule,
  atomId: string,
  symbol: string,
): EditCommandResult {
  const next = substituteAtomElement(molecule, atomId, symbol)
  return next === molecule
    ? editUnchanged()
    : editChanged(next)
}

export function runReplaceAtomsCommand(
  molecule: Molecule,
  atomIds: readonly string[],
  symbol: string,
): EditCommandResult {
  let next = molecule
  for (const atomId of atomIds) {
    next = substituteAtomElement(next, atomId, symbol)
  }
  return next === molecule
    ? editUnchanged()
    : editChanged(next)
}

export function runGrowFromHydrogenCommand(
  molecule: Molecule,
  atomId: string,
  symbol: string,
): EditCommandResult {
  const next = growByReplacingH(molecule, atomId, symbol)
  return next === molecule
    ? editUnchanged()
    : editChanged(next)
}
