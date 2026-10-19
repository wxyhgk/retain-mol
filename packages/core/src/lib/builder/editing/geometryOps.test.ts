import { describe, it, expect } from 'vitest'
import { newAtom, newBond } from '../../molecule'
import type { Atom } from '../../molecule'
import { calcAngle, calcDihedral, calcDistance } from '../geometry/measure'
import { setBondAngle, setBondLength, setDihedralAngle } from './geometryOps'

describe('geometryOps（键长/键角/二面角编辑）', () => {
  /** 丁烷式骨架 a-b-c-d（带一个挂在 c 上的支链 e，验证刚体旋转） */
  function makeChain() {
    const a = newAtom('C', 0, 0, 0)
    const b = newAtom('C', 1.54, 0, 0)
    const c = newAtom('C', 2.3, 1.3, 0)
    const d = newAtom('C', 3.84, 1.3, 0.2)
    const e = newAtom('H', 2.3, 1.9, 1.0)   // c 的支链
    return {
      atoms: [a, b, c, d, e],
      bonds: [newBond(a.id, b.id), newBond(b.id, c.id), newBond(c.id, d.id), newBond(c.id, e.id)],
      ids: { a: a.id, b: b.id, c: c.id, d: d.id, e: e.id },
    }
  }
  const get = (m: { atoms: readonly Atom[] }, id: string) => m.atoms.find(x => x.id === id)!

  it('setBondLength：平移 B 端片段到目标距离，片段内部几何不变', () => {
    const mol = makeChain()
    const result = setBondLength(mol, mol.ids.a, mol.ids.b, 2.0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const m = result.molecule
    expect(Math.abs(calcDistance(get(m, mol.ids.a), get(m, mol.ids.b)) - 2.0)).toBeLessThan(1e-6)
    // b–c 距离（同侧内部）不变
    const before = calcDistance(get(mol as never, mol.ids.b), get(mol as never, mol.ids.c))
    const after  = calcDistance(get(m, mol.ids.b), get(m, mol.ids.c))
    expect(Math.abs(after - before)).toBeLessThan(1e-9)
  })

  it('setBondAngle：以 B 为顶点转 C 端到目标角，支链跟随刚体旋转', () => {
    const mol = makeChain()
    const result = setBondAngle(mol, mol.ids.a, mol.ids.b, mol.ids.c, 90)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const m = result.molecule
    expect(Math.abs(calcAngle(get(m, mol.ids.a), get(m, mol.ids.b), get(m, mol.ids.c)) - 90)).toBeLessThan(0.01)
    // c–d、c–e 内部距离不变（刚体）
    expect(Math.abs(
      calcDistance(get(m, mol.ids.c), get(m, mol.ids.d)) -
      calcDistance(get(mol as never, mol.ids.c), get(mol as never, mol.ids.d))
    )).toBeLessThan(1e-9)
  })

  it('setDihedralAngle：绕 B–C 轴转到目标二面角（含符号）', () => {
    const mol = makeChain()
    for (const target of [60, -60, 175]) {
      const result = setDihedralAngle(mol, mol.ids.a, mol.ids.b, mol.ids.c, mol.ids.d, target)
      expect(result.ok).toBe(true)
      if (!result.ok) return
      const m = result.molecule
      const got = calcDihedral(get(m, mol.ids.a), get(m, mol.ids.b), get(m, mol.ids.c), get(m, mol.ids.d))
      expect(Math.abs(got - target)).toBeLessThan(0.01)
      // A、B 不动
      expect(get(m, mol.ids.a).x).toBe(get(mol as never, mol.ids.a).x)
      expect(get(m, mol.ids.b).y).toBe(get(mol as never, mol.ids.b).y)
    }
  })

  it('setDihedralAngle：1 号原子在 C 端旋转侧 → 拒绝', () => {
    const mol = makeChain()
    // e 挂在 c 上，属于旋转侧：绕 b–c 轴转会带着 e 一起转，
    // 二面角读数永远不变（修复前会失败两次后应用一次反向旋转）
    const result = setDihedralAngle(mol, mol.ids.e, mol.ids.b, mol.ids.c, mol.ids.d, 60)
    expect(result).toMatchObject({ ok: false, reason: expect.stringContaining('旋转侧') })
  })

  it('环内键长/二面角 → 拒绝', () => {
    // 三元环
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.5, 0, 0)
    const c3 = newAtom('C', 0.75, 1.3, 0)
    const mol = {
      atoms: [c1, c2, c3],
      bonds: [newBond(c1.id, c2.id), newBond(c2.id, c3.id), newBond(c3.id, c1.id)],
    }
    expect(setBondLength(mol, c1.id, c2.id, 2.0).ok).toBe(false)
    expect(setDihedralAngle(mol, c3.id, c1.id, c2.id, c3.id, 30).ok).toBe(false)
  })

  it('无键且同片段的两原子 → 拒绝调距离', () => {
    const mol = makeChain()
    expect(setBondLength(mol, mol.ids.a, mol.ids.c, 2.5).ok).toBe(false)
  })
})
