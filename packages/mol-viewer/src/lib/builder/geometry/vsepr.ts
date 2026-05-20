/**
 * vsepr.ts — VSEPR 几何定位
 * 计算新原子应放置的位置，基于中心原子的配位几何。
 */

import { getElementConfig } from '../../../config/elements.config'
import { inferGeometry, GEOMETRY_RULES, STANDARD_BOND_LENGTHS } from '../../../config/geometry.config'
import type { Atom, Bond } from '../../molecule'
import { add, sub, scale, dot, cross, length, normalize } from '../math/vec3'
import type { Vec3 } from '../math/vec3'

// ── 键长 ──────────────────────────────────────────────────────────────────────

export function calcBondLength(sym1: string, sym2: string): number {
  const key = [sym1, sym2].sort().join('-')
  if (STANDARD_BOND_LENGTHS[key]) return STANDARD_BOND_LENGTHS[key]
  const r1 = getElementConfig(sym1).covalentRadius
  const r2 = getElementConfig(sym2).covalentRadius
  return (r1 + r2) * 1.08
}

// ── 邻居方向 ──────────────────────────────────────────────────────────────────

export function getNeighborDirs(
  center: Atom,
  bonds: readonly Bond[],
  atomById: Map<string, Atom>,
): Vec3[] {
  return bonds
    .filter(b => b.atomId1 === center.id || b.atomId2 === center.id)
    .map(b => {
      const nbId = b.atomId1 === center.id ? b.atomId2 : b.atomId1
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
 * 根据现有邻居方向，按 VSEPR 规则返回新键的单位方向向量。
 *
 * n=0  → 沿 +X
 * n=1  → 与已有键成 bondAngle 角，垂直分量"朝上"
 * n=2  → 四面体第三位，法向量优先朝 +Z
 * n=3  → 四面体第四位（三键之和的反方向）
 * n≥4  → 超价，取现有键之和的反方向
 */
export function findNextBondDir(centerSymbol: string, neighborDirs: Vec3[]): Vec3 {
  const n = neighborDirs.length
  const geometry = inferGeometry(centerSymbol, n)
  const rule = GEOMETRY_RULES[geometry]
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
    const nx = cross(d1, d2)
    if (length(nx) < 0.05) return upwardPerp(d1)

    const sum = add(d1, d2)
    if (length(sum) < 0.05) return normalize(nx)

    const sHat = normalize(sum)
    let nHat = normalize(nx)
    if (nHat[2] < 0 || (nHat[2] === 0 && nHat[1] < 0)) nHat = scale(nHat, -1)

    return normalize(add(scale(sHat, -1/Math.sqrt(3)), scale(nHat, Math.sqrt(2/3))))
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
  const dir = findNextBondDir(centerAtom.symbol, neighborDirs)
  const bLen = calcBondLength(centerAtom.symbol, newSymbol)
  const maxBonds = getElementConfig(centerAtom.symbol).maxBonds
  const geometry = inferGeometry(centerAtom.symbol, neighborDirs.length)

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
