import { isViewerShortcutBlocked } from '../../keyboardScope'
import * as THREE from 'three'
import { BOND_PAIR_GIZMO } from '../../../config/bondPairGizmo.config'
import { RENDER_ORDER } from '../../../config/render.config'
import type {
  BondPairGizmoError,
  BondPairGizmoGeometry,
  BondPairGizmoInspection,
  BondPairGizmoMode,
  BondPairGizmoValue,
} from '../../../lib/bondPairGizmo'
import type { RotateGizmoRendererPort } from '../../../lib/molRenderer/rendererPorts'
import {
  applyBondPairGizmoDelta,
  applyGizmoAngleModifiers,
  normalizeDegrees,
  unwrapAngleDegrees,
} from '../../../lib/molRenderer/bondPairGizmoMath'
import type { GizmoScheduler } from './RotateGizmoController'

export interface BondPairAlignmentGizmoCallbacks {
  readonly getSnapshot: () => BondPairGizmoInspection
  readonly start: (value: BondPairGizmoValue) => void
  readonly preview: (value: BondPairGizmoValue) => boolean
  readonly commit: (value: BondPairGizmoValue) => void
  readonly cancel: (value: BondPairGizmoValue) => void
  readonly error: (error: BondPairGizmoError) => void
}

interface DragState {
  readonly pointerId: number
  readonly kind: 'azimuth' | 'axis-angle'
  readonly startValue: BondPairGizmoValue
  readonly startTopologySignature: string
  readonly startPointerDegrees: number
  lastPointerDegrees: number
}

type HitKind = 'azimuth' | 'axis-angle' | 'coplanar-0' | 'coplanar-180'

interface LabelVisual {
  readonly sprite: THREE.Sprite
  readonly texture: THREE.CanvasTexture
  readonly canvas: HTMLCanvasElement
  readonly context: CanvasRenderingContext2D
}

function makeLine(
  color: number,
  capacity: number,
  opacity = 1,
): {
  line: THREE.Line
  positions: Float32Array
  attribute: THREE.BufferAttribute
  material: THREE.LineBasicMaterial
} {
  const positions = new Float32Array(capacity * 3)
  const attribute = new THREE.BufferAttribute(positions, 3)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', attribute)
  const material = new THREE.LineBasicMaterial({
    color,
    linewidth: BOND_PAIR_GIZMO.visibleLineWidth,
    transparent: opacity < 1,
    opacity,
    depthTest: false,
  })
  const line = new THREE.Line(geometry, material)
  line.renderOrder = RENDER_ORDER.gizmoFront
  return { line, positions, attribute, material }
}

function makeLabel(): LabelVisual {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const context = canvas.getContext('2d')
  if (!context) throw new Error('BondPairAlignmentGizmo requires a 2D canvas context')
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  })
  const sprite = new THREE.Sprite(material)
  sprite.renderOrder = RENDER_ORDER.gizmoArrow
  return { sprite, texture, canvas, context }
}

function updateLabel(label: LabelVisual, text: string, color: string) {
  const { context, canvas } = label
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.font = '600 28px system-ui, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.lineWidth = 6
  context.strokeStyle = 'rgba(15, 23, 42, 0.85)'
  context.strokeText(text, canvas.width / 2, canvas.height / 2)
  context.fillStyle = color
  context.fillText(text, canvas.width / 2, canvas.height / 2)
  label.texture.needsUpdate = true
}

function disposeObject(object: THREE.Object3D) {
  object.traverse(child => {
    const mesh = child as THREE.Mesh
    mesh.geometry?.dispose()
    const material = mesh.material
    if (Array.isArray(material)) material.forEach(item => item.dispose())
    else material?.dispose()
  })
}

function angleAtPointer(
  event: Pick<PointerEvent, 'clientX' | 'clientY'>,
  pivot: { x: number; y: number },
): number {
  return THREE.MathUtils.radToDeg(
    Math.atan2(event.clientY - pivot.y, event.clientX - pivot.x),
  )
}

