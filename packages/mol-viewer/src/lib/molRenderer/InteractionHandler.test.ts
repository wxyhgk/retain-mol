import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import type { MolControls } from '../controls/MolControls'
import { InteractionHandler } from './InteractionHandler'
import { collectPickableBondObjects } from './InteractionPicker'
import type { InteractionGestureState } from './interactionGestureState'

class FakeCanvas extends EventTarget {
  readonly style = { cursor: '' }
  private readonly capturedPointers = new Set<number>()

  capture(pointerId: number) {
    this.capturedPointers.add(pointerId)
  }

  setPointerCapture(pointerId: number) {
    this.capture(pointerId)
  }

  getBoundingClientRect() {
    return { left: 0, top: 0, width: 100, height: 100 }
  }

  hasPointerCapture(pointerId: number): boolean {
    return this.capturedPointers.has(pointerId)
  }

  releasePointerCapture(pointerId: number) {
    this.capturedPointers.delete(pointerId)
  }
}

function dispatchAtomPointerDown(
  handler: InteractionHandler,
  atomId: string,
  pointerId = 1,
) {
  const object = new THREE.Object3D()
  object.userData = { id: atomId }
  const mutable = handler as unknown as {
    _picker: { atomHitAt: () => { object: THREE.Object3D } }
    handlePointerDown: (event: PointerEvent) => void
  }
  mutable._picker = { atomHitAt: () => ({ object }) }
  mutable.handlePointerDown({
    button: 0,
    clientX: 0,
    clientY: 0,
    pointerId,
    stopImmediatePropagation: () => undefined,
  } as unknown as PointerEvent)
}

function dispatchPointerMove(handler: InteractionHandler, clientX: number, clientY = 0) {
  ;(handler as unknown as {
    handlePointerMove: (event: PointerEvent) => void
  }).handlePointerMove({ clientX, clientY, shiftKey: false } as PointerEvent)
}

function createHandler() {
  const canvas = new FakeCanvas()
  const controls = { enabled: false } as MolControls
  const handler = new InteractionHandler(
    canvas as unknown as HTMLCanvasElement,
    new THREE.PerspectiveCamera(),
    new THREE.Group(),
    new THREE.Group(),
    controls,
    () => new Map(),
    () => new Map(),
  )
  return { canvas, controls, handler }
}

function setActiveAtomDrag(
  handler: InteractionHandler,
  canvas: FakeCanvas,
  atomId: string,
  pointerId: number,
) {
  canvas.capture(pointerId)
  const mutable = handler as unknown as {
    _gesture: InteractionGestureState
    _activePointerId: number | null
  }
  mutable._gesture = { kind: 'atom-drag', atomId, down: { x: 0, y: 0 } }
  mutable._activePointerId = pointerId
}

function queueAtomClick(
  handler: InteractionHandler,
  atomId: string,
  input: { timeStamp: number; clientX?: number; clientY?: number; detail?: number },
) {
  const event = {
    clientX: input.clientX ?? 10,
    clientY: input.clientY ?? 10,
    detail: input.detail ?? 1,
    timeStamp: input.timeStamp,
  } as MouseEvent
  ;(handler as unknown as {
    handleAtomClickCandidate: (id: string, event: MouseEvent) => void
  }).handleAtomClickCandidate(atomId, event)
}

function dispatchEmptyPointerDown(handler: InteractionHandler, pointerId = 1) {
  const mutable = handler as unknown as {
    _picker: { atomHitAt: () => null }
    handlePointerDown: (event: PointerEvent) => void
  }
  mutable._picker = { atomHitAt: () => null }
  mutable.handlePointerDown({
    button: 0,
    clientX: 0,
    clientY: 0,
    pointerId,
    stopImmediatePropagation: () => undefined,
  } as unknown as PointerEvent)
}

function driveCanvasClick(
  handler: InteractionHandler,
  picker: { atomIdAt: () => string | null; bondIdAt: () => string | null },
) {
  const mutable = handler as unknown as {
    _picker: { atomIdAt: () => string | null; bondIdAt: () => string | null }
    handleClick: (event: MouseEvent) => void
  }
  mutable._picker = picker
  mutable.handleClick({ clientX: 1, clientY: 1 } as MouseEvent)
}

