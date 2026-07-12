import * as THREE from 'three'
import { applyMaterialVisualState } from './moleculeStylePrimitives'

export interface ObjectVisualState {
  readonly opacity?: number
}

export function applyObjectVisualState(group: THREE.Group, visualState: ObjectVisualState) {
  const opacity = visualState.opacity ?? 1
  group.traverse(object => {
    const mesh = object as THREE.Mesh
    if (!mesh.isMesh) return
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of materials) applyMaterialVisualState(material, opacity)
  })
}