export class BondPairAlignmentGizmoController {
  readonly isValid: boolean

  private readonly root = new THREE.Group()
  private readonly referenceLine = makeLine(BOND_PAIR_GIZMO.referenceColor, 2)
  private readonly movingLine = makeLine(BOND_PAIR_GIZMO.movingColor, 2)
  private readonly ringFront = makeLine(BOND_PAIR_GIZMO.azimuthColor, BOND_PAIR_GIZMO.lineSegments + 2)
  private readonly ringBack = makeLine(
    BOND_PAIR_GIZMO.azimuthColor,
    BOND_PAIR_GIZMO.lineSegments + 2,
    BOND_PAIR_GIZMO.backOpacity,
  )
  private readonly thetaArc = makeLine(
    BOND_PAIR_GIZMO.axisAngleColor,
    BOND_PAIR_GIZMO.angleSegments + 2,
  )
  private readonly ringGroup = new THREE.Group()
  private readonly ringPicker = new THREE.Mesh(
    new THREE.TorusGeometry(
      1,
      BOND_PAIR_GIZMO.pickerTubeRadius,
      10,
      BOND_PAIR_GIZMO.lineSegments,
    ),
    new THREE.MeshBasicMaterial({ visible: false, depthTest: false }),
  )
  private thetaPicker: THREE.Mesh | null = null
  private readonly coplanar0 = new THREE.Mesh(
    new THREE.SphereGeometry(BOND_PAIR_GIZMO.handleRadius, 16, 12),
    new THREE.MeshBasicMaterial({ color: BOND_PAIR_GIZMO.referenceColor, depthTest: false }),
  )
  private readonly coplanar180 = new THREE.Mesh(
    new THREE.SphereGeometry(BOND_PAIR_GIZMO.handleRadius, 16, 12),
    new THREE.MeshBasicMaterial({ color: BOND_PAIR_GIZMO.movingColor, depthTest: false }),
  )
  private readonly azimuthLabel = makeLabel()
  private readonly thetaLabel = makeLabel()
  private readonly raycaster = new THREE.Raycaster()
  private readonly mouseNdc = new THREE.Vector2()
  private readonly tmpA = new THREE.Vector3()
  private readonly tmpB = new THREE.Vector3()
  private readonly tmpC = new THREE.Vector3()
  private readonly modelQuaternion = new THREE.Quaternion()
  private readonly inverseRingQuaternion = new THREE.Quaternion()
  private drag: DragState | null = null
  private hovered: HitKind | null = null
  private suppressNextClick = false
  private currentValue: BondPairGizmoValue
  private currentSnapshot: BondPairGizmoGeometry
  private pivotScreen = { x: 0, y: 0 }
  private lastErrorKey = ''

