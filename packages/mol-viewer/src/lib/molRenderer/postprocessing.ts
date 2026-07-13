import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
import { CAMERA } from '../../config/camera.config'
import { DOF } from '../../config/render.config'

/**
 * 景深（虚实）后处理：MSAA 渲染目标保住抗锯齿，BokehPass 做散焦。
 * 每帧调用 render(focusDist) 设置对焦距离并出图。
 * DOF.enabled=false 时 create() 返回 null（调用方回退到直接 renderer.render）。
 */
export class DepthOfField {
  private constructor(
    private composer: EffectComposer,
    private bokeh: BokehPass,
  ) {}

  static create(
    renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera,
    width: number, height: number,
  ): DepthOfField | null {
    if (!DOF.enabled) return null
    const dpr = window.devicePixelRatio
    const rt = new THREE.WebGLRenderTarget(width * dpr, height * dpr, { samples: DOF.samples })
    const composer = new EffectComposer(renderer, rt)
    composer.setPixelRatio(dpr)
    composer.setSize(width, height)
    composer.addPass(new RenderPass(scene, camera))
    const bokeh = new BokehPass(scene, camera, {
      focus: CAMERA.initialZ,
      aperture: DOF.aperture,
      maxblur: DOF.maxblur,
    })
    composer.addPass(bokeh)
    return new DepthOfField(composer, bokeh)
  }

  setSize(width: number, height: number) {
    this.composer.setSize(width, height)
  }

  /** 设置对焦距离并渲染当前帧。 */
  render(focusDist: number) {
    const uniforms = this.bokeh.uniforms
    if (!('focus' in uniforms)) throw new Error('BokehPass is missing the focus uniform')
    const focusUniform = uniforms.focus
    if (!focusUniform || typeof focusUniform !== 'object' || !('value' in focusUniform)) {
      throw new Error('BokehPass has an invalid focus uniform')
    }
    focusUniform.value = focusDist
    this.composer.render()
  }

  dispose() {
    this.composer.dispose()
  }
}
