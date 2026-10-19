import type { Molecule } from '@retainmol/core'
import type { FragmentDef } from '@retainmol/core/internal/lib/builder/fragmentLibrary'
import { editFailed, editFromMoleculeResult, editUnchanged, type EditCommandResult } from '@retainmol/core/internal/lib/builder/commands/shared/index'
import { resolveBondClickDecision } from './bondClickDecision'
import { runFuseFragmentOnBondCommand } from '@retainmol/core/internal/lib/builder/commands/fragment/index'
import { runCycleBondLengthCommand } from '@retainmol/core/internal/lib/builder/commands/geometry/index'

export interface BondClickCommandInput {
  readonly bondId: string
  readonly fragment?: FragmentDef
  readonly cycleLength?: boolean
}

export function runBondClickCommand(
  molecule: Molecule,
  input: BondClickCommandInput,
): EditCommandResult {
  const decision = resolveBondClickDecision(input)
  switch (decision.kind) {
    case 'fuse':
      return runFuseFragmentOnBondCommand(molecule, {
        bondId: decision.bondId,
        fragment: decision.fragment,
      })
    case 'cycleLength': {
      const result = runCycleBondLengthCommand(molecule, decision.bondId)
      if (result.ok === false) return editFailed(result.reason)
      return editFromMoleculeResult(
        result,
        result.changed && result.moved === false ? '环内键：仅切换键级，几何不变' : undefined,
      )
    }
    case 'noop':
      return editUnchanged()
  }
}
