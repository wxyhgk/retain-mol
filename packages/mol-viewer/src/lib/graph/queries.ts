/**
 * graph.ts — 分子图的基础查询（唯一实现）
 *
 * 全仓的连接数/键存在性/邻居/H 宿主查询统一走这里，
 * 不要再内联 `bonds.filter(b => b.atomId1 === id || b.atomId2 === id)` 重写。
 * 纯函数，不修改入参。
 */

import type { Atom, Bond, Molecule } from '../model/types'

/** 原子触及的全部键 */
export function bondsOf(bonds: readonly Bond[], atomId: string): Bond[] {
  return bonds.filter(b => b.atomId1 === atomId || b.atomId2 === atomId)
}

/** 原子的连接数（数邻居条数，不计键级——价态完整模型的硬规则） */
export function degree(bonds: readonly Bond[], atomId: string): number {
  return bondsOf(bonds, atomId).length
}

/** 键上另一端的原子 id（键不触及该原子返回 null） */
export function otherEnd(bond: Bond, atomId: string): string | null {
  if (bond.atomId1 === atomId) return bond.atomId2
  if (bond.atomId2 === atomId) return bond.atomId1
  return null
}

/** 两原子间的键（无则 undefined） */
export function findBond(bonds: readonly Bond[], id1: string, id2: string): Bond | undefined {
  return bonds.find(
    b => (b.atomId1 === id1 && b.atomId2 === id2) ||
         (b.atomId1 === id2 && b.atomId2 === id1),
  )
}

/** 原子的全部邻居原子（桥键等多重连接会产生重复项，与内联实现一致） */
export function neighborsOf(mol: Molecule, atomId: string): Atom[] {
  const byId = new Map(mol.atoms.map(a => [a.id, a]))
  const out: Atom[] = []
  for (const b of mol.bonds) {
    const nbId = otherEnd(b, atomId)
    if (nbId === null) continue
    const nb = byId.get(nbId)
    if (nb) out.push(nb)
  }
  return out
}

/** 原子的 H 邻居 */
export function hNeighborsOf(mol: Molecule, atomId: string): Atom[] {
  return neighborsOf(mol, atomId).filter(a => a.symbol === 'H')
}

/**
 * H 原子的宿主（第一条键的另一端；孤立 H 或宿主原子缺失返回 null）。
 * 价态完整模型里"槽位 H"的父原子。
 */
export function hParentOf(mol: Molecule, hId: string): { parent: Atom; bond: Bond } | null {
  const bond = mol.bonds.find(b => b.atomId1 === hId || b.atomId2 === hId)
  if (!bond) return null
  const parentId = bond.atomId1 === hId ? bond.atomId2 : bond.atomId1
  const parent = mol.atoms.find(a => a.id === parentId)
  if (!parent) return null
  return { parent, bond }
}
