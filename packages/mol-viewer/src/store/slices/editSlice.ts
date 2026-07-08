/**
 * editSlice — 分子编辑 action（~25 个）+ atomPositionVersion。
 *
 * 所有编辑通过共享的 getActiveMol/patchActiveMol 落到 sceneSlice 的 objectsById，
 * 部分 action 连带清理 selectionSlice 的选择集（删原子/键、成键等）。
 *
 * 事务 action（beginTransaction/endTransaction）需要 zundo 的 temporal store，
 * 而 temporal 由组装层用 create()(temporal(...)) 产生——为避免 slice 反向 import
 * 组装好的 store 形成环，这里用工厂参数 getTemporal 注入 temporal 访问器。
 * begin/endTransaction 逻辑逐字搬自原实现，语义不变。
 */

import type { StateCreator } from 'zustand'
import type { StoreApi } from 'zustand'
import type { TemporalState } from 'zundo'
import type { Atom } from '../../lib/molecule'
import { inferBonds, newAtom, newBond, centerMolecule as centerMol } from '../../lib/molecule'
import { autoAddHydrogens, addOneHydrogen as addOneH, substituteAtomElement,
         growByReplacingH, bondByReplacingH, resaturateAtom,
         cycleBondLength as cycleBondLengthOp,
         setBondLength as setBondLengthOp,
         setBondAngle as setBondAngleOp,
         setDihedralAngle as setDihedralAngleOp } from '../../lib/builder/BuilderEngine'
import { minimizeGeometry } from '../../lib/io/molFormat'
import { bondsOf } from '../../lib/builder/graph'
import { createSceneObject } from '../../lib/sceneObject'
import { lookupBondLengthByOrder } from '../../config/geometry.config'
import type { MoleculeState, EditSlice } from './types'
import { getActiveMol, patchActiveMol, applyGeomEdit, selectActiveMoleculeOrEmpty, validateAddBond } from './helpers'
import { UNDO_LIMIT, partializeForUndo, undoSnapshotEqual, type UndoSnapshot } from './undoConfig'
import { PLACEMENT } from '../../config/interaction.config'

/** temporal store 访问器：组装层注入，指向 zundo 包裹产生的 temporal。 */
type GetTemporal = () => StoreApi<TemporalState<MoleculeState>>

export function createEditSlice(
  getTemporal: GetTemporal,
): StateCreator<MoleculeState, [], [], EditSlice> {
  let transactionDepth = 0

  return (set, get) => ({
    atomPositionVersion: 0,

    setMolecule: (mol) => set((s) => {
      if (s.activeObjectId && s.objectsById[s.activeObjectId]) {
        return {
          ...patchActiveMol(s, mol),
          selectedAtomIds: new Set(),
          selectedBondIds: new Set(),
          selectionVersion: s.selectionVersion + 1,
        }
      }
      const newObj = createSceneObject(mol)
      return {
        objectsById: { [newObj.id]: newObj },
        objectOrder: [newObj.id],
        activeObjectId: newObj.id,
        selectedAtomIds: new Set(),
        selectedBondIds: new Set(),
        selectionVersion: s.selectionVersion + 1,
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
        selectionVersion: s.selectionVersion + 1,
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
      if (transactionDepth > 0) {
        transactionDepth += 1
        return
      }
      const t = getTemporal()
      const past = [...(t.getState().pastStates as UndoSnapshot[]), partializeForUndo(get())]
      if (past.length > UNDO_LIMIT) past.shift()
      t.setState({ pastStates: past as TemporalState<MoleculeState>['pastStates'], futureStates: [] })
      t.getState().pause()
      transactionDepth = 1
    },
    endTransaction: () => {
      const t = getTemporal()
      if (transactionDepth <= 0) {
        t.getState().resume()
        return
      }
      transactionDepth -= 1
      if (transactionDepth > 0) return
      t.getState().resume()
      // 事务内没有实际变更时弹出起点快照，避免产生一步"什么都没发生"的 undo
      const past = t.getState().pastStates as UndoSnapshot[]
      const top = past[past.length - 1]
      if (top && undoSnapshotEqual(top, partializeForUndo(get()))) {
        t.setState({ pastStates: past.slice(0, -1) as TemporalState<MoleculeState>['pastStates'] })
      }
    },

    addBond: (atomId1, atomId2, order: 1 | 2 | 3 = 1) => {
      set((s) => {
        const m = getActiveMol(s)
        if (!m) return {}
        if (!validateAddBond(m, atomId1, atomId2, order).ok) return {}
        const bond = newBond(atomId1, atomId2, order)
        return patchActiveMol(s, { ...m, bonds: [...m.bonds, bond] })
      })
    },

    removeBond: (id) => set((s) => {
      const mol = getActiveMol(s)
      if (!mol) return {}
      return {
        ...patchActiveMol(s, { ...mol, bonds: mol.bonds.filter(b => b.id !== id) }),
        selectedBondIds: new Set([...s.selectedBondIds].filter(i => i !== id)),
        selectionVersion: s.selectionVersion + 1,
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

    cleanupGeometry: () => {
      const mol = getActiveMol(get())
      if (!mol) return { ok: false, reason: '没有活跃分子' }
      const result = minimizeGeometry(mol)
      if (!result.ok) return { ok: false, reason: result.reason }
      set((s) => ({
        ...patchActiveMol(s, result.molecule),
        atomPositionVersion: s.atomPositionVersion + 1,
      }))
      return { ok: true }
    },

    addOneHydrogen: (atomId) => set((s) => {
      const mol = getActiveMol(s)
      if (!mol) return {}
      return patchActiveMol(s, addOneH(mol, atomId))
    }),

    replaceAtom: (atomId, symbol) => set((s) => {
      const mol = getActiveMol(s)
      if (!mol) return {}
      // 纯元素替换：保留 id、坐标、已有键和显式 H；异常价态交给检查器提示。
      return patchActiveMol(s, substituteAtomElement(mol, atomId, symbol))
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
          selectionVersion: s.selectionVersion + 1,
        }
      })
      return { ok: true }
    },

    clearMolecule: () => set((s) => ({
      ...patchActiveMol(s, { atoms: [], bonds: [], name: 'New Molecule' }),
      selectedAtomIds: new Set(),
      selectedBondIds: new Set(),
      selectionVersion: s.selectionVersion + 1,
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
        const offsetX = isFinite(clipMinX) ? maxX + PLACEMENT.pasteOffsetX - clipMinX : PLACEMENT.pasteOffsetX

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
      try {
        selectedBondIds.forEach(id => removeBond(id))
        selectedAtomIds.forEach(id => removeAtom(id))
      } finally {
        endTransaction()
      }
    },
  })
}