describe('InteractionHandler lifecycle', () => {
  it('cancels atom drag state before edit callbacks are detached', () => {
    const { canvas, controls, handler } = createHandler()
    const ended: string[] = []
    handler.onAtomDragCancel = atomId => ended.push(atomId)
    setActiveAtomDrag(handler, canvas, 'a1', 7)

    handler.cancelActiveGesture()
    handler.cancelActiveGesture()

    expect(ended).toEqual(['a1'])
    expect(canvas.hasPointerCapture(7)).toBe(false)
    expect(controls.enabled).toBe(true)
    handler.dispose()
  })

  it('cancels an active atom drag during dispose', () => {
    const { canvas, handler } = createHandler()
    const ended: string[] = []
    handler.onAtomDragCancel = atomId => ended.push(atomId)
    setActiveAtomDrag(handler, canvas, 'a2', 9)

    handler.dispose()

    expect(ended).toEqual(['a2'])
    expect(canvas.hasPointerCapture(9)).toBe(false)
  })
})

describe('InteractionHandler deferred builder sessions', () => {
  it('does not begin bond editing until the drag threshold is crossed', () => {
    const { handler } = createHandler()
    const canStart = vi.fn(() => true)
    const begin = vi.fn(() => false)
    handler.canStartBondDrag = canStart
    handler.onBondDragStart = begin

    dispatchAtomPointerDown(handler, 'a1')
    expect(canStart).toHaveBeenCalledWith('a1')
    expect(begin).not.toHaveBeenCalled()

    dispatchPointerMove(handler, 1)
    expect(begin).not.toHaveBeenCalled()

    dispatchPointerMove(handler, 10)
    expect(begin).toHaveBeenCalledTimes(1)
    expect(begin).toHaveBeenCalledWith('a1')
    handler.dispose()
  })

  it('does not begin fragment torsion until the drag threshold is crossed', () => {
    const { handler } = createHandler()
    const canStart = vi.fn(() => true)
    const begin = vi.fn(() => false)
    handler.canStartFragmentTorsion = canStart
    handler.onFragmentTorsionStart = begin

    dispatchAtomPointerDown(handler, 'a2')
    expect(canStart).toHaveBeenCalledWith('a2')
    expect(begin).not.toHaveBeenCalled()

    dispatchPointerMove(handler, 1)
    expect(begin).not.toHaveBeenCalled()

    dispatchPointerMove(handler, 10)
    expect(begin).toHaveBeenCalledTimes(1)
    expect(begin).toHaveBeenCalledWith('a2')
    handler.dispose()
  })
})

describe('InteractionPicker bond identity', () => {
  it('only exposes meshes carrying a valid bond identity to raycasting', () => {
    const valid = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial())
    valid.userData = { type: 'bond', id: 'b1' }
    const decoration = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial())
    const group = new THREE.Group()
    group.add(valid, decoration)

    const pickable = collectPickableBondObjects([group])

    expect(pickable).toEqual([valid])
    valid.geometry.dispose()
    ;(valid.material as THREE.Material).dispose()
    decoration.geometry.dispose()
    ;(decoration.material as THREE.Material).dispose()
  })
})

