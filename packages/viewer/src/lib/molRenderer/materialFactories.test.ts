import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { resolveRenderProfile } from '../../styles'
import {
  listMaterialFactories,
  registerMaterialFactory,
  resolveMaterialFactory,
  type MaterialFactory,
} from './materialFactories'

describe('material factory registry', () => {
  it('contains the built-in renderer material models', () => {
    expect(listMaterialFactories()).toEqual(expect.arrayContaining([
      'phong', 'publication-shader', 'iboview-shader',
    ]))
  })

  it('registers a custom factory with explicit conflict and disposal semantics', () => {
    const factory: MaterialFactory = {
      id: 'test-material',
      createAtomMaterial: ({ color }) => new THREE.MeshBasicMaterial({ color }),
      createBondMaterial: ({ color }) => new THREE.MeshBasicMaterial({ color }),
      syncColor: (material, color) => (material as THREE.MeshBasicMaterial).color.setHex(color),
    }
    const dispose = registerMaterialFactory(factory)
    const resolved = resolveMaterialFactory(factory.id)
    const material = resolved.createAtomMaterial({
      profile: resolveRenderProfile('realistic'),
      color: 0x123456,
      displayMode: 'ball-stick',
    }) as THREE.MeshBasicMaterial
    expect(material.color.getHex()).toBe(0x123456)
    expect(() => registerMaterialFactory(factory)).toThrow(/already registered/)
    dispose()
    expect(() => resolveMaterialFactory(factory.id)).toThrow(/未找到/)
    material.dispose()
  })
})
