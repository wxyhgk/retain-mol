/**
 * hybridization.ts — 杂化推断
 *
 * 从原子的现有键推断杂化类型（sp / sp2 / sp3）。
 *
 * 算法：
 *   - 有三键或 ≥2 个双键（累积双键）→ sp
 *   - 恰有 1 个双键 → sp2
 *   - 其余 → sp3
 *
 * 这是杂化推断的唯一真理来源：conjugation.ts、vsepr.ts、editing/fragment
 * 都应调用这里，不再各自实现。
 */

import type { Bond } from '../../types'
import type { AtomHybridization } from '../../../config/geometry.config'
import { bondsOf } from '../graph'

/** 从原子的现有键推断杂化（唯一真理来源） */
export function inferHybridization(bonds: readonly Bond[], atomId: string): AtomHybridization {
  const atomBonds = bondsOf(bonds, atomId)
  const doubleCount = atomBonds.filter(b => b.order === 2).length
  const tripleCount = atomBonds.filter(b => b.order === 3).length
  if (tripleCount > 0 || doubleCount >= 2) return 'sp'   // ≡ 或累积双键
  if (doubleCount === 1)                    return 'sp2'
  return 'sp3'
}
