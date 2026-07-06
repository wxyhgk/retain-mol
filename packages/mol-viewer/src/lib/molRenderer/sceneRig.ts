import * as THREE from 'three'
import { CAMERA } from '../../config/camera.config'
import { LIGHTING, FOG } from '../../config/render.config'

/** 环境光 + 主光（左上、投影）+ 补光。 */
export function setupLights(scene: THREE.Scene) {
  scene.add(new THREE.AmbientLight(LIGHTING.ambient.color, LIGHTING.ambient.intensity))
  const key = new THREE.DirectionalLight(LIGHTING.keyLight.color, LIGHTING.keyLight.intensity)
  key.position.set(...LIGHTING.keyLight.position)
  key.castShadow = true
  scene.add(key)
  const fill = new THREE.DirectionalLight(LIGHTING.fillLight.color, LIGHTING.fillLight.intensity)
  fill.position.set(...LIGHTING.fillLight.position)
  scene.add(fill)
}

/** 极淡背景网格：不影响分子渲染，仅提供地面参考。 */
export function addBackgroundGrid(scene: THREE.Scene) {
  const grid = new THREE.GridHelper(50, 50, 0xe5e7eb, 0xe5e7eb)
  grid.position.y = -3
  const gridMat = grid.material as THREE.LineBasicMaterial | THREE.LineBasicMaterial[]
  ;(Array.isArray(gridMat) ? gridMat : [gridMat]).forEach(m => { m.opacity = 0.4; m.transparent = true })
  scene.add(grid)
}

/** 深度雾化：从注视点往后逐渐变淡，提供前后深度线索。 */
export function makeDepthFog(backgroundColor: number): THREE.Fog {
  return new THREE.Fog(backgroundColor, CAMERA.initialZ, CAMERA.initialZ + FOG.farOffset)
}

/**
 * 每帧同步雾的 near/far（跟随相机-注视点距离 dist）与雾色（跟随场景背景）。
 * dist 由调用方算出后复用给景深对焦。
 */
export function syncDepthFog(fog: THREE.Fog, dist: number, background: THREE.Color | THREE.Texture | null) {
  fog.near = dist + FOG.nearOffset
  fog.far  = dist + FOG.farOffset
  if (background instanceof THREE.Color) fog.color.copy(background)
}
