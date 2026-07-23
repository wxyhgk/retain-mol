/**
 * useCanvasPointerRouter — canvas 指针事件的统一路由层
 *
 * 挂在 container 的 capture 阶段（DOM 捕获阶段顶层），比 canvas 上所有监听器
 * 都先触发。决定谁处理事件后调用 stopImmediatePropagation，终止向下传播。
 *
 * 路由决策树（按优先级）：
 *   1. activeTool === 'move-object'  → 对象变换（平移/旋转片段）
 *   2. Shift+左键 or 右键 on 空白   → 框选
 *   3. 其他                          → 放行给 InteractionHandler
 *
 * 返回 { boxRect } 供 BoxSelectOverlay 渲染选框。
 */

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { selectActiveMoleculeOrEmpty, type MoleculeStoreApi } from '../store/moleculeStore'
import type { ThreeRendererPort } from '../lib/molRenderer'
import { toolCan } from '../config/toolCapabilities.config'
import { INTERACTION } from '../config/interaction.config'
import { createObjectTransformEditSession } from './editSessionFactory'
import {
  cancelObjectTransform,
  finishObjectTransform,
  commitBoxSelect,
  commitObjectPointerTransform,
  resolveBoxSelectBounds,
  resolveObjectTransformTarget,
  shouldStartBoxSelect,
} from './useCanvasPointerRouterEffects'
import { useViewerRuntimeServices } from '../runtime/ViewerRuntime'
import {
  canEditInInteractionMode,
  shouldEnableCameraControls,
  type InteractionMode,
} from '../lib/interaction/interactionMode'

export interface BoxRect { x: number; y: number; w: number; h: number }

// ── 对象变换状态 ──────────────────────────────────────────────────────────────

interface TransformState {
  dragging: boolean
  lastX: number
  lastY: number
  fragmentIds: Set<string> | null
  targetObjectId: string | null
}

function makeTransformState(): TransformState {
  return { dragging: false, lastX: 0, lastY: 0, fragmentIds: null, targetObjectId: null }
}

function handleTransformDown(
  e: PointerEvent,
  canvas: HTMLCanvasElement,
  renderer: ThreeRendererPort,
  state: TransformState,
  session: ReturnType<typeof createObjectTransformEditSession>,
  moleculeStore: MoleculeStoreApi,
) {
  state.fragmentIds = null
  state.targetObjectId = null

  const pickedAtomId = renderer.pickAtomIdAt(e.clientX, e.clientY)
  const target = resolveObjectTransformTarget(pickedAtomId, e.altKey, {
    activateObjectContainingAtom: id => moleculeStore.getState().activateObjectContainingAtom(id),
    getActiveObjectId: () => moleculeStore.getState().activeObjectId,
    getActiveMolecule: () => {
      const { objectsById, activeObjectId } = moleculeStore.getState()
      return activeObjectId ? objectsById[activeObjectId]?.molecule : undefined
    },
  })
  if (!target) return
  state.fragmentIds = target.fragmentIds
  state.targetObjectId = target.targetObjectId

  state.dragging = true
  state.lastX = e.clientX
  state.lastY = e.clientY
  canvas.setPointerCapture(e.pointerId)
  session.start()
}

function handleTransformMove(
  e: PointerEvent,
  renderer: ThreeRendererPort,
  state: TransformState,
  moleculeStore: MoleculeStoreApi,
) {
  if (!state.dragging || !state.fragmentIds || !state.targetObjectId) return

  const dx = e.clientX - state.lastX
  const dy = e.clientY - state.lastY
  state.lastX = e.clientX
  state.lastY = e.clientY
  if (Math.abs(dx) < INTERACTION.transformMinDisplacement && Math.abs(dy) < INTERACTION.transformMinDisplacement) return

  const { objectsById, setObjectAtomPositions } = moleculeStore.getState()
  const mol = objectsById[state.targetObjectId]?.molecule
  if (!mol) return

  commitObjectPointerTransform({
    objectId: state.targetObjectId,
    molecule: mol,
    fragmentIds: state.fragmentIds,
    dx,
    dy,
    rotate: e.altKey,
    minDisplacement: INTERACTION.transformMinDisplacement,
    rotateSpeedFactor: INTERACTION.rotateSpeedFactor,
    screenDeltaToModelLocal: (screenDx, screenDy) => renderer.screenDeltaToModelLocal(screenDx, screenDy),
    getModelWorldQuaternion: () => {
      const mWorldQ = new THREE.Quaternion()
      renderer.modelGroup.getWorldQuaternion(mWorldQ)
      return { x: mWorldQ.x, y: mWorldQ.y, z: mWorldQ.z, w: mWorldQ.w }
    },
    setObjectAtomPositions,
  })
}

