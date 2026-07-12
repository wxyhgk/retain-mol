import { afterEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { ticker } from '../animation'
import { MolRenderer } from './MolRenderer'

afterEach(() => {
  vi.restoreAllMocks()
})

function rendererShell(fields: Record<string, unknown>): MolRenderer {
  vi.spyOn(ticker, 'invalidate').mockImplementation(() => {})
  return Object.assign(Object.create(MolRenderer.prototype), fields) as MolRenderer
}

describe('MolRenderer viewport guides', () => {
  it('toggles axes and keeps an explicit grid setting across profile changes', () => {
    const axes = new THREE.AxesHelper(4)
    axes.visible = false
    const grid = new THREE.GridHelper(10, 10)
    const renderer = rendererShell({
      _axesHelper: axes,
      _backgroundGrid: grid,
      _gridVisibleOverride: null,
      camera: new THREE.PerspectiveCamera(60, 1, 0.1, 1000),
      renderStyle: 'realistic',
      _lastCameraFov: 60,
    })
    renderer.camera.position.set(0, 0, 16)

    renderer.setAxesVisible(true)
    expect(axes.visible).toBe(true)

    renderer.setRenderStyle('iboview')
    expect(grid.visible).toBe(false)

    renderer.setGridVisible(false)
    renderer.setRenderStyle('publication')
    expect(grid.visible).toBe(false)
  })

  it('switches style without resetting orbit or pan', () => {
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    camera.position.set(3, -2, 16)
    const rotationGroup = new THREE.Group()
    rotationGroup.position.set(2, 1, 0)
    rotationGroup.quaternion.setFromEuler(new THREE.Euler(0.2, 0.4, 0.1))
    const modelGroup = new THREE.Group()
    modelGroup.position.set(-4, 3, -1)
    const renderer = rendererShell({
      _backgroundGrid: null,
      _gridVisibleOverride: null,
      camera,
      rotationGroup,
      modelGroup,
      renderStyle: 'realistic',
      _lastCameraFov: 60,
    })
    const rotationPosition = rotationGroup.position.clone()
    const rotation = rotationGroup.quaternion.clone()
    const modelPosition = modelGroup.position.clone()
    const visibleHalfHeight = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))

    renderer.setRenderStyle('iboview')

    expect(camera.position.x).toBe(3)
    expect(camera.position.y).toBe(-2)
    expect(camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))).toBeCloseTo(visibleHalfHeight, 10)
    expect(rotationGroup.position.equals(rotationPosition)).toBe(true)
    expect(rotationGroup.quaternion.equals(rotation)).toBe(true)
    expect(modelGroup.position.equals(modelPosition)).toBe(true)
  })

  it('disposes the axes geometry and material', () => {
    const scene = new THREE.Scene()
    const rotationGroup = new THREE.Group()
    const modelGroup = new THREE.Group()
    const measureGroup = new THREE.Group()
    const axes = new THREE.AxesHelper(4)
    const grid = new THREE.GridHelper(10, 10)
    scene.add(rotationGroup, axes, grid)
    rotationGroup.add(modelGroup)
    modelGroup.add(measureGroup)

    const geometryDispose = vi.spyOn(axes.geometry, 'dispose')
    const axesMaterials = Array.isArray(axes.material) ? axes.material : [axes.material]
    const materialDisposes = axesMaterials.map(material => vi.spyOn(material, 'dispose'))
    const renderer = rendererShell({
      scene,
      rotationGroup,
      modelGroup,
      _measureGroup: measureGroup,
      _unsubTicker: vi.fn(),
      _interaction: { dispose: vi.fn() },
      _molRenderer: { dispose: vi.fn() },
      _sceneLayer: { dispose: vi.fn() },
      _measureVisuals: { dispose: vi.fn() },
      _sketchGrid: null,
      _backgroundGrid: grid,
      _axesHelper: axes,
      _lights: null,
      controls: { dispose: vi.fn() },
      _dof: null,
      renderer: { dispose: vi.fn() },
    })

    renderer.dispose()

    expect(axes.parent).toBeNull()
    expect(geometryDispose).toHaveBeenCalledOnce()
    materialDisposes.forEach(dispose => expect(dispose).toHaveBeenCalledOnce())
  })
})
