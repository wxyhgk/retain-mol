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
import { useMoleculeStore, selectActiveMoleculeOrEmpty } from '../store/moleculeStore'
import type { ResolvedTheme } from '../presets'
import type { DisplayMode } from '../lib/types'
import type { SceneObject } from '../lib/sceneObject'
import type { Measurement, MeasureStyle } from '../lib/types'
import type { BuilderHandlers } from './useBuilder'

interface RendererBindingOptions {
  containerRef:   RefObject<HTMLDivElement | null>
  rendererRef:    RefObject<MolRenderer | null>
  canvasRef:      RefObject<HTMLCanvasElement | null>

  // store 状态（由 MolViewer 传入，避免 hook 重复订阅）
  readOnly:       boolean
  activeTool:     string
  bondingAtomId:  string | null
  sceneObjects:   SceneObject[]
  activeObjectId: string | null
  selectedAtomIds: Set<string>
  selectedBondIds: Set<string>
  displayMode:    DisplayMode
  theme:          ResolvedTheme
  measurements:   Measurement[]
  pendingAtomIds: string[]
  measureStyle:   MeasureStyle

  handlers: BuilderHandlers
}

export function useRendererBinding({
  containerRef, rendererRef, canvasRef,
  readOnly, activeTool, bondingAtomId,
  sceneObjects, activeObjectId,
  selectedAtomIds, selectedBondIds,
  displayMode, theme,
  measurements, pendingAtomIds, measureStyle,
  handlers,
}: RendererBindingOptions) {

  const {
    onAtomClick, onAtomDoubleClick, onBondClick, onBackgroundClick,
    onAtomDragStart, onAtomDrag, onAtomDragEnd,
  } = handlers

  const prevMolNameRef  = useRef<string | undefined>(undefined)
  const prevActiveIdRef = useRef<string>(activeObjectId ?? '')

  // ── 初始化渲染器 ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const r = new MolRenderer(canvas)
    rendererRef.current = r
    r.onAtomClick       = onAtomClick
    r.onBondClick       = onBondClick
    r.onBackgroundClick = onBackgroundClick
    return () => { r.dispose(); rendererRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── 事件处理器（工具 / readOnly 变化时更新）─────────────────────────────
  useEffect(() => {
    const r = rendererRef.current
    if (!r) return
    if (readOnly) {
      r.onAtomClick = r.onAtomDoubleClick = r.onBondClick = r.onBackgroundClick = undefined
      r.onAtomDrag = r.onAtomDragStart = r.onAtomDragEnd = r.canDragAtom = undefined
      return
    }
    r.onAtomClick       = onAtomClick
    r.onAtomDoubleClick = activeTool === 'select' ? onAtomDoubleClick : undefined
    r.onBondClick       = onBondClick
    r.onBackgroundClick = onBackgroundClick
    r.onAtomDrag        = activeTool === 'select' ? onAtomDrag        : undefined
    r.onAtomDragStart   = activeTool === 'select' ? onAtomDragStart   : undefined
    r.onAtomDragEnd     = activeTool === 'select' ? onAtomDragEnd     : undefined
    r.canDragAtom       = activeTool === 'select'
      ? (id) => useMoleculeStore.getState().selectedAtomIds.has(id)
      : undefined
  }, [readOnly, onAtomClick, onAtomDoubleClick, onBondClick, onBackgroundClick,
      onAtomDrag, onAtomDragStart, onAtomDragEnd, activeTool, rendererRef])

  // ── 主题同步 ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const r = rendererRef.current
    if (!r) return
    r.theme = theme
    r.scene.background = new THREE.Color(parseInt(theme.scene.backgroundColor.replace('#', ''), 16))
  }, [theme, rendererRef])

  // ── 场景渲染 ─────────────────────────────────────────────────────────────
  useEffect(() => {
    rendererRef.current?.renderScene(
      sceneObjects, activeObjectId, displayMode, selectedAtomIds, selectedBondIds,
    )
  }, [sceneObjects, activeObjectId, displayMode, selectedAtomIds, selectedBondIds, theme, rendererRef])

  // ── 视角跟随 ─────────────────────────────────────────────────────────────
  // move-object 激活时跳过：否则 modelGroup 偏移导致所有分子一起移动
  useEffect(() => {
    const r = rendererRef.current
    const activeObj = sceneObjects.find(o => o.id === activeObjectId)
    if (!r || !activeObj || activeObj.molecule.atoms.length === 0) return
    if (activeTool === 'move-object') return
    if (activeObj.molecule.name !== prevMolNameRef.current || activeObjectId !== prevActiveIdRef.current) {
      r.fitToMolecule([...activeObj.molecule.atoms])
    } else {
      r.updateOrbitTarget(activeObj.molecule.atoms)
    }
    prevMolNameRef.current  = activeObj.molecule.name
    prevActiveIdRef.current = activeObjectId ?? ''
  }, [sceneObjects, activeObjectId, activeTool, rendererRef])

  // ── 成键预览线 ───────────────────────────────────────────────────────────
  useEffect(() => {
    rendererRef.current?.setGhostLineStart(
      activeTool === 'add-bond' ? bondingAtomId : null,
    )
  }, [activeTool, bondingAtomId, rendererRef])

  // ── 测量可视化 ───────────────────────────────────────────────────────────
  useEffect(() => {
    const r = rendererRef.current
    if (!r) return
    const molecule = selectActiveMoleculeOrEmpty(useMoleculeStore.getState())
    r.measureStyle = measureStyle
    const atomMap  = new Map(molecule.atoms.map(a => [a.id, a]))
    const getAtoms = (ids: readonly string[]) =>
      ids.map(id => atomMap.get(id)).filter(Boolean) as typeof molecule.atoms[number][]
    const committed = measurements
      .map(m => ({ type: m.type, atoms: getAtoms(m.atomIds), expected: m.atomIds.length }))
      .filter(m => m.atoms.length === m.expected)
    r.updateMeasureVisuals(committed, getAtoms(pendingAtomIds))
  }, [measurements, pendingAtomIds, measureStyle, rendererRef])

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
