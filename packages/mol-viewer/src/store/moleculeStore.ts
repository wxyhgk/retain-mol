/**
 * moleculeStore — 分子数据 + 场景对象 + 选择状态
 *
 * 只存需要进入 undo 历史的数据。
 * 工具/显示/测量/主题 → editorStore。
 */

import { create, type StateCreator, type UseBoundStore, type StoreApi } from 'zustand'
import { temporal, type TemporalState } from 'zundo'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Atom, Molecule } from '../lib/molecule'
import { inferBonds, newAtom, newBond, centerMolecule as centerMol, shiftMolecule } from '../lib/molecule'
import { autoAddHydrogens, replaceAtomSymbol } from '../lib/builder/BuilderEngine'
import { type SceneObject, createSceneObject } from '../lib/sceneObject'
import { genId } from '../lib/utils'

// ── Selectors ─────────────────────────────────────────────────────────────────

export function selectActiveMolecule(s: MoleculeState): Molecule | null {
  return s.activeObjectId ? (s.objectsById[s.activeObjectId]?.molecule ?? null) : null
}

export function selectActiveMoleculeOrEmpty(s: MoleculeState): Molecule {
  return selectActiveMolecule(s) ?? { atoms: [], bonds: [], name: 'New Molecule' }
}

// ── State 类型 ────────────────────────────────────────────────────────────────

interface MoleculeState {
  // ── 场景 ──────────────────────────────────────────────────────────────────
  objectsById:    Record<string, SceneObject>
  objectOrder:    string[]
  activeObjectId: string | null

  // ── 版本号（脏检测，不进 undo 历史）────────────────────────────────────────
  atomPositionVersion: number
  selectionVersion:    number

  // ── 选择 ──────────────────────────────────────────────────────────────────
  selectedAtomIds: Set<string>
  selectedBondIds: Set<string>

  // ── 分子编辑 ──────────────────────────────────────────────────────────────
  setMolecule:            (mol: Molecule) => void
  addAtom:                (symbol: string, x: number, y: number, z: number) => string
  removeAtom:             (id: string) => void
  moveAtom:               (id: string, x: number, y: number, z: number) => void
  setAtomPositions:       (positions: ReadonlyMap<string, { x: number; y: number; z: number }>) => void
  setObjectAtomPositions: (objectId: string, positions: ReadonlyMap<string, { x: number; y: number; z: number }>) => void
  beginTransaction:       () => void
  endTransaction:         () => void
  addBond:                (atomId1: string, atomId2: string, order?: 1 | 2 | 3) => void
  removeBond:             (id: string) => void
  cycleBondOrder:         (id: string) => void
  autoInferBonds:         () => void
  addHydrogens:           (atomId?: string) => void
  replaceAtom:            (atomId: string, symbol: string) => void
  clearMolecule:          () => void
  centerMolecule:         () => void

  // ── 选择 actions ──────────────────────────────────────────────────────────
  selectAtom:   (id: string, multi?: boolean) => void
  selectAtoms:  (ids: Iterable<string>, mode?: 'replace' | 'add' | 'subtract') => void
  selectBond:   (id: string, multi?: boolean) => void
  clearSelection: () => void

  // ── 场景对象 ──────────────────────────────────────────────────────────────
  addToScene:        (mol: Molecule, autoOffset?: boolean) => string
  setActiveObject:   (id: string | null) => void
  removeSceneObject: (id: string) => void
  setObjectVisible:  (id: string, visible: boolean) => void
  setObjectLocked:   (id: string, locked: boolean) => void
  renameObject:      (id: string, name: string) => void
}

type SelectorSubscribe<T> = {
  subscribe: {
    (listener: (state: T, prevState: T) => void): () => void
    <U>(
      selector: (state: T) => U,
      listener: (selected: U, previous: U) => void,
      options?: { equalityFn?: (a: U, b: U) => boolean; fireImmediately?: boolean },
    ): () => void
  }
}

type MoleculeStoreApi = UseBoundStore<StoreApi<MoleculeState> & SelectorSubscribe<MoleculeState>> & {
  temporal: StoreApi<TemporalState<MoleculeState>>
}

// ── 内部工具 ──────────────────────────────────────────────────────────────────

function getActiveMol(s: MoleculeState): Molecule | null {
  return s.activeObjectId ? (s.objectsById[s.activeObjectId]?.molecule ?? null) : null
}

function patchActiveMol(s: MoleculeState, newMol: Molecule): Partial<MoleculeState> {
  if (!s.activeObjectId) return {}
  const obj = s.objectsById[s.activeObjectId]
  if (!obj) return {}
  return {
    objectsById: {
      ...s.objectsById,
      [s.activeObjectId]: { ...obj, molecule: newMol, name: newMol.name ?? obj.name },
    },
  }
}

