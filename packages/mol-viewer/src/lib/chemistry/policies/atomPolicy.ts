import { ELEMENT_CONFIGS } from '../../../config/elements.config'
import type { Molecule } from '../../molecule'
import { maxValence, valenceUsed } from '../valence'

export type AtomRuleResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: string }

export function validateElementSymbol(symbol: string): AtomRuleResult {
  return Object.hasOwn(ELEMENT_CONFIGS, symbol)
    ? { ok: true }
    : { ok: false, reason: `未知元素：${symbol}` }
}

export function validateAtomPosition(x: number, y: number, z: number): AtomRuleResult {
  return [x, y, z].every(Number.isFinite)
    ? { ok: true }
    : { ok: false, reason: '原子坐标必须是有限数值' }
}

export function validateAtomCreationInput(
  symbol: string,
  x: number,
  y: number,
  z: number,
): AtomRuleResult {
  const element = validateElementSymbol(symbol)
  if (element.ok === false) return element
  return validateAtomPosition(x, y, z)
}

export function getHydrogenAdditionAvailability(
  molecule: Molecule,
  atomId: string,
): AtomRuleResult {
  const atom = molecule.atoms.find(candidate => candidate.id === atomId)
  if (!atom) return { ok: false, reason: '原子不存在' }
  if (atom.symbol === 'H') return { ok: false, reason: 'H 不能继续加 H' }
  const max = maxValence(atom)
  if (max <= 0) return { ok: false, reason: '该元素不能成键' }
  if (valenceUsed(molecule, atomId) >= max) return { ok: false, reason: '已满键，无法加 H' }
  return { ok: true }
}
