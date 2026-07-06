import * as THREE from 'three'
import type { Atom, Bond, Molecule } from '../molecule'
// aromaticBonds: bondId → ring centroid position
import type { DisplayMode } from '../types'
import type { ResolvedTheme } from '../../presets'
import { hexToInt } from '../../presets'
import { getElementConfig as getElement } from '../../config/elements.config'
import { RENDER, BOND_DRAG_HOVER } from '../../config/render.config'
import { ticker } from '../animation'

// ── 出版/论文渲染（由 MoleculeRenderer._pub 驱动）──────────────
/** inverted-hull 黑描边相对半径的额外量（Å，POC 用固定值；正式版用屏幕空间 pos.w） */
const OUTLINE_OFFSET = 0.05

// ── 球径向渐变（复刻 xyzrender：左上高光焦点 fx/fy=.33、3 段 stop 0%/40%/100%）──
// 在 HSL 空间由基色算高光/边缘暗色（对齐 xyzrender colors.py 的 lighten/darken 语义）
function sphereShades(hex: number): { hi: THREE.Color; base: THREE.Color; lo: THREE.Color } {
  const base = new THREE.Color(hex)
  const hsl = { h: 0, s: 0, l: 0 }
  base.getHSL(hsl)
  const hi = new THREE.Color().setHSL(hsl.h, hsl.s, Math.min(1, hsl.l + (1 - hsl.l) * 0.5))
  const lo = new THREE.Color().setHSL(hsl.h, Math.min(1, hsl.s + (1 - hsl.s) * 0.18), hsl.l * 0.52)
  return { hi, base, lo }
}
// view-space 法线的 xy = 球在屏幕的投影坐标（中心→0、边缘→单位圆），正好对应 SVG 圆盘
const SPHERE_VERT = /* glsl */`
  #include <fog_pars_vertex>
  varying vec3 vN;
  void main() {
    vN = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`
const SPHERE_FRAG = /* glsl */`
  #include <fog_pars_fragment>
  uniform vec3 uHi; uniform vec3 uBase; uniform vec3 uLo;
  varying vec3 vN;
  void main() {
    float d = clamp(length(vN.xy - vec2(-0.34, 0.34)) / 0.66, 0.0, 1.0);   // 到左上高光焦点的径向距离
    vec3 col = d < 0.4 ? mix(uHi, uBase, d / 0.4) : mix(uBase, uLo, (d - 0.4) / 0.6);
    float rim = 1.0 - abs(vN.z);        // 球 silhouette：法线越垂直视线越靠边缘
    col *= 1.0 - 0.25 * rim * rim;      // 边缘再同心压暗一点，更贴 SVG radialGradient 的边缘
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`
function makeSphereMat(hex: number): THREE.ShaderMaterial {
  const s = sphereShades(hex)
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      { uHi: { value: s.hi }, uBase: { value: s.base }, uLo: { value: s.lo } },
    ]),
    vertexShader: SPHERE_VERT, fragmentShader: SPHERE_FRAG, fog: true,
  })
}
// 键圆柱：view 法线做左上光的侧向渐变（比 toon 更贴渐变球的风格）
const CYL_FRAG = /* glsl */`
  #include <fog_pars_fragment>
  uniform vec3 uHi; uniform vec3 uBase; uniform vec3 uLo;
  varying vec3 vN;
  void main() {
    float ndl = clamp(dot(normalize(vN), normalize(vec3(-0.4, 0.5, 0.7))) * 0.5 + 0.5, 0.0, 1.0);
    vec3 col = ndl > 0.5 ? mix(uBase, uHi, (ndl - 0.5) * 2.0) : mix(uLo, uBase, ndl * 2.0);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`
function makeCylinderMat(hex: number): THREE.ShaderMaterial {
  const s = sphereShades(hex)
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      { uHi: { value: s.hi }, uBase: { value: s.base }, uLo: { value: s.lo } },
    ]),
    vertexShader: SPHERE_VERT, fragmentShader: CYL_FRAG, fog: true,
  })
}

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
    let o = this.outlineMeshes.get(atomId)
    if (!o) {
      const geo = new THREE.SphereGeometry(rr, RENDER.sphereSegments, RENDER.sphereSegments)
      const mat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide })
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
    o.position.set(x, y, z)
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
    const mat: THREE.Material = this._pub
      ? makeCylinderMat(color)
      : new THREE.MeshPhongMaterial({ color, shininess: RENDER.bondShininess })
    const cyl = new THREE.Mesh(geo, mat)
    cyl.userData = { type: 'bond', id: bondId }
    if (this._pub) {
      // inverted-hull 描边：径向放大的黑色 BackSide 圆柱（长度不放大，避免端帽超出）
      const s = (radius + Math.max(0.03, radius * 0.35)) / radius
      const outline = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide }))
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
