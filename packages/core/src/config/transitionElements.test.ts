import { describe, expect, it } from 'vitest'
import { getElementConfig } from './elements.config'

const TRANSITION_METALS = [
  'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn',
  'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd',
  'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg',
  'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg', 'Cn',
] as const

describe('transition-metal element configuration', () => {
  it('configures all 38 d-block metals without using the unknown fallback', () => {
    expect(TRANSITION_METALS).toHaveLength(38)
    for (const symbol of TRANSITION_METALS) {
      const element = getElementConfig(symbol)
      expect(element.symbol).toBe(symbol)
      expect(element.atomicNumber).toBeGreaterThan(0)
      expect(element.atomicMass).not.toBeNull()
      expect(element.category).toBe('transition')
      expect(element.maxBonds).toBe(12)
      expect(element.defaultValence).toBe(0)
    }
  })
})
