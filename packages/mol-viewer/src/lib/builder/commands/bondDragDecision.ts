import type { Molecule } from '../../molecule'
import { isSlotH } from '../queries'

export interface BondDragEndDecisionInput {
  readonly sourceId: string
  readonly targetId: string | null
  readonly dropLocal: { readonly x: number; readonly y: number; readonly z: number } | null
  readonly activeElement: string
}

export type BondDragEndDecision =
  | { readonly kind: 'addBond'; readonly atomId1: string; readonly atomId2: string }
  | { readonly kind: 'bondViaHydrogen'; readonly sourceHId: string; readonly targetId: string }
  | { readonly kind: 'growFromHydrogen'; readonly atomId: string; readonly element: string }
  | {
      readonly kind: 'growToEmpty'
      readonly sourceId: string
      readonly element: string
      readonly position: { readonly x: number; readonly y: number; readonly z: number }
    }
  | { readonly kind: 'noop' }
  | { readonly kind: 'error'; readonly reason: string }

export function resolveBondDragEndDecision(
  molecule: Molecule,
  input: BondDragEndDecisionInput,
): BondDragEndDecision {
  const source = molecule.atoms.find(atom => atom.id === input.sourceId)
  if (!source) return { kind: 'error', reason: '源原子不存在' }

  if (input.targetId) {
    const target = molecule.atoms.find(atom => atom.id === input.targetId)
    if (!target) return { kind: 'error', reason: '目标原子在另一个分子里，暂不支持跨分子成键' }

    const sourceSlot = isSlotH(molecule, input.sourceId)
    const targetSlot = isSlotH(molecule, input.targetId)
    if (sourceSlot || targetSlot) {
      return sourceSlot
        ? { kind: 'bondViaHydrogen', sourceHId: input.sourceId, targetId: input.targetId }
        : { kind: 'bondViaHydrogen', sourceHId: input.targetId, targetId: input.sourceId }
    }

    return { kind: 'addBond', atomId1: source.id, atomId2: target.id }
  }

  if (!input.dropLocal) return { kind: 'noop' }

  if (isSlotH(molecule, input.sourceId)) {
    return input.activeElement === 'H'
      ? { kind: 'noop' }
      : { kind: 'growFromHydrogen', atomId: input.sourceId, element: input.activeElement }
  }

  return {
    kind: 'growToEmpty',
    sourceId: input.sourceId,
    element: input.activeElement,
    position: input.dropLocal,
  }
}
