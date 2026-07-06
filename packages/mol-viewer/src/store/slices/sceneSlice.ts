/**
 * sceneSlice — 场景对象容器（objectsById / objectOrder / activeObjectId）+ 场景对象 action。
 *
 * store 拆分的根基：分子编辑 slice 通过 getActiveMol/patchActiveMol 落到这里的 objectsById。
 */

import type { StateCreator } from 'zustand'
import { shiftMolecule } from '../../lib/molecule'
import { createSceneObject } from '../../lib/sceneObject'
import { genId } from '../../lib/utils'
import type { MoleculeState, SceneSlice } from './types'
import { activateObjectWhere, computeAutoOffset } from './helpers'

/** 初始默认场景对象（空分子）。 */
export const defaultSceneObject = createSceneObject({ atoms: [], bonds: [], name: 'New Molecule' })

export const createSceneSlice: StateCreator<MoleculeState, [], [], SceneSlice> = (set, get) => ({
  objectsById:    { [defaultSceneObject.id]: defaultSceneObject },
  objectOrder:    [defaultSceneObject.id],
  activeObjectId: defaultSceneObject.id,

  addToScene: (mol, autoOffset = true) => {
    const newId = genId().slice(0, 8)
    set((s) => {
      let finalMol = mol
      if (autoOffset && s.objectOrder.length > 0) {
        const off = computeAutoOffset(Object.values(s.objectsById))
        finalMol = shiftMolecule(mol, off.x, off.y, off.z)
      }
      const newObj = { ...createSceneObject(finalMol), id: newId }
      return {
        objectsById: { ...s.objectsById, [newId]: newObj },
        objectOrder: [...s.objectOrder, newId],
        activeObjectId: newId,
        selectedAtomIds: new Set(),
        selectedBondIds: new Set(),
      }
    })
    return newId
  },

  setActiveObject: (id) => set((s) => {
    if (id === null) return { activeObjectId: null }
    if (!s.objectsById[id]) return {}
    return { activeObjectId: id, selectedAtomIds: new Set(), selectedBondIds: new Set() }
  }),

  removeSceneObject: (id) => set((s) => {
    const { [id]: _removed, ...rest } = s.objectsById
    const newOrder = s.objectOrder.filter(oid => oid !== id)
    if (id !== s.activeObjectId) return { objectsById: rest, objectOrder: newOrder }
    const newActiveId = newOrder.length > 0 ? newOrder[newOrder.length - 1] : null
    return {
      objectsById: rest, objectOrder: newOrder, activeObjectId: newActiveId,
      selectedAtomIds: new Set(), selectedBondIds: new Set(),
    }
  }),

  setObjectVisible: (id, visible) => set((s) => {
    if (!s.objectsById[id]) return {}
    return { objectsById: { ...s.objectsById, [id]: { ...s.objectsById[id], visible } } }
  }),

  setObjectLocked: (id, locked) => set((s) => {
    if (!s.objectsById[id]) return {}
    return { objectsById: { ...s.objectsById, [id]: { ...s.objectsById[id], locked } } }
  }),

  renameObject: (id, name) => set((s) => {
    if (!s.objectsById[id]) return {}
    return { objectsById: { ...s.objectsById, [id]: { ...s.objectsById[id], name } } }
  }),

  activateObjectContainingAtom: (atomId) =>
    activateObjectWhere(get(), obj => obj.molecule.atoms.some(a => a.id === atomId)),

  activateObjectContainingBond: (bondId) =>
    activateObjectWhere(get(), obj => obj.molecule.bonds.some(b => b.id === bondId)),
})
