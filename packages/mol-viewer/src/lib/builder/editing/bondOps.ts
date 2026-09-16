/**
 * bondOps.ts — 键操作业务规则
 */

import { lookupBondLengthByOrder } from '../../../config/geometry.config'
import type { Atom, Bond, Molecule } from '../../molecule'
import { newBond } from '../../molecule'
import { bondsOf, findBond, otherEnd } from '../graph'
import { availableMaxValenceByBonds } from '../valence'
import {
  planBondOrderChange,
  supportedBondOrders,
  validateBondAddition,
} from '../../chemistry/policies/bondPolicy'
import { flipTetraBranches } from '../../stereo/geometry'
import { calcDihedral } from '../../geometry/measure'

/** 判断两个原子之间是否允许成键 */
export function canBond(
  atom1: Atom,
  atom2: Atom,
  bonds: readonly Bond[],
): { ok: boolean; reason?: string } {
  return validateBondAddition(
    { atoms: [atom1, atom2], bonds },
    { atomId1: atom1.id, atomId2: atom2.id },
  )
}

export type BondEditResult =
  | { ok: true; molecule: Molecule }
  | { ok: false; reason: string }

/**
 * H 槽位成键（价态完整模型下 H 就是可用的成键槽位）：
 *  - 目标是带键的 H：删除两个 H，把各自的父原子相连（闭环的标准操作）
 *  - 目标是重原子 / 孤立 H：删除源 H，父原子与目标直接成键（目标需有空位）
 * 源 H 必须有父原子（孤立 H 的成键走普通 addBond 路径）。
 */
export function bondByReplacingH(
  mol: Molecule,
  sourceHId: string,
  targetId: string,
): BondEditResult {
  const srcH = mol.atoms.find(a => a.id === sourceHId)
  const target = mol.atoms.find(a => a.id === targetId)
  if (!srcH || !target || srcH.symbol !== 'H') return { ok: false, reason: '原子不存在' }

  const srcBond = bondsOf(mol.bonds, sourceHId)[0]
  if (!srcBond) return { ok: false, reason: '孤立 H 没有可让位的键' }
  const parentId = otherEnd(srcBond, sourceHId)!
  if (targetId === parentId || targetId === sourceHId) return { ok: false, reason: '不能与自身成键' }

  // 目标是带键的 H：两个 H 都让位，父原子相连
  const tgtBond = target.symbol === 'H'
    ? bondsOf(mol.bonds, targetId)[0]
    : undefined
  if (tgtBond) {
    const tgtParentId = otherEnd(tgtBond, targetId)!
    if (tgtParentId === parentId) return { ok: false, reason: '两个 H 连在同一个原子上' }
    if (findBond(mol.bonds, parentId, tgtParentId)) return { ok: false, reason: '两原子之间已存在键' }
    // 桥氢可能有多条键（inferBonds 按距离推键，乙硼烷 B₂H₆ 这类结构就会产生），
    // 只删 srcBond/tgtBond 会留下引用已删原子的悬空键 → 必须清掉触及被删 H 的所有键
    const touchesRemovedH = (b: Bond) =>
      b.atomId1 === sourceHId || b.atomId2 === sourceHId ||
      b.atomId1 === targetId || b.atomId2 === targetId
    return {
      ok: true,
      molecule: {
        ...mol,
        atoms: mol.atoms.filter(a => a.id !== sourceHId && a.id !== targetId),
        bonds: [
          ...mol.bonds.filter(b => !touchesRemovedH(b)),
          newBond(parentId, tgtParentId),
        ],
      },
    }
  }

  // 目标是重原子（或孤立 H）：源 H 让位，父原子与目标成键
  if (findBond(mol.bonds, parentId, targetId)) return { ok: false, reason: '两原子之间已存在键' }
  if (availableMaxValenceByBonds(target, mol.bonds) < 1) {
    return { ok: false, reason: `${target.symbol} 已饱和 · 拖到它的 H 上成键` }
  }
  return {
    ok: true,
    molecule: {
      ...mol,
      atoms: mol.atoms.filter(a => a.id !== sourceHId),
      bonds: [
        // 同上：源 H 也可能是桥氢（多键），清掉它触及的所有键而非只删 srcBond
        ...mol.bonds.filter(b => b.atomId1 !== sourceHId && b.atomId2 !== sourceHId),
        newBond(parentId, targetId),
      ],
    },
  }
}

// ── 键长循环（GaussView 语义：几何是真相，键级只是读数）──────────────────────

