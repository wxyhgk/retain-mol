import type { FragmentDef } from '../fragmentLibrary'

export interface BondClickDecisionInput {
  readonly bondId: string
  readonly fragment?: FragmentDef
  readonly cycleLength?: boolean
}

export type BondClickDecision =
  | { readonly kind: 'fuse'; readonly bondId: string; readonly fragment: FragmentDef }
  | { readonly kind: 'cycleLength'; readonly bondId: string }
  | { readonly kind: 'noop' }

export function resolveBondClickDecision(input: BondClickDecisionInput): BondClickDecision {
  if (input.fragment) {
    return { kind: 'fuse', bondId: input.bondId, fragment: input.fragment }
  }
  if (input.cycleLength) {
    return { kind: 'cycleLength', bondId: input.bondId }
  }
  return { kind: 'noop' }
}
