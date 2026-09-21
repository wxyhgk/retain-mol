import type { FragmentTorsionPreview } from '../lib/presentation/types'
import type { BuilderIntent } from '../lib/builder/commands/interaction'
import type { Molecule } from '../lib/molecule'
import {
  canPrepareFragmentTorsion,
  createFragmentTorsionPreviewCommand,
  runAttachFragmentToAtomCommand,
} from '../lib/builder/commands/fragment'
import { runEditCommand, type EditCommandEffects } from './builderEditCommandEffects'

export function canStartFragmentTorsion(
  intent: BuilderIntent,
  molecule: Molecule,
  targetId: string,
): boolean {
  if (intent.kind !== 'build-fragment') return false
  return canPrepareFragmentTorsion(intent.fragment, molecule, targetId)
}

export function createFragmentTorsionPreview(
  intent: BuilderIntent,
  molecule: Molecule,
  targetId: string,
  angleDegrees: number,
): FragmentTorsionPreview | null {
  if (intent.kind !== 'build-fragment') return null
  return createFragmentTorsionPreviewCommand(intent.fragment, molecule, targetId, angleDegrees)
}

export function applyFragmentTorsion(
  intent: BuilderIntent,
  molecule: Molecule,
  targetId: string,
  angleDegrees: number,
  effects: EditCommandEffects,
): void {
  if (intent.kind !== 'build-fragment' || !intent.fragment) return
  runEditCommand(
    molecule,
    current => runAttachFragmentToAtomCommand(current, {
      atomId: targetId,
      fragment: intent.fragment!,
      torsionAngleDegrees: angleDegrees,
    }),
    effects,
  )
}
