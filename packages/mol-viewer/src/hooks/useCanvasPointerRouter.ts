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

import { useEffect, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { useMoleculeStore, selectActiveMoleculeOrEmpty } from '../store/moleculeStore'
import { useEditorStore } from '../store/editorStore'
import type { MolRenderer } from '../lib/molRenderer'
import { getConnectedFragment } from '../lib/builder/analysis/fragments'

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
  renderer: MolRenderer,
  state: TransformState,
) {
  state.fragmentIds = null
  state.targetObjectId = null

  const { objectsById, objectOrder, activeObjectId: curActive, setActiveObject } = useMoleculeStore.getState()
  const pickedAtomId = renderer.pickAtomIdAt(e.clientX, e.clientY)

  if (pickedAtomId) {
    let objId: string | null = null
    for (const id of objectOrder) {
      if (objectsById[id]?.molecule.atoms.some(a => a.id === pickedAtomId)) { objId = id; break }
    }
    if (!objId) return
    if (objId !== curActive) setActiveObject(objId)
    const mol = objectsById[objId].molecule
    state.fragmentIds = getConnectedFragment(mol.atoms, mol.bonds, pickedAtomId)
    state.targetObjectId = objId
  } else if (e.altKey && curActive) {
    const mol = objectsById[curActive]?.molecule
    if (!mol || mol.atoms.length === 0) return
    state.fragmentIds = new Set(mol.atoms.map(a => a.id))
    state.targetObjectId = curActive
  } else {
    return
  }

  state.dragging = true
  state.lastX = e.clientX
  state.lastY = e.clientY
  canvas.setPointerCapture(e.pointerId)
}

