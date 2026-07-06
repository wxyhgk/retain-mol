/**
 * undo/redo 冒烟测试 —— 验证 slice 拆分后 undo/事务语义未变。
 * 项目此前无 store 层 undo 测试；这份补上核心不变量。
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useMoleculeStore } from './moleculeStore'

const store = () => useMoleculeStore.getState()
const temporal = () => useMoleculeStore.temporal.getState()
const activeAtoms = () => {
  const s = store()
  return s.objectsById[s.activeObjectId!].molecule.atoms
}

beforeEach(() => {
  store().clearMolecule()
  temporal().clear()
})

describe('moleculeStore undo/redo（slice 拆分回归）', () => {
  it('addAtom 可撤销并可重做', () => {
    const n0 = activeAtoms().length
    store().addAtom('C', 0, 0, 0)
    expect(activeAtoms().length).toBe(n0 + 1)
    temporal().undo()
    expect(activeAtoms().length).toBe(n0)
    temporal().redo()
    expect(activeAtoms().length).toBe(n0 + 1)
  })

  it('beginTransaction/endTransaction 合并为一步 undo', () => {
    const n0 = activeAtoms().length
    store().beginTransaction()
    store().addAtom('C', 0, 0, 0)
    store().addAtom('C', 1.5, 0, 0)
    store().addAtom('C', 3, 0, 0)
    store().endTransaction()
    expect(activeAtoms().length).toBe(n0 + 3)
    temporal().undo()            // 一步应回退整段事务
    expect(activeAtoms().length).toBe(n0)
  })

  it('纯选择不进 undo 历史', () => {
    store().addAtom('C', 0, 0, 0)
    const histLen = temporal().pastStates.length
    const id = activeAtoms()[activeAtoms().length - 1].id
    store().selectAtom(id)
    expect(temporal().pastStates.length).toBe(histLen)   // equality 跳过选择变更
  })

  it('undo 后失效选择被 afterTimeTravel 清理', () => {
    const id = store().addAtom('C', 0, 0, 0)
    store().selectAtom(id)
    expect(store().selectedAtomIds.has(id)).toBe(true)
    temporal().undo()                                     // 原子随之消失
    expect(store().selectedAtomIds.has(id)).toBe(false)   // 清理失效 id
  })
})
