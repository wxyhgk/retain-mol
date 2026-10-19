import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { MEASURE_VIS } from '../../config/overlay.config'
import { RENDER } from '../../config/render.config'

/** Creates Three.js primitives used by measurement visuals. */
export class MeasurePrimitiveFactory {
  private lineMaterials: LineMaterial[] = []

  constructor(
    private readonly group: THREE.Group,
    private readonly canvas: HTMLCanvasElement,
  ) {}

  addLine(points: THREE.Vector3[], color: string, lineWidth: number, dashed = false) {
    const geometry = new LineGeometry()
    geometry.setPositions(points.flatMap(point => [point.x, point.y, point.z]))
    const material = new LineMaterial({
      color: cssHex(color),
      linewidth: lineWidth,
      resolution: new THREE.Vector2(this.canvas.clientWidth, this.canvas.clientHeight),
      dashed,
      dashSize: MEASURE_VIS.lineDashSize,
      gapSize: MEASURE_VIS.lineGapSize,
    })
    this.lineMaterials.push(material)
    const line = new Line2(geometry, material)
    if (dashed) line.computeLineDistances()
    this.group.add(line)
    return line
  }

  addPoint(position: THREE.Vector3, color: string) {
    const geometry = new THREE.SphereGeometry(
      MEASURE_VIS.pointRadius,
      MEASURE_VIS.pointSegments,
      MEASURE_VIS.pointSegments,
    )
    const point = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: cssHex(color) }))
    point.position.copy(position)
    this.group.add(point)
    return point
  }

  addPendingHalo(position: THREE.Vector3, radius: number, color: string) {
    const geometry = new THREE.SphereGeometry(radius, RENDER.sphereSegments, RENDER.sphereSegments)
    const material = new THREE.MeshBasicMaterial({
      color: cssHex(color),
      transparent: true,
      opacity: RENDER.pendingHaloOpacity,
      side: THREE.BackSide,
    })
    const halo = new THREE.Mesh(geometry, material)
    halo.position.copy(position)
    halo.renderOrder = 1
    this.group.add(halo)
    return halo
  }

  addPlane(corners: [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3], color: string) {
    const [corner0, corner1, corner2, corner3] = corners
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
      ...corner0.toArray(), ...corner1.toArray(), ...corner2.toArray(),
      ...corner0.toArray(), ...corner2.toArray(), ...corner3.toArray(),
    ]), 3))
    const material = new THREE.MeshBasicMaterial({
      color: cssHex(color),
      transparent: true,
      opacity: MEASURE_VIS.dihedralPlaneOpacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const plane = new THREE.Mesh(geometry, material)
    this.group.add(plane)
    return plane
  }

  resize(width: number, height: number) {
    for (const material of this.lineMaterials) material.resolution.set(width, height)
  }

  reset() {
    this.lineMaterials = []
  }
}

function cssHex(css: string) {
  return Number.parseInt(css.slice(1), 16)
}
