import * as THREE from 'three'
import type { Atom } from '../molecule'
import { CAMERA, FIT } from '../../config/camera.config'

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
  distanceMultiplier = FIT.distanceMultiplier,
) {
  if (atoms.length === 0) { resetCamera(camera, rotationGroup, modelGroup); return }
  fitToPoints(
    atoms.map(atom => new THREE.Vector3(atom.x, atom.y, atom.z)),
    camera,
    rotationGroup,
    modelGroup,
    distanceMultiplier,
  )
}

export function fitToPoints(
  points: readonly THREE.Vector3[],
  camera: THREE.PerspectiveCamera,
  rotationGroup: THREE.Group,
  modelGroup: THREE.Group,
  distanceMultiplier = FIT.distanceMultiplier,
) {
  if (points.length === 0) { resetCamera(camera, rotationGroup, modelGroup); return }
  const box = new THREE.Box3()
  points.forEach(point => box.expandByPoint(point))
  const center = new THREE.Vector3()
  box.getCenter(center)
  const size = new THREE.Vector3()
  box.getSize(size)
  const maxDim = Math.max(size.x, size.y, size.z, FIT.minBoundingBox)
  const dist = maxDim / (2 * Math.tan((camera.fov * Math.PI) / 360)) * distanceMultiplier

  rotationGroup.quaternion.identity()
  rotationGroup.position.set(0, 0, 0)
  modelGroup.position.copy(center).multiplyScalar(-1)
  camera.position.set(0, 0, dist)
}

/** Change perspective FOV without changing the apparent size of the current view. */
export function setFovPreservingScale(
  camera: THREE.PerspectiveCamera,
  nextFov: number,
) {
  if (!Number.isFinite(nextFov) || nextFov <= 0 || nextFov >= 180 || Math.abs(camera.fov - nextFov) < 1e-8) return

  const previousHalfFov = THREE.MathUtils.degToRad(camera.fov / 2)
  const nextHalfFov = THREE.MathUtils.degToRad(nextFov / 2)
  camera.position.z *= Math.tan(previousHalfFov) / Math.tan(nextHalfFov)
  camera.fov = nextFov
  camera.updateProjectionMatrix()
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
