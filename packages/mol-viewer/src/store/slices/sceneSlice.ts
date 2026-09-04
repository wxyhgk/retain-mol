/**
 * sceneSlice — 场景对象容器（objectsById / objectOrder / activeObjectId）+ 场景对象 action。
 *
 * store 拆分的根基：分子编辑 slice 通过 getActiveMol/patchActiveMol 落到这里的 objectsById。
 */

import type { StateCreator } from 'zustand'
import { createSceneObject } from '../../lib/sceneObject'
import { genId } from '../../lib/utils'
import type { MoleculeState, SceneSlice } from './types'
import type { GetTemporal } from './transactionController'
import {
  runAddSceneObjectCommand,
  runRemoveSceneObjectCommand,
  runRenameSceneObjectCommand,
  runSetActiveSceneObjectCommand,
  runSetSceneObjectLockedCommand,
  runSetSceneObjectVisibleCommand,
  runSplitSceneObjectCommand,
} from '../../lib/builder/commands/scene'
import {
  activateObjectWhere,
  applyActiveSceneObjectResult,
  applyAddSceneObjectResult,
  applySceneGraphResult,
  applySceneObjectUpdatedResult,
  getEditableObject,
} from './helpers'

/** 初始默认场景对象（空分子）。 */
export const defaultSceneObject = createSceneObject({ atoms: [], bonds: [], name: 'New Molecule' })

export function createSceneSlice(
  getTemporal: GetTemporal,
): StateCreator<MoleculeState, [], [], SceneSlice> {
  return (set, get) => {
  // Store factories must not share the default scene object or its nested molecule.
  const initialObject = createSceneObject({ atoms: [], bonds: [], name: 'New Molecule' })
  return {
  objectsById:    { [initialObject.id]: initialObject },
  objectOrder:    [initialObject.id],
  activeObjectId: initialObject.id,

  addToScene: (mol, autoOffset = true) => {
    const newId = genId().slice(0, 8)
    set((s) => {
      const result = runAddSceneObjectCommand(mol, Object.values(s.objectsById), {
        objectId: newId,
        autoOffset,
      })
      return applyAddSceneObjectResult(s, result)
    })
    return newId
  },

  setActiveObject: (id) => {
    // 纯激活切换不入 undo 历史：activeObjectId 留在快照里是为了场景图操作
    // （remove/split 等）undo 的一致性，但"点另一分子的原子仅为选中"这类
    // 纯激活不该产生历史条目、也不该冲掉 redo 分支。已暂停（事务中）时
    // 保持暂停不动，激活变更并入事务自身的快照处理。
    const temporal = getTemporal().getState()
    const wasTracking = temporal.isTracking
    if (wasTracking) temporal.pause()
    try {
      set((s) => {
        const result = runSetActiveSceneObjectCommand(s.objectsById, s.activeObjectId, id)
        return applyActiveSceneObjectResult(s, result)
      })
    } finally {
      if (wasTracking) temporal.resume()
    }
  },

  removeSceneObject: (id) => set((s) => {
    const result = runRemoveSceneObjectCommand(s.objectsById, s.objectOrder, s.activeObjectId, id)
    return applySceneGraphResult(s, result)
  }),

  splitSceneObject: (id) => set((s) => {
    const object = getEditableObject(s, id)
    if (!object) return {}
    const maxNewObjectIds = Math.max(1, object.molecule.atoms.length)
    const newObjectIds = Array.from({ length: maxNewObjectIds }, () => genId().slice(0, 8))
    const result = runSplitSceneObjectCommand(s.objectsById, s.objectOrder, id, newObjectIds)
    return applySceneGraphResult(s, result)
  }),

  setObjectVisible: (id, visible) => set((s) => {
    const result = runSetSceneObjectVisibleCommand(s.objectsById, id, visible)
    return applySceneObjectUpdatedResult(s, result)
  }),

  setObjectLocked: (id, locked) => set((s) => {
    const result = runSetSceneObjectLockedCommand(s.objectsById, id, locked)
    return applySceneObjectUpdatedResult(s, result)
  }),

  renameObject: (id, name) => set((s) => {
    const result = runRenameSceneObjectCommand(s.objectsById, id, name)
    return applySceneObjectUpdatedResult(s, result)
  }),

  activateObjectContainingAtom: (atomId) =>
    activateObjectWhere(get(), obj => obj.molecule.atoms.some(a => a.id === atomId)),

  activateObjectContainingBond: (bondId) =>
    activateObjectWhere(get(), obj => obj.molecule.bonds.some(b => b.id === bondId)),
  }
  }
}
