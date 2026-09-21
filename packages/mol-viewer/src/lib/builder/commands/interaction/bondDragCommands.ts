import type { Molecule } from '../../../molecule'
import { resolveBondDragEndDecision } from './bondDragDecision'
import { editMolecule, editFailed, editUnchanged, type EditCommandResult } from '../shared'
import {
  runAddAtomCommand,
  runGrowFromHydrogenCommand,
  runAddHydrogensCommand,
} from '../atom'
import { runAddBondCommand, runBondViaHydrogenCommand } from '../bond'

export interface BondDragEndCommandInput {
  readonly sourceId: string
  readonly targetId: string | null
  readonly dropLocal: { readonly x: number; readonly y: number; readonly z: number } | null
  readonly activeElement: string
}

export function runBondDragEndCommand(
  molecule: Molecule,
  input: BondDragEndCommandInput,
): EditCommandResult {
  const decision = resolveBondDragEndDecision(molecule, input)
  switch (decision.kind) {
    case 'error':
      return editFailed(decision.reason)
    case 'noop':
      return editUnchanged()
    case 'addBond':
      return runAddBondCommand(molecule, { atomId1: decision.atomId1, atomId2: decision.atomId2 })
    case 'bondViaHydrogen':
      return runBondViaHydrogenCommand(molecule, decision.sourceHId, decision.targetId)
    case 'growFromHydrogen':
      return runGrowFromHydrogenCommand(molecule, decision.atomId, decision.element)
    case 'growToEmpty':
      return runGrowToEmptyCommand(molecule, decision)
  }
}

function runGrowToEmptyCommand(
  molecule: Molecule,
  input: {
    readonly sourceId: string
    readonly element: string
    readonly position: { readonly x: number; readonly y: number; readonly z: number }
  },
): EditCommandResult {
  const addAtomResult = runAddAtomCommand(
    molecule,
    input.element,
    input.position.x,
    input.position.y,
    input.position.z,
  )
  if (addAtomResult.ok === false) return editFailed(addAtomResult.reason)
  const addBondResult = runAddBondCommand(addAtomResult.molecule, {
    atomId1: input.sourceId,
    atomId2: addAtomResult.atomId,
  })
  if (addBondResult.ok === false) return editFailed(addBondResult.reason)
  if (!addBondResult.changed) return editUnchanged()
  const withNewAtom = addBondResult.molecule
  if (input.element === 'H') return editMolecule(molecule, withNewAtom)
  const result = runAddHydrogensCommand(withNewAtom, addAtomResult.atomId)
  return result.ok && result.changed ? result : editMolecule(molecule, withNewAtom)
}