// ── 框选状态 ──────────────────────────────────────────────────────────────────

interface BoxSelectState {
  active: boolean
  startX: number; startY: number
  currentX: number; currentY: number
  shift: boolean; alt: boolean
}

function makeBoxState(): BoxSelectState {
  return { active: false, startX: 0, startY: 0, currentX: 0, currentY: 0, shift: false, alt: false }
}

function finishBoxSelect(
  state: BoxSelectState,
  canvas: HTMLCanvasElement,
  renderer: ThreeRendererPort,
  moleculeStore: MoleculeStoreApi,
) {
  const rect = canvas.getBoundingClientRect()
  const bounds = resolveBoxSelectBounds(state.startX, state.startY, state.currentX, state.currentY)

  const { selectAtoms } = moleculeStore.getState()
  const molecule = selectActiveMoleculeOrEmpty(moleculeStore.getState())
  const w = rect.width, h = rect.height
  const v = new THREE.Vector3()
  commitBoxSelect({
    state,
    molecule,
    bounds,
    minSize: INTERACTION.boxSelectMinSize,
    projectAtom: atom => {
      v.set(atom.x, atom.y, atom.z)
      return renderer.projectLocalToScreen(v, w, h)
    },
    selectAtoms,
  })
}

// ── 公开 Hook ─────────────────────────────────────────────────────────────────

