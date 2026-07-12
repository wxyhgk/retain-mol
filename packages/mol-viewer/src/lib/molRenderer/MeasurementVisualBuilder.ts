import * as THREE from 'three'
import type { MeasureStyle, MeasureType } from '../types'
import { calcAngle, calcDihedral } from '../builder/geometry/measure'
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
      this.primitives.addLine(points, style.lineColor, style.lineWidth, true)
      return {
        pos: points[0].clone().add(points[1]).multiplyScalar(0.5),
        text: `${points[0].distanceTo(points[1]).toFixed(3)} Å`,
        color: style.lineColor,
      }
    }

    if (type === 'angle' && points.length === 3) {
      this.primitives.addLine([points[0], points[1]], style.angleColor, style.lineWidth, true)
      this.primitives.addLine([points[1], points[2]], style.angleColor, style.lineWidth, true)
      const geometry = angleArcGeometry(points[0], points[1], points[2])
      if (!geometry) return null
      this.primitives.addLine(geometry.arcPts, style.angleColor, style.lineWidth)
      for (const segment of geometry.tickSegs) {
        this.primitives.addLine(segment, style.angleColor, style.lineWidth)
      }
      return {
        pos: geometry.labelPos,
        text: `${calcAngle(points[0], points[1], points[2]).toFixed(2)}°`,
        color: style.angleColor,
      }
    }

    if (type === 'dihedral' && points.length === 4) {
      this.primitives.addLine(points, style.lineColor, style.lineWidth, true)
      const geometry = dihedralGeometry(points[0], points[1], points[2], points[3])
      const planeColors = [style.planeColor1, style.planeColor2]
      geometry.planes.forEach((corners, index) => {
        const color = planeColors[index]
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
        text: `${calcDihedral(points[0], points[1], points[2], points[3]).toFixed(2)}°`,
        color: style.planeColor1,
      }
    }

    return null
  }
}
