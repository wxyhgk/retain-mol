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

  let prev = f1i
  let cur = f2i
  let order: 1 | 2 = targetBondOrder === 2 ? 1 : 2
  while (cur !== f1i || prev === f1i) {
    const next = (heavyAdj.get(cur) ?? []).find(index => index !== prev)
    if (next === undefined) break
    orderOverride.set(`${Math.min(cur, next)}-${Math.max(cur, next)}`, order)
    order = order === 2 ? 1 : 2
    prev = cur
    cur = next
    if (cur === f1i) break
  }

  return orderOverride
}
