/**
 * buildingOps.test.ts — P1 构建 op 的 store 层行为测试（去 H / wedge / 手性 / E-Z / 芳香归一 / 批量）。
 * 只断言可观察行为（分子状态 + 单步 undo），风格同 bondEditActions.test.ts。
 */
import { beforeEach, describe, expect, it } from 'vitest'
import type { Molecule } from '../../lib/molecule'
import { newAtom, newBond } from '../../lib/molecule'
import { autoAddHydrogens } from '../../lib/builder/editing/atomOps'
import { parityFromCoords } from '../../lib/stereo/geometry'
import { perceiveAtomChirality } from '../../lib/stereo/perception'
import { useMoleculeStore } from '../moleculeStore'

const store = () => useMoleculeStore.getState()
const temporal = () => useMoleculeStore.temporal.getState()
const activeMolecule = (): Molecule => {
  const state = store()
  return state.objectsById[state.activeObjectId!]!.molecule
}
const pastLength = () => temporal().pastStates.length

function reset(mol: Molecule): void {
  temporal().resume()
  const objectIds = [...store().objectOrder]
  for (const id of objectIds.slice(1)) store().removeSceneObject(id)
  if (objectIds[0]) {
    store().setObjectVisible(objectIds[0], true)
    store().setObjectLocked(objectIds[0], false)
    store().setActiveObject(objectIds[0])
  }
  store().setMolecule(mol)
  store().clearSelection()
  temporal().clear()
}

function methane(): { mol: Molecule; carbonId: string } {
  const c = newAtom('C', 0, 0, 0)
  return { mol: autoAddHydrogens({ atoms: [c], bonds: [] }), carbonId: c.id }
}

function ethane(): { mol: Molecule; c1Id: string; c2Id: string } {
  const c1 = newAtom('C', -0.77, 0, 0)
  const c2 = newAtom('C', 0.77, 0, 0)
  const mol = autoAddHydrogens({ atoms: [c1, c2], bonds: [newBond(c1.id, c2.id, 1)] })
  return { mol, c1Id: c1.id, c2Id: c2.id }
}

/** 四面体手性中心：中心 C + 4 个化学各异的显式单键配体（H/F/O/C）。配体若全同则按收紧定义不是手性中心，门控会拒绝——几何坐标保持四面体非平面。 */
function chiralCenter(): { mol: Molecule; centerId: string; ligandIds: [string, string, string, string]; bondIds: string[] } {
  const ligands: Array<{ symbol: string; x: number; y: number; z: number }> = [
    { symbol: 'H', x: 1, y: 1, z: 1 },
    { symbol: 'F', x: 1, y: -1, z: -1 },
    { symbol: 'O', x: -1, y: 1, z: -1 },
    { symbol: 'C', x: -1, y: -1, z: 1 },
  ]
  const center = newAtom('C', 0, 0, 0)
  const atoms = [center]
  const bonds = []
  for (const p of ligands) {
    const ligand = newAtom(p.symbol, p.x, p.y, p.z)
    atoms.push(ligand)
    bonds.push(newBond(center.id, ligand.id, 1))
  }
  const mol = { atoms, bonds }
  const ligandIds = bonds.map(b => b.atomId2) as [string, string, string, string]
  return { mol, centerId: center.id, ligandIds, bondIds: bonds.map(b => b.id) }
}

function storedParity(mol: Molecule, centerId: string): 1 | -1 | 0 {
  const ligandIds = mol.bonds
    .filter(b => b.atomId1 === centerId || b.atomId2 === centerId)
    .map(b => (b.atomId1 === centerId ? b.atomId2 : b.atomId1))
  const coords = ligandIds.map(id => {
    const atom = mol.atoms.find(a => a.id === id)!
    return { x: atom.x, y: atom.y, z: atom.z }
  })
  return parityFromCoords(coords as [typeof coords[number], typeof coords[number], typeof coords[number], typeof coords[number]])
}

