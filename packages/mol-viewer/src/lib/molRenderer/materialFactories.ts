import * as THREE from 'three'
import type { DisplayMode } from '../presentation/types'
import { RENDER } from '../../config/render.config'
import type { MaterialModel, ResolvedRenderProfile } from '../../styles/renderProfiles'
import {
  iboviewShaderColor,
  makeCylinderMat,
  makeIboViewMat,
  makeSphereMat,
  sphereShades,
} from './publicationMaterials'

export interface MaterialFactoryContext {
  readonly profile: ResolvedRenderProfile
  readonly color: number
  readonly displayMode?: DisplayMode
}

export interface MaterialFactory {
  readonly id: MaterialModel
  createAtomMaterial(context: MaterialFactoryContext): THREE.Material
  createBondMaterial(context: MaterialFactoryContext): THREE.Material
  syncColor(material: THREE.Material, color: number, profile: ResolvedRenderProfile): void
}

const factories = new Map<string, MaterialFactory>()

function makePhongMaterial(color: number, displayMode?: DisplayMode): THREE.MeshPhongMaterial {
  return new THREE.MeshPhongMaterial({
    color,
    shininess: RENDER.atomShininess,
    specular: RENDER.atomSpecular,
    wireframe: displayMode === 'wireframe',
  })
}

function syncDefault(material: THREE.Material, color: number, profile: ResolvedRenderProfile) {
  const target = material as THREE.ShaderMaterial & { color?: THREE.Color }
  const hiUniform = target.uniforms?.uHi
  const baseUniform = target.uniforms?.uBase
  const lowUniform = target.uniforms?.uLo
  const colorUniform = target.uniforms?.uColor
  if (target.isShaderMaterial && hiUniform && baseUniform && lowUniform) {
    const shades = sphereShades(color)
    hiUniform.value = shades.hi
    baseUniform.value = shades.base
    lowUniform.value = shades.lo
  } else if (target.isShaderMaterial && colorUniform) {
    if (profile.materialModel === 'iboview-shader') colorUniform.value.copy(iboviewShaderColor(color))
    else colorUniform.value.setHex(color)
  } else if (target.color) {
    target.color.setHex(color)
  }
}

const phongFactory: MaterialFactory = {
  id: 'phong',
  createAtomMaterial: ({ color, displayMode }) => makePhongMaterial(color, displayMode),
  createBondMaterial: ({ color }) => new THREE.MeshPhongMaterial({ color, shininess: RENDER.bondShininess }),
  syncColor: syncDefault,
}

const publicationFactory: MaterialFactory = {
  id: 'publication-shader',
  createAtomMaterial: ({ color, displayMode }) => displayMode === 'wireframe'
    ? makePhongMaterial(color, displayMode)
    : makeSphereMat(color),
  createBondMaterial: ({ color }) => makeCylinderMat(color),
  syncColor: syncDefault,
}

const iboviewFactory: MaterialFactory = {
  id: 'iboview-shader',
  createAtomMaterial: ({ profile, color, displayMode }) => {
    if (displayMode === 'wireframe') return makePhongMaterial(color, displayMode)
    const materialProfile = profile.iboviewMaterial
    if (!materialProfile) throw new Error(`render profile "${profile.id}" is missing iboview material settings`)
    return makeIboViewMat(color, materialProfile.atom, profile.depthCue)
  },
  createBondMaterial: ({ profile, color }) => {
    const materialProfile = profile.iboviewMaterial
    if (!materialProfile) throw new Error(`render profile "${profile.id}" is missing iboview material settings`)
    return makeIboViewMat(color, materialProfile.bond, profile.depthCue)
  },
  syncColor: syncDefault,
}

for (const factory of [phongFactory, publicationFactory, iboviewFactory]) factories.set(factory.id, factory)

export function registerMaterialFactory(
  factory: MaterialFactory,
  options: { conflict?: 'reject' | 'replace' } = {},
): () => void {
  if (!factory.id.trim()) throw new Error('material factory id is required')
  if (factories.has(factory.id) && options.conflict !== 'replace') {
    throw new Error(`material factory already registered: ${factory.id}`)
  }
  const previous = factories.get(factory.id)
  factories.set(factory.id, factory)
  return () => {
    if (factories.get(factory.id) !== factory) return
    if (previous) factories.set(factory.id, previous)
    else factories.delete(factory.id)
  }
}

export function resolveMaterialFactory(id: MaterialModel): MaterialFactory {
  const factory = factories.get(id)
  if (!factory) throw new Error(`未找到 material factory: ${id}`)
  return factory
}

export function listMaterialFactories(): readonly string[] {
  return [...factories.keys()]
}
