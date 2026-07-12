import * as THREE from 'three'
import type { Atom, Bond, Molecule } from '../../../molecule'
import { newAtom, newBond } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { BONDING } from '../../../../config/bonding.config'
import { getElementConfig } from '../../../../config/elements.config'
import { degree, findBond, hNeighborsOf } from '../../graph'

/** ① 几何 pass 的产物：合并映射 + 已算好的重原子落点 */
type MergeResult = {
  /** 模板索引 → 已有原子 id（凹区并环共用） */
  mergeByIndex: Map<number, string>
  /** 模板索引 → 变换后落点（重原子） */
  posByIndex: Map<number, THREE.Vector3>
}

/**
 * ① 几何 pass：把模板重原子变换到目标坐标系，逐个判定
 * 合并（与已有同元素原子重合）/ 碰撞（撞到别的原子 → 返回 null 让调用方翻面）/ 新建。
 */
export function detectMergeAtoms(
  frag: FragmentDef,
  mol: Molecule,
  transform: (p: THREE.Vector3) => THREE.Vector3,
  skip: Set<number>,
  isH: (i: number) => boolean,
  t1Id: string,
  t2Id: string,
): MergeResult | null {
  const mergeByIndex = new Map<number, string>()
  const claimedExistingAtomIds = new Set<string>()
  const posByIndex = new Map<number, THREE.Vector3>()
  for (let i = 0; i < frag.atoms.length; i++) {
    if (skip.has(i) || isH(i)) continue
    const p = transform(new THREE.Vector3(frag.atoms[i].x, frag.atoms[i].y, frag.atoms[i].z))
    posByIndex.set(i, p)
    for (const ea of mol.atoms) {
      if (ea.id === t1Id || ea.id === t2Id || ea.symbol === 'H') continue
      const dd = (p.x - ea.x) ** 2 + (p.y - ea.y) ** 2 + (p.z - ea.z) ** 2
      if (dd < BONDING.fuseMergeEps * BONDING.fuseMergeEps &&
          ea.symbol === frag.atoms[i].symbol &&
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
  newCentroid: THREE.Vector3,
  hostIds: string[],
): Set<string> {
  const removeIds = new Set<string>()
  for (const hostId of hostIds) {
    const hs = hNeighborsOf(mol, hostId).filter(h => !removeIds.has(h.id))
    if (hs.length === 0) continue
    let best = hs[0], bestD = Infinity
    for (const h of hs) {
      const dd = newCentroid.distanceToSquared(new THREE.Vector3(h.x, h.y, h.z))
      if (dd < bestD) { bestD = dd; best = h }
    }
    removeIds.add(best.id)
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
  transform: (p: THREE.Vector3) => THREE.Vector3,
  ctx: {
    f1i: number; f2i: number; T1id: string; T2id: string
    skip: Set<number>; isH: (i: number) => boolean
    merge: MergeResult; removeIds: Set<string>
    orderOverride: Map<string, 1 | 2 | 3>
  },
): { molecule: Molecule; mergeCount: number } | null {
  const { f1i, f2i, T1id, T2id, skip, isH, merge, removeIds, orderOverride } = ctx
  const { mergeByIndex, posByIndex } = merge

  const idByIndex = new Map<number, string>([[f1i, T1id], [f2i, T2id]])
  for (const [i, id] of mergeByIndex) idByIndex.set(i, id)
  const hHostIndex = (hi: number): number | null => {
    const fb = frag.bonds.find(x => x.a === hi || x.b === hi)
    return fb ? (fb.a === hi ? fb.b : fb.a) : null
  }
  const newAtoms: Atom[] = []
  for (let i = 0; i < frag.atoms.length; i++) {
    if (skip.has(i) || idByIndex.has(i)) continue
    if (isH(i)) {
      const host = hHostIndex(i)
      if (host !== null && mergeByIndex.has(host)) continue   // 合并原子的模板 H 不实例化
    }
    const p = posByIndex.get(i) ?? transform(new THREE.Vector3(frag.atoms[i].x, frag.atoms[i].y, frag.atoms[i].z))
    if (frag.atoms[i].symbol !== 'H') {
      for (const ea of mol.atoms) {
        if (ea.id === T1id || ea.id === T2id || removeIds.has(ea.id)) continue
        if (mergeByIndex.size > 0 && [...mergeByIndex.values()].includes(ea.id)) continue
        const dd = (p.x - ea.x) ** 2 + (p.y - ea.y) ** 2 + (p.z - ea.z) ** 2
        if (dd < BONDING.fuseClashEps * BONDING.fuseClashEps) return null
      }
    }
    const atom = newAtom(frag.atoms[i].symbol, p.x, p.y, p.z)
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
    const id1 = idByIndex.get(fb.a)!, id2 = idByIndex.get(fb.b)!
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

  // 自动重合宿主至少不能超过元素允许的连接数。完整键级合法化属于
  // Kekule 重排阶段；这里不能用局部键级求和破坏现有 peri 连续并环。
  const finalBonds = [
    ...mol.bonds
      .filter(b => !removeIds.has(b.atomId1) && !removeIds.has(b.atomId2))
      .map(b => {
        const o = orderByExistingId.get(b.id)
        return o === undefined ? b : { ...b, order: o, aromatic: undefined }
      }),
    ...newBonds,
  ]
  const finalAtoms = [...mol.atoms.filter(a => !removeIds.has(a.id)), ...newAtoms]
  const atomById = new Map(finalAtoms.map(atom => [atom.id, atom]))
  for (const mergedId of mergeByIndex.values()) {
    const atom = atomById.get(mergedId)
    if (!atom || degree(finalBonds, mergedId) > getElementConfig(atom.symbol).maxBonds) return null
  }

  return {
    mergeCount: mergeByIndex.size,
    molecule: {
      ...mol,
      atoms: finalAtoms,
      bonds: finalBonds,
    },
  }
}
