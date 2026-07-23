import { afterEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import type { MolRenderer } from './MolRenderer'
import { BondPairAlignmentGizmoController } from './BondPairAlignmentGizmoController'
import type { BondPairGizmoGeometry } from '../bondPairGizmo'

class FakeCanvas extends EventTarget {
  readonly style = { cursor: '' }
  readonly released: number[] = []
  private readonly captured = new Set<number>()

  setPointerCapture(pointerId: number) { this.captured.add(pointerId) }
  releasePointerCapture(pointerId: number) {
    this.captured.delete(pointerId)
    this.released.push(pointerId)
  }
  hasPointerCapture(pointerId: number) { return this.captured.has(pointerId) }
  getBoundingClientRect() {
    return { left: 0, top: 0, width: 800, height: 600 }
  }
}

function pointerEvent(
  type: string,
  pointerId: number,
  clientX: number,
  clientY: number,
  modifiers: { shiftKey?: boolean; altKey?: boolean } = {},
): Event {
  const event = new Event(type, { cancelable: true })
  Object.defineProperties(event, {
    pointerId: { value: pointerId },
    button: { value: 0 },
    clientX: { value: clientX },
    clientY: { value: clientY },
    shiftKey: { value: modifiers.shiftKey ?? false },
    altKey: { value: modifiers.altKey ?? false },
  })
  return event
}

function keyboardEvent(key: string): Event {
  const event = new Event('keydown', { cancelable: true })
  Object.defineProperty(event, 'key', { value: key })
  return event
}

function stubCanvasDocument() {
  const context = {
    clearRect: vi.fn(),
    strokeText: vi.fn(),
    fillText: vi.fn(),
    font: '',
    textAlign: '',
    textBaseline: '',
    lineWidth: 0,
    strokeStyle: '',
    fillStyle: '',
  }
  vi.stubGlobal('document', {
    createElement: () => ({
      width: 0,
      height: 0,
      getContext: () => context,
    }),
  })
}

function createHarness(hit: 'azimuth' | 'axis-angle' = 'azimuth') {
  stubCanvasDocument()
  const fakeWindow = new EventTarget()
  vi.stubGlobal('window', fakeWindow)
  const canvas = new FakeCanvas()
  const scene = new THREE.Scene()
  const modelGroup = new THREE.Group()
  scene.add(modelGroup)
  const camera = new THREE.PerspectiveCamera(45, 4 / 3, 0.1, 100)
  camera.position.set(0, 0, 5)
  camera.updateProjectionMatrix()
  camera.updateMatrixWorld(true)
  const controls = { enabled: true }
  const renderer = {
    scene,
    modelGroup,
    camera,
    canvas,
    controls,
    canDragAtom: () => true,
  } as unknown as MolRenderer
  let topologySignature = 'initial'
  const snapshot = (): BondPairGizmoGeometry => ({
    value: {
      distance: 2,
      axisAngleDegrees: 90,
      azimuthDegrees: 0,
      coplanar: false,
    },
    referenceOther: [-1, 0, 0],
    referenceAnchor: [0, 0, 0],
    movingAnchor: [0, 2, 0],
    movingOther: [0, 2, 1],
    movingAtomIds: new Set(['b1', 'b2']),
    movingObjectId: 'moving',
    topologySignature,
  })
  const phases: string[] = []
  const previews: number[] = []
  const errors: string[] = []
  const scheduler = {
    invalidate: vi.fn(),
    startContinuous: vi.fn(),
    stopContinuous: vi.fn(),
  }
  let hitKind: 'azimuth' | 'axis-angle' | null = hit
  const controller = new BondPairAlignmentGizmoController(
    renderer,
    'both',
    true,
    {
      getSnapshot: () => ({ ok: true, snapshot: snapshot() }),
      start: () => phases.push('start'),
      preview: value => {
        phases.push('preview')
        previews.push(hit === 'azimuth' ? value.azimuthDegrees : value.axisAngleDegrees)
        return true
      },
      commit: () => phases.push('commit'),
      cancel: () => phases.push('cancel'),
      error: error => errors.push(error.code),
    },
    scheduler,
  )
  ;(controller as unknown as { hitTest: () => typeof hitKind }).hitTest = () => hitKind
  controller.update()
  return {
    canvas,
    controls,
    controller,
    errors,
    fakeWindow,
    phases,
    previews,
    scheduler,
    setHit: (next: typeof hitKind) => { hitKind = next },
    changeTopology: () => { topologySignature = 'changed' },
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('BondPairAlignmentGizmoController interactions', () => {
  it('leaves camera controls untouched when pointerdown misses the gizmo', () => {
    const harness = createHarness()
    harness.setHit(null)
    harness.canvas.dispatchEvent(pointerEvent('pointerdown', 2, 20, 20))

    expect(harness.controls.enabled).toBe(true)
    expect(harness.phases).toEqual([])
    expect(harness.scheduler.startContinuous).not.toHaveBeenCalled()
    harness.controller.dispose()
  })

  it('captures only a hit drag, disables camera, previews continuously, and commits once', () => {
    const harness = createHarness('azimuth')
    harness.canvas.dispatchEvent(pointerEvent('pointerdown', 4, 500, 300))
    expect(harness.controls.enabled).toBe(false)

    for (let index = 1; index <= 100; index += 1) {
      const angle = index * Math.PI / 100
      harness.fakeWindow.dispatchEvent(pointerEvent(
        'pointermove',
        4,
        400 + Math.cos(angle) * 100,
        300 + Math.sin(angle) * 100,
      ))
    }
    harness.fakeWindow.dispatchEvent(pointerEvent('pointerup', 4, 300, 300))

    expect(harness.previews).toHaveLength(100)
    expect(harness.phases[0]).toBe('start')
    expect(harness.phases.at(-1)).toBe('commit')
    expect(harness.phases.filter(phase => phase === 'commit')).toHaveLength(1)
    expect(harness.controls.enabled).toBe(true)
    expect(harness.canvas.released).toEqual([4])
    expect(harness.scheduler.startContinuous).toHaveBeenCalledOnce()
    expect(harness.scheduler.stopContinuous).toHaveBeenCalledOnce()
    harness.controller.dispose()
  })

  it.each(['pointercancel', 'escape'] as const)('%s restores through cancel', termination => {
    const harness = createHarness('axis-angle')
    harness.canvas.dispatchEvent(pointerEvent('pointerdown', 7, 500, 300))
    harness.fakeWindow.dispatchEvent(pointerEvent('pointermove', 7, 400, 400))

    if (termination === 'pointercancel') {
      harness.canvas.dispatchEvent(pointerEvent('pointercancel', 7, 400, 400))
    } else {
      harness.fakeWindow.dispatchEvent(keyboardEvent('Escape'))
    }

    expect(harness.phases.at(-1)).toBe('cancel')
    expect(harness.phases).not.toContain('commit')
    expect(harness.controls.enabled).toBe(true)
    harness.controller.dispose()
  })

  it('cancels and reports when topology changes during a drag', () => {
    const harness = createHarness()
    harness.canvas.dispatchEvent(pointerEvent('pointerdown', 9, 500, 300))
    harness.changeTopology()
    harness.controller.update()

    expect(harness.phases.at(-1)).toBe('cancel')
    expect(harness.errors).toEqual(['topology-changed'])
    expect(harness.controls.enabled).toBe(true)
    harness.controller.dispose()
  })

  it('double-clicking the azimuth ring resets φ to zero in one transaction', () => {
    const harness = createHarness('azimuth')
    harness.canvas.dispatchEvent(pointerEvent('pointerdown', 12, 500, 300))
    harness.fakeWindow.dispatchEvent(pointerEvent('pointermove', 12, 400, 400))
    harness.fakeWindow.dispatchEvent(pointerEvent('pointerup', 12, 400, 400))
    expect(harness.previews.at(-1)).not.toBe(0)

    harness.canvas.dispatchEvent(pointerEvent('dblclick', 13, 500, 300))

    expect(harness.previews.at(-1)).toBe(0)
    expect(harness.phases.filter(phase => phase === 'commit')).toHaveLength(2)
    harness.controller.dispose()
  })
})
