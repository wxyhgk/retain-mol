/**
 * 回归测试：2026-07-26 多 agent 审查 interaction 集群（useCanvasPointerRouter 两条发现）
 *
 * 1. move-object 变换拖拽的重入/按键/pointerId 守卫：
 *    - 拖拽进行中第二根手指（另一 pointerId）按下不得重置变换目标——
 *      按在空白会把 fragmentIds 置空冻结拖拽；按在另一分子会切换目标并以
 *      两指坐标差把它一次性瞬移出画面。
 *    - 非主键（右键等）按下不得开启变换拖拽。
 *    - handleTransformMove 只响应开启拖拽的 pointer。
 * 2. 亚阈值位移必须可累积：handleTransformMove 需先判阈值再推进 lastX/lastY，
 *    否则高回报率/hi-DPI 的连续 <0.5px 位移每步都被丢弃，慢速精调时对象不跟手。
 */
import { describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { newAtom, type Molecule } from '../lib/molecule'
import type { MoleculeStoreApi } from '../store/moleculeStore'
import {
  handleTransformDown,
  handleTransformMove,
  makeTransformState,
} from './useCanvasPointerRouter'

function pointerEvent(init: {
  pointerId: number
  button?: number
  clientX?: number
  clientY?: number
  altKey?: boolean
}): PointerEvent {
  return {
    button: 0,
    clientX: 0,
    clientY: 0,
    altKey: false,
    ...init,
  } as unknown as PointerEvent
}

function createTransformHarness() {
  const a1 = newAtom('C', 0, 0, 0)
  const a2 = newAtom('C', 3, 0, 0)
  const b1 = newAtom('N', 10, 0, 0)
  const molA: Molecule = { atoms: [a1, a2], bonds: [] }
  const molB: Molecule = { atoms: [b1], bonds: [] }

  const storeState = {
    activeObjectId: 'objA' as string | null,
    objectsById: {
      objA: { molecule: molA },
      objB: { molecule: molB },
    } as Record<string, { molecule: Molecule }>,
    activateObjectContainingAtom: vi.fn((atomId: string) => {
      for (const [objectId, obj] of Object.entries(storeState.objectsById)) {
        if (obj.molecule.atoms.some(atom => atom.id === atomId)) {
          storeState.activeObjectId = objectId
          return true
        }
      }
      return false
    }),
    setObjectAtomPositions: vi.fn(),
  }
  const moleculeStore = {
    getState: () => storeState,
  } as unknown as MoleculeStoreApi

  // pickAtomIdAt 由测试逐步控制（模拟不同按下点命中不同原子/空白）
  const pick = { result: null as string | null }
  const downRenderer = { pickAtomIdAt: () => pick.result }
  const moveRenderer = {
    screenDeltaToModelLocal: (dx: number, dy: number) => new THREE.Vector3(dx, dy, 0),
    modelGroup: new THREE.Group(),
  }

  const canvas = { setPointerCapture: vi.fn() }
  const session = { start: vi.fn() }
  const state = makeTransformState()

  const down = (e: PointerEvent) =>
    handleTransformDown(e, canvas, downRenderer, state, session, moleculeStore)
  const move = (e: PointerEvent) =>
    handleTransformMove(e, moveRenderer, state, moleculeStore)

  return { a1, a2, b1, canvas, down, move, pick, session, state, storeState }
}

describe('move-object 变换拖拽守卫（重入 / 按键 / pointerId）', () => {
  it('拖拽中第二根手指按在空白：不重置目标、拖拽不冻结', () => {
    const { a1, down, move, pick, session, state, storeState } = createTransformHarness()

    pick.result = a1.id
    down(pointerEvent({ pointerId: 1, clientX: 100, clientY: 100 }))
    expect(state).toMatchObject({ dragging: true, pointerId: 1, targetObjectId: 'objA' })
    expect(session.start).toHaveBeenCalledTimes(1)

    // 第二根手指按在空白处（无 Alt）：修复前会把 fragmentIds 置空，拖拽从此全部 no-op
    pick.result = null
    down(pointerEvent({ pointerId: 2, clientX: 400, clientY: 300 }))
    expect(state.dragging).toBe(true)
    expect(state.fragmentIds).not.toBeNull()
    expect(state.targetObjectId).toBe('objA')
    expect(state.pointerId).toBe(1)
    expect(session.start).toHaveBeenCalledTimes(1)

    // 手指 1 继续拖：仍然生效（未冻结）
    move(pointerEvent({ pointerId: 1, clientX: 110, clientY: 100 }))
    expect(storeState.setObjectAtomPositions).toHaveBeenCalledTimes(1)
    const [objectId, positions] = storeState.setObjectAtomPositions.mock.calls[0] as [
      string,
      ReadonlyMap<string, { x: number; y: number; z: number }>,
    ]
    expect(objectId).toBe('objA')
    expect(positions.get(a1.id)?.x).toBeCloseTo(10)
  })

  it('拖拽中第二根手指按在另一分子的原子上：不切换目标、不重置位移基准点', () => {
    const { a1, b1, down, move, pick, state, storeState } = createTransformHarness()

    pick.result = a1.id
    down(pointerEvent({ pointerId: 1, clientX: 100, clientY: 100 }))
    expect(storeState.activateObjectContainingAtom).toHaveBeenCalledTimes(1)

    // 第二根手指落在分子 B 的原子上：修复前会激活 objB 并把 lastX/lastY 重置到
    // (500,500)，手指 1 下一次 move 的 dx 高达数百像素，B 被一次性瞬移出画面
    pick.result = b1.id
    down(pointerEvent({ pointerId: 2, clientX: 500, clientY: 500 }))
    expect(storeState.activateObjectContainingAtom).toHaveBeenCalledTimes(1)
    expect(state.targetObjectId).toBe('objA')
    expect(storeState.activeObjectId).toBe('objA')
    expect(state.lastX).toBe(100)
    expect(state.lastY).toBe(100)

    // 手指 1 小幅移动：位移按手指 1 自己的基准算（+6px），不是两指坐标差
    move(pointerEvent({ pointerId: 1, clientX: 106, clientY: 100 }))
    expect(storeState.setObjectAtomPositions).toHaveBeenCalledTimes(1)
    const [objectId, positions] = storeState.setObjectAtomPositions.mock.calls[0] as [
      string,
      ReadonlyMap<string, { x: number; y: number; z: number }>,
    ]
    expect(objectId).toBe('objA')
    expect(positions.get(a1.id)?.x).toBeCloseTo(6)
  })

  it('非主键按下不开启变换拖拽', () => {
    const { a1, down, pick, session, state, storeState } = createTransformHarness()

    pick.result = a1.id
    down(pointerEvent({ pointerId: 1, button: 2, clientX: 100, clientY: 100 }))
    expect(state.dragging).toBe(false)
    expect(session.start).not.toHaveBeenCalled()
    expect(storeState.activateObjectContainingAtom).not.toHaveBeenCalled()
  })

  it('handleTransformMove 只响应开启拖拽的 pointer', () => {
    const { a1, down, move, pick, state, storeState } = createTransformHarness()

    pick.result = a1.id
    down(pointerEvent({ pointerId: 1, clientX: 100, clientY: 100 }))

    // 第二根手指的大幅移动：既不产生位移提交，也不污染基准点
    move(pointerEvent({ pointerId: 2, clientX: 500, clientY: 500 }))
    expect(storeState.setObjectAtomPositions).not.toHaveBeenCalled()
    expect(state.lastX).toBe(100)
    expect(state.lastY).toBe(100)
  })
})

describe('亚阈值位移累积（先判阈值再推进基准点）', () => {
  it('连续 <0.5px 的位移会累积，越过阈值后一次性提交', () => {
    const { a1, down, move, pick, state, storeState } = createTransformHarness()

    pick.result = a1.id
    down(pointerEvent({ pointerId: 1, clientX: 100, clientY: 100 }))

    // 第一步 +0.3px：低于 0.5 阈值，不提交，且基准点必须留在 100（可累积）
    move(pointerEvent({ pointerId: 1, clientX: 100.3, clientY: 100 }))
    expect(storeState.setObjectAtomPositions).not.toHaveBeenCalled()
    expect(state.lastX).toBe(100)

    // 第二步再 +0.3px：累积位移 0.6 ≥ 0.5，必须以完整的 0.6 提交
    // （修复前基准点已被推进，这一步的 dx 又是 0.3，永远提交不了）
    move(pointerEvent({ pointerId: 1, clientX: 100.6, clientY: 100 }))
    expect(storeState.setObjectAtomPositions).toHaveBeenCalledTimes(1)
    const [, positions] = storeState.setObjectAtomPositions.mock.calls[0] as [
      string,
      ReadonlyMap<string, { x: number; y: number; z: number }>,
    ]
    expect(positions.get(a1.id)?.x).toBeCloseTo(0.6)
    expect(state.lastX).toBeCloseTo(100.6)

    // 提交后基准点已推进：原地 move 不再重复提交
    move(pointerEvent({ pointerId: 1, clientX: 100.6, clientY: 100 }))
    expect(storeState.setObjectAtomPositions).toHaveBeenCalledTimes(1)
  })
})
