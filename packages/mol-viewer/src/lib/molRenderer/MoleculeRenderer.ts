import * as THREE from 'three'
import type { Atom, Bond, Molecule } from '../molecule'
// aromaticBonds: bondId → ring centroid position
import type { DisplayMode } from '../types'
import type { ResolvedTheme } from '../../presets'
import { hexToInt } from '../../presets'
import { getElementConfig as getElement } from '../../config/elements.config'
import { RENDER } from '../../config/render.config'

/**
 * 管理原子、键、高光 mesh 的生命周期与更新。
 * 不持有 scene/camera，只操作注入的 modelGroup。
 */
export class MoleculeRenderer {
  readonly atomMeshes = new Map<string, THREE.Mesh>()
  readonly bondMeshes = new Map<string, THREE.Group>()
  private highlightMeshes = new Map<string, THREE.Mesh>()
  private bondShapeKeys = new Map<string, string>()

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
    aromaticBonds: Map<string, THREE.Vector3> = new Map(),
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
        disposeGroup(grp)
        this.bondMeshes.delete(id)
        this.bondShapeKeys.delete(id)
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
        if (a1 && a2) this.renderBond(bond, a1, a2, displayMode, selectedBonds.has(bond.id), aromaticBonds.get(bond.id))
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

  private renderBond(bond: Bond, a1: Atom, a2: Atom, _displayMode: DisplayMode, selected: boolean, aromaticCentroid?: THREE.Vector3) {
    let grp = this.bondMeshes.get(bond.id)
    const shapeKey = `${bond.order}:${selected ? 1 : 0}:${aromaticCentroid ? 1 : 0}`
    if (grp && this.bondShapeKeys.get(bond.id) !== shapeKey) {
      this.modelGroup.remove(grp)
      disposeGroup(grp)
      this.bondMeshes.delete(bond.id)
      this.bondShapeKeys.delete(bond.id)
      grp = undefined
    }

    const start  = new THREE.Vector3(a1.x, a1.y, a1.z)
    const end    = new THREE.Vector3(a2.x, a2.y, a2.z)
    const dir    = new THREE.Vector3().subVectors(end, start)
    const len    = dir.length()
    const mid    = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
    const dirHat = dir.clone().normalize()

    const theme  = this.getTheme()
    const gap    = theme.render.bondGap
    const color  = selected ? RENDER.bondSelectedColor : RENDER.bondDefaultColor
    const stickR = theme.render.bondRadiusStick

    if (grp) {
      let idx = 0
      grp.children.forEach(child => {
        const cyl = child as THREE.Mesh
        if (!cyl.isMesh) return
        if (aromaticCentroid && idx > 0) {
          const dashLen = RENDER.aromaticDashSize
          const gapLen = RENDER.aromaticGapSize
          const step = dashLen + gapLen
          const t = gapLen / 2 + (idx - 1) * step
          const toCenter = new THREE.Vector3().subVectors(aromaticCentroid, mid)
          toCenter.addScaledVector(dirHat, -toCenter.dot(dirHat))
          if (toCenter.lengthSq() < 1e-6) toCenter.copy(new THREE.Vector3(1, 0, 0))
          else toCenter.normalize()
          cyl.position.copy(start).addScaledVector(dirHat, t + dashLen / 2).add(toCenter.multiplyScalar(gap / 2))
          cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirHat)
        } else {
          const offsets = bond.order === 1 || aromaticCentroid ? [0] : bond.order === 2 ? [-gap / 2, gap / 2] : [-gap, 0, gap]
          const offset = offsets[Math.min(idx, offsets.length - 1)]
          const height = (cyl.geometry as THREE.CylinderGeometry).parameters.height || len
          cyl.scale.y = len / height
          cyl.position.copy(mid)
          if (offset !== 0) cyl.position.addScaledVector(getPerp(dirHat), offset)
          cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirHat)
        }
        idx++
      })
      return
    }

    grp = new THREE.Group()
    grp.userData = { type: 'bond', id: bond.id }

    // 通用 perpX（双键/三键用）
    const perpX = getPerp(dirHat)

    if (aromaticCentroid) {
      // ── 芳香键：实心圆柱 + 朝向环心的虚线小圆柱段 ────────────────────────
      const cyl = this.makeCylinder(stickR, len, color, bond.id)
      cyl.position.copy(mid)
      cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirHat)
      grp.add(cyl)

      // 偏移方向：键中点 → 环心，投影掉沿键分量，归一化
      const toCenter = new THREE.Vector3().subVectors(aromaticCentroid, mid)
      toCenter.addScaledVector(dirHat, -toCenter.dot(dirHat))  // 去除沿键分量
      if (toCenter.lengthSq() < 1e-6) toCenter.copy(perpX)
      else toCenter.normalize()

      const dashColor  = selected ? RENDER.bondSelectedColor : RENDER.aromaticDashColor
      const dashR      = stickR * 0.55
      const dashLen    = RENDER.aromaticDashSize
      const gapLen     = RENDER.aromaticGapSize
      const step       = dashLen + gapLen
      const dashOffset = toCenter.clone().multiplyScalar(gap / 2)

      let t = gapLen / 2
      while (t + dashLen <= len) {
        const segMid = start.clone()
          .addScaledVector(dirHat, t + dashLen / 2)
          .add(dashOffset)
        const segCyl = this.makeCylinder(dashR, dashLen, dashColor, bond.id)
        segCyl.position.copy(segMid)
        segCyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirHat)
        grp.add(segCyl)
        t += step
      }
    } else {
      // ── 普通键：按 order 渲染并排圆柱 ──────────────────────────────────────
      const offsets = bond.order === 1 ? [0] : bond.order === 2 ? [-gap / 2, gap / 2] : [-gap, 0, gap]
      for (const offset of offsets) {
        const cyl = this.makeCylinder(stickR, len, color, bond.id)
        cyl.position.copy(mid)
        if (offset !== 0) cyl.position.addScaledVector(perpX, offset)
        cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirHat)
        grp.add(cyl)
      }
    }

    this.modelGroup.add(grp)
    this.bondMeshes.set(bond.id, grp)
    this.bondShapeKeys.set(bond.id, shapeKey)
  }

  private makeCylinder(radius: number, length: number, color: number, bondId: string): THREE.Mesh {
    const geo = new THREE.CylinderGeometry(radius, radius, length, RENDER.cylinderSegments)
    const mat = new THREE.MeshPhongMaterial({ color, shininess: RENDER.bondShininess })
    const cyl = new THREE.Mesh(geo, mat)
    cyl.userData = { type: 'bond', id: bondId }
    return cyl
  }

  dispose() {
    for (const [, mesh] of this.atomMeshes) {
      this.modelGroup.remove(mesh)
      mesh.geometry.dispose()
    }
    for (const [, grp] of this.bondMeshes) {
      this.modelGroup.remove(grp)
      disposeGroup(grp)
    }
    for (const [, mesh] of this.highlightMeshes) {
      this.modelGroup.remove(mesh)
      mesh.geometry.dispose()
    }
    this.atomMeshes.clear()
    this.bondMeshes.clear()
    this.bondShapeKeys.clear()
    this.highlightMeshes.clear()
  }
}

function getPerp(dirHat: THREE.Vector3): THREE.Vector3 {
  const perp = new THREE.Vector3()
  perp.crossVectors(dirHat, new THREE.Vector3(0, 1, 0)).normalize()
  if (perp.lengthSq() < 0.01) perp.set(1, 0, 0)
  return perp
}

function disposeGroup(group: THREE.Group) {
  group.traverse(obj => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.geometry?.dispose()
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    materials.forEach(m => m?.dispose())
  })
}
