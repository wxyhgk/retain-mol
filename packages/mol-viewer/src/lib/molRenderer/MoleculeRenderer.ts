import * as THREE from 'three'
import type { Atom, Bond, Molecule } from '../molecule'
import type { DisplayMode } from '@/lib/types'
import type { ResolvedTheme } from '@/presets'
import { hexToInt } from '@/presets'
import { getElementConfig as getElement } from '@/config/elements.config'
import { RENDER } from '@/config/render.config'

/**
 * 管理原子、键、高光 mesh 的生命周期与更新。
 * 不持有 scene/camera，只操作注入的 modelGroup。
 */
export class MoleculeRenderer {
  readonly atomMeshes = new Map<string, THREE.Mesh>()
  readonly bondMeshes = new Map<string, THREE.Group>()
  private highlightMeshes = new Map<string, THREE.Mesh>()

  constructor(
    private modelGroup: THREE.Group,
    private getTheme: () => ResolvedTheme,
  ) {}

  private elementColor(symbol: string): number {
    const theme = this.getTheme()
    const hex = theme.elements[symbol]?.color ?? theme.fallbackColor
    return hexToInt(hex)
  }

  render(
    molecule: Molecule,
    displayMode: DisplayMode,
    selectedAtoms: Set<string>,
    selectedBonds: Set<string>,
  ) {
    const existingAtomIds = new Set(molecule.atoms.map(a => a.id))
    const existingBondIds = new Set(molecule.bonds.map(b => b.id))

    for (const [id, mesh] of this.atomMeshes) {
      if (!existingAtomIds.has(id)) {
        this.modelGroup.remove(mesh)
        mesh.geometry.dispose()
        this.atomMeshes.delete(id)
      }
    }
    for (const [id, grp] of this.bondMeshes) {
      if (!existingBondIds.has(id)) {
        this.modelGroup.remove(grp)
        this.bondMeshes.delete(id)
      }
    }
    for (const [id, mesh] of this.highlightMeshes) {
      if (!existingAtomIds.has(id)) {
        this.modelGroup.remove(mesh)
        mesh.geometry.dispose()
        this.highlightMeshes.delete(id)
      }
    }

    const atomById = new Map(molecule.atoms.map(a => [a.id, a]))
    for (const atom of molecule.atoms) {
      this.renderAtom(atom, displayMode, selectedAtoms.has(atom.id))
    }
    if (displayMode !== 'spacefill') {
      for (const bond of molecule.bonds) {
        const a1 = atomById.get(bond.atomId1)
        const a2 = atomById.get(bond.atomId2)
        if (a1 && a2) this.renderBond(bond, a1, a2, displayMode, selectedBonds.has(bond.id))
      }
    }
  }

  private renderAtom(atom: Atom, displayMode: DisplayMode, selected: boolean) {
    const el = getElement(atom.symbol)
    const r = this.getTheme().render
    const color = this.elementColor(atom.symbol)
    let radius: number
    if (displayMode === 'spacefill') {
      radius = el.cpkRadius * r.spacefillScale
    } else if (displayMode === 'stick' || displayMode === 'wireframe') {
      radius = r.bondRadiusStick * RENDER.stickAtomMultiplier
    } else {
      radius = el.covalentRadius * r.ballScale
    }

    let mesh = this.atomMeshes.get(atom.id)
    if (!mesh) {
      const geo = new THREE.SphereGeometry(radius, RENDER.sphereSegments, RENDER.sphereSegments)
      const mat = new THREE.MeshPhongMaterial({ color, shininess: RENDER.atomShininess, specular: RENDER.atomSpecular })
      if (displayMode === 'wireframe') mat.wireframe = true
      mesh = new THREE.Mesh(geo, mat)
      mesh.userData = { type: 'atom', id: atom.id }
      mesh.castShadow = true
      this.modelGroup.add(mesh)
      this.atomMeshes.set(atom.id, mesh)
    } else {
      const prev = (mesh.geometry as THREE.SphereGeometry).parameters.radius
      if (Math.abs(prev - radius) > 1e-4) {
        mesh.geometry.dispose()
        mesh.geometry = new THREE.SphereGeometry(radius, RENDER.sphereSegments, RENDER.sphereSegments)
      }
    }
    mesh.position.set(atom.x, atom.y, atom.z)
    ;(mesh.material as THREE.MeshPhongMaterial).color.setHex(color)

    if (selected) this.addHighlight(atom.id, atom.x, atom.y, atom.z, radius + RENDER.selectionHaloOffset)
    else this.removeHighlight(atom.id)
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
      hl.renderOrder = 1
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
      this.highlightMeshes.delete(atomId)
    }
  }

  private renderBond(bond: Bond, a1: Atom, a2: Atom, _displayMode: DisplayMode, selected: boolean) {
    let grp = this.bondMeshes.get(bond.id)
    if (grp) this.modelGroup.remove(grp)

    grp = new THREE.Group()
    grp.userData = { type: 'bond', id: bond.id }

    const start = new THREE.Vector3(a1.x, a1.y, a1.z)
    const end = new THREE.Vector3(a2.x, a2.y, a2.z)
    const dir = new THREE.Vector3().subVectors(end, start)
    const length = dir.length()
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)

    const theme = this.getTheme()
    const gap = theme.render.bondGap
    const offsets = bond.order === 1 ? [0] : bond.order === 2 ? [-gap / 2, gap / 2] : [-gap, 0, gap]
    const perpX = new THREE.Vector3()
    const up = new THREE.Vector3(0, 1, 0)
    perpX.crossVectors(dir.clone().normalize(), up).normalize()
    if (perpX.lengthSq() < 0.01) perpX.set(1, 0, 0)

    const color = selected ? RENDER.bondSelectedColor : RENDER.bondDefaultColor

    for (const offset of offsets) {
      const stickR = theme.render.bondRadiusStick
      const geo = new THREE.CylinderGeometry(stickR, stickR, length, RENDER.cylinderSegments)
      const mat = new THREE.MeshPhongMaterial({ color, shininess: RENDER.bondShininess })
      const cyl = new THREE.Mesh(geo, mat)
      cyl.userData = { type: 'bond', id: bond.id }
      cyl.position.copy(mid)
      if (offset !== 0) cyl.position.addScaledVector(perpX, offset)
      cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
      grp.add(cyl)
    }

    this.modelGroup.add(grp)
    this.bondMeshes.set(bond.id, grp)
  }

  dispose() {
    for (const [, mesh] of this.atomMeshes) {
      this.modelGroup.remove(mesh)
      mesh.geometry.dispose()
    }
    for (const [, grp] of this.bondMeshes) this.modelGroup.remove(grp)
    for (const [, mesh] of this.highlightMeshes) {
      this.modelGroup.remove(mesh)
      mesh.geometry.dispose()
    }
    this.atomMeshes.clear()
    this.bondMeshes.clear()
    this.highlightMeshes.clear()
  }
}
