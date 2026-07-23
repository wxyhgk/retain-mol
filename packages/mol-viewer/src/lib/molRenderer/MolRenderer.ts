import * as THREE from 'three'
import { MolControls } from '../controls/MolControls'
import type { Atom, Molecule } from '../molecule'
import type { DisplayMode, MeasureStyle, MeasureType } from '../types'
import { CAMERA, CONTROLS } from '../../config/camera.config'
import { resolveTheme, hexToInt, type ResolvedTheme } from '../../presets'
import { resolveRenderProfile, type RenderStyle } from '../../styles'
import { Phase, ticker as defaultTicker, type Ticker } from '../animation'
import { MoleculeRenderer } from './MoleculeRenderer'
import { MoleculeSceneLayer } from './MoleculeSceneLayer'
import { InteractionHandler } from './InteractionHandler'
import { MeasureVisuals } from './MeasureVisuals'
import * as CameraUtils from './CameraUtils'
import { AromaticRingCache } from './aromaticData'
import { captureCanvasPNG } from './capture'
import { ViewportGuides, type SketchPlane } from './ViewportGuides'
import { disposeObject3D } from './disposeObject3D'
import { SceneRenderPipeline } from './SceneRenderPipeline'
import { ReactionHighlightManager } from './ReactionHighlightManager'
import type { ReactionHighlight } from '../reactionHighlights'

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
  private _measureGroup = new THREE.Group()
  private readonly _tickerKey = `mol-render:${rendererSequence += 1}`

  /** 兼容通过 Object.create 构造的轻量测试实例；正式实例始终使用注入 ticker。 */
  private get frameTicker(): Ticker { return this.ticker ?? defaultTicker }

  private _viewportGuides: ViewportGuides
  private _renderPipeline: SceneRenderPipeline

  private _molRenderer: MoleculeRenderer
  private _sceneLayer: MoleculeSceneLayer
  private _interaction: InteractionHandler
  private _measureVisuals: MeasureVisuals
  private _reactionHighlights: ReactionHighlightManager
  private _unsubscribeReactionHighlights: () => void

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
  get onAtomDragCancel() { return this._interaction.onAtomDragCancel }
  set onAtomDragCancel(v) { this._interaction.onAtomDragCancel = v }
  get canDragAtom() { return this._interaction.canDragAtom }
  set canDragAtom(v) { this._interaction.canDragAtom = v }
  get canStartBondDrag() { return this._interaction.canStartBondDrag }
  set canStartBondDrag(v) { this._interaction.canStartBondDrag = v }
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
  get canStartFragmentTorsion() { return this._interaction.canStartFragmentTorsion }
  set canStartFragmentTorsion(v) { this._interaction.canStartFragmentTorsion = v }
  get onFragmentTorsionStart() { return this._interaction.onFragmentTorsionStart }
  set onFragmentTorsionStart(v) { this._interaction.onFragmentTorsionStart = v }
  get getFragmentTorsionPreview() { return this._interaction.getFragmentTorsionPreview }
  set getFragmentTorsionPreview(v) { this._interaction.getFragmentTorsionPreview = v }
  get onFragmentTorsionEnd() { return this._interaction.onFragmentTorsionEnd }
  set onFragmentTorsionEnd(v) { this._interaction.onFragmentTorsionEnd = v }
  get idleCursor() { return this._interaction.idleCursor }
  set idleCursor(v) { this._interaction.idleCursor = v }

  // ── 平面草图模式 ──────────────────────────────────────────────────────────

  /** 设置/清除草图平面：同步交互约束 + 半透明网格可视化（模型局部坐标） */
  setSketchPlane(plane: SketchPlane | null) {
    this._interaction.sketchPlane = plane
      ? { origin: new THREE.Vector3(...plane.origin), normal: new THREE.Vector3(...plane.normal) }
      : null

    this._viewportGuides.setSketchPlane(plane)
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

    this._viewportGuides = new ViewportGuides(
      this.scene,
      this.modelGroup,
      () => this.frameTicker.invalidate(),
    )

    this.controls = new MolControls(this.camera, this.rotationGroup, this.modelGroup, canvas)
    this.controls.rotateSpeed = CONTROLS.rotateSpeed
    this.controls.panSpeed = CONTROLS.panSpeed
    this.controls.zoomSpeed = CONTROLS.zoomSpeed

    this._molRenderer = new MoleculeRenderer(this.modelGroup, () => this.theme, () => this.frameTicker.invalidate())
    this._sceneLayer = new MoleculeSceneLayer(this.modelGroup, () => this.theme, () => this.frameTicker.invalidate())
    this._reactionHighlights = new ReactionHighlightManager(
      this.modelGroup,
      (atomId, target) => {
        const mesh = this._sceneLayer
          .aggregateAtomMeshes(this._molRenderer.atomMeshes)
          .get(atomId)
        if (!mesh) return false
        let ancestor: THREE.Object3D | null = mesh
        while (ancestor && ancestor !== this.modelGroup) {
          if (!ancestor.visible) return false
          ancestor = ancestor.parent
        }
        mesh.updateWorldMatrix(true, false)
        mesh.getWorldPosition(target)
        this.modelGroup.worldToLocal(target)
        return true
      },
      () => this.frameTicker.invalidate(),
    )
    this._unsubscribeReactionHighlights = this.frameTicker.subscribe(
      `reaction-highlights:${this._tickerKey}`,
      Phase.Gizmo,
      () => this._reactionHighlights.update(),
    )
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

    this._renderPipeline = new SceneRenderPipeline({
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera,
      rotationGroup: this.rotationGroup,
      controls: this.controls,
      canvas,
      ticker: this.frameTicker,
      tickerKey: this._tickerKey,
      viewportGuides: this._viewportGuides,
      getTheme: () => this.theme,
      getRenderStyle: () => this.renderStyle,
    })
    this.frameTicker.invalidate() // 初始帧
  }

  resize(width: number, height: number) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return
    this.renderer.setPixelRatio(window.devicePixelRatio || 1)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
    this._renderPipeline.resize(width, height)
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
    this._renderPipeline.setFovPreservingScale(profile.cameraFov)
    this.renderStyle = renderStyle
    this._viewportGuides.syncGridVisibility(profile.backgroundGrid)
    this.frameTicker.invalidate()
  }

  setTheme(theme: ResolvedTheme) {
    this.theme = theme
    this.scene.background = new THREE.Color(hexToInt(theme.scene.backgroundColor))
    this.frameTicker.invalidate()
  }

  setReactionHighlights(highlights: readonly ReactionHighlight[]): void {
    this._reactionHighlights.setHighlights(highlights)
  }

  clearReactionHighlights(): void {
    this._reactionHighlights.clear()
  }

  focusReactionHighlights(): boolean {
    const points = this._reactionHighlights.getFocusPoints()
    if (points.length === 0) return false
    const profile = resolveRenderProfile(this.renderStyle)
    this._renderPipeline.setFov(profile.cameraFov)
    CameraUtils.fitToPoints(
      points,
      this.camera,
      this.rotationGroup,
      this.modelGroup,
      profile.cameraFitMultiplier,
    )
    this.frameTicker.invalidate()
    return true
  }

  // ── 相机 / 视图 ──

  setAxesVisible(visible: boolean) {
    this._viewportGuides.setAxesVisible(visible)
  }

  setGridVisible(visible: boolean) {
    this._viewportGuides.setGridVisible(visible)
  }

  resetCamera() {
    CameraUtils.resetCamera(this.camera, this.rotationGroup, this.modelGroup)
    this.frameTicker.invalidate()
  }

  fitToMolecule(atoms: Atom[]) {
    const profile = resolveRenderProfile(this.renderStyle)
    this._renderPipeline.setFov(profile.cameraFov)
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

  projectAtomToScreen(atomId: string, w: number, h: number): { x: number; y: number } | null {
    const mesh = this._sceneLayer.aggregateAtomMeshes(this._molRenderer.atomMeshes).get(atomId)
    if (!mesh) return null
    const worldPosition = new THREE.Vector3()
    mesh.getWorldPosition(worldPosition)
    return CameraUtils.projectToScreen(worldPosition, this.camera, w, h)
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
    this.frameTicker.stopContinuous(`viewport:${this._tickerKey}`)
    this._interaction.dispose()
    this._molRenderer.dispose()
    this._sceneLayer.dispose()
    this._measureVisuals.dispose()
    this._unsubscribeReactionHighlights()
    this._reactionHighlights.dispose()
    this._viewportGuides.dispose()
    this._renderPipeline.dispose()
    this.controls.dispose()
    this.modelGroup.remove(this._measureGroup)
    this.rotationGroup.remove(this.modelGroup)
    this.scene.remove(this.rotationGroup)
    disposeObject3D(this.modelGroup)
    disposeObject3D(this.rotationGroup)
    this.renderer.dispose()
  }
}
