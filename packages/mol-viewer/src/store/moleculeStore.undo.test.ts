/**
 * undo/redo 冒烟测试 —— 验证 slice 拆分后 undo/事务语义未变。
 * 项目此前无 store 层 undo 测试；这份补上核心不变量。
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useMoleculeStore } from './moleculeStore'
import type { Molecule } from '../lib/molecule'

const store = () => useMoleculeStore.getState()
const temporal = () => useMoleculeStore.temporal.getState()
const activeMol = () => {
  const s = store()
  return s.objectsById[s.activeObjectId!].molecule
}
const activeAtoms = () => {
  return activeMol().atoms
}

beforeEach(() => {
  temporal().resume()
  const ids = [...store().objectOrder]
  for (const id of ids.slice(1)) store().removeSceneObject(id)
  if (ids[0]) store().setActiveObject(ids[0])
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

  it('addToScene 会重写与场景内已有对象冲突的 atom/bond id', () => {
    const mol: Molecule = {
      name: 'collision',
      atoms: [
        { id: 'a1', symbol: 'C', x: 0, y: 0, z: 0 },
        { id: 'a2', symbol: 'C', x: 1.5, y: 0, z: 0 },
      ],
      bonds: [{ id: 'b1', atomId1: 'a1', atomId2: 'a2', order: 1 }],
    }
    store().setMolecule(mol)

    const newObjectId = store().addToScene(mol, false)
    const added = store().objectsById[newObjectId].molecule
    const allIds = Object.values(store().objectsById).flatMap(obj => [
      ...obj.molecule.atoms.map(a => a.id),
      ...obj.molecule.bonds.map(b => b.id),
    ])

    expect(new Set(allIds).size).toBe(allIds.length)
    expect(added.atoms.map(a => a.id)).not.toEqual(['a1', 'a2'])
    expect(added.bonds[0].id).not.toBe('b1')
    expect(added.bonds[0].atomId1).toBe(added.atoms[0].id)
    expect(added.bonds[0].atomId2).toBe(added.atoms[1].id)
  })

  it('嵌套 transaction 只在最外层恢复 temporal，并作为一步 undo', () => {
    const n0 = activeAtoms().length
    store().beginTransaction()
    store().addAtom('C', 0, 0, 0)
    store().beginTransaction()
    store().addAtom('C', 1.5, 0, 0)
    store().endTransaction()
    expect(temporal().isTracking).toBe(false)
    store().addAtom('C', 3, 0, 0)
    store().endTransaction()

    expect(temporal().isTracking).toBe(true)
    expect(activeAtoms().length).toBe(n0 + 3)
    temporal().undo()
    expect(activeAtoms().length).toBe(n0)
  })

  it('editSlice/sceneSlice 内部清理选择时递增 selectionVersion', () => {
    const a = store().addAtom('C', 0, 0, 0)
    const b = store().addAtom('C', 1.5, 0, 0)
    store().addBond(a, b)
    const bondId = activeMol().bonds[0].id

    store().selectBond(bondId)
    const beforeRemoveBond = store().selectionVersion
    store().removeBond(bondId)
    expect(store().selectionVersion).toBe(beforeRemoveBond + 1)
    expect(store().selectedBondIds.has(bondId)).toBe(false)

    store().selectAtom(a)
    const beforeRemoveAtom = store().selectionVersion
    store().removeAtom(a)
    expect(store().selectionVersion).toBe(beforeRemoveAtom + 1)
    expect(store().selectedAtomIds.has(a)).toBe(false)

    store().selectAtom(b)
    const beforeAddToScene = store().selectionVersion
    store().addToScene({ atoms: [], bonds: [], name: 'empty' }, false)
    expect(store().selectionVersion).toBe(beforeAddToScene + 1)
    expect(store().selectedAtomIds.size).toBe(0)
    expect(store().selectedBondIds.size).toBe(0)
  })

  it('addBond 直接调用也拒绝自环、重复键和超价键', () => {
    const h1 = store().addAtom('H', 0, 0, 0)
    const h2 = store().addAtom('H', 0.75, 0, 0)
    const h3 = store().addAtom('H', 1.5, 0, 0)

    store().addBond(h1, h1)
    expect(activeMol().bonds).toHaveLength(0)

    store().addBond(h1, h2)
    expect(activeMol().bonds).toHaveLength(1)

    store().addBond(h1, h2)
    expect(activeMol().bonds).toHaveLength(1)

    store().addBond(h1, h3)
    expect(activeMol().bonds).toHaveLength(1)
  })

  it('bondSelectedAtoms 作为 store action 提交纯命令结果', () => {
    const a = store().addAtom('C', 0, 0, 0)
    const b = store().addAtom('C', 1.5, 0, 0)

    store().selectAtoms([a, b])
    const result = store().bondSelectedAtoms()

    expect(result.ok).toBe(true)
    expect(activeMol().bonds).toHaveLength(1)
    expect(activeMol().bonds[0]).toMatchObject({ atomId1: a, atomId2: b })
  })
})
