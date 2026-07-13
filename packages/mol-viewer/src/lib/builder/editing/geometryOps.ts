/**
 * geometryOps.ts — GaussView 式几何参数编辑（键长/键角/二面角），纯函数。
 *
 * 选中 2/3/4 个原子（按选择顺序）直接设定目标值：
 *  - 2 原子：沿 A→B 轴平移 B 端片段到目标距离
 *  - 3 原子：以 B 为顶点，绕 (BA×BC) 轴旋转 C 端片段到目标键角
 *  - 4 原子：绕 B–C 轴旋转 C 端片段到目标二面角
 *
 * 被移动的永远是"末端一侧"（B 端 / C 端）的整个刚性片段；环内约束
 * （切不开的键）拒绝并返回原因，不做变形。只动坐标，从不动键级。
 */

import type { Molecule, Atom } from '../../molecule'
import { findBond } from '../graph'
import { reachableWithout } from './bondOps'
import { calcAngle, calcDihedral } from '../geometry/measure'

export type GeomEditResult =
  | { ok: true; molecule: Molecule }
  | { ok: false; reason: string }

const NO_BOND = '__no_bond__'

type AtomTuple<T extends readonly string[]> = { readonly [K in keyof T]: Atom }

function getAtoms<const T extends readonly string[]>(mol: Molecule, ids: T): AtomTuple<T> | null {
  if (new Set(ids).size !== ids.length) return null
  const out: Atom[] = []
  for (const id of ids) {
    const a = mol.atoms.find(x => x.id === id)
    if (!a) return null
    out.push(a)
  }
  return out as AtomTuple<T>
}

/** 平移 moving 集合内的原子 */
function translate(mol: Molecule, moving: ReadonlySet<string>, dx: number, dy: number, dz: number): Molecule {
  return {
    ...mol,
    atoms: mol.atoms.map(a => moving.has(a.id)
      ? { ...a, x: a.x + dx, y: a.y + dy, z: a.z + dz }
      : a),
  }
}

/** Rodrigues 旋转：moving 集合绕过 origin、方向 axis（单位向量）的轴旋转 angle 弧度 */
function rotate(
  mol: Molecule,
  moving: ReadonlySet<string>,
  origin: { x: number; y: number; z: number },
  axis: { x: number; y: number; z: number },
  angle: number,
): Molecule {
  const cos = Math.cos(angle), sin = Math.sin(angle)
  const { x: ux, y: uy, z: uz } = axis
  return {
    ...mol,
    atoms: mol.atoms.map(a => {
      if (!moving.has(a.id)) return a
      const px = a.x - origin.x, py = a.y - origin.y, pz = a.z - origin.z
      const dot = px * ux + py * uy + pz * uz
      const cx = uy * pz - uz * py, cy = uz * px - ux * pz, cz = ux * py - uy * px
      return {
        ...a,
        x: origin.x + px * cos + cx * sin + ux * dot * (1 - cos),
        y: origin.y + py * cos + cy * sin + uy * dot * (1 - cos),
        z: origin.z + pz * cos + cz * sin + uz * dot * (1 - cos),
      }
    }),
  }
}

/**
 * 设定两原子间距离（选中顺序 A、B；平移 B 端）。
 *  - A–B 有键：平移 B 端片段；环内（去键后仍连通）→ 拒绝
 *  - 无键但分属不同片段：平移 B 的整个片段
 *  - 无键且同片段：拒绝（间接相连，平移无意义）
 */
export function setBondLength(mol: Molecule, aId: string, bId: string, target: number): GeomEditResult {
  if (!isFinite(target) || target < 0.1) return { ok: false, reason: '目标键长无效（≥ 0.1 Å）' }
  const atoms = getAtoms(mol, [aId, bId])
  if (!atoms) return { ok: false, reason: '原子不存在或重复' }
  const [a, b] = atoms

  const bond = findBond(mol.bonds, aId, bId)
  const side = reachableWithout(mol.bonds, bond?.id ?? NO_BOND, bId)
  if (side.has(aId)) {
    return { ok: false, reason: bond ? '环内键长受约束，无法直接调整' : '两原子间接相连且无直接键，无法平移' }
  }

  const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z
  const cur = Math.hypot(dx, dy, dz)
  if (cur < 1e-6) return { ok: false, reason: '两原子重合，无法确定方向' }
  const k = (target - cur) / cur
  return { ok: true, molecule: translate(mol, side, dx * k, dy * k, dz * k) }
}

/**
 * 设定键角 A–B–C（B 为顶点；绕 BA×BC 轴旋转 C 端片段）。
 * 目标范围 (0.5°, 179.5°)；C 端片段若与 A/B 侧连通（环）→ 拒绝。
 */
