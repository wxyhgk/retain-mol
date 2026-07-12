/**
 * MolViewer — 3D 分子渲染组件
 *
 * 支持两种用法：
 *   1. 受控（组件库模式）：通过 props 传入数据，用回调接收变更
 *   2. 非受控（独立应用模式）：不传 props，内部用 moleculeStore 管理全部状态
 *
 * 所有受控 prop 均可选；只传部分 prop 时，未传的字段仍由内部 store 管理。
 */

import { useRef, useMemo, useState, useEffect } from 'react'
import { MolRenderer } from '../../lib/molRenderer'
import { selectActiveMoleculeOrEmpty } from '../../store/moleculeStore'
import { fitPlane } from '../../lib/builder/geometry/plane'
import type { DisplayMode } from '../../lib/types'
import { toolCan } from '../../config/toolCapabilities.config'
import { useBuilder } from '../../hooks/useBuilder'
import { useMolViewerSync } from '../../hooks/useMolViewerSync'
import { useRendererBinding } from '../../hooks/useRendererBinding'
import { useCanvasPointerRouter } from '../../hooks/useCanvasPointerRouter'
import { createViewportController } from '../../viewport'
import {
  ViewerRuntimeProvider,
  useViewerRuntime,
  type ViewerRuntime,
} from '../../runtime/ViewerRuntime'
import BuilderHint from '../builder/BuilderHint'
import MeasureOverlay from './MeasureOverlay'
import AtomLabelOverlay from './AtomLabelOverlay'
import RotateGizmo from './RotateGizmo'
import BoxSelectOverlay from './BoxSelectOverlay'
import AtomContextMenu from './AtomContextMenu'
import type { Molecule } from '../../lib/molecule'

// ── 公开 API ──────────────────────────────────────────────────────────────────

export interface MolViewerProps {
  molecule?:          Molecule
  onMoleculeChange?:  (mol: Molecule) => void
  selectedAtomIds?:   ReadonlySet<string>
  onSelectionChange?: (atomIds: Set<string>, bondIds: Set<string>) => void
  displayMode?:       DisplayMode
  theme?:             string
  showAtomLabels?:    boolean
  /** UI chrome appearance. Night mode applies a temporary dark-safe scene theme. */
  appearance?:        'day' | 'night'
  /** Initial grid visibility. Reapplied when the renderer is recreated. */
  gridVisible?:       boolean
  readOnly?:          boolean
  overlays?:          React.ReactNode
  className?:         string
  style?:             React.CSSProperties
  /** Isolated state/rendering session. Omit to use the compatibility runtime. */
  runtime?:           ViewerRuntime
}

// ── 組件 ─────────────────────────────────────────────────────────────────────

export default function MolViewer(props: MolViewerProps = {}) {
  const inheritedRuntime = useViewerRuntime()
  const runtime = props.runtime ?? inheritedRuntime
  return (
    <ViewerRuntimeProvider runtime={runtime}>
      <MolViewerContent {...props} />
    </ViewerRuntimeProvider>
  )
}

