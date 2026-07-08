import * as THREE from 'three'
import type { Atom, Bond, Molecule } from '../molecule'
// aromaticBonds: bondId → ring centroid position
import type { DisplayMode } from '../types'
import type { ResolvedTheme } from '../../presets'
import { resolveRenderProfile, type RenderStyle, type ResolvedRenderProfile } from '../../styles'
import { RENDER, RENDER_ORDER } from '../../config/render.config'
import { getSideBondPerp } from './bondGeometry'
import {
  applyMaterialVisualState,
  atomDisplayRadius,
  elementColor,
  makeAtomMaterial,
  makeBondMaterial,
  outlineColor,
  syncMaterialColor,
  visualBondElementColor,
} from './moleculeStylePrimitives'
import { MoleculeSelectionVisuals } from './moleculeSelectionVisuals'

interface ObjectVisualState {
  opacity?: number
}

/**
 * 管理原子、键、高光 mesh 的生命周期与更新。
 * 不持有 scene/camera，只操作注入的 modelGroup。
 */
export class MoleculeRenderer {
  readonly atomMeshes = new Map<string, THREE.Mesh>()
  readonly bondMeshes = new Map<string, THREE.Group>()
  private selectionVisuals: MoleculeSelectionVisuals
  /** 当前渲染风格。publication 使用描边插画材质；iboview 使用 glossy Phong，无描边。 */
  private _renderStyle: RenderStyle = 'realistic'
  private _profile: ResolvedRenderProfile = resolveRenderProfile('realistic')
  private bondShapeKeys = new Map<string, string>()

  constructor(
    private modelGroup: THREE.Group,
    private getTheme: () => ResolvedTheme,
  ) {
    this.selectionVisuals = new MoleculeSelectionVisuals(modelGroup, getTheme)
  }

  private elementColor(symbol: string): number {
    return elementColor(this.getTheme(), symbol)
  }

  private visualElementColor(symbol: string): number {
    return this.elementColor(symbol)
  }

  private visualBondElementColor(symbol: string): number {
    return visualBondElementColor(this.getTheme(), this._profile, symbol)
  }