describe('InteractionHandler atom click arbitration', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('commits immediately when double-click behavior is disabled', () => {
    const { handler } = createHandler()
    const calls: string[] = []
    handler.onAtomClick = id => calls.push(`click:${id}`)

    queueAtomClick(handler, 'a1', { timeStamp: 100 })

    expect(calls).toEqual(['click:a1'])
    expect(vi.getTimerCount()).toBe(0)
    handler.dispose()
  })

  it('commits a single atom click only after the double-click window', () => {
    const { handler } = createHandler()
    const calls: string[] = []
    handler.onAtomClick = id => calls.push(`click:${id}`)
    handler.onAtomDoubleClick = id => calls.push(`double:${id}`)

    queueAtomClick(handler, 'a1', { timeStamp: 100 })
    expect(calls).toEqual([])

    vi.runAllTimers()
    expect(calls).toEqual(['click:a1'])
    handler.dispose()
  })

  it('turns two nearby clicks on the same atom into one double-click', () => {
    const { handler } = createHandler()
    const calls: string[] = []
    handler.onAtomClick = id => calls.push(`click:${id}`)
    handler.onAtomDoubleClick = id => calls.push(`double:${id}`)

    queueAtomClick(handler, 'a1', { timeStamp: 100, clientX: 10, clientY: 10 })
    queueAtomClick(handler, 'a1', {
      timeStamp: 220,
      clientX: 12,
      clientY: 11,
      detail: 2,
    })
    vi.runAllTimers()

    expect(calls).toEqual(['double:a1'])
    handler.dispose()
  })

  it('keeps rapid clicks on different atoms as separate single clicks', () => {
    const { handler } = createHandler()
    const calls: string[] = []
    handler.onAtomClick = id => calls.push(`click:${id}`)
    handler.onAtomDoubleClick = id => calls.push(`double:${id}`)

    queueAtomClick(handler, 'a1', { timeStamp: 100 })
    queueAtomClick(handler, 'a2', { timeStamp: 180, detail: 2 })
    expect(calls).toEqual(['click:a1'])

    vi.runAllTimers()
    expect(calls).toEqual(['click:a1', 'click:a2'])
    handler.dispose()
  })

  it('keeps same-atom clicks outside the time window as separate singles', () => {
    const { handler } = createHandler()
    const calls: string[] = []
    handler.onAtomClick = id => calls.push(`click:${id}`)
    handler.onAtomDoubleClick = id => calls.push(`double:${id}`)

    queueAtomClick(handler, 'a1', { timeStamp: 100 })
    vi.runAllTimers()
    queueAtomClick(handler, 'a1', { timeStamp: 500, detail: 2 })
    vi.runAllTimers()

    expect(calls).toEqual(['click:a1', 'click:a1'])
    handler.dispose()
  })

  it('drops pending atom clicks on cancel and dispose', () => {
    const first = createHandler()
    const second = createHandler()
    const calls: string[] = []
    first.handler.onAtomClick = id => calls.push(`first:${id}`)
    first.handler.onAtomDoubleClick = () => undefined
    second.handler.onAtomClick = id => calls.push(`second:${id}`)
    second.handler.onAtomDoubleClick = () => undefined

    queueAtomClick(first.handler, 'a1', { timeStamp: 100 })
    queueAtomClick(second.handler, 'a2', { timeStamp: 100 })
    first.handler.cancelActiveGesture()
    second.handler.dispose()
    vi.runAllTimers()

    expect(calls).toEqual([])
    first.handler.dispose()
  })

  it('drops a pending atom click when pressing empty canvas', () => {
    const { handler } = createHandler()
    const calls: string[] = []
    handler.onAtomClick = id => calls.push(`click:${id}`)
    handler.onAtomDoubleClick = id => calls.push(`double:${id}`)

    queueAtomClick(handler, 'a1', { timeStamp: 100 })
    dispatchEmptyPointerDown(handler)
    vi.runAllTimers()

    expect(calls).toEqual([])
    expect(vi.getTimerCount()).toBe(0)
    handler.dispose()
  })

  it('drops (not flushes) a pending atom click on bond click', () => {
    const { handler } = createHandler()
    const calls: string[] = []
    handler.onAtomClick = id => calls.push(`click:${id}`)
    handler.onAtomDoubleClick = id => calls.push(`double:${id}`)
    handler.onBondClick = id => calls.push(`bond:${id}`)

    queueAtomClick(handler, 'a1', { timeStamp: 100 })
    driveCanvasClick(handler, { atomIdAt: () => null, bondIdAt: () => 'b1' })
    expect(calls).toEqual(['bond:b1'])
    vi.runAllTimers()

    expect(calls).toEqual(['bond:b1'])
    handler.dispose()
  })

  it('drops a pending atom click on background click', () => {
    const { handler } = createHandler()
    const calls: string[] = []
    handler.onAtomClick = id => calls.push(`click:${id}`)
    handler.onBackgroundClick = () => calls.push('background')
    handler.onAtomDoubleClick = id => calls.push(`double:${id}`)
    const mutable = handler as unknown as {
      _picker: {
        atomIdAt: () => string | null
        bondIdAt: () => string | null
        raycasterAt: () => THREE.Raycaster
      }
      backgroundPosAt: () => { localPos: THREE.Vector3; viewDirLocal: THREE.Vector3 }
      handleClick: (event: MouseEvent) => void
    }
    mutable._picker = { atomIdAt: () => null, bondIdAt: () => null, raycasterAt: () => new THREE.Raycaster() }
    mutable.backgroundPosAt = () => ({
      localPos: new THREE.Vector3(),
      viewDirLocal: new THREE.Vector3(0, 0, 1),
    })
    mutable.handleClick({ clientX: 1, clientY: 1 } as MouseEvent)
    expect(calls).toEqual(['background'])
    vi.runAllTimers()

    expect(calls).toEqual(['background'])
    handler.dispose()
  })

  it('keeps pending across same-atom press so double-click still works', () => {
    const { handler } = createHandler()
    const calls: string[] = []
    handler.onAtomClick = id => calls.push(`click:${id}`)
    handler.onAtomDoubleClick = id => calls.push(`double:${id}`)

    queueAtomClick(handler, 'a1', { timeStamp: 100, clientX: 10, clientY: 10 })
    dispatchAtomPointerDown(handler, 'a1')
    queueAtomClick(handler, 'a1', { timeStamp: 220, clientX: 12, clientY: 11, detail: 2 })
    vi.runAllTimers()

    expect(calls).toEqual(['double:a1'])
    handler.dispose()
  })
})
