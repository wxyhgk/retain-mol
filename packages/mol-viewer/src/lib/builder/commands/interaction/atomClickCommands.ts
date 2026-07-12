import type { Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { editFailed, editUnchanged, type EditCommandResult } from '../shared'
import { runAttachFragmentToAtomCommand } from '../fragment'
import { resolveAtomClickDecision } from './atomClickDecision'
import {
  runAddOneHydrogenCommand,
  runGrowFromHydrogenCommand,
  runReplaceAtomCommand,
} from '../atom'

export interface AtomClickCommandInput {
  readonly atomId: string
  readonly activeElement: string
  readonly atomClickMode: 'grow' | 'replace'
  readonly fragment?: FragmentDef
}

export function runAtomClickCommand(
  molecule: Molecule,
  input: AtomClickCommandInput,
): EditCommandResult {
  const decision = resolveAtomClickDecision(molecule, input)
  switch (decision.kind) {
    case 'error':
      return editFailed(decision.reason)
    case 'noop':
      return editUnchanged(decision.message)
    case 'attach':
      return runAttachFragmentToAtomCommand(molecule, {
        atomId: decision.atomId,
        fragment: decision.fragment,
      })
    case 'replace':
      return runReplaceAtomCommand(molecule, decision.atomId, decision.element)
    case 'addHydrogen':
      return runAddOneHydrogenCommand(molecule, decision.atomId)
    case 'growFromHydrogen':
      return runGrowFromHydrogenCommand(molecule, decision.atomId, decision.element)
  }
}