export type CycleBondLengthResult =
  | { ok: true; molecule: Molecule; order: 1 | 2 | 3; moved: boolean }
  | { ok: false; reason: string }

/** 去掉指定键后，从 startId 出发可达的原子集合（excludeBondId 传任意不存在的 id = 不排除） */
export function reachableWithout(
  bonds: readonly Bond[],
  excludeBondId: string,
  startId: string,
): Set<string> {
  const adj = new Map<string, string[]>()
  for (const b of bonds) {
    if (b.id === excludeBondId) continue
    if (!adj.has(b.atomId1)) adj.set(b.atomId1, [])
    if (!adj.has(b.atomId2)) adj.set(b.atomId2, [])
    adj.get(b.atomId1)!.push(b.atomId2)
    adj.get(b.atomId2)!.push(b.atomId1)
  }
  const seen = new Set([startId])
  const stack = [startId]
  while (stack.length > 0) {
    const id = stack.pop()!
    for (const nb of adj.get(id) ?? []) {
      if (!seen.has(nb)) { seen.add(nb); stack.push(nb) }
    }
  }
  return seen
}

/**
 * 循环调整键长（Shift+点键的语义）：
 *  - 非环键：把较小一侧片段沿键轴整体平移到下一档标准键长（单→双→三→单，
 *    该元素对没有的档位自动跳过），键级字段跟随几何更新
 *  - 环内键：两侧是同一片段无法平移，退回纯键级循环（只改显示/导出值，
 *    不动几何 —— 2D 导入结构手动修键级就是这个场景）
 * 键级永远不会被拖动原子等普通几何编辑改写，只在这里和导入时被设置。
 */
export function cycleBondLength(mol: Molecule, bondId: string): CycleBondLengthResult {
  const bond = mol.bonds.find(b => b.id === bondId)
  if (!bond) return { ok: false, reason: '键不存在' }
  const a1 = mol.atoms.find(a => a.id === bond.atomId1)
  const a2 = mol.atoms.find(a => a.id === bond.atomId2)
  if (!a1 || !a2) return { ok: false, reason: '原子不存在' }

  // 该元素对可用的键级档位（单键永远可用）
  const orders = supportedBondOrders(a1, a2)
  if (orders.length < 2) {
    return { ok: false, reason: `${a1.symbol}–${a2.symbol} 只有单键` }
  }
  const next = orders[(orders.indexOf(bond.order) + 1) % orders.length]
  if (next === undefined) return { ok: false, reason: '没有可用的下一键级' }

  // 用户显式调整键级 = 覆盖导入的 aromatic 标记
  const orderChange = planBondOrderChange(mol, bondId, next)
  if (orderChange.ok === false || !orderChange.changed) {
    return { ok: false, reason: orderChange.ok === false ? orderChange.reason : '键级未变化' }
  }
  const withOrder = orderChange.molecule

  // 环判定：去掉这条键后 a2 仍能到达 a1 → 环内，只改键级
  const side2 = reachableWithout(mol.bonds, bondId, a2.id)
  if (side2.has(a1.id)) {
    return { ok: true, molecule: withOrder, order: next, moved: false }
  }

  const target = lookupBondLengthByOrder(a1.symbol, a2.symbol, next)!
  const dx = a2.x - a1.x, dy = a2.y - a1.y, dz = a2.z - a1.z
  const cur = Math.hypot(dx, dy, dz)
  if (cur < 1e-6) return { ok: false, reason: '两原子重合，无法确定键轴' }

  // 移动较小的一侧，视觉扰动最小
  const side1 = reachableWithout(mol.bonds, bondId, a1.id)
  const moveSide2 = side2.size <= side1.size
  const moving = moveSide2 ? side2 : side1
  const k = ((target - cur) / cur) * (moveSide2 ? 1 : -1)

  const movedMol: Molecule = {
    ...withOrder,
    atoms: withOrder.atoms.map(a => moving.has(a.id)
        ? { ...a, x: a.x + dx * k, y: a.y + dy * k, z: a.z + dz * k }
        : a),
  }
  return {
    ok: true,
    order: next,
    moved: true,
    molecule: movedMol,
  }
}

// ── 双键 E/Z（顺反）────────────────────────────────────────────────────────────

export type BondEZAvailability =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: string }

interface EZEnds {
  readonly bond: Bond
  readonly endA: Atom
  readonly endB: Atom
  readonly subsA: Atom[]
  readonly subsB: Atom[]
}

