import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { GeometryRelaxer } from './relax'
import { parseSdf } from '../io/molFormat'
import { inferHybridization } from '../builder/analysis/hybridization'
import { inferGeometry, GEOMETRY_RULES } from '../../config/geometry.config'
import type { Molecule } from '../molecule'

function dist(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
}

/** 把松弛后坐标写回分子（按 id） */
function applyPositions(mol: Molecule, pos: Map<string, { x: number; y: number; z: number }>): Molecule {
  return { ...mol, atoms: mol.atoms.map(a => ({ ...a, ...pos.get(a.id)! })) }
}

function diagnose(mol: Molecule, label: string) {
  const byId = new Map(mol.atoms.map(a => [a.id, a]))
  // 3D 性：z 范围
  const zs = mol.atoms.map(a => a.z)
  const zRange = Math.max(...zs) - Math.min(...zs)

  // 键长误差
  let bondErrSum = 0, bondErrMax = 0
  for (const b of mol.bonds) {
    const a1 = byId.get(b.atomId1)!, a2 = byId.get(b.atomId2)!
    // 目标键长（和 relax 内部一致的查表口径）
    const d = dist(a1, a2)
    // 简单参考：C-C 1.54 / 芳香近似——这里只统计相对散布，精确目标见 relax
    bondErrSum += d
    void a1; void a2
  }
  const bondAvg = bondErrSum / mol.bonds.length

  // 最小非键距离（抽样：不相邻原子对）
  const bonded = new Set<string>()
  const key = (x: string, y: string) => (x < y ? `${x},${y}` : `${y},${x}`)
  for (const b of mol.bonds) bonded.add(key(b.atomId1, b.atomId2))
  let minNonbond = Infinity
  for (let i = 0; i < mol.atoms.length; i++) {
    for (let j = i + 1; j < mol.atoms.length; j++) {
      if (bonded.has(key(mol.atoms[i].id, mol.atoms[j].id))) continue
      const dd = dist(mol.atoms[i], mol.atoms[j])
      if (dd < minNonbond) minNonbond = dd
    }
  }

  // 抽查键角误差：对 sp2/sp3 中心
  let angErrSum = 0, angCount = 0
  for (const c of mol.atoms) {
    const nbrs = mol.bonds
      .filter(b => b.atomId1 === c.id || b.atomId2 === c.id)
      .map(b => byId.get(b.atomId1 === c.id ? b.atomId2 : b.atomId1)!)
    if (nbrs.length < 2 || nbrs.length > 4) continue
    const hyb = inferHybridization(mol.bonds, c.id)
    const geom = inferGeometry(c.symbol, nbrs.length, hyb)
    const ideal = GEOMETRY_RULES[geom].bondAngle
    if (ideal >= 360) continue
    for (let a = 0; a < nbrs.length; a++) {
      for (let b = a + 1; b < nbrs.length; b++) {
        const v1 = { x: nbrs[a].x - c.x, y: nbrs[a].y - c.y, z: nbrs[a].z - c.z }
        const v2 = { x: nbrs[b].x - c.x, y: nbrs[b].y - c.y, z: nbrs[b].z - c.z }
        const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z
        const ang = Math.acos(Math.max(-1, Math.min(1, dot / (Math.hypot(v1.x, v1.y, v1.z) * Math.hypot(v2.x, v2.y, v2.z))))) * 180 / Math.PI
        angErrSum += Math.abs(ang - ideal)
        angCount++
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log(`[${label}] z范围=${zRange.toFixed(2)}Å  平均键长=${bondAvg.toFixed(3)}Å  最小非键距离=${minNonbond.toFixed(2)}Å  平均键角误差=${(angErrSum / angCount).toFixed(1)}°`)
  return { zRange, minNonbond, angErr: angErrSum / angCount }
}

describe('GeometryRelaxer 2D→3D 展开（GD163 硼 OLED 骨架）', () => {
  it('把平面骨架松弛成合理的三维结构', () => {
    const sdf = readFileSync(resolve(process.cwd(), '../../data/GD163.sdf'), 'utf8')
    const mol = parseSdf(sdf)[0]
    expect(mol.atoms.length).toBe(80)

    diagnose(mol, '初始2D')
    const relaxer = new GeometryRelaxer(mol)
    let frames = 0
    for (let i = 0; i < 600; i++) {
      relaxer.step(1)
      frames++
      if (relaxer.converged) break
    }
    const out = applyPositions(mol, relaxer.positions())
    const d = diagnose(out, `松弛后(${frames}帧, 残差${relaxer.maxResidual.toFixed(4)})`)

    expect(d.zRange).toBeGreaterThan(1.0)       // 真的立体化了
    expect(d.minNonbond).toBeGreaterThan(1.5)   // 没有原子对穿插重叠
    expect(d.angErr).toBeLessThan(20)           // 键角大致到位
  })
})
