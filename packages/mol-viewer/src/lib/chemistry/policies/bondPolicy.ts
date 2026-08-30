import { lookupBondLengthByOrder } from '../../../config/geometry.config'
import type { Atom, Bond, Molecule } from '../../molecule'
import {
  availableMaxValenceByBonds,
  maxValence,
  valenceUsed,
} from '../valence'
import { removeExcessHydrogens } from './explicitHydrogenPolicy'

export type BondOrder = Bond['order']
export type BondRuleFailureCategory = 'invalid-input' | 'unsupported-order'

export type BondRuleFailure = {
  readonly ok: false
  readonly category: BondRuleFailureCategory
  readonly reason: string
}

const BOND_ORDERS: readonly BondOrder[] = [1, 2, 3]

function failure(
  reason: string,
  category: BondRuleFailureCategory = 'invalid-input',
): BondRuleFailure {
  return { ok: false, category, reason }
}

export function isBondOrder(order: number): order is BondOrder {
  return BOND_ORDERS.includes(order as BondOrder)
}

export function isBondOrderSupported(
  atom1: Atom,
  atom2: Atom,
  order: BondOrder,
): boolean {
  return lookupBondLengthByOrder(atom1.symbol, atom2.symbol, order) !== null
}

export function supportedBondOrders(atom1: Atom, atom2: Atom): readonly BondOrder[] {
  return BOND_ORDERS.filter(order => isBondOrderSupported(atom1, atom2, order))
}

export type BondAdditionValidation =
  | { readonly ok: true; readonly atom1: Atom; readonly atom2: Atom; readonly order: BondOrder }
  | BondRuleFailure

export function validateBondTopologyAddition(
  molecule: Molecule,
  input: {
    readonly atomId1: string
    readonly atomId2: string
    readonly order?: number
  },
): BondAdditionValidation {
  const order = input.order ?? 1
  if (!isBondOrder(order)) return failure('无效键级')

  const atom1 = molecule.atoms.find(atom => atom.id === input.atomId1)
  const atom2 = molecule.atoms.find(atom => atom.id === input.atomId2)
  if (!atom1 || !atom2) return failure('原子不存在')
  if (!isBondOrderSupported(atom1, atom2, order)) {
    return failure('不支持该键级', 'unsupported-order')
  }

  if (atom1.id === atom2.id) return failure('不能与自身成键')
  const duplicate = molecule.bonds.some(bond =>
    (bond.atomId1 === atom1.id && bond.atomId2 === atom2.id) ||
    (bond.atomId1 === atom2.id && bond.atomId2 === atom1.id))
  if (duplicate) return failure('两原子之间已存在键')

  return { ok: true, atom1, atom2, order }
}

export function validateBondAddition(
  molecule: Molecule,
  input: {
    readonly atomId1: string
    readonly atomId2: string
    readonly order?: number
  },
): BondAdditionValidation {
  const topology = validateBondTopologyAddition(molecule, input)
  if (topology.ok === false) return topology

  const { atom1, atom2, order } = topology

  if (availableMaxValenceByBonds(atom1, molecule.bonds) < order) {
    return failure(`${atom1.symbol} 已达最大键数 (${maxValence(atom1)})`)
  }
  if (availableMaxValenceByBonds(atom2, molecule.bonds) < order) {
    return failure(`${atom2.symbol} 已达最大键数 (${maxValence(atom2)})`)
  }
  return { ok: true, atom1, atom2, order }
}

export type BondOrderChangePlan =
  | { readonly ok: true; readonly changed: false }
  | { readonly ok: true; readonly changed: true; readonly molecule: Molecule }
  | BondRuleFailure

function withBondOrder(bond: Bond, order: BondOrder): Bond {
  const { aromatic: _aromatic, ...plainBond } = bond
  return { ...plainBond, order }
}

export function planBondTopologyOrderChange(
  molecule: Molecule,
  bondId: string,
  order: number,
): BondOrderChangePlan {
  if (!isBondOrder(order)) return failure('无效键级')

  const bond = molecule.bonds.find(candidate => candidate.id === bondId)
  if (!bond) return failure('键不存在')
  const atom1 = molecule.atoms.find(atom => atom.id === bond.atomId1)
  const atom2 = molecule.atoms.find(atom => atom.id === bond.atomId2)
  if (!atom1 || !atom2) return failure('键端点不存在')
  if (!isBondOrderSupported(atom1, atom2, order)) {
    return failure('不支持该键级', 'unsupported-order')
  }
  if (bond.order === order && bond.aromatic !== true) return { ok: true, changed: false }

  const withOrder: Molecule = {
    ...molecule,
    bonds: molecule.bonds.map(candidate =>
      candidate.id === bondId ? withBondOrder(candidate, order) : candidate),
  }
  return { ok: true, changed: true, molecule: withOrder }
}

export function planBondOrderChange(
  molecule: Molecule,
  bondId: string,
  order: number,
): BondOrderChangePlan {
  const topology = planBondTopologyOrderChange(molecule, bondId, order)
  if (topology.ok === false || topology.changed === false) return topology

  const bond = topology.molecule.bonds.find(candidate => candidate.id === bondId)!
  const atom1 = topology.molecule.atoms.find(atom => atom.id === bond.atomId1)!
  const atom2 = topology.molecule.atoms.find(atom => atom.id === bond.atomId2)!
  const reconciled = removeExcessHydrogens(
    removeExcessHydrogens(topology.molecule, atom1.id),
    atom2.id,
  )

  for (const atomId of [atom1.id, atom2.id]) {
    const atom = reconciled.atoms.find(candidate => candidate.id === atomId)
    // Localising one imported aromatic bond can leave a 0.5 bookkeeping residue
    // beside neighbouring aromatic bonds. Keep this aligned with
    // removeExcessHydrogens: only a whole remaining valence unit is over-valent.
    if (!atom || valenceUsed(reconciled, atomId) - maxValence(atom) >= 1 - 1e-8) {
      return failure('修改键级后原子超过允许价态')
    }
  }

  return { ok: true, changed: true, molecule: reconciled }
}
