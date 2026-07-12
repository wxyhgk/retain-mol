import type { Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { degree } from '../../graph'

export interface AtomClickDecisionInput {
  readonly atomId: string
  readonly activeElement: string
  readonly atomClickMode: 'grow' | 'replace'
  readonly fragment?: FragmentDef
}

export type AtomClickDecision =
  | { readonly kind: 'attach'; readonly atomId: string; readonly fragment: FragmentDef }
  | { readonly kind: 'replace'; readonly atomId: string; readonly element: string }
  | { readonly kind: 'addHydrogen'; readonly atomId: string }
  | { readonly kind: 'growFromHydrogen'; readonly atomId: string; readonly element: string }
  | { readonly kind: 'noop'; readonly message?: string }
  | { readonly kind: 'error'; readonly reason: string }

export function resolveAtomClickDecision(
  molecule: Molecule,
  input: AtomClickDecisionInput,
): AtomClickDecision {
  const centerAtom = molecule.atoms.find(atom => atom.id === input.atomId)
  if (!centerAtom) return { kind: 'error', reason: '原子不存在' }

  if (input.fragment) {
    return { kind: 'attach', atomId: input.atomId, fragment: input.fragment }
  }

  if (input.atomClickMode === 'replace') {
    return centerAtom.symbol === input.activeElement
      ? { kind: 'noop', message: `已是 ${input.activeElement}` }
      : { kind: 'replace', atomId: input.atomId, element: input.activeElement }
  }

  if (input.activeElement === 'H' && centerAtom.symbol !== 'H') {
    return { kind: 'addHydrogen', atomId: input.atomId }
  }

  if (centerAtom.symbol === 'H' && input.activeElement !== 'H' &&
      degree(molecule.bonds, input.atomId) > 0) {
    return { kind: 'growFromHydrogen', atomId: input.atomId, element: input.activeElement }
  }

  if (centerAtom.symbol !== 'H') {
    return centerAtom.symbol === input.activeElement
      ? { kind: 'noop', message: `已是 ${input.activeElement}` }
      : { kind: 'replace', atomId: input.atomId, element: input.activeElement }
  }

  return { kind: 'noop', message: '孤立 H · Esc 切换到选择' }
}
