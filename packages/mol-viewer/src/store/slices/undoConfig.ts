/**
 * undo 快照配置（zundo）
 *
 * 只有分子/场景数据进 undo 历史；选择、版本号等 UI 状态不进，
 * 否则每次点选都会产生一条历史记录，把 limit 吃光。
 *
 * 这些原语被 editSlice（beginTransaction/endTransaction）与 moleculeStore
 * 的组装层共享，独立成模块避免两者互相 import 形成环。
 */

import type { MoleculeState } from './types'

export const UNDO_LIMIT = 50

export type UndoSnapshot = Pick<MoleculeState, 'objectsById' | 'objectOrder' | 'activeObjectId'>

export function partializeForUndo(s: MoleculeState): UndoSnapshot {
  return {
    objectsById:    s.objectsById,
    objectOrder:    s.objectOrder,
    activeObjectId: s.activeObjectId,
  }
}

export function undoSnapshotEqual(a: UndoSnapshot, b: UndoSnapshot): boolean {
  return a.objectsById === b.objectsById &&
         a.objectOrder === b.objectOrder &&
         a.activeObjectId === b.activeObjectId
}
