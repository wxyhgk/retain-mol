/**
 * MolViewer — 3D 分子渲染组件
 *
 * 支持两种用法：
 *   1. 受控（组件库模式）：通过 props 传入数据，用回调接收变更
 *   2. 非受控（独立应用模式）：不传 props，内部用 moleculeStore 管理全部状态
 *
 * 所有受控 prop 均可选；只传部分 prop 时，未传的字段仍由内部 store 管理。
 */

import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { MolRenderer } from '@/lib/molRenderer'
import { useMoleculeStore, selectActiveMolecule, selectActiveMoleculeOrEmpty } from '@/store/moleculeStore'
import type { DisplayMode } from '@/store/moleculeStore'
import { resolveTheme } from '@/presets'
import { useBuilder } from '@/hooks/useBuilder'
import BuilderHint from '@/components/builder/BuilderHint'
import MeasureOverlay from './MeasureOverlay'
import AtomLabelOverlay from './AtomLabelOverlay'
import RotateGizmo from './RotateGizmo'
import BoxSelectOverlay from './BoxSelectOverlay'
import AtomContextMenu from './AtomContextMenu'
import OptimizeCurveOverlay from './OptimizeCurveOverlay'
import type { Molecule } from '@/lib/molecule'

// ── 公开 API ──────────────────────────────────────────────────────────────────

export interface MolViewerProps {
  // ── 分子数据（受控）──────────────────────────────────────────────────────
  /** 受控分子。不传 = 非受控，内部 store 自管。 */
  molecule?: Molecule
  /** 用户编辑触发；prop 写入不触发，不会形成循环。 */
  onMoleculeChange?: (mol: Molecule) => void

  // ── 选择状态（受控）──────────────────────────────────────────────────────
  /** 受控原子选择集。不传 = 由内部 store 管理。 */
  selectedAtomIds?: ReadonlySet<string>
  /** 用户改变选择时触发；prop 写入不触发。 */
  onSelectionChange?: (atomIds: Set<string>, bondIds: Set<string>) => void

  // ── 显示选项（覆盖内部状态）─────────────────────────────────────────────
  /** 渲染模式。不传 = 跟随内部状态。 */
  displayMode?: DisplayMode
  /** 主题 ID（如 'default'）。不传 = 跟随内部状态。 */
  theme?: string
  /** 是否显示原子编号标签。不传 = 跟随内部状态。 */
  showAtomLabels?: boolean
  /** true = 只读展示，禁用所有编辑交互。 */
  readOnly?: boolean

  // ── 样式 ─────────────────────────────────────────────────────────────────
  className?: string
  style?: React.CSSProperties
}

// ── 组件 ──────────────────────────────────────────────────────────────────────

