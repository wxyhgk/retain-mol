import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { resolveTheme } from '../../presets'
import type { Molecule } from '../molecule'
import { MoleculeRenderer } from './MoleculeRenderer'

const ethaneSkeleton: Molecule = {
  name: 'C-C',
  atoms: [
    { id: 'a1', symbol: 'C', x: -0.7, y: 0, z: 0 },
    { id: 'a2', symbol: 'C', x: 0.7, y: 0, z: 0 },
  ],
  bonds: [{ id: 'b1', atomId1: 'a1', atomId2: 'a2', order: 1 }],
}

describe('MoleculeRenderer bond picking identity', () => {
  it('assigns the same bond identity to publication bodies and outlines', () => {
    const group = new THREE.Group()
    const renderer = new MoleculeRenderer(group, () => resolveTheme('default'))

    renderer.render(
      ethaneSkeleton,
      'ball-stick',
      new Set(),
      new Set(),
      new Map(),
      'publication',
    )

    const bondGroup = renderer.bondMeshes.get('b1')
    expect(bondGroup).toBeDefined()
    const meshes: THREE.Mesh[] = []
    bondGroup?.traverse(object => {
      if ((object as THREE.Mesh).isMesh) meshes.push(object as THREE.Mesh)
    })

    expect(meshes.length).toBeGreaterThan(1)
    expect(meshes.every(mesh => (
      mesh.userData.type === 'bond' && mesh.userData.id === 'b1'
    ))).toBe(true)

    renderer.dispose()
  })
})
