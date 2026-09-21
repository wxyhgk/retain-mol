import type { Atom, Bond, Molecule } from '../../../molecule'
import { newAtom, newBond } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { BONDING } from '../../../../config/bonding.config'
import { getElementConfig } from '../../../../config/elements.config'
import { degree, findBond, hNeighborsOf } from '../../../graph/queries'
import { dot, sub, type Vec3 } from '../../math'
import { availableMaxValenceByBonds } from '../../valence'

/** ① 几何 pass 的产物：合并映射 + 已算好的重原子落点 */
type MergeResult = {
  /** 模板索引 → 已有原子 id（凹区并环共用） */
  mergeByIndex: Map<number, string>
  /** 模板索引 → 变换后落点（重原子） */
  posByIndex: Map<number, Vec3>
}

/**
 * ① 几何 pass：把模板重原子变换到目标坐标系，逐个判定
 * 合并（与已有同元素原子重合）/ 碰撞（撞到别的原子 → 返回 null 让调用方翻面）/ 新建。
 */
export function detectMergeAtoms(
  frag: FragmentDef,
  mol: Molecule,
  transform: (p: Vec3) => Vec3,
  skip: Set<number>,
  isH: (i: number) => boolean,
  t1Id: string,
  t2Id: string,
): MergeResult | null {
  const mergeByIndex = new Map<number, string>()
  const claimedExistingAtomIds = new Set<string>()
  const posByIndex = new Map<number, Vec3>()
  for (const [i, fragmentAtom] of frag.atoms.entries()) {
    if (skip.has(i) || isH(i)) continue
    const p = transform([fragmentAtom.x, fragmentAtom.y, fragmentAtom.z])
    posByIndex.set(i, p)
    for (const ea of mol.atoms) {
      if (ea.id === t1Id || ea.id === t2Id || ea.symbol === 'H') continue
      const dd = (p[0] - ea.x) ** 2 + (p[1] - ea.y) ** 2 + (p[2] - ea.z) ** 2
      if (dd < BONDING.fuseMergeEps * BONDING.fuseMergeEps &&
          ea.symbol === fragmentAtom.symbol &&
          !claimedExistingAtomIds.has(ea.id)) {
        mergeByIndex.set(i, ea.id)   // 凹区并环：与已有原子重合 → 合并共用
        claimedExistingAtomIds.add(ea.id)
        break
      }
      if (dd < BONDING.fuseClashEps * BONDING.fuseClashEps) return null   // 真碰撞 → 此侧失败
    }
  }
  return { mergeByIndex, posByIndex }
}

/**
 * ② 拓扑（H 选删）：对每个需要腾出连接点的宿主（共享原子 + 被合并原子），
 * 删掉它离新环质心最近的一个 H。返回待删原子 id 集合。
 */
export function selectHydrogensToRemove(
  mol: Molecule,
  newCentroid: Vec3,
  hostIds: string[],
): Set<string> {
  const removeIds = new Set<string>()
  for (const hostId of hostIds) {
    const hs = hNeighborsOf(mol, hostId).filter(h => !removeIds.has(h.id))
    if (hs.length === 0) continue
    let best: Atom | undefined
    let bestD = Infinity
    for (const h of hs) {
      const delta = sub(newCentroid, [h.x, h.y, h.z])
      const dd = dot(delta, delta)
      if (dd < bestD) { bestD = dd; best = h }
    }
    if (best) removeIds.add(best.id)
  }
  return removeIds
}

/**
 * ③ 拓扑（原子/键重映射与合并）：实例化非共享原子（做最终碰撞检查）、
 * 把模板键重映射到（共享/合并/新建）原子上，并注入 Kekulé 键级 override。
 * 碰撞或退化（无新键）返回 null。
 */
