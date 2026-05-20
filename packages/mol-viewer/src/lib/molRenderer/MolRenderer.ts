import * as THREE from 'three'
import { MolControls } from '../controls/MolControls'
import type { Atom, Bond, Molecule } from '../molecule'
import type { DisplayMode, MeasureStyle, MeasureType } from '../types'
import { CAMERA, CONTROLS } from '../../config/camera.config'
import { LIGHTING } from '../../config/render.config'
import { resolveTheme, hexToInt, type ResolvedTheme } from '../../presets'
import { ticker, Phase } from '../animation'
import { MoleculeRenderer } from './MoleculeRenderer'
import { InteractionHandler } from './InteractionHandler'
import { MeasureVisuals } from './MeasureVisuals'
import * as CameraUtils from './CameraUtils'
import { detectAromaticity } from '../builder/analysis'

/**
 * 薄 orchestrator：负责场景图组装、动画循环、resize，
 * 具体功能委托给各子模块。
 */
export class MolRenderer {
  readonly scene: THREE.Scene
  readonly camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  readonly controls: MolControls
  readonly rotationGroup = new THREE.Group()
  readonly modelGroup = new THREE.Group()
  readonly canvas: HTMLCanvasElement

  theme: ResolvedTheme = resolveTheme('default')

  private _measureGroup = new THREE.Group()
  private _unsubTicker: () => void = () => {}

  private _molRenderer: MoleculeRenderer
  private _interaction: InteractionHandler
  private _measureVisuals: MeasureVisuals

  // Multi-object scene support
  private _molRenderers = new Map<string, MoleculeRenderer>()
  private _objectGroups = new Map<string, THREE.Group>()

  // Aromaticity ring cache: bonds array reference → aromaticRings (atom ID arrays)
  // 用 bonds 数组引用做 key：setAtomPositions 只改坐标不改 bonds，
  // 因此优化期间每帧命中缓存，不重复跑 DFS findRings。
  // 环心从当前坐标实时算（代价低），这样优化时环心也跟着移动。
  private _aromaticRingCache = new WeakMap<readonly Bond[], string[][]>()

  // ── 公共回调（转发给 InteractionHandler）──
  get onAtomClick() { return this._interaction.onAtomClick }
  set onAtomClick(v) { this._interaction.onAtomClick = v }
  get onAtomDoubleClick() { return this._interaction.onAtomDoubleClick }
  set onAtomDoubleClick(v) { this._interaction.onAtomDoubleClick = v }
  get onBondClick() { return this._interaction.onBondClick }
  set onBondClick(v) { this._interaction.onBondClick = v }
  get onBackgroundClick() { return this._interaction.onBackgroundClick }
  set onBackgroundClick(v) { this._interaction.onBackgroundClick = v }
  get onAtomDragStart() { return this._interaction.onAtomDragStart }
  set onAtomDragStart(v) { this._interaction.onAtomDragStart = v }
  get onAtomDrag() { return this._interaction.onAtomDrag }
  set onAtomDrag(v) { this._interaction.onAtomDrag = v }
  get onAtomDragEnd() { return this._interaction.onAtomDragEnd }
  set onAtomDragEnd(v) { this._interaction.onAtomDragEnd = v }
  get canDragAtom() { return this._interaction.canDragAtom }
  set canDragAtom(v) { this._interaction.canDragAtom = v }

  // ── 测量样式（转发给 MeasureVisuals）──
  get measureStyle(): MeasureStyle { return this._measureVisuals.measureStyle }
  set measureStyle(v: MeasureStyle) { this._measureVisuals.measureStyle = v }
  get measureLabelPositions() { return this._measureVisuals.measureLabelPositions }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(hexToInt(this.theme.scene.backgroundColor))

    this.camera = new THREE.PerspectiveCamera(CAMERA.fov, canvas.clientWidth / canvas.clientHeight, CAMERA.near, CAMERA.far)
    this.camera.position.set(0, 0, CAMERA.initialZ)

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
    this.renderer.shadowMap.enabled = true

    // 场景图：scene → rotationGroup → modelGroup（含分子内容 + 测量 + ghost）
    this.scene.add(this.rotationGroup)
    this.rotationGroup.add(this.modelGroup)
    this.modelGroup.add(this._measureGroup)

    // 网格：极淡颜色，不影响分子渲染
    const grid = new THREE.GridHelper(50, 50, 0xe5e7eb, 0xe5e7eb)
    grid.position.y = -3
    const gridMat = grid.material as THREE.LineBasicMaterial | THREE.LineBasicMaterial[]
    ;(Array.isArray(gridMat) ? gridMat : [gridMat]).forEach(m => { m.opacity = 0.4; m.transparent = true })
    this.scene.add(grid)

