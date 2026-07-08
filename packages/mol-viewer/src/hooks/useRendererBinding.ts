/**
 * useRendererBinding — 渲染器与 store/props 的绑定层
 *
 * 职责：
 *   - 渲染器生命周期（init / dispose）
 *   - 事件处理器绑定（工具切换时更新）
 *   - 主题 / 场景 / 相机 / 测量 / ghost 线同步
 *   - ResizeObserver
 */

import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { MolRenderer } from '../lib/molRenderer'
import { useMoleculeStore } from '../store/moleculeStore'
import type { Atom } from '../lib/molecule'
import { resolveTheme, type ResolvedTheme } from '../presets'
import type { RenderStyle } from '../styles'
import type { DisplayMode } from '../lib/types'
import type { SceneObject } from '../lib/sceneObject'
import type { Measurement, MeasureStyle } from '../lib/types'
import type { BuilderHandlers } from './useBuilder'
import { toolCan } from '../config/toolCapabilities.config'

interface RendererBindingOptions {
  containerRef:   RefObject<HTMLDivElement | null>
  rendererRef:    RefObject<MolRenderer | null>
  canvasRef:      RefObject<HTMLCanvasElement | null>

  // store 状态（由 MolViewer 传入，避免 hook 重复订阅）
  readOnly:       boolean
  activeTool:     string
  sceneObjects:   SceneObject[]
  activeObjectId: string | null
  selectedAtomIds: Set<string>
  selectedBondIds: Set<string>
  displayMode:    DisplayMode
  renderStyle:    RenderStyle
  theme:          ResolvedTheme
  measurements:   Measurement[]
  pendingAtomIds: string[]
  measureStyle:   MeasureStyle
  sketchPlane:    { origin: [number, number, number]; normal: [number, number, number] } | null

  handlers: BuilderHandlers

  /** 渲染器创建/销毁通知（用于把 renderer 同步进 React state 供 overlay 使用） */
  onRendererChange?: (r: MolRenderer | null) => void
}

