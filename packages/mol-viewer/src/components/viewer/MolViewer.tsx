/**
 * MolViewer — 3D 分子渲染组件
 *
 * 支持两种用法：
 *   1. 受控（组件库模式）：通过 props 传入数据，用回调接收变更
 *   2. 非受控（独立应用模式）：不传 props，内部用 moleculeStore 管理全部状态
 *
 * 所有受控 prop 均可选；只传部分 prop 时，未传的字段仍由内部 store 管理。
 */

import { useRef, useMemo, useState } from 'react'
import type { RendererPort, ThreeRendererPort } from '../../lib/molRenderer'
import type { DisplayMode } from '../../lib/types'
import { toolCan } from '../../config/toolCapabilities.config'
import { useBuilder } from '../../hooks/useBuilder'
import { useMolViewerSync } from '../../hooks/useMolViewerSync'
import { useRendererBinding } from '../../hooks/useRendererBinding'
import { useCanvasPointerRouter } from '../../hooks/useCanvasPointerRouter'
import {
  ViewerRuntimeProvider,
  useViewerRuntime,
  useViewerRuntimeServices,
  type ViewerRuntime,
} from '../../runtime/ViewerRuntime'
import { MolViewerOverlays } from './MolViewerOverlays'
import { useSketchPlaneShortcuts } from './useSketchPlaneShortcuts'
import { useViewerRuntimeBridge } from './useViewerRuntimeBridge'
import type { Molecule } from '../../lib/molecule'
import {
  canEditInInteractionMode,
  resolveInteractionMode,
  type InteractionMode,
} from '../../lib/interaction/interactionMode'
import type {
  BondPairGizmoConfig,
  BondPairGizmoError,
  BondPairGizmoErrorCode,
  BondPairGizmoPhase,
  BondPairGizmoValue,
} from '../../lib/bondPairGizmo'

// ── 公开 API ──────────────────────────────────────────────────────────────────

export type { InteractionMode } from '../../lib/interaction/interactionMode'
export type {
  BondPairGizmoConfig,
  BondPairGizmoError,
  BondPairGizmoErrorCode,
  BondPairGizmoMode,
  BondPairGizmoPhase,
  BondPairGizmoValue,
} from '../../lib/bondPairGizmo'