    this.controls = new MolControls(this.camera, this.rotationGroup, this.modelGroup, canvas)
    this.controls.rotateSpeed = CONTROLS.rotateSpeed
    this.controls.panSpeed = CONTROLS.panSpeed
    this.controls.zoomSpeed = CONTROLS.zoomSpeed

    this._molRenderer = new MoleculeRenderer(this.modelGroup, () => this.theme)
    this._interaction = new InteractionHandler(
      canvas, this.camera, this.rotationGroup, this.modelGroup, this.controls,
      () => {
        // Aggregate atom meshes from all scene-object renderers; fall back to legacy single renderer
        const merged = new Map<string, THREE.Mesh>()
        if (this._molRenderers.size > 0) {
          for (const r of this._molRenderers.values()) {
            for (const [id, mesh] of r.atomMeshes) merged.set(id, mesh)
          }
        } else {
          for (const [id, mesh] of this._molRenderer.atomMeshes) merged.set(id, mesh)
        }
        return merged
      },
      () => {
        const merged = new Map<string, THREE.Group>()
        if (this._molRenderers.size > 0) {
          for (const r of this._molRenderers.values()) {
            for (const [id, group] of r.bondMeshes) merged.set(id, group)
          }
        } else {
          for (const [id, group] of this._molRenderer.bondMeshes) merged.set(id, group)
        }
        return merged
      },
    )
    this._measureVisuals = new MeasureVisuals(this._measureGroup, canvas, () => this.theme)

    // 相机拖拽期间持续渲染，其余场景按需渲染
    this.controls.onInteractionStart = () => ticker.startContinuous('viewport')
    this.controls.onInteractionEnd = () => { ticker.stopContinuous('viewport'); ticker.invalidate() }
    this.controls.onWheelChange = () => ticker.invalidate()

    // 注册到共享 Ticker 的 Render 阶段（最后执行）
    this._unsubTicker = ticker.subscribe('mol-render', Phase.Render, () => {
      this.controls.update()
      this.renderer.render(this.scene, this.camera)
    })
    ticker.invalidate() // 初始帧

