import type { BuilderIntent } from './builderIntent'

export function shouldAttemptBondDragStartForIntent(
  intent: BuilderIntent,
  input: {
    readonly sourceSelected: boolean
  },
): boolean {
  return intent.canBuild &&
    !intent.fragment &&
    !input.sourceSelected
}

export function shouldRunEditCommandForIntent(intent: BuilderIntent): boolean {
  return intent.canEdit
}

export function shouldSelectFragmentOnAtomDoubleClickForIntent(intent: BuilderIntent): boolean {
  return intent.canEdit
}

export function shouldShowGrowPreviewForIntent(intent: BuilderIntent): boolean {
  return intent.canEdit
}

export function shouldShowGrowGuideForIntent(intent: BuilderIntent): boolean {
  return intent.canEdit
}
