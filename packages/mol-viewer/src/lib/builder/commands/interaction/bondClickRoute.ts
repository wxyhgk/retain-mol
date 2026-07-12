import type { FragmentDef } from '../../fragmentLibrary'
import type { BuilderIntent } from './builderIntent'

export type BondClickRoute =
  | { readonly kind: 'select'; readonly multi: boolean }
  | { readonly kind: 'command'; readonly fragment?: FragmentDef; readonly cycleLength: boolean }
  | { readonly kind: 'noop' }

export function routeBondClickForIntent(
  intent: BuilderIntent,
  input: { readonly shiftKey: boolean; readonly altKey: boolean },
): BondClickRoute {
  if (!intent.canEdit) return { kind: 'noop' }
  if (!intent.canBuild) {
    return { kind: 'select', multi: input.shiftKey || input.altKey }
  }
  if (intent.fragment || input.shiftKey) {
    return {
      kind: 'command',
      fragment: intent.fragment,
      cycleLength: input.shiftKey,
    }
  }
  return { kind: 'select', multi: input.altKey }
}
