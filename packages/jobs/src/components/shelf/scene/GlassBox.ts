import * as THREE from 'three'
import { AromaticRingCache, MoleculeRenderer, type ResolvedTheme } from '@retainmol/mol-viewer/three'
import { centerMolecule, type Molecule } from '@retainmol/mol-viewer/core'
import { SHELF } from '../../../domain/shelf/shelfLayout'
import type { ShelfBoxStyle } from '../../../domain/shelf/shelfStatusStyle'
import { fitScaleForBox, moleculeBoundingSphere } from '../../../domain/shelf/moleculeFit'
import { SCREEN_RIGHT_AXIS } from './shelfCamera'

export interface SharedShelfGeometries {
  box: THREE.BoxGeometry
  edges: THREE.EdgesGeometry
  port: THREE.CylinderGeometry
  shadowPlane: THREE.PlaneGeometry
  shadowTexture: THREE.CanvasTexture
}

/** 径向渐变圆片：盒底接触阴影贴图（黑→透明）。 */
function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(0,0,0,0.9)')
    gradient.addColorStop(0.55, 'rgba(0,0,0,0.35)')
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function createSharedShelfGeometries(): SharedShelfGeometries {
  const box = new THREE.BoxGeometry(SHELF.boxSize, SHELF.boxSize, SHELF.boxSize)
  return {
    box,
    edges: new THREE.EdgesGeometry(box),
    port: new THREE.CylinderGeometry(0.09, 0.09, 0.12, 16),
    shadowPlane: new THREE.PlaneGeometry(1, 1),
    shadowTexture: createContactShadowTexture(),
  }
}

export function disposeSharedShelfGeometries(shared: SharedShelfGeometries): void {
  shared.box.dispose()
  shared.edges.dispose()
  shared.port.dispose()
  shared.shadowPlane.dispose()
  shared.shadowTexture.dispose()
}

const HOVER_LIFT = 0.35
const PULSE_SPEED = 2.4
const SHADOW_BASE_OPACITY = 0.3

/** 悬停 tilt：只旋转被指的盒子本身，相机与其余盒子不动。 */
const TILT_MAX_YAW = 0.16
const TILT_MAX_PITCH = 0.1
const UP_AXIS = new THREE.Vector3(0, 1, 0)
const PITCH_AXIS = new THREE.Vector3(SCREEN_RIGHT_AXIS.x, 0, SCREEN_RIGHT_AXIS.z)
const tmpYaw = new THREE.Quaternion()
const tmpPitch = new THREE.Quaternion()

/** 一个任务 = 一个玻璃盒：玻璃壳 + 边线 + 左右接入点 + 盒内分子（懒建）。 */
export class GlassBox {
  readonly group = new THREE.Group()
  private readonly glassMesh: THREE.Mesh
  private readonly glassMaterial: THREE.MeshPhysicalMaterial
  private readonly edgeLines: THREE.LineSegments
  private readonly edgeMaterial: THREE.LineBasicMaterial
  private readonly portMaterial: THREE.MeshBasicMaterial
  private readonly shadowMesh: THREE.Mesh
  private readonly shadowMaterial: THREE.MeshBasicMaterial
  private readonly moleculeGroup = new THREE.Group()
  private molRenderer: MoleculeRenderer | null = null
  private molecule: Molecule | null = null
  private style: ShelfBoxStyle | null = null
  private hovered = false
  private lift = 0
  private baseY = 0
  private readonly tiltTarget = { x: 0, y: 0 }
  private readonly tilt = { x: 0, y: 0 }

