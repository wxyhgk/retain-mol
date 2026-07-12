import * as THREE from 'three'
import type { FragmentTorsionPreview, GrowGuideSpec } from '../types'
import { GHOST_LINE, GROW_GUIDE, RENDER } from '../../config/render.config'
import { ticker as defaultTicker } from '../animation'
import { buildDepthCuedRing } from './ghostGeometry'
import { getElementConfig } from '../../config/elements.config'

/**
 * 拖出生长手势的全部预览视觉（与 MeasureVisuals 对称）：
 *  - 幽灵线：源原子 → 光标/吸附点
 *  - 幽灵原子：新原子落点的半透明球
 *  - 候选槽位参考几何：n=1 深度烘焙圆管环 / 离散候选点
 *  - 屏幕空间拾取：返回参考几何上投影离光标最近的候选位置（带滞回）
 *
 * 只做视觉与拾取，不含手势状态机 —— 那是 InteractionHandler 的职责。
 */
export class GhostVisuals {
  private line: THREE.Line | null = null
  private atom: THREE.Mesh | null = null
  private guideGroup: THREE.Group | null = null
  private fragmentGroup: THREE.Group | null = null

  private _lineStart: THREE.Vector3 | null = null
  private _guideSpec: GrowGuideSpec = null
  private _ringU = new THREE.Vector3()
  private _ringV = new THREE.Vector3()
  private _prevRingAngle: number | null = null
  private _prevPointIndex: number | null = null

  constructor(
    private canvas: HTMLCanvasElement,
    private camera: THREE.PerspectiveCamera,
    private modelGroup: THREE.Group,
    private invalidate: () => void = () => defaultTicker.invalidate(),
  ) {}

  get hasLine(): boolean { return this.line !== null && this._lineStart !== null }
  get lineStartPos(): THREE.Vector3 | null { return this._lineStart }

  // ── 幽灵线 ──────────────────────────────────────────────────────────────────

  /** 在 pos 处创建幽灵线（两端重合）；null 则移除 */
  setLineStart(pos: THREE.Vector3 | null) {
    this.removeLine()
    if (!pos) return
    const position = new THREE.Float32BufferAttribute([
      pos.x, pos.y, pos.z,
      pos.x, pos.y, pos.z,
    ], 3)
    position.setUsage(THREE.DynamicDrawUsage)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', position)
    const mat = new THREE.LineBasicMaterial({
      color: GHOST_LINE.color,
      linewidth: GHOST_LINE.linewidth,
      transparent: true,
      opacity: GHOST_LINE.opacity,
    })
    this.line = new THREE.Line(geo, mat)
    this.modelGroup.add(this.line)
    this._lineStart = pos.clone()
  }

  /** 更新终点与颜色（绿色=合法成键目标，蓝色=无目标） */
  updateLine(end: THREE.Vector3, validTarget: boolean) {
    if (!this.line || !this._lineStart) return
    const position = this.line.geometry.getAttribute('position') as THREE.BufferAttribute
    position.setXYZ(0, this._lineStart.x, this._lineStart.y, this._lineStart.z)
    position.setXYZ(1, end.x, end.y, end.z)
    position.needsUpdate = true
    ;(this.line.material as THREE.LineBasicMaterial)
      .color.setHex(validTarget ? GHOST_LINE.targetColor : GHOST_LINE.color)
    this.invalidate()
  }

  private removeLine() {
    if (this.line) {
      this.modelGroup.remove(this.line)
      this.line.geometry.dispose()
      const materials = Array.isArray(this.line.material) ? this.line.material : [this.line.material]
      materials.forEach(material => material.dispose())
      this.line = null
    }
    this._lineStart = null
  }

  // ── 幽灵原子 ────────────────────────────────────────────────────────────────

