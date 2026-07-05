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
import type { MolClipboard } from '../lib/types'
import { autoAddHydrogens, addOneHydrogen as addOneH, replaceAtomSymbol,
         growByReplacingH, bondByReplacingH, resaturateAtom,
         cycleBondLength as cycleBondLengthOp,
         setBondLength as setBondLengthOp,
         setBondAngle as setBondAngleOp,
         setDihedralAngle as setDihedralAngleOp,
         type GeomEditResult } from '../lib/builder/BuilderEngine'
import { bondsOf, findBond } from '../lib/builder/graph'
import { type SceneObject, createSceneObject } from '../lib/sceneObject'
import { lookupBondLengthByOrder } from '../config/geometry.config'
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
  cycleBondLength:        (id: string) => { ok: boolean; reason?: string; moved?: boolean }
  // GaussView 式几何参数编辑（按选择顺序传入原子 id）
  setBondLength:          (aId: string, bId: string, length: number) => { ok: boolean; reason?: string }
  setBondAngle:           (aId: string, bId: string, cId: string, deg: number) => { ok: boolean; reason?: string }
  setDihedralAngle:       (aId: string, bId: string, cId: string, dId: string, deg: number) => { ok: boolean; reason?: string }
  autoInferBonds:         () => void
  addHydrogens:           (atomId?: string) => void
  addOneHydrogen:         (atomId: string) => void
  replaceAtom:            (atomId: string, symbol: string) => void
  /** 设形式电荷并按新有效价态增删 H（N⁺→长第4个H、O⁻→掉一个H） */
  setAtomCharge:          (atomId: string, charge: number) => void
  /** 设未配对电子数（自由基）并按新有效价态增删 H */
  setAtomRadical:         (atomId: string, radical: number) => void
  growFromHydrogen:       (atomId: string, symbol: string) => void
  bondViaHydrogen:        (sourceHId: string, targetId: string) => { ok: boolean; reason?: string }
  clearMolecule:          () => void
  centerMolecule:         () => void
  pasteAtoms:             (clipboard: MolClipboard) => string[]
  /** 把当前选中原子（及两端都选中的键）序列化为剪贴板格式；无选中返回 null */
  copySelection:          () => MolClipboard | null
  /** 删除所有选中的原子和键（一步 undo）；无选中时为 no-op */
  removeSelected:         () => void

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

  /** 激活包含指定原子的场景对象；不可见或锁定的对象拒绝（返回 false）。
   *  多分子场景下所有编辑手势的统一入口守卫。 */
  activateObjectContainingAtom: (atomId: string) => boolean
  /** 同上，按键 id 定位 */
  activateObjectContainingBond: (bondId: string) => boolean
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

// ── undo 配置 ─────────────────────────────────────────────────────────────────
// 只有分子/场景数据进 undo 历史；选择、版本号等 UI 状态不进，
// 否则每次点选都会产生一条历史记录，把 limit 吃光。

const UNDO_LIMIT = 50

type UndoSnapshot = Pick<MoleculeState, 'objectsById' | 'objectOrder' | 'activeObjectId'>

function partializeForUndo(s: MoleculeState): UndoSnapshot {
  return {
    objectsById:    s.objectsById,
    objectOrder:    s.objectOrder,
    activeObjectId: s.activeObjectId,
  }
}

function undoSnapshotEqual(a: UndoSnapshot, b: UndoSnapshot): boolean {
  return a.objectsById === b.objectsById &&
         a.objectOrder === b.objectOrder &&
         a.activeObjectId === b.activeObjectId
}

/**
 * undo/redo 后处理：
 *  - 版本号不在快照里，手动 bump 让依赖它们的 overlay 重绘
 *  - 选择不在快照里，剔除指向已不存在原子/键的 id
 * 这里的 setState 不会污染历史：快照字段引用未变，equality 会跳过记录。
 */
