import { getGrowPreviewAppearance } from '../styles/growPreviewAppearance'
import type { Molecule } from '../lib/molecule'
import type { GrowGuideSpec, GrowPreviewResult } from '../lib/presentation/types'
import {
  getGrowGuideGeometry,
  getGrowPreviewGeometry,
} from '../lib/builder/geometry/growPreview'
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
  const preview = getGrowPreviewGeometry(molecule, {
    sourceId: input.sourceId,
    cursorLocal: input.cursorLocal,
    activeElement: intent.activeElement,
    freeDirection: input.freeDirection,
  })
  return preview ? { pos: preview.pos, ...getGrowPreviewAppearance(preview.symbol) } : null
}

export function getGrowGuideForIntent(
  intent: BuilderIntent,
  molecule: Molecule,
  sourceId: string,
): GrowGuideSpec {
  if (!shouldShowGrowGuideForIntent(intent)) return null
  const guide = getGrowGuideGeometry(molecule, {
    sourceId,
    activeElement: intent.activeElement,
    ...(intent.sketchPlane !== undefined ? { sketchPlane: intent.sketchPlane } : {}),
  })
  if (!guide) return null
  const appearance = getGrowPreviewAppearance(intent.activeElement)
  return { ...guide, ghostRadius: appearance.radius, ghostColor: appearance.color }
}
