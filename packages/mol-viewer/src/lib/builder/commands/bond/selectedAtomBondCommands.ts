import type { Molecule } from '../../../molecule'
import { runAddBondCommand, runBondViaHydrogenCommand } from './bondTopologyCommands'
import { resolveBondSelectedAtomsDecision } from './selectedAtomBondDecision'

export interface BondSelectedAtomsCommandInput {
  readonly atomIds: readonly string[]
}

export type BondSelectedAtomsCommandResult =
  | {
      readonly ok: true
      readonly changed: true
      readonly molecule: Molecule
      readonly atomIdsToDeselect: readonly string[]
    }
  | {
      readonly ok: true
      readonly changed: false
      readonly message?: string
      readonly atomIdsToDeselect: readonly string[]
    }
  | { readonly ok: false; readonly reason: string }

export function runBondSelectedAtomsCommand(
  molecule: Molecule,
  input: BondSelectedAtomsCommandInput,
): BondSelectedAtomsCommandResult {
  const decision = resolveBondSelectedAtomsDecision(molecule, input)
  if (decision.kind === 'error') return { ok: false, reason: decision.reason }
  const result = decision.kind === 'bondViaHydrogen'
    ? runBondViaHydrogenCommand(molecule, decision.sourceHId, decision.targetId)
    : runAddBondCommand(molecule, {
        atomId1: decision.atomId1,
        atomId2: decision.atomId2,
      })
  if (result.ok === false) {
    return {
      ok: false,
      reason: result.reason === '两原子之间已存在键' ? '已经存在键' : result.reason,
    }
  }
  return {
    ...result,
    atomIdsToDeselect: decision.kind === 'bondViaHydrogen' ? input.atomIds : [],
  }
}
