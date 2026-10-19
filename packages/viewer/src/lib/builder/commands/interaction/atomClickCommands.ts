import type { Molecule } from '@retainmol/core'
import type { FragmentDef } from '@retainmol/core/internal/lib/builder/fragmentLibrary'
import { editFailed, editUnchanged, type EditCommandResult } from '@retainmol/core/internal/lib/builder/commands/shared/index'
import { runAttachFragmentToAtomCommand } from '@retainmol/core/internal/lib/builder/commands/fragment/index'
import { resolveAtomClickDecision } from './atomClickDecision'
import {
  runAddOneHydrogenCommand,
  runGrowFromHydrogenCommand,
  runReplaceAtomCommand,
} from '@retainmol/core/internal/lib/builder/commands/atom/index'

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