export function remapAndMergeBonds(
  frag: FragmentDef,
  mol: Molecule,
  transform: (p: Vec3) => Vec3,
  ctx: {
    f1i: number; f2i: number; T1id: string; T2id: string
    skip: Set<number>; isH: (i: number) => boolean
    merge: MergeResult; removeIds: Set<string>
    orderOverride: ReadonlyMap<string, 1 | 2 | 3>
  },
): { molecule: Molecule; mergeCount: number; repairFlips: number; ringAlternating: boolean } | null {
  const { f1i, f2i, T1id, T2id, skip, isH, merge, removeIds, orderOverride } = ctx
  const { mergeByIndex, posByIndex } = merge

  const idByIndex = new Map<number, string>([[f1i, T1id], [f2i, T2id]])
  for (const [i, id] of mergeByIndex) idByIndex.set(i, id)
  const hHostIndex = (hi: number): number | null => {
    const fb = frag.bonds.find(x => x.a === hi || x.b === hi)
    return fb ? (fb.a === hi ? fb.b : fb.a) : null
  }
  const newAtoms: Atom[] = []
  for (const [i, fragmentAtom] of frag.atoms.entries()) {
    if (skip.has(i) || idByIndex.has(i)) continue
    if (isH(i)) {
      const host = hHostIndex(i)
      if (host !== null && mergeByIndex.has(host)) continue   // 合并原子的模板 H 不实例化
    }
    const p = posByIndex.get(i) ?? transform([fragmentAtom.x, fragmentAtom.y, fragmentAtom.z])
    if (fragmentAtom.symbol !== 'H') {
      for (const ea of mol.atoms) {
        if (ea.id === T1id || ea.id === T2id || removeIds.has(ea.id)) continue
        if (mergeByIndex.size > 0 && [...mergeByIndex.values()].includes(ea.id)) continue
        const dd = (p[0] - ea.x) ** 2 + (p[1] - ea.y) ** 2 + (p[2] - ea.z) ** 2
        if (dd < BONDING.fuseClashEps * BONDING.fuseClashEps) return null
      }
    }
    const atom = newAtom(fragmentAtom.symbol, p[0], p[1], p[2])
    idByIndex.set(i, atom.id)
    newAtoms.push(atom)
  }

  // 键：重映射到（共享/合并/新建）原子。两端都是已有原子且键已存在的边
  // 不重复新建，但若被凯库勒重排（orderOverride）命中，必须更新其键级并清掉
  // aromatic 标记 —— 合并式并环（如菲 bay 区拼芘）的新环路径会途经这些已有键，
  // 保留旧键级会让新环的双键交替在这里断裂
  const orderByExistingId = new Map<string, 1 | 2 | 3>()
  const newBonds: Bond[] = []
  for (const fb of frag.bonds) {
    if (skip.has(fb.a) && skip.has(fb.b)) continue
    if (!idByIndex.has(fb.a) || !idByIndex.has(fb.b)) continue
    const id1 = idByIndex.get(fb.a)
    const id2 = idByIndex.get(fb.b)
    if (id1 === undefined || id2 === undefined) continue
    const existing = findBond(mol.bonds, id1, id2)
    const key = `${Math.min(fb.a, fb.b)}-${Math.max(fb.a, fb.b)}`
    if (existing) {
      const o = orderOverride.get(key)
      if (o !== undefined) orderByExistingId.set(existing.id, o)
      continue
    }
    newBonds.push(newBond(id1, id2, orderOverride.get(key) ?? fb.order))
  }

  // 退化保护：模板原子全部与已有原子重合（点了稠环共享键）→ 什么都没加，拒绝
  if (newBonds.length === 0) return null

  // 最终防线：任何原子都不得超过允许的连接数，也不得超过键级和上限
  // （maxValence）。凯库勒相位在上游以多候选提供（buildRingFuseOrderOverrideCandidates），
  // 违法相位在这里被拒绝、由合法相位候选顶上 —— peri/bay 合并路径同样受此校验，
  // 不再放行五价碳。
  const finalBonds: Bond[] = [
    ...mol.bonds
      .filter(b => !removeIds.has(b.atomId1) && !removeIds.has(b.atomId2))
      .map(b => {
        const o = orderByExistingId.get(b.id)
        if (o === undefined) return b
        const { aromatic: _aromatic, ...bondWithoutAromatic } = b
        return { ...bondWithoutAromatic, order: o }
      }),
    ...newBonds,
  ]
  const finalAtoms = [...mol.atoms.filter(a => !removeIds.has(a.id)), ...newAtoms]

  // 新环的成员键（目标键 + 凯库勒路径键）：局部重排时尽量不动它们，
  // 保住新环自身的双键交替
  const ringBondIds = collectNewRingBondIds(finalBonds, T1id, T2id, idByIndex, orderOverride)

  // 合并式并环（peri/bay）：新环路径的凯库勒交替可能与合并原子的
  // 环外双键冲突（如萘桥头旁并环拼非那烯基），任何相位都会在合并原子上
  // 超价。此时对旧环做局部凯库勒重排（交替翻转路径），把多出的键级
  // 转移出去；干净并环不重排 —— 冲突由相位候选切换解决，修不了就拒绝。
  let repairedBonds = finalBonds
  let repairFlips = 0
  if (mergeByIndex.size > 0) {
    const repair = repairKekuleOverValence(finalAtoms, finalBonds, ringBondIds)
    if (!repair) return null
    repairedBonds = repair.bonds
    repairFlips = repair.flips
  }

  const atomById = new Map(finalAtoms.map(atom => [atom.id, atom]))
  for (const atom of atomById.values()) {
    if (degree(repairedBonds, atom.id) > getElementConfig(atom.symbol).maxBonds) return null
    // 按键级和校验（数条数拦不住“两双键+一单键”的五价碳）
    if (availableMaxValenceByBonds(atom, repairedBonds) < -1e-8) return null
  }

  return {
    mergeCount: mergeByIndex.size,
    repairFlips,
    ringAlternating: isNewRingAlternating(repairedBonds, ringBondIds, orderOverride),
    molecule: {
      ...mol,
      atoms: finalAtoms,
      bonds: repairedBonds,
    },
  }
}

