import type { FragmentDef } from '../../fragmentLibrary'

export function buildRingFuseOrderOverride(
  fragment: FragmentDef,
  f1i: number,
  f2i: number,
  targetBondOrder: 1 | 2 | 3,
  isHydrogenIndex: (index: number) => boolean,
): Map<string, 1 | 2 | 3> {
  const orderOverride = new Map<string, 1 | 2 | 3>()
  if (!fragment.bonds.some(bond => bond.order === 2)) return orderOverride

  const heavyAdj = new Map<number, number[]>()
  for (const fragmentBond of fragment.bonds) {
    if (isHydrogenIndex(fragmentBond.a) || isHydrogenIndex(fragmentBond.b)) continue
    heavyAdj.set(fragmentBond.a, [...(heavyAdj.get(fragmentBond.a) ?? []), fragmentBond.b])
    heavyAdj.set(fragmentBond.b, [...(heavyAdj.get(fragmentBond.b) ?? []), fragmentBond.a])
  }

  const ringPath = findAlternatePath(heavyAdj, f2i, f1i, f1i, f2i)
  if (!ringPath) return orderOverride

  let order: 1 | 2 = targetBondOrder === 2 ? 1 : 2
  for (let index = 0; index < ringPath.length - 1; index += 1) {
    const cur = ringPath[index]
    const next = ringPath[index + 1]
    orderOverride.set(`${Math.min(cur, next)}-${Math.max(cur, next)}`, order)
    order = order === 2 ? 1 : 2
  }

  return orderOverride
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
