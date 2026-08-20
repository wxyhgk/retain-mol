/**
 * 回归：分子编辑落盘统一出口的引用完整性清扫（2026-07-26 审查 store-undo 维度）。
 *
 * 覆盖四条同根发现：
 *  1/2. setAtomCharge / setAtomRadical 经 resaturateAtom 删 H 后，
 *       selectedAtomIds 残留悬空 id；
 *  3.   autoInferBonds 全量重建键 ID：selectedBondIds 悬空，且拓扑无变化
 *       时也平白压一步 undo；
 *  4.   cycleBondLength（公共 EditSlice API）升键级删 H 不清理选择集。
 */
import { describe, it, expect } from 'vitest'
import { createMoleculeStore } from '../moleculeStore'
import type { Molecule } from '../../lib/molecule'

const water = (): Molecule => ({
  name: 'water',
  atoms: [
    { id: 'o1', symbol: 'O', x: 0, y: 0, z: 0 },
    { id: 'h1', symbol: 'H', x: 0.96, y: 0, z: 0 },
    { id: 'h2', symbol: 'H', x: -0.24, y: 0.93, z: 0 },
  ],
  bonds: [
    { id: 'wb1', atomId1: 'o1', atomId2: 'h1', order: 1 },
    { id: 'wb2', atomId1: 'o1', atomId2: 'h2', order: 1 },
  ],
})

const ethane = (): Molecule => ({
  name: 'ethane',
  atoms: [
    { id: 'c1', symbol: 'C', x: 0, y: 0, z: 0 },
    { id: 'c2', symbol: 'C', x: 1.54, y: 0, z: 0 },
    { id: 'h11', symbol: 'H', x: -0.39, y: 1.02, z: 0 },
    { id: 'h12', symbol: 'H', x: -0.39, y: -0.51, z: 0.89 },
    { id: 'h13', symbol: 'H', x: -0.39, y: -0.51, z: -0.89 },
    { id: 'h21', symbol: 'H', x: 1.93, y: -1.02, z: 0 },
    { id: 'h22', symbol: 'H', x: 1.93, y: 0.51, z: 0.89 },
    { id: 'h23', symbol: 'H', x: 1.93, y: 0.51, z: -0.89 },
  ],
  bonds: [
    { id: 'cc', atomId1: 'c1', atomId2: 'c2', order: 1 },
    { id: 'eb1', atomId1: 'c1', atomId2: 'h11', order: 1 },
    { id: 'eb2', atomId1: 'c1', atomId2: 'h12', order: 1 },
    { id: 'eb3', atomId1: 'c1', atomId2: 'h13', order: 1 },
    { id: 'eb4', atomId1: 'c2', atomId2: 'h21', order: 1 },
    { id: 'eb5', atomId1: 'c2', atomId2: 'h22', order: 1 },
    { id: 'eb6', atomId1: 'c2', atomId2: 'h23', order: 1 },
  ],
})

/** 两个 C 相距 1.5Å：inferBonds 会推出一条 order 1 的键。 */
const carbonPair = (order: 1 | 2 | 3): Molecule => ({
  name: 'c2',
  atoms: [
    { id: 'c1', symbol: 'C', x: 0, y: 0, z: 0 },
    { id: 'c2', symbol: 'C', x: 1.5, y: 0, z: 0 },
  ],
  bonds: [{ id: 'cc', atomId1: 'c1', atomId2: 'c2', order }],
})

/**
 * 旧键 a--b|c 与推断键 a|b--c 在分隔符拼接下都曾编码为
 * a|b|c|1|0；四个原子的位置确保 inferBonds 只保留后一条键。
 */
const separatorCollisionMolecule = (): Molecule => ({
  name: 'separator-collision',
  atoms: [
    { id: 'a', symbol: 'C', x: 100, y: 0, z: 0 },
    { id: 'b|c', symbol: 'C', x: 200, y: 0, z: 0 },
    { id: 'a|b', symbol: 'C', x: 0, y: 0, z: 0 },
    { id: 'c', symbol: 'C', x: 1.5, y: 0, z: 0 },
  ],
  bonds: [{ id: 'colliding-old', atomId1: 'a', atomId2: 'b|c', order: 1 }],
})

function setup(mol: Molecule) {
  const store = createMoleculeStore()
  store.getState().setMolecule(mol)
  return store
}

type Store = ReturnType<typeof createMoleculeStore>

function activeMol(store: Store): Molecule {
  const s = store.getState()
  return s.objectsById[s.activeObjectId!]!.molecule
}

