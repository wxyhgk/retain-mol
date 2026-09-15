import type { Bond, Molecule } from '../molecule'
import { findRings } from '../analysis/aromaticity'

/**
 * 芳香键凯库勒化：把 order=1 + aromatic 的键排成单双交替。
 *
 * 背景：OCL ConformerGenerator 不理解离域键——离域环按全单键补氢
 * （苯会变成 C6H12 皱褶环己烷），只认凯库勒式。所以 generate3D 在把
 * 分子交给 OCL 之前先做这一步。只返回 bondId → 1|2 覆盖表，不改输入分子。
 *
 * 策略（best-effort，排不下去的键保持原样，退化为改前行为）：
 * - 逐环交替，两个相位都试，取赋值边数多者（多双键次之）
 * - 已分配的键是硬约束：并环共享边先定先得，后处理的环自动衔接
 * - 每个原子至多 1 条环内双键；已有非芳香双键的原子不再分配环双键
 * - 奇元环自然留一条单-单邻接；冲突的边跳过，不断裂已有交替
 */
export function kekulizeAromaticBonds(mol: Molecule): Map<string, 1 | 2> {
  const override = new Map<string, 1 | 2>()
  if (!mol.bonds.some(b => b.aromatic === true && b.order === 1)) return override

  const keyOf = (a: string, b: string): string => (a < b ? `${a}|${b}` : `${b}|${a}`)
  const bondBetween = new Map<string, Bond>()
  for (const b of mol.bonds) bondBetween.set(keyOf(b.atomId1, b.atomId2), b)

  // 非芳香双键占用原子的双键名额（如醌式 C=O 的碳不再分配环双键）
  const existingDoubles = new Map<string, number>()
  for (const b of mol.bonds) {
    if (b.order === 2 && b.aromatic !== true) {
      existingDoubles.set(b.atomId1, (existingDoubles.get(b.atomId1) ?? 0) + 1)
      existingDoubles.set(b.atomId2, (existingDoubles.get(b.atomId2) ?? 0) + 1)
    }
  }
  const ringDoubles = new Map<string, number>()

  const isKekulizable = (b: Bond | undefined): b is Bond =>
    b !== undefined && b.aromatic === true && b.order === 1

  const rings = findRings(mol.atoms, mol.bonds).filter(ring => {
    if (ring.length < 3) return false
    for (let i = 0; i < ring.length; i += 1) {
      const a = ring[i]
      const c = ring[(i + 1) % ring.length]
      if (a === undefined || c === undefined) return false
      if (!isKekulizable(bondBetween.get(keyOf(a, c)))) return false
    }
    return true
  })

  for (const ring of rings) {
    const edges: Bond[] = []
    for (let i = 0; i < ring.length; i += 1) {
      const a = ring[i]
      const c = ring[(i + 1) % ring.length]
      if (a === undefined || c === undefined) break
      const b = bondBetween.get(keyOf(a, c))
      if (!isKekulizable(b)) break
      edges.push(b)
    }
    if (edges.length !== ring.length) continue

    let best: Map<string, 1 | 2> | null = null
    let bestDoubles: Map<string, number> | null = null
    let bestScore = -1
    for (const start of [2, 1] as const) {
      const trial = new Map<string, 1 | 2>()
      const trialDoubles = new Map<string, number>()
      const doublesOf = (atomId: string): number =>
        (ringDoubles.get(atomId) ?? 0) +
        (trialDoubles.get(atomId) ?? 0) +
        (existingDoubles.get(atomId) ?? 0)
      ring.forEach((atomId, i) => {
        const bond = edges[i]
        if (bond === undefined || override.has(bond.id) || trial.has(bond.id)) return
        const next = ring[(i + 1) % ring.length]
        if (atomId === undefined || next === undefined) return
        const desired: 1 | 2 = i % 2 === 0 ? start : ((3 - start) as 1 | 2)
        if (desired === 2 && (doublesOf(atomId) >= 1 || doublesOf(next) >= 1)) return
        if (desired === 2) {
          trialDoubles.set(atomId, (trialDoubles.get(atomId) ?? 0) + 1)
          trialDoubles.set(next, (trialDoubles.get(next) ?? 0) + 1)
        }
        trial.set(bond.id, desired)
      })
      let doubles = 0
      for (const order of trial.values()) if (order === 2) doubles += 1
      const score = trial.size * 2 + doubles
      if (score > bestScore) {
        bestScore = score
        best = trial
        bestDoubles = trialDoubles
      }
    }
    if (best === null || bestDoubles === null) continue
    for (const [bondId, order] of best) override.set(bondId, order)
    for (const [atomId, count] of bestDoubles) {
      ringDoubles.set(atomId, (ringDoubles.get(atomId) ?? 0) + count)
    }
  }
  return override
}