/** 反式 2-丁烯骨架：s1a 上左 / s2a 下左 / s1b 下右 / s2b 上右，首取代基对反侧（E） */
function transButene(): { mol: Molecule; doubleId: string; s1aId: string } {
  const a = newAtom('C', -0.67, 0, 0)
  const b = newAtom('C', 0.67, 0, 0)
  const s1a = newAtom('C', -1.44, 0.9, 0)
  const s2a = newAtom('C', -1.44, -0.9, 0)
  const s1b = newAtom('C', 1.5, -0.9, 0)
  const s2b = newAtom('C', 1.5, 0.9, 0)
  const doubleBond = newBond(a.id, b.id, 2)
  const mol: Molecule = {
    atoms: [a, b, s1a, s2a, s1b, s2b],
    bonds: [
      doubleBond,
      newBond(a.id, s1a.id, 1),
      newBond(a.id, s2a.id, 1),
      newBond(b.id, s1b.id, 1),
      newBond(b.id, s2b.id, 1),
    ],
  }
  return { mol, doubleId: doubleBond.id, s1aId: s1a.id }
}

/** 苯式单环：6 个 C，边长 1.39（芳香键长窗口内），全单键、无芳香标记 */
function benzeneSingleBonds(): Molecule {
  const radius = 1.39
  const atoms = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2
    return newAtom('C', radius * Math.cos(angle), radius * Math.sin(angle), 0)
  })
  const bonds = atoms.map((atom, i) => newBond(atom.id, atoms[(i + 1) % 6]!.id, 1))
  return { atoms, bonds }
}

describe('removeHydrogens', () => {
  it('去掉全部分子显式 H，一步 undo 可恢复', () => {
    const { mol } = methane()
    reset(mol)
    expect(activeMolecule().atoms).toHaveLength(5)

    store().removeHydrogens()

    const stripped = activeMolecule()
    expect(stripped.atoms).toHaveLength(1)
    expect(stripped.bonds).toHaveLength(0)
    expect(pastLength()).toBe(1)

    temporal().undo()
    expect(activeMolecule().atoms).toHaveLength(5)
  })

  it('onlySelected 只去选中原子上的 H', () => {
    const { mol, c1Id, c2Id } = ethane()
    reset(mol)
    store().selectAtom(c1Id)

    store().removeHydrogens({ onlySelected: true })

    const stripped = activeMolecule()
    const remainingH = stripped.atoms.filter(a => a.symbol === 'H')
    expect(remainingH).toHaveLength(3)
    // c2 侧的 3 个 H 保留：每个剩余 H 的邻居都是 c2
    for (const h of remainingH) {
      const bond = stripped.bonds.find(b => b.atomId1 === h.id || b.atomId2 === h.id)!
      const parentId = bond.atomId1 === h.id ? bond.atomId2 : bond.atomId1
      expect(parentId).toBe(c2Id)
    }

    temporal().undo()
    expect(activeMolecule().atoms).toHaveLength(8)
  })

  it('onlySelected 但无选中时退化为全部分子', () => {
    const { mol } = methane()
    reset(mol)

    store().removeHydrogens({ onlySelected: true })

    expect(activeMolecule().atoms).toHaveLength(1)
    expect(pastLength()).toBe(1)
  })
})

describe('setBondWedge', () => {
  it('设置与清除楔形各为一步 undo', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.54, 0, 0)
    const bond = newBond(c1.id, c2.id, 1)
    reset({ atoms: [c1, c2], bonds: [bond] })

    store().setBondWedge(bond.id, 'up')
    expect(activeMolecule().bonds[0]?.wedge).toBe('up')
    expect(pastLength()).toBe(1)

    store().setBondWedge(bond.id, 'up')
    expect(pastLength()).toBe(1)

    store().setBondWedge(bond.id, 'none')
    expect(activeMolecule().bonds[0]?.wedge).toBeUndefined()
    expect(pastLength()).toBe(2)

    temporal().undo()
    expect(activeMolecule().bonds[0]?.wedge).toBe('up')
  })
})

