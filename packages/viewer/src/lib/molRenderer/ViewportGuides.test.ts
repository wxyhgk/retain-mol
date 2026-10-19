import { describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { ViewportGuides } from './ViewportGuides'

describe('ViewportGuides', () => {
  it('applies an explicit grid override across profile changes', () => {
    const scene = new THREE.Scene()
    const modelGroup = new THREE.Group()
    scene.add(modelGroup)
    const guides = new ViewportGuides(scene, modelGroup, vi.fn())

    guides.syncGridVisibility(false)
    const grid = scene.children.find(child => child instanceof THREE.GridHelper)
    expect(grid?.visible).toBe(false)

    guides.setGridVisible(true)
    guides.syncGridVisibility(false)
    expect(grid?.visible).toBe(true)
    guides.dispose()
  })

  it('owns and disposes axes and sketch-grid resources', () => {
    const scene = new THREE.Scene()
    const modelGroup = new THREE.Group()
    scene.add(modelGroup)
    const guides = new ViewportGuides(scene, modelGroup, vi.fn())
    const axes = scene.children.find(child => child instanceof THREE.AxesHelper) as THREE.AxesHelper
    const axesGeometryDispose = vi.spyOn(axes.geometry, 'dispose')

    guides.setSketchPlane({ origin: [0, 0, 0], normal: [0, 0, 1] })
    expect(modelGroup.children.some(child => child instanceof THREE.GridHelper)).toBe(true)

    guides.dispose()
    expect(axes.parent).toBeNull()
    expect(axesGeometryDispose).toHaveBeenCalledOnce()
    expect(modelGroup.children.some(child => child instanceof THREE.GridHelper)).toBe(false)
  })
})
