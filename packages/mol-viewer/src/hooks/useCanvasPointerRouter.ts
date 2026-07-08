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
import { activateAndResolve } from '../lib/builder/queries'
import { toolCan } from '../config/toolCapabilities.config'
import { INTERACTION } from '../config/interaction.config'

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

  const pickedAtomId = renderer.pickAtomIdAt(e.clientX, e.clientY)

  if (pickedAtomId) {
    // 点中的原子可能属于非 active 分子：激活宿主对象（不可见/锁定则中止手势）
    const resolved = activateAndResolve(
      pickedAtomId,
      id => useMoleculeStore.getState().activateObjectContainingAtom(id),
      () => {
        const { objectsById, activeObjectId } = useMoleculeStore.getState()   // 激活是同步 set，重新读取
        return activeObjectId ? objectsById[activeObjectId]?.molecule : undefined
      },
    )
    if (!resolved) return
    state.fragmentIds = resolved.fragment
    state.targetObjectId = useMoleculeStore.getState().activeObjectId
  } else if (e.altKey) {
    const { objectsById, activeObjectId: curActive } = useMoleculeStore.getState()
    const mol = curActive ? objectsById[curActive]?.molecule : undefined
    if (!curActive || !mol || mol.atoms.length === 0) return
    state.fragmentIds = new Set(mol.atoms.map(a => a.id))
    state.targetObjectId = curActive
  } else {
    return
  }

  state.dragging = true
  state.lastX = e.clientX
  state.lastY = e.clientY
  canvas.setPointerCapture(e.pointerId)
  useMoleculeStore.getState().beginTransaction()
}

