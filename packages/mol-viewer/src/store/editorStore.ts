/**
 * editorStore — 编辑器 UI 状态
 *
 * 只存"当前用户在做什么"——工具、元素、显示选项、测量、主题。
 * 这些都不需要进入 undo 历史，因此用普通 Zustand store，不包 zundo。
 *
 * 分子数据、场景对象、选择状态 → 在 moleculeStore。
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Tool, DisplayMode, MeasureType, MeasureStyle, Measurement } from '../lib/types'
import { DEFAULT_MEASURE_STYLE, MEASURE_ATOM_COUNT } from '../lib/types'
import { resolveTheme, type ResolvedTheme } from '../presets'

export type { Tool, DisplayMode, MeasureType, MeasureStyle, Measurement }
export { DEFAULT_MEASURE_STYLE, MEASURE_ATOM_COUNT }

interface EditorState {
  // ── 工具 ──────────────────────────────────────────────────────────────────
  activeTool:    Tool
  activeElement: string
  bondingAtomId: string | null

  // ── 显示选项 ──────────────────────────────────────────────────────────────
  displayMode:    DisplayMode
  showAtomLabels: boolean
  themeId:        string
  theme:          ResolvedTheme

  // ── 测量 ──────────────────────────────────────────────────────────────────
  measurements:   Measurement[]
  measureType:    MeasureType
  pendingAtomIds: string[]
  measureStyle:   MeasureStyle

  // ── actions ───────────────────────────────────────────────────────────────
  setActiveTool:    (tool: Tool) => void
  setActiveElement: (symbol: string) => void
  setBondingAtom:   (id: string | null) => void

  setDisplayMode:    (mode: DisplayMode) => void
  setShowAtomLabels: (v: boolean) => void
  toggleAtomLabels:  () => void
  setTheme:          (id: string) => void

  addMeasureAtom:        (id: string) => void
  commitPendingMeasure:  () => void
  cancelPendingMeasure:  () => void
  removeMeasurement:     (id: string) => void
  clearMeasurements:     () => void
  setMeasureType:        (t: MeasureType) => void
  setMeasureStyle:       (patch: Partial<MeasureStyle>) => void
}

export const useEditorStore = create<EditorState>()(subscribeWithSelector(set => ({
  activeTool:    'select',
  activeElement: 'C',
  bondingAtomId: null,

  displayMode:    'ball-stick',
  showAtomLabels: false,
  themeId:        'default',
  theme:          resolveTheme('default'),

  measurements:   [],
  measureType:    'auto',
  pendingAtomIds: [],
  measureStyle:   DEFAULT_MEASURE_STYLE,

  setActiveTool:    (tool) => set({ activeTool: tool, bondingAtomId: null }),
  setActiveElement: (symbol) => set({ activeElement: symbol }),
  setBondingAtom:   (id) => set({ bondingAtomId: id }),

  setDisplayMode:    (mode) => set({ displayMode: mode }),
  setShowAtomLabels: (v) => set({ showAtomLabels: v }),
  toggleAtomLabels:  () => set(s => ({ showAtomLabels: !s.showAtomLabels })),
  setTheme:          (id) => set({ themeId: id, theme: resolveTheme(id) }),

  addMeasureAtom: (id) => set(s => {
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

  commitPendingMeasure: () => set(s => {
    const len = s.pendingAtomIds.length
    if (len < 2) return { pendingAtomIds: [] }
    let type: MeasureType
    if (s.measureType === 'auto') {
      type = len === 2 ? 'distance' : len === 3 ? 'angle' : 'dihedral'
    } else {
      if (len !== MEASURE_ATOM_COUNT[s.measureType]) return { pendingAtomIds: [] }
      type = s.measureType
    }
    const m: Measurement = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      atomIds: s.pendingAtomIds.slice(0, Math.min(len, 4)),
    }
    return { measurements: [...s.measurements, m], pendingAtomIds: [] }
  }),

  cancelPendingMeasure: () => set({ pendingAtomIds: [] }),
  removeMeasurement:    (id) => set(s => ({ measurements: s.measurements.filter(m => m.id !== id) })),
  clearMeasurements:    () => set({ measurements: [], pendingAtomIds: [] }),
  setMeasureType:       (t) => set({ measureType: t, pendingAtomIds: [] }),
  setMeasureStyle:      (patch) => set(s => ({ measureStyle: { ...s.measureStyle, ...patch } })),
})))
