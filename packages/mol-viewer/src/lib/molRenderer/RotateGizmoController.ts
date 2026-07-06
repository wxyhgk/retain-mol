/**
 * RotateGizmoController — 纯 Three.js 旋转 Gizmo 控制器。
 * 无 React 依赖，通过 update() 每帧刷新，通过 dispose() 清理。
 * React 壳（RotateGizmo.tsx）负责创建、注册 Ticker、和销毁。
 */

import * as THREE from 'three'
import type { Molecule } from '../molecule'

/** store 操作由外部（RotateGizmo.tsx）通过 callbacks 注入，保持 lib 层无 store 依赖 */
export interface GizmoCallbacks {
  getMolecule: () => Molecule
  setAtomPositions: (positions: ReadonlyMap<string, { x: number; y: number; z: number }>) => void
  beginTransaction: () => void
  endTransaction: () => void
}
import type { MolRenderer } from './MolRenderer'
import { GIZMO_RING, GIZMO_LINE, GIZMO_PICKER, GIZMO_ARROW, GIZMO_COLOR } from '../../config/rotateGizmo.config'
import { RENDER_ORDER } from '../../config/render.config'
import { ticker } from '../animation'
import { computeRingRadius, collectBondSideAtoms } from './gizmoMath'

// ── 内部类型 ──────────────────────────────────────────────────────────────────

// gizmo 只剩「绕键轴旋转」一种（多选原子的世界轴环已移除），故 axisLocal/bondId/pivotAtomId 恒有。
type RingSpec = {
  id: string
  axisLocal: THREE.Vector3
  pivotLocal: THREE.Vector3
  color: number
  radius: number
  bondId: string
  pivotAtomId: string
  atomIdsToRotate: Set<string>
}

type Arrow = { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; theta: number }

type Ring = {
  spec: RingSpec
  group: THREE.Group
  frontLine: THREE.Line
  backLine: THREE.Line
  frontMat: THREE.LineBasicMaterial
  backMat: THREE.LineBasicMaterial
  frontPositions: Float32Array
  backPositions: Float32Array
  frontPosAttr: THREE.BufferAttribute
  backPosAttr: THREE.BufferAttribute
  picker: THREE.Mesh
  arrows: Arrow[]
  hovered: boolean
  dragAngle: number
}

type DragState = {
  ring: Ring
  atomsWorldStart: Map<string, THREE.Vector3>
  pivotWorld: THREE.Vector3
  pivotScreen: { x: number; y: number }
  axisWorld: THREE.Vector3
  startAngle: number
  lastContinuous: number
}

// ── Controller ────────────────────────────────────────────────────────────────

export class RotateGizmoController {
  /** true = 有有效的环（外部据此判断是否需要 update/dispose） */
  readonly isValid: boolean

  private rings: Ring[]
  private drag: DragState | null = null
  private suppressNextClick = false
  private raycaster = new THREE.Raycaster()
  private mouseNDC = new THREE.Vector2()
  private originalCanDragAtom: MolRenderer['canDragAtom']

  // ── 预分配临时对象，update() / onPointerMoveDrag() 中零分配 ──────────────
  private _modelWorldQ = new THREE.Quaternion()
  private _camForward  = new THREE.Vector3()
  private _tmpV1       = new THREE.Vector3()
  private _tmpV2       = new THREE.Vector3()
  private _invGroupQ   = new THREE.Quaternion()
  private _camLocal    = new THREE.Vector3()
  private _axisWorld   = new THREE.Vector3()
  private _atomById: Map<string, { x: number; y: number; z: number }> = new Map()
  // drag 专用
  private _dragQ       = new THREE.Quaternion()
  private _dragRel     = new THREE.Vector3()
  private _dragNewLocal= new THREE.Vector3()
  private _dragPositions: Map<string, { x: number; y: number; z: number }> = new Map()
  private _dragRaf: number | null = null

