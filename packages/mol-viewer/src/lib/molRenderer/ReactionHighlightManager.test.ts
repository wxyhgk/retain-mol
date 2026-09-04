import { describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { REACTION_HIGHLIGHT_STYLES } from '../../config/reactionHighlights.config'
import type { ReactionHighlight } from '../reactionHighlights'
import { ReactionHighlightManager } from './ReactionHighlightManager'

function createHarness() {
  const modelGroup = new THREE.Group()
  const positions = new Map<string, THREE.Vector3>([
    ['a', new THREE.Vector3(0, 0, 0)],
    ['b', new THREE.Vector3(0, 3, 0)],
  ])
  const invalidate = vi.fn()
  const manager = new ReactionHighlightManager(
    modelGroup,
    (atomId, target) => {
      const position = positions.get(atomId)
      if (!position) return false
      target.copy(position)
      return true
    },
    invalidate,
  )
  return { invalidate, manager, modelGroup, positions }
}

function definition(overrides: Partial<ReactionHighlight> = {}): ReactionHighlight {
  return {
    id: 'reaction',
    atomId1: 'a',
    atomId2: 'b',
    kind: 'breaking',
    ...overrides,
  }
}

function meshes(root: THREE.Object3D): THREE.Mesh[] {
  const result: THREE.Mesh[] = []
  root.traverse(object => {
    if (object instanceof THREE.Mesh) result.push(object)
  })
  return result
}

describe('ReactionHighlightManager', () => {
  it('mounts native 3D visuals under modelGroup with depth-tested non-pickable materials', () => {
    const { manager, modelGroup } = createHarness()
    manager.setHighlights([definition()])

    expect(manager.group.parent).toBe(modelGroup)
    expect(manager.group.children).toHaveLength(1)
    const segmentMeshes = meshes(manager.group).filter(
      mesh => mesh.userData.type === 'reaction-highlight-segment',
    )
    expect(segmentMeshes).toHaveLength(9)
    const material = segmentMeshes[0]!.material as THREE.MeshBasicMaterial
    expect(material.depthTest).toBe(true)
    expect(material.depthWrite).toBe(false)
    expect(material.transparent).toBe(true)
    expect(material.color.getHexString()).toBe(
      new THREE.Color(REACTION_HIGHLIGHT_STYLES.breaking.color).getHexString(),
    )
    expect(segmentMeshes.every(mesh => mesh.userData.pickable === false)).toBe(true)
    manager.dispose()
  })

  it('updates endpoint geometry from the current atom positions without moving modelGroup', () => {
    const { manager, modelGroup, positions } = createHarness()
    manager.setHighlights([definition({ dashed: false, radius: 0.1 })])
    const segment = meshes(manager.group).find(
      mesh => mesh.userData.type === 'reaction-highlight-segment',
    )!
    const groupPosition = modelGroup.position.clone()
    const groupQuaternion = modelGroup.quaternion.clone()

    expect(segment.position.toArray()).toEqual([0, 1.5, 0])
    expect(segment.scale.toArray()).toEqual([0.1, 3, 0.1])
    positions.set('b', new THREE.Vector3(4, 0, 0))
    manager.update()

    expect(segment.position.toArray()).toEqual([2, 0, 0])
    expect(segment.scale.y).toBe(4)
    expect(modelGroup.position.equals(groupPosition)).toBe(true)
    expect(modelGroup.quaternion.equals(groupQuaternion)).toBe(true)
    manager.dispose()
  })

  it('disposes geometry and material when an endpoint disappears, then recreates on return', () => {
    const { manager, positions } = createHarness()
    manager.setHighlights([definition()])
    const segment = meshes(manager.group).find(
      mesh => mesh.userData.type === 'reaction-highlight-segment',
    )!
    const geometryDispose = vi.spyOn(segment.geometry, 'dispose')
    const materialDispose = vi.spyOn(segment.material as THREE.Material, 'dispose')

    positions.delete('b')
    manager.update()

    expect(manager.group.children).toHaveLength(0)
    expect(geometryDispose).toHaveBeenCalledOnce()
    expect(materialDispose).toHaveBeenCalledOnce()

    positions.set('b', new THREE.Vector3(0, 2, 0))
    manager.update()
    expect(manager.group.children).toHaveLength(1)
    manager.dispose()
  })

  it('clear releases all visuals and makes focus unavailable', () => {
    const { manager } = createHarness()
    manager.setHighlights([
      definition(),
      definition({
        id: 'coordination',
        kind: 'coordination',
        atomId1: 'b',
        atomId2: 'a',
      }),
    ])
    expect(manager.getFocusPoints()).toHaveLength(4)

    manager.clear()

    expect(manager.group.children).toHaveLength(0)
    expect(manager.getFocusPoints()).toEqual([])
    manager.dispose()
  })
})
