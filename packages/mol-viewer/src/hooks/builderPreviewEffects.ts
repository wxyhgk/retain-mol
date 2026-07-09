import type { Molecule } from '../lib/molecule'
import type { GrowGuideSpec } from '../lib/types'
import type { BuilderIntent } from '../lib/builder/commands/builderIntent'
import { shouldPlaceOnBackgroundDoubleClickForIntent } from '../lib/builder/commands/backgroundRoute'
import { PlacementCommandSession } from '../lib/builder/commands/fragmentCommands'
import {
  getGrowGuideCommand,
  getGrowPreviewCommand,
  type GrowPreviewResult,
} from '../lib/builder/commands/growPreviewCommands'
import {
  shouldShowGrowGuideForIntent,
  shouldShowGrowPreviewForIntent,
} from '../lib/builder/commands/gestureIntentGates'
import type { BuilderVector3 } from './builderEditCommandEffects'

export function getPlacementPreviewForIntent(
  intent: BuilderIntent,
  molecule: Molecule,
  position: BuilderVector3,
  viewDirection?: BuilderVector3,
): Molecule | null {
  if (!shouldPlaceOnBackgroundDoubleClickForIntent(intent)) return null
  const session = new PlacementCommandSession()
  const input = session.resolve({
    activeElement: intent.activeElement,
    activeFragmentId: intent.activeFragmentId,
    position,
    sketchPlane: intent.sketchPlane,
    viewDirection,
  })
  const result = session.preview(molecule, input)
  return result.ok ? result.preview : null
}

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
