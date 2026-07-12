/**
 * vsepr.ts — VSEPR 几何定位
 * 计算新原子应放置的位置，基于中心原子的配位几何。
 */

import { BONDING } from '../../../config/bonding.config'
import { getElementConfig } from '../../../config/elements.config'
import { inferGeometry, GEOMETRY_RULES, STANDARD_BOND_LENGTHS } from '../../../config/geometry.config'
import type { AtomHybridization } from '../../../config/geometry.config'
import { inferHybridization } from '../analysis/hybridization'
import { bondsOf, otherEnd } from '../graph'
import type { Atom, Bond } from '../../molecule'
import { add, sub, scale, dot, cross, length, normalize } from '../math/vec3'
import type { Vec3 } from '../math/vec3'
import type { SketchPlane } from './plane'
import { isBetterClashScore, scoreClashes } from './clash'

// ── 键长 ──────────────────────────────────────────────────────────────────────

export function calcBondLength(sym1: string, sym2: string): number {
  const key = [sym1, sym2].sort().join('-')
  if (STANDARD_BOND_LENGTHS[key]) return STANDARD_BOND_LENGTHS[key]
  const r1 = getElementConfig(sym1).covalentRadius
  const r2 = getElementConfig(sym2).covalentRadius
  return (r1 + r2) * BONDING.singleBondRadiusFactor
}

// ── 邻居方向 ──────────────────────────────────────────────────────────────────

export function getNeighborDirs(
  center: Atom,
  bonds: readonly Bond[],
  atomById: Map<string, Atom>,
): Vec3[] {
  return bondsOf(bonds, center.id)
    .map(b => {
      const nbId = otherEnd(b, center.id)!
      const nb = atomById.get(nbId)
      if (!nb) return null
      const d = sub([nb.x, nb.y, nb.z], [center.x, center.y, center.z])
      return length(d) > 1e-4 ? normalize(d) : null
    })
    .filter((d): d is Vec3 => d !== null)
}

// ── VSEPR 新键方向 ────────────────────────────────────────────────────────────

/** 选垂直于 v 且尽量"朝上"的单位向量 */
function upwardPerp(v: Vec3): Vec3 {
  for (const ref of [[0, 1, 0], [1, 0, 0], [0, 0, 1]] as Vec3[]) {
    const p = dot(ref, v)
    const comp: Vec3 = [ref[0] - p*v[0], ref[1] - p*v[1], ref[2] - p*v[2]]
    if (length(comp) > 0.1) return normalize(comp)
  }
  return [0, 1, 0]
}

/**
 * 两邻居 sp3 中心的两个四面体候选方向（±法向偏出）。
 * 唯一实现 —— findNextBondDir / findSnapBondDir / getGrowGuide / 片段环生成器共用。
 * 邻居共线或对称抵消时返回 null（由调用方决定退化策略）。
 */
export function tetrahedralCandidates(d1: Vec3, d2: Vec3): [Vec3, Vec3] | null {
  const sum = add(d1, d2)
  const nx = cross(d1, d2)
  if (length(nx) < 0.05 || length(sum) < 0.05) return null
  const sHat = normalize(sum)
  const nHat = normalize(nx)
  return [
    normalize(add(scale(sHat, -1 / Math.sqrt(3)), scale(nHat,  Math.sqrt(2 / 3)))),
    normalize(add(scale(sHat, -1 / Math.sqrt(3)), scale(nHat, -Math.sqrt(2 / 3)))),
  ]
}

/**
 * 根据现有邻居方向和杂化，按 VSEPR 规则返回新键的单位方向向量。
 *
 * n=0  → 沿 +X
 * n=1  → 与已有键成 bondAngle 角
 * n=2  → sp2/linear: 在同一平面内; sp3: 偏出平面（四面体第三位）
 * n=3  → 三键之和的反方向
 * n≥4  → 超价，取现有键之和的反方向
 */
