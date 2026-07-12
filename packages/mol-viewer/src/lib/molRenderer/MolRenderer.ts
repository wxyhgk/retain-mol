import * as THREE from 'three'
import { MolControls } from '../controls/MolControls'
import type { Atom, Molecule } from '../molecule'
import type { DisplayMode, MeasureStyle, MeasureType } from '../types'
import { CAMERA, CONTROLS } from '../../config/camera.config'
import { SKETCH_GRID } from '../../config/render.config'
import { resolveTheme, hexToInt, type ResolvedTheme } from '../../presets'
import { resolveRenderProfile, type RenderStyle } from '../../styles'
import { ticker as defaultTicker, Phase, type Ticker } from '../animation'
import { MoleculeRenderer } from './MoleculeRenderer'
import { MoleculeSceneLayer } from './MoleculeSceneLayer'
import { InteractionHandler } from './InteractionHandler'
import { MeasureVisuals } from './MeasureVisuals'
import * as CameraUtils from './CameraUtils'
import { AromaticRingCache } from './aromaticData'
import { captureCanvasPNG } from './capture'
import { setupLights, syncLightsForProfile, addBackgroundGrid, makeDepthFog, syncDepthFog, type LightRig } from './sceneRig'
import { DepthOfField } from './postprocessing'

const VIEWPORT_AXES_SIZE = 4
let rendererSequence = 0

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
  /** 渲染风格：realistic（写实光照）| publication（论文描边）| iboview（高光球棍） */
  renderStyle: RenderStyle = 'realistic'
  private _backgroundGrid: THREE.GridHelper | null = null
  private _axesHelper: THREE.AxesHelper | null = null
  private _gridVisibleOverride: boolean | null = null
  private _lights: LightRig | null = null
  private _lastCameraFov = CAMERA.fov

  private _measureGroup = new THREE.Group()
  private _unsubTicker: () => void = () => {}
  private readonly _tickerKey = `mol-render:${rendererSequence += 1}`

  /** 兼容通过 Object.create 构造的轻量测试实例；正式实例始终使用注入 ticker。 */
  private get frameTicker(): Ticker { return this.ticker ?? defaultTicker }

  // 景深后处理（虚实）：对焦注视点，远处虚化
  private _dof: DepthOfField | null = null

  // 平面草图模式的网格可视化
  private _sketchGrid: THREE.GridHelper | null = null

  private _molRenderer: MoleculeRenderer
  private _sceneLayer: MoleculeSceneLayer
  private _interaction: InteractionHandler
  private _measureVisuals: MeasureVisuals

  // 芳香环心缓存（DFS 结果按 bonds 引用缓存，环心每帧实时算）
  private _aromatic = new AromaticRingCache()

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
  get idleCursor() { return this._interaction.idleCursor }
  set idleCursor(v) { this._interaction.idleCursor = v }

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
      const sg = SKETCH_GRID
      const grid = new THREE.GridHelper(sg.size, sg.divisions, sg.color, sg.subColor)
      const mats = grid.material as THREE.LineBasicMaterial | THREE.LineBasicMaterial[]
      ;(Array.isArray(mats) ? mats : [mats]).forEach(m => { m.transparent = true; m.opacity = sg.opacity; m.depthWrite = false })
      // GridHelper 默认躺在 XZ 平面（法向 +Y）
      grid.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(...plane.normal).normalize(),
      )
      grid.position.set(...plane.origin)
      this.modelGroup.add(grid)
      this._sketchGrid = grid
    }
    this.frameTicker.invalidate()
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

    const DURATION = CONTROLS.alignToPlaneDurationMs
    const t0 = performance.now()
    const step = () => {
      const t = Math.min(1, (performance.now() - t0) / DURATION)
      const ease = 1 - Math.pow(1 - t, 3)   // ease-out cubic
      this.rotationGroup.quaternion.slerpQuaternions(qStart, qEnd, ease)
      this.frameTicker.invalidate()
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
    this._sceneLayer.setDragHoverAtom(atomId)
  }

  invalidateViewport() {
    this.frameTicker.invalidate()
  }

  startContinuous(reason: string) {
    this.frameTicker.startContinuous(`${reason}:${this._tickerKey}`)
  }

  stopContinuous(reason: string) {
    this.frameTicker.stopContinuous(`${reason}:${this._tickerKey}`)
  }

  // ── 测量样式（转发给 MeasureVisuals）──
  get measureStyle(): MeasureStyle { return this._measureVisuals.measureStyle }
  set measureStyle(v: MeasureStyle) { this._measureVisuals.measureStyle = v }
  get measureLabelPositions() { return this._measureVisuals.measureLabelPositions }

  constructor(canvas: HTMLCanvasElement, private readonly ticker: Ticker = defaultTicker) {
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
    this._backgroundGrid = addBackgroundGrid(this.scene)
    this._axesHelper = new THREE.AxesHelper(VIEWPORT_AXES_SIZE)
    this._axesHelper.visible = false
    this.scene.add(this._axesHelper)

    this.controls = new MolControls(this.camera, this.rotationGroup, this.modelGroup, canvas)
    this.controls.rotateSpeed = CONTROLS.rotateSpeed
    this.controls.panSpeed = CONTROLS.panSpeed
    this.controls.zoomSpeed = CONTROLS.zoomSpeed

    this._molRenderer = new MoleculeRenderer(this.modelGroup, () => this.theme, () => this.frameTicker.invalidate())
    this._sceneLayer = new MoleculeSceneLayer(this.modelGroup, () => this.theme, () => this.frameTicker.invalidate())
    this._interaction = new InteractionHandler(
      canvas, this.camera, this.rotationGroup, this.modelGroup, this.controls,
      () => {
        return this._sceneLayer.aggregateAtomMeshes(this._molRenderer.atomMeshes)
      },
      () => {
        return this._sceneLayer.aggregateBondMeshes(this._molRenderer.bondMeshes)
      },
      () => this.frameTicker.invalidate(),
    )
    this._measureVisuals = new MeasureVisuals(this._measureGroup, canvas, () => this.theme)

    // 相机拖拽期间持续渲染，其余场景按需渲染
    const viewportReason = `viewport:${this._tickerKey}`
    this.controls.onInteractionStart = () => this.frameTicker.startContinuous(viewportReason)
    this.controls.onInteractionEnd = () => { this.frameTicker.stopContinuous(viewportReason); this.frameTicker.invalidate() }
    this.controls.onWheelChange = () => this.frameTicker.invalidate()

    // 深度雾化由 render profile 决定；IboView 使用 shader 内 fragment depth cue。
    this.scene.fog = makeDepthFog(hexToInt(this.theme.scene.backgroundColor))

    // 景深（虚实）：MSAA 渲染目标保住抗锯齿，BokehPass 做散焦（DOF.enabled=false → null）
    this._dof = DepthOfField.create(this.renderer, this.scene, this.camera, canvas.clientWidth, canvas.clientHeight)

    // 注册到共享 Ticker 的 Render 阶段（最后执行）
    this._unsubTicker = this.frameTicker.subscribe(this._tickerKey, Phase.Render, () => {
      this.controls.update()
      const profile = resolveRenderProfile(this.renderStyle)
      this.syncGridVisibility(profile.backgroundGrid)
      if (this._lights) syncLightsForProfile(this._lights, profile)
      const targetFov = profile.cameraFov
      if (Math.abs(this.camera.fov - targetFov) > 1e-6 || this._lastCameraFov !== targetFov) {
        CameraUtils.setFovPreservingScale(this.camera, targetFov)
        this._lastCameraFov = targetFov
      }
      // 雾与景深焦点随相机-注视点距离同步；雾色跟随主题背景
      const pivot = new THREE.Vector3()
      this.rotationGroup.getWorldPosition(pivot)
      const dist = this.camera.position.distanceTo(pivot)
      if (profile.depthCue.mode === 'three-fog') {
        if (!this.scene.fog) this.scene.fog = makeDepthFog(hexToInt(this.theme.scene.backgroundColor))
        syncDepthFog(this.scene.fog as THREE.Fog, dist, this.scene.background)
      } else {
        this.scene.fog = null
      }
      if (this._dof) this._dof.render(dist)
      else this.renderer.render(this.scene, this.camera)
    })
    this.frameTicker.invalidate() // 初始帧

    this._lights = setupLights(this.scene)
  }

  resize(width: number, height: number) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return
    this.renderer.setPixelRatio(window.devicePixelRatio || 1)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
    this._dof?.setSize(width, height)
    this.controls.handleResize()
    this._measureVisuals.onResize(width, height)
    this.frameTicker.invalidate()
  }

  /**
   * 截取当前视口为 PNG data URL。scale = 设备像素倍数（默认 2 出高清图）。
   * 临时抬高 pixelRatio 重新分配绘制缓冲，直接渲染（绕过景深 bokeh，出图更锐利），
   * 同步 toDataURL 读出后复原——preserveDrawingBuffer 未开，必须在渲染当帧同步读取。
   */
  captureImage(scale = 2): string {
    const url = captureCanvasPNG(this.renderer, this.scene, this.camera, scale)
    this.frameTicker.invalidate()        // 触发下一帧恢复实时视图（含景深）
    return url
  }

  // ── 渲染 ──

  render(molecule: Molecule, displayMode: DisplayMode, selectedAtoms: Set<string>, selectedBonds: Set<string>) {
    this._molRenderer.render(molecule, displayMode, selectedAtoms, selectedBonds, this._aromatic.centroids(molecule), this.renderStyle)
    this.frameTicker.invalidate()
  }

  renderScene(
    objects: readonly import('../sceneObject').SceneObject[],
    activeObjectId: string | null,
    displayMode: DisplayMode,
    selectedAtoms: Set<string>,
    selectedBonds: Set<string>,
  ): void {
    this._sceneLayer.render(
      objects,
      activeObjectId,
      displayMode,
      selectedAtoms,
      selectedBonds,
      this.renderStyle,
      molecule => this._aromatic.centroids(molecule),
    )
    this.frameTicker.invalidate()
  }

  /** Switch material/profile rendering while preserving orbit, pan and apparent zoom. */
  setRenderStyle(renderStyle: RenderStyle) {
    if (this.renderStyle === renderStyle) return
    const profile = resolveRenderProfile(renderStyle)
    CameraUtils.setFovPreservingScale(this.camera, profile.cameraFov)
    this._lastCameraFov = profile.cameraFov
    this.renderStyle = renderStyle
    this.syncGridVisibility(profile.backgroundGrid)
    this.frameTicker.invalidate()
  }

  // ── 相机 / 视图 ──

  private syncGridVisibility(profileVisible: boolean) {
    if (this._backgroundGrid) {
      this._backgroundGrid.visible = this._gridVisibleOverride ?? profileVisible
    }
  }

  setAxesVisible(visible: boolean) {
    if (this._axesHelper) this._axesHelper.visible = visible
    this.frameTicker.invalidate()
  }

  setGridVisible(visible: boolean) {
    this._gridVisibleOverride = visible
    if (this._backgroundGrid) this._backgroundGrid.visible = visible
    this.frameTicker.invalidate()
  }

  resetCamera() {
    CameraUtils.resetCamera(this.camera, this.rotationGroup, this.modelGroup)
    this.frameTicker.invalidate()
  }

  fitToMolecule(atoms: Atom[]) {
    const profile = resolveRenderProfile(this.renderStyle)
    if (Math.abs(this.camera.fov - profile.cameraFov) > 1e-6) {
      this.camera.fov = profile.cameraFov
      this.camera.updateProjectionMatrix()
      this._lastCameraFov = profile.cameraFov
    }
    CameraUtils.fitToMolecule(
      atoms,
      this.camera,
      this.rotationGroup,
      this.modelGroup,
      profile.cameraFitMultiplier,
    )
    this.frameTicker.invalidate()
  }

  updateOrbitTarget(atoms: readonly Atom[]) {
    CameraUtils.updateOrbitTarget(atoms, this.rotationGroup, this.modelGroup)
    this.frameTicker.invalidate()
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
    this.frameTicker.invalidate()
  }

  // ── 测量可视化 ──

  updateMeasureVisuals(
    committed: Array<{ type: MeasureType; atoms: Atom[] }>,
    pending: Atom[],
  ) {
    this._measureVisuals.update(committed, pending)
    this.frameTicker.invalidate()
  }

  cancelActiveInteraction() {
    this._interaction.cancelActiveGesture()
  }

  dispose() {
    this._unsubTicker()
    this.frameTicker.stopContinuous(`viewport:${this._tickerKey}`)
    this._interaction.dispose()
    this._molRenderer.dispose()
    this._sceneLayer.dispose()
    this._measureVisuals.dispose()
    if (this._sketchGrid) {
      this.modelGroup.remove(this._sketchGrid)
      disposeObject3D(this._sketchGrid)
      this._sketchGrid = null
    }
    if (this._backgroundGrid) {
      this.scene.remove(this._backgroundGrid)
      disposeObject3D(this._backgroundGrid)
      this._backgroundGrid = null
    }
    if (this._axesHelper) {
      this.scene.remove(this._axesHelper)
      disposeObject3D(this._axesHelper)
      this._axesHelper = null
    }
    if (this._lights) {
      this._lights.key.shadow.map?.dispose()
      this._lights.fill.shadow.map?.dispose()
      this._lights.rim.shadow.map?.dispose()
      this.scene.remove(this._lights.ambient, this._lights.key, this._lights.fill, this._lights.rim)
      this._lights = null
    }
    this.controls.dispose()
    this._dof?.dispose()
    this.modelGroup.remove(this._measureGroup)
    this.rotationGroup.remove(this.modelGroup)
    this.scene.remove(this.rotationGroup)
    disposeObject3D(this.modelGroup)
    disposeObject3D(this.rotationGroup)
    this.renderer.dispose()
  }
}

function disposeObject3D(root: THREE.Object3D) {
  root.traverse(obj => {
    const renderable = obj as THREE.Object3D & {
      geometry?: THREE.BufferGeometry
      material?: THREE.Material | THREE.Material[]
    }
    renderable.geometry?.dispose()
    if (!renderable.material) return
    const materials = Array.isArray(renderable.material) ? renderable.material : [renderable.material]
    materials.forEach(m => m?.dispose())
  })
}
