import * as THREE from 'three'
import type { DisplayMode } from '../types'
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

function syncDefault(material: THREE.Material, color: number, profile: ResolvedRenderProfile) {
  const target = material as THREE.ShaderMaterial & { color?: THREE.Color }
  if (target.isShaderMaterial && target.uniforms?.uHi) {
    const shades = sphereShades(color)
    target.uniforms.uHi.value = shades.hi
    target.uniforms.uBase.value = shades.base
    target.uniforms.uLo.value = shades.lo
  } else if (target.isShaderMaterial && target.uniforms?.uColor) {
    if (profile.materialModel === 'iboview-shader') target.uniforms.uColor.value.copy(iboviewShaderColor(color))
    else target.uniforms.uColor.value.setHex(color)
  } else if (target.color) {
    target.color.setHex(color)
  }
}

const phongFactory: MaterialFactory = {
  id: 'phong',
  createAtomMaterial: ({ color, displayMode }) => new THREE.MeshPhongMaterial({
    color,
    shininess: RENDER.atomShininess,
    specular: RENDER.atomSpecular,
    wireframe: displayMode === 'wireframe',
  }),
  createBondMaterial: ({ color }) => new THREE.MeshPhongMaterial({ color, shininess: RENDER.bondShininess }),
  syncColor: syncDefault,
}

const publicationFactory: MaterialFactory = {
  id: 'publication-shader',
  createAtomMaterial: ({ color, displayMode }) => displayMode === 'wireframe'
    ? phongFactory.createAtomMaterial({ profile: {} as ResolvedRenderProfile, color, displayMode })
    : makeSphereMat(color),
  createBondMaterial: ({ color }) => makeCylinderMat(color),
  syncColor: syncDefault,
}

const iboviewFactory: MaterialFactory = {
  id: 'iboview-shader',
  createAtomMaterial: ({ profile, color, displayMode }) => displayMode === 'wireframe'
    ? phongFactory.createAtomMaterial({ profile, color, displayMode })
    : makeIboViewMat(color, profile.iboviewMaterial!.atom, profile.depthCue),
  createBondMaterial: ({ profile, color }) => makeIboViewMat(color, profile.iboviewMaterial!.bond, profile.depthCue),
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
