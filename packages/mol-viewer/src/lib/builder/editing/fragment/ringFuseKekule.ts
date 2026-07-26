import type { FragmentDef } from '../../fragmentLibrary'

/**
 * 凯库勒交替的两个相位候选（首选在前）。
 *
 * 交替起点不能只由目标键键级决定：目标是凯库勒单键时，两个共享原子在
 * 旧环里往往已各带一个双键，紧邻它们的新键若被硬赋为双键就产生五价碳。
 * 共享原子已有键级、以及合并式并环（peri/bay）里被覆写的旧键，都只有在
 * 拓扑装配后才能完整核算 —— 所以这里把两个相位都作为候选返回，由
 * remapAndMergeBonds 的最终键级和校验裁决哪个相位合法；两个相位都
 * 违法时并环被干净拒绝。
 *
 * 首选相位保持既有约定：目标双键 → 紧邻共享原子的新键为单键（萘式衔接）；
 * 目标单键 → 首选双键相位（共享原子尚有余价时给出全芳香新环），非法时
 * 由校验回落到单键相位。
 */
export function buildRingFuseOrderOverrideCandidates(
  fragment: FragmentDef,
  f1i: number,
  f2i: number,
  targetBondOrder: 1 | 2 | 3,
  isHydrogenIndex: (index: number) => boolean,
): ReadonlyMap<string, 1 | 2 | 3>[] {
  const ringPath = findRingFusePath(fragment, f1i, f2i, isHydrogenIndex)
  if (!ringPath) return []

  const preferredStart: 1 | 2 = targetBondOrder === 2 ? 1 : 2
  const starts: readonly (1 | 2)[] = preferredStart === 2 ? [2, 1] : [1, 2]
  return starts.map(start => buildAlternation(ringPath, start))
}

/** 兼容旧签名：只取首选相位（无双键模板/找不到环路径时为空 Map）。 */
export function buildRingFuseOrderOverride(
  fragment: FragmentDef,
  f1i: number,
  f2i: number,
  targetBondOrder: 1 | 2 | 3,
  isHydrogenIndex: (index: number) => boolean,
): Map<string, 1 | 2 | 3> {
  const first = buildRingFuseOrderOverrideCandidates(
    fragment, f1i, f2i, targetBondOrder, isHydrogenIndex,
  )[0]
  return first ? new Map(first) : new Map()
}

/**
 * 新环紧邻两个共享原子的新增键级下界（跨全部相位候选取最小）。
 * 供 validateRingFuseSharedValence 用真实新增键级做预检，代替硬编码 +1。
 */
export function ringFuseMinAddedOrders(
  fragment: FragmentDef,
  f1i: number,
  f2i: number,
  overrides: readonly ReadonlyMap<string, 1 | 2 | 3>[],
  isHydrogenIndex: (index: number) => boolean,
): { atF1: number; atF2: number } {
  const ringPath = findRingFusePath(fragment, f1i, f2i, isHydrogenIndex)
  if (!ringPath || ringPath.length < 2) return { atF1: 1, atF2: 1 }
  const keyOf = (a: number, b: number) => `${Math.min(a, b)}-${Math.max(a, b)}`
  const firstKey = keyOf(ringPath[0]!, ringPath[1]!)
  const lastKey = keyOf(ringPath[ringPath.length - 2]!, ringPath[ringPath.length - 1]!)
  const templateOrder = (key: string): number => {
    const bond = fragment.bonds.find(b => keyOf(b.a, b.b) === key)
    return bond?.order ?? 1
  }
  const minOrder = (key: string): number => {
    if (overrides.length === 0) return templateOrder(key)
    return Math.min(...overrides.map(override => override.get(key) ?? templateOrder(key)))
  }
  // ringPath 从 f2i 走到 f1i：首键贴 f2i，尾键贴 f1i
  return { atF1: minOrder(lastKey), atF2: minOrder(firstKey) }
}

function buildAlternation(ringPath: readonly number[], start: 1 | 2): Map<string, 1 | 2 | 3> {
  const orderOverride = new Map<string, 1 | 2 | 3>()
  let order: 1 | 2 = start
  for (let index = 0; index < ringPath.length - 1; index += 1) {
    const cur = ringPath[index]
    const next = ringPath[index + 1]
    if (cur === undefined || next === undefined) continue
    orderOverride.set(`${Math.min(cur, next)}-${Math.max(cur, next)}`, order)
    order = order === 2 ? 1 : 2
  }
  return orderOverride
}

/** 模板重原子图里 f2i → f1i 的环路径（绕开共享边本身）；无双键模板不参与凯库勒重排。 */
function findRingFusePath(
  fragment: FragmentDef,
  f1i: number,
  f2i: number,
  isHydrogenIndex: (index: number) => boolean,
): number[] | null {
  if (!fragment.bonds.some(bond => bond.order === 2)) return null

  const heavyAdj = new Map<number, number[]>()
  for (const fragmentBond of fragment.bonds) {
    if (isHydrogenIndex(fragmentBond.a) || isHydrogenIndex(fragmentBond.b)) continue
    heavyAdj.set(fragmentBond.a, [...(heavyAdj.get(fragmentBond.a) ?? []), fragmentBond.b])
    heavyAdj.set(fragmentBond.b, [...(heavyAdj.get(fragmentBond.b) ?? []), fragmentBond.a])
  }

  return findAlternatePath(heavyAdj, f2i, f1i, f1i, f2i)
}

function findAlternatePath(
  adjacency: ReadonlyMap<number, readonly number[]>,
  start: number,
  goal: number,
  blockedA: number,
  blockedB: number,
): number[] | null {
  const queue = [start]
  const parent = new Map<number, number | null>([[start, null]])

  for (let head = 0; head < queue.length; head += 1) {
    const current = queue[head]
    if (current === undefined) break
    if (current === goal) break
    for (const next of adjacency.get(current) ?? []) {
      const isBlockedEdge = (current === blockedA && next === blockedB)
        || (current === blockedB && next === blockedA)
      if (isBlockedEdge || parent.has(next)) continue
      parent.set(next, current)
      queue.push(next)
    }
  }

  if (!parent.has(goal)) return null
  const path: number[] = []
  let current: number | null = goal
  while (current !== null) {
    path.push(current)
    current = parent.get(current) ?? null
  }
  return path.reverse()
}
