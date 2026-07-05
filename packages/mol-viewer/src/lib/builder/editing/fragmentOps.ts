/**
 * fragmentOps — 片段（环系/官能团）的放置与连接，纯函数。
 *
 * 两种模式：
 *  - placeFragmentStandalone：点空白，放完整结构（环面朝向相机）
 *  - attachFragmentToAtom：点 H = 替换该 H；点不饱和重原子 = 沿 VSEPR 方向接上。
 *    片段的连接方向由 attachAtom → attachH 推导，对齐到目标方向的反向。
 */

import * as THREE from 'three'
import type { Molecule, Atom, Bond } from '../../molecule'
import { newAtom, newBond } from '../../molecule'
import type { FragmentDef } from '../../../config/fragments.config'
import { getElementConfig } from '../../../config/elements.config'
import { inferHybridization } from '../../../config/geometry.config'
import { calcBondLength, findNextBondDir, getNeighborDirs } from '../geometry/vsepr'

export type AttachResult = { ok: true; molecule: Molecule } | { ok: false; reason: string }

/** 片段坐标 → 旋转 + 平移后实例化为新原子/键（可跳过指定索引的原子） */
function instantiate(
  frag: FragmentDef,
  transform: (p: THREE.Vector3) => THREE.Vector3,
  skipIndex = -1,
) {
  const idByIndex = new Map<number, string>()
  const atoms = []
  for (let i = 0; i < frag.atoms.length; i++) {
    if (i === skipIndex) continue
    const fa = frag.atoms[i]
    const p = transform(new THREE.Vector3(fa.x, fa.y, fa.z))
    const atom = newAtom(fa.symbol, p.x, p.y, p.z)
    idByIndex.set(i, atom.id)
    atoms.push(atom)
  }
  const bonds = frag.bonds
    .filter(b => b.a !== skipIndex && b.b !== skipIndex)
    .map(b => newBond(idByIndex.get(b.a)!, idByIndex.get(b.b)!, b.order))
  return { atoms, bonds, idByIndex }
}

/**
 * 点空白放置完整片段。viewDir（模型局部坐标的相机视线方向）用于把
 * 片段的 xy 平面转到正对相机 —— 苯环放下来就是面向你的正六边形。
 */
export function placeFragmentStandalone(
  mol: Molecule,
  frag: FragmentDef,
  center: { x: number; y: number; z: number },
  viewDir?: { x: number; y: number; z: number },
): Molecule {
  const q = new THREE.Quaternion()
  if (viewDir) {
    const v = new THREE.Vector3(viewDir.x, viewDir.y, viewDir.z)
    if (v.lengthSq() > 1e-9) q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), v.normalize())
  }

  // 以片段质心为锚，放到点击位置
  const centroid = new THREE.Vector3()
  for (const a of frag.atoms) centroid.add(new THREE.Vector3(a.x, a.y, a.z))
  centroid.divideScalar(frag.atoms.length)
  const target = new THREE.Vector3(center.x, center.y, center.z)

  const { atoms, bonds } = instantiate(frag, p => p.sub(centroid).applyQuaternion(q).add(target))
  return { ...mol, atoms: [...mol.atoms, ...atoms], bonds: [...mol.bonds, ...bonds] }
}

