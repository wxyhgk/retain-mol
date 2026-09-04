/**
 * 回归：纯激活切换（点另一分子的原子仅为选中）不得被记为 undo 历史条目
 * （2026-07-26 审查 store-undo 维度）。
 *
 * activeObjectId 留在 undo 快照里是场景图操作（remove/split）undo 一致性
 * 所需；修复方式是 setActiveObject 用 temporal pause/resume 包住，纯激活
 * 不入栈、不冲 redo 分支，而不是把 activeObjectId 移出快照。
 */
import { describe, it, expect } from 'vitest'
import { createMoleculeStore } from './moleculeStore'
import type { Molecule } from '../lib/molecule'

const singleAtom = (id: string, name: string): Molecule => ({
  name,
  atoms: [{ id, symbol: 'C', x: 0, y: 0, z: 0 }],
  bonds: [],
})

describe('纯激活切换与 undo 历史', () => {
  it('setActiveObject 不产生历史条目，且之后编辑仍正常入栈', () => {
    const store = createMoleculeStore()
    const defaultId = store.getState().activeObjectId!
    const aId = store.getState().addToScene(singleAtom('a1', 'A'))
    store.getState().addToScene(singleAtom('b1', 'B'))

    const pastBefore = store.temporal.getState().pastStates.length
    store.getState().setActiveObject(aId)

    expect(store.getState().activeObjectId).toBe(aId)
    expect(store.temporal.getState().pastStates.length).toBe(pastBefore)

    // pause/resume 必须成对：激活后编辑仍要正常记录历史
    store.getState().setActiveObject(defaultId)
    store.getState().addAtom('C', 5, 0, 0)
    expect(store.temporal.getState().pastStates.length).toBe(pastBefore + 1)
  })

  it('undo 之后的纯激活不冲掉 redo 分支', () => {
    const store = createMoleculeStore()
    const defaultId = store.getState().activeObjectId!
    store.getState().addToScene(singleAtom('a1', 'A'))
    const bId = store.getState().addToScene(singleAtom('b1', 'B'))

    store.temporal.getState().undo() // 回到"只有 A"
    expect(store.getState().objectsById[bId]).toBeUndefined()
    expect(store.temporal.getState().futureStates).toHaveLength(1)

    store.getState().setActiveObject(defaultId) // 纯激活

    expect(store.temporal.getState().futureStates).toHaveLength(1) // redo 分支健在
    store.temporal.getState().redo()
    expect(store.getState().objectsById[bId]).toBeDefined()
  })

  it('事务期间 setActiveObject 不会误 resume 追踪', () => {
    const store = createMoleculeStore()
    const aId = store.getState().addToScene(singleAtom('a1', 'A'))
    store.getState().addToScene(singleAtom('b1', 'B'))

    store.getState().beginTransaction()
    expect(store.temporal.getState().isTracking).toBe(false)

    store.getState().setActiveObject(aId)
    expect(store.temporal.getState().isTracking).toBe(false) // 事务的 pause 不被破坏

    store.getState().endTransaction()
    expect(store.temporal.getState().isTracking).toBe(true)
  })
})
