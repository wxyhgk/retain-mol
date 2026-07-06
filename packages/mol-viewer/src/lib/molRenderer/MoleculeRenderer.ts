import * as THREE from 'three'
import type { Atom, Bond, Molecule } from '../molecule'
// aromaticBonds: bondId → ring centroid position
import type { DisplayMode } from '../types'
import type { ResolvedTheme } from '../../presets'
import { hexToInt } from '../../presets'
import { getElementConfig as getElement } from '../../config/elements.config'
import { RENDER, BOND_DRAG_HOVER } from '../../config/render.config'
import { ticker } from '../animation'
import { OUTLINE_OFFSET, sphereShades, makeSphereMat, makeCylinderMat } from './publicationMaterials'
import { getSideBondPerp } from './bondGeometry'

/**
 * 管理原子、键、高光 mesh 的生命周期与更新。
 * 不持有 scene/camera，只操作注入的 modelGroup。
 */
export class MoleculeRenderer {
  readonly atomMeshes = new Map<string, THREE.Mesh>()
  readonly bondMeshes = new Map<string, THREE.Group>()
  private highlightMeshes = new Map<string, THREE.Mesh>()
  private outlineMeshes = new Map<string, THREE.Mesh>()
  /** 出版渲染开关（由 render 的 publication 参数驱动，替代早期硬编码常量） */
  private _pub = false
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
    publication = false,
  ) {
    // 渲染风格切换：mesh 的复用 key 不含风格，必须清空强制用新材质重建
    if (this._pub !== publication) this._clearAllMeshes()
    this._pub = publication
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
    for (const [id, mesh] of this.outlineMeshes) {
      if (!existingAtomIds.has(id)) {
        this.modelGroup.remove(mesh)
        mesh.geometry.dispose()
        this.outlineMeshes.delete(id)
      }
    }

    const atomById = new Map(molecule.atoms.map(a => [a.id, a]))
    for (const atom of molecule.atoms) {
      this.renderAtom(atom, displayMode, selectedAtoms.has(atom.id))
    }
    if (displayMode !== 'spacefill' && displayMode !== 'mtube') {
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
    } else if (displayMode === 'tube') {
      radius = r.bondRadiusStick * RENDER.tubeRadiusMultiplier   // 圆头球 = 管半径，连成连续圆管
    } else if (displayMode === 'mtube') {
      radius = el.covalentRadius * r.ballScale * RENDER.mtubeScale   // 团簇大球（基于共价半径），只画球不画键
    } else if (displayMode === 'stick' || displayMode === 'wireframe') {
      radius = r.bondRadiusStick * RENDER.stickAtomMultiplier
    } else {
      radius = el.covalentRadius * r.ballScale
    }

    let mesh = this.atomMeshes.get(atom.id)
    if (!mesh) {
      const geo = new THREE.SphereGeometry(radius, RENDER.sphereSegments, RENDER.sphereSegments)
      const mat: THREE.Material = this._pub && displayMode !== 'wireframe'
        ? makeSphereMat(color)
        : new THREE.MeshPhongMaterial({ color, shininess: RENDER.atomShininess, specular: RENDER.atomSpecular })
      if (displayMode === 'wireframe') (mat as THREE.MeshPhongMaterial).wireframe = true
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
    const amat = mesh.material as THREE.ShaderMaterial & { color?: THREE.Color }
    if (amat.isShaderMaterial && amat.uniforms?.uHi) {
      const s = sphereShades(color)
      amat.uniforms.uHi.value = s.hi; amat.uniforms.uBase.value = s.base; amat.uniforms.uLo.value = s.lo
    } else if (amat.color) {
      amat.color.setHex(color)
    }

    if (selected) this.addHighlight(atom.id, atom.x, atom.y, atom.z, radius + RENDER.selectionHaloOffset)
    else this.removeHighlight(atom.id)

    if (this._pub && displayMode !== 'wireframe') this.addOutline(atom.id, atom.x, atom.y, atom.z, radius)
    else this.removeOutline(atom.id)
  }

  /** inverted-hull 黑描边：放大的黑色 BackSide 球，正面被原子挡住、边缘露出黑边 */
  private addOutline(atomId: string, x: number, y: number, z: number, radius: number) {
    const rr = radius + Math.max(OUTLINE_OFFSET, radius * 0.14)
    const oc = this._outlineColor()
    let o = this.outlineMeshes.get(atomId)
    if (!o) {
      const geo = new THREE.SphereGeometry(rr, RENDER.sphereSegments, RENDER.sphereSegments)
      const mat = new THREE.MeshBasicMaterial({ color: oc, side: THREE.BackSide })
      o = new THREE.Mesh(geo, mat)
      o.renderOrder = -1
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

  /** 描边色随背景亮度自适应：亮底黑描边、暗底白描边 */
  private _outlineColor(): number {
    const bg = new THREE.Color(hexToInt(this.getTheme().scene.backgroundColor))
    const lum = 0.299 * bg.r + 0.587 * bg.g + 0.114 * bg.b
    return lum > 0.5 ? 0x000000 : 0xffffff
  }

  private removeOutline(atomId: string) {
    const o = this.outlineMeshes.get(atomId)
    if (o) {
      this.modelGroup.remove(o)
      o.geometry.dispose()
      this.outlineMeshes.delete(atomId)
    }
  }

  /** 清空所有原子/键/描边 mesh（渲染风格切换时强制用新材质重建） */
  private _clearAllMeshes() {
    for (const m of this.atomMeshes.values()) { this.modelGroup.remove(m); m.geometry.dispose(); (m.material as THREE.Material).dispose() }
    for (const g of this.bondMeshes.values()) { this.modelGroup.remove(g); disposeGroup(g) }
    for (const o of this.outlineMeshes.values()) { this.modelGroup.remove(o); o.geometry.dispose(); (o.material as THREE.Material).dispose() }
    this.atomMeshes.clear()
    this.bondMeshes.clear()
    this.bondShapeKeys.clear()
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
    const shapeKey = `${bond.order}:${selected ? 1 : 0}:${aromaticCentroid ? 1 : 0}:${_displayMode}`
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
    // 键两端元素半分色：靠 a1 端半用 a1 元素色、靠 a2 端半用 a2 元素色；
    // 选中态整根用高亮色（两半同色），不半分。
    const colorA1 = selected ? RENDER.bondSelectedColor : this.elementColor(a1.symbol)
    const colorA2 = selected ? RENDER.bondSelectedColor : this.elementColor(a2.symbol)
    const stickR = _displayMode === 'tube'
      ? theme.render.bondRadiusStick * RENDER.tubeRadiusMultiplier
      : theme.render.bondRadiusStick
    // 双/三键用邻居叉积确定偏移方向（在分子平面内），与 3Dmol.js 方法一致
    const perpX = getSideBondPerp(a1, a2, dirHat, atomById, allBonds)
    // 双/三键圆柱半径缩小，视觉上更清晰
    const doubleR = stickR * 0.65
    const tripleR = stickR * 0.55

    if (grp) {
      // 每条键线现在是 2 个 child（a1 半 + a2 半）；芳香键前 2 个是实心主圆柱两半，其余是单色虚线段。
      const half = len / 2
      let idx = 0
      grp.children.forEach(child => {
        const cyl = child as THREE.Mesh
        if (!cyl.isMesh) return
        const isAromaticDash = aromaticCentroid ? idx >= 2 : false
        if (isAromaticDash) {
          const dashIdx = idx - 2
          const dashLen = RENDER.aromaticDashSize
          const gapLen = RENDER.aromaticGapSize
          const step = dashLen + gapLen
          const t = gapLen / 2 + dashIdx * step
          const toCenter = new THREE.Vector3().subVectors(aromaticCentroid!, mid)
          toCenter.addScaledVector(dirHat, -toCenter.dot(dirHat))
          if (toCenter.lengthSq() < 1e-6) toCenter.copy(new THREE.Vector3(1, 0, 0))
          else toCenter.normalize()
          cyl.position.copy(start).addScaledVector(dirHat, t + dashLen / 2).add(toCenter.multiplyScalar(gap / 2))
          cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirHat)
        } else {
          // idx 偶=a1 半、奇=a2 半；line = 第几条并列键线
          const isA2 = idx % 2 === 1
          const line = aromaticCentroid ? 0 : Math.floor(idx / 2)
          const offsets = _displayMode === 'tube' || bond.order === 1 || aromaticCentroid ? [0] : bond.order === 2 ? [-gap / 2, gap / 2] : [-gap, 0, gap]
          const offset = offsets[Math.min(line, offsets.length - 1)]
          const height = (cyl.geometry as THREE.CylinderGeometry).parameters.height || half
          cyl.scale.y = half / height
          cyl.position.copy(start).addScaledVector(dirHat, isA2 ? half * 1.5 : half * 0.5)
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
      // ── 芳香键：实心圆柱（半分色两段）+ 朝向环心的虚线小圆柱段（单色） ──────
      this.addHalfBond(grp, start, dirHat, len, stickR, colorA1, colorA2, bond.id)

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
      // ── 普通键：按 order 渲染并排圆柱（tube 恒单粗管，忽略键级并列），每根半分色 ──
      const offsets = _displayMode === 'tube' || bond.order === 1 ? [0] : bond.order === 2 ? [-gap / 2, gap / 2] : [-gap, 0, gap]
      for (const offset of offsets) {
        const r = _displayMode === 'tube' ? stickR : bond.order === 2 ? doubleR : bond.order === 3 ? tripleR : stickR
        const off = offset !== 0 ? perpX.clone().multiplyScalar(offset) : undefined
        this.addHalfBond(grp, start, dirHat, len, r, colorA1, colorA2, bond.id, off)
      }
    }

    this.modelGroup.add(grp)
    this.bondMeshes.set(bond.id, grp)
    this.bondShapeKeys.set(bond.id, shapeKey)
  }

  /**
   * 向 grp 追加一条半分色键线：两段各 len/2 的圆柱，靠 a1 端用 colorA1、靠 a2 端用 colorA2。
   * 两段沿 dirHat 首尾相接拼成整键。可选 perpOffset 施加到两段中心（双/三键并列偏移）。
   * child 顺序固定为 [a1 半, a2 半]，供复用路径按 idx 奇偶定位。
   */
  private addHalfBond(
    grp: THREE.Group, start: THREE.Vector3, dirHat: THREE.Vector3, len: number,
    radius: number, colorA1: number, colorA2: number, bondId: string,
    perpOffset?: THREE.Vector3,
  ) {
    const half = len / 2
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirHat)
    const centerA1 = start.clone().addScaledVector(dirHat, half * 0.5)
    const centerA2 = start.clone().addScaledVector(dirHat, half * 1.5)
    if (perpOffset) { centerA1.add(perpOffset); centerA2.add(perpOffset) }
    for (const [center, color] of [[centerA1, colorA1], [centerA2, colorA2]] as const) {
      const cyl = this.makeCylinder(radius, half, color, bondId)
      cyl.position.copy(center)
      cyl.quaternion.copy(q)
      grp.add(cyl)
    }
  }

  private makeCylinder(radius: number, length: number, color: number, bondId: string): THREE.Mesh {
    const geo = new THREE.CylinderGeometry(radius, radius, length, RENDER.cylinderSegments)
    const mat: THREE.Material = this._pub
      ? makeCylinderMat(color)
      : new THREE.MeshPhongMaterial({ color, shininess: RENDER.bondShininess })
    const cyl = new THREE.Mesh(geo, mat)
    cyl.userData = { type: 'bond', id: bondId }
    if (this._pub) {
      // inverted-hull 描边：径向放大的黑色 BackSide 圆柱（长度不放大，避免端帽超出）
      const s = (radius + Math.max(0.03, radius * 0.35)) / radius
      const outline = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: this._outlineColor(), side: THREE.BackSide }))
      outline.scale.set(s, 1, s)
      outline.renderOrder = -1
      cyl.add(outline)
    }
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

function disposeGroup(group: THREE.Group) {
  group.traverse(obj => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.geometry?.dispose()
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    materials.forEach(m => m?.dispose())
  })
}