  constructor(
    private renderer: MolRenderer,
    selectedAtomIds: Set<string>,
    selectedBondIds: Set<string>,
    private cb: GizmoCallbacks,
  ) {
    const mol = cb.getMolecule()
    const specs = buildSpecs(mol, selectedAtomIds, selectedBondIds)

    if (specs.length === 0) {
      this.isValid = false
      this.rings = []
      return
    }

    this.isValid = true
    this.rings = specs.map(spec => buildRing(spec, renderer.scene))

    // 劫持 canDragAtom：hover 到环时禁止拖原子
    this.originalCanDragAtom = renderer.canDragAtom
    renderer.canDragAtom = (id: string) => {
      if (this.rings.some(r => r.hovered)) return false
      return this.originalCanDragAtom ? this.originalCanDragAtom(id) : false
    }

    renderer.canvas.addEventListener('pointerdown', this.onPointerDown, { capture: true })
    renderer.canvas.addEventListener('pointermove', this.onPointerMoveHover)
    renderer.canvas.addEventListener('click', this.onCaptureClick, { capture: true })
    window.addEventListener('pointermove', this.onPointerMoveDrag)
    window.addEventListener('pointerup', this.onPointerUp)
  }

  // ── 每帧调用 ──────────────────────────────────────────────────────────────

  update() {
    const renderer = this.renderer
    renderer.modelGroup.updateMatrixWorld()
    renderer.modelGroup.getWorldQuaternion(this._modelWorldQ)
    renderer.camera.getWorldDirection(this._camForward)

    // 重用 Map — clear + 重填，避免 new Map() 分配
    const liveMol = this.cb.getMolecule()
    this._atomById.clear()
    for (const a of liveMol.atoms) this._atomById.set(a.id, a)

    for (const r of this.rings) {
      // 更新 pivot / axis（跟踪原子位置）
      const bond = liveMol.bonds.find(b => b.id === r.spec.bondId)
      if (bond) {
        const a1 = this._atomById.get(bond.atomId1)
        const a2 = this._atomById.get(bond.atomId2)
        const pa = this._atomById.get(r.spec.pivotAtomId)
        if (a1 && a2 && pa) {
          this._tmpV1.set(a2.x - a1.x, a2.y - a1.y, a2.z - a1.z)
          if (this._tmpV1.lengthSq() > 1e-8) {
            r.spec.axisLocal = this._tmpV1.normalize().clone() // axisLocal 存储需要独立 instance
            r.spec.pivotLocal.set(pa.x, pa.y, pa.z)
          }
        }
      }

      // pivotWorld — 复用 _tmpV1
      this._tmpV1.copy(r.spec.pivotLocal)
      renderer.modelGroup.localToWorld(this._tmpV1)
      r.group.position.copy(this._tmpV1)

      // axisWorld — 复用 _axisWorld（键轴 local → world）
      this._axisWorld.copy(r.spec.axisLocal).applyQuaternion(this._modelWorldQ)
      this._axisWorld.normalize()

      r.group.quaternion.setFromUnitVectors(this._tmpV2.set(0, 0, 1), this._axisWorld)

      // camLocal — 复用 _invGroupQ 和 _camLocal
      this._invGroupQ.copy(r.group.quaternion).invert()
      this._camLocal.copy(this._camForward).applyQuaternion(this._invGroupQ)
      const psi = Math.atan2(this._camLocal.y, this._camLocal.x)

      const showBack = Math.abs(this._axisWorld.dot(this._camForward)) < GIZMO_LINE.faceOnThreshold
      r.backLine.visible = showBack

      const radius = r.spec.radius
      const seg = GIZMO_RING.segments
      let frontCount = 0, backCount = 0
      for (let i = 0; i <= seg; i++) {
        const θ = (i / seg) * Math.PI * 2
        const x = Math.cos(θ) * radius
        const y = Math.sin(θ) * radius
        if (Math.cos(θ - psi) < 0) {
          r.frontPositions[frontCount * 3] = x; r.frontPositions[frontCount * 3 + 1] = y; r.frontPositions[frontCount * 3 + 2] = 0; frontCount++
        } else {
          r.backPositions[backCount * 3] = x; r.backPositions[backCount * 3 + 1] = y; r.backPositions[backCount * 3 + 2] = 0; backCount++
        }
      }
      if (frontCount < 2) { r.frontPositions.fill(0, 0, 6); frontCount = 2 }
      if (backCount < 2) { r.backPositions.fill(0, 0, 6); backCount = 2 }

      r.frontLine.geometry.setDrawRange(0, frontCount)
      r.frontPosAttr.needsUpdate = true
      r.backLine.geometry.setDrawRange(0, backCount)
      r.backPosAttr.needsUpdate = true
      // computeLineDistances 已移除（backMat 改为 LineBasicMaterial，无需计算）

      const col = r.hovered ? GIZMO_COLOR.hover : GIZMO_COLOR.idle
      r.frontMat.color.setHex(col)
      r.backMat.color.setHex(col)
      r.frontMat.linewidth = r.hovered ? GIZMO_LINE.frontLinewidth + GIZMO_LINE.hoverLinewidthBump : GIZMO_LINE.frontLinewidth

      // 箭头 — 复用 _tmpV1/_tmpV2，避免任何 new Vector3
      for (const a of r.arrows) {
        a.mat.color.setHex(col)
        const t = a.theta + r.dragAngle
        const ct = Math.cos(t), st = Math.sin(t)
        a.mesh.position.set(ct * radius, st * radius, 0)
        a.mesh.quaternion.setFromUnitVectors(
          this._tmpV1.set(0, 1, 0),
          this._tmpV2.set(-st, ct, 0),
        )
        const onFront = Math.cos(t - psi) < 0
        a.mesh.visible = onFront || showBack
        a.mat.opacity = onFront ? 1.0 : GIZMO_LINE.backOpacity
      }
    }
  }

