/**
 * editSlice — 分子编辑 action（~25 个）+ atomPositionVersion。
 *
 * 所有编辑通过 builder command 产出结果，再由共享 helper 落到 sceneSlice 的 objectsById；
 * 需要同步选择集的 action 使用 selection-aware command（删原子/键、成键等）。
 *
 * 事务 action（beginTransaction/endTransaction）需要 zundo 的 temporal store，
 * 而 temporal 由组装层用 create()(temporal(...)) 产生——为避免 slice 反向 import
 * 组装好的 store 形成环，这里用工厂参数 getTemporal 注入 temporal 访问器。
 * begin/endTransaction 逻辑逐字搬自原实现，语义不变。
 */

import type { StateCreator } from 'zustand'
import type { MoleculeState, EditSlice } from './types'
import {
  createUndoTransactionController,
  type GetTemporal,
} from './transactionController'
import { createGeometryEditActions } from './geometryEditActions'
import { createBondEditActions } from './bondEditActions'
import { createAtomEditActions } from './atomEditActions'
import { createMoleculeEditActions } from './moleculeEditActions'
import { createClipboardEditActions } from './clipboardEditActions'
import { createSelectionEditActions } from './selectionEditActions'

export function createEditSlice(
  getTemporal: GetTemporal,
): StateCreator<MoleculeState, [], [], EditSlice> {
  return (set, get) => {
    const transactions = createUndoTransactionController(getTemporal, get)

    return {
      atomPositionVersion: 0,

      beginTransaction: transactions.begin,
      endTransaction: transactions.end,
      ...createMoleculeEditActions({ get, set }),
      ...createAtomEditActions({ get, set }),
      ...createGeometryEditActions({ get, set }),
      ...createBondEditActions({ get, set }),
      ...createClipboardEditActions({ get, set }),
      ...createSelectionEditActions({ get, set }),
    }
  }
}
