import * as THREE from 'three'
import type { DisplayMode } from '../types'
import type { ResolvedTheme } from '../../presets'
import type { ResolvedRenderProfile } from '../../styles'
import { RENDER, RENDER_ORDER } from '../../config/render.config'
import {
  atomDisplayRadius,
  makeBondMaterial,
  outlineColor,
  visualBondElementColor,
} from './moleculeStylePrimitives'

export interface BondLineSpec {
  readonly offset: number
  readonly radius: number
}

export interface HalfBondSegment {
  center: THREE.Vector3
  readonly length: number
}

/** Creates profile-specific bond geometry and materials. */
export class BondMeshFactory {
  constructor(
    private readonly getTheme: () => ResolvedTheme,
    private readonly getProfile: () => ResolvedRenderProfile,
  ) {}

  atomRadius(symbol: string, displayMode: DisplayMode) {
    return atomDisplayRadius(this.getTheme(), this.getProfile(), symbol, displayMode)
  }

  elementColor(symbol: string) {
    return visualBondElementColor(this.getTheme(), this.getProfile(), symbol)
  }

  addHalfBond(
    group: THREE.Group,
    start: THREE.Vector3,
    direction: THREE.Vector3,
    length: number,
    atomRadius1: number,
    atomRadius2: number,
    radius: number,
    color1: number,
    color2: number,
    bondId: string,
    offset?: THREE.Vector3,
  ) {
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
    const halves = this.halfBondSegments(start, direction, length, atomRadius1, atomRadius2)
    if (offset) {
      halves[0].center.add(offset)
      halves[1].center.add(offset)
    }
    const taper = this.getProfile().bondTaper ?? 1
    const segments = [
      { ...halves[0], color: color1, radiusBottom: radius, radiusTop: radius * taper },
      { ...halves[1], color: color2, radiusBottom: radius * taper, radiusTop: radius },
    ] as const
    for (const segment of segments) {
      const cylinder = this.makeCylinder(
        radius, segment.length, segment.color, bondId, segment.radiusTop, segment.radiusBottom,
      )
      cylinder.position.copy(segment.center)
      cylinder.quaternion.copy(quaternion)
      group.add(cylinder)
    }
  }

  addSingleBond(
    group: THREE.Group,
    center: THREE.Vector3,
    direction: THREE.Vector3,
    length: number,
    radius: number,
    color: number,
    bondId: string,
    offset?: THREE.Vector3,
  ) {
    const cylinder = this.makeCylinder(radius, length, color, bondId)
    cylinder.position.copy(center)
    if (offset) cylinder.position.add(offset)
    cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
    group.add(cylinder)
  }

  makeCylinder(
    radius: number,
    length: number,
    color: number,
    bondId: string,
    radiusTop = radius,
    radiusBottom = radius,
  ) {
    const profile = this.getProfile()
    const geometry = profile.bondGeometry === 'capsule'
      ? new THREE.CapsuleGeometry(
          radius,
          Math.max(length - radius * 2, 0.001),
          Math.max(Math.floor(RENDER.cylinderSegments / 2), 4),
          RENDER.cylinderSegments,
        )
      : new THREE.CylinderGeometry(
          radiusTop, radiusBottom, length, RENDER.cylinderSegments, 1, profile.bondOpenEnded ?? false,
        )
    const cylinder = new THREE.Mesh(geometry, makeBondMaterial(profile, color))
    cylinder.userData = { type: 'bond', id: bondId }
    if (profile.outline) {
      const scale = (radius + Math.max(RENDER.outlineBondMinOffset, radius * RENDER.outlineBondRadialFactor)) / radius
      const outline = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ color: outlineColor(this.getTheme()), side: THREE.BackSide }),
      )
      outline.userData = { type: 'bond', id: bondId }
      outline.scale.set(scale, 1, scale)
      outline.renderOrder = RENDER_ORDER.outline
      cylinder.add(outline)
    }
    return cylinder
  }

  geometryLength(geometry: THREE.BufferGeometry, fallback: number) {
    const parameters = (geometry as THREE.BufferGeometry & {
      parameters?: { height?: number; length?: number; radius?: number }
    }).parameters
    if (!parameters) return fallback
    if (typeof parameters.height === 'number') return parameters.height
    if (typeof parameters.length === 'number' && typeof parameters.radius === 'number') {
      return parameters.length + parameters.radius * 2
    }
    return fallback
  }

  halfBondSegments(
    start: THREE.Vector3,
    direction: THREE.Vector3,
    length: number,
    atomRadius1: number,
    atomRadius2: number,
  ): [HalfBondSegment, HalfBondSegment] {
    const half = length / 2
    const offsetFactor = this.getProfile().bondStartOffsetFactor ?? 0
    const offset1 = Math.min(atomRadius1 * offsetFactor, Math.max(0, half - 0.001))
    const offset2 = Math.min(atomRadius2 * offsetFactor, Math.max(0, half - 0.001))
    const length1 = Math.max(half - offset1, 0.001)
    const length2 = Math.max(half - offset2, 0.001)
    return [
      { center: start.clone().addScaledVector(direction, offset1 + length1 / 2), length: length1 },
      { center: start.clone().addScaledVector(direction, length - offset2 - length2 / 2), length: length2 },
    ]
  }

  lineSpecs(order: number, radius: number, gap: number, displayMode: DisplayMode): BondLineSpec[] {
    if (displayMode === 'tube' || order === 1) return [{ offset: 0, radius }]
    const count = Math.min(Math.max(Math.ceil(order), 1), 3)
    const profile = this.getProfile()
    if (profile.multiBondRadiusScale && profile.multiBondOffsetFactor !== undefined) {
      const lineRadius = radius * (count === 1 ? 1 : profile.multiBondRadiusScale / count)
      const position = radius * profile.multiBondOffsetFactor
      const offsets = count === 2 ? [-position, position] : [-position, 0, position]
      return offsets.map(offset => ({ offset, radius: lineRadius }))
    }
    const lineRadius = order === 2
      ? radius * RENDER.doubleBondRadiusFactor
      : radius * RENDER.tripleBondRadiusFactor
    const offsets = order === 2 ? [-gap / 2, gap / 2] : [-gap, 0, gap]
    return offsets.map(offset => ({ offset, radius: lineRadius }))
  }
}
