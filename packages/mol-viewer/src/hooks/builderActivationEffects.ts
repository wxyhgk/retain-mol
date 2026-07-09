import type { Molecule } from '../lib/molecule'

export interface ObjectActivationEffects {
  readonly activateObjectContainingAtom: (atomId: string) => boolean
  readonly activateObjectContainingBond: (bondId: string) => boolean
}

export function ensureEditableAtomObject(
  atomId: string,
  effects: Pick<ObjectActivationEffects, 'activateObjectContainingAtom'>,
): boolean {
  return effects.activateObjectContainingAtom(atomId)
}

export function ensureEditableBondObject(
  bondId: string,
  activeMolecule: Molecule,
  effects: Pick<ObjectActivationEffects, 'activateObjectContainingBond'>,
): boolean {
  if (activeMolecule.bonds.some(bond => bond.id === bondId)) return true
  return effects.activateObjectContainingBond(bondId)
}
