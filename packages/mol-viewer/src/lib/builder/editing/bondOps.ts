/**
 * bondOps.ts — 键操作业务规则
 */

import { getElementConfig } from '../../../config/elements.config'
import { lookupBondLengthByOrder } from '../../../config/geometry.config'
import type { Atom, Bond, Molecule } from '../../molecule'
import { newBond } from '../../molecule'

/** 判断两个原子之间是否允许成键 */
export function canBond(
  atom1: Atom,
  atom2: Atom,
  bonds: readonly Bond[],
): { ok: boolean; reason?: string } {
  const el1 = getElementConfig(atom1.symbol)
  const el2 = getElementConfig(atom2.symbol)

  const existing = bonds.find(
    b => (b.atomId1 === atom1.id && b.atomId2 === atom2.id) ||
         (b.atomId1 === atom2.id && b.atomId2 === atom1.id)
  )
  if (existing) return { ok: false, reason: '两原子之间已存在键' }

  const bonds1 = bonds.filter(b => b.atomId1 === atom1.id || b.atomId2 === atom1.id).length
  const bonds2 = bonds.filter(b => b.atomId1 === atom2.id || b.atomId2 === atom2.id).length

  if (bonds1 >= el1.maxBonds) return { ok: false, reason: `${atom1.symbol} 已达最大键数 (${el1.maxBonds})` }
  if (bonds2 >= el2.maxBonds) return { ok: false, reason: `${atom2.symbol} 已达最大键数 (${el2.maxBonds})` }

  return { ok: true }
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

  const srcBond = mol.bonds.find(b => b.atomId1 === sourceHId || b.atomId2 === sourceHId)
  if (!srcBond) return { ok: false, reason: '孤立 H 没有可让位的键' }
  const parentId = srcBond.atomId1 === sourceHId ? srcBond.atomId2 : srcBond.atomId1
  if (targetId === parentId || targetId === sourceHId) return { ok: false, reason: '不能与自身成键' }

  const hasBond = (a: string, b: string) => mol.bonds.some(
    x => (x.atomId1 === a && x.atomId2 === b) || (x.atomId1 === b && x.atomId2 === a)
  )

  // 目标是带键的 H：两个 H 都让位，父原子相连
  const tgtBond = target.symbol === 'H'
    ? mol.bonds.find(b => b.atomId1 === targetId || b.atomId2 === targetId)
    : undefined
  if (tgtBond) {
    const tgtParentId = tgtBond.atomId1 === targetId ? tgtBond.atomId2 : tgtBond.atomId1
    if (tgtParentId === parentId) return { ok: false, reason: '两个 H 连在同一个原子上' }
    if (hasBond(parentId, tgtParentId)) return { ok: false, reason: '两原子之间已存在键' }
    return {
      ok: true,
      molecule: {
        ...mol,
        atoms: mol.atoms.filter(a => a.id !== sourceHId && a.id !== targetId),
        bonds: [
          ...mol.bonds.filter(b => b.id !== srcBond.id && b.id !== tgtBond.id),
          newBond(parentId, tgtParentId),
        ],
      },
    }
  }

  // 目标是重原子（或孤立 H）：源 H 让位，父原子与目标成键
  if (hasBond(parentId, targetId)) return { ok: false, reason: '两原子之间已存在键' }
  const el = getElementConfig(target.symbol)
  const targetCount = mol.bonds.filter(b => b.atomId1 === targetId || b.atomId2 === targetId).length
  if (targetCount >= el.maxBonds) {
    return { ok: false, reason: `${target.symbol} 已饱和 · 拖到它的 H 上成键` }
  }
  return {
    ok: true,
    molecule: {
      ...mol,
      atoms: mol.atoms.filter(a => a.id !== sourceHId),
      bonds: [
        ...mol.bonds.filter(b => b.id !== srcBond.id),
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
  const orders = ([1, 2, 3] as const).filter(
    o => lookupBondLengthByOrder(a1.symbol, a2.symbol, o) !== null,
  )
  if (orders.length < 2) {
    return { ok: false, reason: `${a1.symbol}–${a2.symbol} 只有单键` }
  }
  const next = orders[(orders.indexOf(bond.order) + 1) % orders.length]

  // 用户显式调整键级 = 覆盖导入的 aromatic 标记
  const withOrder: Molecule = {
    ...mol,
    bonds: mol.bonds.map(b =>
      b.id === bondId ? { ...b, order: next, aromatic: undefined } : b),
  }

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

  return {
    ok: true,
    order: next,
    moved: true,
    molecule: {
      ...withOrder,
      atoms: withOrder.atoms.map(a => moving.has(a.id)
        ? { ...a, x: a.x + dx * k, y: a.y + dy * k, z: a.z + dz * k }
        : a),
    },
  }
}
