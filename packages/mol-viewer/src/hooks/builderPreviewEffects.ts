import type { Molecule } from '../lib/molecule'
import type { GrowGuideSpec } from '../lib/types'
import {
  getGrowGuideCommand,
  getGrowPreviewCommand,
  type GrowPreviewResult,
} from '../lib/builder/commands/atom'
import {
  shouldShowGrowGuideForIntent,
  shouldShowGrowPreviewForIntent,
  type BuilderIntent,
} from '../lib/builder/commands/interaction'
import type { BuilderVector3 } from './builderEditCommandEffects'

export function getGrowPreviewForIntent(
  intent: BuilderIntent,
  molecule: Molecule,
  input: {
    readonly sourceId: string
    readonly cursorLocal: BuilderVector3
    readonly freeDirection: boolean
  },
): GrowPreviewResult | null {
  if (!shouldShowGrowPreviewForIntent(intent)) return null
  return getGrowPreviewCommand(molecule, {
    sourceId: input.sourceId,
    cursorLocal: input.cursorLocal,
    activeElement: intent.activeElement,
    freeDirection: input.freeDirection,
  })
}

export function getGrowGuideForIntent(
  intent: BuilderIntent,
  molecule: Molecule,
  sourceId: string,
): GrowGuideSpec {
  if (!shouldShowGrowGuideForIntent(intent)) return null
  return getGrowGuideCommand(molecule, {
    sourceId,
    activeElement: intent.activeElement,
    sketchPlane: intent.sketchPlane,
  })
}
