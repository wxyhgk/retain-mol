/**
 * 回归测试：2026-07-26 多 agent 审查 interaction 集群（InteractionHandler 三条发现）
 *
 * 1. pointerId 过滤：第二根手指（其他 pointer）的 down/move/up/cancel 不得覆盖、
 *    提交或取消进行中的手势（否则 atom-drag 事务永久悬挂、undo 死亡）。
 * 2. bond-drag 松手：优先使用手势内已跟踪的 targetId/dropPosition（预览真相），
 *    按 pointerup 坐标重新拾取只在两者皆空时兜底。
 * 3. _downClient 记录在 document capture：上游路由 stopImmediatePropagation 吞掉
 *    canvas 的 pointerdown 时（move-object 模式），click 的 movedSinceDown 判定
 *    仍要拿到本次按下坐标，点空白清除选择不得失效。
 */
import { describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import type { MolControls } from '../controls/MolControls'
import { InteractionHandler } from './InteractionHandler'

class FakeCanvas extends EventTarget {
  readonly style = { cursor: '' }
  private readonly capturedPointers = new Set<number>()

  setPointerCapture(pointerId: number) {
    this.capturedPointers.add(pointerId)
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

interface PickerStub {
  atomHitAt?: (x: number, y: number) => { object: THREE.Object3D } | null
  atomIdAt?: (x: number, y: number) => string | null
  bondIdAt?: (x: number, y: number) => string | null
  raycasterAt?: (x: number, y: number) => THREE.Raycaster
}

interface MutableHandler {
  _picker: PickerStub
  _gesture: {
    kind: string
    atomId?: string
    sourceId?: string
    targetId?: string | null
    dropPosition?: { x: number; y: number; z: number } | null
  }
  handlePointerDown: (e: PointerEvent) => void
  handlePointerMove: (e: PointerEvent) => void
  handlePointerUp: (e: PointerEvent) => void
  handlePointerCancel: (e: PointerEvent) => void
}

function pointerEvent(init: {
  button?: number
  clientX?: number
  clientY?: number
  pointerId: number
  shiftKey?: boolean
}): PointerEvent {
  return {
    button: 0,
    clientX: 0,
    clientY: 0,
    shiftKey: false,
    stopImmediatePropagation: () => undefined,
    ...init,
  } as unknown as PointerEvent
}

function makeAtomObject(id: string, x: number, y: number, z: number): THREE.Object3D {
  const object = new THREE.Object3D()
  object.userData = { id }
  object.position.set(x, y, z)
  return object
}

function createScene(atoms: Record<string, readonly [number, number, number]>) {
  const canvas = new FakeCanvas()
  const controls = { enabled: true } as MolControls
  const meshes = new Map<string, THREE.Object3D>()
  for (const [id, [x, y, z]] of Object.entries(atoms)) {
    meshes.set(id, makeAtomObject(id, x, y, z))
  }
  const handler = new InteractionHandler(
    canvas as unknown as HTMLCanvasElement,
    new THREE.PerspectiveCamera(),
    new THREE.Group(),
    new THREE.Group(),
    controls,
    () => meshes as Map<string, THREE.Mesh>,
    () => new Map(),
  )
  const mutable = handler as unknown as MutableHandler
  return { canvas, controls, handler, meshes, mutable }
}

describe('InteractionHandler pointerId 过滤（多指第二根手指不得干扰手势）', () => {
  it('第二根手指的 down/move/up/cancel 全部被忽略，atom-drag 只被原 pointer 提交一次', () => {
    const { controls, handler, meshes, mutable } = createScene({
      a1: [0, 0, -5],
      b1: [1, 0, -5],
    })
    let hitId: string | null = 'a1'
    mutable._picker = {
      atomHitAt: () => (hitId ? { object: meshes.get(hitId)! } : null),
      atomIdAt: () => null,
    }
    const canStartBondDrag = vi.fn((id: string) => id === 'b1')
    handler.canStartBondDrag = canStartBondDrag
    handler.canDragAtom = () => true
    handler.onAtomDrag = vi.fn()
    const dragStart = vi.fn()
    const dragEnd = vi.fn()
    const dragCancel = vi.fn()
    handler.onAtomDragStart = dragStart
    handler.onAtomDragEnd = dragEnd
    handler.onAtomDragCancel = dragCancel

    // 手指 1：按下选中原子并越过拖拽阈值 → atom-drag 进行中
    mutable.handlePointerDown(pointerEvent({ clientX: 50, clientY: 50, pointerId: 1 }))
    mutable.handlePointerMove(pointerEvent({ clientX: 60, clientY: 50, pointerId: 1 }))
    expect(dragStart).toHaveBeenCalledWith('a1')
    expect(mutable._gesture).toMatchObject({ kind: 'atom-drag', atomId: 'a1' })

    // 手指 2 按在另一个（可 bond-drag 的）原子上：不得无声覆盖手势
    hitId = 'b1'
    mutable.handlePointerDown(pointerEvent({ clientX: 20, clientY: 20, pointerId: 2 }))
    expect(canStartBondDrag).not.toHaveBeenCalledWith('b1')
    expect(mutable._gesture).toMatchObject({ kind: 'atom-drag', atomId: 'a1' })

    // 手指 2 的移动 / 抬起 / 取消：不得推进、提交或取消手势
    mutable.handlePointerMove(pointerEvent({ clientX: 30, clientY: 30, pointerId: 2 }))
    mutable.handlePointerUp(pointerEvent({ clientX: 20, clientY: 20, pointerId: 2 }))
    mutable.handlePointerCancel(pointerEvent({ pointerId: 2 }))
    expect(dragEnd).not.toHaveBeenCalled()
    expect(dragCancel).not.toHaveBeenCalled()
    expect(mutable._gesture).toMatchObject({ kind: 'atom-drag', atomId: 'a1' })
    expect(controls.enabled).toBe(false)

    // 手指 1 抬起：正常提交恰好一次，手势复位、相机解锁
    mutable.handlePointerUp(pointerEvent({ clientX: 60, clientY: 50, pointerId: 1 }))
    expect(dragEnd).toHaveBeenCalledTimes(1)
    expect(dragEnd).toHaveBeenCalledWith('a1')
    expect(mutable._gesture.kind).toBe('idle')
    expect(controls.enabled).toBe(true)
    handler.dispose()
  })

  it('活动 pointer 的 pointercancel 走完整收尾：回滚拖拽、释放捕获、恢复相机', () => {
    const { canvas, controls, handler, meshes, mutable } = createScene({ a1: [0, 0, -5] })
    mutable._picker = {
      atomHitAt: () => ({ object: meshes.get('a1')! }),
      atomIdAt: () => null,
    }
    handler.canDragAtom = () => true
    handler.onAtomDrag = vi.fn()
    const dragCancel = vi.fn()
    handler.onAtomDragCancel = dragCancel

    mutable.handlePointerDown(pointerEvent({ clientX: 50, clientY: 50, pointerId: 1 }))
    mutable.handlePointerMove(pointerEvent({ clientX: 60, clientY: 50, pointerId: 1 }))
    expect(mutable._gesture.kind).toBe('atom-drag')

    mutable.handlePointerCancel(pointerEvent({ pointerId: 1 }))
    expect(dragCancel).toHaveBeenCalledTimes(1)
    expect(dragCancel).toHaveBeenCalledWith('a1')
    expect(mutable._gesture.kind).toBe('idle')
    expect(controls.enabled).toBe(true)
    expect(canvas.hasPointerCapture(1)).toBe(false)
    handler.dispose()
  })
})

describe('InteractionHandler bond-drag 松手目标（预览真相优先，重拾取只兜底）', () => {
  function createBondDragScene() {
    const scene = createScene({ src: [0, 0, -5], tgt: [1, 0, -5] })
    const hover = { id: null as string | null }
    scene.mutable._picker = {
      atomHitAt: () => ({ object: scene.meshes.get('src')! }),
      atomIdAt: () => hover.id,
    }
    scene.handler.canStartBondDrag = () => true
    scene.handler.onBondDragStart = () => true
    const end = vi.fn()
    scene.handler.onBondDragEnd = end
    return { ...scene, hover, end }
  }

  it('抬指坐标重拾取脱靶时，仍用拖拽中吸附预览的 targetId 成键', () => {
    const { handler, mutable, hover, end } = createBondDragScene()

    mutable.handlePointerDown(pointerEvent({ clientX: 50, clientY: 50, pointerId: 1 }))
    hover.id = 'tgt'
    mutable.handlePointerMove(pointerEvent({ clientX: 60, clientY: 50, pointerId: 1 }))
    expect(mutable._gesture).toMatchObject({ kind: 'bond-drag', targetId: 'tgt' })

    // 触摸抬指抖动 / move 合并：up 坐标已不在目标原子上
    hover.id = null
    mutable.handlePointerUp(pointerEvent({ clientX: 63, clientY: 53, pointerId: 1 }))
    expect(end).toHaveBeenCalledTimes(1)
    expect(end).toHaveBeenCalledWith('src', 'tgt', null)
    handler.dispose()
  })

  it('手势内无 target 也无落点预览时，按 up 坐标重拾取兜底', () => {
    const { handler, mutable, hover, end } = createBondDragScene()

    mutable.handlePointerDown(pointerEvent({ clientX: 50, clientY: 50, pointerId: 1 }))
    mutable.handlePointerMove(pointerEvent({ clientX: 60, clientY: 50, pointerId: 1 }))
    expect(mutable._gesture).toMatchObject({
      kind: 'bond-drag',
      targetId: null,
      dropPosition: null,
    })

    hover.id = 'tgt'
    mutable.handlePointerUp(pointerEvent({ clientX: 60, clientY: 50, pointerId: 1 }))
    expect(end).toHaveBeenCalledTimes(1)
    expect(end).toHaveBeenCalledWith('src', 'tgt', null)
    handler.dispose()
  })

  it('有幽灵原子落点预览时，up 意外落在从未预览过的原子上也按预览生长', () => {
    const { handler, mutable, hover, end } = createBondDragScene()
    handler.getGrowPreview = () => ({ pos: { x: 2, y: 0, z: -5 }, radius: 0.3, color: 0xffffff })

    mutable.handlePointerDown(pointerEvent({ clientX: 50, clientY: 50, pointerId: 1 }))
    mutable.handlePointerMove(pointerEvent({ clientX: 60, clientY: 50, pointerId: 1 }))
    expect(mutable._gesture).toMatchObject({
      kind: 'bond-drag',
      targetId: null,
      dropPosition: { x: 2, y: 0, z: -5 },
    })

    hover.id = 'tgt'
    mutable.handlePointerUp(pointerEvent({ clientX: 60, clientY: 50, pointerId: 1 }))
    expect(end).toHaveBeenCalledTimes(1)
    expect(end).toHaveBeenCalledWith('src', null, expect.objectContaining({ x: 2, y: 0, z: -5 }))
    handler.dispose()
  })
})

describe('InteractionHandler _downClient（pointerdown 被上游路由拦截时点击判定仍正确）', () => {
  it('down 被拦截（只到 document capture）后，同点 click 仍触发空白点击；大位移仍被吞', () => {
    const fakeDoc = new EventTarget()
    const canvas = new FakeCanvas()
    ;(canvas as unknown as { ownerDocument: EventTarget }).ownerDocument = fakeDoc
    const controls = { enabled: true } as MolControls
    const handler = new InteractionHandler(
      canvas as unknown as HTMLCanvasElement,
      new THREE.PerspectiveCamera(),
      new THREE.Group(),
      new THREE.Group(),
      controls,
      () => new Map(),
      () => new Map(),
    )
    const mutable = handler as unknown as MutableHandler
    mutable._picker = {
      atomIdAt: () => null,
      bondIdAt: () => null,
      raycasterAt: () =>
        new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)),
    }
    const background = vi.fn()
    handler.onBackgroundClick = background

    // move-object 模式：路由层 container capture 吞掉 pointerdown（canvas 收不到），
    // 但 document capture 仍记录了按下坐标 → 同点 click 不被 movedSinceDown 误吞
    fakeDoc.dispatchEvent(
      Object.assign(new Event('pointerdown'), {
        button: 0,
        clientX: 300,
        clientY: 100,
        pointerId: 1,
      }),
    )
    canvas.dispatchEvent(Object.assign(new Event('click'), { clientX: 300, clientY: 100 }))
    expect(background).toHaveBeenCalledTimes(1)

    // 拖拽语义保留：按下→点击位移超阈值的 click 仍被判为拖拽吞掉
    fakeDoc.dispatchEvent(
      Object.assign(new Event('pointerdown'), {
        button: 0,
        clientX: 10,
        clientY: 10,
        pointerId: 1,
      }),
    )
    canvas.dispatchEvent(Object.assign(new Event('click'), { clientX: 80, clientY: 80 }))
    expect(background).toHaveBeenCalledTimes(1)

    // dispose 后 document 上的监听被移除，不再更新
    handler.dispose()
    fakeDoc.dispatchEvent(
      Object.assign(new Event('pointerdown'), {
        button: 0,
        clientX: 1,
        clientY: 1,
        pointerId: 1,
      }),
    )
    expect(background).toHaveBeenCalledTimes(1)
  })
})
