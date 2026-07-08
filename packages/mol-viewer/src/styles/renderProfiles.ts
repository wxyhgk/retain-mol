import { CAMERA } from '../config/camera.config'
import { LIGHTING } from '../config/render.config'
import type { RenderStyle } from './schema'
import { iboviewRendererProfile } from './profiles/iboview-renderer-profile'

export type MaterialModel = 'phong' | 'publication-shader' | 'iboview-shader'
export type BondColorPolicy = 'element' | 'brighten-neutral' | 'fixed'
export type BondGeometryStyle = 'cylinder' | 'capsule'
export type AromaticBondStyle = 'dashed' | 'single' | 'kekule'
export type AtomRadiusMode = 'theme-covalent' | 'iboview-draw-radius'
export type DepthCueMode = 'three-fog' | 'iboview-fragcoord' | 'none'
export type AtomLabelMode = 'none' | 'element-symbol'

export interface DirectionalLightProfile {
  color: number
  intensity: number
  position: readonly [number, number, number]
}

export interface AmbientLightProfile {
  color: number
  intensity: number
}

export interface LightingProfile {
  ambient: AmbientLightProfile
  key: DirectionalLightProfile
  fill: DirectionalLightProfile
  rim: DirectionalLightProfile
}

export interface IboViewShaderMaterialProfile {
  shaderReg0: number
  shaderReg1: number
  shaderReg2: number
  shaderReg3: number
}

export interface DepthCueProfile {
  mode: DepthCueMode
  fadeWidth?: number
  fadeBias?: number
  color?: number
}

export interface AtomLabelProfile {
  mode: AtomLabelMode
  includeHydrogen?: boolean
  includeCarbon?: boolean
  color?: string
  colorPolicy?: 'fixed' | 'element-brightness'
  brightness?: number
  shadowColor?: string
  fontScale?: number
  sourceSize?: number
  minFontSize?: number
  maxFontSize?: number
}

export interface ResolvedRenderProfile {
  id: RenderStyle
  name: string
  description: string
  materialModel: MaterialModel
  bondColorPolicy: BondColorPolicy
  bondColor?: number
  bondGeometry: BondGeometryStyle
  bondOpenEnded?: boolean
  bondTaper?: number
  bondStartOffsetFactor?: number
  multiBondRadiusScale?: number
  multiBondOffsetFactor?: number
  fullBondThreshold?: number
  aromaticBondStyle: AromaticBondStyle
  outline: boolean
  backgroundGrid: boolean
  cameraFov: number
  cameraFitMultiplier?: number
  depthCue: DepthCueProfile
  lighting: LightingProfile
  atomLabels?: AtomLabelProfile
  atomRadiusMode?: AtomRadiusMode
  atomRadiusScale?: number
  hydrogenBallStickRadiusMultiplier?: number
  iboviewMaterial?: {
    atom: IboViewShaderMaterialProfile
    bond: IboViewShaderMaterialProfile
    orbital?: IboViewShaderMaterialProfile
  }
}

const defaultLighting: LightingProfile = {
  ambient: LIGHTING.ambient,
  key: LIGHTING.keyLight,
  fill: LIGHTING.fillLight,
  rim: LIGHTING.rimLight,
}

const RENDER_PROFILES = {
  realistic: {
    id: 'realistic',
    name: '写实',
    description: 'Realistic',
    materialModel: 'phong',
    bondColorPolicy: 'brighten-neutral',
    bondGeometry: 'cylinder',
    aromaticBondStyle: 'dashed',
    outline: false,
    backgroundGrid: true,
    cameraFov: CAMERA.fov,
    depthCue: { mode: 'three-fog' },
    lighting: defaultLighting,
  },
  publication: {
    id: 'publication',
    name: '论文',
    description: 'Publication',
    materialModel: 'publication-shader',
    bondColorPolicy: 'element',
    bondGeometry: 'cylinder',
    aromaticBondStyle: 'dashed',
    outline: true,
    backgroundGrid: true,
    cameraFov: CAMERA.fov,
    depthCue: { mode: 'three-fog' },
    lighting: defaultLighting,
  },
  iboview: iboviewRendererProfile,
} satisfies Record<string, ResolvedRenderProfile>

const REGISTERED_RENDER_PROFILES: Record<string, ResolvedRenderProfile> = {}

export function registerRenderProfile(profile: ResolvedRenderProfile): ResolvedRenderProfile {
  if (!profile.id) throw new Error('render profile id is required')
  REGISTERED_RENDER_PROFILES[profile.id] = profile
  return profile
}

export function resolveRenderProfile(id: RenderStyle): ResolvedRenderProfile {
  const profile = REGISTERED_RENDER_PROFILES[id] ?? RENDER_PROFILES[id]
  if (!profile) throw new Error(`未找到 render profile: ${id}`)
  return profile
}

export function listRenderProfiles(): { id: RenderStyle; name: string; description: string }[] {
  return Object.values({ ...RENDER_PROFILES, ...REGISTERED_RENDER_PROFILES }).map(profile => ({
    id: profile.id,
    name: profile.name,
    description: profile.description,
  }))
}
