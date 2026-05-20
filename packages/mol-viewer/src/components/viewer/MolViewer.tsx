/**
 * MolViewer — 3D 分子渲染组件
 *
 * 支持两种用法：
 *   1. 受控（组件库模式）：通过 props 传入数据，用回调接收变更
 *   2. 非受控（独立应用模式）：不传 props，内部用 moleculeStore 管理全部状态
 *
 * 所有受控 prop 均可选；只传部分 prop 时，未传的字段仍由内部 store 管理。
 */

import { useRef, useMemo } from 'react'
import { MolRenderer } from '../../lib/molRenderer'
import { useMoleculeStore } from '../../store/moleculeStore'
import { useEditorStore } from '../../store/editorStore'
import type { DisplayMode } from '../../lib/types'
import { useBuilder } from '../../hooks/useBuilder'
import { useMolViewerSync } from '../../hooks/useMolViewerSync'
import { useRendererBinding } from '../../hooks/useRendererBinding'
import { useCanvasPointerRouter } from '../../hooks/useCanvasPointerRouter'
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
  readOnly?:          boolean
  overlays?:          React.ReactNode
  className?:         string
  style?:             React.CSSProperties
}

// ── 組件 ─────────────────────────────────────────────────────────────────────

export default function MolViewer({
  molecule: moleculeProp,
  onMoleculeChange,
  selectedAtomIds: selectedAtomIdsProp,
  onSelectionChange,
  displayMode: displayModeProp,
  theme: themeProp,
  showAtomLabels: showAtomLabelsProp,
  readOnly = false,
  overlays,
  className,
  style,
}: MolViewerProps = {}) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const rendererRef  = useRef<MolRenderer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // ── store 状态 ───────────────────────────────────────────────────────────
  const { objectsById, objectOrder, activeObjectId, selectedAtomIds, selectedBondIds } = useMoleculeStore()
  const { activeTool, bondingAtomId, measurements, pendingAtomIds, measureStyle } = useEditorStore()

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
  })

  // ── 渲染器绑定（生命周期 / 事件 / 场景 / 相机 / 测量）────────────────────
  const handlers = useBuilder()
  useRendererBinding({
    containerRef, rendererRef, canvasRef,
    readOnly, activeTool, bondingAtomId,
    sceneObjects, activeObjectId,
    selectedAtomIds, selectedBondIds,
    displayMode, theme,
    measurements, pendingAtomIds, measureStyle,
    handlers,
  })

  // ── 统一指针事件路由（move-object + 框选）────────────────────────────────
  const { boxRect } = useCanvasPointerRouter(containerRef, rendererRef)

  // ── cursor ───────────────────────────────────────────────────────────────
  const cursorClass =
    readOnly                     ? 'cursor-default'     :
    activeTool === 'add-atom'    ? 'cursor-crosshair'   :
    activeTool === 'delete'      ? 'cursor-not-allowed' :
    activeTool === 'add-bond'    ? 'cursor-cell'        :
    activeTool === 'measure'     ? 'cursor-zoom-in'     :
    activeTool === 'move-object' ? 'cursor-grab'        :
    'cursor-default'

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full${className ? ` ${className}` : ''}`}
      style={style}
    >
      <canvas ref={canvasRef} className={`w-full h-full block ${cursorClass}`} />
      <MeasureOverlay   renderer={rendererRef.current} />
      <AtomLabelOverlay renderer={rendererRef.current} />
      <RotateGizmo      renderer={rendererRef.current} />
      <BoxSelectOverlay rect={boxRect} />
      <AtomContextMenu  renderer={rendererRef.current} />
      {overlays}
      {!readOnly && <BuilderHint />}
    </div>
  )
}