export function findNextBondDir(
  centerSymbol: string,
  neighborDirs: Vec3[],
  hybridization: AtomHybridization = 'sp3',
): Vec3 {
  const n = neighborDirs.length
  const geometry = inferGeometry(centerSymbol, n, hybridization)
  const rule = GEOMETRY_RULES[geometry] ?? GEOMETRY_RULES['tetrahedral']
  const θrad = rule.bondAngle * (Math.PI / 180)
  const cosθ = Math.cos(θrad)
  const sinθ = Math.sin(θrad)

  if (n === 0) return [1, 0, 0]

  if (n === 1) {
    const d0 = neighborDirs[0]
    const perp = upwardPerp(d0)
    return normalize([
      cosθ*d0[0] + sinθ*perp[0],
      cosθ*d0[1] + sinθ*perp[1],
      cosθ*d0[2] + sinθ*perp[2],
    ])
  }

  if (n === 2) {
    const d1 = neighborDirs[0], d2 = neighborDirs[1]
    const sum = add(d1, d2)

    // sp2/linear：第三方向在同一平面内，等于 -normalize(d1+d2)
    if (geometry === 'trigonal-planar' || geometry === 'linear') {
      if (length(sum) < 0.05) return upwardPerp(d1)
      return normalize(scale(sum, -1))
    }

    // sp3 四面体：在垂直平面内偏出，形成三维几何
    const nx = cross(d1, d2)
    if (length(nx) < 0.05) return upwardPerp(d1)
    if (length(sum) < 0.05) return normalize(nx)

    // 两个候选位里按确定性约定取一个（法向 z 为正侧，z≈0 时取 y 为正侧）
    const cands = tetrahedralCandidates(d1, d2)!
    let nHat = normalize(nx)
    if (nHat[2] < -1e-9 || (Math.abs(nHat[2]) < 1e-9 && nHat[1] < 0)) nHat = scale(nHat, -1)
    return dot(cands[0], nHat) >= dot(cands[1], nHat) ? cands[0] : cands[1]
  }

  if (n === 3) {
    const sum = neighborDirs.reduce<Vec3>((acc, d) => add(acc, d), [0, 0, 0])
    if (length(sum) < 0.05) return upwardPerp(neighborDirs[0])
    return normalize(scale(sum, -1))
  }

  const sum = neighborDirs.reduce<Vec3>((acc, d) => add(acc, d), [0, 0, 0])
  if (length(sum) < 0.05) return upwardPerp(neighborDirs[0])
  return normalize(scale(sum, -1))
}

/**
 * 拖拽生长的方向吸附：在 VSEPR 候选方向中选与拖拽方向最接近的一个。
 * 与 findNextBondDir 的区别：自由度（任意垂直方向/正负偏出）由 preferredDir
 * 决定，而不是固定的 upwardPerp / 符号约定 —— 用户拖向哪边，原子就长在哪边的合法槽位上。
 */
export function findSnapBondDir(
  centerSymbol: string,
  neighborDirs: Vec3[],
  hybridization: AtomHybridization,
  preferredDir: Vec3,
): Vec3 {
  const n = neighborDirs.length
  const geometry = inferGeometry(centerSymbol, n, hybridization)
  const rule = GEOMETRY_RULES[geometry] ?? GEOMETRY_RULES['tetrahedral']
  const θrad = rule.bondAngle * (Math.PI / 180)
  const cosθ = Math.cos(θrad)
  const sinθ = Math.sin(θrad)

  if (n === 0) return normalize(preferredDir)

  if (n === 1) {
    // 候选位是绕 d0 张开 bondAngle 的圆锥；取在 d0 与拖拽方向平面内的那条母线
    const d0 = neighborDirs[0]
    const p = dot(preferredDir, d0)
    const perpRaw: Vec3 = [
      preferredDir[0] - p*d0[0],
      preferredDir[1] - p*d0[1],
      preferredDir[2] - p*d0[2],
    ]
    const perp = length(perpRaw) > 0.05 ? normalize(perpRaw) : upwardPerp(d0)
    return normalize([
      cosθ*d0[0] + sinθ*perp[0],
      cosθ*d0[1] + sinθ*perp[1],
      cosθ*d0[2] + sinθ*perp[2],
    ])
  }

  if (n === 2) {
    const d1 = neighborDirs[0], d2 = neighborDirs[1]
    const sum = add(d1, d2)

    // sp2/linear：唯一候选位在同一平面内
    if (geometry === 'trigonal-planar' || geometry === 'linear') {
      if (length(sum) < 0.05) {
        // 两键反向共线（linear 超出）：任意垂直方向都合法，贴近拖拽方向
        const p = dot(preferredDir, d1)
        const perpRaw: Vec3 = [
          preferredDir[0] - p*d1[0],
          preferredDir[1] - p*d1[1],
          preferredDir[2] - p*d1[2],
        ]
        return length(perpRaw) > 0.05 ? normalize(perpRaw) : upwardPerp(d1)
      }
      return normalize(scale(sum, -1))
    }

    // sp3 四面体：两个对称候选位（±法向偏出），取靠近拖拽方向的
    const cands = tetrahedralCandidates(d1, d2)
    if (!cands) return findNextBondDir(centerSymbol, neighborDirs, hybridization)
    return dot(cands[0], preferredDir) >= dot(cands[1], preferredDir) ? cands[0] : cands[1]
  }

  // n≥3：剩余槽位唯一，无自由度可吸附
  return findNextBondDir(centerSymbol, neighborDirs, hybridization)
}

