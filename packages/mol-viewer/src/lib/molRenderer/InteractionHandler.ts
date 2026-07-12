import * as THREE from 'three'
import type { MolControls } from '../controls/MolControls'
import { INTERACTION } from '../../config/interaction.config'
import { GhostVisuals } from './GhostVisuals'
import { InteractionPicker } from './InteractionPicker'
import {
  advanceInteractionGesture,
  activeAtomDragId,
  beginAtomPress,
  beginBondPress,
  idleInteractionGesture,
  isAtomGesture,
  isBondGesture,
  updateBondDragTarget,
  type InteractionGestureState,
} from './interactionGestureState'

import type { GrowGuideSpec } from '../types'
export type { GrowGuideSpec }

interface PendingAtomClick {
  readonly atomId: string
  readonly event: MouseEvent
  readonly callback: InteractionHandler['onAtomClick']
  readonly clientX: number
  readonly clientY: number
  readonly timeStamp: number
  readonly timer: ReturnType<typeof setTimeout>
}

/**
 * canvas 指针事件的手势状态机：点击拾取、原子拖拽、bond-drag（成键/拖出生长）。
 * 通过回调与外部通信，不持有 store 引用；预览视觉委托给 GhostVisuals。
 */
export class InteractionHandler {
  onAtomClick?: (id: string, event: MouseEvent) => void
  onAtomDoubleClick?: (id: string, event: MouseEvent) => void
  onBondClick?: (id: string, event: MouseEvent) => void
  /** viewDirLocal：相机视线方向（模型局部坐标），供放置片段时朝向相机 */
  onBackgroundClick?: (worldPos: THREE.Vector3, event: MouseEvent, viewDirLocal?: THREE.Vector3) => void
  onAtomDragStart?: (id: string) => void
  onAtomDrag?: (id: string, x: number, y: number, z: number) => void
  onAtomDragEnd?: (id: string) => void
  canDragAtom?: (id: string) => boolean
  /** 返回 true 表示进入 bond-drag 模式，此次 pointerdown 不再走 atomDrag / click */
  onBondDragStart?: (sourceId: string) => boolean
  /**
   * bond-drag 松手：targetId 非空 = 拖到了已有原子（成键）；
   * targetId 为空且 dropLocal 非空 = 拖到空白（在 dropLocal 处生长新原子+键）。
   * 位移小于阈值时不会触发（视为普通点击）。
   */
  onBondDragEnd?: (sourceId: string, targetId: string | null, dropLocal: THREE.Vector3 | null) => void
  onBondDragHover?: (targetId: string | null) => void
  /**
   * 拖出生长预览：返回新原子的落点（已做 VSEPR 吸附）与外观。
   * 返回 null 表示当前不允许生长（不画幽灵原子）。
   */
  getGrowPreview?: (sourceId: string, cursorLocal: THREE.Vector3, freeDirection: boolean)
    => { pos: THREE.Vector3; radius: number; color: number } | null
  /** 拖出生长开始时调用一次，返回候选槽位参考几何（环/点），用于空间感提示 */
  getGrowGuide?: (sourceId: string) => GrowGuideSpec
  /** 平面草图模式：非空时绘制/拖动都约束在该平面（模型局部坐标） */
  sketchPlane: { origin: THREE.Vector3; normal: THREE.Vector3 } | null = null

  private _ghost: GhostVisuals
  private _picker: InteractionPicker
  private _gesture: InteractionGestureState = idleInteractionGesture()
  private _atomDragPlane: THREE.Plane | null = null
  private _suppressNextClick = false
  private _idleCursor = ''
  private _activePointerId: number | null = null
  private _pendingAtomClick: PendingAtomClick | null = null
  private _ignoreNextNativeDoubleClick = false
  // 任意左键按下的位置：浏览器在拖拽（如转相机）松手后仍会派发 click，
  // 用按下→抬起的位移判断"这不是一次点击"，避免旋转视角误触发点击语义
  private _downClient = new THREE.Vector2()

  constructor(
    private canvas: HTMLCanvasElement,
    private camera: THREE.PerspectiveCamera,
    private rotationGroup: THREE.Group,
    private modelGroup: THREE.Group,
    private controls: MolControls,
    private getAtomMeshes: () => Map<string, THREE.Mesh>,
    private getBondMeshes: () => Map<string, THREE.Group>,
    invalidate: () => void = () => undefined,
  ) {
    this._ghost = new GhostVisuals(canvas, camera, modelGroup, invalidate)
    this._picker = new InteractionPicker(canvas, camera, getAtomMeshes, getBondMeshes)
    canvas.addEventListener('click', this.handleClick)
    canvas.addEventListener('dblclick', this.handleDblClick)
    canvas.addEventListener('pointerdown', this.handlePointerDown, { capture: true })
    canvas.addEventListener('pointermove', this.handlePointerMove)
    canvas.addEventListener('pointerup', this.handlePointerUp)
    canvas.addEventListener('pointercancel', this.handlePointerCancel)
  }

