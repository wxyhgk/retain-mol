import { describe, expect, it } from 'vitest'
import * as root from '../index'
import * as core from './core'
import * as fragments from './fragments'

describe('mol-viewer public manifest', () => {
  it('keeps mutable builder internals out of the root entry', () => {
    expect(root).not.toHaveProperty('FRAGMENTS')
    expect(root).not.toHaveProperty('bondSelectedAtoms')
    expect(root).not.toHaveProperty('canBond')
    expect(root).not.toHaveProperty('calcAddAtomOnExisting')
    expect(root).not.toHaveProperty('useBuilder')
    expect(root).not.toHaveProperty('cn')
  })

  it('exposes fragment data only through defensive public copies', () => {
    const first = root.getFragment('benzene')
    const second = fragments.getFragment('benzene')

    expect(first).toBeDefined()
    expect(first).not.toBe(second)
    expect(first?.atoms).not.toBe(second?.atoms)
    expect(root.listFragments()).not.toBe(root.listFragments())
  })

  it('exposes chemistry derivations through the core subpath', () => {
    expect(core.getMolecularFormula([{ symbol: 'H' }, { symbol: 'O' }, { symbol: 'H' }])).toBe('H2O')
    expect(core.calculateMolecularWeight([{ symbol: 'H' }])).toBeCloseTo(1.008, 3)
    expect(core.calculateMolecularWeight([{ symbol: 'Xx' }])).toBeNull()
  })
})
