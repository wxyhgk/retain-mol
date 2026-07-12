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

  it('空 transaction 不会破坏 redo 分支', () => {
    const atomId = store().addAtom('C', 0, 0, 0)
    temporal().undo()
    expect(activeAtoms().some(atom => atom.id === atomId)).toBe(false)
    expect(temporal().futureStates).toHaveLength(1)

    store().beginTransaction()
    store().endTransaction()

    expect(temporal().futureStates).toHaveLength(1)
    temporal().redo()
    expect(activeAtoms().some(atom => atom.id === atomId)).toBe(true)
  })

  it('活跃 transaction 期间 undo/redo 是严格 no-op', () => {
    const firstAtomId = store().addAtom('C', 0, 0, 0)
    store().beginTransaction()
    const secondAtomId = store().addAtom('C', 1.5, 0, 0)
    const selectionVersion = store().selectionVersion
    const atomPositionVersion = store().atomPositionVersion

    temporal().undo()
    temporal().redo()

    expect(temporal().isTracking).toBe(false)
    expect(activeAtoms().map(atom => atom.id)).toEqual([firstAtomId, secondAtomId])
    expect(store().selectionVersion).toBe(selectionVersion)
    expect(store().atomPositionVersion).toBe(atomPositionVersion)

    store().endTransaction()
    temporal().undo()
    expect(activeAtoms().map(atom => atom.id)).toEqual([firstAtomId])
  })

  it('纯选择不进 undo 历史', () => {
    store().addAtom('C', 0, 0, 0)
    const histLen = temporal().pastStates.length
    const id = activeAtoms()[activeAtoms().length - 1].id
    store().selectAtom(id)
    expect(temporal().pastStates.length).toBe(histLen)   // equality 跳过选择变更
  })

  it('重复选择和清空空选择是严格 no-op', () => {
    const id = store().addAtom('C', 0, 0, 0)
    store().selectAtom(id)
    const atomSelection = store().selectedAtomIds
    const bondSelection = store().selectedBondIds
    const selectedVersion = store().selectionVersion

    store().selectAtom(id)

    expect(store().selectedAtomIds).toBe(atomSelection)
    expect(store().selectedBondIds).toBe(bondSelection)
    expect(store().selectionVersion).toBe(selectedVersion)

    store().clearSelection()
    const emptyAtoms = store().selectedAtomIds
    const emptyBonds = store().selectedBondIds
    const emptyVersion = store().selectionVersion
    store().clearSelection()

    expect(store().selectedAtomIds).toBe(emptyAtoms)
    expect(store().selectedBondIds).toBe(emptyBonds)
    expect(store().selectionVersion).toBe(emptyVersion)
  })

  it('拒绝选择场景中不存在的 atom/bond id', () => {
    const atomSelection = store().selectedAtomIds
    const bondSelection = store().selectedBondIds
    const version = store().selectionVersion

    store().selectAtom('missing-atom')
    store().selectBond('missing-bond')
    store().selectAtoms(['missing-atom'])

    expect(store().selectedAtomIds).toBe(atomSelection)
    expect(store().selectedBondIds).toBe(bondSelection)
    expect(store().selectionVersion).toBe(version)
  })

  it('分子不变时 removeSelected 仍清理历史遗留的失效选择', () => {
    const molecule = activeMol()
    const historyLength = temporal().pastStates.length
    useMoleculeStore.setState({
      selectedAtomIds: new Set(['missing-atom']),
      selectedBondIds: new Set(['missing-bond']),
    })
    const version = store().selectionVersion

    store().removeSelected()

    expect(activeMol()).toBe(molecule)
    expect(store().selectedAtomIds.size).toBe(0)
    expect(store().selectedBondIds.size).toBe(0)
    expect(store().selectionVersion).toBe(version + 1)
    expect(temporal().pastStates).toHaveLength(historyLength)
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

  it('无活跃对象时 setMolecule 保留现有场景并新增对象', () => {
    const existingObjectIds = [...store().objectOrder]
    store().setActiveObject(null)

    store().setMolecule({
      atoms: [{ id: 'new-a1', symbol: 'N', x: 0, y: 0, z: 0 }],
      bonds: [],
      name: 'Appended',
    })

    const state = store()
    expect(state.objectOrder.slice(0, existingObjectIds.length)).toEqual(existingObjectIds)
    expect(existingObjectIds.every(id => state.objectsById[id])).toBe(true)
    expect(state.objectOrder).toHaveLength(existingObjectIds.length + 1)
    expect(state.activeObjectId).toBe(state.objectOrder[state.objectOrder.length - 1])
    expect(activeMol().name).toBe('Appended')
  })

  it('setMolecule 替换活跃对象时保持全场景 ID 唯一', () => {
    const molecule: Molecule = {
      name: 'Shared ids',
      atoms: [
        { id: 'shared-a1', symbol: 'C', x: 0, y: 0, z: 0 },
        { id: 'shared-a2', symbol: 'C', x: 1.4, y: 0, z: 0 },
      ],
      bonds: [{ id: 'shared-b1', atomId1: 'shared-a1', atomId2: 'shared-a2', order: 1 }],
    }
    store().setMolecule(molecule)
    const firstObjectId = store().activeObjectId!
    const secondObjectId = store().addToScene(molecule, false)
    const conflictingMolecule = store().objectsById[secondObjectId].molecule

    store().setActiveObject(firstObjectId)
    store().setMolecule(conflictingMolecule)

    const allIds = Object.values(store().objectsById).flatMap(object => [
      ...object.molecule.atoms.map(atom => atom.id),
      ...object.molecule.bonds.map(bond => bond.id),
    ])
    const replaced = activeMol()
    expect(new Set(allIds).size).toBe(allIds.length)
    expect(replaced.bonds[0].atomId1).toBe(replaced.atoms[0].id)
    expect(replaced.bonds[0].atomId2).toBe(replaced.atoms[1].id)

    temporal().undo()
    temporal().redo()
    const afterTimeTravelIds = Object.values(store().objectsById).flatMap(object => [
      ...object.molecule.atoms.map(atom => atom.id),
      ...object.molecule.bonds.map(bond => bond.id),
    ])
    expect(new Set(afterTimeTravelIds).size).toBe(afterTimeTravelIds.length)
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
