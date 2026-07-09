import { describe, expect, it } from 'vitest'
import { FRAGMENTS, getFragment, type FragmentDef } from '../fragmentLibrary'
import { validateFragmentDef, validateFragmentLibrary } from './FragmentValidator'

describe('FragmentValidator', () => {
  it('accepts all built-in fragments', () => {
    expect(validateFragmentLibrary(FRAGMENTS)).toEqual([])
  })

  it('catches invalid attach axis contracts', () => {
    const benzene = getFragment('benzene')!
    const broken: FragmentDef = {
      ...benzene,
      id: 'broken',
      attachHIndex: benzene.attachIndex,
    }

    const issues = validateFragmentDef(broken)

    expect(issues.map(i => i.code)).toContain('attach.h.not_hydrogen')
    expect(issues.map(i => i.code)).toContain('attach.axis.missing_bond')
  })
})
