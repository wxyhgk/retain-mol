import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../../molecule'
import { resolveAttachFragmentTarget } from './attachTarget'

describe('resolveAttachFragmentTarget', () => {
  it('rejects a missing target atom', () => {
    expect(resolveAttachFragmentTarget({ atoms: [], bonds: [] }, 'missing', 1))
      .toEqual({ ok: false, reason: '原子不存在' })
  })

  it('resolves a hydrogen target to its heavy atom host and C-H direction', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1, 0, 0)
    const bond = newBond(c.id, h.id)

    const result = resolveAttachFragmentTarget({ atoms: [c, h], bonds: [bond] }, h.id, 1)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.host).toBe(c)
    expect([...result.removeHIds]).toEqual([h.id])
    expect(result.direction.x).toBeCloseTo(1)
    expect(result.direction.y).toBeCloseTo(0)
    expect(result.direction.z).toBeCloseTo(0)
  })

  it('rejects a saturated heavy atom target without forcing hydrogen edits', () => {
    const center = newAtom('C', 0, 0, 0)
    const neighbors = [
      newAtom('C', 1, 0, 0),
      newAtom('C', -1, 0, 0),
      newAtom('C', 0, 1, 0),
      newAtom('C', 0, -1, 0),
    ]
    const molecule = {
      atoms: [center, ...neighbors],
      bonds: neighbors.map(atom => newBond(center.id, atom.id)),
    }

    expect(resolveAttachFragmentTarget(molecule, center.id, 1))
      .toEqual({ ok: false, reason: 'C 已饱和 · 点击它的 H 可直接替换' })
  })
})
