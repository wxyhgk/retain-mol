import * as THREE from 'three'
import type { DisplayMode } from '../types'
import type { SceneObject } from '../sceneObject'
import type { ResolvedTheme } from '../../presets'
import type { RenderStyle } from '../../styles'
import { RENDER } from '../../config/render.config'
import { MoleculeRenderer } from './MoleculeRenderer'

export class MoleculeSceneLayer {
  private readonly renderers = new Map<string, MoleculeRenderer>()
  private readonly groups = new Map<string, THREE.Group>()

  constructor(
    private readonly modelGroup: THREE.Group,
    private readonly getTheme: () => ResolvedTheme,
    private readonly invalidate?: () => void,
  ) {}

  render(
    objects: readonly SceneObject[],
    activeObjectId: string | null,
    displayMode: DisplayMode,
    selectedAtoms: Set<string>,
    selectedBonds: Set<string>,
    renderStyle: RenderStyle,
    aromaticCentroids: (molecule: SceneObject['molecule']) => Map<string, THREE.Vector3>,
  ) {
    const objectIds = new Set(objects.map(object => object.id))
    for (const [id, renderer] of this.renderers) {
      if (objectIds.has(id)) continue
      renderer.dispose()
      this.renderers.delete(id)
      const group = this.groups.get(id)
      if (group) this.modelGroup.remove(group)
      this.groups.delete(id)
    }

    for (const object of objects) {
      let group = this.groups.get(object.id)
      if (!group) {
        group = new THREE.Group()
        this.modelGroup.add(group)
        this.groups.set(object.id, group)
      }
      group.visible = object.visible
      if (!object.visible) continue

      let renderer = this.renderers.get(object.id)
      if (!renderer) {
        renderer = new MoleculeRenderer(group, this.getTheme, this.invalidate)
        this.renderers.set(object.id, renderer)
      }
      const active = object.id === activeObjectId
      renderer.render(
        object.molecule,
        displayMode,
        active ? selectedAtoms : new Set<string>(),
        active ? selectedBonds : new Set<string>(),
        aromaticCentroids(object.molecule),
        renderStyle,
        { opacity: active ? 1 : RENDER.inactiveObjectOpacity },
      )
    }
  }

  aggregateAtomMeshes(fallback: ReadonlyMap<string, THREE.Mesh>) {
    if (this.renderers.size === 0) return new Map(fallback)
    const merged = new Map<string, THREE.Mesh>()
    for (const renderer of this.renderers.values()) {
      for (const [id, mesh] of renderer.atomMeshes) merged.set(id, mesh)
    }
    return merged
  }

  aggregateBondMeshes(fallback: ReadonlyMap<string, THREE.Group>) {
    if (this.renderers.size === 0) return new Map(fallback)
    const merged = new Map<string, THREE.Group>()
    for (const renderer of this.renderers.values()) {
      for (const [id, group] of renderer.bondMeshes) merged.set(id, group)
    }
    return merged
  }

  setDragHoverAtom(atomId: string | null) {
    for (const renderer of this.renderers.values()) {
      if (atomId && renderer.atomMeshes.has(atomId)) renderer.setDragHover(atomId)
      else renderer.clearDragHover()
    }
  }

  dispose() {
    for (const renderer of this.renderers.values()) renderer.dispose()
    this.renderers.clear()
    for (const group of this.groups.values()) this.modelGroup.remove(group)
    this.groups.clear()
  }
}
