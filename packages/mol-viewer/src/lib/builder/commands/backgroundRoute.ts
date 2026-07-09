import type { BuilderIntent } from './builderIntent'

export type BackgroundClickRoute =
  | { readonly kind: 'commitMeasure' }
  | { readonly kind: 'clearSelection' }
  | { readonly kind: 'noop' }

export function routeBackgroundClickForIntent(
  intent: BuilderIntent,
  input: { readonly shiftKey: boolean; readonly altKey: boolean },
): BackgroundClickRoute {
  if (intent.kind === 'measure') return { kind: 'commitMeasure' }
  if (!input.shiftKey && !input.altKey) return { kind: 'clearSelection' }
  return { kind: 'noop' }
}

export function shouldPlaceOnBackgroundDoubleClickForIntent(intent: BuilderIntent): boolean {
  return intent.canBuild
}
