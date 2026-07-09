import type { Molecule } from '../lib/molecule'
import type { BackgroundClickRoute } from '../lib/builder/commands/backgroundRoute'
import type { BuilderIntent } from '../lib/builder/commands/builderIntent'
import {
  routeBackgroundClickForIntent,
  shouldPlaceOnBackgroundDoubleClickForIntent,
} from '../lib/builder/commands/backgroundRoute'
import { PlacementCommandSession } from '../lib/builder/commands/fragmentCommands'
import {
  runEditCommand,
  type BuilderVector3,
  type EditCommandEffects,
} from './builderEditCommandEffects'

export interface BackgroundClickRouteEffects {
  readonly commitPendingMeasure: () => void
  readonly clearSelection: () => void
}

export function applyBackgroundClickRoute(
  route: BackgroundClickRoute,
  effects: BackgroundClickRouteEffects,
): void {
  switch (route.kind) {
    case 'commitMeasure':
      effects.commitPendingMeasure()
      break
    case 'clearSelection':
      effects.clearSelection()
      break
    case 'noop':
      break
  }
}

export interface BackgroundClickIntentInput {
  readonly shiftKey: boolean
  readonly altKey: boolean
}

export function applyBackgroundClickForIntent(
  intent: BuilderIntent,
  input: BackgroundClickIntentInput,
  effects: BackgroundClickRouteEffects,
): void {
  applyBackgroundClickRoute(
    routeBackgroundClickForIntent(intent, input),
    effects,
  )
}

export function applyBackgroundDoubleClickPlacement(
  intent: BuilderIntent,
  molecule: Molecule,
  position: BuilderVector3,
  viewDirection: BuilderVector3 | undefined,
  effects: EditCommandEffects,
): void {
  if (!shouldPlaceOnBackgroundDoubleClickForIntent(intent)) return
  const session = new PlacementCommandSession()
  const input = session.resolve({
    activeElement: intent.activeElement,
    activeFragmentId: intent.activeFragmentId,
    position,
    sketchPlane: intent.sketchPlane,
    viewDirection,
  })
  runEditCommand(molecule, (mol) => session.commit(mol, input), effects)
}