/** 新环成员键 id：目标键 + orderOverride 覆盖的路径键（重映射到最终原子 id）。 */
function collectNewRingBondIds(
  bonds: readonly Bond[],
  T1id: string,
  T2id: string,
  idByIndex: ReadonlyMap<number, string>,
  orderOverride: ReadonlyMap<string, 1 | 2 | 3>,
): Set<string> {
  const ids = new Set<string>()
  const target = findBond(bonds, T1id, T2id)
  if (target) ids.add(target.id)
  for (const key of orderOverride.keys()) {
    const [a, b] = key.split('-').map(Number)
    if (a === undefined || b === undefined) continue
    const id1 = idByIndex.get(a)
    const id2 = idByIndex.get(b)
    if (id1 === undefined || id2 === undefined) continue
    const bond = findBond(bonds, id1, id2)
    if (bond) ids.add(bond.id)
  }
  return ids
}

/**
 * 新环是否保持双键交替（环内每个原子的两条环内键键级不同）。
 * 芳香模板并环时用来在多相位候选间优先选出交替完好的构型
 * （如菲 bay 拼芘：只有一个相位能给出全交替的新环）。
 * 无凯库勒重排的饱和模板恒为 true（该判据不参与排序区分）。
 */
function isNewRingAlternating(
  bonds: readonly Bond[],
  ringBondIds: ReadonlySet<string>,
  orderOverride: ReadonlyMap<string, 1 | 2 | 3>,
): boolean {
  if (orderOverride.size === 0) return true
  const ordersByAtom = new Map<string, number[]>()
  for (const bond of bonds) {
    if (!ringBondIds.has(bond.id)) continue
    ordersByAtom.set(bond.atomId1, [...(ordersByAtom.get(bond.atomId1) ?? []), bond.order])
    ordersByAtom.set(bond.atomId2, [...(ordersByAtom.get(bond.atomId2) ?? []), bond.order])
  }
  for (const orders of ordersByAtom.values()) {
    if (orders.length === 2 && orders[0] === orders[1]) return false
  }
  return true
}

/**
 * 局部凯库勒重排：把超价原子多出的键级沿“双-单交替路径”翻转转移出去。
 * 每条救济路径从超价原子的一条双键出发（降 1），沿途双降单升交替（途中
 * 原子净变 0），终点要么以升键落在欠饱和原子上（净移走 1 且不产生自由
 * 基），要么以降键结束（终点原子降 1，留下一个欠饱和位 —— 奇电子体系
 * 如非那烯基的必然结果）。找不到路径或修完仍超价 → null。
 */
type WorkingBond = {
  readonly source: Bond
  order: 1 | 2 | 3
  flipped: boolean
}

