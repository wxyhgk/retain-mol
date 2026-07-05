import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
import { MolControls } from '../controls/MolControls'
import type { Atom, Bond, Molecule } from '../molecule'
import type { DisplayMode, MeasureStyle, MeasureType } from '../types'
import { CAMERA, CONTROLS } from '../../config/camera.config'
import { LIGHTING, FOG, DOF } from '../../config/render.config'
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

  // 景深后处理（虚实）：对焦注视点，远处虚化
  private _composer: EffectComposer | null = null
  private _bokehPass: BokehPass | null = null

  // 平面草图模式的网格可视化
  private _sketchGrid: THREE.GridHelper | null = null

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
  get onBackgroundDoubleClick() { return this._interaction.onBackgroundDoubleClick }
  set onBackgroundDoubleClick(v) { this._interaction.onBackgroundDoubleClick = v }
  get onAtomDragStart() { return this._interaction.onAtomDragStart }
  set onAtomDragStart(v) { this._interaction.onAtomDragStart = v }
  get onAtomDrag() { return this._interaction.onAtomDrag }
  set onAtomDrag(v) { this._interaction.onAtomDrag = v }
  get onAtomDragEnd() { return this._interaction.onAtomDragEnd }
  set onAtomDragEnd(v) { this._interaction.onAtomDragEnd = v }
  get canDragAtom() { return this._interaction.canDragAtom }
  set canDragAtom(v) { this._interaction.canDragAtom = v }
  get onBondDragStart() { return this._interaction.onBondDragStart }
  set onBondDragStart(v) { this._interaction.onBondDragStart = v }
  get onBondDragEnd() { return this._interaction.onBondDragEnd }
  set onBondDragEnd(v) { this._interaction.onBondDragEnd = v }
  get onBondDragHover() { return this._interaction.onBondDragHover }
  set onBondDragHover(v) { this._interaction.onBondDragHover = v }
  get getGrowPreview() { return this._interaction.getGrowPreview }
  set getGrowPreview(v) { this._interaction.getGrowPreview = v }
  get getGrowGuide() { return this._interaction.getGrowGuide }
  set getGrowGuide(v) { this._interaction.getGrowGuide = v }

  // ── 平面草图模式 ──────────────────────────────────────────────────────────

  /** 设置/清除草图平面：同步交互约束 + 半透明网格可视化（模型局部坐标） */
  setSketchPlane(plane: { origin: [number, number, number]; normal: [number, number, number] } | null) {
    this._interaction.sketchPlane = plane
      ? { origin: new THREE.Vector3(...plane.origin), normal: new THREE.Vector3(...plane.normal) }
      : null

    if (this._sketchGrid) {
      this.modelGroup.remove(this._sketchGrid)
      this._sketchGrid.geometry.dispose()
      ;(this._sketchGrid.material as THREE.Material).dispose()
      this._sketchGrid = null
    }
    if (plane) {
      const grid = new THREE.GridHelper(14, 14, 0x94a3b8, 0xcbd5e1)
      const mats = grid.material as THREE.LineBasicMaterial | THREE.LineBasicMaterial[]
      ;(Array.isArray(mats) ? mats : [mats]).forEach(m => { m.transparent = true; m.opacity = 0.3; m.depthWrite = false })
      // GridHelper 默认躺在 XZ 平面（法向 +Y）
      grid.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(...plane.normal).normalize(),
      )
      grid.position.set(...plane.origin)
      this.modelGroup.add(grid)
      this._sketchGrid = grid
    }
    ticker.invalidate()
  }

  /** 相机平滑转到垂直于草图平面的视角（旋转 rotationGroup 使法向朝向相机） */
  alignViewToPlane(normal: [number, number, number]) {
    const n = new THREE.Vector3(...normal).normalize()
    const current = n.clone().applyQuaternion(this.rotationGroup.quaternion)
    // 取离当前视角近的一侧，避免无谓的 180° 翻转
    const target = new THREE.Vector3(0, 0, current.z >= 0 ? 1 : -1)
    const qDelta = new THREE.Quaternion().setFromUnitVectors(current, target)
    const qStart = this.rotationGroup.quaternion.clone()
    const qEnd = qDelta.multiply(qStart)

    const DURATION = 400
    const t0 = performance.now()
    const step = () => {
      const t = Math.min(1, (performance.now() - t0) / DURATION)
      const ease = 1 - Math.pow(1 - t, 3)   // ease-out cubic
      this.rotationGroup.quaternion.slerpQuaternions(qStart, qEnd, ease)
      ticker.invalidate()
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  /** 当前相机视角平面（过旋转中心、垂直视线，模型局部坐标）——空场景 pp 的回退 */
  getViewPlaneLocal(): { origin: [number, number, number]; normal: [number, number, number] } {
    const camDir = new THREE.Vector3()
    this.camera.getWorldDirection(camDir)
    const inv = this.modelGroup.matrixWorld.clone().invert()
    const normal = camDir.clone().transformDirection(inv).negate()
    const pivot = new THREE.Vector3()
    this.rotationGroup.getWorldPosition(pivot)
    const origin = this.modelGroup.worldToLocal(pivot)
    return { origin: [origin.x, origin.y, origin.z], normal: [normal.x, normal.y, normal.z] }
  }

  setDragHoverAtom(atomId: string | null) {
    for (const r of this._molRenderers.values()) {
      if (atomId && r.atomMeshes.has(atomId)) r.setDragHover(atomId)
      else r.clearDragHover()
    }
  }

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

    // 深度雾化：从注视点往后逐渐变淡，提供前后深度线索
    this.scene.fog = new THREE.Fog(hexToInt(this.theme.scene.backgroundColor), CAMERA.initialZ, CAMERA.initialZ + FOG.farOffset)

    // 景深（虚实）：MSAA 渲染目标保住抗锯齿，BokehPass 做散焦
    if (DOF.enabled) {
      const dpr = window.devicePixelRatio
      const rt = new THREE.WebGLRenderTarget(
        canvas.clientWidth * dpr, canvas.clientHeight * dpr, { samples: 4 },
      )
      this._composer = new EffectComposer(this.renderer, rt)
      this._composer.setPixelRatio(dpr)
      this._composer.setSize(canvas.clientWidth, canvas.clientHeight)
      this._composer.addPass(new RenderPass(this.scene, this.camera))
      this._bokehPass = new BokehPass(this.scene, this.camera, {
        focus: CAMERA.initialZ,
        aperture: DOF.aperture,
        maxblur: DOF.maxblur,
      })
      this._composer.addPass(this._bokehPass)
    }

    // 注册到共享 Ticker 的 Render 阶段（最后执行）
    this._unsubTicker = ticker.subscribe('mol-render', Phase.Render, () => {
      this.controls.update()
      // 雾与景深焦点随相机-注视点距离同步；雾色跟随主题背景
      const fog = this.scene.fog as THREE.Fog
      const pivot = new THREE.Vector3()
      this.rotationGroup.getWorldPosition(pivot)
      const dist = this.camera.position.distanceTo(pivot)
      fog.near = dist + FOG.nearOffset
      fog.far  = dist + FOG.farOffset
      if (this.scene.background instanceof THREE.Color) fog.color.copy(this.scene.background)
      if (this._composer && this._bokehPass) {
        ;(this._bokehPass.uniforms as Record<string, { value: number }>)['focus'].value = dist
        this._composer.render()
      } else {
        this.renderer.render(this.scene, this.camera)
      }
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
    this._composer?.setSize(width, height)
    this.controls.handleResize()
    this._measureVisuals.onResize(width, height)
    ticker.invalidate()
  }

  /**
   * 截取当前视口为 PNG data URL。scale = 设备像素倍数（默认 2 出高清图）。
   * 临时抬高 pixelRatio 重新分配绘制缓冲，直接渲染（绕过景深 bokeh，出图更锐利），
   * 同步 toDataURL 读出后复原——preserveDrawingBuffer 未开，必须在渲染当帧同步读取。
   */
  captureImage(scale = 2): string {
    const size = new THREE.Vector2()
    this.renderer.getSize(size)          // CSS 像素尺寸
    const prevPR = this.renderer.getPixelRatio()
    this.renderer.setPixelRatio(prevPR * scale)
    this.renderer.setSize(size.x, size.y, false)   // 保持 CSS 尺寸，仅重分配高分缓冲
    this.renderer.render(this.scene, this.camera)  // 直接渲染，不走 composer
    const url = this.renderer.domElement.toDataURL('image/png')
    this.renderer.setPixelRatio(prevPR)
    this.renderer.setSize(size.x, size.y, false)
    ticker.invalidate()                  // 触发下一帧恢复实时视图（含景深）
    return url
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

  pickBondIdAt(clientX: number, clientY: number): string | null {
    return this._interaction.pickBondIdAt(clientX, clientY)
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
    this._composer?.dispose()
    this.renderer.dispose()
    for (const [, r] of this._molRenderers) r.dispose()
    this._molRenderers.clear()
    this._objectGroups.clear()
  }
}
