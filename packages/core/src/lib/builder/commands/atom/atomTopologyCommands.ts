import type { Molecule } from '../../../molecule'
import { removeTerminalHydrogens } from '../../../chemistry/policies/explicitHydrogenPolicy'
import { autoAddHydrogens, addOneHydrogen, growByReplacingH, substituteAtomElement } from '../../editing/atomOps'
import {
  getHydrogenAdditionAvailability,
  validateElementSymbol,
} from '../../../chemistry/policies/atomPolicy'
import { editMolecule, editFailed, editUnchanged, type EditCommandResult } from '../shared'

export function runAddHydrogensCommand(
  molecule: Molecule,
  atomId?: string,
): EditCommandResult {
  const next = autoAddHydrogens(molecule, atomId)
  return next === molecule
    ? editUnchanged()
    : editMolecule(molecule, next)
}

export function runRemoveHydrogensCommand(
  molecule: Molecule,
  targetAtomIds?: readonly string[],
): EditCommandResult {
  const next = removeTerminalHydrogens(molecule, targetAtomIds)
  return next === molecule
    ? editUnchanged()
    : editMolecule(molecule, next)
}

export function runAddOneHydrogenCommand(
  molecule: Molecule,
  atomId: string,
): EditCommandResult {
  const availability = getHydrogenAdditionAvailability(molecule, atomId)
  if (availability.ok === false) return editFailed(availability.reason)
  const next = addOneHydrogen(molecule, atomId)
  return next === molecule
    ? editUnchanged()
    : editMolecule(molecule, next)
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
  return getHydrogenAdditionAvailability(molecule, atomId)
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
  const [onlyAtomId] = atomIds
  if (onlyAtomId) {
    return {
      ...getAddOneHydrogenAvailabilityCommand(molecule, onlyAtomId),
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
    if (getHydrogenAdditionAvailability(next, atomId).ok === false) continue
    next = addOneHydrogen(next, atomId)
  }
  return next === molecule
    ? editUnchanged()
    : editMolecule(molecule, next)
}

export function runReplaceAtomCommand(
  molecule: Molecule,
  atomId: string,
  symbol: string,
): EditCommandResult {
  const validation = validateElementSymbol(symbol)
  if (validation.ok === false) return editFailed(validation.reason)
  const next = substituteAtomElement(molecule, atomId, symbol)
  return next === molecule
    ? editUnchanged()
    : editMolecule(molecule, next)
}

export function runReplaceAtomsCommand(
  molecule: Molecule,
  atomIds: readonly string[],
  symbol: string,
): EditCommandResult {
  const validation = validateElementSymbol(symbol)
  if (validation.ok === false) return editFailed(validation.reason)
  let next = molecule
  for (const atomId of atomIds) {
    next = substituteAtomElement(next, atomId, symbol)
  }
  return next === molecule
    ? editUnchanged()
    : editMolecule(molecule, next)
}

export function runGrowFromHydrogenCommand(
  molecule: Molecule,
  atomId: string,
  symbol: string,
): EditCommandResult {
  const validation = validateElementSymbol(symbol)
  if (validation.ok === false) return editFailed(validation.reason)
  const next = growByReplacingH(molecule, atomId, symbol)
  return next === molecule
    ? editUnchanged()
    : editMolecule(molecule, next)
}
