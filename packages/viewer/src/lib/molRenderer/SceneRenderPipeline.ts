import * as THREE from 'three'
import { CAMERA } from '../../config/camera.config'
import type { ResolvedTheme } from '../../presets'
import { resolveRenderProfile, type RenderStyle } from '../../styles'
import type { Ticker } from '../animation'
import { Phase } from '../animation'
import type { MolControls } from '../controls/MolControls'
import * as CameraUtils from './CameraUtils'
import { DepthOfField } from './postprocessing'
import {
  makeDepthFog,
  setupLights,
  syncDepthFog,
  syncLightsForProfile,
  type LightRig,
} from './sceneRig'
import type { ViewportGuides } from './ViewportGuides'

interface Options {
  readonly renderer: THREE.WebGLRenderer
  readonly scene: THREE.Scene
  readonly camera: THREE.PerspectiveCamera
  readonly rotationGroup: THREE.Group
  readonly controls: MolControls
  readonly canvas: HTMLCanvasElement
  readonly ticker: Ticker
  readonly tickerKey: string
  readonly viewportGuides: ViewportGuides
  readonly getTheme: () => ResolvedTheme
  readonly getRenderStyle: () => RenderStyle
}

/** Owns the per-frame lighting, fog, depth-of-field and WebGL render pipeline. */
export class SceneRenderPipeline {
  private readonly lights: LightRig
  private readonly depthOfField: DepthOfField | null
  private readonly unsubscribe: () => void
  private lastCameraFov = CAMERA.fov

  constructor(private readonly options: Options) {
    const { renderer, scene, camera, canvas, ticker, tickerKey } = options
    scene.fog = makeDepthFog(this.backgroundColor)
    this.depthOfField = DepthOfField.create(
      renderer,
      scene,
      camera,
      canvas.clientWidth,
      canvas.clientHeight,
    )
    this.lights = setupLights(scene)
    this.unsubscribe = ticker.subscribe(tickerKey, Phase.Render, () => this.renderFrame())
  }

  setFovPreservingScale(fov: number) {
    CameraUtils.setFovPreservingScale(this.options.camera, fov)
    this.lastCameraFov = fov
  }

  setFov(fov: number) {
    if (Math.abs(this.options.camera.fov - fov) <= 1e-6) return
    this.options.camera.fov = fov
    this.options.camera.updateProjectionMatrix()
    this.lastCameraFov = fov
  }

  resize(width: number, height: number) {
    this.depthOfField?.setSize(width, height)
  }

  dispose() {
    this.unsubscribe()
    this.depthOfField?.dispose()
    this.lights.key.shadow.map?.dispose()
    this.lights.fill.shadow.map?.dispose()
    this.lights.rim.shadow.map?.dispose()
    this.options.scene.remove(
      this.lights.ambient,
      this.lights.key,
      this.lights.fill,
      this.lights.rim,
    )
  }

  private renderFrame() {
    const { renderer, scene, camera, rotationGroup, controls, viewportGuides } = this.options
    controls.update()
    const profile = resolveRenderProfile(this.options.getRenderStyle())
    viewportGuides.syncGridVisibility(profile.backgroundGrid)
    syncLightsForProfile(this.lights, profile)

    if (Math.abs(camera.fov - profile.cameraFov) > 1e-6 || this.lastCameraFov !== profile.cameraFov) {
      this.setFovPreservingScale(profile.cameraFov)
    }

    const pivot = new THREE.Vector3()
    rotationGroup.getWorldPosition(pivot)
    const distance = camera.position.distanceTo(pivot)
    if (profile.depthCue.mode === 'three-fog') {
      if (!scene.fog) scene.fog = makeDepthFog(this.backgroundColor)
      syncDepthFog(scene.fog as THREE.Fog, distance, scene.background)
    } else {
      scene.fog = null
    }

    if (this.depthOfField) this.depthOfField.render(distance)
    else renderer.render(scene, camera)
  }

  private get backgroundColor() {
    return Number.parseInt(this.options.getTheme().scene.backgroundColor.replace('#', ''), 16)
  }
}
