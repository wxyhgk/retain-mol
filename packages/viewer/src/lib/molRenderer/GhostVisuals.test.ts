import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { ticker } from '../animation'
import { GhostVisuals } from './GhostVisuals'

function createVisuals() {
  const group = new THREE.Group()
  const camera = new THREE.PerspectiveCamera()
  const canvas = new EventTarget() as HTMLCanvasElement
  const visuals = new GhostVisuals(canvas, camera, group)
  return { group, visuals }
}

function currentLine(visuals: GhostVisuals): THREE.Line {
  return (visuals as unknown as { line: THREE.Line | null }).line as THREE.Line
}

describe('GhostVisuals line resources', () => {
  beforeEach(() => {
    vi.spyOn(ticker, 'invalidate').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reuses one dynamic position attribute across repeated pointer updates', () => {
    const { visuals } = createVisuals()
    visuals.setLineStart(new THREE.Vector3(1, 2, 3))
    const line = currentLine(visuals)
    const position = line.geometry.getAttribute('position') as THREE.BufferAttribute

    expect(position.usage).toBe(THREE.DynamicDrawUsage)
    for (let i = 0; i < 100; i++) {
      visuals.updateLine(new THREE.Vector3(i, i + 1, i + 2), i % 2 === 0)
      expect(line.geometry.getAttribute('position')).toBe(position)
    }

    expect(position.getX(0)).toBe(1)
    expect(position.getY(0)).toBe(2)
    expect(position.getZ(0)).toBe(3)
    expect(position.getX(1)).toBe(99)
    expect(position.getY(1)).toBe(100)
    expect(position.getZ(1)).toBe(101)
    visuals.dispose()
  })

  it('disposes line geometry and material exactly once when cleared', () => {
    const { group, visuals } = createVisuals()
    visuals.setLineStart(new THREE.Vector3())
    const line = currentLine(visuals)
    const geometryDispose = vi.spyOn(line.geometry, 'dispose')
    const material = line.material as THREE.Material
    const materialDispose = vi.spyOn(material, 'dispose')

    visuals.clear()
    visuals.clear()
    visuals.dispose()

    expect(group.children).toHaveLength(0)
    expect(geometryDispose).toHaveBeenCalledTimes(1)
    expect(materialDispose).toHaveBeenCalledTimes(1)
  })

  it('releases the previous line before creating a replacement', () => {
    const { visuals } = createVisuals()
    visuals.setLineStart(new THREE.Vector3())
    const previous = currentLine(visuals)
    const geometryDispose = vi.spyOn(previous.geometry, 'dispose')
    const materialDispose = vi.spyOn(previous.material as THREE.Material, 'dispose')

    visuals.setLineStart(new THREE.Vector3(4, 5, 6))

    expect(currentLine(visuals)).not.toBe(previous)
    expect(geometryDispose).toHaveBeenCalledTimes(1)
    expect(materialDispose).toHaveBeenCalledTimes(1)
    visuals.dispose()
  })
})
