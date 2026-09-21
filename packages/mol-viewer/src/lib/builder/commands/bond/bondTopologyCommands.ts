import type { Atom, Bond, Molecule } from '../../../molecule'
import { newBond } from '../../../molecule'
import { bondByReplacingH, bondEZAvailability, clearBondEZ, setBondEZ } from '../../editing/bondOps'
import {
  isBondOrder,
  planBondOrderChange,
  supportedBondOrders,
  type BondOrder,
  validateBondAddition,
} from '../../../chemistry/policies/bondPolicy'
import { detectAromaticity } from '../../../analysis/aromaticity'
import { kekulizeAromaticBonds } from '../../../io/kekulize'
import { editMolecule, editFailed, editUnchanged, type EditCommandResult } from '../shared'

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
  return editMolecule(molecule, result.molecule)
}

export function runAddBondCommand(
  molecule: Molecule,
  input: AddBondCommandInput,
): EditCommandResult {
  const validation = validateBondAddition(molecule, input)
  if (validation.ok === false) return editFailed(validation.reason)

  return editMolecule(molecule, {
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
    : editMolecule(molecule, result.molecule)
}

export function runSetBondWedgeCommand(
  molecule: Molecule,
  bondId: string,
  wedge: 'up' | 'down' | 'none',
): EditCommandResult {
  if (wedge !== 'up' && wedge !== 'down' && wedge !== 'none') {
    return editFailed('无效楔形类型')
  }
  const bond = molecule.bonds.find(candidate => candidate.id === bondId)
  if (!bond) return editUnchanged()
  const nextWedge = wedge === 'none' ? undefined : wedge
  if (bond.wedge === nextWedge) return editUnchanged()
  return editMolecule(molecule, {
    ...molecule,
    bonds: molecule.bonds.map(candidate => {
      if (candidate.id !== bondId) return candidate
      if (nextWedge === undefined) {
        const { wedge: _omitted, ...rest } = candidate
        return rest
      }
      return { ...candidate, wedge: nextWedge }
    }),
  })
}

export function runSetEZCommand(
  molecule: Molecule,
  bondId: string,
  ez: 'E' | 'Z' | 'none',
): EditCommandResult {
  if (ez !== 'E' && ez !== 'Z' && ez !== 'none') return editFailed('无效顺反标记')
  const bond = molecule.bonds.find(candidate => candidate.id === bondId)
  if (!bond) return editFailed('键不存在')
  if (ez === 'none') {
    const next = clearBondEZ(molecule, bondId)
    return next === molecule ? editUnchanged() : editMolecule(molecule, next)
  }
  const availability = bondEZAvailability(molecule, bondId)
  if (availability.ok === false) return editFailed(availability.reason)
  const next = setBondEZ(molecule, bondId, ez)
  if (next !== molecule) return editMolecule(molecule, next)
  return bond.ez === ez ? editUnchanged() : editFailed('双键至少一端需要两个显式取代基才能翻转 E/Z')
}

export function runSetBondOrdersCommand(
  molecule: Molecule,
  bondIds: readonly string[],
  order: BondOrder,
): EditCommandResult {
  if (!isBondOrder(order)) return editFailed('无效键级')
  let next = molecule
  for (const bondId of bondIds) {
    const plan = planBondOrderChange(next, bondId, order)
    if (plan.ok === false || plan.changed === false) continue
    next = plan.molecule
  }
  return next === molecule
    ? editUnchanged()
    : editMolecule(molecule, next)
}

/**
 * 芳香性归一化：先感知（detectAromaticity 标芳香环键），再凯库勒化
 * （kekulizeAromaticBonds 排单双交替）。一步 undo；无芳香环返回 unchanged。
 */
export function runNormalizeAromaticityCommand(molecule: Molecule): EditCommandResult {
  const { aromaticBonds } = detectAromaticity(molecule)
  if (aromaticBonds.size === 0) return editUnchanged()
  let changed = false
  let next = molecule
  const flagged = next.bonds.map(bond => {
    if (aromaticBonds.has(bond.id) && bond.aromatic !== true) {
      changed = true
      return { ...bond, aromatic: true }
    }
    return bond
  })
  if (changed) next = { ...next, bonds: flagged }
  const override = kekulizeAromaticBonds(next)
  if (override.size > 0) {
    const kekulized = next.bonds.map(bond => {
      const order = override.get(bond.id)
      if (order === undefined || bond.order === order) return bond
      changed = true
      return { ...bond, order }
    })
    if (changed) next = { ...next, bonds: kekulized }
  }
  return changed ? editMolecule(molecule, next) : editUnchanged()
}
