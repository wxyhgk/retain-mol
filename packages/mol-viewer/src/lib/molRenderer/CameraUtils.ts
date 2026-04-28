import * as THREE from 'three'
import type { Atom } from '../molecule'
import { CAMERA } from '@/config/camera.config'

export function resetCamera(
  camera: THREE.PerspectiveCamera,
  rotationGroup: THREE.Group,
  modelGroup: THREE.Group,
) {
  camera.position.set(0, 0, CAMERA.initialZ)
  rotationGroup.quaternion.identity()
  rotationGroup.position.set(0, 0, 0)
  modelGroup.position.set(0, 0, 0)
}

export function fitToMolecule(
  atoms: Atom[],
  camera: THREE.PerspectiveCamera,
  rotationGroup: THREE.Group,
  modelGroup: THREE.Group,
) {
  if (atoms.length === 0) { resetCamera(camera, rotationGroup, modelGroup); return }
  const box = new THREE.Box3()
  atoms.forEach(a => box.expandByPoint(new THREE.Vector3(a.x, a.y, a.z)))
  const center = new THREE.Vector3()
  box.getCenter(center)
  const size = new THREE.Vector3()
  box.getSize(size)
  const maxDim = Math.max(size.x, size.y, size.z, 4)
  const dist = maxDim / (2 * Math.tan((camera.fov * Math.PI) / 360)) * 1.5

  rotationGroup.quaternion.identity()
  rotationGroup.position.set(0, 0, 0)
  modelGroup.position.copy(center).multiplyScalar(-1)
  camera.position.set(0, 0, dist)
}

/**
 * 编辑过程中保持"旋转中心 = 分子 bbox 中心"，同时补偿视觉位置不跳。
 */
export function updateOrbitTarget(
  atoms: readonly Atom[],
  rotationGroup: THREE.Group,
  modelGroup: THREE.Group,
) {
  if (atoms.length === 0) return
  const box = new THREE.Box3()
  atoms.forEach(a => box.expandByPoint(new THREE.Vector3(a.x, a.y, a.z)))
  const newCenter = new THREE.Vector3()
  box.getCenter(newCenter)
  const oldCenter = modelGroup.position.clone().negate()
  const delta = newCenter.clone().sub(oldCenter)
  if (delta.lengthSq() < 1e-8) return
  modelGroup.position.copy(newCenter).negate()
  const compensate = delta.clone().applyQuaternion(rotationGroup.quaternion)
  rotationGroup.position.add(compensate)
}

export function projectToScreen(
  worldPos: THREE.Vector3,
  camera: THREE.PerspectiveCamera,
  containerWidth: number,
  containerHeight: number,
): { x: number; y: number } {
  const v = worldPos.clone().project(camera)
  return {
    x: (v.x + 1) / 2 * containerWidth,
    y: (-v.y + 1) / 2 * containerHeight,
  }
}

export function projectLocalToScreen(
  localPos: THREE.Vector3,
  camera: THREE.PerspectiveCamera,
  modelGroup: THREE.Group,
  w: number,
  h: number,
) {
  modelGroup.updateMatrixWorld()
  return projectToScreen(modelGroup.localToWorld(localPos.clone()), camera, w, h)
}

/**
 * 把屏幕像素位移换算为 modelGroup 局部坐标系下的位移向量。
 */
export function screenDeltaToModelLocal(
  dxPx: number,
  dyPx: number,
  canvas: HTMLCanvasElement,
  camera: THREE.PerspectiveCamera,
  rotationGroup: THREE.Group,
): THREE.Vector3 {
  const rect = canvas.getBoundingClientRect()
  const dist = Math.abs(camera.position.z)
  const fovRad = (camera.fov * Math.PI) / 180
  const worldPerPixel = (2 * Math.tan(fovRad / 2) * dist) / rect.height
  const worldDelta = new THREE.Vector3(dxPx * worldPerPixel, -dyPx * worldPerPixel, 0)
  const invQ = rotationGroup.quaternion.clone().invert()
  return worldDelta.applyQuaternion(invQ)
}