function coneCandidateDirs(axis: Vec3, theta: number, preferred: Vec3, samples = 24): Vec3[] {
  const p = dot(preferred, axis)
  const preferredPerpRaw: Vec3 = [
    preferred[0] - p*axis[0],
    preferred[1] - p*axis[1],
    preferred[2] - p*axis[2],
  ]
  const u = length(preferredPerpRaw) > 0.05 ? normalize(preferredPerpRaw) : upwardPerp(axis)
  const v = normalize(cross(axis, u))
  const cosθ = Math.cos(theta)
  const sinθ = Math.sin(theta)
  const out: Vec3[] = []
  for (let i = 0; i < samples; i++) {
    const phi = (i * Math.PI * 2) / samples
    const ringDir = add(scale(u, Math.cos(phi)), scale(v, Math.sin(phi)))
    out.push(normalize(add(scale(axis, cosθ), scale(ringDir, sinθ))))
  }
  return out
}

function candidateDirsForGrow(
  centerSymbol: string,
  neighborDirs: Vec3[],
  hybridization: AtomHybridization,
  preferredDir: Vec3,
): Vec3[] {
  const primary = findSnapBondDir(centerSymbol, neighborDirs, hybridization, preferredDir)
  const n = neighborDirs.length
  const geometry = inferGeometry(centerSymbol, n, hybridization)
  const rule = GEOMETRY_RULES[geometry] ?? GEOMETRY_RULES['tetrahedral']
  const theta = rule.bondAngle * (Math.PI / 180)

  if (n === 0) {
    const axes: Vec3[] = [
      primary,
      [1, 0, 0], [-1, 0, 0],
      [0, 1, 0], [0, -1, 0],
      [0, 0, 1], [0, 0, -1],
    ]
    return uniqueDirections(axes)
  }

  if (n === 1) {
    return uniqueDirections([primary, ...coneCandidateDirs(neighborDirs[0], theta, preferredDir)])
  }

  if (n === 2 && geometry !== 'trigonal-planar' && geometry !== 'linear') {
    const cands = tetrahedralCandidates(neighborDirs[0], neighborDirs[1])
    if (cands) return uniqueDirections([primary, cands[0], cands[1]])
  }

  return [primary]
}

function uniqueDirections(dirs: readonly Vec3[]): Vec3[] {
  const out: Vec3[] = []
  for (const dir of dirs) {
    const d = normalize(dir)
    if (!out.some(existing => dot(existing, d) > 0.999)) out.push(d)
  }
  return out
}

function availableCoordinationDirections(centerAtom: Atom, neighborDirs: readonly Vec3[]): Vec3[] {
  const authored = centerAtom.coordinationDirections
  if (!authored || authored.length === 0) return []
  return authored
    .map(direction => normalize([...direction] as Vec3))
    .filter(direction => neighborDirs.every(neighbor => dot(direction, neighbor) < 0.94))
}

