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
      attachBond: undefined,
      attachHIndex: benzene.attachIndex,
    }

    const issues = validateFragmentDef(broken)

    expect(issues.map(i => i.code)).toContain('attach.h.not_hydrogen')
    expect(issues.map(i => i.code)).toContain('attach.axis.missing_bond')
  })

  it('allows edge attachment templates without an attach hydrogen', () => {
    const benzene = getFragment('benzene')!
    const edgeTemplate: FragmentDef = {
      ...benzene,
      id: 'edge-template',
      attachHIndex: -1,
    }

    expect(validateFragmentDef(edgeTemplate)).toEqual([])
  })

  it('rejects templates whose local topology already exceeds element valence', () => {
    const invalid: FragmentDef = {
      id: 'over-valent-hydrogen',
      name: 'invalid',
      short: 'invalid',
      formula: 'H-C-H',
      atoms: [
        { symbol: 'H', x: 0, y: 0, z: 0 },
        { symbol: 'C', x: 1, y: 0, z: 0 },
        { symbol: 'H', x: -1, y: 0, z: 0 },
      ],
      bonds: [
        { a: 0, b: 1, order: 1 },
        { a: 0, b: 2, order: 1 },
      ],
      attachIndex: 1,
      attachHIndex: 0,
    }

    expect(validateFragmentDef(invalid).map(issue => issue.code)).toContain('atom.valence.exceeded')
  })

  it('rejects ambiguous bridge metadata instead of inferring a second site', () => {
    const fluorene = getFragment('fluorene-9h-site-a')!
    const invalid: FragmentDef = {
      ...fluorene,
      id: 'bad-bridge-sites',
      bridgeAttachment: {
        centerIndex: 6,
        sites: [
          { leavingHydrogenIndex: 17, order: 1 },
          { leavingHydrogenIndex: 17, order: 1 },
        ],
      },
    }

    expect(validateFragmentDef(invalid).map(issue => issue.code)).toContain('bridge.sites.duplicate')
  })
})
