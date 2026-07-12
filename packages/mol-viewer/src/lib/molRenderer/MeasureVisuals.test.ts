import { describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { resolveTheme } from '../../presets'
import type { Atom } from '../molecule'
import { MeasureVisuals } from './MeasureVisuals'

function collectResources(group: THREE.Group): Array<THREE.BufferGeometry | THREE.Material> {
  const resources = new Set<THREE.BufferGeometry | THREE.Material>()
  group.traverse(object => {
    const renderable = object as THREE.Object3D & {
      geometry?: THREE.BufferGeometry
      material?: THREE.Material | THREE.Material[]
    }
    if (renderable.geometry) resources.add(renderable.geometry)
    if (Array.isArray(renderable.material)) {
      for (const material of renderable.material) resources.add(material)
    } else if (renderable.material) {
      resources.add(renderable.material)
    }
  })
  return [...resources]
}

function trackDisposal(resources: Array<THREE.BufferGeometry | THREE.Material>) {
  return resources.map(resource => vi.spyOn(resource, 'dispose'))
}

describe('MeasureVisuals resources', () => {
  it('disposes every removed geometry and material on update and dispose', () => {
    const group = new THREE.Group()
    const canvas = { clientWidth: 800, clientHeight: 600 } as HTMLCanvasElement
    const visuals = new MeasureVisuals(group, canvas, () => resolveTheme('default'))
    const c: Atom = { id: 'c', symbol: 'C', x: 0, y: 0, z: 0 }
    const o: Atom = { id: 'o', symbol: 'O', x: 1.2, y: 0, z: 0 }
    const h: Atom = { id: 'h', symbol: 'H', x: 1.2, y: 1, z: 0 }

    visuals.update([{ type: 'distance', atoms: [c, o] }], [h])
    const firstResources = collectResources(group)
    const firstDisposals = trackDisposal(firstResources)
    expect(firstResources.length).toBeGreaterThan(0)

    visuals.update([{ type: 'angle', atoms: [c, o, h] }], [])

    for (const dispose of firstDisposals) expect(dispose).toHaveBeenCalledTimes(1)
    const secondResources = collectResources(group)
    const secondDisposals = trackDisposal(secondResources)
    expect(secondResources.length).toBeGreaterThan(0)

    visuals.dispose()

    for (const dispose of secondDisposals) expect(dispose).toHaveBeenCalledTimes(1)
    expect(group.children).toHaveLength(0)
    expect(visuals.measureLabelPositions).toEqual([])
  })
})