/** 点原子连接片段：点 H 替换之；点不饱和重原子沿 VSEPR 方向生长 */
export function attachFragmentToAtom(
  mol: Molecule,
  frag: FragmentDef,
  targetAtomId: string,
): AttachResult {
  const target = mol.atoms.find(a => a.id === targetAtomId)
  if (!target) return { ok: false, reason: '原子不存在' }

  // 解析连接宿主与方向
  let host = target
  let removedHId: string | null = null
  let dir: THREE.Vector3

  const hBond = target.symbol === 'H'
    ? mol.bonds.find(b => b.atomId1 === targetAtomId || b.atomId2 === targetAtomId)
    : undefined

  if (target.symbol === 'H' && hBond) {
    // 点 H：替换该 H，方向沿原 C-H 键
    const hostId = hBond.atomId1 === targetAtomId ? hBond.atomId2 : hBond.atomId1
    const h = mol.atoms.find(a => a.id === hostId)
    if (!h) return { ok: false, reason: '原子不存在' }
    host = h
    removedHId = targetAtomId
    dir = new THREE.Vector3(target.x - host.x, target.y - host.y, target.z - host.z)
    if (dir.lengthSq() < 1e-9) dir.set(1, 0, 0)
    dir.normalize()
  } else {
    // 点重原子（或游离 H）：检查饱和度，VSEPR 给方向
    const conn = mol.bonds.filter(b => b.atomId1 === host.id || b.atomId2 === host.id).length
    if (conn >= getElementConfig(host.symbol).maxBonds) {
      return { ok: false, reason: `${host.symbol} 已饱和 · 点击它的 H 可直接替换` }
    }
    const atomById = new Map(mol.atoms.map(a => [a.id, a]))
    const neighborDirs = getNeighborDirs(host, mol.bonds, atomById)
    const d = findNextBondDir(host.symbol, neighborDirs, inferHybridization(mol.bonds, host.id))
    dir = new THREE.Vector3(d[0], d[1], d[2])
  }

  // 片段连接方向（attachAtom → attachH）对齐到 -dir
  const fa = frag.atoms[frag.attachIndex]
  const fh = frag.atoms[frag.attachHIndex]
  const attachOrigin = new THREE.Vector3(fa.x, fa.y, fa.z)
  const attachDir = new THREE.Vector3(fh.x - fa.x, fh.y - fa.y, fh.z - fa.z).normalize()
  const q = new THREE.Quaternion().setFromUnitVectors(attachDir, dir.clone().negate())

  const bLen = calcBondLength(host.symbol, fa.symbol)
  const anchor = new THREE.Vector3(host.x, host.y, host.z).addScaledVector(dir, bLen)

  const { atoms, bonds, idByIndex } = instantiate(
    frag, p => p.sub(attachOrigin).applyQuaternion(q).add(anchor), frag.attachHIndex,
  )
  const linkBond = newBond(host.id, idByIndex.get(frag.attachIndex)!, 1)

  return {
    ok: true,
    molecule: {
      ...mol,
      atoms: [...mol.atoms.filter(a => a.id !== removedHId), ...atoms],
      bonds: [
        ...mol.bonds.filter(b => removedHId === null || (b.atomId1 !== removedHId && b.atomId2 !== removedHId)),
        linkBond,
        ...bonds,
      ],
    },
  }
}

/**
 * Ketcher 式并环：点击已有的键，把模板环的 attachBond 边融合上去
 * （苯环模板点 C-C 键 → 萘式稠环）。
 *
 * 几何：模板边中点/方向/环体朝向 三轴对齐到目标键。方向自动探索：
 * 先放在远离已有取代基的一侧，撞到已有原子则自动翻到另一侧再试。
 * 新环原子落在已有同元素原子上（凹区并环，如菲 bay 区拼芘）→ 自动
 * 合并共用该原子（Ketcher 行为），并删掉它多余的 H。
 * 共享边的两个原子各删一个 H（取离新环最近的）。
 * 键级：含双键的模板沿环路径重排凯库勒交替，使其与目标键键级衔接。
 */