  render(
    molecule: Molecule,
    displayMode: DisplayMode,
    selectedAtoms: Set<string>,
    selectedBonds: Set<string>,
    aromaticBonds: Map<string, THREE.Vector3> = new Map(),
    renderStyle: RenderStyle = 'realistic',
    visualState: ObjectVisualState = {},
  ) {
    // 渲染风格切换：mesh 的复用 key 不含风格，必须清空强制用新材质重建
    if (this._renderStyle !== renderStyle) this._clearAllMeshes()
    this._renderStyle = renderStyle
    this._profile = resolveRenderProfile(renderStyle)
    const existingAtomIds = new Set(molecule.atoms.map(a => a.id))
    const existingBondIds = new Set(molecule.bonds.map(b => b.id))

    for (const [id, mesh] of this.atomMeshes) {
      if (!existingAtomIds.has(id)) {
        this.modelGroup.remove(mesh)
        mesh.geometry.dispose()
        ;(mesh.material as THREE.Material).dispose()
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
    this.selectionVisuals.removeMissing(existingAtomIds)

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

    this.applyVisualState(visualState)
  }

  private renderAtom(atom: Atom, displayMode: DisplayMode, selected: boolean) {
    const color = this.visualElementColor(atom.symbol)
    const radius = this.atomDisplayRadius(atom.symbol, displayMode)

    let mesh = this.atomMeshes.get(atom.id)
    if (!mesh) {
      const geo = new THREE.SphereGeometry(radius, RENDER.sphereSegments, RENDER.sphereSegments)
      const mat = makeAtomMaterial(this._profile, color, displayMode)
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
    syncMaterialColor(this._profile, mesh.material, color)

    this.selectionVisuals.syncHighlight(atom.id, atom.x, atom.y, atom.z, radius, selected)
    this.selectionVisuals.syncOutline(atom.id, atom.x, atom.y, atom.z, radius, this._profile.outline && displayMode !== 'wireframe')
  }

  /** 清空所有原子/键/描边 mesh（渲染风格切换时强制用新材质重建） */
  private _clearAllMeshes() {
    for (const m of this.atomMeshes.values()) { this.modelGroup.remove(m); m.geometry.dispose(); (m.material as THREE.Material).dispose() }
    for (const g of this.bondMeshes.values()) { this.modelGroup.remove(g); disposeGroup(g) }
    this.selectionVisuals.clearStyleDependentMeshes()
    this.atomMeshes.clear()
    this.bondMeshes.clear()
    this.bondShapeKeys.clear()
  }

  private renderBond(
    bond: Bond, a1: Atom, a2: Atom, _displayMode: DisplayMode, selected: boolean,
    aromaticCentroid?: THREE.Vector3,
    atomById?: Map<string, Atom>, allBonds?: readonly Bond[],
  ) {
    const aromaticAsSingle = this._profile.aromaticBondStyle === 'single' && aromaticCentroid !== undefined
    if ((this._profile.aromaticBondStyle === 'kekule' || aromaticAsSingle) && aromaticCentroid !== undefined) {
      aromaticCentroid = undefined
    }
    let grp = this.bondMeshes.get(bond.id)
    const effectiveOrder = aromaticAsSingle ? 1 : bond.order
    const theme  = this.getTheme()
    const stickR = _displayMode === 'tube'
      ? theme.render.bondRadiusStick * RENDER.tubeRadiusMultiplier
      : theme.render.bondRadiusStick
    const lineSpecs = this.bondLineSpecs(effectiveOrder, stickR, theme.render.bondGap, _displayMode)
    const shapeKey = [
      effectiveOrder,
      selected ? 1 : 0,
      aromaticCentroid ? 1 : 0,
      _displayMode,
      this._profile.id,
      this._profile.bondGeometry,
      this._profile.bondOpenEnded ? 1 : 0,
      this._profile.bondTaper ?? 1,
      this._profile.bondStartOffsetFactor ?? 0,
      this._profile.multiBondRadiusScale ?? 0,
      this._profile.multiBondOffsetFactor ?? 0,
      stickR,
      theme.render.bondGap,
      this.atomDisplayRadius(a1.symbol, _displayMode),
      this.atomDisplayRadius(a2.symbol, _displayMode),
    ].join(':')
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

    const gap    = theme.render.bondGap
    // 键两端元素半分色：靠 a1 端半用 a1 元素色、靠 a2 端半用 a2 元素色；
    // 选中态整根用高亮色（两半同色），不半分。
    const colorA1 = selected ? RENDER.bondSelectedColor : this.visualBondElementColor(a1.symbol)
    const colorA2 = selected ? RENDER.bondSelectedColor : this.visualBondElementColor(a2.symbol)
    const singleColorBond = colorA1 === colorA2 && this._profile.bondColorPolicy === 'fixed'
    // 双/三键用邻居叉积确定偏移方向（在分子平面内），与 3Dmol.js 方法一致
    const perpX = getSideBondPerp(a1, a2, dirHat, atomById, allBonds)
    const atomRadiusA1 = this.atomDisplayRadius(a1.symbol, _displayMode)
    const atomRadiusA2 = this.atomDisplayRadius(a2.symbol, _displayMode)

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
          const line = singleColorBond ? idx : aromaticCentroid ? 0 : Math.floor(idx / 2)
          const spec = aromaticCentroid ? { offset: 0, radius: stickR } : lineSpecs[Math.min(line, lineSpecs.length - 1)]
          const offset = spec.offset
          const halfSegments = this.halfBondSegments(start, dirHat, len, atomRadiusA1, atomRadiusA2)
          const isA2 = idx % 2 === 1
          const targetLen = singleColorBond ? len : halfSegments[isA2 ? 1 : 0].length
          const height = this.bondGeometryLength(cyl.geometry, targetLen)
          cyl.scale.y = targetLen / height
          if (singleColorBond) {
            syncMaterialColor(this._profile, cyl.material, colorA1)
            cyl.position.copy(mid)
          } else {
            // idx 偶=a1 半、奇=a2 半
            const segment = halfSegments[isA2 ? 1 : 0]
            syncMaterialColor(this._profile, cyl.material, isA2 ? colorA2 : colorA1)
            cyl.position.copy(segment.center)
          }
          if (offset !== 0) cyl.position.addScaledVector(perpX, offset)
          cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirHat)
        }
        if (isAromaticDash) syncMaterialColor(this._profile, cyl.material, selected ? RENDER.bondSelectedColor : RENDER.aromaticDashColor)
        idx++
      })
      return
    }

    grp = new THREE.Group()
    grp.userData = { type: 'bond', id: bond.id }

    if (aromaticCentroid) {
      // ── 芳香键：实心圆柱（半分色两段）+ 朝向环心的虚线小圆柱段（单色） ──────
      this.addHalfBond(grp, start, dirHat, len, atomRadiusA1, atomRadiusA2, stickR, colorA1, colorA2, bond.id)

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
      for (const spec of lineSpecs) {
        const off = spec.offset !== 0 ? perpX.clone().multiplyScalar(spec.offset) : undefined
        if (singleColorBond) this.addSingleBond(grp, mid, dirHat, len, spec.radius, colorA1, bond.id, off)
        else this.addHalfBond(grp, start, dirHat, len, atomRadiusA1, atomRadiusA2, spec.radius, colorA1, colorA2, bond.id, off)
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
    atomRadiusA1: number, atomRadiusA2: number, radius: number, colorA1: number, colorA2: number, bondId: string,
    perpOffset?: THREE.Vector3,
  ) {
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirHat)
    const halves = this.halfBondSegments(start, dirHat, len, atomRadiusA1, atomRadiusA2)
    if (perpOffset) { halves[0].center.add(perpOffset); halves[1].center.add(perpOffset) }
    const taper = this._profile.bondTaper ?? 1
    const segments = [
      { ...halves[0], color: colorA1, radiusBottom: radius, radiusTop: radius * taper },
      { ...halves[1], color: colorA2, radiusBottom: radius * taper, radiusTop: radius },
    ] as const
    for (const segment of segments) {
      const cyl = this.makeCylinder(radius, segment.length, segment.color, bondId, segment.radiusTop, segment.radiusBottom)
      cyl.position.copy(segment.center)
      cyl.quaternion.copy(q)
      grp.add(cyl)
    }
  }

  private addSingleBond(
    grp: THREE.Group, center: THREE.Vector3, dirHat: THREE.Vector3, len: number,
    radius: number, color: number, bondId: string,
    perpOffset?: THREE.Vector3,
  ) {
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirHat)
    const segmentCenter = center.clone()
    if (perpOffset) segmentCenter.add(perpOffset)
    const cyl = this.makeCylinder(radius, len, color, bondId)
    cyl.position.copy(segmentCenter)
    cyl.quaternion.copy(q)
    grp.add(cyl)
  }

  private makeCylinder(
    radius: number,
    length: number,
    color: number,
    bondId: string,
    radiusTop = radius,
    radiusBottom = radius,
  ): THREE.Mesh {
    const geo = this._profile.bondGeometry === 'capsule'
      ? new THREE.CapsuleGeometry(
        radius,
        Math.max(length - radius * 2, 0.001),
        Math.max(Math.floor(RENDER.cylinderSegments / 2), 4),
        RENDER.cylinderSegments,
      )
      : new THREE.CylinderGeometry(radiusTop, radiusBottom, length, RENDER.cylinderSegments, 1, this._profile.bondOpenEnded ?? false)
    const mat = makeBondMaterial(this._profile, color)
    const cyl = new THREE.Mesh(geo, mat)
    cyl.userData = { type: 'bond', id: bondId }
    if (this._profile.outline) {
      // inverted-hull 描边：径向放大的黑色 BackSide 圆柱（长度不放大，避免端帽超出）
      const s = (radius + Math.max(RENDER.outlineBondMinOffset, radius * RENDER.outlineBondRadialFactor)) / radius
      const outline = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: outlineColor(this.getTheme()), side: THREE.BackSide }))
      outline.scale.set(s, 1, s)
      outline.renderOrder = RENDER_ORDER.outline
      cyl.add(outline)
    }
    return cyl
  }

  private bondGeometryLength(geometry: THREE.BufferGeometry, fallback: number): number {
    const params = (geometry as THREE.BufferGeometry & {
      parameters?: { height?: number; length?: number; radius?: number }
    }).parameters
    if (!params) return fallback
    if (typeof params.height === 'number') return params.height
    if (typeof params.length === 'number' && typeof params.radius === 'number') {
      return params.length + params.radius * 2
    }
    return fallback
  }

  private applyVisualState(visualState: ObjectVisualState) {
    const opacity = visualState.opacity ?? 1
    this.modelGroup.traverse(obj => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const mat of materials) applyMaterialVisualState(mat, opacity)
    })
  }

  private atomDisplayRadius(symbol: string, displayMode: DisplayMode): number {
    return atomDisplayRadius(this.getTheme(), this._profile, symbol, displayMode)
  }

  private halfBondSegments(
    start: THREE.Vector3,
    dirHat: THREE.Vector3,
    len: number,
    atomRadiusA1: number,
    atomRadiusA2: number,
  ): [{ center: THREE.Vector3; length: number }, { center: THREE.Vector3; length: number }] {
    const half = len / 2
    const offsetFactor = this._profile.bondStartOffsetFactor ?? 0
    const offsetA1 = Math.min(atomRadiusA1 * offsetFactor, Math.max(0, half - 0.001))
    const offsetA2 = Math.min(atomRadiusA2 * offsetFactor, Math.max(0, half - 0.001))
    const lenA1 = Math.max(half - offsetA1, 0.001)
    const lenA2 = Math.max(half - offsetA2, 0.001)
    return [
      { center: start.clone().addScaledVector(dirHat, offsetA1 + lenA1 / 2), length: lenA1 },
      { center: start.clone().addScaledVector(dirHat, len - offsetA2 - lenA2 / 2), length: lenA2 },
    ]
  }

  private bondLineSpecs(
    order: number,
    stickR: number,
    gap: number,
    displayMode: DisplayMode,
  ): { offset: number; radius: number }[] {
    if (displayMode === 'tube' || order === 1) return [{ offset: 0, radius: stickR }]
    const n = Math.min(Math.max(Math.ceil(order), 1), 3)
    if (this._profile.multiBondRadiusScale && this._profile.multiBondOffsetFactor !== undefined) {
      const radius = stickR * (n === 1 ? 1 : this._profile.multiBondRadiusScale / n)
      const pos = stickR * this._profile.multiBondOffsetFactor
      const offsets = n === 2 ? [-pos, pos] : [-pos, 0, pos]
      return offsets.map(offset => ({ offset, radius }))
    }
    const radius = order === 2 ? stickR * RENDER.doubleBondRadiusFactor : stickR * RENDER.tripleBondRadiusFactor
    const offsets = order === 2 ? [-gap / 2, gap / 2] : [-gap, 0, gap]
    return offsets.map(offset => ({ offset, radius }))
  }

  /** 在指定原子上显示 bond-drag 悬停光晕 */
  setDragHover(atomId: string) {
    this.selectionVisuals.setDragHover(atomId, this.atomMeshes.get(atomId))
  }

  clearDragHover() {
    this.selectionVisuals.clearDragHover()
  }

  dispose() {
    for (const [, mesh] of this.atomMeshes) {
      this.modelGroup.remove(mesh)
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
    }
    for (const [, grp] of this.bondMeshes) {
      this.modelGroup.remove(grp)
      disposeGroup(grp)
    }
    this.selectionVisuals.dispose()
    this.atomMeshes.clear()
    this.bondMeshes.clear()
    this.bondShapeKeys.clear()
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
