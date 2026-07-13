import * as THREE from 'three'
import type { MeasureStyle, MeasureType } from '../types'
import { calcAngle, calcDihedral } from '../geometry/measure'
import { angleArcGeometry, dihedralGeometry } from './measureGeometry'
import type { MeasurePrimitiveFactory } from './MeasurePrimitiveFactory'

export interface MeasureLabel {
  readonly pos: THREE.Vector3
  readonly text: string
  readonly color: string
}

/** Maps measurement semantics to primitive geometry and a label anchor. */
export class MeasurementVisualBuilder {
  constructor(private readonly primitives: MeasurePrimitiveFactory) {}

  render(type: MeasureType, points: THREE.Vector3[], style: MeasureStyle): MeasureLabel | null {
    for (const point of points) this.primitives.addPoint(point, style.lineColor)

    if (type === 'distance' && points.length === 2) {
      const [start, end] = points
      if (!start || !end) return null
      this.primitives.addLine(points, style.lineColor, style.lineWidth, true)
      return {
        pos: start.clone().add(end).multiplyScalar(0.5),
        text: `${start.distanceTo(end).toFixed(3)} Å`,
        color: style.lineColor,
      }
    }

    if (type === 'angle' && points.length === 3) {
      const [start, vertex, end] = points
      if (!start || !vertex || !end) return null
      this.primitives.addLine([start, vertex], style.angleColor, style.lineWidth, true)
      this.primitives.addLine([vertex, end], style.angleColor, style.lineWidth, true)
      const geometry = angleArcGeometry(start, vertex, end)
      if (!geometry) return null
      this.primitives.addLine(geometry.arcPts, style.angleColor, style.lineWidth)
      for (const segment of geometry.tickSegs) {
        this.primitives.addLine(segment, style.angleColor, style.lineWidth)
      }
      return {
        pos: geometry.labelPos,
        text: `${calcAngle(start, vertex, end).toFixed(2)}°`,
        color: style.angleColor,
      }
    }

    if (type === 'dihedral' && points.length === 4) {
      const [point0, point1, point2, point3] = points
      if (!point0 || !point1 || !point2 || !point3) return null
      this.primitives.addLine(points, style.lineColor, style.lineWidth, true)
      const geometry = dihedralGeometry(point0, point1, point2, point3)
      const planeColors: [string, string] = [style.planeColor1, style.planeColor2]
      geometry.planes.forEach((corners, index) => {
        const color = planeColors[index]
        if (color === undefined) return
        this.primitives.addPlane(corners, color)
        this.primitives.addLine(
          [corners[0], corners[1], corners[2], corners[3], corners[0]],
          color,
          style.lineWidth,
        )
      })
      this.primitives.addLine(geometry.arcPts, style.lineColor, style.lineWidth)
      for (const segment of geometry.tickSegs) {
        this.primitives.addLine(segment, style.lineColor, style.lineWidth)
      }
      return {
        pos: geometry.labelPos,
        text: `${calcDihedral(point0, point1, point2, point3).toFixed(2)}°`,
        color: style.planeColor1,
      }
    }

    return null
  }
}
