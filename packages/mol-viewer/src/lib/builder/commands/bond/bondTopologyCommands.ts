import type { Atom, Bond, Molecule } from '../../../molecule'
import { newBond } from '../../../molecule'
import { bondByReplacingH } from '../../editing/bondOps'
import {
  planBondOrderChange,
  supportedBondOrders,
  type BondOrder,
  validateBondAddition,
} from '../../../chemistry/policies/bondPolicy'
import { editChanged, editFailed, editUnchanged, type EditCommandResult } from '../shared'

export interface AddBondCommandInput {
  readonly atomId1: string
  readonly atomId2: string
  readonly order?: 1 | 2 | 3
}

export function canBond(
  atom1: Atom,
  atom2: Atom,
  bonds: readonly Bond[],
): { ok: boolean; reason?: string } {
  return validateBondAddition(
    { atoms: [atom1, atom2], bonds },
    { atomId1: atom1.id, atomId2: atom2.id },
  )
}

export function runCycleBondOrderCommand(
  molecule: Molecule,
  bondId: string,
): EditCommandResult {
  const bond = molecule.bonds.find(candidate => candidate.id === bondId)
  if (!bond) return editUnchanged()
  const atom1 = molecule.atoms.find(atom => atom.id === bond.atomId1)
  const atom2 = molecule.atoms.find(atom => atom.id === bond.atomId2)
  if (!atom1 || !atom2) return editUnchanged()

  const orders = supportedBondOrders(atom1, atom2)
  if (orders.length < 2) return editUnchanged()
  const next = orders[(orders.indexOf(bond.order) + 1) % orders.length]
  if (next === undefined) return editUnchanged()

  return runSetBondOrderCommand(molecule, bondId, next)
}

export function runSetBondOrderCommand(
  molecule: Molecule,
  bondId: string,
  order: BondOrder,
): EditCommandResult {
  const result = planBondOrderChange(molecule, bondId, order)
  if (result.ok === false || !result.changed) return editUnchanged()
  return editChanged(result.molecule)
}

export function runAddBondCommand(
  molecule: Molecule,
  input: AddBondCommandInput,
): EditCommandResult {
  const validation = validateBondAddition(molecule, input)
  if (validation.ok === false) return editFailed(validation.reason)

  return editChanged({
    ...molecule,
    bonds: [...molecule.bonds, newBond(input.atomId1, input.atomId2, validation.order)],
  })
}

export function runBondViaHydrogenCommand(
  molecule: Molecule,
  sourceHId: string,
  targetId: string,
): EditCommandResult {
  const result = bondByReplacingH(molecule, sourceHId, targetId)
  return result.ok === false
    ? editFailed(result.reason)
    : editChanged(result.molecule)
}
