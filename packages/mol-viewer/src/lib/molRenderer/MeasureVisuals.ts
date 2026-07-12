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
import { MEASURE_VIS } from '../../config/overlay.config'
import { calcAngle, calcDihedral } from '../builder/geometry/measure'
import { angleArcGeometry, dihedralGeometry } from './measureGeometry'

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

  private clearVisuals() {
    const geometries = new Set<THREE.BufferGeometry>()
    const materials = new Set<THREE.Material>()
    this.measureGroup.traverse(object => {
      const renderable = object as THREE.Object3D & {
        geometry?: THREE.BufferGeometry
        material?: THREE.Material | THREE.Material[]
      }
      if (renderable.geometry) geometries.add(renderable.geometry)
      if (Array.isArray(renderable.material)) {
        for (const material of renderable.material) materials.add(material)
      } else if (renderable.material) {
        materials.add(renderable.material)
      }
    })
    for (const geometry of geometries) geometry.dispose()
    for (const material of materials) material.dispose()
    this.lineMaterials = []
    this.measureGroup.clear()
    this.measureLabelPositions = []
  }

  update(
    committed: Array<{ type: MeasureType; atoms: Atom[] }>,
    pending: Atom[],
  ) {
    this.clearVisuals()

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
      dashSize: MEASURE_VIS.lineDashSize,
      gapSize:  MEASURE_VIS.lineGapSize,
    })
    this.lineMaterials.push(mat)
    const line = new Line2(geo, mat)
    if (dashed) line.computeLineDistances()
    return line
  }

  private renderOneMeasure(type: MeasureType, pts: THREE.Vector3[], s: MeasureStyle, ghost: boolean) {
    void ghost
    pts.forEach(p => {
      const geo = new THREE.SphereGeometry(MEASURE_VIS.pointRadius, MEASURE_VIS.pointSegments, MEASURE_VIS.pointSegments)
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
        text: `${calcAngle(pts[0], pts[1], pts[2]).toFixed(2)}°`,
        color: s.angleColor,
      })
    } else if (type === 'dihedral' && pts.length === 4) {
      this.measureGroup.add(this.makeLine2(pts, s.lineColor, s.lineWidth, true))
      const arcPos = this.addDihedralVisual(pts[0], pts[1], pts[2], pts[3], s)
      if (arcPos) this.measureLabelPositions.push({
        pos: arcPos,
        text: `${calcDihedral(pts[0], pts[1], pts[2], pts[3]).toFixed(2)}°`,
        color: s.planeColor1,
      })
    }
  }

  private addAngleArc(p1: THREE.Vector3, vertex: THREE.Vector3, p3: THREE.Vector3, s: MeasureStyle): THREE.Vector3 | null {
    const arc = angleArcGeometry(p1, vertex, p3)
    if (!arc) return null
    this.measureGroup.add(this.makeLine2(arc.arcPts, s.angleColor, s.lineWidth))
    for (const seg of arc.tickSegs) {
      this.measureGroup.add(this.makeLine2(seg, s.angleColor, s.lineWidth))
    }
    return arc.labelPos
  }

  private addDihedralVisual(
    p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, p4: THREE.Vector3,
    s: MeasureStyle,
  ): THREE.Vector3 | null {
    const d = dihedralGeometry(p1, p2, p3, p4)
    const planeColors = [s.planeColor1, s.planeColor2]
    d.planes.forEach((corners, i) => {
      const color = planeColors[i]
      const [c0, c1, c2, c3] = corners
      const faceGeo = new THREE.BufferGeometry()
      faceGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
        ...c0.toArray(), ...c1.toArray(), ...c2.toArray(),
        ...c0.toArray(), ...c2.toArray(), ...c3.toArray(),
      ]), 3))
      const faceMat = new THREE.MeshBasicMaterial({
        color: this.cssHex(color),
        transparent: true,
        opacity: MEASURE_VIS.dihedralPlaneOpacity,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
      this.measureGroup.add(new THREE.Mesh(faceGeo, faceMat))
      this.measureGroup.add(this.makeLine2([c0, c1, c2, c3, c0], color, s.lineWidth))
    })

    this.measureGroup.add(this.makeLine2(d.arcPts, s.lineColor, s.lineWidth))
    for (const seg of d.tickSegs) {
      this.measureGroup.add(this.makeLine2(seg, s.lineColor, s.lineWidth))
    }
    return d.labelPos
  }

  dispose() {
    this.clearVisuals()
  }
}