    this.setupLights()
  }

  private setupLights() {
    this.scene.add(new THREE.AmbientLight(LIGHTING.ambient.color, LIGHTING.ambient.intensity))
    const dir1 = new THREE.DirectionalLight(LIGHTING.keyLight.color, LIGHTING.keyLight.intensity)
    dir1.position.set(...LIGHTING.keyLight.position)
    dir1.castShadow = true
    this.scene.add(dir1)
    const dir2 = new THREE.DirectionalLight(LIGHTING.fillLight.color, LIGHTING.fillLight.intensity)
    dir2.position.set(...LIGHTING.fillLight.position)
    this.scene.add(dir2)
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
    this.controls.handleResize()
    this._measureVisuals.onResize(width, height)
    ticker.invalidate()
  }

  // ── 渲染 ──

  // 返回 bondId → 所在环心（THREE.Vector3）
  // DFS findRings 结果按 bonds 引用缓存，坐标部分每帧实时算（只是取均值，代价低）。
  private _aromaticData(mol: Molecule): Map<string, THREE.Vector3> {
    const bonds = mol.bonds

    // DFS 找环：bonds 不变就不重跑
    if (!this._aromaticRingCache.has(bonds)) {
      this._aromaticRingCache.set(bonds, detectAromaticity(mol).aromaticRings)
    }
    const aromaticRings = this._aromaticRingCache.get(bonds)!

    // 用当前坐标计算环心（positions 每帧都在变，所以每帧重算，但操作量极小）
    const atomById = new Map(mol.atoms.map(a => [a.id, a]))
    const bondCentroid = new Map<string, THREE.Vector3>()

    for (const ring of aromaticRings) {
      let cx = 0, cy = 0, cz = 0
      for (const id of ring) {
        const a = atomById.get(id)
        if (a) { cx += a.x; cy += a.y; cz += a.z }
      }
      cx /= ring.length; cy /= ring.length; cz /= ring.length
      const centroid = new THREE.Vector3(cx, cy, cz)

      const ringSet = new Set(ring)
      for (const b of mol.bonds) {
        if (ringSet.has(b.atomId1) && ringSet.has(b.atomId2)) {
          bondCentroid.set(b.id, centroid)
        }
      }
    }

    return bondCentroid
  }

  render(molecule: Molecule, displayMode: DisplayMode, selectedAtoms: Set<string>, selectedBonds: Set<string>) {
    this._molRenderer.render(molecule, displayMode, selectedAtoms, selectedBonds, this._aromaticData(molecule))
    ticker.invalidate()
  }

  renderScene(
    objects: readonly import('../sceneObject').SceneObject[],
    activeObjectId: string | null,
    displayMode: DisplayMode,
    selectedAtoms: Set<string>,
    selectedBonds: Set<string>,
  ): void {
    // 1. 删除不再存在的对象
    for (const [id] of this._molRenderers) {
      if (!objects.find(o => o.id === id)) {
        this._molRenderers.get(id)!.dispose()
        this._molRenderers.delete(id)
        const grp = this._objectGroups.get(id)
        if (grp) this.modelGroup.remove(grp)
        this._objectGroups.delete(id)
      }
    }

    // 2. 渲染每个对象
    for (const obj of objects) {
      // 确保 group 存在
      if (!this._objectGroups.has(obj.id)) {
        const grp = new THREE.Group()
        this.modelGroup.add(grp)
        this._objectGroups.set(obj.id, grp)
      }
      const grp = this._objectGroups.get(obj.id)!
      grp.visible = obj.visible

      if (!obj.visible) continue

      // 确保 MoleculeRenderer 存在
      if (!this._molRenderers.has(obj.id)) {
        this._molRenderers.set(obj.id, new MoleculeRenderer(grp, () => this.theme))
      }
      const molRenderer = this._molRenderers.get(obj.id)!

      const isActive = obj.id === activeObjectId
      molRenderer.render(
        obj.molecule,
        displayMode,
        isActive ? selectedAtoms : new Set<string>(),
        isActive ? selectedBonds : new Set<string>(),
        this._aromaticData(obj.molecule),
      )

      // 非活跃对象半透明
      const targetOpacity = isActive ? 1.0 : 0.3
      grp.traverse(child => {
        const mesh = child as THREE.Mesh
        if (!mesh.isMesh) return
        const mat = mesh.material as THREE.Material
        if (mat) {
          mat.transparent = targetOpacity < 1.0
          mat.opacity = targetOpacity
        }
      })
    }

    ticker.invalidate()
  }

  // ── 相机 / 视图 ──

  resetCamera() {
    CameraUtils.resetCamera(this.camera, this.rotationGroup, this.modelGroup)
    ticker.invalidate()
  }

  fitToMolecule(atoms: Atom[]) {
    CameraUtils.fitToMolecule(atoms, this.camera, this.rotationGroup, this.modelGroup)
    ticker.invalidate()
  }

  updateOrbitTarget(atoms: readonly Atom[]) {
    CameraUtils.updateOrbitTarget(atoms, this.rotationGroup, this.modelGroup)
    ticker.invalidate()
  }

  projectToScreen(worldPos: THREE.Vector3, containerWidth: number, containerHeight: number) {
    return CameraUtils.projectToScreen(worldPos, this.camera, containerWidth, containerHeight)
  }

  projectLocalToScreen(localPos: THREE.Vector3, w: number, h: number) {
    return CameraUtils.projectLocalToScreen(localPos, this.camera, this.modelGroup, w, h)
  }

  screenDeltaToModelLocal(dxPx: number, dyPx: number): THREE.Vector3 {
    return CameraUtils.screenDeltaToModelLocal(dxPx, dyPx, this.canvas, this.camera, this.rotationGroup)
  }

  // ── 拾取（供 overlay 使用）──

  pickAtomIdAt(clientX: number, clientY: number): string | null {
    return this._interaction.pickAtomIdAt(clientX, clientY)
  }

  // ── 成键预览线 ──

  setGhostLineStart(atomId: string | null) {
    this._interaction.setGhostLineStart(atomId)
    ticker.invalidate()
  }

  // ── 测量可视化 ──

  updateMeasureVisuals(
    committed: Array<{ type: MeasureType; atoms: Atom[] }>,
    pending: Atom[],
  ) {
    this._measureVisuals.update(committed, pending)
    ticker.invalidate()
  }

  dispose() {
    this._unsubTicker()
    ticker.stopContinuous('viewport')
    this._interaction.dispose()
    this._molRenderer.dispose()
    this._measureVisuals.dispose()
    this.controls.dispose()
    this.renderer.dispose()
    for (const [, r] of this._molRenderers) r.dispose()
    this._molRenderers.clear()
    this._objectGroups.clear()
  }
}
