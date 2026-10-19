import * as THREE from 'three'
import { CAMERA } from '../../config/camera.config'
import { LIGHTING, FOG, BACKGROUND_GRID } from '../../config/render.config'
import type { ResolvedRenderProfile } from '../../styles'

/** 环境光 + 主光（左上、投影）+ 补光。 */
export interface LightRig {
  ambient: THREE.AmbientLight
  key: THREE.DirectionalLight
  fill: THREE.DirectionalLight
  rim: THREE.DirectionalLight
}

export function setupLights(scene: THREE.Scene): LightRig {
  const ambient = new THREE.AmbientLight(LIGHTING.ambient.color, LIGHTING.ambient.intensity)
  scene.add(ambient)
  const key = new THREE.DirectionalLight(LIGHTING.keyLight.color, LIGHTING.keyLight.intensity)
  key.position.set(...LIGHTING.keyLight.position)
  key.castShadow = true
  scene.add(key)
  const fill = new THREE.DirectionalLight(LIGHTING.fillLight.color, LIGHTING.fillLight.intensity)
  fill.position.set(...LIGHTING.fillLight.position)
  scene.add(fill)
  const rim = new THREE.DirectionalLight(LIGHTING.rimLight.color, LIGHTING.rimLight.intensity)
  rim.position.set(...LIGHTING.rimLight.position)
  scene.add(rim)
  return { ambient, key, fill, rim }
}

export function syncLightsForProfile(lights: LightRig, profile: ResolvedRenderProfile) {
  const values = profile.lighting
  lights.ambient.color.setHex(values.ambient.color)
  lights.ambient.intensity = values.ambient.intensity
  lights.key.color.setHex(values.key.color)
  lights.key.intensity = values.key.intensity
  lights.key.position.set(values.key.position[0], values.key.position[1], values.key.position[2])
  lights.fill.color.setHex(values.fill.color)
  lights.fill.intensity = values.fill.intensity
  lights.fill.position.set(values.fill.position[0], values.fill.position[1], values.fill.position[2])
  lights.rim.color.setHex(values.rim.color)
  lights.rim.intensity = values.rim.intensity
  lights.rim.position.set(values.rim.position[0], values.rim.position[1], values.rim.position[2])
}

/** 极淡背景网格：不影响分子渲染，仅提供地面参考。 */
export function addBackgroundGrid(scene: THREE.Scene): THREE.GridHelper {
  const g = BACKGROUND_GRID
  const grid = new THREE.GridHelper(g.size, g.divisions, g.color, g.color)
  grid.position.y = g.y
  const gridMat = grid.material as THREE.LineBasicMaterial | THREE.LineBasicMaterial[]
  ;(Array.isArray(gridMat) ? gridMat : [gridMat]).forEach(m => { m.opacity = g.opacity; m.transparent = true })
  scene.add(grid)
  return grid
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
  fog.near = Math.max(CAMERA.near, dist + FOG.nearOffset)
  fog.far  = Math.max(fog.near + 1, dist + FOG.farOffset)
  if (background instanceof THREE.Color) fog.color.copy(background)
}
