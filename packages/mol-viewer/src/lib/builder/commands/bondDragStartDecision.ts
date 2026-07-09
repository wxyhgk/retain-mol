import type { Molecule } from '../../molecule'
import { isSlotH } from '../queries'
import { maxValence, valenceUsedByBonds } from '../valence'

export interface BondDragStartDecisionInput {
  readonly sourceId: string
  readonly selectedAtomIds: ReadonlySet<string>
  readonly hasActiveFragment: boolean
}

export type BondDragStartDecision =
  | { readonly kind: 'allow'; readonly sourceId: string; readonly viaHydrogenSlot: boolean }
  | {
      readonly kind: 'deny'
      readonly reason: 'active-fragment' | 'source-selected' | 'missing-source' | 'saturated-source'
    }

export function resolveBondDragStartDecision(
  molecule: Molecule,
  input: BondDragStartDecisionInput,
): BondDragStartDecision {
  if (input.hasActiveFragment) return { kind: 'deny', reason: 'active-fragment' }
  if (input.selectedAtomIds.has(input.sourceId)) return { kind: 'deny', reason: 'source-selected' }

  const source = molecule.atoms.find(atom => atom.id === input.sourceId)
  if (!source) return { kind: 'deny', reason: 'missing-source' }
  if (isSlotH(molecule, input.sourceId)) {
    return { kind: 'allow', sourceId: input.sourceId, viaHydrogenSlot: true }
  }

  return valenceUsedByBonds(molecule.bonds, input.sourceId) < maxValence(source)
    ? { kind: 'allow', sourceId: input.sourceId, viaHydrogenSlot: false }
    : { kind: 'deny', reason: 'saturated-source' }
}