function MolViewerContent({
  molecule: moleculeProp,
  onMoleculeChange,
  selectedAtomIds: selectedAtomIdsProp,
  onSelectionChange,
  displayMode: displayModeProp,
  theme: themeProp,
  showAtomLabels: showAtomLabelsProp,
  appearance = 'day',
  gridVisible: gridVisibleProp,
  readOnly = false,
  overlays,
  className,
  style,
}: MolViewerProps) {
  const runtime = useViewerRuntime()
  const moleculeStore = runtime.moleculeStore
  const editorStore = runtime.editorStore
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const rendererRef  = useRef<MolRenderer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // renderer 同时存一份 state：ref 赋值不触发重渲，直接把 ref.current 传给
  // overlay 会让它们在首次渲染时拿到 null 后永远挂空
  const [renderer, setRenderer] = useState<MolRenderer | null>(null)

  // ── store 状态（逐字段 selector，避免无关变更触发整组件重渲）─────────────
  const objectsById     = moleculeStore(s => s.objectsById)
  const objectOrder     = moleculeStore(s => s.objectOrder)
  const activeObjectId  = moleculeStore(s => s.activeObjectId)
  const selectedAtomIds = moleculeStore(s => s.selectedAtomIds)
  const selectedBondIds = moleculeStore(s => s.selectedBondIds)
  const activeTool      = editorStore(s => s.activeTool)
  const brushArmed      = editorStore(s => s.brushArmed)
  const measurements    = editorStore(s => s.measurements)
  const pendingAtomIds  = editorStore(s => s.pendingAtomIds)
  const measureStyle    = editorStore(s => s.measureStyle)
  const sketchPlane     = editorStore(s => s.sketchPlane)
  const renderStyle     = editorStore(s => s.renderStyle)

  const sceneObjects = useMemo(
    () => objectOrder.map(id => objectsById[id]).filter(Boolean),
    [objectsById, objectOrder],
  )

  // ── 受控/非受控 prop ↔ store 双向同步 ────────────────────────────────────
  const { displayMode, theme } = useMolViewerSync({
    molecule: moleculeProp, onMoleculeChange,
    selectedAtomIds: selectedAtomIdsProp, onSelectionChange,
    displayMode: displayModeProp, theme: themeProp,
    showAtomLabels: showAtomLabelsProp,
  }, runtime)

  // ── 渲染器绑定（生命周期 / 事件 / 场景 / 相机 / 测量）────────────────────
  const handlers = useBuilder(runtime)
  useRendererBinding({
    containerRef, rendererRef, canvasRef,
    readOnly, activeTool, brushArmed,
    sceneObjects, activeObjectId,
    selectedAtomIds, selectedBondIds,
    displayMode, renderStyle, theme, appearance,
    measurements, pendingAtomIds, measureStyle, sketchPlane,
    handlers,
    onRendererChange: setRenderer,
  })

  // 向 app 层注册截图能力（不暴露 renderer 本身，保持边界干净）
  useEffect(() => {
    if (!renderer) return
    return runtime.capture.register(scale => renderer.captureImage(scale))
  }, [renderer, runtime])

  // 仅注册窄命令面；每次调用时读取最新 store，app 不持有 renderer 实例。
  useEffect(() => {
    if (!renderer) return
    return runtime.viewport.register(createViewportController(renderer, moleculeStore.getState))
  }, [renderer, moleculeStore, runtime])

  useEffect(() => {
    if (!renderer || gridVisibleProp === undefined) return
    renderer.setGridVisible(gridVisibleProp)
  }, [renderer, gridVisibleProp])

  // ── 平面草图模式：双击 p 进入/退出，Esc 退出 ─────────────────────────────
  useEffect(() => {
    if (readOnly) return
    let lastP = 0
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const { sketchPlane: sp, setSketchPlane, flashHint } = editorStore.getState()

      if (e.key === 'Escape' && sp) {
        setSketchPlane(null)
        flashHint('已退出平面模式')
        return
      }
      // Esc 解除笔刷武装 → 纯选择态（显式的构建/选择模式切换）
      if (e.key === 'Escape') {
        const ed = editorStore.getState()
        if (toolCan(ed.activeTool, 'canEdit') && ed.brushArmed && ed.pendingAtomIds.length === 0) {
          ed.disarmBrush()
          flashHint('选择模式 · 点元素/片段恢复构建')
        }
        return
      }
      if (e.key !== 'p' && e.key !== 'P') return

      const now = Date.now()
      if (now - lastP > 400) { lastP = now; return }   // 第一次 p，等第二次
      lastP = 0

      if (sp) {
        setSketchPlane(null)
        flashHint('已退出平面模式')
        return
      }
      // 平面优先级：选中原子拟合 → 整个分子拟合 → 当前相机视角平面
      const st = moleculeStore.getState()
      const mol = selectActiveMoleculeOrEmpty(st)
      const selected = mol.atoms.filter(a => st.selectedAtomIds.has(a.id))
      const basis = selected.length >= 3 ? selected : mol.atoms
      const fitted = basis.length >= 3 ? fitPlane(basis) : null
      const plane = fitted
        ? { origin: fitted.origin as [number, number, number], normal: fitted.normal as [number, number, number] }
        : rendererRef.current?.getViewPlaneLocal() ?? null
      if (!plane) return
      setSketchPlane(plane)
      flashHint(
        fitted
          ? (selected.length >= 3 ? '平面模式 · 按选中原子拟合 · pp/Esc 退出' : '平面模式 · 按分子拟合 · pp/Esc 退出')
          : '平面模式 · 当前视角平面 · pp/Esc 退出',
      )
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [readOnly, editorStore, moleculeStore])

  // ── 统一指针事件路由（move-object + 框选）────────────────────────────────
  const { boxRect } = useCanvasPointerRouter(containerRef, rendererRef, readOnly)

  // ── cursor ───────────────────────────────────────────────────────────────
  // 内联样式挂在容器上（不依赖宿主 app 的 Tailwind 扫描到本包的 class）；
  // canvas 自身不设 cursor，继承容器值 —— InteractionHandler 在 bond-drag 中
  // 直接写 canvas.style.cursor（cell/crosshair），复位为 '' 后自动落回容器光标。
  const baseCursor =
    readOnly                     ? 'default'   :
    activeTool === 'measure'     ? 'zoom-in'   :
    toolCan(activeTool, 'transformsObject') ? 'grab'      :
    toolCan(activeTool, 'canEdit') && brushArmed ? 'crosshair' :
    'default'

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full${className ? ` ${className}` : ''}`}
      style={{ cursor: baseCursor, ...style }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      <MeasureOverlay   renderer={renderer} />
      <AtomLabelOverlay renderer={renderer} />
      <RotateGizmo      renderer={renderer} readOnly={readOnly} />
      <BoxSelectOverlay rect={readOnly ? null : boxRect} />
      {!readOnly && <AtomContextMenu renderer={renderer} />}
      {overlays}
      {!readOnly && <BuilderHint />}
    </div>
  )
}