  // ── 清理 ──────────────────────────────────────────────────────────────────

  dispose() {
    const renderer = this.renderer
    renderer.canDragAtom = this.originalCanDragAtom
    renderer.canvas.removeEventListener('pointerdown', this.onPointerDown, { capture: true } as AddEventListenerOptions)
    renderer.canvas.removeEventListener('pointermove', this.onPointerMoveHover)
    renderer.canvas.removeEventListener('click', this.onCaptureClick, { capture: true } as AddEventListenerOptions)
    window.removeEventListener('pointermove', this.onPointerMoveDrag)
    window.removeEventListener('pointerup', this.onPointerUp)

    if (this.drag) {
      this.flushDragPositions()
      this.cb.endTransaction()
      renderer.controls.enabled = true
    }
    if (this._dragRaf !== null) cancelAnimationFrame(this._dragRaf)
    this._dragRaf = null
    renderer.canvas.style.cursor = ''

    for (const r of this.rings) {
      renderer.scene.remove(r.group)
      r.frontLine.geometry.dispose()
      r.backLine.geometry.dispose()
      r.frontMat.dispose()
      r.backMat.dispose()
      r.picker.geometry.dispose()
      ;(r.picker.material as THREE.Material).dispose()
      for (const a of r.arrows) {
        a.mesh.geometry.dispose()
        ;(a.mesh.material as THREE.Material).dispose()
      }
    }
    this.rings = []
  }

  // ── 事件处理 ──────────────────────────────────────────────────────────────

  private hitTest(clientX: number, clientY: number): Ring | null {
    const rect = this.renderer.canvas.getBoundingClientRect()
    this.mouseNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1
    this.mouseNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1
    this.raycaster.setFromCamera(this.mouseNDC, this.renderer.camera)
    const hits = this.raycaster.intersectObjects(this.rings.map(r => r.picker), false)
    if (!hits.length) return null
    const ringId = hits[0].object.userData.ringId as string
    return this.rings.find(r => r.spec.id === ringId) ?? null
  }

  private onPointerMoveHover = (e: PointerEvent) => {
    if (this.drag) return
    const hit = this.hitTest(e.clientX, e.clientY)
    for (const r of this.rings) r.hovered = (r === hit)
    this.renderer.canvas.style.cursor = hit ? 'grab' : ''
    ticker.invalidate()
  }

  private onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return
    const hit = this.hitTest(e.clientX, e.clientY)
    if (!hit) return
    e.stopImmediatePropagation()
    e.preventDefault()

    this.renderer.modelGroup.updateMatrixWorld()

    // 用预分配的 Map 存起始世界坐标（避免 new Map）
    const atomsWorldStart = new Map<string, THREE.Vector3>()
    for (const a of this.cb.getMolecule().atoms) {
      if (!hit.spec.atomIdsToRotate.has(a.id)) continue
      // 每个原子需要独立的 Vector3 存储初始位置
      atomsWorldStart.set(a.id, this.renderer.modelGroup.localToWorld(new THREE.Vector3(a.x, a.y, a.z)))
    }

    // 预填充 _dragPositions，后续每帧只更新值不创建新 Map
    this._dragPositions.clear()
    for (const id of hit.spec.atomIdsToRotate) {
      this._dragPositions.set(id, { x: 0, y: 0, z: 0 })
    }