function computeAutoOffset(objects: SceneObject[]): { x: number; y: number; z: number } {
  let maxX = -Infinity
  for (const obj of objects)
    for (const atom of obj.molecule.atoms)
      if (atom.x > maxX) maxX = atom.x
  return { x: isFinite(maxX) ? maxX + 5 : 0, y: 0, z: 0 }
}

// ── 初始状态 ──────────────────────────────────────────────────────────────────

const defaultObj = createSceneObject({ atoms: [], bonds: [], name: 'New Molecule' })

// ── Store ─────────────────────────────────────────────────────────────────────

const stateCreator: StateCreator<MoleculeState, [], []> = (set, get) => ({
  objectsById:         { [defaultObj.id]: defaultObj },
  objectOrder:         [defaultObj.id],
  activeObjectId:      defaultObj.id,
  atomPositionVersion: 0,
  selectionVersion:    0,
  selectedAtomIds:     new Set(),
  selectedBondIds:     new Set(),

  // ── 分子编辑 ────────────────────────────────────────────────────────────────

  setMolecule: (mol) => set((s) => {
    if (s.activeObjectId && s.objectsById[s.activeObjectId]) {
      return { ...patchActiveMol(s, mol), selectedAtomIds: new Set(), selectedBondIds: new Set() }
    }
    const newObj = createSceneObject(mol)
    return {
      objectsById: { [newObj.id]: newObj },
      objectOrder: [newObj.id],
      activeObjectId: newObj.id,
      selectedAtomIds: new Set(),
      selectedBondIds: new Set(),
    }
  }),

  addAtom: (symbol, x, y, z) => {
    const atom = newAtom(symbol, x, y, z)
    set((s) => {
      const mol = getActiveMol(s)
      if (!mol) return {}
      return patchActiveMol(s, { ...mol, atoms: [...mol.atoms, atom] })
    })
    return atom.id
  },

  removeAtom: (id) => set((s) => {
    const mol = getActiveMol(s)
    if (!mol) return {}
    return {
      ...patchActiveMol(s, {
        ...mol,
        atoms: mol.atoms.filter(a => a.id !== id),
        bonds: mol.bonds.filter(b => b.atomId1 !== id && b.atomId2 !== id),
      }),
      selectedAtomIds: new Set([...s.selectedAtomIds].filter(i => i !== id)),
    }
  }),

  moveAtom: (id, x, y, z) => set((s) => {
    const mol = getActiveMol(s)
    if (!mol) return {}
    return {
      ...patchActiveMol(s, { ...mol, atoms: mol.atoms.map(a => a.id === id ? { ...a, x, y, z } : a) }),
      atomPositionVersion: s.atomPositionVersion + 1,
    }
  }),

  setAtomPositions: (positions) => set((s) => {
    const mol = getActiveMol(s)
    if (!mol) return {}
    return {
      ...patchActiveMol(s, {
        ...mol,
        atoms: mol.atoms.map(a => { const p = positions.get(a.id); return p ? { ...a, ...p } : a }),
      }),
      atomPositionVersion: s.atomPositionVersion + 1,
    }
  }),

  setObjectAtomPositions: (objectId, positions) => set((s) => {
    const obj = s.objectsById[objectId]
    if (!obj) return {}
    const newMol = {
      ...obj.molecule,
      atoms: obj.molecule.atoms.map(a => { const p = positions.get(a.id); return p ? { ...a, ...p } : a }),
    }
    return {
      objectsById: { ...s.objectsById, [objectId]: { ...obj, molecule: newMol, name: newMol.name ?? obj.name } },
      atomPositionVersion: s.atomPositionVersion + 1,
    }
  }),

  beginTransaction: () => useMoleculeStore.temporal.getState().pause(),
  endTransaction:   () => useMoleculeStore.temporal.getState().resume(),

  addBond: (atomId1, atomId2, order: 1 | 2 | 3 = 1) => {
    const mol = getActiveMol(get())
    if (!mol) return
    const exists = mol.bonds.find(
      b => (b.atomId1 === atomId1 && b.atomId2 === atomId2) ||
           (b.atomId1 === atomId2 && b.atomId2 === atomId1)
    )
    if (exists) return
    const bond = newBond(atomId1, atomId2, order)
    set((s) => {
      const m = getActiveMol(s)
      if (!m) return {}
      return patchActiveMol(s, { ...m, bonds: [...m.bonds, bond] })
    })
  },

  removeBond: (id) => set((s) => {
    const mol = getActiveMol(s)
    if (!mol) return {}
    return {
      ...patchActiveMol(s, { ...mol, bonds: mol.bonds.filter(b => b.id !== id) }),
      selectedBondIds: new Set([...s.selectedBondIds].filter(i => i !== id)),
    }
  }),

  cycleBondOrder: (id) => set((s) => {
    const mol = getActiveMol(s)
    if (!mol) return {}
    return patchActiveMol(s, {
      ...mol,
      bonds: mol.bonds.map(b => {
        if (b.id !== id) return b
        const next = b.order === 1 ? 2 : b.order === 2 ? 3 : 1
        return { ...b, order: next as 1 | 2 | 3 }
      }),
    })
  }),

  autoInferBonds: () => set((s) => {
    const mol = getActiveMol(s)
    if (!mol) return {}
    return patchActiveMol(s, { ...mol, bonds: inferBonds(mol.atoms) })
  }),

  addHydrogens: (atomId) => set((s) => {
    const mol = getActiveMol(s)
    if (!mol) return {}
    return patchActiveMol(s, autoAddHydrogens(mol, atomId))
  }),

  replaceAtom: (atomId, symbol) => set((s) => {
    const mol = getActiveMol(s)
    if (!mol) return {}
    return patchActiveMol(s, replaceAtomSymbol(mol, atomId, symbol))
  }),

  clearMolecule: () => set((s) => ({
    ...patchActiveMol(s, { atoms: [], bonds: [], name: 'New Molecule' }),
    selectedAtomIds: new Set(),
    selectedBondIds: new Set(),
  })),

  centerMolecule: () => set((s) => {
    const mol = getActiveMol(s)
    if (!mol) return {}
    return patchActiveMol(s, centerMol(mol))
  }),

  // ── 选择 ────────────────────────────────────────────────────────────────────

  selectAtom: (id, multi = false) => set((s) => {
    if (multi) {
      const next = new Set(s.selectedAtomIds)
      next.has(id) ? next.delete(id) : next.add(id)
      return { selectedAtomIds: next, selectionVersion: s.selectionVersion + 1 }
    }
    return { selectedAtomIds: new Set([id]), selectedBondIds: new Set(), selectionVersion: s.selectionVersion + 1 }
  }),

  selectAtoms: (ids, mode = 'replace') => set((s) => {
    const incoming = new Set<string>(ids)
    if (mode === 'replace') return { selectedAtomIds: incoming, selectedBondIds: new Set(), selectionVersion: s.selectionVersion + 1 }
    const next = new Set(s.selectedAtomIds)
    if (mode === 'add') incoming.forEach(id => next.add(id))
    else incoming.forEach(id => next.delete(id))
    return { selectedAtomIds: next, selectionVersion: s.selectionVersion + 1 }
  }),

  selectBond: (id, multi = false) => set((s) => {
    if (multi) {
      const next = new Set(s.selectedBondIds)
      next.has(id) ? next.delete(id) : next.add(id)
      return { selectedBondIds: next, selectionVersion: s.selectionVersion + 1 }
    }
    return { selectedBondIds: new Set([id]), selectedAtomIds: new Set(), selectionVersion: s.selectionVersion + 1 }
  }),

  clearSelection: () => set((s) => ({
    selectedAtomIds: new Set(),
    selectedBondIds: new Set(),
    selectionVersion: s.selectionVersion + 1,
  })),

  // ── 场景对象 ────────────────────────────────────────────────────────────────

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

  setObjectVisible:  (id, visible) => set((s) => {
    if (!s.objectsById[id]) return {}
    return { objectsById: { ...s.objectsById, [id]: { ...s.objectsById[id], visible } } }
  }),

  setObjectLocked:   (id, locked) => set((s) => {
    if (!s.objectsById[id]) return {}
    return { objectsById: { ...s.objectsById, [id]: { ...s.objectsById[id], locked } } }
  }),

  renameObject: (id, name) => set((s) => {
    if (!s.objectsById[id]) return {}
    return { objectsById: { ...s.objectsById, [id]: { ...s.objectsById[id], name } } }
  }),
})

export const useMoleculeStore = (create<MoleculeState>()(
  temporal(subscribeWithSelector(stateCreator) as unknown as StateCreator<MoleculeState>, {
    limit: 50,
    partialize: (s) => {
      // 版本号不进 undo 历史
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { atomPositionVersion, selectionVersion, ...rest } = s
      return rest as MoleculeState
    },
  }) as unknown as StateCreator<MoleculeState>,
)) as unknown as MoleculeStoreApi

export const useMoleculeTemporal = useMoleculeStore.temporal as unknown as UseBoundStore<StoreApi<TemporalState<MoleculeState>>>