function chooseLeastClashingDirection(
  centerAtom: Atom,
  atoms: readonly Atom[],
  newSymbol: string,
  bondLength: number,
  dirs: readonly Vec3[],
): Vec3 {
  let best = dirs[0]
  let bestScore = scoreClashes([{
    symbol: newSymbol,
    x: centerAtom.x + best[0] * bondLength,
    y: centerAtom.y + best[1] * bondLength,
    z: centerAtom.z + best[2] * bondLength,
  }], atoms, new Set([centerAtom.id]))

  for (const dir of dirs.slice(1)) {
    const score = scoreClashes([{
      symbol: newSymbol,
      x: centerAtom.x + dir[0] * bondLength,
      y: centerAtom.y + dir[1] * bondLength,
      z: centerAtom.z + dir[2] * bondLength,
    }], atoms, new Set([centerAtom.id]))
    if (isBetterClashScore(score, bestScore)) {
      best = dir
      bestScore = score
    }
  }
  return best
}

/**
 * 拖拽生长：根据光标位置计算新原子的落点。
 * 方向吸附到 VSEPR 候选位（snap=false 时沿光标方向自由放置），键长始终用标准键长。
 */
export function calcGrowPosition(
  centerAtom: Atom,
  bonds: readonly Bond[],
  atoms: readonly Atom[],
  newSymbol: string,
  cursor: Vec3,
  snap = true,
): [number, number, number] {
  const center: Vec3 = [centerAtom.x, centerAtom.y, centerAtom.z]
  const raw = sub(cursor, center)
  const preferred = length(raw) > 1e-4 ? normalize(raw) : ([1, 0, 0] as Vec3)

  let dir: Vec3
  if (snap) {
    const atomById = new Map(atoms.map(a => [a.id, a]))
    const neighborDirs = getNeighborDirs(centerAtom, bonds, atomById)
    const hybridization = inferHybridization(bonds, centerAtom.id)
    const bLen = calcBondLength(centerAtom.symbol, newSymbol)
    const coordinationCandidates = availableCoordinationDirections(centerAtom, neighborDirs)
      .sort((a, b) => dot(b, preferred) - dot(a, preferred))
    dir = chooseLeastClashingDirection(
      centerAtom,
      atoms,
      newSymbol,
      bLen,
      coordinationCandidates.length > 0
        ? coordinationCandidates
        : candidateDirsForGrow(centerAtom.symbol, neighborDirs, hybridization, preferred),
    )
  } else {
    dir = preferred
  }

  const bLen = calcBondLength(centerAtom.symbol, newSymbol)
  return [center[0] + dir[0]*bLen, center[1] + dir[1]*bLen, center[2] + dir[2]*bLen]
}

/**
 * 点击生长的最终落点：默认取 VSEPR 方向；草图平面激活时在候选中
 * 改取贴着平面的方向（方向投影到平面后重新吸附）。
 */
export function calcClickGrowPosition(
  centerAtom: Atom,
  bonds: readonly Bond[],
  atoms: readonly Atom[],
  newSymbol: string,
  sketchPlane?: SketchPlane | null,
): [number, number, number] {
  const base = calcAddAtomOnExisting(centerAtom, bonds, atoms, newSymbol).position
  if (!sketchPlane) return base
  const n = normalize(sketchPlane.normal)
  const d: Vec3 = [base[0] - centerAtom.x, base[1] - centerAtom.y, base[2] - centerAtom.z]
  const k = dot(d, n)
  const proj: Vec3 = [d[0] - k*n[0], d[1] - k*n[1], d[2] - k*n[2]]
  if (length(proj) < 1e-3) return base   // 默认方向几乎垂直于平面，无法投影
  return calcGrowPosition(
    centerAtom, bonds, atoms, newSymbol,
    [centerAtom.x + proj[0], centerAtom.y + proj[1], centerAtom.z + proj[2]], true,
  )
}

// ── 拖出生长的槽位参考几何 ────────────────────────────────────────────────────

/**
 * 候选槽位的可视化描述（拖拽生长时画在场景里，提供空间感）：
 *  - ring：n=1 时合法方向构成绕已有键的圆锥，画锥底圆环
 *  - points：剩余槽位是离散的 1~2 个点
 *  - free：无邻居，任意方向（不画参考）
 */
export type GrowGuide =
  | { kind: 'free' }
  | { kind: 'ring'; center: [number, number, number]; axis: Vec3; radius: number }
  | { kind: 'points'; positions: [number, number, number][] }