function afterTimeTravel() {
  useMoleculeStore.setState((s) => {
    const validAtoms = new Set<string>()
    const validBonds = new Set<string>()
    for (const obj of Object.values(s.objectsById)) {
      for (const a of obj.molecule.atoms) validAtoms.add(a.id)
      for (const b of obj.molecule.bonds) validBonds.add(b.id)
    }
    return {
      atomPositionVersion: s.atomPositionVersion + 1,
      selectionVersion:    s.selectionVersion + 1,
      selectedAtomIds:     new Set([...s.selectedAtomIds].filter(id => validAtoms.has(id))),
      selectedBondIds:     new Set([...s.selectedBondIds].filter(id => validBonds.has(id))),
    }
  })
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

/** 几何参数编辑（键长/键角/二面角）的统一落盘：单次 set = 单步 undo，附带位置版本号自增 */
function applyGeomEdit(
  get: () => MoleculeState,
  set: (fn: (s: MoleculeState) => Partial<MoleculeState>) => void,
  edit: (mol: Molecule) => GeomEditResult,
): { ok: boolean; reason?: string } {
  const mol = getActiveMol(get())
  if (!mol) return { ok: false, reason: '没有活跃分子' }
  const result = edit(mol)
  if (!result.ok) return result
  set((s) => {
    const m = getActiveMol(s)
    if (!m) return {}
    return {
      ...patchActiveMol(s, result.molecule),
      atomPositionVersion: s.atomPositionVersion + 1,
    }
  })
  return { ok: true }
}

/**
 * activateObjectContainingAtom / activateObjectContainingBond 的共同实现：
 * 按 objectOrder 找到宿主对象后先做可编辑性守卫——不可见/锁定的对象拒绝激活，
 * 编辑手势不应"穿透"到用户看不见或已锁定的分子上。
 */
function activateObjectWhere(
  s: MoleculeState,
  contains: (obj: SceneObject) => boolean,
): boolean {
  for (const oid of s.objectOrder) {
    const obj = s.objectsById[oid]
    if (!obj || !contains(obj)) continue
    if (obj.visible === false || obj.locked === true) return false
    // set 是同步的：返回 true 时调用方立即读到新的 activeObjectId
    if (s.activeObjectId !== oid) s.setActiveObject(oid)
    return true
  }
  return false
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
    // 连带删除的键也要从选择集里清掉，避免残留指向已删除键的悬空 id
    const removedBondIds = new Set(bondsOf(mol.bonds, id).map(b => b.id))
    return {
      ...patchActiveMol(s, {
        ...mol,
        atoms: mol.atoms.filter(a => a.id !== id),
        bonds: mol.bonds.filter(b => !removedBondIds.has(b.id)),
      }),
      selectedAtomIds: new Set([...s.selectedAtomIds].filter(i => i !== id)),
      selectedBondIds: new Set([...s.selectedBondIds].filter(i => !removedBondIds.has(i))),
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

  // 事务：把一段连续变更（如拖动）合并为一步 undo。
  // zundo 的 pause 期间所有变更都不入栈，所以必须在 pause 前手动把
  // "事务起点"压入 pastStates，否则事务后 undo 会连带撤销上一步操作。
  beginTransaction: () => {
    const t = useMoleculeStore.temporal
    const past = [...(t.getState().pastStates as UndoSnapshot[]), partializeForUndo(get())]
    if (past.length > UNDO_LIMIT) past.shift()
    t.setState({ pastStates: past as TemporalState<MoleculeState>['pastStates'], futureStates: [] })
    t.getState().pause()
  },
  endTransaction: () => {
    const t = useMoleculeStore.temporal
    t.getState().resume()
    // 事务内没有实际变更时弹出起点快照，避免产生一步"什么都没发生"的 undo
    const past = t.getState().pastStates as UndoSnapshot[]
    const top = past[past.length - 1]
    if (top && undoSnapshotEqual(top, partializeForUndo(get()))) {
      t.setState({ pastStates: past.slice(0, -1) as TemporalState<MoleculeState>['pastStates'] })
    }
  },

  addBond: (atomId1, atomId2, order: 1 | 2 | 3 = 1) => {
    const mol = getActiveMol(get())
    if (!mol) return
    if (findBond(mol.bonds, atomId1, atomId2)) return
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
    const bond = mol.bonds.find(b => b.id === id)
    if (!bond) return {}
    const a1 = mol.atoms.find(a => a.id === bond.atomId1)
    const a2 = mol.atoms.find(a => a.id === bond.atomId2)
    if (!a1 || !a2) return {}
    // 只在该元素对存在标准键长的档位间循环（如 C–H 没有双/三键档位），
    // 与 bondOps.cycleBondLength 的档位过滤保持一致
    const orders = ([1, 2, 3] as const).filter(
      o => lookupBondLengthByOrder(a1.symbol, a2.symbol, o) !== null,
    )
    if (orders.length < 2) return {}
    const next = orders[(orders.indexOf(bond.order) + 1) % orders.length]
    return patchActiveMol(s, {
      ...mol,
      // 用户显式调整键级 = 覆盖导入的 aromatic 标记
      bonds: mol.bonds.map(b =>
        b.id === id ? { ...b, order: next, aromatic: undefined } : b),
    })
  }),

  cycleBondLength: (id) => {
    const mol = getActiveMol(get())
    if (!mol) return { ok: false, reason: '没有活跃分子' }
    const result = cycleBondLengthOp(mol, id)
    if (!result.ok) return result
    set((s) => {
      const m = getActiveMol(s)
      if (!m) return {}
      return {
        ...patchActiveMol(s, result.molecule),
        atomPositionVersion: s.atomPositionVersion + 1,
      }
    })
    return { ok: true, moved: result.moved }
  },

  setBondLength: (aId, bId, length) => applyGeomEdit(get, set,
    (mol) => setBondLengthOp(mol, aId, bId, length)),

  setBondAngle: (aId, bId, cId, deg) => applyGeomEdit(get, set,
    (mol) => setBondAngleOp(mol, aId, bId, cId, deg)),

  setDihedralAngle: (aId, bId, cId, dId, deg) => applyGeomEdit(get, set,
    (mol) => setDihedralAngleOp(mol, aId, bId, cId, dId, deg)),

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

  addOneHydrogen: (atomId) => set((s) => {
    const mol = getActiveMol(s)
    if (!mol) return {}
    return patchActiveMol(s, addOneH(mol, atomId))
  }),

  replaceAtom: (atomId, symbol) => set((s) => {
    const mol = getActiveMol(s)
    if (!mol) return {}
    return patchActiveMol(s, replaceAtomSymbol(mol, atomId, symbol))
  }),

  setAtomCharge: (atomId, charge) => set((s) => {
    const mol = getActiveMol(s)
    if (!mol || !mol.atoms.some(a => a.id === atomId)) return {}
    const withCharge = {
      ...mol,
      atoms: mol.atoms.map(a => a.id === atomId ? { ...a, charge: charge || undefined } : a),
    }
    return patchActiveMol(s, resaturateAtom(withCharge, atomId))
  }),

  setAtomRadical: (atomId, radical) => set((s) => {
    const mol = getActiveMol(s)
    if (!mol || !mol.atoms.some(a => a.id === atomId)) return {}
    const withRadical = {
      ...mol,
      atoms: mol.atoms.map(a => a.id === atomId ? { ...a, radical: radical || undefined } : a),
    }
    return patchActiveMol(s, resaturateAtom(withRadical, atomId))
  }),

  growFromHydrogen: (atomId, symbol) => set((s) => {
    const mol = getActiveMol(s)
    if (!mol) return {}
    return patchActiveMol(s, growByReplacingH(mol, atomId, symbol))
  }),

  bondViaHydrogen: (sourceHId, targetId) => {
    const mol = getActiveMol(get())
    if (!mol) return { ok: false, reason: '没有活跃分子' }
    const result = bondByReplacingH(mol, sourceHId, targetId)
    if (!result.ok) return result
    set((s) => {
      const m = getActiveMol(s)
      if (!m) return {}
      // 成键操作会删除 H 及其键：选择集只保留结果分子里仍存活的键
      const aliveBondIds = new Set(result.molecule.bonds.map(b => b.id))
      return {
        ...patchActiveMol(s, result.molecule),
        selectedAtomIds: new Set(
          [...s.selectedAtomIds].filter(i => i !== sourceHId && i !== targetId)
        ),
        selectedBondIds: new Set(
          [...s.selectedBondIds].filter(i => aliveBondIds.has(i))
        ),
      }
    })
    return { ok: true }
  },

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

  pasteAtoms: (clipboard) => {
    const newIds: string[] = []
    set((s) => {
      const mol = getActiveMol(s)
      if (!mol) return {}

      // 偏移：粘贴在现有分子最右侧原子右边 3Å
      let maxX = mol.atoms.reduce((m, a) => Math.max(m, a.x), -Infinity)
      if (!isFinite(maxX)) maxX = 0
      const clipMinX = clipboard.atoms.reduce((m, a) => Math.min(m, a.x), Infinity)
      const offsetX = isFinite(clipMinX) ? maxX + 3 - clipMinX : 3

      const newAtoms: Atom[] = clipboard.atoms.map(ca => {
        const a = newAtom(ca.symbol, ca.x + offsetX, ca.y, ca.z)
        newIds.push(a.id)
        return a
      })

      const newBonds = clipboard.bonds.map(cb =>
        newBond(newAtoms[cb.a].id, newAtoms[cb.b].id, cb.order)
      )

      return patchActiveMol(s, {
        ...mol,
        atoms: [...mol.atoms, ...newAtoms],
        bonds: [...mol.bonds, ...newBonds],
      })
    })
    return newIds
  },

  copySelection: () => {
    const s = get()
    const mol = selectActiveMoleculeOrEmpty(s)
    const { selectedAtomIds } = s
    if (selectedAtomIds.size === 0) return null
    const selAtoms = mol.atoms.filter(a => selectedAtomIds.has(a.id))
    const idxMap = new Map(selAtoms.map((a, i) => [a.id, i] as const))
    const selBonds = mol.bonds.filter(b => idxMap.has(b.atomId1) && idxMap.has(b.atomId2))
    return {
      atoms: selAtoms.map(a => ({ symbol: a.symbol, x: a.x, y: a.y, z: a.z })),
      bonds: selBonds.map(b => ({ a: idxMap.get(b.atomId1)!, b: idxMap.get(b.atomId2)!, order: b.order, aromatic: b.aromatic })),
    }
  },

  removeSelected: () => {
    const { selectedAtomIds, selectedBondIds, removeAtom, removeBond, beginTransaction, endTransaction } = get()
    if (selectedAtomIds.size === 0 && selectedBondIds.size === 0) return
    beginTransaction()
    selectedBondIds.forEach(id => removeBond(id))
    selectedAtomIds.forEach(id => removeAtom(id))
    endTransaction()
  },

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

  activateObjectContainingAtom: (atomId) =>
    activateObjectWhere(get(), obj => obj.molecule.atoms.some(a => a.id === atomId)),

  activateObjectContainingBond: (bondId) =>
    activateObjectWhere(get(), obj => obj.molecule.bonds.some(b => b.id === bondId)),
})

export const useMoleculeStore = (create<MoleculeState>()(
  temporal(subscribeWithSelector(stateCreator) as unknown as StateCreator<MoleculeState>, {
    limit: UNDO_LIMIT,
    partialize: (s) => partializeForUndo(s) as MoleculeState,
    // 不配 equality 时 zundo 对每次 set 都无条件入栈（包括纯选择/版本号变更）
    equality: (a, b) => undoSnapshotEqual(a as UndoSnapshot, b as UndoSnapshot),
    wrapTemporal: (config) => (set, get, store) => {
      const state = config(set, get, store)
      return {
        ...state,
        undo: (steps?: number) => { state.undo(steps); afterTimeTravel() },
        redo: (steps?: number) => { state.redo(steps); afterTimeTravel() },
      }
    },
  }) as unknown as StateCreator<MoleculeState>,
)) as unknown as MoleculeStoreApi

export const useMoleculeTemporal = useMoleculeStore.temporal as unknown as UseBoundStore<StoreApi<TemporalState<MoleculeState>>>
