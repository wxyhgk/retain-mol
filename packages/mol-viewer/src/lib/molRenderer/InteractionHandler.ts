import * as THREE from 'three'
import type { MolControls } from '../controls/MolControls'
import { INTERACTION } from '../../config/interaction.config'
import { GhostVisuals } from './GhostVisuals'

import type { GrowGuideSpec } from '../types'
export type { GrowGuideSpec }

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
  /** 双击空白（放置原子/片段走这里，单击空白只做无害操作） */
  onBackgroundDoubleClick?: (worldPos: THREE.Vector3, event: MouseEvent, viewDirLocal?: THREE.Vector3) => void
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
  private _dragAtomId: string | null = null
  private _dragPlane: THREE.Plane | null = null
  private _dragging = false
  private _mouseDownPos = new THREE.Vector2()
  private _bondDragSourceId: string | null = null
  private _bondDragTarget: string | null = null
  private _bondDragMoved = false
  private _bondDragDownPos = new THREE.Vector2()
  private _growPreviewPos: THREE.Vector3 | null = null
  private _suppressNextClick = false
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
  ) {
    this._ghost = new GhostVisuals(canvas, camera, modelGroup)
    canvas.addEventListener('click', this.handleClick)
    canvas.addEventListener('dblclick', this.handleDblClick)
    canvas.addEventListener('pointerdown', this.handlePointerDown, { capture: true })
    canvas.addEventListener('pointermove', this.handlePointerMove)
    canvas.addEventListener('pointerup', this.handlePointerUp)
    canvas.addEventListener('pointercancel', this.handlePointerCancel)
  }

  /** 按下→抬起位移超过阈值：是拖拽（转相机等）不是点击 */
  private movedSinceDown(e: MouseEvent): boolean {
    const dx = e.clientX - this._downClient.x
    const dy = e.clientY - this._downClient.y
    return Math.sqrt(dx * dx + dy * dy) >= INTERACTION.dragStartThreshold
  }

  private handleClick = (e: MouseEvent) => {
    if (this._dragging) { this._dragging = false; return }
    if (this._suppressNextClick) { this._suppressNextClick = false; return }
    if (this.movedSinceDown(e)) return
    const rect = this.canvas.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    )

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, this.camera)

    const atomObjs = [...this.getAtomMeshes().values()]
    const bondObjs: THREE.Object3D[] = []
    for (const grp of this.getBondMeshes().values()) {
      grp.traverse(c => { if ((c as THREE.Mesh).isMesh) bondObjs.push(c) })
    }

    const atomHits = raycaster.intersectObjects(atomObjs)
    if (atomHits.length > 0) {
      this.onAtomClick?.(atomHits[0].object.userData.id, e)
      return
    }
    const bondHits = raycaster.intersectObjects(bondObjs)
    if (bondHits.length > 0) {
      this.onBondClick?.(bondHits[0].object.userData.id, e)
      return
    }

    const bg = this.backgroundPosAt(raycaster)
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
    const rect = this.canvas.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    )
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, this.camera)
    const hits = raycaster.intersectObjects([...this.getAtomMeshes().values()])
    if (hits.length === 0) return
    const atomId = hits[0].object.userData.id as string

    // ── Bond-drag 模式（优先于原子位置拖拽）────────────────────────────────
    // 此时还不知道是点击还是拖拽：先进入候选状态，位移超过阈值才算拖拽，
    // 否则在 pointerup 放行 click（点击生长由 click 处理器负责）
    if (this.onBondDragStart?.(atomId)) {
      this._bondDragSourceId = atomId
      this._bondDragMoved = false
      this._bondDragDownPos.set(e.clientX, e.clientY)
      this.setGhostLineStart(atomId)
      this.controls.enabled = false
      e.stopImmediatePropagation()
      this.canvas.setPointerCapture(e.pointerId)
      return
    }

    // ── 原子位置拖拽 ────────────────────────────────────────────────────────
    if (!this.onAtomDrag) return
    if (this.canDragAtom && !this.canDragAtom(atomId)) return

    this._mouseDownPos.set(e.clientX, e.clientY)
    this._dragAtomId = atomId
    if (this.sketchPlane) {
      // 草图模式：原子拖动约束在平面内
      this._dragPlane = this.sketchPlaneWorld()
    } else {
      const atomWorldPos = new THREE.Vector3()
      ;(hits[0].object as THREE.Mesh).getWorldPosition(atomWorldPos)
      const camDir = new THREE.Vector3()
      this.camera.getWorldDirection(camDir)
      this._dragPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(camDir, atomWorldPos)
    }
    this.controls.enabled = false
    e.stopImmediatePropagation()
    this.canvas.setPointerCapture(e.pointerId)
  }

  private handlePointerMove = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const my = -((e.clientY - rect.top) / rect.height) * 2 + 1

    if (this._ghost.hasLine) {
      // 计算光标在 modelGroup 局部坐标系中的位置（草图模式投到草图平面）
      const ray = new THREE.Raycaster()
      ray.setFromCamera(new THREE.Vector2(mx, my), this.camera)
      let plane: THREE.Plane
      if (this.sketchPlane) {
        plane = this.sketchPlaneWorld()
      } else {
        const camDir = new THREE.Vector3()
        this.camera.getWorldDirection(camDir)
        const startWorld = this.modelGroup.localToWorld(this._ghost.lineStartPos!.clone())
        plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camDir, startWorld)
      }
      const endWorld = new THREE.Vector3()
      if (!ray.ray.intersectPlane(plane, endWorld)) return
      const cursorLocal = this.modelGroup.worldToLocal(endWorld)

      let endLocal = cursorLocal
      let validTarget = false

      if (this._bondDragSourceId) {
        // 位移未超阈值 → 还是潜在点击，不显示任何预览
        if (!this._bondDragMoved) {
          const dx = e.clientX - this._bondDragDownPos.x
          const dy = e.clientY - this._bondDragDownPos.y
          if (Math.sqrt(dx*dx + dy*dy) < INTERACTION.dragStartThreshold) return
          this._bondDragMoved = true
          // 真正进入拖拽：画出候选槽位参考几何（环 / 点）
          const guide = this.getGrowGuide?.(this._bondDragSourceId)
          if (guide) this._ghost.showGuide(guide)
        }

        // 检测悬停目标，实现吸附 + 颜色变化
        const hoveredId = this.pickAtomIdAt(e.clientX, e.clientY)
        validTarget = hoveredId !== null && hoveredId !== this._bondDragSourceId

        if (hoveredId !== this._bondDragTarget) {
          this._bondDragTarget = hoveredId
          this.onBondDragHover?.(validTarget ? hoveredId : null)
        }

        if (validTarget) {
          const targetMesh = this.getAtomMeshes().get(hoveredId!)
          if (targetMesh) endLocal = targetMesh.position.clone()   // 吸附到目标原子中心
          this._growPreviewPos = null
          this._ghost.removeAtom()
          this.canvas.style.cursor = 'cell'
        } else {
          // 拖到空白：显示生长预览。
          // 候选位选择在屏幕空间求解（环投影离光标最近的点）——环侧视时
          // 用相机平面光标做 3D 点积会失效；Shift/无 guide 时退回 3D 自由方向。
          let preview: { pos: THREE.Vector3; radius: number; color: number } | null = null
          const spec = this._ghost.guideSpec
          if (!e.shiftKey && spec) {
            const pos = this._ghost.pickOnGuide(e.clientX, e.clientY)
            if (pos) preview = { pos, radius: spec.ghostRadius, color: spec.ghostColor }
          }
          if (!preview) {
            preview = this.getGrowPreview?.(this._bondDragSourceId, cursorLocal, e.shiftKey) ?? null
          }
          if (preview) {
            endLocal = preview.pos
            this._growPreviewPos = preview.pos.clone()
            this._ghost.showAtom(preview.pos, preview.radius, preview.color)
          } else {
            this._growPreviewPos = null
            this._ghost.removeAtom()
          }
          this.canvas.style.cursor = 'crosshair'
        }
      }

      this._ghost.updateLine(endLocal, validTarget)
    }

    if (this._bondDragSourceId) return
    if (!this._dragAtomId || !this._dragPlane) return
    const dx = e.clientX - this._mouseDownPos.x
    const dy = e.clientY - this._mouseDownPos.y
    if (!this._dragging && Math.sqrt(dx * dx + dy * dy) < INTERACTION.dragStartThreshold) return

    if (!this._dragging) {
      this._dragging = true
      this.onAtomDragStart?.(this._dragAtomId)
    }

    const ray = new THREE.Raycaster()
    ray.setFromCamera(new THREE.Vector2(mx, my), this.camera)
    const worldPos = new THREE.Vector3()
    ray.ray.intersectPlane(this._dragPlane, worldPos)
    const localPos = this.modelGroup.worldToLocal(worldPos.clone())
    this.onAtomDrag?.(this._dragAtomId, localPos.x, localPos.y, localPos.z)
  }

  private handlePointerUp = (e: PointerEvent) => {
    if (e.button !== 0) return

    // ── Bond-drag 结束 ──────────────────────────────────────────────────────
    if (this._bondDragSourceId) {
      if (this._bondDragMoved) {
        const targetId = this.pickAtomIdAt(e.clientX, e.clientY)
        const validTarget = targetId !== null && targetId !== this._bondDragSourceId
        this.onBondDragEnd?.(
          this._bondDragSourceId,
          validTarget ? targetId : null,
          validTarget ? null : this._growPreviewPos,
        )
        this._suppressNextClick = true
      }
      // 未超过阈值：视为点击，放行 click 事件（点击生长 / 换元素由 click 处理）
      this.resetBondDrag()
      if (this.canvas.hasPointerCapture(e.pointerId)) this.canvas.releasePointerCapture(e.pointerId)
      return
    }

    // ── 原子位置拖拽结束 ────────────────────────────────────────────────────
    if (this._dragAtomId) {
      if (this._dragging) this.onAtomDragEnd?.(this._dragAtomId)
      this._dragAtomId = null
      this._dragPlane = null
      this.controls.enabled = true
      if (this.canvas.hasPointerCapture(e.pointerId)) {
        this.canvas.releasePointerCapture(e.pointerId)
      }
    }
  }

  private handlePointerCancel = () => {
    if (this._bondDragSourceId) {
      this.resetBondDrag()
    }
    if (this._dragAtomId) {
      if (this._dragging) this.onAtomDragEnd?.(this._dragAtomId)
      this._dragAtomId = null
      this._dragPlane = null
      this._dragging = false
      this.controls.enabled = true
    }
  }

  /** bond-drag 状态与预览视觉的统一复位 */
  private resetBondDrag() {
    this.onBondDragHover?.(null)
    this._bondDragTarget = null
    this._bondDragMoved = false
    this._growPreviewPos = null
    this._ghost.clear()
    this._bondDragSourceId = null
    this.controls.enabled = true
    this.canvas.style.cursor = ''
  }

  private handleDblClick = (e: MouseEvent) => {
    if (this.movedSinceDown(e)) return
    const rect = this.canvas.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    )
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, this.camera)
    const hits = raycaster.intersectObjects([...this.getAtomMeshes().values()])
    if (hits.length > 0) {
      this.onAtomDoubleClick?.(hits[0].object.userData.id, e)
      return
    }
    const bg = this.backgroundPosAt(raycaster)
    if (bg) this.onBackgroundDoubleClick?.(bg.localPos, e, bg.viewDirLocal)
  }

  setGhostLineStart(atomId: string | null) {
    const mesh = atomId ? this.getAtomMeshes().get(atomId) : undefined
    this._ghost.setLineStart(mesh ? mesh.position : null)
  }

  /** 在屏幕像素处做原子拾取，供 overlay 判断是否拦截事件 */
  pickAtomIdAt(clientX: number, clientY: number): string | null {
    const rect = this.canvas.getBoundingClientRect()
    const m = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    )
    const rc = new THREE.Raycaster()
    rc.setFromCamera(m, this.camera)
    const hits = rc.intersectObjects([...this.getAtomMeshes().values()])
    return hits.length > 0 ? (hits[0].object.userData.id as string) : null
  }

  /** 在屏幕像素处做键拾取（路由层判断 Shift+点键时不进框选） */
  pickBondIdAt(clientX: number, clientY: number): string | null {
    const rect = this.canvas.getBoundingClientRect()
    const m = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    )
    const rc = new THREE.Raycaster()
    rc.setFromCamera(m, this.camera)
    const bondObjs: THREE.Object3D[] = []
    for (const grp of this.getBondMeshes().values()) {
      grp.traverse(c => { if ((c as THREE.Mesh).isMesh) bondObjs.push(c) })
    }
    const hits = rc.intersectObjects(bondObjs)
    return hits.length > 0 ? (hits[0].object.userData.id as string) : null
  }

  dispose() {
    this.canvas.removeEventListener('click', this.handleClick)
    this.canvas.removeEventListener('dblclick', this.handleDblClick)
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown, { capture: true } as AddEventListenerOptions)
    this.canvas.removeEventListener('pointermove', this.handlePointerMove)
    this.canvas.removeEventListener('pointerup', this.handlePointerUp)
    this.canvas.removeEventListener('pointercancel', this.handlePointerCancel)
    this._ghost.dispose()
  }
}