export function getGrowGuide(
  centerAtom: Atom,
  bonds: readonly Bond[],
  atoms: readonly Atom[],
  newSymbol: string,
): GrowGuide {
  const atomById = new Map(atoms.map(a => [a.id, a]))
  const neighborDirs = getNeighborDirs(centerAtom, bonds, atomById)
  const n = neighborDirs.length
  const coordinationCandidates = availableCoordinationDirections(centerAtom, neighborDirs)
  if (centerAtom.coordinationDirections && coordinationCandidates.length === 0) return { kind: 'points', positions: [] }
  if (n === 0) return { kind: 'free' }

  const hybridization = inferHybridization(bonds, centerAtom.id)
  const geometry = inferGeometry(centerAtom.symbol, n, hybridization)
  const rule = GEOMETRY_RULES[geometry] ?? GEOMETRY_RULES['tetrahedral']
  const θrad = rule.bondAngle * (Math.PI / 180)
  const bLen = calcBondLength(centerAtom.symbol, newSymbol)
  const c: Vec3 = [centerAtom.x, centerAtom.y, centerAtom.z]
  const at = (dir: Vec3): [number, number, number] =>
    [c[0] + dir[0]*bLen, c[1] + dir[1]*bLen, c[2] + dir[2]*bLen]

  if (coordinationCandidates.length > 0) {
    return { kind: 'points', positions: coordinationCandidates.map(at) }
  }

  if (n === 1) {
    // 合法方向构成绕 d0 张角 θ 的圆锥
    const d0 = neighborDirs[0]
    const h = bLen * Math.cos(θrad)
    return {
      kind: 'ring',
      center: [c[0] + d0[0]*h, c[1] + d0[1]*h, c[2] + d0[2]*h],
      axis: d0,
      radius: bLen * Math.sin(θrad),
    }
  }

  if (n === 2) {
    const d1 = neighborDirs[0], d2 = neighborDirs[1]
    const sum = add(d1, d2)
    if (geometry !== 'trigonal-planar' && geometry !== 'linear') {
      // sp3：±法向两个对称候选位
      const cands = tetrahedralCandidates(d1, d2)
      if (cands) return { kind: 'points', positions: [at(cands[0]), at(cands[1])] }
    }
    return { kind: 'points', positions: [at(findNextBondDir(centerAtom.symbol, neighborDirs, hybridization))] }
  }

  // n≥3：剩余槽位唯一
  return { kind: 'points', positions: [at(findNextBondDir(centerAtom.symbol, neighborDirs, hybridization))] }
}

// ── 新原子位置计算 ────────────────────────────────────────────────────────────

export interface AddAtomResult {
  position: [number, number, number]
  bondLength: number
  geometry: string
  availableSlots: number
}

export function calcAddAtomOnExisting(
  centerAtom: Atom,
  bonds: readonly Bond[],
  atoms: readonly Atom[],
  newSymbol: string,
): AddAtomResult {
  const atomById = new Map(atoms.map(a => [a.id, a]))
  const neighborDirs = getNeighborDirs(centerAtom, bonds, atomById)
  const hybridization = inferHybridization(bonds, centerAtom.id)
  const bLen = calcBondLength(centerAtom.symbol, newSymbol)
  const coordinationCandidates = availableCoordinationDirections(centerAtom, neighborDirs)
  const defaultDirection = findNextBondDir(centerAtom.symbol, neighborDirs, hybridization)
  const dir = chooseLeastClashingDirection(
    centerAtom,
    atoms,
    newSymbol,
    bLen,
    coordinationCandidates.length > 0
      ? coordinationCandidates
      : candidateDirsForGrow(centerAtom.symbol, neighborDirs, hybridization, defaultDirection),
  )
  const maxBonds = centerAtom.coordinationNumber ?? getElementConfig(centerAtom.symbol).maxBonds
  const geometry = centerAtom.coordinationGeometry ?? inferGeometry(centerAtom.symbol, neighborDirs.length, hybridization)

  return {
    position: [
      centerAtom.x + dir[0] * bLen,
      centerAtom.y + dir[1] * bLen,
      centerAtom.z + dir[2] * bLen,
    ],
    bondLength: bLen,
    geometry,
    availableSlots: Math.max(0, maxBonds - neighborDirs.length),
  }
}
