import type { Molecule } from './types'

/** Exact DTO equality; object key order/absent optional fields do not change data. */
function dataEqual(left: unknown, right: unknown): boolean {
  if (left === right) return true
  if (left === null || right === null || typeof left !== 'object' || typeof right !== 'object') return false
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) && left.length === right.length &&
      left.every((value, index) => dataEqual(value, right[index]))
  }
  const a = left as Record<string, unknown>
  const b = right as Record<string, unknown>
  const keys = Object.keys(a).filter(key => a[key] !== undefined)
  return keys.length === Object.keys(b).filter(key => b[key] !== undefined).length &&
    keys.every(key => Object.hasOwn(b, key) && dataEqual(a[key], b[key]))
}

/** Includes IDs, array order, annotations and nested coordination metadata. No geometric tolerance. */
export function moleculesEqual(left: Molecule, right: Molecule): boolean {
  return dataEqual(left, right)
}
