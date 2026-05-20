import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import type { Atom } from '../molecule'
import type { MeasureStyle, MeasureType } from '../types'
import { DEFAULT_MEASURE_STYLE } from '../types'
import type { ResolvedTheme } from '../../presets'
import { getElementConfig as getElement } from '../../config/elements.config'
import { RENDER } from '../../config/render.config'

/**
 * 管理测量可视化：已提交测量的几何体 + pending 光晕 + 标注锚点。
 */
export class MeasureVisuals {
  measureStyle: MeasureStyle = DEFAULT_MEASURE_STYLE
  measureLabelPositions: Array<{ pos: THREE.Vector3; text: string; color: string }> = []
  private lineMaterials: LineMaterial[] = []

  constructor(
    private measureGroup: THREE.Group,
    private canvas: HTMLCanvasElement,
    private getTheme: () => ResolvedTheme,
  ) {}

  update(
    committed: Array<{ type: MeasureType; atoms: Atom[] }>,
    pending: Atom[],
  ) {
    for (const m of this.lineMaterials) m.dispose()
    this.lineMaterials = []
    this.measureGroup.clear()
    this.measureLabelPositions = []

    const s = this.measureStyle

    for (const m of committed) {
      this.renderOneMeasure(m.type, m.atoms.map(a => new THREE.Vector3(a.x, a.y, a.z)), s, false)
    }

    for (const a of pending) {
      const atomR = getElement(a.symbol).covalentRadius * this.getTheme().render.ballScale
      const haloR = atomR + RENDER.pendingHaloOffset
      const haloGeo = new THREE.SphereGeometry(haloR, RENDER.sphereSegments, RENDER.sphereSegments)
      const haloMat = new THREE.MeshBasicMaterial({
        color: this.cssHex(s.lineColor),
        transparent: true,
        opacity: RENDER.pendingHaloOpacity,
        side: THREE.BackSide,
      })
      const halo = new THREE.Mesh(haloGeo, haloMat)
      halo.position.set(a.x, a.y, a.z)
      halo.renderOrder = 1
      this.measureGroup.add(halo)
    }

    if (pending.length >= 2) {
      const type: MeasureType = pending.length === 2 ? 'distance' : pending.length === 3 ? 'angle' : 'dihedral'
      const pts = pending.slice(0, 4).map(a => new THREE.Vector3(a.x, a.y, a.z))
      this.renderOneMeasure(type, pts, s, true)
    }
  }

  onResize(width: number, height: number) {
    for (const mat of this.lineMaterials) mat.resolution.set(width, height)
  }

  private cssHex(css: string): number { return parseInt(css.slice(1), 16) }

  private makeLine2(points: THREE.Vector3[], color: string, lineWidth: number, dashed = false): Line2 {
    const geo = new LineGeometry()
    const flat: number[] = []
    points.forEach(p => flat.push(p.x, p.y, p.z))
    geo.setPositions(flat)

    const mat = new LineMaterial({
      color: this.cssHex(color),
      linewidth: lineWidth,
      resolution: new THREE.Vector2(this.canvas.clientWidth, this.canvas.clientHeight),
      dashed,
      dashSize: 0.18,
      gapSize: 0.09,
    })
    this.lineMaterials.push(mat)
    const line = new Line2(geo, mat)
    if (dashed) line.computeLineDistances()
    return line
  }