  constructor(
    readonly jobId: string,
    shared: SharedShelfGeometries,
    private readonly getTheme: () => ResolvedTheme,
    private readonly aromaticCache: AromaticRingCache,
  ) {
    // depthWrite=false + renderOrder 分层：玻璃永远不遮挡后画的自己人，盒内分子透过玻璃可见
    this.glassMaterial = new THREE.MeshPhysicalMaterial({
      transparent: true,
      depthWrite: false,
      metalness: 0,
      clearcoat: 0.6,
      clearcoatRoughness: 0.3,
      side: THREE.DoubleSide,
    })
    this.glassMesh = new THREE.Mesh(shared.box, this.glassMaterial)
    this.glassMesh.renderOrder = 2
    this.glassMesh.userData = { jobId }

    this.edgeMaterial = new THREE.LineBasicMaterial({ transparent: true })
    this.edgeLines = new THREE.LineSegments(shared.edges, this.edgeMaterial)
    this.edgeLines.renderOrder = 3

    this.portMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.85 })
    const half = SHELF.boxSize / 2
    for (const sign of [-1, 1] as const) {
      const port = new THREE.Mesh(shared.port, this.portMaterial)
      port.rotation.z = Math.PI / 2
      port.position.set(sign * (half + 0.05), 0, 0)
      this.group.add(port)
    }

    // 接触阴影：把盒子"放到地上"的关键深度线索；hover 抬升时在 frame 里反向补偿
    this.shadowMaterial = new THREE.MeshBasicMaterial({
      map: shared.shadowTexture,
      transparent: true,
      opacity: SHADOW_BASE_OPACITY,
      depthWrite: false,
    })
    this.shadowMesh = new THREE.Mesh(shared.shadowPlane, this.shadowMaterial)
    this.shadowMesh.rotation.x = -Math.PI / 2
    this.shadowMesh.scale.setScalar(SHELF.boxSize * 1.5)
    this.shadowMesh.position.y = -half - 0.02
    this.shadowMesh.renderOrder = 0

    this.moleculeGroup.renderOrder = 1
    this.group.add(this.shadowMesh, this.glassMesh, this.edgeLines, this.moleculeGroup)
  }

  get raycastTarget(): THREE.Mesh {
    return this.glassMesh
  }

  applyStyle(style: ShelfBoxStyle): void {
    this.style = style
    this.glassMaterial.color.setHex(style.glassColor)
    this.glassMaterial.opacity = style.glassOpacity
    this.glassMaterial.roughness = style.glassRoughness
    this.edgeMaterial.color.setHex(style.edgeColor)
    this.edgeMaterial.opacity = style.edgeOpacity
    this.portMaterial.color.setHex(style.edgeColor)
    if (this.molecule && this.molRenderer) this.renderMolecule(this.molecule)
  }

  setMolecule(molecule: Molecule | null): void {
    if (molecule === this.molecule) return
    this.molecule = molecule
    if (!molecule) {
      this.molRenderer?.dispose()
      this.molRenderer = null
      return
    }
    this.renderMolecule(molecule)
  }

  private renderMolecule(molecule: Molecule): void {
    this.molRenderer ??= new MoleculeRenderer(this.moleculeGroup, this.getTheme)
    const centered = centerMolecule(molecule)
    const { radius } = moleculeBoundingSphere(centered.atoms)
    const scale = fitScaleForBox(radius, SHELF.innerHalfExtent)
    this.moleculeGroup.scale.setScalar(scale)
    this.molRenderer.render(
      centered,
      'ball-stick',
      new Set(),
      new Set(),
      this.aromaticCache.centroids(centered),
      'realistic',
      { opacity: this.style?.moleculeOpacity ?? 1 },
    )
  }

  setHovered(hovered: boolean): void {
    this.hovered = hovered
    if (!hovered) {
      this.tiltTarget.x = 0
      this.tiltTarget.y = 0
    }
  }

  /** 指针相对盒中心的归一化偏移（-1..1）：盒子朝指针方向轻微倾斜。 */
  setTilt(nx: number, ny: number): void {
    this.tiltTarget.x = Math.max(-1, Math.min(1, nx))
    this.tiltTarget.y = Math.max(-1, Math.min(1, ny))
  }

  get slotY(): number {
    return this.baseY
  }

  setSlot(x: number, y: number, z: number): void {
    this.group.position.x = x
    this.group.position.z = z
    this.baseY = y
    this.group.position.y = y + this.lift
  }

  /** 帧推进：分子自转、hover 抬升 lerp、running 脉动。返回是否仍有动画在跑。 */
  frame(elapsed: number, delta: number): boolean {
    this.moleculeGroup.rotation.y += delta * 0.35

    const targetLift = this.hovered ? HOVER_LIFT : 0
    this.lift += (targetLift - this.lift) * Math.min(1, delta * 10)
    this.group.position.y = this.baseY + this.lift

    // 卡片式 tilt：阻尼追踪指针偏移，绕世界 Y 偏航 + 绕屏幕水平轴俯仰
    const tiltDamping = Math.min(1, delta * 8)
    this.tilt.x += (this.tiltTarget.x - this.tilt.x) * tiltDamping
    this.tilt.y += (this.tiltTarget.y - this.tilt.y) * tiltDamping
    tmpYaw.setFromAxisAngle(UP_AXIS, this.tilt.x * TILT_MAX_YAW)
    tmpPitch.setFromAxisAngle(PITCH_AXIS, -this.tilt.y * TILT_MAX_PITCH)
    this.group.quaternion.copy(tmpPitch).multiply(tmpYaw)
    // 阴影留在地面：抬得越高影子越淡、稍微变大
    const half = SHELF.boxSize / 2
    this.shadowMesh.position.y = -half - 0.02 - this.lift
    this.shadowMesh.scale.setScalar(SHELF.boxSize * (1.5 + this.lift * 0.4))
    this.shadowMaterial.opacity = SHADOW_BASE_OPACITY * (1 - (this.lift / HOVER_LIFT) * 0.45)

    if (this.style?.pulse) {
      const wave = (Math.sin(elapsed * PULSE_SPEED) + 1) / 2
      this.edgeMaterial.opacity = 0.5 + wave * 0.5
      this.glassMaterial.opacity = this.style.glassOpacity + wave * 0.05
    }
    return true
  }

  dispose(): void {
    this.molRenderer?.dispose()
    this.molRenderer = null
    this.glassMaterial.dispose()
    this.edgeMaterial.dispose()
    this.portMaterial.dispose()
    this.shadowMaterial.dispose()
    this.group.removeFromParent()
  }
}