function handleTransformMove(e: PointerEvent, renderer: MolRenderer, state: TransformState) {
  if (!state.dragging || !state.fragmentIds || !state.targetObjectId) return

  const dx = e.clientX - state.lastX
  const dy = e.clientY - state.lastY
  state.lastX = e.clientX
  state.lastY = e.clientY
  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return

  const { objectsById, setObjectAtomPositions } = useMoleculeStore.getState()
  const mol = objectsById[state.targetObjectId]?.molecule
  if (!mol) return
  const moving = mol.atoms.filter(a => state.fragmentIds!.has(a.id))

  if (e.altKey) {
    let cx = 0, cy = 0, cz = 0
    for (const a of moving) { cx += a.x; cy += a.y; cz += a.z }
    cx /= moving.length; cy /= moving.length; cz /= moving.length
    const ay = dx * 0.008, ax = dy * 0.008
    const cosY = Math.cos(ay), sinY = Math.sin(ay)
    const cosX = Math.cos(ax), sinX = Math.sin(ax)
    const positions = new Map(mol.atoms.map(a => [a.id, { x: a.x, y: a.y, z: a.z }]))
    for (const atom of moving) {
      let x = atom.x - cx, y = atom.y - cy, z = atom.z - cz
      const nx = x * cosY + z * sinY; const nz1 = -x * sinY + z * cosY; x = nx; z = nz1
      const ny = y * cosX - z * sinX; const nz2 = y * sinX + z * cosX; y = ny; z = nz2
      positions.set(atom.id, { x: cx + x, y: cy + y, z: cz + z })
    }
    setObjectAtomPositions(state.targetObjectId, positions)
  } else {
    const delta = renderer.screenDeltaToModelLocal(dx, dy)
    const positions = new Map(mol.atoms.map(a => [a.id, { x: a.x, y: a.y, z: a.z }]))
    for (const atom of moving) {
      positions.set(atom.id, { x: atom.x + delta.x, y: atom.y + delta.y, z: atom.z + delta.z })
    }
    setObjectAtomPositions(state.targetObjectId, positions)
  }
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

function shouldStartBoxSelect(e: PointerEvent, pickedAtomId: string | null, selectedAtomIds: Set<string>): boolean {
  const isRight      = e.button === 2
  const isShiftLeft  = e.button === 0 && e.shiftKey
  if (!isRight && !isShiftLeft) return false
  if (!pickedAtomId) return true
  // 右键点中已选原子 → 留给 AtomContextMenu
  if (isRight && selectedAtomIds.has(pickedAtomId)) return false
  // Shift+左键点原子 → 留给 shift+click 原子多选
  if (isShiftLeft) return false
  return true
}

function finishBoxSelect(
  state: BoxSelectState,
  canvas: HTMLCanvasElement,
  renderer: MolRenderer,
) {
  const rect = canvas.getBoundingClientRect()
  const minX = Math.min(state.startX, state.currentX)
  const maxX = Math.max(state.startX, state.currentX)
  const minY = Math.min(state.startY, state.currentY)
  const maxY = Math.max(state.startY, state.currentY)
  if (maxX - minX < 3 && maxY - minY < 3) return   // 误触不动选择

  const { selectAtoms } = useMoleculeStore.getState()
  const molecule = selectActiveMoleculeOrEmpty(useMoleculeStore.getState())
  const w = rect.width, h = rect.height
  const hit: string[] = []
  const v = new THREE.Vector3()
  for (const a of molecule.atoms) {
    v.set(a.x, a.y, a.z)
    const p = renderer.projectLocalToScreen(v, w, h)
    if (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY) hit.push(a.id)
  }
  const mode = state.shift ? 'add' : state.alt ? 'subtract' : 'replace'
  selectAtoms(hit, mode)
}

// ── 公开 Hook ─────────────────────────────────────────────────────────────────

export function useCanvasPointerRouter(
  containerRef: RefObject<HTMLDivElement | null>,
  rendererRef: RefObject<MolRenderer | null>,
): { boxRect: BoxRect | null } {
  const activeTool = useEditorStore(s => s.activeTool)
  const [boxRect, setBoxRect] = useState<BoxRect | null>(null)

  const transformRef = useRef<TransformState>(makeTransformState())
  const boxRef       = useRef<BoxSelectState>(makeBoxState())

  // 同步相机控制开关
  useEffect(() => {
    const r = rendererRef.current
    if (r) r.controls.enabled = activeTool !== 'move-object'
  }, [activeTool, rendererRef])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const getRenderer = () => rendererRef.current
    const getCanvas   = () => rendererRef.current?.canvas ?? null

    // ── pointerdown（container capture 阶段）────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const renderer = getRenderer()
      const canvas   = getCanvas()
      if (!renderer || !canvas) return

      const { activeTool: tool } = useEditorStore.getState()
      const { selectedAtomIds } = useMoleculeStore.getState()

      // 1. move-object 工具 → 对象变换
      if (tool === 'move-object') {
        e.stopImmediatePropagation()
        handleTransformDown(e, canvas, renderer, transformRef.current)
        return
      }

      // 2. 框选条件
      const pickedAtomId = renderer.pickAtomIdAt(e.clientX, e.clientY)
      if (shouldStartBoxSelect(e, pickedAtomId, selectedAtomIds)) {
        e.stopImmediatePropagation()
        const rect = canvas.getBoundingClientRect()
        const bx = e.clientX - rect.left
        const by = e.clientY - rect.top
        const bs = boxRef.current
        bs.active = true; bs.startX = bx; bs.startY = by
        bs.currentX = bx; bs.currentY = by
        bs.shift = e.shiftKey; bs.alt = e.altKey || e.metaKey
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
        handleTransformMove(e, renderer, transformRef.current)
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
        ts.dragging = false; ts.fragmentIds = null; ts.targetObjectId = null
        return
      }

      // 框选结束
      const bs = boxRef.current
      if (bs.active) {
        bs.active = false
        setBoxRect(null)
        if (canvas && renderer) finishBoxSelect(bs, canvas, renderer)
      }
    }

    // container capture 拦截 down；canvas bubble 处理 move/up（pointer capture 保证）
    container.addEventListener('pointerdown', onDown, { capture: true })
    container.addEventListener('pointermove', onMove)
    container.addEventListener('pointerup',   onUp)

    return () => {
      container.removeEventListener('pointerdown', onDown, { capture: true } as AddEventListenerOptions)
      container.removeEventListener('pointermove', onMove)
      container.removeEventListener('pointerup',   onUp)
    }
  }, [containerRef, rendererRef])

  return { boxRect }
}