  constructor(
    private readonly renderer: RotateGizmoRendererPort,
    private readonly mode: BondPairGizmoMode,
    private readonly showCoplanarHandles: boolean,
    private readonly callbacks: BondPairAlignmentGizmoCallbacks,
    private readonly scheduler: GizmoScheduler,
  ) {
    const inspected = callbacks.getSnapshot()
    if (inspected.ok === false) {
      this.currentValue = {
        distance: 0,
        axisAngleDegrees: 90,
        azimuthDegrees: 0,
        coplanar: false,
      }
      this.currentSnapshot = {
        value: this.currentValue,
        referenceOther: [0, 0, 0],
        referenceAnchor: [0, 0, 0],
        movingAnchor: [0, 0, 0],
        movingOther: [0, 0, 0],
        movingAtomIds: new Set(),
        movingObjectId: '',
        topologySignature: '',
      }
      callbacks.error(inspected)
    } else {
      this.currentSnapshot = inspected.snapshot
      this.currentValue = inspected.snapshot.value
    }
    this.isValid = true
    this.root.renderOrder = RENDER_ORDER.gizmoFront
    this.root.visible = inspected.ok
    this.root.add(
      this.referenceLine.line,
      this.movingLine.line,
      this.ringGroup,
      this.thetaArc.line,
      this.azimuthLabel.sprite,
      this.thetaLabel.sprite,
    )
    this.ringGroup.add(
      this.ringFront.line,
      this.ringBack.line,
      this.ringPicker,
      this.coplanar0,
      this.coplanar180,
    )
    this.ringPicker.userData.hitKind = 'azimuth'
    this.coplanar0.userData.hitKind = 'coplanar-0'
    this.coplanar180.userData.hitKind = 'coplanar-180'
    this.renderer.scene.add(this.root)
    this.syncModeVisibility()
    updateLabel(this.azimuthLabel, 'φ = 0.0°', '#5eead4')
    updateLabel(
      this.thetaLabel,
      `θ = ${this.currentValue.axisAngleDegrees.toFixed(1)}°`,
      '#fdba74',
    )

    renderer.canvas.addEventListener('pointerdown', this.onPointerDown, { capture: true })
    renderer.canvas.addEventListener('pointermove', this.onPointerMoveHover)
    renderer.canvas.addEventListener('pointercancel', this.onPointerCancel)
    renderer.canvas.addEventListener('lostpointercapture', this.onLostPointerCapture)
    renderer.canvas.addEventListener('dblclick', this.onDoubleClick, { capture: true })
    renderer.canvas.addEventListener('click', this.onCaptureClick, { capture: true })
    window.addEventListener('pointermove', this.onPointerMoveDrag)
    window.addEventListener('pointerup', this.onPointerUp)
    window.addEventListener('keydown', this.onKeyDown, true)
    window.addEventListener('blur', this.onWindowBlur)
  }

  update() {
    if (!this.isValid) return
    const inspected = this.callbacks.getSnapshot()
    if (inspected.ok === false) {
      this.reportError(inspected)
      if (this.drag) this.cancelDrag()
      this.root.visible = false
      return
    }
    if (
      this.drag
      && inspected.snapshot.topologySignature !== this.drag.startTopologySignature
    ) {
      this.reportError({
        code: 'topology-changed',
        reason: '键对齐期间拓扑发生变化，操作已取消',
      })
      this.cancelDrag()
      this.root.visible = false
      return
    }

    this.root.visible = true
    this.currentSnapshot = inspected.snapshot
    this.currentValue = {
      ...this.currentValue,
      distance: inspected.snapshot.value.distance,
      axisAngleDegrees: this.drag
        ? this.currentValue.axisAngleDegrees
        : inspected.snapshot.value.axisAngleDegrees,
      coplanar: inspected.snapshot.value.coplanar,
    }
    this.updateVisualGeometry(inspected.snapshot)
  }

  dispose() {
    if (!this.isValid) return
    if (this.drag) this.cancelDrag()
    const { canvas } = this.renderer
    canvas.removeEventListener('pointerdown', this.onPointerDown, { capture: true } as AddEventListenerOptions)
    canvas.removeEventListener('pointermove', this.onPointerMoveHover)
    canvas.removeEventListener('pointercancel', this.onPointerCancel)
    canvas.removeEventListener('lostpointercapture', this.onLostPointerCapture)
    canvas.removeEventListener('dblclick', this.onDoubleClick, { capture: true } as AddEventListenerOptions)
    canvas.removeEventListener('click', this.onCaptureClick, { capture: true } as AddEventListenerOptions)
    window.removeEventListener('pointermove', this.onPointerMoveDrag)
    window.removeEventListener('pointerup', this.onPointerUp)
    window.removeEventListener('keydown', this.onKeyDown, true)
    window.removeEventListener('blur', this.onWindowBlur)
    canvas.style.cursor = ''
    this.renderer.scene.remove(this.root)
    this.azimuthLabel.texture.dispose()
    this.thetaLabel.texture.dispose()
    disposeObject(this.root)
  }

