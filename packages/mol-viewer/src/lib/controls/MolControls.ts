/**
 * MolControls — NGL 风格的自定义相机控制
 *
 *   scene → rotationGroup → modelGroup
 *
 * 关键设计：三种操作都只动 rotationGroup（和 camera），不动 modelGroup。
 * 这样三者坐标系相互独立，不会互相干扰：
 *   - 左键 drag：arcball → rotationGroup.quaternion（绕自身原点）
 *   - 中键 drag：pan    → rotationGroup.position（世界坐标系，旋转中心跟着 pan 走）
 *   - 右键 drag / 滚轮：dolly → camera.position.z
 *   - 无惯性（松开即停）
 *
 * modelGroup.position 只在 fitToMolecule 时设置（= -bboxCenter），用于把分子质心
 * 对齐到 rotationGroup 原点。之后就不再动。
 */

import * as THREE from 'three'
import { CONTROLS } from '@/config/camera.config'

type State = 'none' | 'rotate' | 'pan' | 'dolly'

export type ControlsEvent = 'interactionstart' | 'interactionend' | 'wheel'

export class MolControls {
  enabled = true
  rotateSpeed = CONTROLS.rotateSpeed
  panSpeed = CONTROLS.panSpeed
  zoomSpeed = CONTROLS.zoomSpeed
  minDistance = CONTROLS.minDistance
  maxDistance = CONTROLS.maxDistance

  /** 旋转 / 平移拖拽开始（适合开启 ticker 持续渲染） */
  onInteractionStart?: () => void
  /** 旋转 / 平移拖拽结束 */
  onInteractionEnd?: () => void
  /** 滚轮缩放（单次，不需要持续渲染） */
  onWheelChange?: () => void

  /** 多监听器注册表：支持多个订阅者，不再互相覆盖 */
  private _listeners = new Map<ControlsEvent, Set<() => void>>()

  /**
   * 注册事件监听器，返回取消函数。
   * @example const unsub = controls.on('interactionstart', fn); // 清理时 unsub()
   */
  on(event: ControlsEvent, fn: () => void): () => void {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set())
    this._listeners.get(event)!.add(fn)
    return () => this._listeners.get(event)?.delete(fn)
  }

  private emit(event: ControlsEvent) {
    this._listeners.get(event)?.forEach(fn => fn())
  }

  private state: State = 'none'
  private startX = 0
  private startY = 0
  private startQuat = new THREE.Quaternion()
  private startRotationPos = new THREE.Vector3()
  private startCameraZ = 0
  private activePointerId: number | null = null

  constructor(
    private camera: THREE.PerspectiveCamera,
    private rotationGroup: THREE.Group,
    _modelGroup: THREE.Group, // 保留参数以后可能扩展，当前不再操作
    private domElement: HTMLElement,
  ) {
    this.domElement.addEventListener('pointerdown', this.onPointerDown)
    this.domElement.addEventListener('pointermove', this.onPointerMove)
    this.domElement.addEventListener('pointerup', this.onPointerUp)
    this.domElement.addEventListener('pointercancel', this.onPointerUp)
    this.domElement.addEventListener('wheel', this.onWheel, { passive: false })
    this.domElement.addEventListener('contextmenu', this.onContextMenu)
  }

  dispose() {
    this.domElement.removeEventListener('pointerdown', this.onPointerDown)
    this.domElement.removeEventListener('pointermove', this.onPointerMove)
    this.domElement.removeEventListener('pointerup', this.onPointerUp)
    this.domElement.removeEventListener('pointercancel', this.onPointerUp)
    this.domElement.removeEventListener('wheel', this.onWheel)
    this.domElement.removeEventListener('contextmenu', this.onContextMenu)
  }

  /** no-op，保留给渲染循环调用以兼容旧代码 */
  update() { /* nothing — 非惯性控制器 */ }

  handleResize() { /* 没有 screen 尺寸缓存，no-op */ }

  private onContextMenu = (e: Event) => e.preventDefault()

  private onPointerDown = (e: PointerEvent) => {
    if (!this.enabled) return
    this.startX = e.clientX
    this.startY = e.clientY
    this.activePointerId = e.pointerId

    switch (e.button) {
      case 0: // 左键 → 旋转
        this.state = 'rotate'
        this.startQuat.copy(this.rotationGroup.quaternion)
        break
      case 1: // 中键 → 平移
        this.state = 'pan'
        this.startRotationPos.copy(this.rotationGroup.position)
        e.preventDefault() // 避免中键自动滚动
        break
      // 右键让给 BoxSelectOverlay 做框选 / AtomContextMenu 弹菜单；缩放交给滚轮
      case 2:
      default:
        return
    }
    this.onInteractionStart?.()
    this.emit('interactionstart')
    this.domElement.setPointerCapture(e.pointerId)
  }

  private onPointerMove = (e: PointerEvent) => {
    if (!this.enabled || this.state === 'none' || e.pointerId !== this.activePointerId) return

    const rect = this.domElement.getBoundingClientRect()

    if (this.state === 'rotate') {
      // arcball：normalize 屏幕位移，构造 quaternion
      const dx = (e.clientX - this.startX) / rect.width * 2
      const dy = (e.clientY - this.startY) / rect.height * 2
      const r = Math.hypot(dx, dy)
      if (r < 1e-6) return
      const angle = r * Math.PI * this.rotateSpeed
      // 旋转轴在屏幕平面内，与拖动方向垂直：右拖→绕 +Y，下拖→绕 +X
      const axis = new THREE.Vector3(dy / r, dx / r, 0)
      const dq = new THREE.Quaternion().setFromAxisAngle(axis, angle)
      this.rotationGroup.quaternion.multiplyQuaternions(dq, this.startQuat)
    } else if (this.state === 'pan') {
      // 像素差 → 相机距离平面上的世界坐标差；作用在 rotationGroup（世界坐标系）
      const dist = Math.abs(this.camera.position.z)
      const fovRad = (this.camera.fov * Math.PI) / 180
      const worldPerPixel = (2 * Math.tan(fovRad / 2) * dist) / rect.height
      const dxPx = e.clientX - this.startX
      const dyPx = e.clientY - this.startY
      this.rotationGroup.position.x = this.startRotationPos.x + dxPx * worldPerPixel * this.panSpeed
      this.rotationGroup.position.y = this.startRotationPos.y - dyPx * worldPerPixel * this.panSpeed
    } else if (this.state === 'dolly') {
      const dyPx = e.clientY - this.startY
      const factor = Math.exp(dyPx * CONTROLS.dragZoomCoef * this.zoomSpeed)
      this.camera.position.z = THREE.MathUtils.clamp(
        this.startCameraZ * factor, this.minDistance, this.maxDistance,
      )
    }
  }

  private onPointerUp = (e: PointerEvent) => {
    if (e.pointerId !== this.activePointerId) return
    const wasInteracting = this.state !== 'none'
    this.state = 'none'
    this.activePointerId = null
    if (this.domElement.hasPointerCapture(e.pointerId)) {
      this.domElement.releasePointerCapture(e.pointerId)
    }
    if (wasInteracting) { this.onInteractionEnd?.(); this.emit('interactionend') }
  }

  private onWheel = (e: WheelEvent) => {
    if (!this.enabled) return
    e.preventDefault()
    const factor = Math.exp(e.deltaY * CONTROLS.wheelZoomCoef * this.zoomSpeed)
    this.camera.position.z = THREE.MathUtils.clamp(
      this.camera.position.z * factor, this.minDistance, this.maxDistance,
    )
    this.onWheelChange?.()
    this.emit('wheel')
  }
}
