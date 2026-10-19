import type { MoleculeState } from '../../store/slices/types'

export type AtomContextMenuStore = Pick<
  MoleculeState,
  | 'selectedAtomIds'
  | 'selectAtom'
  | 'addOneHydrogen'
  | 'replaceAtoms'
  | 'removeAtoms'
  | 'setAtomCharge'
  | 'setAtomRadical'
>

export function resolveContextAtomIds(
  atomId: string,
  selectedAtomIds: ReadonlySet<string>,
): readonly string[] {
  return selectedAtomIds.size > 1 && selectedAtomIds.has(atomId)
    ? [...selectedAtomIds]
    : [atomId]
}

export function selectContextAtomIfNeeded(
  atomId: string,
  getState: () => Pick<AtomContextMenuStore, 'selectedAtomIds' | 'selectAtom'>,
): void {
  const { selectedAtomIds, selectAtom } = getState()
  if (!selectedAtomIds.has(atomId)) selectAtom(atomId)
}

export function commitContextAtomHydrogen(
  atomId: string,
  getState: () => Pick<AtomContextMenuStore, 'addOneHydrogen'>,
): void {
  getState().addOneHydrogen(atomId)
}

export function commitContextAtomReplacement(
  atomId: string,
  symbol: string,
  getState: () => Pick<AtomContextMenuStore, 'selectedAtomIds' | 'replaceAtoms'>,
): void {
  const { selectedAtomIds, replaceAtoms } = getState()
  replaceAtoms(resolveContextAtomIds(atomId, selectedAtomIds), symbol)
}

export function commitContextAtomRemoval(
  atomId: string,
  getState: () => Pick<AtomContextMenuStore, 'selectedAtomIds' | 'removeAtoms'>,
): void {
  const { selectedAtomIds, removeAtoms } = getState()
  removeAtoms(resolveContextAtomIds(atomId, selectedAtomIds))
}

export function commitContextAtomCharge(
  atomId: string,
  charge: number,
  getState: () => Pick<AtomContextMenuStore, 'setAtomCharge'>,
): void {
  getState().setAtomCharge(atomId, charge)
}

export function commitContextAtomRadical(
  atomId: string,
  radical: number,
  getState: () => Pick<AtomContextMenuStore, 'setAtomRadical'>,
): void {
  getState().setAtomRadical(atomId, radical)
}
