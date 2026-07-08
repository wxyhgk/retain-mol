import * as THREE from 'three'
import type { ResolvedTheme } from '../../presets'
import { hexToInt } from '../../presets'
import { BOND_DRAG_HOVER, RENDER, RENDER_ORDER } from '../../config/render.config'
import { OUTLINE_OFFSET } from './publicationMaterials'
import { outlineColor } from './moleculeStylePrimitives'
import { ticker } from '../animation'

export class MoleculeSelectionVisuals {
  private highlightMeshes = new Map<string, THREE.Mesh>()
  private outlineMeshes = new Map<string, THREE.Mesh>()
  private dragHoverMesh: THREE.Mesh | null = null
  private dragHoverId: string | null = null

  constructor(
    private modelGroup: THREE.Group,
    private getTheme: () => ResolvedTheme,
  ) {}

  syncHighlight(atomId: string, x: number, y: number, z: number, radius: number, selected: boolean) {
    if (selected) this.addHighlight(atomId, x, y, z, radius + RENDER.selectionHaloOffset)
    else this.removeHighlight(atomId)
  }

  syncOutline(atomId: string, x: number, y: number, z: number, radius: number, enabled: boolean) {
    if (enabled) this.addOutline(atomId, x, y, z, radius)
    else this.removeOutline(atomId)
  }

  removeMissing(existingAtomIds: ReadonlySet<string>) {
    for (const [id, mesh] of this.highlightMeshes) {
      if (!existingAtomIds.has(id)) {
        this.modelGroup.remove(mesh)
        mesh.geometry.dispose()
        ;(mesh.material as THREE.Material).dispose()
        this.highlightMeshes.delete(id)
      }
    }
    for (const [id, mesh] of this.outlineMeshes) {
      if (!existingAtomIds.has(id)) {
        this.modelGroup.remove(mesh)
        mesh.geometry.dispose()
        ;(mesh.material as THREE.Material).dispose()
        this.outlineMeshes.delete(id)
      }
    }
  }

  clearStyleDependentMeshes() {
    for (const o of this.outlineMeshes.values()) {
      this.modelGroup.remove(o)
      o.geometry.dispose()
      ;(o.material as THREE.Material).dispose()
    }
    this.outlineMeshes.clear()
  }

  setDragHover(atomId: string, atomMesh: THREE.Mesh | undefined) {
    if (this.dragHoverId === atomId) return
    this.clearDragHover(false)
    if (!atomMesh) return
    const r = (atomMesh.geometry as THREE.SphereGeometry).parameters?.radius ?? 0.4
    const geo = new THREE.SphereGeometry(r + BOND_DRAG_HOVER.haloOffset, RENDER.sphereSegments, RENDER.sphereSegments)
    const mat = new THREE.MeshBasicMaterial({
      color: BOND_DRAG_HOVER.color,
      transparent: true,
      opacity: BOND_DRAG_HOVER.opacity,
      side: THREE.BackSide,
      depthWrite: false,
    })
    this.dragHoverMesh = new THREE.Mesh(geo, mat)
    this.dragHoverMesh.position.copy(atomMesh.position)
    this.modelGroup.add(this.dragHoverMesh)
    this.dragHoverId = atomId
    ticker.invalidate()
  }

  clearDragHover(invalidate = true) {
    if (this.dragHoverMesh) {
      this.modelGroup.remove(this.dragHoverMesh)
      this.dragHoverMesh.geometry.dispose()
      ;(this.dragHoverMesh.material as THREE.Material).dispose()
      this.dragHoverMesh = null
    }
    this.dragHoverId = null
    if (invalidate) ticker.invalidate()
  }

  dispose() {
    for (const [, mesh] of this.highlightMeshes) {
      this.modelGroup.remove(mesh)
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
    }
    for (const [, mesh] of this.outlineMeshes) {
      this.modelGroup.remove(mesh)
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
    }
    this.clearDragHover(false)
    this.highlightMeshes.clear()
    this.outlineMeshes.clear()
  }

  private addHighlight(atomId: string, x: number, y: number, z: number, radius: number) {
    const theme = this.getTheme()
    let hl = this.highlightMeshes.get(atomId)
    if (!hl) {
      const geo = new THREE.SphereGeometry(radius, RENDER.sphereSegments, RENDER.sphereSegments)
      const mat = new THREE.MeshBasicMaterial({
        color: hexToInt(theme.scene.highlightColor),
        transparent: true,
        opacity: theme.scene.highlightOpacity,
        side: THREE.BackSide,
      })
      hl = new THREE.Mesh(geo, mat)
      hl.renderOrder = RENDER_ORDER.highlight
      this.modelGroup.add(hl)
      this.highlightMeshes.set(atomId, hl)
    } else {
      const prev = (hl.geometry as THREE.SphereGeometry).parameters.radius
      if (Math.abs(prev - radius) > 1e-4) {
        hl.geometry.dispose()
        hl.geometry = new THREE.SphereGeometry(radius, RENDER.sphereSegments, RENDER.sphereSegments)
      }
    }
    hl.position.set(x, y, z)
  }

  private removeHighlight(atomId: string) {
    const hl = this.highlightMeshes.get(atomId)
    if (hl) {
      this.modelGroup.remove(hl)
      hl.geometry.dispose()
      ;(hl.material as THREE.Material).dispose()
      this.highlightMeshes.delete(atomId)
    }
  }

  private addOutline(atomId: string, x: number, y: number, z: number, radius: number) {
    const rr = radius + Math.max(OUTLINE_OFFSET, radius * RENDER.outlineRadialFactor)
    const oc = outlineColor(this.getTheme())
    let o = this.outlineMeshes.get(atomId)
    if (!o) {
      const geo = new THREE.SphereGeometry(rr, RENDER.sphereSegments, RENDER.sphereSegments)
      const mat = new THREE.MeshBasicMaterial({ color: oc, side: THREE.BackSide })
      o = new THREE.Mesh(geo, mat)
      o.renderOrder = RENDER_ORDER.outline
      this.modelGroup.add(o)
      this.outlineMeshes.set(atomId, o)
    } else {
      const prev = (o.geometry as THREE.SphereGeometry).parameters.radius
      if (Math.abs(prev - rr) > 1e-4) {
        o.geometry.dispose()
        o.geometry = new THREE.SphereGeometry(rr, RENDER.sphereSegments, RENDER.sphereSegments)
      }
    }
    ;(o.material as THREE.MeshBasicMaterial).color.setHex(oc)
    o.position.set(x, y, z)
  }

  private removeOutline(atomId: string) {
    const o = this.outlineMeshes.get(atomId)
    if (o) {
      this.modelGroup.remove(o)
      o.geometry.dispose()
      ;(o.material as THREE.Material).dispose()
      this.outlineMeshes.delete(atomId)
    }
  }
}
