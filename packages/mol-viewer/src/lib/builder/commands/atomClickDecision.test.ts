import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../molecule'
import { getFragment } from '../fragmentLibrary'
import { resolveAtomClickDecision } from './atomClickDecision'

describe('resolveAtomClickDecision', () => {
  it('returns an error decision for a missing atom', () => {
    expect(resolveAtomClickDecision({ atoms: [], bonds: [] }, {
      atomId: 'missing',
      activeElement: 'C',
      atomClickMode: 'grow',
    })).toEqual({ kind: 'error', reason: '原子不存在' })
  })

  it('prioritizes fragment attach over atom replacement', () => {
    const c = newAtom('C', 0, 0, 0)
    const fragment = getFragment('benzene')
    expect(fragment).toBeDefined()
    if (!fragment) return

    expect(resolveAtomClickDecision({ atoms: [c], bonds: [] }, {
      atomId: c.id,
      activeElement: 'N',
      atomClickMode: 'replace',
      fragment,
    })).toEqual({ kind: 'attach', atomId: c.id, fragment })
  })

  it('turns same-element replace into a noop', () => {
    const c = newAtom('C', 0, 0, 0)

    expect(resolveAtomClickDecision({ atoms: [c], bonds: [] }, {
      atomId: c.id,
      activeElement: 'C',
      atomClickMode: 'replace',
    })).toEqual({ kind: 'noop', message: '已是 C' })
  })

  it('grows from a bonded hydrogen in grow mode', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1, 0, 0)

    expect(resolveAtomClickDecision({ atoms: [c, h], bonds: [newBond(c.id, h.id)] }, {
      atomId: h.id,
      activeElement: 'O',
      atomClickMode: 'grow',
    })).toEqual({ kind: 'growFromHydrogen', atomId: h.id, element: 'O' })
  })

  it('keeps isolated hydrogen clicks as noops', () => {
    const h = newAtom('H', 0, 0, 0)

    expect(resolveAtomClickDecision({ atoms: [h], bonds: [] }, {
      atomId: h.id,
      activeElement: 'C',
      atomClickMode: 'grow',
    })).toEqual({ kind: 'noop', message: '孤立 H · Esc 切换到选择' })
  })
})
