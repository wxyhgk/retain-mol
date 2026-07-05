import * as THREE from 'three'
import type { Atom, Bond, Molecule } from '../molecule'
// aromaticBonds: bondId → ring centroid position
import type { DisplayMode } from '../types'
import type { ResolvedTheme } from '../../presets'
import { hexToInt } from '../../presets'
import { getElementConfig as getElement } from '../../config/elements.config'
import { RENDER, BOND_DRAG_HOVER } from '../../config/render.config'
import { ticker } from '../animation'

/**
 * 管理原子、键、高光 mesh 的生命周期与更新。
 * 不持有 scene/camera，只操作注入的 modelGroup。
 */
export class MoleculeRenderer {
  readonly atomMeshes = new Map<string, THREE.Mesh>()
  readonly bondMeshes = new Map<string, THREE.Group>()
  private highlightMeshes = new Map<string, THREE.Mesh>()
  private bondShapeKeys = new Map<string, string>()
  private _dragHoverMesh: THREE.Mesh | null = null
  private _dragHoverId: string | null = null

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
        if (a1 && a2) this.renderBond(bond, a1, a2, displayMode, selectedBonds.has(bond.id), aromaticBonds.get(bond.id), atomById, molecule.bonds)
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

  private renderBond(
    bond: Bond, a1: Atom, a2: Atom, _displayMode: DisplayMode, selected: boolean,
    aromaticCentroid?: THREE.Vector3,
    atomById?: Map<string, Atom>, allBonds?: readonly Bond[],
  ) {
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
    // 双/三键用邻居叉积确定偏移方向（在分子平面内），与 3Dmol.js 方法一致
    const perpX = getSideBondPerp(a1, a2, dirHat, atomById, allBonds)
    // 双/三键圆柱半径缩小，视觉上更清晰
    const doubleR = stickR * 0.65
    const tripleR = stickR * 0.55

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
          if (offset !== 0) cyl.position.addScaledVector(perpX, offset)
          cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirHat)
        }
        idx++
      })
      return
    }

    grp = new THREE.Group()
    grp.userData = { type: 'bond', id: bond.id }

    if (aromaticCentroid) {
      // ── 芳香键：实心圆柱 + 朝向环心的虚线小圆柱段 ────────────────────────
      const cyl = this.makeCylinder(stickR, len, color, bond.id)
      cyl.position.copy(mid)
      cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirHat)
      grp.add(cyl)

      const toCenter = new THREE.Vector3().subVectors(aromaticCentroid, mid)
      toCenter.addScaledVector(dirHat, -toCenter.dot(dirHat))
      if (toCenter.lengthSq() < 1e-6) toCenter.copy(perpX)
      else toCenter.normalize()

      const dashColor  = selected ? RENDER.bondSelectedColor : RENDER.aromaticDashColor
      const dashR      = stickR * RENDER.aromaticDashRadiusFactor
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
        const r = bond.order === 2 ? doubleR : bond.order === 3 ? tripleR : stickR
        const cyl = this.makeCylinder(r, len, color, bond.id)
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

  /** 在指定原子上显示 bond-drag 悬停光晕 */
  setDragHover(atomId: string) {
    if (this._dragHoverId === atomId) return
    this._clearDragHover()
    const mesh = this.atomMeshes.get(atomId)
    if (!mesh) return
    const r = (mesh.geometry as THREE.SphereGeometry).parameters?.radius ?? 0.4
    const geo = new THREE.SphereGeometry(r + BOND_DRAG_HOVER.haloOffset, RENDER.sphereSegments, RENDER.sphereSegments)
    const mat = new THREE.MeshBasicMaterial({
      color: BOND_DRAG_HOVER.color,
      transparent: true,
      opacity: BOND_DRAG_HOVER.opacity,
      side: THREE.BackSide,
      depthWrite: false,
    })
    this._dragHoverMesh = new THREE.Mesh(geo, mat)
    this._dragHoverMesh.position.copy(mesh.position)
    this.modelGroup.add(this._dragHoverMesh)
    this._dragHoverId = atomId
    ticker.invalidate()
  }

  clearDragHover() {
    this._clearDragHover()
    ticker.invalidate()
  }

  private _clearDragHover() {
    if (this._dragHoverMesh) {
      this.modelGroup.remove(this._dragHoverMesh)
      this._dragHoverMesh.geometry.dispose()
      ;(this._dragHoverMesh.material as THREE.Material).dispose()
      this._dragHoverMesh = null
    }
    this._dragHoverId = null
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
    this._clearDragHover()
    this.atomMeshes.clear()
    this.bondMeshes.clear()
    this.bondShapeKeys.clear()
    this.highlightMeshes.clear()
  }
}

