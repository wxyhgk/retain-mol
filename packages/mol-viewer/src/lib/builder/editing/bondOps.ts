/**
 * bondOps.ts — 键操作业务规则
 */

import { getElementConfig } from '../../../config/elements.config'
import type { Atom, Bond } from '../../molecule'

/** 判断两个原子之间是否允许成键 */
export function canBond(
  atom1: Atom,
  atom2: Atom,
  bonds: readonly Bond[],
): { ok: boolean; reason?: string } {
  const el1 = getElementConfig(atom1.symbol)
  const el2 = getElementConfig(atom2.symbol)

  const existing = bonds.find(
    b => (b.atomId1 === atom1.id && b.atomId2 === atom2.id) ||
         (b.atomId1 === atom2.id && b.atomId2 === atom1.id)
  )
  if (existing) return { ok: false, reason: '两原子之间已存在键' }

  const bonds1 = bonds.filter(b => b.atomId1 === atom1.id || b.atomId2 === atom1.id).length
  const bonds2 = bonds.filter(b => b.atomId1 === atom2.id || b.atomId2 === atom2.id).length

  if (bonds1 >= el1.maxBonds) return { ok: false, reason: `${atom1.symbol} 已达最大键数 (${el1.maxBonds})` }
  if (bonds2 >= el2.maxBonds) return { ok: false, reason: `${atom2.symbol} 已达最大键数 (${el2.maxBonds})` }

  return { ok: true }
}