  get idleCursor(): string { return this._idleCursor }

  set idleCursor(value: string) {
    this._idleCursor = value
    if (this._gesture.kind === 'idle') this.canvas.style.cursor = value
  }

  /** 按下→抬起位移超过阈值：是拖拽（转相机等）不是点击 */
  private movedSinceDown(e: MouseEvent): boolean {
    const dx = e.clientX - this._downClient.x
    const dy = e.clientY - this._downClient.y
    return Math.sqrt(dx * dx + dy * dy) >= INTERACTION.dragStartThreshold
  }

  private cancelPendingAtomClick() {
    if (!this._pendingAtomClick) return
    clearTimeout(this._pendingAtomClick.timer)
    this._pendingAtomClick = null
  }

  private flushPendingAtomClick() {
    const pending = this._pendingAtomClick
    if (!pending) return
    clearTimeout(pending.timer)
    this._pendingAtomClick = null
    pending.callback?.(pending.atomId, pending.event)
  }

  private handleAtomClickCandidate(atomId: string, event: MouseEvent) {
    if (!this.onAtomDoubleClick) {
      this.onAtomClick?.(atomId, event)
      return
    }

    const pending = this._pendingAtomClick
    if (pending) {
      const elapsed = event.timeStamp - pending.timeStamp
      const distance = Math.hypot(
        event.clientX - pending.clientX,
        event.clientY - pending.clientY,
      )
      if (
        pending.atomId === atomId &&
        elapsed >= 0 &&
        elapsed <= INTERACTION.doubleClickDelay &&
        distance <= INTERACTION.doubleClickDistance
      ) {
        this.cancelPendingAtomClick()
        this._ignoreNextNativeDoubleClick = true
        this.onAtomDoubleClick(atomId, event)
        return
      }
      this.flushPendingAtomClick()
    }

    if (event.detail > 1) this._ignoreNextNativeDoubleClick = true
    const callback = this.onAtomClick
    const timer = setTimeout(() => this.flushPendingAtomClick(), INTERACTION.doubleClickDelay)
    this._pendingAtomClick = {
      atomId,
      event,
      callback,
      clientX: event.clientX,
      clientY: event.clientY,
      timeStamp: event.timeStamp,
      timer,
    }
  }

  private handleClick = (e: MouseEvent) => {
    if (this._suppressNextClick) { this._suppressNextClick = false; return }
    if (this.movedSinceDown(e)) return
    const atomId = this._picker.atomIdAt(e.clientX, e.clientY)
    if (atomId) {
      this.handleAtomClickCandidate(atomId, e)
      return
    }
    this.flushPendingAtomClick()
    const bondId = this._picker.bondIdAt(e.clientX, e.clientY)
    if (bondId) {
      this.onBondClick?.(bondId, e)
      return
    }

    const bg = this.backgroundPosAt(this._picker.raycasterAt(e.clientX, e.clientY))
    if (bg) this.onBackgroundClick?.(bg.localPos, e, bg.viewDirLocal)
  }

