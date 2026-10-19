/**
 * GeometryRelaxer 回归测试：两类会把正确几何压坏的角约束缺陷
 *
 * 1) 桥氢/桥卤中心（B₂H₆ 的 H，deg=2）的 inferGeometry='free'，bondAngle=360 是哨兵。
 *    曾直接取 cos360°=1，1-3 目标距离算成 |la−lb|=0，把两个桥头 B 拉到重合
 *    （实测 300 步后 B–B = 4e-19），且该对被记入 constrained 后非键斥力也不再推开。
 *    修复后 'free' 中心跳过角约束，桥头对靠非键斥力保持分开。
 *
 * 2) 四配位磷曾被 inferGeometry 的 connectionCount>=4 分支判成 octahedral（90°），
 *    6 对 1-3 约束几何上不可满足：理想四面体 PO₄ 永不收敛，且 O–O 被从 2.629
 *    压向 2.277。修复后按四面体角约束，理想输入立即收敛、结构不被压坏。
 */
import { describe, it, expect } from 'vitest'
import { GeometryRelaxer } from './relax'
import type { Molecule } from '../molecule'

function dist(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
}

describe("桥连终端元素（'free' 几何中心）", () => {
  it('B–H–B 桥氢：两个桥头硼不被拉到重合', () => {
    const mol: Molecule = {
      atoms: [
        { id: 'b1', symbol: 'B', x: -1.0, y: 0.3, z: 0 },
        { id: 'b2', symbol: 'B', x: 1.0, y: 0.3, z: 0 },
        { id: 'hb', symbol: 'H', x: 0, y: -0.7, z: 0 },
      ],
      bonds: [
        { id: 'bond1', atomId1: 'b1', atomId2: 'hb', order: 1 },
        { id: 'bond2', atomId1: 'b2', atomId2: 'hb', order: 1 },
      ],
    }
    const relaxer = new GeometryRelaxer(mol)
    relaxer.step(300)
    const pos = relaxer.positions()
    const bb = dist(pos.get('b1')!, pos.get('b2')!)
    // 修复前 300 步后 B–B = 4.3e-19（完全重合）；修复后非键斥力保持桥头分开
    expect(bb).toBeGreaterThan(1.5)
  })
})

describe('四配位磷中心', () => {
  const PO = 1.61   // O-P 表值
  const t = 1 / Math.sqrt(3)
  const idealTetrahedralPO4 = (): Molecule => ({
    atoms: [
      { id: 'p', symbol: 'P', x: 0, y: 0, z: 0 },
      { id: 'o1', symbol: 'O', x: PO * t, y: PO * t, z: PO * t },
      { id: 'o2', symbol: 'O', x: PO * t, y: -PO * t, z: -PO * t },
      { id: 'o3', symbol: 'O', x: -PO * t, y: PO * t, z: -PO * t },
      { id: 'o4', symbol: 'O', x: -PO * t, y: -PO * t, z: PO * t },
    ],
    bonds: [
      { id: 'b1', atomId1: 'p', atomId2: 'o1', order: 1 },
      { id: 'b2', atomId1: 'p', atomId2: 'o2', order: 1 },
      { id: 'b3', atomId1: 'p', atomId2: 'o3', order: 1 },
      { id: 'b4', atomId1: 'p', atomId2: 'o4', order: 1 },
    ],
  })

  it('理想四面体 PO₄ 能收敛，不被 90° 约束压坏', () => {
    const relaxer = new GeometryRelaxer(idealTetrahedralPO4(), { jitter: 0 })
    let frames = 0
    for (; frames < 300; frames++) {
      relaxer.step(1)
      if (relaxer.converged) break
    }
    // 修复前：maxResidual 卡在 ~0.286 永不收敛
    expect(relaxer.converged).toBe(true)
    expect(frames).toBeLessThan(100)

    // O–O 保持在四面体理想值 √(8/3)·1.61 ≈ 2.629 附近（修复前被压到 2.25–2.38）
    const pos = relaxer.positions()
    const os = ['o1', 'o2', 'o3', 'o4'].map(id => pos.get(id)!)
    for (let i = 0; i < os.length; i++) {
      for (let j = i + 1; j < os.length; j++) {
        expect(dist(os[i], os[j])).toBeGreaterThan(2.55)
        expect(dist(os[i], os[j])).toBeLessThan(2.7)
      }
    }
  })
})
