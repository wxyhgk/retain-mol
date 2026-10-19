/**
 * conjugation.ts — 共轭体系检测
 *
 * 判断分子中哪些原子/键属于共轭 π 体系。
 *
 * 算法：
 *   1. 根据键级推断每个原子的杂化（sp / sp2 / sp3）
 *   2. 含孤对电子的杂原子（N、O、S）若与 π 体系相邻，视为可参与共轭
 *   3. 共轭原子 = sp / sp2 原子组成的连通分量
 *   4. 连通分量即为独立的共轭体系
 */

import type { Atom, Bond, Molecule } from '../../molecule'
import { bondsOf, otherEnd } from '../../graph/queries'
import { inferHybridization } from './hybridization'

// ── 类型 ──────────────────────────────────────────────────────────────────────

export type Hybridization = 'sp' | 'sp2' | 'sp3'

export interface ConjugationResult {
  /** 每个原子的杂化类型 */
  hybridization: Map<string, Hybridization>
  /** 属于共轭体系的原子 ID */
  conjugatedAtoms: Set<string>
  /** 属于共轭体系的键 ID */
  conjugatedBonds: Set<string>
  /** 各独立共轭体系（每项为一个体系内的原子 ID 列表） */
  systems: string[][]
}

// ── 可参与共轭的杂原子（有孤对电子，可贡献给 π 体系） ────────────────────────
const LONE_PAIR_DONORS = new Set(['N', 'O', 'S'])

/**
 * sp3 杂原子是否通过孤对电子参与共轭：
 * 条件：元素是 N/O/S，且直接与 sp 或 sp2 原子相邻
 */
function isLonePairConjugated(
  atom: Atom,
  bonds: Bond[],
  hybrids: Map<string, Hybridization>,
): boolean {
  if (!LONE_PAIR_DONORS.has(atom.symbol)) return false
  return bondsOf(bonds, atom.id).some(b => {
    const nbId = otherEnd(b, atom.id)!
    const h = hybrids.get(nbId)
    return h === 'sp2' || h === 'sp'
  })
}

/** BFS 求连通分量（仅在 π 原子集合内） */
function connectedComponents(
  piAtoms: Set<string>,
  bonds: Bond[],
): string[][] {
  const visited = new Set<string>()
  const systems: string[][] = []

  // 只保留两端都在 piAtoms 里的键，用于 BFS 邻接表
  const adj = new Map<string, string[]>()
  for (const id of piAtoms) adj.set(id, [])
  for (const b of bonds) {
    if (piAtoms.has(b.atomId1) && piAtoms.has(b.atomId2)) {
      adj.get(b.atomId1)!.push(b.atomId2)
      adj.get(b.atomId2)!.push(b.atomId1)
    }
  }

  for (const startId of piAtoms) {
    if (visited.has(startId)) continue
    const component: string[] = []
    const queue = [startId]
    visited.add(startId)
    while (queue.length > 0) {
      const cur = queue.shift()!
      component.push(cur)
      for (const nb of adj.get(cur) ?? []) {
        if (!visited.has(nb)) { visited.add(nb); queue.push(nb) }
      }
    }
    // 只保留规模 ≥ 2 的体系（孤立 sp2 原子不构成共轭体系）
    if (component.length >= 2) systems.push(component)
  }

  return systems
}

// ── 公开 API ──────────────────────────────────────────────────────────────────

/**
 * 检测分子中的共轭体系。
 * 纯函数，不修改入参。
 */
export function detectConjugation(mol: Molecule): ConjugationResult {
  const { atoms, bonds } = mol

  // 第一轮：按键级确定杂化（复用 analysis/hybridization 的单一实现）
  const hybridization = new Map<string, Hybridization>()
  for (const atom of atoms) {
    hybridization.set(atom.id, inferHybridization(bonds, atom.id))
  }

  // 第二轮：sp3 杂原子若与 π 体系相邻，升级为"可共轭"
  const piAtoms = new Set<string>()
  for (const atom of atoms) {
    const h = hybridization.get(atom.id)!
    if (h === 'sp' || h === 'sp2') {
      piAtoms.add(atom.id)
    } else if (isLonePairConjugated(atom, bonds as Bond[], hybridization)) {
      piAtoms.add(atom.id)
      // 将杂化标记更新为 sp2（反映实际电子状态）
      hybridization.set(atom.id, 'sp2')
    }
  }

  // 求连通分量
  const systems = connectedComponents(piAtoms, bonds as Bond[])

  // 从体系列表反推共轭原子/键集合
  const conjugatedAtoms = new Set<string>()
  for (const sys of systems) {
    for (const id of sys) conjugatedAtoms.add(id)
  }

  const conjugatedBonds = new Set<string>()
  for (const b of bonds) {
    if (conjugatedAtoms.has(b.atomId1) && conjugatedAtoms.has(b.atomId2)) {
      conjugatedBonds.add(b.id)
    }
  }

  return { hybridization, conjugatedAtoms, conjugatedBonds, systems }
}