function repairKekuleOverValence(
  atoms: readonly Atom[],
  bonds: readonly Bond[],
  preferProtectedBondIds: ReadonlySet<string>,
): { bonds: Bond[]; flips: number } | null {
  const atomById = new Map(atoms.map(atom => [atom.id, atom]))
  const working: WorkingBond[] = bonds.map(bond => ({ source: bond, order: bond.order, flipped: false }))
  const currentBonds = (): Bond[] => working.map(w => {
    if (!w.flipped) return w.source
    const { aromatic: _aromatic, ...rest } = w.source
    return { ...rest, order: w.order }
  })
  const excessOf = (atomId: string): number => {
    const atom = atomById.get(atomId)
    if (!atom) return 0
    return -availableMaxValenceByBonds(atom, currentBonds())
  }
  const overAtomIds = () => atoms.filter(atom => excessOf(atom.id) > 1e-8).map(atom => atom.id)

  let flips = 0
  const maxRounds = overAtomIds().length * 4 + 1
  for (let round = 0; round < maxRounds; round += 1) {
    const over = overAtomIds()[0]
    if (over === undefined) break
    // 先找绕开新环成员键的救济路径（保住新环交替），实在没有再放开
    const path = findAlternatingReliefPath(working, atomById, over, excessOf, preferProtectedBondIds)
      ?? findAlternatingReliefPath(working, atomById, over, excessOf, new Set())
    if (!path) return null
    for (const bond of path) {
      bond.order = bond.order === 2 ? 1 : 2
      bond.flipped = true
    }
    flips += path.length
  }

  if (overAtomIds().length > 0) return null
  return { bonds: currentBonds(), flips }
}

/**
 * BFS 找救济路径：优先“升键终于欠饱和原子”（不产生自由基），退而求其次
 * “降键终止”（终点降为欠饱和）。返回按序要翻转的键。
 */
function findAlternatingReliefPath(
  bonds: readonly WorkingBond[],
  atomById: ReadonlyMap<string, Atom>,
  startId: string,
  excessOf: (atomId: string) => number,
  excludeBondIds: ReadonlySet<string>,
): WorkingBond[] | null {
  const flippable = (bond: WorkingBond): boolean => {
    if (excludeBondIds.has(bond.source.id)) return false
    if (bond.source.aromatic && !bond.flipped) return false
    if (bond.order !== 1 && bond.order !== 2) return false
    const a = atomById.get(bond.source.atomId1)
    const b = atomById.get(bond.source.atomId2)
    return !!a && !!b && a.symbol !== 'H' && b.symbol !== 'H'
  }
  const adjacency = new Map<string, WorkingBond[]>()
  for (const bond of bonds) {
    if (!flippable(bond)) continue
    adjacency.set(bond.source.atomId1, [...(adjacency.get(bond.source.atomId1) ?? []), bond])
    adjacency.set(bond.source.atomId2, [...(adjacency.get(bond.source.atomId2) ?? []), bond])
  }

  type State = { atomId: string; wantOrder: 1 | 2; path: WorkingBond[] }
  // wantOrder=2：下一步要翻一条双键（降）；wantOrder=1：翻一条单键（升）
  const queue: State[] = [{ atomId: startId, wantOrder: 2, path: [] }]
  const seen = new Set<string>([`${startId}|2`])
  let radicalFallback: WorkingBond[] | null = null

  while (queue.length > 0) {
    const state = queue.shift()!
    for (const bond of adjacency.get(state.atomId) ?? []) {
      if (bond.order !== state.wantOrder) continue
      if (state.path.includes(bond)) continue
      const nextId = bond.source.atomId1 === state.atomId ? bond.source.atomId2 : bond.source.atomId1
      const nextPath = [...state.path, bond]
      if (state.wantOrder === 1) {
        // 升键终点：落在欠饱和原子上 → 完美救济（不产生自由基）
        if (excessOf(nextId) < -(1 - 1e-8)) return nextPath
      } else if (radicalFallback === null) {
        // 降键终点：终点原子降 1 → 留下一个欠饱和位（奇电子体系的必然结果）
        radicalFallback = nextPath
      }
      const nextWant: 1 | 2 = state.wantOrder === 2 ? 1 : 2
      const key = `${nextId}|${nextWant}`
      if (seen.has(key)) continue
      seen.add(key)
      queue.push({ atomId: nextId, wantOrder: nextWant, path: nextPath })
    }
  }

  return radicalFallback
}
