/**
 * aromaticity.ts — 芳香性检测
 *
 * 基于 Hückel 规则（4n+2 π 电子）判断环是否具有芳香性。
 *
 * 算法：
 *   1. findRings：DFS 寻找所有简单环（≤ maxSize 原子）
 *   2. 检查环内原子是否全为 sp2 / 孤对电子供体
 *   3. 统计环内 π 电子（环内双键 ×2 + 孤对杂原子 ×2）
 *   4. Hückel 规则：π 电子数 = 4n+2（n = 0,1,2,…）→ 芳香
 */

import type { Atom, Bond, Molecule } from '../../molecule'
import { bondsOf, degree } from '../graph'

// ── 类型 ──────────────────────────────────────────────────────────────────────

export interface AromaticityResult {
  /** 每个芳香环内的原子 ID 列表 */
  aromaticRings: string[][]
  /** 属于任意芳香环的原子 ID */
  aromaticAtoms: Set<string>
  /** 属于任意芳香环的键 ID */
  aromaticBonds: Set<string>
}

// ── 常量 ──────────────────────────────────────────────────────────────────────

/** 可通过孤对电子参与芳香体系的杂原子 */
const LONE_PAIR_DONORS = new Set(['N', 'O', 'S'])

// ── 环检测 ────────────────────────────────────────────────────────────────────

/**
 * 在分子图中寻找所有简单环，返回去重后的原子 ID 列表集合。
 * maxSize 限制环的大小（默认 ≤ 8，覆盖常见芳香环，避免大环误检）。
 */
export function findRings(
  atoms: readonly Atom[],
  bonds: readonly Bond[],
  maxSize = 8,
): string[][] {
  // 邻接表
  const adj = new Map<string, string[]>()
  for (const a of atoms) adj.set(a.id, [])
  for (const b of bonds) {
    adj.get(b.atomId1)?.push(b.atomId2)
    adj.get(b.atomId2)?.push(b.atomId1)
  }

  const seen = new Set<string>()   // 已收录环的规范化 key（原子 ID 排序后 join）
  const rings: string[][] = []

  function dfs(
    startId: string,
    currentId: string,
    parentId: string | null,
    path: string[],
  ): void {
    for (const nbId of (adj.get(currentId) ?? [])) {
      if (nbId === parentId) continue              // 不走回头路
      if (nbId === startId && path.length >= 3) {  // 回到起点 → 找到一个环
        const key = [...path].sort().join(',')
        if (!seen.has(key)) {
          seen.add(key)
          rings.push([...path])
        }
        continue
      }
      if (!path.includes(nbId) && path.length < maxSize) {
        dfs(startId, nbId, currentId, [...path, nbId])
      }
    }
  }

  for (const a of atoms) {
    dfs(a.id, a.id, null, [a.id])
  }

  return rings
}

// ── π 电子计数 ────────────────────────────────────────────────────────────────

/**
 * 统计一个环的 π 电子数：
 *   - 环内每条双键：+2 π 电子
 *   - 环内无双键的孤对供体（N/O/S）：+2 π 电子（孤对贡献）
 */
function countPiElectrons(
  ringIds: string[],
  atoms: readonly Atom[],
  bonds: readonly Bond[],
): number {
  const ringSet = new Set(ringIds)
  const atomById = new Map(atoms.map(a => [a.id, a]))

  let pi = 0

  // 环内双键 → 每条 +2
  for (const b of bonds) {
    if (b.order === 2 && ringSet.has(b.atomId1) && ringSet.has(b.atomId2)) {
      pi += 2
    }
  }

  // 环内杂原子：若在环内无双键，贡献孤对
  for (const id of ringIds) {
    const atom = atomById.get(id)
    if (!atom || !LONE_PAIR_DONORS.has(atom.symbol)) continue

    const hasDoubleBondInRing = bonds.some(b =>
      b.order === 2 &&
      ((b.atomId1 === id && ringSet.has(b.atomId2)) ||
       (b.atomId2 === id && ringSet.has(b.atomId1)))
    )
    if (!hasDoubleBondInRing) pi += 2
  }

  return pi
}

// ── Hückel 规则 ───────────────────────────────────────────────────────────────

/** 判断 π 电子数是否满足 Hückel 规则（4n+2，n ≥ 0） */
function isHuckel(pi: number): boolean {
  return pi >= 2 && (pi - 2) % 4 === 0
}

// ── 几何芳香判据 ──────────────────────────────────────────────────────────────

