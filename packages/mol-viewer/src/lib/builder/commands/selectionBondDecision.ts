import type { Molecule } from '../../molecule'
import { isSlotH } from '../queries'

export interface BondSelectedAtomsDecisionInput {
  readonly atomIds: readonly string[]
}

export type BondSelectedAtomsDecision =
  | { readonly kind: 'addBond'; readonly atomId1: string; readonly atomId2: string }
  | { readonly kind: 'bondViaHydrogen'; readonly sourceHId: string; readonly targetId: string }
  | { readonly kind: 'error'; readonly reason: string }

export function resolveBondSelectedAtomsDecision(
  molecule: Molecule,
  input: BondSelectedAtomsDecisionInput,
): BondSelectedAtomsDecision {
  if (input.atomIds.length !== 2) return { kind: 'error', reason: '请先选中恰好两个原子' }

  const [a1, a2] = input.atomIds.map(id => molecule.atoms.find(atom => atom.id === id))
  if (!a1 || !a2) return { kind: 'error', reason: '原子不存在' }

  if (isSlotH(molecule, a1.id)) {
    return { kind: 'bondViaHydrogen', sourceHId: a1.id, targetId: a2.id }
  }
  if (isSlotH(molecule, a2.id)) {
    return { kind: 'bondViaHydrogen', sourceHId: a2.id, targetId: a1.id }
  }

  return { kind: 'addBond', atomId1: a1.id, atomId2: a2.id }
}