describe('setChirality', () => {
  it('CIP 相符只改标记，再次设置不压历史', () => {
    const { mol, centerId } = chiralCenter()
    reset(mol)
    const target = perceiveAtomChirality(mol).get(centerId)!

    const result = store().setChirality(centerId, target)

    expect(result).toEqual({ ok: true })
    expect(activeMolecule().atoms.find(a => a.id === centerId)?.chirality).toBe(target)
    expect(pastLength()).toBe(1)

    store().setChirality(centerId, target)
    expect(pastLength()).toBe(1)
  })

  it('CIP 不符翻转分支几何并同步标记', () => {
    const { mol, centerId } = chiralCenter()
    reset(mol)
    const before = storedParity(activeMolecule(), centerId)
    const target = perceiveAtomChirality(mol).get(centerId) === 'R' ? 'S' : 'R'

    const result = store().setChirality(centerId, target)

    expect(result).toEqual({ ok: true })
    const after = activeMolecule()
    expect(after.atoms.find(a => a.id === centerId)?.chirality).toBe(target)
    expect(storedParity(after, centerId)).toBe(before === 1 ? -1 : 1)
    expect(pastLength()).toBe(1)

    temporal().undo()
    expect(activeMolecule().atoms.find(a => a.id === centerId)?.chirality).toBeUndefined()
  })

  it('替换配体后清除失效标签，单步 undo/redo 连同标签一起恢复', () => {
    const { mol, centerId, ligandIds } = chiralCenter()
    reset(mol)
    store().setChirality(centerId, 'R')
    const before = activeMolecule()
    temporal().clear()
    store().replaceAtom(ligandIds[2], 'F')
    expect(activeMolecule().atoms.find(a => a.id === centerId)?.chirality).toBeUndefined()
    expect(pastLength()).toBe(1)
    temporal().undo()
    expect(activeMolecule()).toEqual(before)
    temporal().redo()
    expect(activeMolecule().atoms.find(a => a.id === centerId)?.chirality).toBeUndefined()
  })

  it('门控失败返回 reason 且不压历史', () => {
    const n = newAtom('N', 0, 0, 0)
    reset(autoAddHydrogens({ atoms: [n], bonds: [] }))

    const result = store().setChirality(n.id, 'R')

    expect(result.ok).toBe(false)
    expect(result.reason).toBeTruthy()
    expect(pastLength()).toBe(0)
  })

  it("'none' 清标记与连键楔形", () => {
    const { mol, centerId, bondIds } = chiralCenter()
    reset(mol)
    store().setBondWedge(bondIds[0]!, 'up')
    store().setChirality(centerId, 'R')
    temporal().clear()

    store().setChirality(centerId, 'none')

    const after = activeMolecule()
    expect(after.atoms.find(a => a.id === centerId)?.chirality).toBeUndefined()
    expect(after.bonds.every(b => b.wedge === undefined)).toBe(true)
    expect(pastLength()).toBe(1)
  })
})

describe('setEZ', () => {
  it('E→Z 交换一端取代基坐标并同步标记，一步 undo 含几何', () => {
    const { mol, doubleId, s1aId } = transButene()
    reset(mol)
    const beforeY = activeMolecule().atoms.find(a => a.id === s1aId)!.y
    expect(beforeY).toBeGreaterThan(0)

    const result = store().setEZ(doubleId, 'Z')

    expect(result).toEqual({ ok: true })
    const after = activeMolecule()
    expect(after.bonds.find(b => b.id === doubleId)?.ez).toBe('Z')
    // s1a 与 s2a 分支互换：s1a 落到下侧
    expect(after.atoms.find(a => a.id === s1aId)!.y).toBeCloseTo(-beforeY, 6)
    expect(pastLength()).toBe(1)

    temporal().undo()
    const restored = activeMolecule()
    expect(restored.bonds.find(b => b.id === doubleId)?.ez).toBeUndefined()
    expect(restored.atoms.find(a => a.id === s1aId)!.y).toBeCloseTo(beforeY, 6)
  })

  it("'none' 只清标记不动几何；单键返回 reason", () => {
    const { mol, doubleId } = transButene()
    reset(mol)
    store().setEZ(doubleId, 'Z')
    const geometry = activeMolecule().atoms.map(a => [a.x, a.y, a.z])
    temporal().clear()

    const cleared = store().setEZ(doubleId, 'none')
    expect(cleared).toEqual({ ok: true })
    const after = activeMolecule()
    expect(after.bonds.find(b => b.id === doubleId)?.ez).toBeUndefined()
    expect(after.atoms.map(a => [a.x, a.y, a.z])).toEqual(geometry)
    expect(pastLength()).toBe(1)

    const singleId = after.bonds.find(b => b.order === 1)!.id
    const gated = store().setEZ(singleId, 'E')
    expect(gated.ok).toBe(false)
    expect(gated.reason).toBeTruthy()
    expect(pastLength()).toBe(1)
  })
})

