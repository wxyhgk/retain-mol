import * as THREE from 'three'
import type { MolControls } from '../controls/MolControls'
import { GHOST_LINE } from '../../config/render.config'

/**
 * 封装 canvas 上的指针事件：点击拾取、原子拖拽、ghost 键预览线。
 * 通过回调与外部通信，不持有 store 引用。
 */
export class InteractionHandler {
  onAtomClick?: (id: string, event: MouseEvent) => void
  onAtomDoubleClick?: (id: string, event: MouseEvent) => void
  onBondClick?: (id: string, event: MouseEvent) => void
  onBackgroundClick?: (worldPos: THREE.Vector3, event: MouseEvent) => void
  onAtomDragStart?: (id: string) => void
  onAtomDrag?: (id: string, x: number, y: number, z: number) => void
  onAtomDragEnd?: (id: string) => void
  canDragAtom?: (id: string) => boolean

  private _dragAtomId: string | null = null
  private _dragPlane: THREE.Plane | null = null
  private _dragging = false
  private _mouseDownPos = new THREE.Vector2()
  private ghostLine: THREE.Line | null = null
  private _ghostStart: THREE.Vector3 | null = null

  constructor(
    private canvas: HTMLCanvasElement,
    private camera: THREE.PerspectiveCamera,
    private rotationGroup: THREE.Group,
    private modelGroup: THREE.Group,
    private controls: MolControls,
    private getAtomMeshes: () => Map<string, THREE.Mesh>,
    private getBondMeshes: () => Map<string, THREE.Group>,
  ) {
    canvas.addEventListener('click', this.handleClick)
    canvas.addEventListener('dblclick', this.handleDblClick)
    canvas.addEventListener('pointerdown', this.handlePointerDown, { capture: true })
    canvas.addEventListener('pointermove', this.handlePointerMove)
    canvas.addEventListener('pointerup', this.handlePointerUp)
  }

  private handleClick = (e: MouseEvent) => {
    if (this._dragging) { this._dragging = false; return }
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

    const camDir = new THREE.Vector3()
    this.camera.getWorldDirection(camDir)
    const pivotWorld = new THREE.Vector3()
    this.rotationGroup.getWorldPosition(pivotWorld)
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camDir, pivotWorld)
    const worldPos = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, worldPos)
    const localPos = this.modelGroup.worldToLocal(worldPos.clone())
    this.onBackgroundClick?.(localPos, e)
  }

  private handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || !this.onAtomDrag) return
    const rect = this.canvas.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    )
    this._mouseDownPos.set(e.clientX, e.clientY)

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, this.camera)
    const hits = raycaster.intersectObjects([...this.getAtomMeshes().values()])
    if (hits.length === 0) return
    const atomId = hits[0].object.userData.id
    if (this.canDragAtom && !this.canDragAtom(atomId)) return

    this._dragAtomId = atomId
    const atomWorldPos = new THREE.Vector3()
    ;(hits[0].object as THREE.Mesh).getWorldPosition(atomWorldPos)
    const camDir = new THREE.Vector3()
    this.camera.getWorldDirection(camDir)
    this._dragPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(camDir, atomWorldPos)
    this.controls.enabled = false
    e.stopImmediatePropagation()
    this.canvas.setPointerCapture(e.pointerId)
  }

  private handlePointerMove = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const my = -((e.clientY - rect.top) / rect.height) * 2 + 1

    if (this.ghostLine && this._ghostStart) {
      const ray = new THREE.Raycaster()
      ray.setFromCamera(new THREE.Vector2(mx, my), this.camera)
      const camDir = new THREE.Vector3()
      this.camera.getWorldDirection(camDir)
      const startWorld = this.modelGroup.localToWorld(this._ghostStart.clone())
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camDir, startWorld)
      const endWorld = new THREE.Vector3()
      ray.ray.intersectPlane(plane, endWorld)
      const endLocal = this.modelGroup.worldToLocal(endWorld)
      const positions = new Float32Array([
        this._ghostStart.x, this._ghostStart.y, this._ghostStart.z,
        endLocal.x, endLocal.y, endLocal.z,
      ])
      this.ghostLine.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      this.ghostLine.geometry.attributes.position.needsUpdate = true
    }

    if (!this._dragAtomId || !this._dragPlane) return
    const dx = e.clientX - this._mouseDownPos.x
    const dy = e.clientY - this._mouseDownPos.y
    if (!this._dragging && Math.sqrt(dx * dx + dy * dy) < 4) return

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

  private handleDblClick = (e: MouseEvent) => {
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
    }
  }

  setGhostLineStart(atomId: string | null) {
    this.removeGhostLine()
    if (!atomId) return
    const mesh = this.getAtomMeshes().get(atomId)
    if (!mesh) return

    const geo = new THREE.BufferGeometry().setFromPoints([
      mesh.position.clone(),
      mesh.position.clone(),
    ])
    const mat = new THREE.LineBasicMaterial({
      color: GHOST_LINE.color,
      linewidth: GHOST_LINE.linewidth,
      transparent: true,
      opacity: GHOST_LINE.opacity,
    })
    this.ghostLine = new THREE.Line(geo, mat)
    this.modelGroup.add(this.ghostLine)
    this._ghostStart = mesh.position.clone()
  }

  private removeGhostLine() {
    if (this.ghostLine) {
      this.modelGroup.remove(this.ghostLine)
      this.ghostLine.geometry.dispose()
      this.ghostLine = null
    }
    this._ghostStart = null
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

  dispose() {
    this.canvas.removeEventListener('click', this.handleClick)
    this.canvas.removeEventListener('dblclick', this.handleDblClick)
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown, { capture: true } as AddEventListenerOptions)
    this.canvas.removeEventListener('pointermove', this.handlePointerMove)
    this.canvas.removeEventListener('pointerup', this.handlePointerUp)
    this.removeGhostLine()
  }
}
