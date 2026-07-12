import * as THREE from 'three'
import type { DisplayMode } from '../types'
import type { ResolvedTheme } from '../../presets'
import { hexToInt } from '../../presets'
import { getElementConfig as getElement } from '../../config/elements.config'
import { RENDER } from '../../config/render.config'
import type { ResolvedRenderProfile } from '../../styles'
import { resolveMaterialFactory } from './materialFactories'

const IBOVIEW_DRAW_RADII: Record<string, number> = {
  H: 0.87, He: 1.60, Li: 2.52, Be: 2.03, B: 1.58, C: 1.43, N: 1.32, O: 1.29, F: 1.26, Ne: 1.74,
  Na: 2.91, Mg: 2.69, Al: 2.35, Si: 2.11, P: 2.08, S: 2.04, Cl: 1.97, Ar: 1.95,
  K: 3.69, Ca: 3.33, Fe: 2.35, Co: 2.20, Ni: 2.46, Cu: 2.25, Zn: 2.38, Br: 2.17, I: 2.61,
}

export function elementColor(theme: ResolvedTheme, symbol: string): number {
  const hex = theme.elements[symbol]?.color ?? theme.fallbackColor
  return hexToInt(hex)
}

export function visualBondElementColor(
  theme: ResolvedTheme,
  profile: ResolvedRenderProfile,
  symbol: string,
): number {
  if (profile.bondColorPolicy === 'fixed') {
    return profile.bondColor ?? RENDER.bondDefaultColor
  }
  const color = elementColor(theme, symbol)
  if (profile.bondColorPolicy === 'element') return color

  const c = new THREE.Color(color)
  const hsl = { h: 0, s: 0, l: 0 }
  c.getHSL(hsl)
  if (hsl.s <= RENDER.realisticDarkNeutralMaxSaturation) {
    const minL = symbol === 'H'
      ? Math.max(RENDER.realisticHydrogenMinLightness, RENDER.realisticBondNeutralMinLightness)
      : RENDER.realisticBondNeutralMinLightness
    if (hsl.l < minL) {
      c.setHSL(hsl.h, hsl.s, minL)
      return c.getHex()
    }
  }
  return color
}

export function atomDisplayRadius(
  theme: ResolvedTheme,
  profile: ResolvedRenderProfile,
  symbol: string,
  displayMode: DisplayMode,
): number {
  const el = getElement(symbol)
  const r = theme.render
  let radius: number
  if (displayMode === 'spacefill') {
    radius = el.cpkRadius * r.spacefillScale
  } else if (displayMode === 'tube') {
    radius = r.bondRadiusStick * RENDER.tubeRadiusMultiplier
  } else if (displayMode === 'mtube') {
    radius = el.covalentRadius * r.ballScale * RENDER.mtubeScale
  } else if (displayMode === 'stick' || displayMode === 'wireframe') {
    radius = r.bondRadiusStick * RENDER.stickAtomMultiplier
  } else if (profile.atomRadiusMode === 'iboview-draw-radius') {
    radius = (IBOVIEW_DRAW_RADII[symbol] ?? IBOVIEW_DRAW_RADII.C) * (profile.atomRadiusScale ?? 0.4)
  } else {
    radius = el.covalentRadius * r.ballScale
  }
  if (profile.hydrogenBallStickRadiusMultiplier && displayMode === 'ball-stick' && symbol === 'H') {
    radius = Math.max(radius, r.bondRadiusStick * profile.hydrogenBallStickRadiusMultiplier)
  }
  return radius
}

export function makeAtomMaterial(
  profile: ResolvedRenderProfile,
  color: number,
  displayMode: DisplayMode,
): THREE.Material {
  return resolveMaterialFactory(profile.materialModel).createAtomMaterial({ profile, color, displayMode })
}

export function makeBondMaterial(profile: ResolvedRenderProfile, color: number): THREE.Material {
  return resolveMaterialFactory(profile.materialModel).createBondMaterial({ profile, color })
}

export function syncMaterialColor(
  profile: ResolvedRenderProfile,
  material: THREE.Material | THREE.Material[],
  color: number,
) {
  for (const mat of Array.isArray(material) ? material : [material]) {
    resolveMaterialFactory(profile.materialModel).syncColor(mat, color, profile)
  }
}

export function outlineColor(theme: ResolvedTheme): number {
  const bg = new THREE.Color(hexToInt(theme.scene.backgroundColor))
  const lum = 0.299 * bg.r + 0.587 * bg.g + 0.114 * bg.b
  return lum > RENDER.outlineLumaThreshold ? 0x000000 : 0xffffff
}

export function applyMaterialVisualState(material: THREE.Material | undefined, opacity: number) {
  if (!material) return
  const data = material.userData as {
    molBaseOpacity?: number
    molBaseTransparent?: boolean
    molBaseDepthWrite?: boolean
  }
  if (data.molBaseOpacity === undefined) data.molBaseOpacity = material.opacity
  if (data.molBaseTransparent === undefined) data.molBaseTransparent = material.transparent
  if (data.molBaseDepthWrite === undefined) data.molBaseDepthWrite = material.depthWrite

  const targetOpacity = data.molBaseOpacity * opacity
  material.opacity = targetOpacity
  material.transparent = data.molBaseTransparent || targetOpacity < 1
  material.depthWrite = opacity < 1 ? false : data.molBaseDepthWrite
}
