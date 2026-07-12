import type { Atom, Bond, Molecule } from '../../../molecule'
import { newBond } from '../../../molecule'
import { lookupBondLengthByOrder } from '../../../../config/geometry.config'
import { bondByReplacingH } from '../../editing/bondOps'
import { GraphIndex, ValencePolicy } from '../../kernel'
import { editChanged, editFailed, editUnchanged, type EditCommandResult } from '../shared'

export interface AddBondCommandInput {
  readonly atomId1: string
  readonly atomId2: string
  readonly order?: 1 | 2 | 3
}

type BondOrder = Bond['order']

const BOND_ORDERS: readonly BondOrder[] = [1, 2, 3]

function isBondOrder(order: number): order is BondOrder {
  return BOND_ORDERS.includes(order as BondOrder)
}

function supportedBondOrders(atom1: Atom, atom2: Atom): readonly BondOrder[] {
  return BOND_ORDERS.filter(
    order => lookupBondLengthByOrder(atom1.symbol, atom2.symbol, order) !== null,
  )
}

export function canBond(
  atom1: Atom,
  atom2: Atom,
  bonds: readonly Bond[],
): { ok: boolean; reason?: string } {
  const graph = new GraphIndex({ atoms: [atom1, atom2], bonds })
  return new ValencePolicy(graph).canAddBond(atom1, atom2)
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

  return runSetBondOrderCommand(molecule, bondId, next)
}

export function runSetBondOrderCommand(
  molecule: Molecule,
  bondId: string,
  order: BondOrder,
): EditCommandResult {
  if (!isBondOrder(order)) return editUnchanged()

  const bond = molecule.bonds.find(candidate => candidate.id === bondId)
  if (!bond) return editUnchanged()
  const atom1 = molecule.atoms.find(atom => atom.id === bond.atomId1)
  const atom2 = molecule.atoms.find(atom => atom.id === bond.atomId2)
  if (!atom1 || !atom2) return editUnchanged()
  if (!supportedBondOrders(atom1, atom2).includes(order)) return editUnchanged()
  if (bond.order === order && bond.aromatic !== true) return editUnchanged()

  return editChanged({
    ...molecule,
    bonds: molecule.bonds.map(candidate =>
      candidate.id === bondId ? { ...candidate, order, aromatic: undefined } : candidate),
  })
}

export function runAddBondCommand(
  molecule: Molecule,
  input: AddBondCommandInput,
): EditCommandResult {
  const order = input.order ?? 1
  const atom1 = molecule.atoms.find(atom => atom.id === input.atomId1)
  const atom2 = molecule.atoms.find(atom => atom.id === input.atomId2)
  if (!atom1 || !atom2) return editFailed('原子不存在')

  const check = new ValencePolicy(new GraphIndex(molecule)).canAddBond(atom1, atom2, order)
  if (!check.ok) return editFailed(check.reason ?? '无法成键')

  return editChanged({
    ...molecule,
    bonds: [...molecule.bonds, newBond(input.atomId1, input.atomId2, order)],
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