  private syncModeVisibility() {
    const showAzimuth = this.mode === 'azimuth' || this.mode === 'both'
    const showTheta = this.mode === 'axis-angle' || this.mode === 'both'
    this.ringGroup.visible = showAzimuth
    this.azimuthLabel.sprite.visible = showAzimuth
    this.thetaArc.line.visible = showTheta
    this.thetaLabel.sprite.visible = showTheta
    this.coplanar0.visible = showAzimuth && this.showCoplanarHandles
    this.coplanar180.visible = showAzimuth && this.showCoplanarHandles
  }

  private updateVisualGeometry(snapshot: BondPairGizmoGeometry) {
    const renderer = this.renderer
    renderer.modelGroup.updateMatrixWorld(true)
    renderer.modelGroup.getWorldQuaternion(this.modelQuaternion)
    const refOther = renderer.modelGroup.localToWorld(this.tmpA.fromArray(snapshot.referenceOther))
    const refAnchor = renderer.modelGroup.localToWorld(this.tmpB.fromArray(snapshot.referenceAnchor))
    const movingAnchor = renderer.modelGroup.localToWorld(this.tmpC.fromArray(snapshot.movingAnchor))
    const movingOther = renderer.modelGroup.localToWorld(
      new THREE.Vector3().fromArray(snapshot.movingOther),
    )
    this.writeSegment(this.referenceLine, refOther, refAnchor)
    this.writeSegment(this.movingLine, movingAnchor, movingOther)

    const referenceAxis = refAnchor.clone().sub(refOther).normalize()
    const movingAxis = movingOther.clone().sub(movingAnchor).normalize()
    this.ringGroup.position.copy(refAnchor)
    this.ringGroup.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      referenceAxis,
    )
    const radius = this.worldRadiusAt(refAnchor)
    this.ringGroup.scale.setScalar(radius)
    this.updateRingDepth(referenceAxis)
    this.updateThetaArc(refAnchor, referenceAxis, movingAxis, radius)

    const rect = renderer.canvas.getBoundingClientRect()
    const projected = refAnchor.clone().project(renderer.camera)
    this.pivotScreen = {
      x: rect.left + (projected.x + 1) * rect.width / 2,
      y: rect.top + (-projected.y + 1) * rect.height / 2,
    }

    const labelWorldScale = radius * (BOND_PAIR_GIZMO.labelScalePixels / BOND_PAIR_GIZMO.radiusPixels)
    this.azimuthLabel.sprite.position.copy(
      refAnchor.clone().add(referenceAxis.clone().multiplyScalar(radius * 0.18)),
    )
    this.azimuthLabel.sprite.scale.set(labelWorldScale * 2.6, labelWorldScale * 0.65, 1)
    this.thetaLabel.sprite.position.copy(
      refAnchor.clone().add(
        referenceAxis.clone().add(movingAxis).normalize().multiplyScalar(radius * 0.9),
      ),
    )
    this.thetaLabel.sprite.scale.set(labelWorldScale * 2.8, labelWorldScale * 0.7, 1)
    updateLabel(
      this.azimuthLabel,
      `φ = ${normalizeDegrees(this.currentValue.azimuthDegrees).toFixed(1)}°`,
      '#5eead4',
    )
    updateLabel(
      this.thetaLabel,
      `θ = ${this.currentValue.axisAngleDegrees.toFixed(1)}°`,
      '#fdba74',
    )

