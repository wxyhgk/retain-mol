import type { FragmentDef } from '../../fragmentLibrary'
import type { BuilderIntent } from './builderIntent'

export type AtomClickRoute =
  | { readonly kind: 'measure' }
  | { readonly kind: 'select'; readonly append: boolean }
  | { readonly kind: 'command'; readonly fragment?: FragmentDef }
  | { readonly kind: 'noop' }

export function routeAtomClickForIntent(
  intent: BuilderIntent,
  input: { readonly shiftKey: boolean },
): AtomClickRoute {
  if (intent.kind === 'measure') return { kind: 'measure' }
  if (intent.kind === 'move-object') return { kind: 'noop' }
  if (input.shiftKey) return { kind: 'select', append: true }
  if (!intent.canBuild) return { kind: 'select', append: false }
  return intent.fragment
    ? { kind: 'command', fragment: intent.fragment }
    : { kind: 'command' }
}