describe('normalizeAromaticity', () => {
  it('苯式单键环感知为芳香并排单双交替，一步 undo', () => {
    reset(benzeneSingleBonds())

    store().normalizeAromaticity()

    const after = activeMolecule()
    expect(after.bonds.filter(b => b.aromatic === true)).toHaveLength(6)
    const orders = after.bonds.map(b => b.order)
    expect(orders.filter(o => o === 2)).toHaveLength(3)
    for (let i = 0; i < 6; i += 1) {
      expect(orders[i]).not.toBe(orders[(i + 1) % 6])
    }
    expect(pastLength()).toBe(1)

    temporal().undo()
    const restored = activeMolecule()
    expect(restored.bonds.every(b => b.order === 1)).toBe(true)
    expect(restored.bonds.every(b => b.aromatic !== true)).toBe(true)
  })

  it('非芳香分子不压历史', () => {
    const { mol } = methane()
    reset(mol)

    store().normalizeAromaticity()

    expect(pastLength()).toBe(0)
  })
})

describe('batch', () => {
  it('setBondOrders 一次改多个键级，只压一步 undo', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.54, 0, 0)
    const c3 = newAtom('C', 3.08, 0, 0)
    const c4 = newAtom('C', 4.62, 0, 0)
    const b1 = newBond(c1.id, c2.id, 1)
    const b2 = newBond(c3.id, c4.id, 1)
    reset({ atoms: [c1, c2, c3, c4], bonds: [b1, b2] })

    store().setBondOrders([b1.id, b2.id], 2)

    const after = activeMolecule()
    expect(after.bonds.find(b => b.id === b1.id)?.order).toBe(2)
    expect(after.bonds.find(b => b.id === b2.id)?.order).toBe(2)
    expect(pastLength()).toBe(1)

    temporal().undo()
    const restored = activeMolecule()
    expect(restored.bonds.find(b => b.id === b1.id)?.order).toBe(1)
    expect(restored.bonds.find(b => b.id === b2.id)?.order).toBe(1)

    // undo 后历史已消费；无效 id 不产生新历史
    store().setBondOrders(['missing-bond'], 2)
    expect(pastLength()).toBe(0)
  })

  it('setAtomCharges 一次改多个电荷并重饱和，只压一步 undo', () => {
    const n1 = newAtom('N', 0, 0, 0)
    const n2 = newAtom('N', 5, 0, 0)
    reset(autoAddHydrogens({ atoms: [n1, n2], bonds: [] }))
    expect(activeMolecule().atoms.filter(a => a.symbol === 'H')).toHaveLength(6)

    store().setAtomCharges([n1.id, n2.id], 1)

    const after = activeMolecule()
    expect(after.atoms.find(a => a.id === n1.id)?.charge).toBe(1)
    expect(after.atoms.find(a => a.id === n2.id)?.charge).toBe(1)
    // N⁺ 重饱和为 NH₄⁺
    expect(after.atoms.filter(a => a.symbol === 'H')).toHaveLength(8)
    expect(pastLength()).toBe(1)

    temporal().undo()
    const restored = activeMolecule()
    expect(restored.atoms.find(a => a.id === n1.id)?.charge).toBeUndefined()
    expect(restored.atoms.filter(a => a.symbol === 'H')).toHaveLength(6)
  })
})
