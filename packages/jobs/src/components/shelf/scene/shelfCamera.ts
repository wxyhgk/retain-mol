import * as THREE from 'three'
import { SHELF } from '../../../domain/shelf/shelfLayout'

/** 世界单位 → 屏幕像素的换算：一个 2.6 单位的盒子约显示 ~150px。 */
export const WORLD_PER_PX = 1 / 56

/** 基准仰角（arctan(1/√2) ≈ 35.264°）与方位角。 */
export const ISO_ELEVATION = Math.atan(1 / Math.sqrt(2))
export const ISO_AZIMUTH = Math.PI / 4

/** 透视视场角：偏窄的"长焦"透视——有近大远小的空间感，又不至于让边缘盒子畸变。 */
export const SHELF_FOV_DEG = 25

/** 行沿世界 -Y（墙面式）：屏幕垂直压缩系数为 cos(仰角)。 */
export const ROW_SCREEN_FACTOR = Math.cos(ISO_ELEVATION)

/** 屏幕水平方向对应的世界轴（列沿此轴排布，投影不压缩）。 */
export const SCREEN_RIGHT_AXIS = {
  x: Math.cos(ISO_AZIMUTH),
  z: -Math.sin(ISO_AZIMUTH),
} as const

/** 让目标平面（盒子所在原点附近）的取景高度与正交时代一致：距离由视口高度反推。 */
export function cameraDistanceForHeight(heightPx: number): number {
  const halfWorld = (Math.max(1, heightPx) * WORLD_PER_PX) / 2
  return halfWorld / Math.tan((SHELF_FOV_DEG * Math.PI) / 360)
}

export function createShelfCamera(widthPx: number, heightPx: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(SHELF_FOV_DEG, 1, 0.1, 400)
  updateShelfCamera(camera, widthPx, heightPx, 0, 0)
  return camera
}

/** 视差 = 在基准仰角/方位角上叠加小偏移，环绕原点重新摆放相机。 */
export function updateShelfCamera(
  camera: THREE.PerspectiveCamera,
  widthPx: number,
  heightPx: number,
  azimuthOffset: number,
  elevationOffset: number,
): void {
  camera.aspect = Math.max(1, widthPx) / Math.max(1, heightPx)
  const distance = cameraDistanceForHeight(heightPx)
  const elevation = ISO_ELEVATION + elevationOffset
  const azimuth = ISO_AZIMUTH + azimuthOffset
  camera.position.set(
    distance * Math.cos(elevation) * Math.sin(azimuth),
    distance * Math.sin(elevation),
    distance * Math.cos(elevation) * Math.cos(azimuth),
  )
  camera.lookAt(0, 0, 0)
  camera.updateProjectionMatrix()
}

const projected = new THREE.Vector3()

export function worldToScreen(
  position: THREE.Vector3,
  camera: THREE.Camera,
  widthPx: number,
  heightPx: number,
): { x: number; y: number } {
  projected.copy(position).project(camera)
  return {
    x: ((projected.x + 1) / 2) * widthPx,
    y: ((1 - projected.y) / 2) * heightPx,
  }
}

/** 视口能容纳的行数（纯函数，可测）：行距在屏幕上被压缩 cos(仰角)。 */
export function visibleRowsForHeight(heightPx: number): number {
  const rowScreenPx = (SHELF.rowPitch * ROW_SCREEN_FACTOR) / WORLD_PER_PX
  return Math.max(1, Math.floor(heightPx / rowScreenPx))
}

/** 沿行方向的世界偏移，使第 0 行从视口上沿附近开始（换算除以压缩系数）。 */
export function initialRowOffset(heightPx: number): number {
  const halfH = (heightPx * WORLD_PER_PX) / 2
  return Math.max(0, (halfH - SHELF.boxSize) / ROW_SCREEN_FACTOR)
}
