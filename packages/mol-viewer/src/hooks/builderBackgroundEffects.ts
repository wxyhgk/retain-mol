import type { Molecule } from '../lib/molecule'
import {
  routeBackgroundClickForIntent,
  type BackgroundClickRoute,
  type BuilderIntent,
} from '../lib/builder/commands/interaction'
import { PlacementCommandSession } from '../lib/builder/commands/interaction'
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
    case 'place':
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
): BackgroundClickRoute {
  const route = routeBackgroundClickForIntent(intent, input)
  applyBackgroundClickRoute(route, effects)
  return route
}

export function applyBackgroundPlacement(
  intent: BuilderIntent,
  molecule: Molecule,
  position: BuilderVector3,
  viewDirection: BuilderVector3 | undefined,
  effects: EditCommandEffects,
): ReturnType<typeof runEditCommand> | null {
  if (!intent.canBuild) return null
  const session = new PlacementCommandSession()
  const input = session.resolve({
    activeElement: intent.activeElement,
    activeFragmentId: intent.activeFragmentId,
    position,
    sketchPlane: intent.sketchPlane,
    viewDirection,
  })
  return runEditCommand(molecule, (mol) => session.commit(mol, input), effects)
}
