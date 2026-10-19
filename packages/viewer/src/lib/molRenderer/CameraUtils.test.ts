import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { setFovPreservingScale } from './CameraUtils'

describe('setFovPreservingScale', () => {
  it('preserves projected scale when changing render-profile FOV', () => {
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
    camera.position.set(0, 0, 12)
    const projectedHeightBefore = 12 * Math.tan(THREE.MathUtils.degToRad(45 / 2))

    setFovPreservingScale(camera, 12)

    const projectedHeightAfter = camera.position.z * Math.tan(THREE.MathUtils.degToRad(12 / 2))
    expect(projectedHeightAfter).toBeCloseTo(projectedHeightBefore, 10)
    expect(camera.fov).toBe(12)
  })

  it('round-trips camera distance without touching lateral pan', () => {
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
    camera.position.set(3, -2, 18)

    setFovPreservingScale(camera, 12)
    setFovPreservingScale(camera, 45)

    expect(camera.position.x).toBe(3)
    expect(camera.position.y).toBe(-2)
    expect(camera.position.z).toBeCloseTo(18, 10)
  })
})
