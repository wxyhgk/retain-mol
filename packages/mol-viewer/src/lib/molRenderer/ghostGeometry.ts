import * as THREE from 'three'
import { GROW_GUIDE } from '../../config/render.config'

/**
 * 深度烘焙的圆管环：按每个环段到相机的距离插值管径与透明度——
 * 近侧粗且实，远侧细且虚（近大远小 + 近粗远细 + 虚实）。
 * 拖拽期间相机锁定，烘焙一次即保持正确。
 *
 * 纯几何构建：只读 camera.position / modelGroup.matrixWorld 与数值参数，
 * 构建并返回 Mesh，不改动任何场景/实例状态。
 */
export function buildDepthCuedRing(
  guide: { center: THREE.Vector3; axis: THREE.Vector3; radius: number },
  camera: THREE.PerspectiveCamera,
  modelGroup: THREE.Group,
): THREE.Mesh {
  const segs = GROW_GUIDE.ringSegments
  const tubeSegs = GROW_GUIDE.ringTubeSegments

  const quaternion = new THREE.Quaternion()
    .setFromUnitVectors(new THREE.Vector3(0, 0, 1), guide.axis.clone().normalize())

  // 相机位置 → 环局部坐标（需要 modelGroup 的世界矩阵；rigid 变换距离不变）
  const local = new THREE.Matrix4()
    .compose(guide.center, quaternion, new THREE.Vector3(1, 1, 1))
  const toLocal = new THREE.Matrix4()
    .multiplyMatrices(modelGroup.matrixWorld, local)
    .invert()
  const camLocal = camera.position.clone().applyMatrix4(toLocal)

  // 每个环段的"近度" t ∈ [0,1]
  const R = guide.radius
  const nearness: number[] = []
  let dMin = Infinity, dMax = -Infinity
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * Math.PI * 2
    const d = camLocal.distanceTo(new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, 0))
    nearness.push(d)
    if (d < dMin) dMin = d
    if (d > dMax) dMax = d
  }
  const range = Math.max(dMax - dMin, 1e-6)
  for (let i = 0; i < segs; i++) nearness[i] = 1 - (nearness[i] - dMin) / range

  // 生成变径圆管 + RGBA 顶点色
  const positions: number[] = []
  const colors: number[] = []
  const indices: number[] = []
  const base = new THREE.Color(GROW_GUIDE.color)
  for (let i = 0; i <= segs; i++) {
    const t = nearness[i % segs]
    const a = (i / segs) * Math.PI * 2
    const rT = GROW_GUIDE.ringTubeFar + (GROW_GUIDE.ringTubeNear - GROW_GUIDE.ringTubeFar) * t
    const alpha = GROW_GUIDE.ringAlphaFar + (GROW_GUIDE.ringAlphaNear - GROW_GUIDE.ringAlphaFar) * t
    const cosA = Math.cos(a), sinA = Math.sin(a)
    for (let j = 0; j <= tubeSegs; j++) {
      const b = (j / tubeSegs) * Math.PI * 2
      const r = R + rT * Math.cos(b)
      positions.push(r * cosA, r * sinA, rT * Math.sin(b))
      colors.push(base.r, base.g, base.b, alpha)
    }
  }
  const row = tubeSegs + 1
  for (let i = 0; i < segs; i++) {
    for (let j = 0; j < tubeSegs; j++) {
      const a0 = i * row + j
      const b0 = (i + 1) * row + j
      indices.push(a0, b0, a0 + 1, b0, b0 + 1, a0 + 1)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4))
  geo.setIndex(indices)

  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    vertexColors: true, transparent: true, depthWrite: false,
  }))
  mesh.quaternion.copy(quaternion)
  mesh.position.copy(guide.center)
  return mesh
}
