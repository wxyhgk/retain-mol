/**
 * undo 快照配置（zundo）
 *
 * 只有分子/场景数据进 undo 历史；选择、版本号等 UI 状态不进，
 * 否则每次点选都会产生一条历史记录，把 limit 吃光。
 *
 * 这些原语被 editSlice（beginTransaction/endTransaction）与 moleculeStore
 * 的组装层共享，独立成模块避免两者互相 import 形成环。
 */

import { moleculesEqual } from '../../lib/model/equality'
import type { UndoableSceneState, UndoSnapshot } from '../contracts/undo'

export type { UndoSnapshot } from '../contracts/undo'

export const UNDO_LIMIT = 50

export function partializeForUndo(s: UndoableSceneState): UndoSnapshot {
  return {
    objectsById:    s.objectsById,
    objectOrder:    s.objectOrder,
    activeObjectId: s.activeObjectId,
  }
}

export function undoSnapshotEqual(a: UndoSnapshot, b: UndoSnapshot): boolean {
  if (a.activeObjectId !== b.activeObjectId || a.objectOrder.length !== b.objectOrder.length ||
      !a.objectOrder.every((id, index) => id === b.objectOrder[index])) return false
  if (a.objectsById === b.objectsById) return true
  const ids = Object.keys(a.objectsById)
  if (ids.length !== Object.keys(b.objectsById).length) return false
  return ids.every(id => {
    const left = a.objectsById[id]
    const right = b.objectsById[id]
    if (left === right) return true
    return left !== undefined && right !== undefined && left.id === right.id &&
      left.name === right.name && left.visible === right.visible && left.locked === right.locked &&
      left.createdAt === right.createdAt &&
      left.offset.x === right.offset.x && left.offset.y === right.offset.y && left.offset.z === right.offset.z &&
      moleculesEqual(left.molecule, right.molecule)
  })
}
