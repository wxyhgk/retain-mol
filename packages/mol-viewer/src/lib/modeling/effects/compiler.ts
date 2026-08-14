import type { Molecule } from '../../molecule'
import type { EditPlan, ModelingCommand, ModelingCommandKind } from '../contracts'
import {
  computeCanonicalSnapshotDigest,
  createCanonicalEffectChanges,
  createCanonicalMoleculeSnapshot,
} from './canonical'
import {
  EXPECTED_EFFECT_SCHEMA_VERSION,
  type ExpectedEffectCompileResult,
  type ExpectedEffectSupportedCommand,
  type ModelingCommandEffectReceipt,
} from './contracts'
import {
  applyExpectedEffectCommand,
  isExpectedEffectCommandSupported,
} from './semantics'

function uniqueKinds(kinds: readonly ModelingCommandKind[]): ModelingCommandKind[] {
  return kinds.filter((kind, index) => kinds.indexOf(kind) === index)
}

function isSupportedCommand(command: ModelingCommand): command is ExpectedEffectSupportedCommand {
  return isExpectedEffectCommandSupported(command.kind)
}

/** Compile a plan without invoking production builder commands. */
export function compileExpectedEffect(
  molecule: Molecule,
  plan: Pick<EditPlan, 'planId' | 'commands'>,
): ExpectedEffectCompileResult {
  const unsupportedCommandKinds = uniqueKinds(
    plan.commands
      .filter(command => !isExpectedEffectCommandSupported(command.kind))
      .map(command => command.kind),
  )
  if (unsupportedCommandKinds.length > 0) {
    const commandIndex = plan.commands.findIndex(command =>
      unsupportedCommandKinds.includes(command.kind))
    const command = plan.commands[commandIndex]
    return {
      status: 'indeterminate',
      reason: 'unsupported-effect-semantics',
      message: `ExpectedEffect V1 does not define semantics for: ${unsupportedCommandKinds.join(', ')}`,
      commandIndex,
      ...(command ? { commandId: command.commandId, commandKind: command.kind } : {}),
      unsupportedCommandKinds,
    }
  }

  const baseSnapshot = createCanonicalMoleculeSnapshot(molecule)
  const commands: ModelingCommandEffectReceipt[] = []
  let current = molecule

  for (let commandIndex = 0; commandIndex < plan.commands.length; commandIndex += 1) {
    const command = plan.commands[commandIndex]!
    if (!isSupportedCommand(command)) {
      return {
        status: 'indeterminate',
        reason: 'unsupported-effect-semantics',
        message: `ExpectedEffect V1 does not define semantics for: ${command.kind}`,
        commandIndex,
        commandId: command.commandId,
        commandKind: command.kind,
        unsupportedCommandKinds: [command.kind],
      }
    }
    const before = createCanonicalMoleculeSnapshot(current)
    const result = applyExpectedEffectCommand(current, command)
    if (result.ok === false) {
      return {
        status: 'indeterminate',
        reason: result.indeterminateReason,
        message: result.reason,
        commandIndex,
        commandId: command.commandId,
        commandKind: command.kind,
      }
    }
    const after = createCanonicalMoleculeSnapshot(result.molecule)
    commands.push({
      commandId: command.commandId,
      kind: command.kind,
      preDigest: computeCanonicalSnapshotDigest(before),
      postDigest: computeCanonicalSnapshotDigest(after),
      changes: createCanonicalEffectChanges(before, after),
    })
    current = result.molecule
  }

  const finalSnapshot = createCanonicalMoleculeSnapshot(current)
  return {
    status: 'compiled',
    schemaVersion: EXPECTED_EFFECT_SCHEMA_VERSION,
    planId: plan.planId,
    baseDigest: computeCanonicalSnapshotDigest(baseSnapshot),
    finalDigest: computeCanonicalSnapshotDigest(finalSnapshot),
    commands,
    baseSnapshot,
    finalSnapshot,
  }
}