    // pivotWorld — 用 _tmpV1
    this._tmpV1.copy(hit.spec.pivotLocal)
    this.renderer.modelGroup.localToWorld(this._tmpV1)
    const pivotWorld = this._tmpV1.clone()

    // axisWorld — 用 _axisWorld（键轴 local → world）
    this.renderer.modelGroup.getWorldQuaternion(this._modelWorldQ)
    this._axisWorld.copy(hit.spec.axisLocal).applyQuaternion(this._modelWorldQ)
    this._axisWorld.normalize()
    const axisWorld = this._axisWorld.clone()

    const rect = this.renderer.canvas.getBoundingClientRect()
    this._tmpV2.copy(pivotWorld).project(this.renderer.camera)
    const pivotScreen = {
      x: rect.left + (this._tmpV2.x + 1) / 2 * rect.width,
      y: rect.top  + (-this._tmpV2.y + 1) / 2 * rect.height,
    }

    this.drag = {
      ring: hit, atomsWorldStart, pivotWorld, pivotScreen, axisWorld,
      startAngle: Math.atan2(e.clientY - pivotScreen.y, e.clientX - pivotScreen.x),
      lastContinuous: 0,
    }
    this.cb.beginTransaction()
    this.renderer.controls.enabled = false
    this.renderer.canvas.style.cursor = 'grabbing'
    this.renderer.canvas.setPointerCapture?.(e.pointerId)
    ticker.startContinuous('gizmo-drag')
  }

  private flushDragPositions() {
    if (this._dragRaf !== null) {
      cancelAnimationFrame(this._dragRaf)
      this._dragRaf = null
    }
    if (this._dragPositions.size > 0) {
      this.cb.setAtomPositions(this._dragPositions)
    }
  }

  private onPointerMoveDrag = (e: PointerEvent) => {
    if (!this.drag) return
    const ang = Math.atan2(e.clientY - this.drag.pivotScreen.y, e.clientX - this.drag.pivotScreen.x)
    let raw = ang - this.drag.startAngle
    while (raw - this.drag.lastContinuous > Math.PI)  raw -= 2 * Math.PI
    while (raw - this.drag.lastContinuous < -Math.PI) raw += 2 * Math.PI
    this.drag.lastContinuous = raw
    this.drag.ring.dragAngle = raw

    // 零分配：复用 _dragQ、_dragRel、_dragNewLocal、_dragPositions
    this._dragQ.setFromAxisAngle(this.drag.axisWorld, raw)
    for (const [id, w0] of this.drag.atomsWorldStart) {
      this._dragRel.copy(w0).sub(this.drag.pivotWorld).applyQuaternion(this._dragQ)
      this._dragNewLocal.copy(this.drag.pivotWorld).add(this._dragRel)
      this.renderer.modelGroup.worldToLocal(this._dragNewLocal)
      const pos = this._dragPositions.get(id)!
      pos.x = this._dragNewLocal.x
      pos.y = this._dragNewLocal.y
      pos.z = this._dragNewLocal.z
    }
    if (this._dragRaf === null) {
      this._dragRaf = requestAnimationFrame(() => {
        this._dragRaf = null
        this.cb.setAtomPositions(this._dragPositions)
      })
    }
  }

  private onCaptureClick = (e: MouseEvent) => {
    if (this.suppressNextClick) { this.suppressNextClick = false; e.stopImmediatePropagation() }
  }

  private onPointerUp = (e: PointerEvent) => {
    if (!this.drag) return
    this.flushDragPositions()
    this.drag.ring.dragAngle = 0
    this.drag = null
    this.suppressNextClick = true
    this.cb.endTransaction()
    this.renderer.controls.enabled = true
    this.renderer.canvas.style.cursor = ''
    this.renderer.canvas.releasePointerCapture?.(e.pointerId)
    this.onPointerMoveHover(e)
    ticker.stopContinuous('gizmo-drag')
    ticker.invalidate()
  }
}

// ── 工厂函数 ──────────────────────────────────────────────────────────────────