  showAtom(posLocal: THREE.Vector3, radius: number, color: number) {
    if (!this.atom) {
      const geo = new THREE.SphereGeometry(1, RENDER.sphereSegments, RENDER.sphereSegments)
      const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: GROW_GUIDE.ghostAtomOpacity, depthWrite: false })
      this.atom = new THREE.Mesh(geo, mat)
      this.modelGroup.add(this.atom)
    }
    ;(this.atom.material as THREE.MeshBasicMaterial).color.setHex(color)
    this.atom.scale.setScalar(radius)
    this.atom.position.copy(posLocal)
    this.invalidate()
  }

  removeAtom() {
    if (this.atom) {
      this.modelGroup.remove(this.atom)
      this.atom.geometry.dispose()
      ;(this.atom.material as THREE.Material).dispose()
      this.atom = null
      this.invalidate()
    }
  }

  showFragment(preview: FragmentTorsionPreview) {
    this.removeFragment()
    const group = new THREE.Group()
    for (const atom of preview.atoms) {
      const radius = atom.symbol === 'H' ? 0.12 : 0.22
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 16, 12),
        new THREE.MeshBasicMaterial({
          color: getElementConfig(atom.symbol).color,
          transparent: true,
          opacity: 0.58,
          depthWrite: false,
        }),
      )
      mesh.position.set(...atom.position)
      group.add(mesh)
    }
    const positions = new Float32Array(preview.bonds.length * 6)
    preview.bonds.forEach((bond, index) => {
      positions.set(bond.start, index * 6)
      positions.set(bond.end, index * 6 + 3)
    })
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    group.add(new THREE.LineSegments(
      geometry,
      new THREE.LineBasicMaterial({
        color: GHOST_LINE.color,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
      }),
    ))
    this.fragmentGroup = group
    this.modelGroup.add(group)
    this.invalidate()
  }

  removeFragment() {
    if (!this.fragmentGroup) return
    this.modelGroup.remove(this.fragmentGroup)
    this.fragmentGroup.traverse(object => {
      if (!(object as THREE.Mesh | THREE.LineSegments).geometry) return
      const visual = object as THREE.Mesh | THREE.LineSegments
      visual.geometry.dispose()
      const materials = Array.isArray(visual.material) ? visual.material : [visual.material]
      materials.forEach(material => material.dispose())
    })
    this.fragmentGroup = null
    this.invalidate()
  }

  // ── 候选槽位参考几何 ────────────────────────────────────────────────────────

  /** n=1 画锥底圆环（深度烘焙虚实），离散槽位画半透明小球 */
  showGuide(guide: NonNullable<GrowGuideSpec>) {
    this.removeGuide()
    const group = new THREE.Group()
    this.guideGroup = group
    this.modelGroup.add(group)
    // 先挂进场景图再 updateMatrixWorld，后面才能把相机位置变换进局部坐标
    this.modelGroup.updateMatrixWorld(true)

    // 供屏幕空间拾取：记录 guide 与环平面内基
    this._guideSpec = guide
    if (guide.kind === 'ring') {
      const q = new THREE.Quaternion()
        .setFromUnitVectors(new THREE.Vector3(0, 0, 1), guide.axis.clone().normalize())
      this._ringU.set(1, 0, 0).applyQuaternion(q)
      this._ringV.set(0, 1, 0).applyQuaternion(q)
      group.add(buildDepthCuedRing(guide, this.camera, this.modelGroup))
    } else {
      // 候选点：近的实、远的虚
      const camWorld = this.camera.position
      const wp = new THREE.Vector3()
      const dists = guide.positions.map(p => {
        wp.copy(p).applyMatrix4(this.modelGroup.matrixWorld)
        return wp.distanceTo(camWorld)
      })
      const dMin = Math.min(...dists), dMax = Math.max(...dists)
      guide.positions.forEach((p, i) => {
        const t = dMax - dMin < 1e-6 ? 1 : 1 - (dists[i] - dMin) / (dMax - dMin)   // 1=最近
        const opacity = GROW_GUIDE.pointAlphaFar + (GROW_GUIDE.pointAlphaNear - GROW_GUIDE.pointAlphaFar) * t
        const geo = new THREE.SphereGeometry(GROW_GUIDE.pointRadius, GROW_GUIDE.pointSegments, GROW_GUIDE.pointSegments)
        const mat = new THREE.MeshBasicMaterial({
          color: GROW_GUIDE.color, transparent: true, opacity, depthWrite: false,
        })
        const dot = new THREE.Mesh(geo, mat)
        dot.position.copy(p)
        group.add(dot)
      })
    }

    this.invalidate()
  }

  get guideSpec(): GrowGuideSpec { return this._guideSpec }

  removeGuide() {
    this._guideSpec = null
    this._prevRingAngle = null
    this._prevPointIndex = null
    if (this.guideGroup) {
      this.modelGroup.remove(this.guideGroup)
      this.guideGroup.traverse(o => {
        const mesh = o as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
        if (mesh.material) (mesh.material as THREE.Material).dispose()
      })
      this.guideGroup = null
      this.invalidate()
    }
  }

  /**
   * 屏幕空间拾取：返回 guide 上"投影后离光标最近"的候选位置（模型局部坐标）。
   * 配滞回：环侧视时前/后半环投影重叠，无滞回会来回跳。
   */
  pickOnGuide(clientX: number, clientY: number): THREE.Vector3 | null {
    const spec = this._guideSpec
    if (!spec) return null
    const rect = this.canvas.getBoundingClientRect()
    const cx = clientX - rect.left
    const cy = clientY - rect.top
    this.camera.updateMatrixWorld()

    const toScreen = (local: THREE.Vector3): { x: number; y: number } => {
      const p = local.clone().applyMatrix4(this.modelGroup.matrixWorld).project(this.camera)
      return { x: (p.x + 1) / 2 * rect.width, y: (-p.y + 1) / 2 * rect.height }
    }

    if (spec.kind === 'ring') {
      const samples = GROW_GUIDE.pickSamples
      let bestCost = Infinity
      let bestAngle = 0
      let bestPos: THREE.Vector3 | null = null
      const p = new THREE.Vector3()
      for (let i = 0; i < samples; i++) {
        const a = (i / samples) * Math.PI * 2
        p.copy(spec.center)
          .addScaledVector(this._ringU, Math.cos(a) * spec.radius)
          .addScaledVector(this._ringV, Math.sin(a) * spec.radius)
        const s = toScreen(p)
        let cost = Math.hypot(s.x - cx, s.y - cy)
        if (this._prevRingAngle !== null) {
          cost += GROW_GUIDE.hysteresisPx * 0.5 * (1 - Math.cos(a - this._prevRingAngle))
        }
        if (cost < bestCost) { bestCost = cost; bestAngle = a; bestPos = p.clone() }
      }
      this._prevRingAngle = bestAngle
      return bestPos
    }

    // points：屏幕距离最近的候选点，带粘滞防抖
    let bestCost = Infinity
    let bestIdx = -1
    spec.positions.forEach((pos, i) => {
      const s = toScreen(pos)
      let cost = Math.hypot(s.x - cx, s.y - cy)
      if (this._prevPointIndex === i) cost -= GROW_GUIDE.hysteresisPx
      if (cost < bestCost) { bestCost = cost; bestIdx = i }
    })
    if (bestIdx < 0) return null
    this._prevPointIndex = bestIdx
    return spec.positions[bestIdx].clone()
  }

  /** 拖拽结束/取消：移除全部预览视觉 */
  clear() {
    this.removeLine()
    this.removeAtom()
    this.removeGuide()
    this.removeFragment()
  }

  dispose() { this.clear() }
}
