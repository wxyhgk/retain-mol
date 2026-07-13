/**
 * moleculeStore — 分子数据 + 场景对象 + 选择状态
 *
 * 只存需要进入 undo 历史的数据。
 * 工具/显示/测量/主题 → editorStore。
 *
 * 状态按职责拆成三个 slice（sceneSlice / selectionSlice / editSlice），
 * 在此组装为单一 store。本文件保留跨 slice 的 undo/事务组装逻辑：
 * zundo temporal 配置、partialize/equality、undo/redo 后处理 afterTimeTravel。
 */

import { create, type StateCreator, type UseBoundStore, type StoreApi } from 'zustand'
import { temporal, type TemporalState } from 'zundo'
import { subscribeWithSelector } from 'zustand/middleware'
import type { MoleculeState } from './slices/types'
import { UNDO_LIMIT, partializeForUndo, undoSnapshotEqual, type UndoSnapshot } from './slices/undoConfig'
import { createSceneSlice } from './slices/sceneSlice'
import { createSelectionSlice } from './slices/selectionSlice'
import { createEditSlice } from './slices/editSlice'
import { runPruneSelectionCommand } from '../lib/builder/commands/selection'
import type { SelectorStoreApi } from './contracts/selectorStore'

// ── 对外 Selectors（保持导出面不变）─────────────────────────────────────────────
export { selectActiveMolecule, selectActiveMoleculeOrEmpty } from './slices/helpers'

export type MoleculeStoreApi = UseBoundStore<SelectorStoreApi<MoleculeState>> & {
  temporal: StoreApi<TemporalState<MoleculeState>>
}

// ── undo/redo 后处理 ────────────────────────────────────────────────────────────
/**
 * undo/redo 后处理：
 *  - 版本号不在快照里，手动 bump 让依赖它们的 overlay 重绘
 *  - 选择不在快照里，剔除指向已不存在原子/键的 id
 * 这里的 setState 不会污染历史：快照字段引用未变，equality 会跳过记录。
 */
function afterTimeTravel(store: MoleculeStoreApi) {
  store.setState((s) => {
    const validAtoms = new Set<string>()
    const validBonds = new Set<string>()
    for (const obj of Object.values(s.objectsById)) {
      for (const a of obj.molecule.atoms) validAtoms.add(a.id)
      for (const b of obj.molecule.bonds) validBonds.add(b.id)
    }
    const selection = runPruneSelectionCommand(s.selectedAtomIds, s.selectedBondIds, validAtoms, validBonds)
    return {
      atomPositionVersion: s.atomPositionVersion + 1,
      ...(selection.selectionChanged
        ? {
            selectionVersion: s.selectionVersion + 1,
            selectedAtomIds: selection.selectedAtomIds,
            selectedBondIds: selection.selectedBondIds,
          }
        : {}),
    }
  })
}

// ── Store 组装 ──────────────────────────────────────────────────────────────────
// editSlice 的事务 action 需要 temporal store；用 getter 延迟到调用时读取
// useMoleculeStore.temporal（此时 store 已初始化），避免 slice 反向 import 形成环。

export function createMoleculeStore(): MoleculeStoreApi {
  let moleculeStore: MoleculeStoreApi
  const stateCreator: StateCreator<MoleculeState, [], []> = (set, get, store) => ({
    ...createSceneSlice(set, get, store),
    ...createSelectionSlice(set, get, store),
    ...createEditSlice(() => moleculeStore.temporal)(set, get, store),
  })

  moleculeStore = (create<MoleculeState>()(
    temporal(subscribeWithSelector(stateCreator) as unknown as StateCreator<MoleculeState>, {
    limit: UNDO_LIMIT,
    partialize: (s) => partializeForUndo(s) as MoleculeState,
    // 不配 equality 时 zundo 对每次 set 都无条件入栈（包括纯选择/版本号变更）
    equality: (a, b) => undoSnapshotEqual(a as UndoSnapshot, b as UndoSnapshot),
    wrapTemporal: (config) => (set, get, store) => {
      const state = config(set, get, store)
      return {
        ...state,
        undo: (steps?: number) => {
          if (!get().isTracking) return
          state.undo(steps)
          afterTimeTravel(moleculeStore)
        },
        redo: (steps?: number) => {
          if (!get().isTracking) return
          state.redo(steps)
          afterTimeTravel(moleculeStore)
        },
      }
    },
    }) as unknown as StateCreator<MoleculeState>,
  )) as unknown as MoleculeStoreApi
  return moleculeStore
}

/** 默认运行时兼容入口。新的多视口代码应通过 ViewerRuntime 获取实例 store。 */
export const useMoleculeStore = createMoleculeStore()

export const useMoleculeTemporal = useMoleculeStore.temporal as unknown as UseBoundStore<StoreApi<TemporalState<MoleculeState>>>