function handleTransformMove(e: PointerEvent, renderer: MolRenderer, state: TransformState) {
  if (!state.dragging || !state.fragmentIds || !state.targetObjectId) return

  const dx = e.clientX - state.lastX
  const dy = e.clientY - state.lastY
  state.lastX = e.clientX
  state.lastY = e.clientY
  if (Math.abs(dx) < INTERACTION.transformMinDisplacement && Math.abs(dy) < INTERACTION.transformMinDisplacement) return

  const { objectsById, setObjectAtomPositions } = useMoleculeStore.getState()
  const mol = objectsById[state.targetObjectId]?.molecule
  if (!mol) return
  const moving = mol.atoms.filter(a => state.fragmentIds!.has(a.id))

  if (e.altKey) {
    // 屏幕空间 trackball：绕「垂直于拖动方向的屏幕轴」旋转，再换算到模型局部坐标。
    // 和相机视图旋转（MolControls）同一套手感——任意方向自由 360°，
    // 修掉原世界轴 Euler（转盘）在视角转过后轴向错位、越转越别扭的问题。
    // 上游 transformMinDisplacement 已挡掉 <0.5px 的抖动，故 r 恒 >0，可安全做除数
    const r = Math.hypot(dx, dy)
    const angle = r * INTERACTION.rotateSpeedFactor
    // 相机看 -Z、无 roll：屏幕 X=世界 X、屏幕 Y=世界 Y；轴垂直于拖动方向
    const axisWorld = new THREE.Vector3(dy / r, dx / r, 0)
    // 世界轴 → 模型局部轴（模型→世界旋转求逆），令可视旋转正好绕该屏幕轴
    const mWorldQ = new THREE.Quaternion()
    renderer.modelGroup.getWorldQuaternion(mWorldQ)
    const axisLocal = axisWorld.applyQuaternion(mWorldQ.invert()).normalize()
    const rot = new THREE.Quaternion().setFromAxisAngle(axisLocal, angle)

    let cx = 0, cy = 0, cz = 0
    for (const a of moving) { cx += a.x; cy += a.y; cz += a.z }
    cx /= moving.length; cy /= moving.length; cz /= moving.length

    const v = new THREE.Vector3()
    const positions = new Map(mol.atoms.map(a => [a.id, { x: a.x, y: a.y, z: a.z }]))
    for (const atom of moving) {
      v.set(atom.x - cx, atom.y - cy, atom.z - cz).applyQuaternion(rot)
      positions.set(atom.id, { x: cx + v.x, y: cy + v.y, z: cz + v.z })
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

function shouldStartBoxSelect(
  e: PointerEvent,
  pickedAtomId: string | null,
  pickedBondId: string | null,
  selectedAtomIds: Set<string>,
): boolean {
  const isRight      = e.button === 2
  const isShiftLeft  = e.button === 0 && e.shiftKey
  if (!isRight && !isShiftLeft) return false
  // Shift+左键点中原子/键 → 留给 InteractionHandler（原子多选 / 键长循环）
  if (isShiftLeft) return !pickedAtomId && !pickedBondId
  if (!pickedAtomId) return true
  // 右键点中已选原子 → 留给 AtomContextMenu
  if (selectedAtomIds.has(pickedAtomId)) return false
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
  if (maxX - minX < INTERACTION.boxSelectMinSize && maxY - minY < INTERACTION.boxSelectMinSize) return

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
  readOnly = false,
): { boxRect: BoxRect | null } {
  const activeTool = useEditorStore(s => s.activeTool)
  const [boxRect, setBoxRect] = useState<BoxRect | null>(null)

  const transformRef = useRef<TransformState>(makeTransformState())
  const boxRef       = useRef<BoxSelectState>(makeBoxState())

  // 同步相机控制开关；切换工具时清理可能残留的变换状态（防止 pointerup 未触发导致状态卡死）
  useEffect(() => {
    const r = rendererRef.current
    if (r) r.controls.enabled = readOnly || !toolCan(activeTool, 'transformsObject')
    if (readOnly || !toolCan(activeTool, 'transformsObject')) {
      const ts = transformRef.current
      if (ts.dragging) {
        // 工具切换时强制关闭未完成的 transaction，防止 zundo 永久 paused
        useMoleculeStore.getState().endTransaction()
      }
      ts.dragging = false
      ts.fragmentIds = null
      ts.targetObjectId = null
      const bs = boxRef.current
      if (bs.active) {
        bs.active = false
        setBoxRect(null)
      }
    }
  }, [activeTool, readOnly, rendererRef])

  useEffect(() => {
    if (readOnly) {
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

      const { activeTool: tool } = useEditorStore.getState()
      const { selectedAtomIds } = useMoleculeStore.getState()

      // 1. move-object 工具 → 对象变换
      if (toolCan(tool, 'transformsObject')) {
        e.stopImmediatePropagation()
        handleTransformDown(e, canvas, renderer, transformRef.current)
        return
      }

      // 2. 框选条件
      const pickedAtomId = renderer.pickAtomIdAt(e.clientX, e.clientY)
      const pickedBondId = pickedAtomId ? null : renderer.pickBondIdAt(e.clientX, e.clientY)
      if (shouldStartBoxSelect(e, pickedAtomId, pickedBondId, selectedAtomIds)) {
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
        useMoleculeStore.getState().endTransaction()
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

    // ── pointercancel（触屏手势抢占等）────────────────────────────────────────
    // 拖拽中被 cancel 时若不清理，beginTransaction 会悬挂（zundo 永久 paused）
    const onCancel = () => {
      const ts = transformRef.current
      if (ts.dragging) {
        ts.dragging = false; ts.fragmentIds = null; ts.targetObjectId = null
        useMoleculeStore.getState().endTransaction()
      }
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
      container.removeEventListener('pointerdown', onDown, { capture: true } as AddEventListenerOptions)
      container.removeEventListener('pointermove', onMove)
      container.removeEventListener('pointerup',   onUp)
      container.removeEventListener('pointercancel', onCancel)
    }
  }, [containerRef, rendererRef, readOnly])

  return { boxRect }
}
