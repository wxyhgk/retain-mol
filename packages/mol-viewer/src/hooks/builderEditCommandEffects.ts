import type { EditCommandResult } from '../lib/builder/commands/shared'
import type { Molecule } from '../lib/molecule'

export interface EditCommandEffects {
  readonly setMolecule: (
    molecule: Extract<
      EditCommandResult,
      { ok: true; changed: true }
    >['molecule'],
  ) => void
  readonly flashHint: (message: string) => void
  readonly executeResult?: (result: EditCommandResult) => EditCommandResult
}

export interface BuilderVector3 {
  readonly x: number
  readonly y: number
  readonly z: number
}

export function applyEditCommandResult(
  result: EditCommandResult,
  effects: EditCommandEffects,
): void {
  if (effects.executeResult) {
    effects.executeResult(result)
    return
  }
  if (result.ok === false) {
    effects.flashHint(result.reason)
    return
  }
  if (result.changed) effects.setMolecule(result.molecule)
  if (result.message) effects.flashHint(result.message)
}

export function runEditCommand(
  molecule: Molecule,
  command: (molecule: Molecule) => EditCommandResult,
  effects: EditCommandEffects,
): EditCommandResult {
  const result = command(molecule)
  applyEditCommandResult(result, effects)
  return result
}