/**
 * 芳香键长窗口 (Å)。计算化学语义：距离即真相 —— 环内所有键长
 * 落在对应元素对的窗口内（介于典型单键与双键之间的均匀化长度），
 * 即认定芳香，不依赖 Kekulé 单双键交替的键级簿记。
 */
const AROMATIC_LENGTH_WINDOWS: Record<string, [number, number]> = {
  'C-C': [1.36, 1.43],   // 苯 1.39
  'C-N': [1.31, 1.39],   // 吡啶 1.34
  'C-O': [1.33, 1.40],   // 呋喃 1.36
  'C-S': [1.66, 1.76],   // 噻吩 1.71
  'N-N': [1.29, 1.37],
}

/**
 * 几何判据：5~7 元简单环 + 每个环原子连接数 ≤ 3（sp2 形态，排除
 * 恰好摆成芳香键长的饱和环）+ 环内每条键落在芳香键长窗口。
 */
function isGeometricallyAromatic(
  ringIds: string[],
  atoms: readonly Atom[],
  bonds: readonly Bond[],
  ringBonds: readonly Bond[],
): boolean {
  if (ringIds.length < 5 || ringIds.length > 7) return false
  if (ringBonds.length !== ringIds.length) return false   // 非简单环（有跨环键）
  const atomById = new Map(atoms.map(a => [a.id, a]))

  for (const id of ringIds) {
    if (degree(bonds, id) > 3) return false
  }
  for (const b of ringBonds) {
    const a1 = atomById.get(b.atomId1)
    const a2 = atomById.get(b.atomId2)
    if (!a1 || !a2) return false
    const win = AROMATIC_LENGTH_WINDOWS[[a1.symbol, a2.symbol].sort().join('-')]
    if (!win) return false
    const d = Math.hypot(a1.x - a2.x, a1.y - a2.y, a1.z - a2.z)
    if (d < win[0] || d > win[1]) return false
  }
  return true
}

// ── 环内 sp2 检查 ─────────────────────────────────────────────────────────────

/**
 * 判断环内所有原子是否均为"π 体系兼容"：
 *   - sp2（有双键）
 *   - sp（有三键）
 *   - 孤对供体 N/O/S（即便 sp3 也可贡献）
 */
function isFullyConjugatedRing(
  ringIds: string[],
  atoms: readonly Atom[],
  bonds: readonly Bond[],
): boolean {
  const atomById = new Map(atoms.map(a => [a.id, a]))

  for (const id of ringIds) {
    const atom = atomById.get(id)
    if (!atom) return false

    const atomBonds = bondsOf(bonds, id)
    const hasDouble = atomBonds.some(b => b.order === 2)
    const hasTriple = atomBonds.some(b => b.order === 3)

    const isPiCapable = hasDouble || hasTriple || LONE_PAIR_DONORS.has(atom.symbol)
    if (!isPiCapable) return false
  }
  return true
}

// ── 公开 API ──────────────────────────────────────────────────────────────────

/**
 * 检测分子中所有芳香环。
 * 纯函数，不修改入参。
 */
export function detectAromaticity(mol: Molecule): AromaticityResult {
  const { atoms, bonds } = mol
  const rings = findRings(atoms, bonds)

  const aromaticRings: string[][] = []

  for (const ring of rings) {
    const ringSet = new Set(ring)
    const ringBonds = bonds.filter(b => ringSet.has(b.atomId1) && ringSet.has(b.atomId2))

    // Trust importer aromatic flag (e.g. SDF bond type 4 → OCL isAromaticBond)
    if (ringBonds.length > 0 && ringBonds.every(b => b.aromatic)) {
      aromaticRings.push(ring)
      continue
    }

    // 几何判据：键长均匀落在芳香窗口（手工搭建/片段放置的主路径，不看键级）
    if (isGeometricallyAromatic(ring, atoms, bonds, ringBonds)) {
      aromaticRings.push(ring)
      continue
    }

    if (!isFullyConjugatedRing(ring, atoms, bonds)) continue
    const pi = countPiElectrons(ring, atoms, bonds)
    if (isHuckel(pi)) aromaticRings.push(ring)
  }

  const aromaticAtoms = new Set<string>()
  const aromaticBonds = new Set<string>()

  for (const ring of aromaticRings) {
    const ringSet = new Set(ring)
    for (const id of ring) aromaticAtoms.add(id)
    for (const b of bonds) {
      if (ringSet.has(b.atomId1) && ringSet.has(b.atomId2)) {
        aromaticBonds.add(b.id)
      }
    }
  }

  return { aromaticRings, aromaticAtoms, aromaticBonds }
}
