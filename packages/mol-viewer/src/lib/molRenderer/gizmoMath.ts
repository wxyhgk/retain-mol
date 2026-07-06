/**
 * gizmoMath — RotateGizmoController 的纯数学辅助函数。
 * 这些函数无 `this`、无 scene/mesh 变更、无 THREE 对象生命周期副作用：
 * 每个函数接收显式参数并返回值。行为与内联版本完全一致（纯代码搬移）。
 */

import type { Atom, Bond } from '../molecule'
import { GIZMO_RING } from '../../config/rotateGizmo.config'

/**
 * 计算环半径：group 中离参考点最远的原子距离，经 padding/clamp。
 * 纯函数：只读 atoms，返回数值。
 */
export function computeRingRadius(
  atoms: readonly Atom[],
  refX: number,
  refY: number,
  refZ: number,
  group: Set<string>,
): number {
  let maxD = 0
  for (const a of atoms) {
    if (!group.has(a.id)) continue
    const d = Math.sqrt((a.x - refX) ** 2 + (a.y - refY) ** 2 + (a.z - refZ) ** 2)
    if (d > maxD) maxD = d
  }
  return Math.min(GIZMO_RING.radiusMax, Math.max(GIZMO_RING.radiusMin,
    maxD * GIZMO_RING.radiusPaddingFactor + GIZMO_RING.radiusPaddingAdd))
}

/**
 * 从 startAtomId 出发，沿键做 BFS，收集同一侧的原子 id 集合。
 * excludeBondId 对应的键被排除（不跨越，用于绕键旋转时切分两侧）。
 * 纯函数：只读 bonds，返回新 Set。
 */
export function collectBondSideAtoms(
  bonds: readonly Bond[],
  startAtomId: string,
  excludeBondId: string,
): Set<string> {
  const rotating = new Set<string>([startAtomId])
  const queue = [startAtomId]
  while (queue.length) {
    const cur = queue.shift()!
    for (const b of bonds) {
      if (b.id === excludeBondId) continue
      const nbr = b.atomId1 === cur ? b.atomId2 : b.atomId2 === cur ? b.atomId1 : null
      if (nbr && !rotating.has(nbr)) { rotating.add(nbr); queue.push(nbr) }
    }
  }
  return rotating
}
