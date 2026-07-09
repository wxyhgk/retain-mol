import { describe, expect, it } from 'vitest'
import { getFragment } from '../fragmentLibrary'
import { resolveBondClickDecision } from './bondClickDecision'

describe('resolveBondClickDecision', () => {
  it('prioritizes ring fuse when a fragment is active', () => {
    const fragment = getFragment('benzene')
    expect(fragment).toBeDefined()
    if (!fragment) return

    expect(resolveBondClickDecision({
      bondId: 'b1',
      fragment,
      cycleLength: true,
    })).toEqual({ kind: 'fuse', bondId: 'b1', fragment })
  })

  it('cycles bond length when requested without a fragment', () => {
    expect(resolveBondClickDecision({
      bondId: 'b1',
      cycleLength: true,
    })).toEqual({ kind: 'cycleLength', bondId: 'b1' })
  })

  it('returns noop for plain bond clicks', () => {
    expect(resolveBondClickDecision({ bondId: 'b1' })).toEqual({ kind: 'noop' })
  })
})
