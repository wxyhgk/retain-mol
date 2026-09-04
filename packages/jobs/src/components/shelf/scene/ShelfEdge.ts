import * as THREE from 'three'
import { SHELF } from '../../../domain/shelf/shelfLayout'
import type { ShelfEdgeState } from '../../../domain/shelf/shelfNodeStyle'
import type { ShelfUiTheme } from '../../../domain/shelf/shelfStatusStyle'

export interface ShelfEdgeInput {
  id: string
  sourceJobId: string
  targetJobId: string
  state: ShelfEdgeState
}

const TUBE_RADIUS = 0.055
const DASH_WORLD_LENGTH = 0.55
const FLOW_SPEED = 0.9

const EDGE_COLORS: Record<ShelfUiTheme, Record<ShelfEdgeState, { color: number; opacity: number }>> = {
  day: {
    pending: { color: 0x9c9c9c, opacity: 0.45 },
    flowing: { color: 0x1a1a1a, opacity: 0.95 },
    done: { color: 0x666666, opacity: 0.8 },
    blocked: { color: 0x999999, opacity: 0.5 },
  },
  night: {
    pending: { color: 0x6b6b6b, opacity: 0.45 },
    flowing: { color: 0xf2f2f2, opacity: 0.95 },
    done: { color: 0xa8a8a8, opacity: 0.8 },
    blocked: { color: 0x7a7a7a, opacity: 0.5 },
  },
}

/** 白色虚线纹理：material.color 上色，clone 后各边独立 offset 实现流动。 */
export function createEdgeDashTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 8
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, 64, 8)
    ctx.fillStyle = 'rgba(255,255,255,1)'
    ctx.fillRect(0, 0, 40, 8)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** 两个玻璃盒接入点之间的管道：贝塞尔管 + 状态配色 + flowing 时纹理流动。 */
export class ShelfEdge {
  readonly mesh: THREE.Mesh
  private readonly material: THREE.MeshBasicMaterial
  private readonly texture: THREE.CanvasTexture
  private geometry: THREE.TubeGeometry | null = null
  state: ShelfEdgeState = 'pending'

  constructor(
    readonly id: string,
    readonly sourceJobId: string,
    readonly targetJobId: string,
    sharedDashTexture: THREE.CanvasTexture,
  ) {
    this.texture = sharedDashTexture.clone()
    this.texture.needsUpdate = true
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      depthWrite: false,
    })
    this.mesh = new THREE.Mesh(undefined, this.material)
    this.mesh.renderOrder = 1
  }

  /** 源盒右口 → 目标盒左口（shelfRoot 局部坐标）；布局变化后重建。 */
  updateCurve(source: THREE.Vector3, target: THREE.Vector3): void {
    const half = SHELF.boxSize / 2 + 0.05
    const from = source.clone().add(new THREE.Vector3(half, 0, 0))
    const to = target.clone().add(new THREE.Vector3(-half, 0, 0))
    const reach = Math.max(1.0, from.distanceTo(to) * 0.35)
    const curve = new THREE.CubicBezierCurve3(
      from,
      from.clone().add(new THREE.Vector3(reach, 0.15, 0)),
      to.clone().add(new THREE.Vector3(-reach, 0.15, 0)),
      to,
    )
    this.geometry?.dispose()
    this.geometry = new THREE.TubeGeometry(curve, 48, TUBE_RADIUS, 8, false)
    this.mesh.geometry = this.geometry
    this.texture.repeat.x = curve.getLength() / DASH_WORLD_LENGTH
  }

  applyState(state: ShelfEdgeState, theme: ShelfUiTheme): void {
    this.state = state
    const { color, opacity } = EDGE_COLORS[theme][state]
    this.material.color.setHex(color)
    this.material.opacity = opacity
  }

  frame(delta: number): void {
    if (this.state === 'flowing') {
      this.texture.offset.x -= delta * FLOW_SPEED
    }
  }

  dispose(): void {
    this.geometry?.dispose()
    this.material.dispose()
    this.texture.dispose()
    this.mesh.removeFromParent()
  }
}
