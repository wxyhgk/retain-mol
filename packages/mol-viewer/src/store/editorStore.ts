/**
 * editorStore — 编辑器 UI 状态
 *
 * 只存"当前用户在做什么"——工具、元素、显示选项、测量、主题。
 * 这些都不需要进入 undo 历史，因此用普通 Zustand store，不包 zundo。
 *
 * 分子数据、场景对象、选择状态 → 在 moleculeStore。
 */

import { create, type StoreApi, type UseBoundStore } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Tool, DisplayMode, MeasureType, MeasureStyle, Measurement, MolClipboard } from '../lib/types'
import { DEFAULT_MEASURE_STYLE, MEASURE_ATOM_COUNT } from '../lib/types'
import { resolveTheme, type ResolvedTheme } from '../presets'
import { resolveStylePreset, type RenderStyle } from '../styles'
import { registerEditorIntegrity } from './integrity'
import { useMoleculeStore, type MoleculeStoreApi } from './moleculeStore'

export type { Tool, DisplayMode, MeasureType, MeasureStyle, Measurement, MolClipboard }
export { DEFAULT_MEASURE_STYLE, MEASURE_ATOM_COUNT }

export interface EditorState {
  // ── 工具 ──────────────────────────────────────────────────────────────────
  activeTool:    Tool
  activeElement: string
  /** 原子元素点击语义：grow = 点 H 生长；replace = 点到哪个原子就替换哪个原子 */
  atomClickMode: 'grow' | 'replace'
  /** 片段笔刷（苯环等）；非空时优先于 activeElement */
  activeFragmentId: string | null
  /**
   * 笔刷武装态：显式的「构建 / 选择」模式开关，消除同一次点击既可能选择
   * 又可能编辑的歧义。true = 构建态（点 H 生长、单击空白放置、拖 H 成键）；
   * false = 选择态（点击只做选择，任何点击都不产生编辑）。
   * 选元素/片段自动武装；Esc 或选择工具按钮解除。
   */
  brushArmed: boolean
  bondingAtomId: string | null

  // ── 显示选项 ──────────────────────────────────────────────────────────────
  stylePresetId:  string
  displayMode:    DisplayMode
  renderStyle:    RenderStyle
  showAtomLabels: boolean
  themeId:        string
  theme:          ResolvedTheme

  // ── 剪贴板 ────────────────────────────────────────────────────────────────
  clipboard: MolClipboard | null

  // ── 测量 ──────────────────────────────────────────────────────────────────
  measurements:   Measurement[]
  measureType:    MeasureType
  pendingAtomIds: string[]
  measureStyle:   MeasureStyle

  // ── 非阻断提示（替代 alert）───────────────────────────────────────────────
  hint: { text: string; seq: number } | null

  // ── 平面草图模式（pp 触发）────────────────────────────────────────────────
  // 非空时所有绘制（加原子/拖出生长/拖动原子）约束在该平面内（模型局部坐标）
  sketchPlane: { origin: [number, number, number]; normal: [number, number, number] } | null

  // ── actions ───────────────────────────────────────────────────────────────
  setActiveTool:     (tool: Tool) => void
  setActiveElement:  (symbol: string) => void
  setAtomClickMode:  (mode: 'grow' | 'replace') => void
  setActiveFragment: (id: string | null) => void
  /** 武装笔刷 → 构建态（与 disarmBrush 对称；避免用 setActiveElement(当前值) 的副作用 hack） */
  armBrush:          () => void
  /** 解除笔刷武装 → 纯选择态（Esc / 选择工具按钮） */
  disarmBrush:       () => void
  setBondingAtom:    (id: string | null) => void

  setDisplayMode:    (mode: DisplayMode) => void
  setRenderStyle:    (s: RenderStyle) => void
  setShowAtomLabels: (v: boolean) => void
  toggleAtomLabels:  () => void
  setTheme:          (id: string) => void
  setStylePreset:    (id: string) => void

  addMeasureAtom:        (id: string) => void
  commitPendingMeasure:  () => void
  cancelPendingMeasure:  () => void
  removeMeasurement:     (id: string) => void
  clearMeasurements:     () => void
  setMeasureType:        (t: MeasureType) => void
  setMeasureStyle:       (patch: Partial<MeasureStyle>) => void

