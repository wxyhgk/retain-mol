import * as THREE from 'three'
import type { ResolvedTheme } from '../../presets'
import { PLACEMENT_GHOST } from '../../config/render.config'
import { resolveRenderProfile, type RenderStyle } from '../../styles'
import {
  atomDisplayRadius,
  elementColor,
  visualBondElementColor,
} from './moleculeStylePrimitives'

export interface PlacementGhostVisualSpec {
  atomRadius(symbol: string): number
  bondRadius(): number
  atomMaterial(symbol: string): THREE.Material
  bondMaterial(symbolA: string, symbolB: string): THREE.Material
}

export function resolvePlacementGhostVisualSpec(
  theme: ResolvedTheme,
  renderStyle: RenderStyle,
): PlacementGhostVisualSpec {
  const profile = resolveRenderProfile(renderStyle)
  return {
    atomRadius(symbol) {
      return Math.max(
        PLACEMENT_GHOST.atomRadiusMin,
        atomDisplayRadius(theme, profile, symbol, 'ball-stick') * PLACEMENT_GHOST.atomRadiusScale,
      )
    },
    bondRadius() {
      return Math.max(
        PLACEMENT_GHOST.bondRadiusMin,
        theme.render.bondRadiusStick * PLACEMENT_GHOST.bondRadiusScale,
      )
    },
    atomMaterial(symbol) {
      return makeGhostMaterial(elementColor(theme, symbol), PLACEMENT_GHOST.atomOpacity)
    },
    bondMaterial(symbolA, symbolB) {
      const colorA = visualBondElementColor(theme, profile, symbolA)
      const colorB = visualBondElementColor(theme, profile, symbolB)
      return makeGhostMaterial(blendColor(colorA, colorB), PLACEMENT_GHOST.bondOpacity)
    },
  }
}

function makeGhostMaterial(color: number, opacity: number): THREE.MeshPhongMaterial {
  return new THREE.MeshPhongMaterial({
    color,
    shininess: 36,
    specular: 0xeeeeee,
    transparent: true,
    opacity,
    depthWrite: false,
  })
}

function blendColor(a: number, b: number): number {
  const ca = new THREE.Color(a)
  const cb = new THREE.Color(b)
  return new THREE.Color(
    (ca.r + cb.r) / 2,
    (ca.g + cb.g) / 2,
    (ca.b + cb.b) / 2,
  ).getHex()
}