/**
 * 3Dmol.js 方式：用邻居原子确定双/三键偏移方向，使双键在分子平面内展开。
 * 算法：找 a1（或 a2）最不共线的邻居，计算 (neighbor_dir × bond_dir) × bond_dir，
 * 即邻居方向在键法线平面内的分量 → 偏移方向在分子平面内，化学上正确。
 */
function getSideBondPerp(
  a1: Atom, a2: Atom, dirHat: THREE.Vector3,
  atomById?: Map<string, Atom>, allBonds?: readonly Bond[],
): THREE.Vector3 {
  const p1 = new THREE.Vector3(a1.x, a1.y, a1.z)
  const p2 = new THREE.Vector3(a2.x, a2.y, a2.z)
  let bestV = new THREE.Vector3()
  let bestLen = 0

  if (atomById && allBonds) {
    // 优先用 a1 的邻居
    for (const bond of allBonds) {
      let nid: string | null = null
      if (bond.atomId1 === a1.id && bond.atomId2 !== a2.id) nid = bond.atomId2
      else if (bond.atomId2 === a1.id && bond.atomId1 !== a2.id) nid = bond.atomId1
      if (!nid) continue
      const nb = atomById.get(nid)
      if (!nb) continue
      const d = new THREE.Vector3(nb.x - p1.x, nb.y - p1.y, nb.z - p1.z)
      const v = d.clone().cross(dirHat)
      const l = v.lengthSq()
      if (l > bestLen) { bestLen = l; bestV = v.clone() }
    }
    // a1 无其他邻居，改用 a2 的邻居
    if (bestLen < 0.001) {
      for (const bond of allBonds) {
        let nid: string | null = null
        if (bond.atomId1 === a2.id && bond.atomId2 !== a1.id) nid = bond.atomId2
        else if (bond.atomId2 === a2.id && bond.atomId1 !== a1.id) nid = bond.atomId1
        if (!nid) continue
        const nb = atomById.get(nid)
        if (!nb) continue
        const d = new THREE.Vector3(nb.x - p2.x, nb.y - p2.y, nb.z - p2.z)
        const v = d.clone().cross(dirHat)
        const l = v.lengthSq()
        if (l > bestLen) { bestLen = l; bestV = v.clone() }
      }
    }
  }

  if (bestLen > 0.001) {
    // (neighbor × bond) × bond = 邻居方向在键垂直平面内的分量（在分子平面内）
    bestV.cross(dirHat)
  } else {
    // 孤立键（无邻居），回退到任意垂直方向
    bestV.crossVectors(dirHat, new THREE.Vector3(0, 1, 0))
    if (bestV.lengthSq() < 0.001) bestV.set(1, 0, 0)
  }

  bestV.normalize()
  // 固定符号：保证同一根键两端算出的方向一致
  if (Math.abs(bestV.x) > 0.001) { if (bestV.x < 0) bestV.negate() }
  else if (Math.abs(bestV.y) > 0.001) { if (bestV.y < 0) bestV.negate() }
  else if (bestV.z < 0) { bestV.negate() }
  return bestV
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