export function fuseFragmentOnBond(
  mol: Molecule,
  frag: FragmentDef,
  bondId: string,
): AttachResult {
  if (!frag.attachBond) return { ok: false, reason: `${frag.name} 是基团，请点击原子连接` }
  const bond = mol.bonds.find(b => b.id === bondId)
  if (!bond) return { ok: false, reason: '键不存在' }
  const T1 = mol.atoms.find(a => a.id === bond.atomId1)
  const T2 = mol.atoms.find(a => a.id === bond.atomId2)
  if (!T1 || !T2) return { ok: false, reason: '键不存在' }
  if (T1.symbol === 'H' || T2.symbol === 'H') return { ok: false, reason: '不能在 X-H 键上并环' }

  const [f1i, f2i] = frag.attachBond
  const isH = (i: number) => frag.atoms[i].symbol === 'H'

  // ── 跳过集合：共享边两原子 + 它们的 H ──────────────────────────────────────
  const skip = new Set<number>([f1i, f2i])
  for (const fb of frag.bonds) {
    if (fb.a === f1i || fb.a === f2i) { if (isH(fb.b)) skip.add(fb.b) }
    else if (fb.b === f1i || fb.b === f2i) { if (isH(fb.a)) skip.add(fb.a) }
  }

  // ── 模板坐标系：e1 沿融合边，e2 指向环体 ──────────────────────────────────
  const F1 = new THREE.Vector3(frag.atoms[f1i].x, frag.atoms[f1i].y, frag.atoms[f1i].z)
  const F2 = new THREE.Vector3(frag.atoms[f2i].x, frag.atoms[f2i].y, frag.atoms[f2i].z)
  const fMid = F1.clone().add(F2).multiplyScalar(0.5)
  const e1 = F2.clone().sub(F1).normalize()
  const heavies = frag.atoms.filter(a => a.symbol !== 'H')
  const fCentroid = new THREE.Vector3()
  for (const a of heavies) fCentroid.add(new THREE.Vector3(a.x, a.y, a.z))
  fCentroid.divideScalar(heavies.length)
  const e2 = fCentroid.clone().sub(fMid)
  e2.addScaledVector(e1, -e2.dot(e1))
  if (e2.lengthSq() < 1e-9) return { ok: false, reason: '模板几何异常' }
  e2.normalize()
  const e3 = e1.clone().cross(e2)

  // ── 目标坐标系：优先环体放在远离已有重原子邻居的一侧 ──────────────────────
  const t1v = new THREE.Vector3(T1.x, T1.y, T1.z)
  const t2v = new THREE.Vector3(T2.x, T2.y, T2.z)
  const tMid = t1v.clone().add(t2v).multiplyScalar(0.5)
  const d1 = t2v.clone().sub(t1v).normalize()
  const atomById = new Map(mol.atoms.map(a => [a.id, a]))
  const away = new THREE.Vector3()
  for (const b of mol.bonds) {
    for (const [self, selfV] of [[T1, t1v], [T2, t2v]] as const) {
      let otherId: string | null = null
      if (b.atomId1 === self.id) otherId = b.atomId2
      else if (b.atomId2 === self.id) otherId = b.atomId1
      if (!otherId || otherId === T1.id || otherId === T2.id) continue
      const other = atomById.get(otherId)
      if (!other || other.symbol === 'H') continue
      away.add(new THREE.Vector3(other.x - selfV.x, other.y - selfV.y, other.z - selfV.z).normalize())
    }
  }
  let d2Pref = away.multiplyScalar(-1)
  d2Pref.addScaledVector(d1, -d2Pref.dot(d1))
  if (d2Pref.lengthSq() < 1e-6) {
    // 无重原子邻居：任取垂直方向
    d2Pref = Math.abs(d1.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)
    d2Pref.addScaledVector(d1, -d2Pref.dot(d1))
  }
  d2Pref.normalize()

  // ── 价态预检：共享原子无 H 时需有空位 ─────────────────────────────────────
  const hNeighborsOf = (atomId: string): Atom[] =>
    mol.bonds
      .map(b => (b.atomId1 === atomId ? b.atomId2 : b.atomId2 === atomId ? b.atomId1 : null))
      .filter((id): id is string => id !== null)
      .map(id => atomById.get(id))
      .filter((a): a is Atom => !!a && a.symbol === 'H')

  for (const t of [T1, T2]) {
    if (hNeighborsOf(t.id).length > 0) continue
    const conn = mol.bonds.filter(b => b.atomId1 === t.id || b.atomId2 === t.id).length
    if (conn + 1 > getElementConfig(t.symbol).maxBonds) {
      return { ok: false, reason: `${t.symbol} 已饱和，无法并环` }
    }
  }

  // ── 凯库勒交替（含双键的模板）：沿环路径重排非共享边键级 ───────────────────
  const orderOverride = new Map<string, 1 | 2 | 3>()
  if (frag.bonds.some(b => b.order === 2)) {
    const heavyAdj = new Map<number, number[]>()
    for (const fb of frag.bonds) {
      if (isH(fb.a) || isH(fb.b)) continue
      heavyAdj.set(fb.a, [...(heavyAdj.get(fb.a) ?? []), fb.b])
      heavyAdj.set(fb.b, [...(heavyAdj.get(fb.b) ?? []), fb.a])
    }
    let prev = f1i, cur = f2i
    let order: 1 | 2 = bond.order === 2 ? 1 : 2
    while (cur !== f1i || prev === f1i) {
      const next = (heavyAdj.get(cur) ?? []).find(x => x !== prev)
      if (next === undefined) break
      orderOverride.set(`${Math.min(cur, next)}-${Math.max(cur, next)}`, order)
      order = order === 2 ? 1 : 2
      prev = cur; cur = next
      if (cur === f1i) break
    }
  }

  const MERGE_EPS = 0.45   // 新原子与已有同元素原子距离小于此 → 合并共用
  const CLASH_EPS = 0.7    // 距离小于此（且不可合并）→ 此侧空间被占

  /** 在指定环体朝向 d2 下尝试构建；碰撞返回 null（由调用方翻面重试） */
  const tryBuild = (d2: THREE.Vector3): { molecule: Molecule; mergeCount: number } | null => {
    const d3 = d1.clone().cross(d2)
    const mFrag = new THREE.Matrix4().makeBasis(e1, e2, e3)
    const mTarget = new THREE.Matrix4().makeBasis(d1, d2, d3)
    const rot = mTarget.multiply(mFrag.clone().transpose())
    const transform = (p: THREE.Vector3) => p.sub(fMid).applyMatrix4(rot).add(tMid)
    const newCentroid = transform(fCentroid.clone())

    // pass 1：重原子——决定 合并 / 碰撞 / 新建
    const mergeByIndex = new Map<number, string>()   // 模板索引 → 已有原子 id
    const posByIndex = new Map<number, THREE.Vector3>()
    for (let i = 0; i < frag.atoms.length; i++) {
      if (skip.has(i) || isH(i)) continue
      const p = transform(new THREE.Vector3(frag.atoms[i].x, frag.atoms[i].y, frag.atoms[i].z))
      posByIndex.set(i, p)
      for (const ea of mol.atoms) {
        if (ea.id === T1.id || ea.id === T2.id || ea.symbol === 'H') continue
        const dd = (p.x - ea.x) ** 2 + (p.y - ea.y) ** 2 + (p.z - ea.z) ** 2
        if (dd < MERGE_EPS * MERGE_EPS && ea.symbol === frag.atoms[i].symbol) {
          mergeByIndex.set(i, ea.id)   // 凹区并环：与已有原子重合 → 合并共用
          break
        }
        if (dd < CLASH_EPS * CLASH_EPS) return null   // 真碰撞 → 此侧失败
      }
    }

    // pass 2：待删 H —— 共享原子 + 每个被合并原子，各删离新环最近的一个 H
    const removeIds = new Set<string>()
    const hostsNeedingH = [T1.id, T2.id, ...mergeByIndex.values()]
    for (const hostId of hostsNeedingH) {
      const hs = hNeighborsOf(hostId).filter(h => !removeIds.has(h.id))
      if (hs.length === 0) continue
      let best = hs[0], bestD = Infinity
      for (const h of hs) {
        const dd = newCentroid.distanceToSquared(new THREE.Vector3(h.x, h.y, h.z))
        if (dd < bestD) { bestD = dd; best = h }
      }
      removeIds.add(best.id)
    }

    // pass 3：实例化（跳过共享边/被合并原子及其模板 H），并做最终碰撞检查
    const idByIndex = new Map<number, string>([[f1i, T1.id], [f2i, T2.id]])
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
          if (ea.id === T1.id || ea.id === T2.id || removeIds.has(ea.id)) continue
          if (mergeByIndex.size > 0 && [...mergeByIndex.values()].includes(ea.id)) continue
          const dd = (p.x - ea.x) ** 2 + (p.y - ea.y) ** 2 + (p.z - ea.z) ** 2
          if (dd < CLASH_EPS * CLASH_EPS) return null
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
    const findExistingBond = (x: string, y: string) => mol.bonds.find(
      b => (b.atomId1 === x && b.atomId2 === y) || (b.atomId1 === y && b.atomId2 === x))
    const orderByExistingId = new Map<string, 1 | 2 | 3>()
    const newBonds: Bond[] = []
    for (const fb of frag.bonds) {
      if (skip.has(fb.a) && skip.has(fb.b)) continue
      if (!idByIndex.has(fb.a) || !idByIndex.has(fb.b)) continue
      const id1 = idByIndex.get(fb.a)!, id2 = idByIndex.get(fb.b)!
      const existing = findExistingBond(id1, id2)
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

    // 合并原子的价态检查：删 1 个 H 后加上新键不能超价
    const finalBonds = [
      ...mol.bonds
        .filter(b => !removeIds.has(b.atomId1) && !removeIds.has(b.atomId2))
        .map(b => {
          const o = orderByExistingId.get(b.id)
          return o === undefined ? b : { ...b, order: o, aromatic: undefined }
        }),
      ...newBonds,
    ]
    for (const mergedId of mergeByIndex.values()) {
      const conn = finalBonds.filter(b => b.atomId1 === mergedId || b.atomId2 === mergedId).length
      const sym = atomById.get(mergedId)!.symbol
      if (conn > getElementConfig(sym).maxBonds) return null
    }

    return {
      mergeCount: mergeByIndex.size,
      molecule: {
        ...mol,
        atoms: [...mol.atoms.filter(a => !removeIds.has(a.id)), ...newAtoms],
        bonds: finalBonds,
      },
    }
  }

  // 方向自动探索：两侧都构建，优先零合并的干净并环（外侧），
  // 其次才是合并式并环（凹区拼稠环，如菲 bay → 芘）
  const candidates = [tryBuild(d2Pref), tryBuild(d2Pref.clone().negate())]
    .filter((r): r is { molecule: Molecule; mergeCount: number } => r !== null)
    .sort((a, b) => a.mergeCount - b.mergeCount)
  if (candidates.length === 0) return { ok: false, reason: '该键两侧空间都放不下新环' }
  return { ok: true, molecule: candidates[0].molecule }
}