export interface MolViewerProps {
  molecule?:          Molecule
  onMoleculeChange?:  (mol: Molecule) => void
  selectedAtomIds?:   ReadonlySet<string>
  selectedBondIds?:   ReadonlySet<string>
  onSelectionChange?: (atomIds: Set<string>, bondIds: Set<string>) => void
  /** Canvas-native φ/θ controls for a validated disconnected bond pair. */
  bondPairGizmo?:      BondPairGizmoConfig
  /** Reports transactional gizmo phases and the current d/θ/φ/coplanarity value. */
  onBondPairGizmoChange?: (value: BondPairGizmoValue, phase: BondPairGizmoPhase) => void
  /** Reports invalid selection, locking, degeneracy, or mid-drag topology changes. */
  onBondPairGizmoError?: (error: BondPairGizmoError) => void
  displayMode?:       DisplayMode
  theme?:             string
  showAtomLabels?:    boolean
  /** UI chrome appearance. Night mode applies a temporary dark-safe scene theme. */
  appearance?:        'day' | 'night'
  /** Initial grid visibility. Reapplied when the renderer is recreated. */
  gridVisible?:       boolean
  /**
   * Interaction capability: camera-only, selection-only, or full editing.
   * Takes precedence over the legacy readOnly prop.
   */
  interactionMode?:   InteractionMode
  /** @deprecated Use interactionMode="read-only" instead. */
  readOnly?:          boolean
  overlays?:          React.ReactNode
  className?:         string
  style?:             React.CSSProperties
  /** Isolated state/rendering session. Omit to use the compatibility runtime. */
  runtime?:           ViewerRuntime
  /** Receives the renderer's stable, implementation-agnostic command surface. */
  onRendererChange?:  (renderer: RendererPort | null) => void
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
  selectedBondIds: selectedBondIdsProp,
  onSelectionChange,
  bondPairGizmo,
  onBondPairGizmoChange,
  onBondPairGizmoError,
  displayMode: displayModeProp,
  theme: themeProp,
  showAtomLabels: showAtomLabelsProp,
  appearance = 'day',
  gridVisible: gridVisibleProp,
  interactionMode: interactionModeProp,
  readOnly,
  overlays,
  className,
  style,
  onRendererChange,
}: MolViewerProps) {
  const interactionMode = resolveInteractionMode(interactionModeProp, readOnly)
  const editingEnabled = canEditInInteractionMode(interactionMode)
  const runtime = useViewerRuntime()
  const { moleculeStore, editorStore } = useViewerRuntimeServices()
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const rendererRef  = useRef<ThreeRendererPort | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // renderer 同时存一份 state：ref 赋值不触发重渲，直接把 ref.current 传给
  // overlay 会让它们在首次渲染时拿到 null 后永远挂空
  const [renderer, setRenderer] = useState<ThreeRendererPort | null>(null)

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
    () => objectOrder
      .map(id => objectsById[id])
      .filter((object): object is NonNullable<typeof object> => object !== undefined),
    [objectsById, objectOrder],
  )

  // ── 受控/非受控 prop ↔ store 双向同步 ────────────────────────────────────
  const { displayMode, theme } = useMolViewerSync({
    ...(moleculeProp !== undefined ? { molecule: moleculeProp } : {}),
    ...(onMoleculeChange !== undefined ? { onMoleculeChange } : {}),
    ...(selectedAtomIdsProp !== undefined ? { selectedAtomIds: selectedAtomIdsProp } : {}),
    ...(selectedBondIdsProp !== undefined ? { selectedBondIds: selectedBondIdsProp } : {}),
    ...(onSelectionChange !== undefined ? { onSelectionChange } : {}),
    ...(displayModeProp !== undefined ? { displayMode: displayModeProp } : {}),
    ...(themeProp !== undefined ? { theme: themeProp } : {}),
    ...(showAtomLabelsProp !== undefined ? { showAtomLabels: showAtomLabelsProp } : {}),
  }, runtime)

  // ── 渲染器绑定（生命周期 / 事件 / 场景 / 相机 / 测量）────────────────────
  const handlers = useBuilder(runtime)
  useRendererBinding({
    containerRef, rendererRef, canvasRef,
    interactionMode, activeTool, brushArmed,
    sceneObjects, activeObjectId,
    selectedAtomIds, selectedBondIds,
    displayMode, renderStyle, theme, appearance,
    measurements, pendingAtomIds, measureStyle, sketchPlane,
    handlers,
    onRendererChange: nextRenderer => {
      setRenderer(nextRenderer)
      onRendererChange?.(nextRenderer)
    },
  })

  useViewerRuntimeBridge(renderer, gridVisibleProp)
  useSketchPlaneShortcuts(rendererRef, !editingEnabled)

  // ── 统一指针事件路由（move-object + 框选）────────────────────────────────
  const { boxRect } = useCanvasPointerRouter(containerRef, rendererRef, interactionMode)

  // ── cursor ───────────────────────────────────────────────────────────────
  // 内联样式挂在容器上（不依赖宿主 app 的 Tailwind 扫描到本包的 class）；
  // canvas 自身不设 cursor，继承容器值 —— InteractionHandler 在 bond-drag 中
  // 直接写 canvas.style.cursor（cell/crosshair），复位为 '' 后自动落回容器光标。
  const baseCursor =
    !editingEnabled              ? 'default'   :
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
      <MolViewerOverlays
        renderer={renderer}
        activeTool={activeTool}
        brushArmed={brushArmed}
        interactionMode={interactionMode}
        boxRect={boxRect}
        bondPairGizmo={bondPairGizmo}
        onBondPairGizmoChange={onBondPairGizmoChange}
        onBondPairGizmoError={onBondPairGizmoError}
      >
        {overlays}
      </MolViewerOverlays>
    </div>
  )
}
