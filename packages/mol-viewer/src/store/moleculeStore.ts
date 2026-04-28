import { create } from 'zustand'
import { temporal } from 'zundo'
import type { Atom, Bond, Molecule } from '@/lib/molecule'
import { inferBonds, newAtom, newBond, centerMolecule as centerMol, shiftMolecule } from '@/lib/molecule'
import { autoAddHydrogens, replaceAtomSymbol } from '@/lib/builder/BuilderEngine'
import type { MeasureStyle, MeasureType, Measurement, Tool, DisplayMode } from '@/lib/types'
import { DEFAULT_MEASURE_STYLE, MEASURE_ATOM_COUNT } from '@/lib/types'
import { resolveTheme, type ResolvedTheme } from '@/presets'
import { type SceneObject, createSceneObject } from '@/lib/sceneObject'

// 保持现有导入点向后兼容：外部依然可以从 store 里 import 这些
export type { DisplayMode, Tool, MeasureType, MeasureStyle, Measurement } from '@/lib/types'
export { DEFAULT_MEASURE_STYLE, MEASURE_ATOM_COUNT } from '@/lib/types'

// ── 导出 selector：替代已删除的 molecule 字段 ──────────────────────────────────
export function selectActiveMolecule(s: MoleculeState): Molecule | null {
  return s.activeObjectId ? (s.objectsById[s.activeObjectId]?.molecule ?? null) : null
}

// 返回活跃分子的便捷空值降级（许多旧调用期望非 null）
export function selectActiveMoleculeOrEmpty(s: MoleculeState): Molecule {
  return selectActiveMolecule(s) ?? { atoms: [], bonds: [], name: 'New Molecule' }
}

interface MoleculeState {
  // ── 场景数据（唯一真相）──────────────────────────────────────────────────
  objectsById: Record<string, SceneObject>
  objectOrder: string[]
  activeObjectId: string | null

  // ── 版本号（脏检测，不进 undo 历史）────────────────────────────────────────
  atomPositionVersion: number
  selectionVersion: number

  // ── 选择（隐式关联 activeObjectId）─────────────────────────────────────────
  selectedAtomIds: Set<string>
  selectedBondIds: Set<string>

  // ── 工具 / 显示 ────────────────────────────────────────────────────────────
  activeTool: Tool
  activeElement: string
  displayMode: DisplayMode
  bondingAtomId: string | null

  // ── 测量 ──────────────────────────────────────────────────────────────────
  measurements: Measurement[]
  measureType: MeasureType
  pendingAtomIds: string[]
  measureStyle: MeasureStyle
  showAtomLabels: boolean

  // ── 主题 ──────────────────────────────────────────────────────────────────
  themeId: string
  theme: ResolvedTheme

  // ── 分子编辑 actions ───────────────────────────────────────────────────────
  setMolecule: (mol: Molecule) => void
  addAtom: (symbol: string, x: number, y: number, z: number) => string
  removeAtom: (id: string) => void
  moveAtom: (id: string, x: number, y: number, z: number) => void
  setAtomPositions: (positions: ReadonlyMap<string, { x: number; y: number; z: number }>) => void
  beginTransaction: () => void
  endTransaction: () => void
  addBond: (atomId1: string, atomId2: string, order?: 1 | 2 | 3) => void
  removeBond: (id: string) => void
  cycleBondOrder: (id: string) => void
  selectAtom: (id: string, multi?: boolean) => void
  selectAtoms: (ids: Iterable<string>, mode?: 'replace' | 'add' | 'subtract') => void
  selectBond: (id: string, multi?: boolean) => void
  clearSelection: () => void
  setActiveTool: (tool: Tool) => void
  setActiveElement: (symbol: string) => void
  setDisplayMode: (mode: DisplayMode) => void
  setBondingAtom: (id: string | null) => void
  autoInferBonds: () => void
  addHydrogens: (atomId?: string) => void
  replaceAtom: (atomId: string, symbol: string) => void
  clearMolecule: () => void
  centerMolecule: () => void

  // ── 测量 actions ───────────────────────────────────────────────────────────
  addMeasureAtom: (id: string) => void
  commitPendingMeasure: () => void
  cancelPendingMeasure: () => void
  removeMeasurement: (id: string) => void
  clearMeasurements: () => void
  setMeasureType: (t: MeasureType) => void
  setMeasureStyle: (patch: Partial<MeasureStyle>) => void
  toggleAtomLabels: () => void
  setShowAtomLabels: (v: boolean) => void
  setTheme: (id: string) => void