export function useCanvasPointerRouter(
  containerRef: RefObject<HTMLDivElement | null>,
  rendererRef: RefObject<ThreeRendererPort | null>,
  interactionMode: InteractionMode = 'edit',
): { boxRect: BoxRect | null } {
  const editingEnabled = canEditInInteractionMode(interactionMode)
  const { moleculeStore, editorStore } = useViewerRuntimeServices()
  const activeTool = editorStore(s => s.activeTool)
  const [boxRect, setBoxRect] = useState<BoxRect | null>(null)

  const transformRef = useRef<TransformState>(makeTransformState())
  const transformSession = useMemo(
    () => createObjectTransformEditSession(moleculeStore),
    [moleculeStore],
  )
  const boxRef       = useRef<BoxSelectState>(makeBoxState())

  useEffect(() => () => transformSession.cancel(), [transformSession])

  // 同步相机控制开关；切换工具时清理可能残留的变换状态（防止 pointerup 未触发导致状态卡死）
  useEffect(() => {
    const r = rendererRef.current
    if (r) {
      r.controls.enabled = shouldEnableCameraControls(
        interactionMode,
        toolCan(activeTool, 'transformsObject'),
      )
    }
    if (!editingEnabled || !toolCan(activeTool, 'transformsObject')) {
      const ts = transformRef.current
      cancelObjectTransform(ts, transformSession)
      const bs = boxRef.current
      if (bs.active) {
        bs.active = false
        setBoxRect(null)
      }
    }
  }, [activeTool, editingEnabled, interactionMode, rendererRef, transformSession])

  useEffect(() => {
    if (!editingEnabled) {
      setBoxRect(null)
      return
    }
    const container = containerRef.current
    if (!container) return

    const getRenderer = () => rendererRef.current
    const getCanvas   = () => rendererRef.current?.canvas ?? null

    // ── pointerdown（container capture 阶段）────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const renderer = getRenderer()
      const canvas   = getCanvas()
      if (!renderer || !canvas) return

      const { activeTool: tool } = editorStore.getState()
      // 1. move-object 工具 → 对象变换
      if (toolCan(tool, 'transformsObject')) {
        e.stopImmediatePropagation()
        handleTransformDown(e, canvas, renderer, transformRef.current, transformSession, moleculeStore)
        return
      }

      // 2. 框选条件
      const pickedAtomId = renderer.pickAtomIdAt(e.clientX, e.clientY)
      const pickedBondId = pickedAtomId ? null : renderer.pickBondIdAt(e.clientX, e.clientY)
      if (shouldStartBoxSelect({
        button: e.button,
        shiftKey: e.shiftKey,
        pickedAtomId,
        pickedBondId,
      })) {
        e.stopImmediatePropagation()
        const rect = canvas.getBoundingClientRect()
        const bx = e.clientX - rect.left
        const by = e.clientY - rect.top
        const bs = boxRef.current
        bs.active = true; bs.startX = bx; bs.startY = by
        bs.currentX = bx; bs.currentY = by
        bs.shift = e.shiftKey; bs.alt = e.altKey
        setBoxRect({ x: bx, y: by, w: 0, h: 0 })
        canvas.setPointerCapture(e.pointerId)
        return
      }

      // 3. 放行 → InteractionHandler 处理 atom/bond 点击与拖拽
    }

    // ── pointermove（canvas 上；pointer capture 保证跨出 canvas 时仍触发）──
    const onMove = (e: PointerEvent) => {
      const renderer = getRenderer()
      const canvas   = getCanvas()

      // 对象变换
      if (transformRef.current.dragging && renderer) {
        handleTransformMove(e, renderer, transformRef.current, moleculeStore)
        return
      }

      // 框选绘制
      const bs = boxRef.current
      if (bs.active && canvas) {
        const rect = canvas.getBoundingClientRect()
        bs.currentX = e.clientX - rect.left
        bs.currentY = e.clientY - rect.top
        const x = Math.min(bs.startX, bs.currentX)
        const y = Math.min(bs.startY, bs.currentY)
        setBoxRect({ x, y, w: Math.abs(bs.currentX - bs.startX), h: Math.abs(bs.currentY - bs.startY) })
      }
    }

    // ── pointerup ────────────────────────────────────────────────────────────
    const onUp = (e: PointerEvent) => {
      const renderer = getRenderer()
      const canvas   = getCanvas()

      // 对象变换结束
      const ts = transformRef.current
      if (ts.dragging) {
        finishObjectTransform(ts, transformSession)
        return
      }

      // 框选结束
      const bs = boxRef.current
      if (bs.active) {
        bs.active = false
        setBoxRect(null)
        if (canvas && renderer) finishBoxSelect(bs, canvas, renderer, moleculeStore)
      }
    }

    // ── pointercancel（触屏手势抢占等）────────────────────────────────────────
    // 拖拽中被 cancel 时若不清理，beginTransaction 会悬挂（zundo 永久 paused）
    const onCancel = () => {
      const ts = transformRef.current
      cancelObjectTransform(ts, transformSession)
      const bs = boxRef.current
      if (bs.active) {
        bs.active = false
        setBoxRect(null)   // 取消框选，不提交选择
      }
    }

    // container capture 拦截 down；canvas bubble 处理 move/up（pointer capture 保证）
    container.addEventListener('pointerdown', onDown, { capture: true })
    container.addEventListener('pointermove', onMove)
    container.addEventListener('pointerup',   onUp)
    container.addEventListener('pointercancel', onCancel)

    return () => {
      cancelObjectTransform(transformRef.current, transformSession)
      container.removeEventListener('pointerdown', onDown, { capture: true } as AddEventListenerOptions)
      container.removeEventListener('pointermove', onMove)
      container.removeEventListener('pointerup',   onUp)
      container.removeEventListener('pointercancel', onCancel)
    }
  }, [containerRef, rendererRef, editingEnabled, moleculeStore, editorStore, transformSession])

  return { boxRect }
}