export function useRendererBinding({
  containerRef, rendererRef, canvasRef,
  readOnly, activeTool,
  sceneObjects, activeObjectId,
  selectedAtomIds, selectedBondIds,
  displayMode, renderStyle, theme,
  measurements, pendingAtomIds, measureStyle, sketchPlane,
  handlers,
  onRendererChange,
}: RendererBindingOptions) {

  const {
    onAtomClick, onAtomDoubleClick, onBondClick, onBackgroundClick, onBackgroundDoubleClick,
    onAtomDragStart, onAtomDrag, onAtomDragEnd,
    onBondDragStart, onBondDragEnd, getGrowPreview, getGrowGuide,
  } = handlers

  const prevMolNameRef  = useRef<string | undefined>(undefined)
  const prevActiveIdRef = useRef<string>(activeObjectId ?? '')
  const prevRenderStyleRef = useRef<RenderStyle>(renderStyle)
  const pendingRenderStyleFitRef = useRef(false)

  // ── 初始化渲染器 ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const r = new MolRenderer(canvas)
    rendererRef.current = r
    r.onAtomClick       = onAtomClick
    r.onBondClick       = onBondClick
    r.onBackgroundClick = onBackgroundClick
    onRendererChange?.(r)
    return () => { r.dispose(); rendererRef.current = null; onRendererChange?.(null) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── 事件处理器（工具 / readOnly 变化时更新）─────────────────────────────
  useEffect(() => {
    const r = rendererRef.current
    if (!r) return
    if (readOnly) {
      r.onAtomClick = r.onAtomDoubleClick = r.onBondClick = r.onBackgroundClick = undefined
      r.onBackgroundDoubleClick = undefined
      r.onAtomDrag = r.onAtomDragStart = r.onAtomDragEnd = r.canDragAtom = undefined
      r.onBondDragStart = r.onBondDragEnd = r.onBondDragHover = undefined
      r.getGrowPreview = r.getGrowGuide = undefined
      return
    }
    const canEdit = toolCan(activeTool, 'canEdit')
    r.onAtomClick       = onAtomClick
    r.onAtomDoubleClick = canEdit ? onAtomDoubleClick : undefined
    r.onBondClick       = onBondClick
    r.onBackgroundClick = onBackgroundClick
    r.onBackgroundDoubleClick = canEdit ? onBackgroundDoubleClick : undefined
    r.onAtomDrag        = canEdit ? onAtomDrag        : undefined
    r.onAtomDragStart   = canEdit ? onAtomDragStart   : undefined
    r.onAtomDragEnd     = canEdit ? onAtomDragEnd     : undefined
    r.canDragAtom       = canEdit
      ? (id) => useMoleculeStore.getState().selectedAtomIds.has(id)
      : undefined
    // bond-drag 回调始终挂载，回调内部通过 activeTool 判断是否拦截
    r.onBondDragStart   = onBondDragStart
    r.onBondDragEnd     = onBondDragEnd
    r.onBondDragHover   = (id) => r.setDragHoverAtom(id)
    r.getGrowPreview    = getGrowPreview
    r.getGrowGuide      = getGrowGuide
  }, [readOnly, onAtomClick, onAtomDoubleClick, onBondClick, onBackgroundClick, onBackgroundDoubleClick,
      onAtomDrag, onAtomDragStart, onAtomDragEnd,
      onBondDragStart, onBondDragEnd, getGrowPreview, getGrowGuide, activeTool, rendererRef])

  // ── 主题同步 ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const r = rendererRef.current
    if (!r) return
    const rendererTheme = renderStyle === 'iboview' && theme.metadata.id !== 'iboview'
      ? resolveTheme('iboview')
      : theme
    r.theme = rendererTheme
    r.renderStyle = renderStyle
    r.scene.background = new THREE.Color(parseInt(rendererTheme.scene.backgroundColor.replace('#', ''), 16))
  }, [theme, renderStyle, rendererRef])

  // ── 场景渲染 ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const r = rendererRef.current
    if (!r) return
    const styleChanged = prevRenderStyleRef.current !== renderStyle
    prevRenderStyleRef.current = renderStyle
    if (styleChanged) pendingRenderStyleFitRef.current = true
    r.renderScene(
      sceneObjects, activeObjectId, displayMode, selectedAtomIds, selectedBondIds,
    )
    if (pendingRenderStyleFitRef.current && !toolCan(activeTool, 'transformsObject')) {
      const activeObj = sceneObjects.find(o => o.id === activeObjectId)
      if (activeObj && activeObj.molecule.atoms.length > 0) {
        r.fitToMolecule([...activeObj.molecule.atoms])
        pendingRenderStyleFitRef.current = false
      }
    }
  }, [sceneObjects, activeObjectId, displayMode, selectedAtomIds, selectedBondIds, theme, renderStyle, activeTool, rendererRef])

  // ── 视角跟随 ─────────────────────────────────────────────────────────────
  // move-object 激活时跳过：否则 modelGroup 偏移导致所有分子一起移动
  useEffect(() => {
    const r = rendererRef.current
    const activeObj = sceneObjects.find(o => o.id === activeObjectId)
    if (!r || !activeObj) return
    // ref 必须在 early-return 之前更新：否则空分子阶段 ref 一直是 undefined，
    // 放第一个原子时被误判为"换了分子"而 fitToMolecule，原子从鼠标落点跳到画布中心
    const changed = activeObj.molecule.name !== prevMolNameRef.current ||
                    activeObjectId !== prevActiveIdRef.current
    prevMolNameRef.current  = activeObj.molecule.name
    prevActiveIdRef.current = activeObjectId ?? ''
    if (activeObj.molecule.atoms.length === 0) return
    if (toolCan(activeTool, 'transformsObject')) return
    if (changed) {
      r.fitToMolecule([...activeObj.molecule.atoms])
    } else {
      r.updateOrbitTarget(activeObj.molecule.atoms)
    }
  }, [sceneObjects, activeObjectId, activeTool, rendererRef])

  // ── 测量可视化 ───────────────────────────────────────────────────────────
  // 依赖 sceneObjects：原子被拖动/undo 时（objectsById 引用变化）必须重算，
  // 否则 3D 测量线和标签锚点停留在旧位置。
  // 原子解析跨所有场景对象，切换活跃分子不会让其他分子的测量消失。
  useEffect(() => {
    const r = rendererRef.current
    if (!r) return
    r.measureStyle = measureStyle
    const atomMap = new Map<string, Atom>()
    for (const obj of sceneObjects)
      for (const a of obj.molecule.atoms) atomMap.set(a.id, a)
    const getAtoms = (ids: readonly string[]) =>
      ids.map(id => atomMap.get(id)).filter((a): a is Atom => a !== undefined)
    const committed = measurements
      .map(m => ({ type: m.type, atoms: getAtoms(m.atomIds), expected: m.atomIds.length }))
      .filter(m => m.atoms.length === m.expected)
    r.updateMeasureVisuals(committed, getAtoms(pendingAtomIds))
  }, [measurements, pendingAtomIds, measureStyle, sceneObjects, rendererRef])

  // ── 平面草图模式：约束 + 网格 + 相机转正 ─────────────────────────────────
  useEffect(() => {
    const r = rendererRef.current
    if (!r) return
    r.setSketchPlane(sketchPlane)
    if (sketchPlane) r.alignViewToPlane(sketchPlane.normal)
  }, [sketchPlane, rendererRef])

  // ── ResizeObserver ───────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      rendererRef.current?.resize(width, height)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [containerRef, rendererRef])
}
