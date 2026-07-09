/**
 * sceneSlice — 场景对象容器（objectsById / objectOrder / activeObjectId）+ 场景对象 action。
 *
 * store 拆分的根基：分子编辑 slice 通过 getActiveMol/patchActiveMol 落到这里的 objectsById。
 */

import type { StateCreator } from 'zustand'
import { createSceneObject } from '../../lib/sceneObject'
import { genId } from '../../lib/utils'
import type { MoleculeState, SceneSlice } from './types'
import {
  runAddSceneObjectCommand,
  runRemoveSceneObjectCommand,
  runRenameSceneObjectCommand,
  runSetActiveSceneObjectCommand,
  runSetSceneObjectLockedCommand,
  runSetSceneObjectVisibleCommand,
  runSplitSceneObjectCommand,
} from '../../lib/builder/commands/sceneStoreCommands'
import {
  activateObjectWhere,
  applyActiveSceneObjectResult,
  applyAddSceneObjectResult,
  applySceneGraphResult,
  applySceneObjectUpdatedResult,
} from './helpers'

/** 初始默认场景对象（空分子）。 */
export const defaultSceneObject = createSceneObject({ atoms: [], bonds: [], name: 'New Molecule' })

export const createSceneSlice: StateCreator<MoleculeState, [], [], SceneSlice> = (set, get) => ({
  objectsById:    { [defaultSceneObject.id]: defaultSceneObject },
  objectOrder:    [defaultSceneObject.id],
  activeObjectId: defaultSceneObject.id,

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

  setActiveObject: (id) => set((s) => {
    const result = runSetActiveSceneObjectCommand(s.objectsById, s.activeObjectId, id)
    return applyActiveSceneObjectResult(s, result)
  }),

  removeSceneObject: (id) => set((s) => {
    const result = runRemoveSceneObjectCommand(s.objectsById, s.objectOrder, s.activeObjectId, id)
    return applySceneGraphResult(s, result)
  }),

  splitSceneObject: (id) => set((s) => {
    const object = s.objectsById[id]
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
})
