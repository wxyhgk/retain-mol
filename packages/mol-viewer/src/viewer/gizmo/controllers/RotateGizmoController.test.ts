import { afterEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import type { MolRenderer } from '../../../lib/molRenderer/MolRenderer'
import { RotateGizmoController } from './RotateGizmoController'
import { ticker } from '../../../lib/animation'

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

function pointerEvent(type: string, pointerId: number): Event {
  const event = new Event(type)
  Object.defineProperties(event, {
    pointerId: { value: pointerId },
    button: { value: 0 },
    clientX: { value: 0 },
    clientY: { value: 0 },
  })
  return event
}

function createController() {
  const fakeWindow = new EventTarget()
  vi.stubGlobal('window', fakeWindow)
  vi.stubGlobal('requestAnimationFrame', () => 1)
  vi.stubGlobal('cancelAnimationFrame', () => undefined)

  const canvas = new FakeCanvas()
  const scene = new THREE.Scene()
  const modelGroup = new THREE.Group()
  scene.add(modelGroup)
  const controls = { enabled: false }
  const renderer = {
    scene,
    modelGroup,
    camera: new THREE.PerspectiveCamera(),
    canvas,
    controls,
    canDragAtom: () => true,
  } as unknown as MolRenderer
  const molecule = {
    atoms: [
      { id: 'a1', symbol: 'C', x: 0, y: 0, z: 0 },
      { id: 'a2', symbol: 'C', x: 1.4, y: 0, z: 0 },
    ],
    bonds: [{ id: 'b1', atomId1: 'a1', atomId2: 'a2', order: 1 as const }],
  }
  const calls: string[] = []
  const controller = new RotateGizmoController(
    renderer,
    new Set(['a1']),
    new Set(['b1']),
    {
      getMolecule: () => molecule,
      setAtomPositions: () => calls.push('write'),
      startEditSession: () => calls.push('start'),
      endEditSession: () => calls.push('end'),
    },
  )
  return { canvas, controls, controller, calls, fakeWindow }
}

function setActiveDrag(controller: RotateGizmoController, canvas: FakeCanvas, pointerId: number) {
  const mutable = controller as unknown as {
    rings: Array<{ dragAngle: number }>
    drag: { pointerId: number; ring: { dragAngle: number } } | null
  }
  mutable.rings[0].dragAngle = 0.5
  mutable.drag = { pointerId, ring: mutable.rings[0] }
  canvas.setPointerCapture(pointerId)
  return mutable
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('RotateGizmoController lifecycle', () => {
  it('ends an active edit session and releases capture when disposed', () => {
    const { canvas, controls, controller, calls } = createController()
    const mutable = setActiveDrag(controller, canvas, 7)

    controller.dispose()

    expect(calls).toEqual(['end'])
    expect(mutable.drag).toBeNull()
    expect(controls.enabled).toBe(true)
    expect(canvas.released).toEqual([7])
  })

  it.each(['pointercancel', 'blur'] as const)(
    'uses the shared cleanup path for %s without writing zero positions',
    (termination) => {
      const { canvas, controls, controller, calls, fakeWindow } = createController()
      const stop = vi.spyOn(ticker, 'stopContinuous')
      const mutable = setActiveDrag(controller, canvas, 9)

      if (termination === 'blur') fakeWindow.dispatchEvent(new Event('blur'))
      else canvas.dispatchEvent(pointerEvent('pointercancel', 9))
      canvas.dispatchEvent(pointerEvent('lostpointercapture', 9))
      fakeWindow.dispatchEvent(pointerEvent('pointerup', 9))

      expect(calls).toEqual(['end'])
      expect(mutable.drag).toBeNull()
      expect(controls.enabled).toBe(true)
      expect(canvas.released).toEqual([9])
      expect(stop).toHaveBeenCalledWith('gizmo-drag')
      controller.dispose()
    },
  )

  it('handles lost pointer capture without trying to release it again', () => {
    const { canvas, controls, controller, calls } = createController()
    const mutable = setActiveDrag(controller, canvas, 11)

    canvas.dispatchEvent(pointerEvent('lostpointercapture', 11))

    expect(calls).toEqual(['end'])
    expect(mutable.drag).toBeNull()
    expect(controls.enabled).toBe(true)
    expect(canvas.released).toEqual([])
    controller.dispose()
  })

  it('finishes the active pointer on normal pointerup and suppresses its click', () => {
    const { canvas, controls, controller, calls, fakeWindow } = createController()
    const mutable = setActiveDrag(controller, canvas, 12) as ReturnType<typeof setActiveDrag> & {
      suppressNextClick: boolean
    }

    fakeWindow.dispatchEvent(pointerEvent('pointerup', 12))

    expect(calls).toEqual(['end'])
    expect(mutable.drag).toBeNull()
    expect(mutable.suppressNextClick).toBe(true)
    expect(controls.enabled).toBe(true)
    expect(canvas.released).toEqual([12])
    controller.dispose()
  })

  it('ignores termination events from a non-active pointer', () => {
    const { canvas, controller, calls, fakeWindow } = createController()
    const mutable = setActiveDrag(controller, canvas, 13)

    canvas.dispatchEvent(pointerEvent('pointercancel', 99))
    canvas.dispatchEvent(pointerEvent('lostpointercapture', 99))
    fakeWindow.dispatchEvent(pointerEvent('pointerup', 99))

    expect(calls).toEqual([])
    expect(mutable.drag).not.toBeNull()

    canvas.dispatchEvent(pointerEvent('pointercancel', 13))
    expect(calls).toEqual(['end'])
    controller.dispose()
  })
})