    this.coplanar0.position.set(0.72, 0.72, 0)
    this.coplanar180.position.set(-0.72, 0.72, 0)
  }

  private writeSegment(
    visual: ReturnType<typeof makeLine>,
    start: THREE.Vector3,
    end: THREE.Vector3,
  ) {
    visual.positions.set([start.x, start.y, start.z, end.x, end.y, end.z])
    visual.line.geometry.setDrawRange(0, 2)
    visual.attribute.needsUpdate = true
  }

  private worldRadiusAt(worldPoint: THREE.Vector3): number {
    const cameraPoint = worldPoint.clone().applyMatrix4(this.renderer.camera.matrixWorldInverse)
    const depth = Math.max(0.1, Math.abs(cameraPoint.z))
    const height = 2 * depth * Math.tan(THREE.MathUtils.degToRad(this.renderer.camera.fov / 2))
    const rect = this.renderer.canvas.getBoundingClientRect()
    return height * BOND_PAIR_GIZMO.radiusPixels / Math.max(1, rect.height)
  }

  private updateRingDepth(referenceAxisWorld: THREE.Vector3) {
    const cameraForward = this.renderer.camera.getWorldDirection(new THREE.Vector3())
    this.inverseRingQuaternion.copy(this.ringGroup.quaternion).invert()
    const cameraLocal = cameraForward.clone().applyQuaternion(this.inverseRingQuaternion)
    const psi = Math.atan2(cameraLocal.y, cameraLocal.x)
    let frontCount = 0
    let backCount = 0
    for (let index = 0; index <= BOND_PAIR_GIZMO.lineSegments; index += 1) {
      const angle = index / BOND_PAIR_GIZMO.lineSegments * Math.PI * 2
      const target = Math.cos(angle - psi) < 0 ? this.ringFront : this.ringBack
      const offset = target === this.ringFront ? frontCount++ : backCount++
      target.positions[offset * 3] = Math.cos(angle)
      target.positions[offset * 3 + 1] = Math.sin(angle)
      target.positions[offset * 3 + 2] = 0
    }
    this.ringFront.line.geometry.setDrawRange(0, Math.max(2, frontCount))
    this.ringBack.line.geometry.setDrawRange(0, Math.max(2, backCount))
    this.ringFront.attribute.needsUpdate = true
    this.ringBack.attribute.needsUpdate = true
    this.ringBack.line.visible = Math.abs(referenceAxisWorld.dot(cameraForward)) < 0.96
  }

  private updateThetaArc(
    pivot: THREE.Vector3,
    referenceAxis: THREE.Vector3,
    movingAxis: THREE.Vector3,
    radius: number,
  ) {
    const dot = THREE.MathUtils.clamp(referenceAxis.dot(movingAxis), -1, 1)
    const angle = Math.acos(dot)
    let normal = new THREE.Vector3().crossVectors(referenceAxis, movingAxis)
    if (normal.lengthSq() < 1e-10) {
      normal = Math.abs(referenceAxis.x) < 0.8
        ? new THREE.Vector3().crossVectors(referenceAxis, new THREE.Vector3(1, 0, 0))
        : new THREE.Vector3().crossVectors(referenceAxis, new THREE.Vector3(0, 1, 0))
    }
    normal.normalize()
    const points: THREE.Vector3[] = []
    const arcRadius = radius * BOND_PAIR_GIZMO.angleArcRadiusFactor
    for (let index = 0; index <= BOND_PAIR_GIZMO.angleSegments; index += 1) {
      const fraction = index / BOND_PAIR_GIZMO.angleSegments
      const direction = referenceAxis.clone().applyAxisAngle(normal, angle * fraction)
      const point = pivot.clone().addScaledVector(direction, arcRadius)
      points.push(point)
      this.thetaArc.positions.set([point.x, point.y, point.z], index * 3)
    }
    this.thetaArc.line.geometry.setDrawRange(0, points.length)
    this.thetaArc.attribute.needsUpdate = true

    if (this.thetaPicker) {
      this.root.remove(this.thetaPicker)
      this.thetaPicker.geometry.dispose()
      ;(this.thetaPicker.material as THREE.Material).dispose()
    }
    const curve = new THREE.CatmullRomCurve3(points)
    this.thetaPicker = new THREE.Mesh(
      new THREE.TubeGeometry(
        curve,
        BOND_PAIR_GIZMO.angleSegments,
        radius * BOND_PAIR_GIZMO.thetaPickerTubeRadius,
        8,
        false,
      ),
      new THREE.MeshBasicMaterial({ visible: false, depthTest: false }),
    )
    this.thetaPicker.userData.hitKind = 'axis-angle'
    this.thetaPicker.visible = this.mode === 'axis-angle' || this.mode === 'both'
    this.root.add(this.thetaPicker)
  }

  private hitTest(clientX: number, clientY: number): HitKind | null {
    if (!this.root.visible) return null
    const rect = this.renderer.canvas.getBoundingClientRect()
    this.mouseNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1
    this.mouseNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1
    this.raycaster.setFromCamera(this.mouseNdc, this.renderer.camera)
    const candidates = [
      ...(this.ringGroup.visible ? [this.ringPicker] : []),
      ...(this.thetaPicker?.visible ? [this.thetaPicker] : []),
      ...(this.coplanar0.visible ? [this.coplanar0, this.coplanar180] : []),
    ]
    const hit = this.raycaster.intersectObjects(candidates, false)[0]
    const kind = hit?.object.userData.hitKind
    return typeof kind === 'string' ? kind as HitKind : null
  }

  private setInteractionColor() {
    const active = this.drag?.kind ?? null
    this.ringFront.material.color.setHex(
      active === 'azimuth'
        ? BOND_PAIR_GIZMO.activeColor
        : this.hovered === 'azimuth'
          ? BOND_PAIR_GIZMO.hoverColor
          : BOND_PAIR_GIZMO.azimuthColor,
    )
    this.ringBack.material.color.copy(this.ringFront.material.color)
    this.thetaArc.material.color.setHex(
      active === 'axis-angle'
        ? BOND_PAIR_GIZMO.activeColor
        : this.hovered === 'axis-angle'
          ? BOND_PAIR_GIZMO.hoverColor
          : BOND_PAIR_GIZMO.axisAngleColor,
    )
  }

  private onPointerMoveHover = (event: PointerEvent) => {
    if (this.drag) return
    this.hovered = this.hitTest(event.clientX, event.clientY)
    this.renderer.canvas.style.cursor = this.hovered ? 'grab' : ''
    this.setInteractionColor()
    this.scheduler.invalidate()
  }

  private onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || this.drag) return
    const hit = this.hitTest(event.clientX, event.clientY)
    if (!hit) return
    event.stopImmediatePropagation()
    event.preventDefault()

    if (hit === 'coplanar-0' || hit === 'coplanar-180') {
      this.applyCoplanar(hit === 'coplanar-0' ? 0 : 180)
      this.suppressNextClick = true
      return
    }

    const pointerDegrees = angleAtPointer(event, this.pivotScreen)
    this.drag = {
      pointerId: event.pointerId,
      kind: hit,
      startValue: this.currentValue,
      startTopologySignature: this.currentSnapshot.topologySignature,
      startPointerDegrees: pointerDegrees,
      lastPointerDegrees: pointerDegrees,
    }
    this.callbacks.start(this.currentValue)
    this.renderer.controls.enabled = false
    this.renderer.canvas.style.cursor = 'grabbing'
    this.renderer.canvas.setPointerCapture?.(event.pointerId)
    this.scheduler.startContinuous('bond-pair-gizmo-drag')
    this.setInteractionColor()
  }

  private onPointerMoveDrag = (event: PointerEvent) => {
    const drag = this.drag
    if (!drag || event.pointerId !== drag.pointerId) return
    if (!this.validateActiveTopology(drag)) return
    event.preventDefault()
    const wrapped = angleAtPointer(event, this.pivotScreen)
    drag.lastPointerDegrees = unwrapAngleDegrees(drag.lastPointerDegrees, wrapped)
    const rawDelta = drag.lastPointerDegrees - drag.startPointerDegrees
    const delta = applyGizmoAngleModifiers(rawDelta, {
      shiftKey: event.shiftKey,
      altKey: event.altKey,
    })
    const next = applyBondPairGizmoDelta(drag.startValue, drag.kind, delta)
    if (!this.callbacks.preview(next)) {
      this.cancelDrag()
      return
    }
    this.currentValue = next
    this.setInteractionColor()
    this.scheduler.invalidate()
  }

  private onPointerUp = (event: PointerEvent) => {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return
    if (!this.validateActiveTopology(this.drag)) return
    this.commitDrag()
  }

  private onPointerCancel = (event: PointerEvent) => {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return
    this.cancelDrag()
  }

  private onLostPointerCapture = (event: PointerEvent) => {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return
    this.cancelDrag(false)
  }

  private onWindowBlur = () => {
    if (this.drag) this.cancelDrag()
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !this.drag || isViewerShortcutBlocked(event)) return
    event.preventDefault()
    this.cancelDrag()
  }

  private onDoubleClick = (event: MouseEvent) => {
    if (this.hitTest(event.clientX, event.clientY) !== 'azimuth') return
    event.preventDefault()
    event.stopImmediatePropagation()
    const next = { ...this.currentValue, azimuthDegrees: 0 }
    this.callbacks.start(this.currentValue)
    if (this.callbacks.preview(next)) {
      this.currentValue = next
      this.callbacks.commit(next)
    } else {
      this.callbacks.cancel(this.currentValue)
    }
    this.suppressNextClick = true
    this.scheduler.invalidate()
  }

  private onCaptureClick = (event: MouseEvent) => {
    if (!this.suppressNextClick) return
    this.suppressNextClick = false
    event.stopImmediatePropagation()
  }

  private commitDrag() {
    const drag = this.drag
    if (!drag) return
    this.drag = null
    this.suppressNextClick = true
    this.callbacks.commit(this.currentValue)
    this.finishPointer(drag.pointerId, true)
  }

  private cancelDrag(releaseCapture = true) {
    const drag = this.drag
    if (!drag) return
    this.drag = null
    this.currentValue = drag.startValue
    this.callbacks.cancel(drag.startValue)
    this.finishPointer(drag.pointerId, releaseCapture)
  }

  private finishPointer(pointerId: number, releaseCapture: boolean) {
    this.renderer.controls.enabled = true
    this.renderer.canvas.style.cursor = ''
    if (
      releaseCapture
      && (!this.renderer.canvas.hasPointerCapture
        || this.renderer.canvas.hasPointerCapture(pointerId))
    ) {
      this.renderer.canvas.releasePointerCapture?.(pointerId)
    }
    this.scheduler.stopContinuous('bond-pair-gizmo-drag')
    this.setInteractionColor()
    this.scheduler.invalidate()
  }

  private applyCoplanar(direction: 0 | 180) {
    const next: BondPairGizmoValue = {
      ...this.currentValue,
      coplanar: direction,
    }
    this.callbacks.start(this.currentValue)
    if (this.callbacks.preview(next)) {
      this.currentValue = next
      this.callbacks.commit(next)
    } else {
      this.callbacks.cancel(this.currentValue)
    }
    this.scheduler.invalidate()
  }

  private reportError(error: BondPairGizmoError) {
    const key = `${error.code}:${error.reason}`
    if (key === this.lastErrorKey) return
    this.lastErrorKey = key
    this.callbacks.error(error)
  }

  private validateActiveTopology(drag: DragState): boolean {
    const inspected = this.callbacks.getSnapshot()
    if (inspected.ok === false) {
      this.reportError(inspected)
      this.cancelDrag()
      return false
    }
    if (inspected.snapshot.topologySignature !== drag.startTopologySignature) {
      this.reportError({
        code: 'topology-changed',
        reason: '键对齐期间拓扑发生变化，操作已取消',
      })
      this.cancelDrag()
      return false
    }
    return true
  }
}