  /**
   * 空白点击的落点：草图模式用草图平面；否则取距点击射线最近的已有原子所在
   * 平面（垂直相机），保证"看上去放在分子旁边"就真的在分子旁边
   */
  private backgroundPosAt(raycaster: THREE.Raycaster): { localPos: THREE.Vector3; viewDirLocal: THREE.Vector3 } | null {
    const camDir = new THREE.Vector3()
    this.camera.getWorldDirection(camDir)
    let plane: THREE.Plane
    if (this.sketchPlane) {
      plane = this.sketchPlaneWorld()
    } else {
      const planePoint = new THREE.Vector3()
      this.rotationGroup.getWorldPosition(planePoint)
      let bestDist = Infinity
      const wp = new THREE.Vector3()
      for (const mesh of this.getAtomMeshes().values()) {
        mesh.getWorldPosition(wp)
        const d = raycaster.ray.distanceToPoint(wp)
        if (d < bestDist) { bestDist = d; planePoint.copy(wp) }
      }
      plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camDir, planePoint)
    }
    const worldPos = new THREE.Vector3()
    if (!raycaster.ray.intersectPlane(plane, worldPos)) return null
    const localPos = this.modelGroup.worldToLocal(worldPos.clone())
    const invWorld = this.modelGroup.matrixWorld.clone().invert()
    const viewDirLocal = camDir.clone().transformDirection(invWorld)
    return { localPos, viewDirLocal }
  }

  /** 草图平面 → 世界坐标 THREE.Plane */
  private sketchPlaneWorld(): THREE.Plane {
    const sp = this.sketchPlane!
    const normalW = sp.normal.clone().transformDirection(this.modelGroup.matrixWorld)
    const pointW = this.modelGroup.localToWorld(sp.origin.clone())
    return new THREE.Plane().setFromNormalAndCoplanarPoint(normalW, pointW)
  }

  private handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return
    this._downClient.set(e.clientX, e.clientY)
    const hit = this._picker.atomHitAt(e.clientX, e.clientY)
    if (!hit) return
    const atomId = hit.object.userData.id as string

    // ── Bond-drag 模式（优先于原子位置拖拽）────────────────────────────────
    // 此时还不知道是点击还是拖拽：先进入候选状态，位移超过阈值才算拖拽，
    // 否则在 pointerup 放行 click（点击生长由 click 处理器负责）
    if (this.onBondDragStart?.(atomId)) {
      this._gesture = beginBondPress(atomId, { x: e.clientX, y: e.clientY })
      this.setGhostLineStart(atomId)
      this.controls.enabled = false
      e.stopImmediatePropagation()
      this.canvas.setPointerCapture(e.pointerId)
      this._activePointerId = e.pointerId
      return
    }

    // ── 原子位置拖拽 ────────────────────────────────────────────────────────
    if (!this.onAtomDrag) return
    if (this.canDragAtom && !this.canDragAtom(atomId)) return

    this._gesture = beginAtomPress(atomId, { x: e.clientX, y: e.clientY })
    if (this.sketchPlane) {
      // 草图模式：原子拖动约束在平面内
      this._atomDragPlane = this.sketchPlaneWorld()
    } else {
      const atomWorldPos = new THREE.Vector3()
      ;(hit.object as THREE.Mesh).getWorldPosition(atomWorldPos)
      const camDir = new THREE.Vector3()
      this.camera.getWorldDirection(camDir)
      this._atomDragPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(camDir, atomWorldPos)
    }
    this.controls.enabled = false
    e.stopImmediatePropagation()
    this.canvas.setPointerCapture(e.pointerId)
    this._activePointerId = e.pointerId
  }

  private handlePointerMove = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const my = -((e.clientY - rect.top) / rect.height) * 2 + 1
    const previous = this._gesture
    this._gesture = advanceInteractionGesture(
      previous,
      { x: e.clientX, y: e.clientY },
      INTERACTION.dragStartThreshold,
    )

    if (isBondGesture(this._gesture)) {
      if (this._gesture.kind === 'bond-press') return
      const sourceId = this._gesture.sourceId
      if (previous.kind === 'bond-press') {
        const guide = this.getGrowGuide?.(sourceId)
        if (guide) this._ghost.showGuide(guide)
      }

      const ray = new THREE.Raycaster()
      ray.setFromCamera(new THREE.Vector2(mx, my), this.camera)
      let plane: THREE.Plane
      if (this.sketchPlane) {
        plane = this.sketchPlaneWorld()
      } else {
        const camDir = new THREE.Vector3()
        this.camera.getWorldDirection(camDir)
        const lineStart = this._ghost.lineStartPos
        if (!lineStart) return
        const startWorld = this.modelGroup.localToWorld(lineStart.clone())
        plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camDir, startWorld)
      }
      const endWorld = new THREE.Vector3()
      if (!ray.ray.intersectPlane(plane, endWorld)) return
      const cursorLocal = this.modelGroup.worldToLocal(endWorld)
      let endLocal = cursorLocal

      const hoveredId = this.pickAtomIdAt(e.clientX, e.clientY)
      const targetId = hoveredId !== null && hoveredId !== sourceId ? hoveredId : null
      if (targetId !== this._gesture.targetId) this.onBondDragHover?.(targetId)

      if (targetId) {
        const targetMesh = this.getAtomMeshes().get(targetId)
        if (targetMesh) endLocal = targetMesh.position.clone()
        this._gesture = updateBondDragTarget(this._gesture, targetId, null)
        this._ghost.removeAtom()
        this.canvas.style.cursor = 'cell'
      } else {
        let preview: { pos: THREE.Vector3; radius: number; color: number } | null = null
        const spec = this._ghost.guideSpec
        if (!e.shiftKey && spec) {
          const pos = this._ghost.pickOnGuide(e.clientX, e.clientY)
          if (pos) preview = { pos, radius: spec.ghostRadius, color: spec.ghostColor }
        }
        if (!preview) preview = this.getGrowPreview?.(sourceId, cursorLocal, e.shiftKey) ?? null

        this._gesture = updateBondDragTarget(this._gesture, null, preview?.pos ?? null)
        if (preview) {
          endLocal = preview.pos
          this._ghost.showAtom(preview.pos, preview.radius, preview.color)
        } else {
          this._ghost.removeAtom()
        }
        this.canvas.style.cursor = 'crosshair'
      }

      this._ghost.updateLine(endLocal, targetId !== null)
      return
    }

    if (!isAtomGesture(this._gesture) || !this._atomDragPlane) return
    if (this._gesture.kind === 'atom-press') return
    if (previous.kind === 'atom-press') this.onAtomDragStart?.(this._gesture.atomId)

    const ray = new THREE.Raycaster()
    ray.setFromCamera(new THREE.Vector2(mx, my), this.camera)
    const worldPos = new THREE.Vector3()
    if (!ray.ray.intersectPlane(this._atomDragPlane, worldPos)) return
    const localPos = this.modelGroup.worldToLocal(worldPos.clone())
    this.onAtomDrag?.(this._gesture.atomId, localPos.x, localPos.y, localPos.z)
  }

  private handlePointerUp = (e: PointerEvent) => {
    if (e.button !== 0) return
    const gesture = this._gesture

    // ── Bond-drag 结束 ──────────────────────────────────────────────────────
    if (isBondGesture(gesture)) {
      if (gesture.kind === 'bond-drag') {
        const targetId = this.pickAtomIdAt(e.clientX, e.clientY)
        const validTarget = targetId !== null && targetId !== gesture.sourceId
        const dropPosition = gesture.dropPosition
          ? new THREE.Vector3(
              gesture.dropPosition.x,
              gesture.dropPosition.y,
              gesture.dropPosition.z,
            )
          : null
        this.onBondDragEnd?.(
          gesture.sourceId,
          validTarget ? targetId : null,
          validTarget ? null : dropPosition,
        )
        this._suppressNextClick = true
      }
      // 未超过阈值：视为点击，放行 click 事件（点击生长 / 换元素由 click 处理）
      this.resetInteractionGesture()
      return
    }

    // ── 原子位置拖拽结束 ────────────────────────────────────────────────────
    if (isAtomGesture(gesture)) {
      if (gesture.kind === 'atom-drag') {
        this.onAtomDragEnd?.(gesture.atomId)
        this._suppressNextClick = true
      }
      this.resetInteractionGesture()
    }
  }

  private handlePointerCancel = () => {
    this.cancelActiveGesture()
  }

  /** Cancel before callbacks are detached so active edit sessions always close. */
  cancelActiveGesture() {
    this.cancelPendingAtomClick()
    this._ignoreNextNativeDoubleClick = false
    const atomId = activeAtomDragId(this._gesture)
    if (atomId) this.onAtomDragEnd?.(atomId)
    this.resetInteractionGesture()
  }

  /** 所有 pointer 手势共享同一复位出口，避免残留 drag/transaction 状态。 */
  private resetInteractionGesture() {
    if (isBondGesture(this._gesture)) {
      this.onBondDragHover?.(null)
      this._ghost.clear()
    }
    this._gesture = idleInteractionGesture()
    this._atomDragPlane = null
    if (
      this._activePointerId !== null &&
      this.canvas.hasPointerCapture(this._activePointerId)
    ) {
      this.canvas.releasePointerCapture(this._activePointerId)
    }
    this._activePointerId = null
    this.controls.enabled = true
    this.canvas.style.cursor = this._idleCursor
  }

  private handleDblClick = (e: MouseEvent) => {
    if (this._ignoreNextNativeDoubleClick) {
      this._ignoreNextNativeDoubleClick = false
      return
    }
    if (this.movedSinceDown(e)) return
    const atomId = this._picker.atomIdAt(e.clientX, e.clientY)
    if (atomId) {
      this.cancelPendingAtomClick()
      this.onAtomDoubleClick?.(atomId, e)
      return
    }
  }

  setGhostLineStart(atomId: string | null) {
    const mesh = atomId ? this.getAtomMeshes().get(atomId) : undefined
    this._ghost.setLineStart(mesh ? mesh.position : null)
  }

  /** 在屏幕像素处做原子拾取，供 overlay 判断是否拦截事件 */
  pickAtomIdAt(clientX: number, clientY: number): string | null {
    return this._picker.atomIdAt(clientX, clientY)
  }

  /** 在屏幕像素处做键拾取（路由层判断 Shift+点键时不进框选） */
  pickBondIdAt(clientX: number, clientY: number): string | null {
    return this._picker.bondIdAt(clientX, clientY)
  }

  dispose() {
    this.cancelActiveGesture()
    this.canvas.removeEventListener('click', this.handleClick)
    this.canvas.removeEventListener('dblclick', this.handleDblClick)
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown, { capture: true } as AddEventListenerOptions)
    this.canvas.removeEventListener('pointermove', this.handlePointerMove)
    this.canvas.removeEventListener('pointerup', this.handlePointerUp)
    this.canvas.removeEventListener('pointercancel', this.handlePointerCancel)
    this._ghost.dispose()
    this.canvas.style.cursor = ''
  }
}
