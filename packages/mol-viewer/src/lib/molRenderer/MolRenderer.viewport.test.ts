import { afterEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { ticker } from '../animation'
import { MolRenderer } from './MolRenderer'
import * as CameraUtils from './CameraUtils'

afterEach(() => {
  vi.restoreAllMocks()
})

function rendererShell(fields: Record<string, unknown>): MolRenderer {
  vi.spyOn(ticker, 'invalidate').mockImplementation(() => {})
  return Object.assign(Object.create(MolRenderer.prototype), fields) as MolRenderer
}

describe('MolRenderer viewport guides', () => {
  it('toggles axes and keeps an explicit grid setting across profile changes', () => {
    const viewportGuides = {
      setAxesVisible: vi.fn(),
      setGridVisible: vi.fn(),
      syncGridVisibility: vi.fn(),
    }
    const renderer = rendererShell({
      _viewportGuides: viewportGuides,
      camera: new THREE.PerspectiveCamera(60, 1, 0.1, 1000),
      renderStyle: 'realistic',
      _renderPipeline: { setFovPreservingScale: vi.fn() },
    })
    renderer.camera.position.set(0, 0, 16)

    renderer.setAxesVisible(true)
    expect(viewportGuides.setAxesVisible).toHaveBeenCalledWith(true)

    renderer.setRenderStyle('iboview')
    expect(viewportGuides.syncGridVisibility).toHaveBeenCalledWith(false)

    renderer.setGridVisible(false)
    renderer.setRenderStyle('publication')
    expect(viewportGuides.setGridVisible).toHaveBeenCalledWith(false)
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
      _viewportGuides: { syncGridVisibility: vi.fn() },
      camera,
      rotationGroup,
      modelGroup,
      renderStyle: 'realistic',
      _renderPipeline: {
        setFovPreservingScale: (fov: number) => CameraUtils.setFovPreservingScale(camera, fov),
      },
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

})