/** 双键两端 + 各端除对端外的取代基（按存储键序）。端点/取代基缺失返回 null。 */
function ezEnds(mol: Molecule, bondId: string): EZEnds | null {
  const bond = mol.bonds.find(b => b.id === bondId)
  if (!bond) return null
  const atomById = new Map(mol.atoms.map(a => [a.id, a]))
  const endA = atomById.get(bond.atomId1)
  const endB = atomById.get(bond.atomId2)
  if (!endA || !endB) return null
  const substituentsOf = (endId: string): Atom[] => {
    const result: Atom[] = []
    for (const b of mol.bonds) {
      if (b.id === bondId) continue
      const otherId = b.atomId1 === endId ? b.atomId2 : b.atomId2 === endId ? b.atomId1 : null
      if (otherId === null) continue
      const other = atomById.get(otherId)
      if (other) result.push(other)
    }
    return result
  }
  return { bond, endA, endB, subsA: substituentsOf(endA.id), subsB: substituentsOf(endB.id) }
}

/**
 * E/Z 前置检查：双键、非芳香、两端各至少一个显式取代基。
 * 隐 H 端直接拒绝（先补显式 H 再设；看不见的取代基无法判定顺反）。
 */
export function bondEZAvailability(mol: Molecule, bondId: string): BondEZAvailability {
  const ends = ezEnds(mol, bondId)
  if (!ends) return { ok: false, reason: '键不存在' }
  if (ends.bond.order !== 2) return { ok: false, reason: 'E/Z 只支持双键' }
  if (ends.bond.aromatic === true) return { ok: false, reason: '芳香键不支持 E/Z' }
  if (ends.subsA.length === 0 || ends.subsB.length === 0) {
    return { ok: false, reason: '双键两端缺少取代基，无法判定 E/Z' }
  }
  return { ok: true }
}

/**
 * 从几何读当前 E/Z：二面角 s1–a=b–s2（s 取各端首个取代基），
 * |d| ≤ 90° 为同侧（Z），否则为反侧（E）。读不到返回 null。
 */
export function currentEZFromGeometry(mol: Molecule, bondId: string): 'E' | 'Z' | null {
  const ends = ezEnds(mol, bondId)
  if (!ends || ends.bond.order !== 2 || ends.bond.aromatic === true) return null
  const [s1, s2] = [ends.subsA[0], ends.subsB[0]]
  if (!s1 || !s2) return null
  const dihedral = calcDihedral(s1, ends.endA, ends.endB, s2)
  if (!Number.isFinite(dihedral)) return null
  return Math.abs(dihedral) <= 90 ? 'Z' : 'E'
}

function withEZLabel(mol: Molecule, bondId: string, ez: 'E' | 'Z'): Molecule {
  const bond = mol.bonds.find(b => b.id === bondId)
  if (!bond || bond.ez === ez) return mol
  return { ...mol, bonds: mol.bonds.map(b => (b.id === bondId ? { ...b, ez } : b)) }
}

/**
 * 设定 E/Z：几何已是目标只补标记；否则在首个有两个显式取代基的端上
 * 做取代基分支坐标互换（flipTetraBranches 同款刚性搬运），标记同步。
 * 几何与标记一步落盘，调用方包进 undo 事务。失败返回同一引用。
 */
export function setBondEZ(mol: Molecule, bondId: string, target: 'E' | 'Z'): Molecule {
  const ends = ezEnds(mol, bondId)
  if (!ends || bondEZAvailability(mol, bondId).ok === false) return mol
  if (currentEZFromGeometry(mol, bondId) === target) return withEZLabel(mol, bondId, target)
  const swapEnd = ends.subsA.length >= 2
    ? { center: ends.endA, subs: ends.subsA }
    : ends.subsB.length >= 2
      ? { center: ends.endB, subs: ends.subsB }
      : null
  if (!swapEnd) return mol
  const [first, second] = [swapEnd.subs[0] as Atom, swapEnd.subs[1] as Atom]
  const flipped = flipTetraBranches(mol, swapEnd.center.id, first.id, second.id)
  if (!flipped) return mol
  return withEZLabel(flipped.molecule, bondId, target)
}

/** 清除 E/Z 标记（不动几何）；无标记返回同一引用。 */
export function clearBondEZ(mol: Molecule, bondId: string): Molecule {
  const bond = mol.bonds.find(b => b.id === bondId)
  if (!bond || bond.ez === undefined) return mol
  const { ez: _omitted, ...rest } = bond
  return { ...mol, bonds: mol.bonds.map(b => (b.id === bondId ? rest : b)) }
}