  // ── 场景对象 actions ───────────────────────────────────────────────────────
  addToScene: (mol: Molecule, autoOffset?: boolean) => string
  setActiveObject: (id: string | null) => void
  removeSceneObject: (id: string) => void
  setObjectVisible: (id: string, visible: boolean) => void
  setObjectLocked: (id: string, locked: boolean) => void
  renameObject: (id: string, name: string) => void
}

// ── 内部工具函数 ───────────────────────────────────────────────────────────────

function getActiveMol(s: MoleculeState): Molecule | null {
  return s.activeObjectId ? (s.objectsById[s.activeObjectId]?.molecule ?? null) : null
}

/** 用新分子替换 activeObjectId 对应的 SceneObject.molecule，返回 partial state */
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
  for (const obj of objects) {
    for (const atom of obj.molecule.atoms) {
      if (atom.x > maxX) maxX = atom.x
    }
  }
  return { x: isFinite(maxX) ? maxX + 5 : 0, y: 0, z: 0 }
}

// ── 初始对象 ──────────────────────────────────────────────────────────────────

const defaultObj = createSceneObject({ atoms: [], bonds: [], name: 'New Molecule' })

// ── Store ─────────────────────────────────────────────────────────────────────

export const useMoleculeStore = create<MoleculeState>()(
  temporal(
    (set, get) => ({
      objectsById: { [defaultObj.id]: defaultObj },
      objectOrder: [defaultObj.id],
      activeObjectId: defaultObj.id,
      atomPositionVersion: 0,
      selectionVersion: 0,
      selectedAtomIds: new Set(),
      selectedBondIds: new Set(),
      activeTool: 'select',
      activeElement: 'C',
      displayMode: 'ball-stick',
      bondingAtomId: null,
      measurements: [],
      measureType: 'auto',
      pendingAtomIds: [],
      measureStyle: DEFAULT_MEASURE_STYLE,
      showAtomLabels: false,
      themeId: 'default',
      theme: resolveTheme('default'),

      setTheme: (id) => set({ themeId: id, theme: resolveTheme(id) }),

      setMolecule: (mol) => set((s) => {
        if (s.activeObjectId && s.objectsById[s.activeObjectId]) {
          return {
            ...patchActiveMol(s, mol),
            selectedAtomIds: new Set(),
            selectedBondIds: new Set(),
          }
        }
        // 无活跃对象：创建新的并设为活跃
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
          const newMol = { ...mol, atoms: [...mol.atoms, atom] }
          return patchActiveMol(s, newMol)
        })
        return atom.id
      },

      removeAtom: (id) => set((s) => {
        const mol = getActiveMol(s)
        if (!mol) return {}
        const newMol = {
          ...mol,
          atoms: mol.atoms.filter(a => a.id !== id),
          bonds: mol.bonds.filter(b => b.atomId1 !== id && b.atomId2 !== id),
        }
        return {
          ...patchActiveMol(s, newMol),
          selectedAtomIds: new Set([...s.selectedAtomIds].filter(i => i !== id)),
        }
      }),

      moveAtom: (id, x, y, z) => set((s) => {
        const mol = getActiveMol(s)
        if (!mol) return {}
        const newMol = { ...mol, atoms: mol.atoms.map(a => a.id === id ? { ...a, x, y, z } : a) }
        return { ...patchActiveMol(s, newMol), atomPositionVersion: s.atomPositionVersion + 1 }
      }),

      setAtomPositions: (positions) => set((s) => {
        const mol = getActiveMol(s)
        if (!mol) return {}
        const newMol = {
          ...mol,
          atoms: mol.atoms.map(a => {
            const p = positions.get(a.id)
            return p ? { ...a, x: p.x, y: p.y, z: p.z } : a
          }),
        }
        return { ...patchActiveMol(s, newMol), atomPositionVersion: s.atomPositionVersion + 1 }
      }),

      beginTransaction: () => useMoleculeStore.temporal.getState().pause(),
      endTransaction: () => useMoleculeStore.temporal.getState().resume(),

      addBond: (atomId1, atomId2, order = 1) => {
        const mol = getActiveMol(get())
        if (!mol) return
        const existing = mol.bonds.find(
          b => (b.atomId1 === atomId1 && b.atomId2 === atomId2) ||
               (b.atomId1 === atomId2 && b.atomId2 === atomId1)
        )
        if (existing) return
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
        const newMol = {
          ...mol,
          bonds: mol.bonds.map(b => {
            if (b.id !== id) return b
            const next = b.order === 1 ? 2 : b.order === 2 ? 3 : 1
            return { ...b, order: next as 1 | 2 | 3 }
          }),
        }
        return patchActiveMol(s, newMol)
      }),

      selectAtom: (id, multi = false) => set((s) => {
        if (multi) {
          const next = new Set(s.selectedAtomIds)
          next.has(id) ? next.delete(id) : next.add(id)
          return { selectedAtomIds: next, selectionVersion: s.selectionVersion + 1 }
        }
        return { selectedAtomIds: new Set([id]), selectedBondIds: new Set(), selectionVersion: s.selectionVersion + 1 }
      }),

      selectAtoms: (ids, mode = 'replace') => set((s) => {
        const incoming = new Set(ids)
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

      setActiveTool: (tool) => set({ activeTool: tool, bondingAtomId: null }),
      setActiveElement: (symbol) => set({ activeElement: symbol }),
      setDisplayMode: (mode) => set({ displayMode: mode }),
      setBondingAtom: (id) => set({ bondingAtomId: id }),

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

      // ── 测量 ────────────────────────────────────────────────────────────────

      addMeasureAtom: (id) => set((s) => {
        if (s.pendingAtomIds.includes(id)) {
          return { pendingAtomIds: s.pendingAtomIds.filter(i => i !== id) }
        }
        if (s.measureType === 'auto') {
          if (s.pendingAtomIds.length >= 4) {
            const committed: Measurement = {
              id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              type: 'dihedral',
              atomIds: s.pendingAtomIds.slice(0, 4),
            }
            return { measurements: [...s.measurements, committed], pendingAtomIds: [id] }
          }
          return { pendingAtomIds: [...s.pendingAtomIds, id] }
        }
        const required = MEASURE_ATOM_COUNT[s.measureType]
        const next = [...s.pendingAtomIds, id]
        if (next.length === required) {
          const m: Measurement = {
            id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: s.measureType,
            atomIds: next,
          }
          return { measurements: [...s.measurements, m], pendingAtomIds: [] }
        }
        return { pendingAtomIds: next }
      }),

      commitPendingMeasure: () => set((s) => {
        const len = s.pendingAtomIds.length
        if (len < 2) return { pendingAtomIds: [] }
        let type: MeasureType
        if (s.measureType === 'auto') {
          type = len === 2 ? 'distance' : len === 3 ? 'angle' : 'dihedral'
        } else {
          const required = MEASURE_ATOM_COUNT[s.measureType]
          if (len !== required) return { pendingAtomIds: [] }
          type = s.measureType
        }
        const m: Measurement = {
          id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type,
          atomIds: s.pendingAtomIds.slice(0, len > 4 ? 4 : len),
        }
        return { measurements: [...s.measurements, m], pendingAtomIds: [] }
      }),

      cancelPendingMeasure: () => set({ pendingAtomIds: [] }),
      removeMeasurement: (id) => set((s) => ({ measurements: s.measurements.filter(m => m.id !== id) })),
      clearMeasurements: () => set({ measurements: [], pendingAtomIds: [] }),
      setMeasureType: (t) => set({ measureType: t, pendingAtomIds: [] }),
      setMeasureStyle: (patch) => set((s) => ({ measureStyle: { ...s.measureStyle, ...patch } })),
      toggleAtomLabels: () => set((s) => ({ showAtomLabels: !s.showAtomLabels })),
      setShowAtomLabels: (v) => set({ showAtomLabels: v }),

      // ── 场景对象 ─────────────────────────────────────────────────────────────

      addToScene: (mol, autoOffset = true) => {
        const newId = crypto.randomUUID().slice(0, 8)
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
        const obj = s.objectsById[id]
        if (!obj) return {}
        return {
          activeObjectId: id,
          selectedAtomIds: new Set(),
          selectedBondIds: new Set(),
        }
      }),

      removeSceneObject: (id) => set((s) => {
        const { [id]: _removed, ...rest } = s.objectsById
        const newOrder = s.objectOrder.filter(oid => oid !== id)
        if (id !== s.activeObjectId) return { objectsById: rest, objectOrder: newOrder }
        const newActiveId = newOrder.length > 0 ? newOrder[newOrder.length - 1] : null
        return {
          objectsById: rest,
          objectOrder: newOrder,
          activeObjectId: newActiveId,
          selectedAtomIds: new Set(),
          selectedBondIds: new Set(),
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
    }),
    {
      limit: 50,
      partialize: (s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { measurements, measureType, pendingAtomIds, measureStyle, showAtomLabels, themeId, theme, atomPositionVersion, selectionVersion, ...rest } = s
        return rest as MoleculeState
      },
    }
  )
)