function buildSpecs(
  mol: Molecule,
  selectedAtomIds: Set<string>,
  selectedBondIds: Set<string>,
): RingSpec[] {
  const specs: RingSpec[] = []

  if (selectedBondIds.size === 1) {
    const bondId = [...selectedBondIds][0]
    const bond = mol.bonds.find(b => b.id === bondId)
    if (bond) {
      const a1 = mol.atoms.find(a => a.id === bond.atomId1)
      const a2 = mol.atoms.find(a => a.id === bond.atomId2)
      if (a1 && a2) {
        const a1sel = selectedAtomIds.has(a1.id)
        const a2sel = selectedAtomIds.has(a2.id)
        if (a1sel !== a2sel) {
          const startAtom = a1sel ? a1 : a2
          const rotating = collectBondSideAtoms(mol.bonds, startAtom.id, bondId)
          const d = new THREE.Vector3(a2.x-a1.x, a2.y-a1.y, a2.z-a1.z)
          if (d.length() > 1e-4) {
            specs.push({
              id: 'bond', axisLocal: d.normalize(),
              pivotLocal: new THREE.Vector3(startAtom.x, startAtom.y, startAtom.z),
              color: GIZMO_COLOR.idle,
              radius: computeRingRadius(mol.atoms, startAtom.x, startAtom.y, startAtom.z, rotating),
              bondId: bond.id, pivotAtomId: startAtom.id, atomIdsToRotate: rotating,
            })
          }
        }
      }
    }
  }

  // 多选原子的 X/Y/Z 世界轴旋转环已移除（用户反馈基本没用）——
  // 仅保留上面「选中 1 个键 + 一个端点」绕键轴旋转（改构象/拧二面角有用）。

  return specs
}

function buildRing(spec: RingSpec, scene: THREE.Scene): Ring {
  const MAX_PTS = GIZMO_RING.segments + 2
  const group = new THREE.Group()
  scene.add(group)

  const frontMat = new THREE.LineBasicMaterial({ color: spec.color, linewidth: GIZMO_LINE.frontLinewidth, transparent: true, opacity: 1.0, depthTest: false })
  const backMat  = new THREE.LineBasicMaterial({ color: spec.color, linewidth: GIZMO_LINE.backLinewidth,  transparent: true, opacity: GIZMO_LINE.backOpacity, depthTest: false })

  const frontPositions = new Float32Array(MAX_PTS * 3)
  const backPositions  = new Float32Array(MAX_PTS * 3)
  const frontPosAttr = new THREE.BufferAttribute(frontPositions, 3)
  const backPosAttr  = new THREE.BufferAttribute(backPositions,  3)

  const frontGeo = new THREE.BufferGeometry(); frontGeo.setAttribute('position', frontPosAttr)
  const backGeo  = new THREE.BufferGeometry(); backGeo.setAttribute('position',  backPosAttr)

  const frontLine = new THREE.Line(frontGeo, frontMat); frontLine.renderOrder = RENDER_ORDER.gizmoFront
  const backLine  = new THREE.Line(backGeo,  backMat);  backLine.renderOrder  = RENDER_ORDER.gizmoBack
  group.add(frontLine, backLine)

  const picker = new THREE.Mesh(
    new THREE.TorusGeometry(spec.radius, GIZMO_PICKER.tubeRadius, GIZMO_PICKER.radialSegments, GIZMO_PICKER.tubularSegments),
    new THREE.MeshBasicMaterial({ visible: false, depthTest: false }),
  )
  picker.userData = { ringId: spec.id }
  group.add(picker)

  const arrows: Arrow[] = []
  for (let i = 0; i < GIZMO_ARROW.count; i++) {
    const theta = (i / GIZMO_ARROW.count) * Math.PI * 2
    const mat = new THREE.MeshBasicMaterial({ color: GIZMO_COLOR.idle, depthTest: false, transparent: true, opacity: 1.0 })
    const cone = new THREE.Mesh(new THREE.ConeGeometry(GIZMO_ARROW.coneRadius, GIZMO_ARROW.coneHeight, GIZMO_ARROW.coneSegments), mat)
    cone.position.set(Math.cos(theta) * spec.radius, Math.sin(theta) * spec.radius, 0)
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3(-Math.sin(theta), Math.cos(theta), 0))
    cone.renderOrder = RENDER_ORDER.gizmoArrow
    group.add(cone)
    arrows.push({ mesh: cone, mat, theta })
  }

  return { spec, group, frontLine, backLine, frontMat, backMat, frontPositions, backPositions, frontPosAttr, backPosAttr, picker, arrows, hovered: false, dragAngle: 0 }
}