  setClipboard: (c: MolClipboard | null) => void

  /** 在画布角落淡出显示一条提示（非阻断，替代 alert） */
  flashHint: (text: string) => void

  setSketchPlane: (p: { origin: [number, number, number]; normal: [number, number, number] } | null) => void
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

export type EditorStoreApi = UseBoundStore<StoreApi<EditorState> & SelectorSubscribe<EditorState>>

export function createEditorStore(moleculeStore: MoleculeStoreApi): EditorStoreApi {
  const editorStore = create<EditorState>()(subscribeWithSelector(set => ({
  activeTool:    'select',
  activeElement: 'C',
  atomClickMode: 'grow',
  activeFragmentId: 'c-sp3',
  brushArmed: true,     // 建模优先的应用：启动即武装 C 笔刷，可直接开始搭建
  bondingAtomId: null,

  stylePresetId:  'retainmol-default',
  displayMode:    'ball-stick',
  renderStyle:    'realistic',
  showAtomLabels: false,
  themeId:        'default',
  theme:          resolveTheme('default'),

  clipboard: null,

  measurements:   [],
  measureType:    'auto',
  pendingAtomIds: [],
  measureStyle:   DEFAULT_MEASURE_STYLE,

  hint: null,
  sketchPlane: null,

  setActiveTool:     (tool) => set({ activeTool: tool, bondingAtomId: null }),
  // 选元素清掉片段笔刷：两者互斥，同一时间只有一种"笔刷"；选择即武装
  setActiveElement:  (symbol) => set({ activeElement: symbol, activeFragmentId: null, brushArmed: true }),
  setAtomClickMode:  (atomClickMode) => set({ atomClickMode }),
  setActiveFragment: (id) => set({ activeFragmentId: id, brushArmed: id !== null }),
  // 只切换武装态，不动 activeElement / activeFragmentId：恢复上次的笔刷
  armBrush:          () => set({ brushArmed: true }),
  disarmBrush:       () => set({ brushArmed: false }),
  setBondingAtom:    (id) => set({ bondingAtomId: id }),

  setDisplayMode:    (mode) => set({ stylePresetId: 'custom', displayMode: mode }),
  setRenderStyle:    (renderStyle) => set((s) => ({
    stylePresetId: 'custom',
    renderStyle,
    ...(renderStyle === 'iboview' && s.themeId !== 'iboview'
      ? { themeId: 'iboview', theme: resolveTheme('iboview') }
      : {}),
  })),
  setShowAtomLabels: (v) => set({ stylePresetId: 'custom', showAtomLabels: v }),
  toggleAtomLabels:  () => set(s => ({ stylePresetId: 'custom', showAtomLabels: !s.showAtomLabels })),
  setTheme:          (id) => set((s) => ({
    stylePresetId: 'custom',
    themeId: id,
    theme: resolveTheme(id),
    ...(s.renderStyle === 'iboview' && id !== 'iboview' ? { renderStyle: 'realistic' } : {}),
  })),
  setStylePreset:    (id) => {
    const preset = resolveStylePreset(id)
    set((s) => ({
      stylePresetId: id,
      displayMode: preset.displayMode,
      renderStyle: preset.renderStyle,
      themeId: preset.themeId,
      theme: resolveTheme(preset.themeId),
      showAtomLabels: preset.showAtomLabels ?? s.showAtomLabels,
    }))
  },

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

  setClipboard: (c) => set({ clipboard: c }),

  flashHint: (text) => set(s => ({ hint: { text, seq: (s.hint?.seq ?? 0) + 1 } })),

  setSketchPlane: (p) => set({ sketchPlane: p }),
  }))) as EditorStoreApi

  registerEditorIntegrity(moleculeStore, editorStore)
  return editorStore
}

/** 默认运行时兼容入口。新的多视口代码应通过 ViewerRuntime 获取实例 store。 */
export const useEditorStore = createEditorStore(useMoleculeStore)

// 跨 store 完整性：原子删除后级联清理 measurements / pendingAtomIds / bondingAtomId
