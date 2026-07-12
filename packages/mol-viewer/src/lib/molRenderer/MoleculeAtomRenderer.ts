import * as THREE from 'three'
import type { Atom } from '../molecule'
import type { DisplayMode } from '../types'
import type { ResolvedTheme } from '../../presets'
import type { ResolvedRenderProfile } from '../../styles'
import { RENDER } from '../../config/render.config'
import {
  atomDisplayRadius,
  elementColor,
  makeAtomMaterial,
  syncMaterialColor,
} from './moleculeStylePrimitives'
import { MoleculeSelectionVisuals } from './moleculeSelectionVisuals'

export class MoleculeAtomRenderer {
  readonly meshes = new Map<string, THREE.Mesh>()
  private readonly selectionVisuals: MoleculeSelectionVisuals

  constructor(
    private readonly modelGroup: THREE.Group,
    private readonly getTheme: () => ResolvedTheme,
    private readonly getProfile: () => ResolvedRenderProfile,
    invalidate?: () => void,
  ) {
    this.selectionVisuals = new MoleculeSelectionVisuals(modelGroup, getTheme, invalidate)
  }

  render(atoms: readonly Atom[], displayMode: DisplayMode, selectedAtoms: ReadonlySet<string>) {
    const existingIds = new Set(atoms.map(atom => atom.id))
    for (const [id, mesh] of this.meshes) {
      if (existingIds.has(id)) continue
      this.modelGroup.remove(mesh)
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
      this.meshes.delete(id)
    }
    this.selectionVisuals.removeMissing(existingIds)
    for (const atom of atoms) this.renderAtom(atom, displayMode, selectedAtoms.has(atom.id))
  }

  clearStyleDependentMeshes() {
    for (const mesh of this.meshes.values()) {
      this.modelGroup.remove(mesh)
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
    }
    this.meshes.clear()
    this.selectionVisuals.clearStyleDependentMeshes()
  }

  setDragHover(atomId: string) {
    this.selectionVisuals.setDragHover(atomId, this.meshes.get(atomId))
  }

  clearDragHover() {
    this.selectionVisuals.clearDragHover()
  }

  dispose() {
    for (const mesh of this.meshes.values()) {
      this.modelGroup.remove(mesh)
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
    }
    this.meshes.clear()
    this.selectionVisuals.dispose()
  }

  private renderAtom(atom: Atom, displayMode: DisplayMode, selected: boolean) {
    const profile = this.getProfile()
    const color = elementColor(this.getTheme(), atom.symbol)
    const radius = atomDisplayRadius(this.getTheme(), profile, atom.symbol, displayMode)
    let mesh = this.meshes.get(atom.id)
    if (!mesh) {
      mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, RENDER.sphereSegments, RENDER.sphereSegments),
        makeAtomMaterial(profile, color, displayMode),
      )
      mesh.userData = { type: 'atom', id: atom.id }
      mesh.castShadow = true
      this.modelGroup.add(mesh)
      this.meshes.set(atom.id, mesh)
    } else {
      const previousRadius = (mesh.geometry as THREE.SphereGeometry).parameters.radius
      if (Math.abs(previousRadius - radius) > 1e-4) {
        mesh.geometry.dispose()
        mesh.geometry = new THREE.SphereGeometry(radius, RENDER.sphereSegments, RENDER.sphereSegments)
      }
    }
    mesh.position.set(atom.x, atom.y, atom.z)
    syncMaterialColor(profile, mesh.material, color)
    this.selectionVisuals.syncHighlight(atom.id, atom.x, atom.y, atom.z, radius, selected)
    this.selectionVisuals.syncOutline(atom.id, atom.x, atom.y, atom.z, radius, profile.outline && displayMode !== 'wireframe')
  }
}