export function setBondAngle(mol: Molecule, aId: string, bId: string, cId: string, targetDeg: number): GeomEditResult {
  if (!isFinite(targetDeg) || targetDeg < 0.5 || targetDeg > 179.5) {
    return { ok: false, reason: '键角需在 0.5° ~ 179.5° 之间' }
  }
  const atoms = getAtoms(mol, [aId, bId, cId])
  if (!atoms) return { ok: false, reason: '原子不存在或重复' }
  const [a, b, c] = atoms

  const bcBond = findBond(mol.bonds, bId, cId)
  const side = reachableWithout(mol.bonds, bcBond?.id ?? NO_BOND, cId)
  if (side.has(bId) || side.has(aId)) {
    return { ok: false, reason: '环内键角受约束，无法直接调整' }
  }

  const v1 = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }
  const v2 = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z }
  const l1 = Math.hypot(v1.x, v1.y, v1.z), l2 = Math.hypot(v2.x, v2.y, v2.z)
  if (l1 < 1e-6 || l2 < 1e-6) return { ok: false, reason: '原子重合，无法确定键角平面' }

  // 旋转轴 = BA×BC；共线（180°附近）时任取一条垂直于 BA 的轴
  let n = {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x,
  }
  let nl = Math.hypot(n.x, n.y, n.z)
  if (nl < 1e-9) {
    n = Math.abs(v1.x) < 0.9 * l1 ? { x: 0, y: -v1.z, z: v1.y } : { x: -v1.z, y: 0, z: v1.x }
    nl = Math.hypot(n.x, n.y, n.z)
  }
  const axis = { x: n.x / nl, y: n.y / nl, z: n.z / nl }

  const current = calcAngle(a, b, c)
  const delta = ((targetDeg - current) * Math.PI) / 180
  let result = rotate(mol, side, b, axis, delta)

  // 数值/方向保险：结果偏离目标则反向旋转
  const check = getAtoms(result, [aId, bId, cId])
  if (!check) return { ok: false, reason: '几何调整后无法读取目标原子' }
  if (Math.abs(calcAngle(check[0], check[1], check[2]) - targetDeg) > 0.1) {
    result = rotate(mol, side, b, axis, -delta)
  }
  return { ok: true, molecule: result }
}

/**
 * 设定二面角 A–B–C–D（绕 B–C 轴旋转 C 端片段），目标为 -180° ~ 180° 的有符号角。
 * 需要 B–C 之间存在键；B–C 在环内 → 拒绝。
 */
export function setDihedralAngle(
  mol: Molecule, aId: string, bId: string, cId: string, dId: string, targetDeg: number,
): GeomEditResult {
  if (!isFinite(targetDeg)) return { ok: false, reason: '目标角度无效' }
  const atoms = getAtoms(mol, [aId, bId, cId, dId])
  if (!atoms) return { ok: false, reason: '原子不存在或重复' }
  const [a, b, c, d] = atoms

  const bcBond = findBond(mol.bonds, bId, cId)
  if (!bcBond) return { ok: false, reason: '2、3 号原子之间需要存在键（旋转轴）' }
  const side = reachableWithout(mol.bonds, bcBond.id, cId)
  if (side.has(bId)) return { ok: false, reason: 'B–C 键在环内，二面角受约束' }
  // A 若也在 C 端旋转侧，旋转会带着 A 一起转，二面角读数永远不变
  //（方向保险两次都判偏差大，最终还会应用一次反向旋转）→ 明确拒绝
  if (side.has(aId)) return { ok: false, reason: '1 号原子在旋转侧（B–C 轴的 C 端），请调整选择顺序' }
  if (!side.has(dId)) return { ok: false, reason: '第 4 个原子需在 3 号原子一侧' }

  const ax = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z }
  const al = Math.hypot(ax.x, ax.y, ax.z)
  if (al < 1e-6) return { ok: false, reason: 'B、C 重合，无法确定旋转轴' }
  const axis = { x: ax.x / al, y: ax.y / al, z: ax.z / al }

  const current = calcDihedral(a, b, c, d)
  const delta = ((targetDeg - current) * Math.PI) / 180
  let result = rotate(mol, side, b, axis, delta)

  // 符号约定保险：偏差大则反向
  const check = getAtoms(result, [aId, bId, cId, dId])
  if (!check) return { ok: false, reason: '几何调整后无法读取目标原子' }
  const diff = Math.abs(((calcDihedral(check[0], check[1], check[2], check[3]) - targetDeg + 540) % 360) - 180)
  if (diff > 0.1) {
    result = rotate(mol, side, b, axis, -delta)
  }
  return { ok: true, molecule: result }
}