  private renderOneMeasure(type: MeasureType, pts: THREE.Vector3[], s: MeasureStyle, ghost: boolean) {
    void ghost
    pts.forEach(p => {
      const geo = new THREE.SphereGeometry(0.12, 12, 12)
      const sphere = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: this.cssHex(s.lineColor) }))
      sphere.position.copy(p)
      this.measureGroup.add(sphere)
    })

    if (type === 'distance' && pts.length === 2) {
      this.measureGroup.add(this.makeLine2(pts, s.lineColor, s.lineWidth, true))
      const mid = pts[0].clone().add(pts[1]).multiplyScalar(0.5)
      this.measureLabelPositions.push({
        pos: mid,
        text: `${pts[0].distanceTo(pts[1]).toFixed(3)} Å`,
        color: s.lineColor,
      })
    } else if (type === 'angle' && pts.length === 3) {
      this.measureGroup.add(this.makeLine2([pts[0], pts[1]], s.angleColor, s.lineWidth, true))
      this.measureGroup.add(this.makeLine2([pts[1], pts[2]], s.angleColor, s.lineWidth, true))
      const arcPos = this.addAngleArc(pts[0], pts[1], pts[2], s)
      if (arcPos) this.measureLabelPositions.push({
        pos: arcPos,
        text: `${this.calcAngle(pts[0], pts[1], pts[2]).toFixed(2)}°`,
        color: s.angleColor,
      })
    } else if (type === 'dihedral' && pts.length === 4) {
      this.measureGroup.add(this.makeLine2(pts, s.lineColor, s.lineWidth, true))
      const arcPos = this.addDihedralVisual(pts[0], pts[1], pts[2], pts[3], s)
      if (arcPos) this.measureLabelPositions.push({
        pos: arcPos,
        text: `${this.calcDihedral(pts[0], pts[1], pts[2], pts[3]).toFixed(2)}°`,
        color: s.planeColor1,
      })
    }
  }

  private calcAngle(p1: THREE.Vector3, vertex: THREE.Vector3, p3: THREE.Vector3): number {
    const v1 = p1.clone().sub(vertex).normalize()
    const v2 = p3.clone().sub(vertex).normalize()
    return Math.acos(Math.max(-1, Math.min(1, v1.dot(v2)))) * (180 / Math.PI)
  }

  private calcDihedral(p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, p4: THREE.Vector3): number {
    const b1 = p2.clone().sub(p1), b2 = p3.clone().sub(p2), b3 = p4.clone().sub(p3)
    const n1 = b1.clone().cross(b2), n2 = b2.clone().cross(b3)
    const m1 = n1.clone().cross(b2.clone().normalize())
    return Math.atan2(m1.dot(n2), n1.dot(n2)) * (180 / Math.PI)
  }

  private addAngleArc(p1: THREE.Vector3, vertex: THREE.Vector3, p3: THREE.Vector3, s: MeasureStyle): THREE.Vector3 | null {
    const v1 = p1.clone().sub(vertex).normalize()
    const v2 = p3.clone().sub(vertex).normalize()
    const axis = v1.clone().cross(v2)
    if (axis.lengthSq() < 1e-12) return null
    axis.normalize()

    const totalAngle = v1.angleTo(v2)
    const arcR = 0.55
    const arcPts: THREE.Vector3[] = []
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * totalAngle
      const v = v1.clone().multiplyScalar(Math.cos(a)).addScaledVector(axis.clone().cross(v1), Math.sin(a))
      arcPts.push(vertex.clone().addScaledVector(v, arcR))
    }
    this.measureGroup.add(this.makeLine2(arcPts, s.angleColor, s.lineWidth))

    for (const dir of [v1, v2]) {
      this.measureGroup.add(this.makeLine2(
        [vertex.clone().addScaledVector(dir, arcR * 0.8), vertex.clone().addScaledVector(dir, arcR * 1.2)],
        s.angleColor, s.lineWidth,
      ))
    }

    const midDir = v1.clone().multiplyScalar(Math.cos(totalAngle / 2)).addScaledVector(axis.clone().cross(v1), Math.sin(totalAngle / 2))
    return vertex.clone().addScaledVector(midDir.normalize(), arcR + 0.35)
  }

  private addDihedralVisual(
    p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, p4: THREE.Vector3,
    s: MeasureStyle,
  ): THREE.Vector3 | null {
    const bondVec = p3.clone().sub(p2)
    const bondDir = bondVec.clone().normalize()
    const bondMid = p2.clone().add(p3).multiplyScalar(0.5)
    const halfLen = bondVec.length() * 0.5

    const projectPerp = (p: THREE.Vector3): THREE.Vector3 => {
      const d = p.clone().sub(bondMid)
      const perp = d.clone().addScaledVector(bondDir, -d.dot(bondDir))
      return perp.lengthSq() > 1e-12 ? perp.normalize() : new THREE.Vector3(1, 0, 0)
    }
    const perp1 = projectPerp(p1), perp4 = projectPerp(p4)

    const addPlane = (outer: THREE.Vector3, perp: THREE.Vector3, color: string) => {
      const PAD_U = 0.3
      const PAD_V = 0.4
      const outerRel = outer.clone().sub(bondMid)
      const uOuter = outerRel.dot(bondDir)
      const vOuter = outerRel.dot(perp)
      const uMin = Math.min(-halfLen, uOuter) - PAD_U
      const uMax = Math.max(halfLen, uOuter) + PAD_U
      const vMin = -PAD_V * 0.3
      const vMax = Math.max(0, vOuter) + PAD_V

      const corner = (u: number, v: number) =>
        bondMid.clone().addScaledVector(bondDir, u).addScaledVector(perp, v)
      const c0 = corner(uMin, vMin)
      const c1 = corner(uMax, vMin)
      const c2 = corner(uMax, vMax)
      const c3 = corner(uMin, vMax)

      const faceGeo = new THREE.BufferGeometry()
      faceGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
        ...c0.toArray(), ...c1.toArray(), ...c2.toArray(),
        ...c0.toArray(), ...c2.toArray(), ...c3.toArray(),
      ]), 3))
      const faceMat = new THREE.MeshBasicMaterial({
        color: this.cssHex(color),
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
      this.measureGroup.add(new THREE.Mesh(faceGeo, faceMat))
      this.measureGroup.add(this.makeLine2([c0, c1, c2, c3, c0], color, s.lineWidth))
    }

    addPlane(p1, perp1, s.planeColor1)
    addPlane(p4, perp4, s.planeColor2)

    const vMax1 = Math.max(0, p1.clone().sub(bondMid).dot(perp1))
    const vMax4 = Math.max(0, p4.clone().sub(bondMid).dot(perp4))
    const arcR = Math.min(vMax1, vMax4) * 0.5 + 0.2

    const sinA = perp1.clone().cross(perp4).dot(bondDir)
    const cosA = perp1.dot(perp4)
    const dihedralAngle = Math.atan2(sinA, cosA)
    const arcPts: THREE.Vector3[] = []
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * dihedralAngle
      const v = perp1.clone().multiplyScalar(Math.cos(a)).addScaledVector(bondDir.clone().cross(perp1), Math.sin(a))
      arcPts.push(bondMid.clone().addScaledVector(v, arcR))
    }
    this.measureGroup.add(this.makeLine2(arcPts, s.lineColor, s.lineWidth))

    for (const perp of [perp1, perp4]) {
      this.measureGroup.add(this.makeLine2(
        [bondMid.clone().addScaledVector(perp, arcR * 0.8), bondMid.clone().addScaledVector(perp, arcR * 1.2)],
        s.lineColor, s.lineWidth,
      ))
    }

    const midDir = perp1.clone().multiplyScalar(Math.cos(dihedralAngle / 2)).addScaledVector(bondDir.clone().cross(perp1), Math.sin(dihedralAngle / 2))
    return bondMid.clone().addScaledVector(midDir.normalize(), arcR + 0.35)
  }

  dispose() {
    for (const m of this.lineMaterials) m.dispose()
    this.lineMaterials = []
    this.measureGroup.clear()
  }
}