/** 核心不变式：选择集不允许残留任何悬空 id。 */
function expectNoDanglingSelection(store: Store) {
  const mol = activeMol(store)
  const aliveAtoms = new Set(mol.atoms.map(a => a.id))
  const aliveBonds = new Set(mol.bonds.map(b => b.id))
  for (const id of store.getState().selectedAtomIds) {
    expect(aliveAtoms.has(id), `selectedAtomIds 残留悬空 id: ${id}`).toBe(true)
  }
  for (const id of store.getState().selectedBondIds) {
    expect(aliveBonds.has(id), `selectedBondIds 残留悬空 id: ${id}`).toBe(true)
  }
}

describe('引用完整性清扫（隐式删原子/重建键 ID 的 action 出口）', () => {
  it('setAtomCharge 删 H 后选择集无悬空 id', () => {
    const store = setup(water())
    store.getState().selectAtoms(['o1', 'h1', 'h2'])
    expect(store.getState().selectedAtomIds.size).toBe(3)

    store.getState().setAtomCharge('o1', -1) // O⁻ 目标价态下降，resaturate 删一个 H

    expect(activeMol(store).atoms).toHaveLength(2)
    expectNoDanglingSelection(store)
    // 活着的选中原子应保留（O 一定还在）
    expect(store.getState().selectedAtomIds.has('o1')).toBe(true)
    expect(store.getState().selectedAtomIds.size).toBe(2)
  })

  it('setAtomCharge 后 bondSelectedAtoms 类调用不再撞上死原子', () => {
    const store = setup(water())
    store.getState().selectAtoms(['h1', 'h2'])
    store.getState().setAtomCharge('o1', -1)
    // 剪枝后恰好剩 1 个活 H，选择计数与真实原子一致
    const alive = new Set(activeMol(store).atoms.map(a => a.id))
    expect([...store.getState().selectedAtomIds].every(id => alive.has(id))).toBe(true)
  })

  it('setAtomRadical 删 H 后选择集无悬空 id', () => {
    const store = setup(water())
    store.getState().selectAtoms(['o1', 'h1', 'h2'])

    store.getState().setAtomRadical('o1', 1) // 自由基占价位，删一个 H

    expect(activeMol(store).atoms).toHaveLength(2)
    expectNoDanglingSelection(store)
  })

  it('cycleBondLength 升键级删 H 后选择集无悬空 id（公共 EditSlice API）', () => {
    const store = setup(ethane())
    store.getState().selectAtoms(['c1', 'c2', 'h11', 'h12', 'h13', 'h21', 'h22', 'h23'])
    store.getState().selectBond('cc', true)

    const result = store.getState().cycleBondLength('cc')

    expect(result.ok).toBe(true)
    // 升键级会删两端多余 H（价态完整模型）——无论删几个，选择集不许悬空
    expect(activeMol(store).atoms.length).toBeLessThan(8)
    expectNoDanglingSelection(store)
  })

  it('autoInferBonds 重建键后 selectedBondIds 无悬空 id', () => {
    const store = setup(carbonPair(3)) // 1.5Å 处 order 3 会被推断改写为 order 1
    store.getState().selectBond('cc')
    expect(store.getState().selectedBondIds.size).toBe(1)

    store.getState().autoInferBonds()

    const mol = activeMol(store)
    expect(mol.bonds).toHaveLength(1)
    expect(mol.bonds[0]!.order).toBe(1)
    expectNoDanglingSelection(store)
  })

  it('autoInferBonds 拓扑无变化时短路：不压 undo、不动键 ID 与选择', () => {
    const store = setup(carbonPair(1)) // 与推断结果拓扑等价
    store.getState().selectBond('cc')
    const pastBefore = store.temporal.getState().pastStates.length

    store.getState().autoInferBonds()

    expect(store.temporal.getState().pastStates.length).toBe(pastBefore)
    expect(activeMol(store).bonds[0]!.id).toBe('cc') // 键未被重建
    expect(store.getState().selectedBondIds.has('cc')).toBe(true)

    // 再来一次也一样（审查里的复现是连续两次调用）
    store.getState().autoInferBonds()
    expect(store.temporal.getState().pastStates.length).toBe(pastBefore)
  })

  it('autoInferBonds 不把含分隔符原子 ID 的不同拓扑误判为相同', () => {
    const store = setup(separatorCollisionMolecule())
    const pastBefore = store.temporal.getState().pastStates.length

    store.getState().autoInferBonds()

    const mol = activeMol(store)
    expect(mol.bonds).toHaveLength(1)
    expect(new Set([mol.bonds[0]!.atomId1, mol.bonds[0]!.atomId2])).toEqual(
      new Set(['a|b', 'c']),
    )
    expect(store.temporal.getState().pastStates.length).toBe(pastBefore + 1)
  })
})