export default function MolViewer({
  molecule: moleculeProp,
  onMoleculeChange,
  selectedAtomIds: selectedAtomIdsProp,
  onSelectionChange,
  displayMode: displayModeProp,
  theme: themeProp,
  showAtomLabels: showAtomLabelsProp,
  readOnly = false,
  className,
  style,
}: MolViewerProps = {}) {
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const rendererRef   = useRef<MolRenderer | null>(null)
  const containerRef  = useRef<HTMLDivElement>(null)

  // ── store 状态 ──────────────────────────────────────────────────────────
  const {
    selectedAtomIds, selectedBondIds,
    activeTool, bondingAtomId,
    measurements, pendingAtomIds, measureStyle,
    theme: storeTheme,
    objectsById, objectOrder, activeObjectId,
  } = useMoleculeStore()

  const storeDisplayMode    = useMoleculeStore(s => s.displayMode)
  const storeShowAtomLabels = useMoleculeStore(s => s.showAtomLabels)

  // props 优先，缺省时退回内部 store
  const displayMode    = displayModeProp    ?? storeDisplayMode
  const showAtomLabels = showAtomLabelsProp ?? storeShowAtomLabels
  const theme = themeProp != null
    ? (() => { try { return resolveTheme(themeProp) } catch { return storeTheme } })()
    : storeTheme

  const sceneObjects = useMemo(
    () => objectOrder.map(id => objectsById[id]).filter(Boolean),
    [objectsById, objectOrder],
  )
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)

  // ── 受控同步：molecule prop → store ────────────────────────────────────
  // lastPropMolRef：最后由 prop 写入的 molecule 引用
  // 用途：区分"用户编辑"与"prop 触发"，防止 onMoleculeChange 形成循环。
  const lastPropMolRef = useRef<Molecule | undefined>(undefined)

  useEffect(() => {
    if (moleculeProp === undefined || moleculeProp === lastPropMolRef.current) return
    lastPropMolRef.current = moleculeProp
    useMoleculeStore.getState().setMolecule(moleculeProp)
  }, [moleculeProp])

  // ── 受控同步：store → onMoleculeChange ─────────────────────────────────
  useEffect(() => {
    if (!onMoleculeChange) return
    return useMoleculeStore.subscribe(
      s => selectActiveMolecule(s),
      (mol) => {
        if (mol && mol !== lastPropMolRef.current) onMoleculeChange(mol)
      },
    )
  }, [onMoleculeChange])

  // ── 受控同步：selectedAtomIds prop → store ──────────────────────────────
  // 用 selectionVersion 做防循环：prop 写入后记住该版本号，
  // subscription 收到相同版本时跳过 callback。
  const lastPropSelVersionRef = useRef(-1)

  useEffect(() => {
    if (selectedAtomIdsProp === undefined) return
    useMoleculeStore.getState().selectAtoms(selectedAtomIdsProp, 'replace')
    lastPropSelVersionRef.current = useMoleculeStore.getState().selectionVersion
  }, [selectedAtomIdsProp])

  // ── 受控同步：store → onSelectionChange ────────────────────────────────
  useEffect(() => {
    if (!onSelectionChange) return
    return useMoleculeStore.subscribe(
      s => s.selectionVersion,
      (version) => {
        if (version === lastPropSelVersionRef.current) return // 跳过 prop 触发的版本
        const { selectedAtomIds: a, selectedBondIds: b } = useMoleculeStore.getState()
        onSelectionChange(new Set(a), new Set(b))
      },
    )
  }, [onSelectionChange])

  // ── 受控同步：theme prop → store ────────────────────────────────────────
  useEffect(() => {
    if (themeProp === undefined) return
    useMoleculeStore.getState().setTheme(themeProp)
  }, [themeProp])

  // ── 受控同步：showAtomLabels prop → store ───────────────────────────────
  useEffect(() => {
    if (showAtomLabelsProp === undefined) return
    useMoleculeStore.getState().setShowAtomLabels(showAtomLabelsProp)
  }, [showAtomLabelsProp])

  // ── 事件构建器 ───────────────────────────────────────────────────────────
  const { onAtomClick, onAtomDoubleClick, onBondClick, onBackgroundClick,
          onAtomDragStart, onAtomDrag, onAtomDragEnd } = useBuilder()

  const prevMolNameRef  = useRef<string | undefined>(molecule.name)
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
  }, [])

  // ── 事件处理器更新（readOnly 时全部禁用）───────────────────────────────
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
      onAtomDrag, onAtomDragStart, onAtomDragEnd, activeTool])

  // ── 主题同步 ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const r = rendererRef.current
    if (!r) return
    r.theme = theme
    r.scene.background = new THREE.Color(parseInt(theme.scene.backgroundColor.replace('#', ''), 16))
  }, [theme])

  // ── 渲染场景 ─────────────────────────────────────────────────────────────
  useEffect(() => {
    rendererRef.current?.renderScene(
      sceneObjects, activeObjectId, displayMode, selectedAtomIds, selectedBondIds,
    )
  }, [sceneObjects, activeObjectId, displayMode, selectedAtomIds, selectedBondIds, theme])

  // ── 视角跟随 ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const r = rendererRef.current
    const activeObj = sceneObjects.find(o => o.id === activeObjectId)
    if (!r || !activeObj || activeObj.molecule.atoms.length === 0) return
    if (activeObj.molecule.name !== prevMolNameRef.current || activeObjectId !== prevActiveIdRef.current) {
      r.fitToMolecule([...activeObj.molecule.atoms])
    } else {
      r.updateOrbitTarget(activeObj.molecule.atoms)
    }
    prevMolNameRef.current  = activeObj.molecule.name
    prevActiveIdRef.current = activeObjectId ?? ''
  }, [sceneObjects, activeObjectId])

  // ── 成键预览线 ───────────────────────────────────────────────────────────
  useEffect(() => {
    rendererRef.current?.setGhostLineStart(
      activeTool === 'add-bond' ? bondingAtomId : null,
    )
  }, [activeTool, bondingAtomId])

  // ── 测量可视化 ───────────────────────────────────────────────────────────
  useEffect(() => {
    const r = rendererRef.current
    if (!r) return
    r.measureStyle = measureStyle
    const atomMap  = new Map(molecule.atoms.map(a => [a.id, a]))
    const getAtoms = (ids: readonly string[]) =>
      ids.map(id => atomMap.get(id)).filter(Boolean) as typeof molecule.atoms[number][]
    const committed = measurements
      .map(m => ({ type: m.type, atoms: getAtoms(m.atomIds), expected: m.atomIds.length }))
      .filter(m => m.atoms.length === m.expected)
    r.updateMeasureVisuals(committed, getAtoms(pendingAtomIds))
  }, [measurements, pendingAtomIds, molecule.atoms, measureStyle])

  // ── AtomLabelOverlay 也要感知 showAtomLabels ────────────────────────────
  // showAtomLabels 已同步到 store，overlay 直接读 store，不需要额外操作。

  // ── 响应容器尺寸 ─────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      rendererRef.current?.resize(width, height)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const cursorClass =
    readOnly           ? 'cursor-default'     :
    activeTool === 'add-atom' ? 'cursor-crosshair'  :
    activeTool === 'delete'   ? 'cursor-not-allowed':
    activeTool === 'add-bond' ? 'cursor-cell'       :
    activeTool === 'measure'  ? 'cursor-zoom-in'    :
    'cursor-default'

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full${className ? ` ${className}` : ''}`}
      style={style}
    >
      <canvas ref={canvasRef} className={`w-full h-full block ${cursorClass}`} />
      <MeasureOverlay    renderer={rendererRef.current} />
      <AtomLabelOverlay  renderer={rendererRef.current} />
      <RotateGizmo       renderer={rendererRef.current} />
      <BoxSelectOverlay  renderer={rendererRef.current} />
      <AtomContextMenu   renderer={rendererRef.current} />
      <OptimizeCurveOverlay />
      {!readOnly && <BuilderHint />}
    </div>
  )
}
