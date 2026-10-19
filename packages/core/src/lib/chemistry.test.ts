import { describe, expect, it } from 'vitest'
import { getElementConfig, findElementConfig } from '../config/elements.config'
import { calculateMolecularWeight, getMolecularFormula } from './chemistry'

const atoms = (...symbols: string[]) => symbols.map(symbol => ({ symbol }))

describe('getMolecularFormula', () => {
  it('uses C, H, then alphabetical order for carbon-containing compounds', () => {
    expect(getMolecularFormula(atoms('O', 'H', 'C', 'H', 'H', 'H'))).toBe('CH4O')
    expect(getMolecularFormula(atoms('O', 'Cl', 'C', 'H', 'Br'))).toBe('CHBrClO')
  })

  it('uses strict alphabetical order when carbon is absent', () => {
    expect(getMolecularFormula(atoms('Na', 'Cl'))).toBe('ClNa')
    expect(getMolecularFormula(atoms('N', 'H', 'H', 'H'))).toBe('H3N')
  })

  it('omits counts of one and returns empty text for no atoms', () => {
    expect(getMolecularFormula(atoms('He'))).toBe('He')
    expect(getMolecularFormula([])).toBe('')
  })
})

describe('calculateMolecularWeight', () => {
  it('distinguishes strict lookup from display fallbacks and isotope mass from standard weight', () => {
    expect(findElementConfig('C')?.atomicNumber).toBe(6)
    expect(findElementConfig('Xx')).toBeUndefined()
    expect(findElementConfig('constructor')).toBeUndefined()
    expect(getElementConfig('constructor').atomicNumber).toBe(0)
    expect(calculateMolecularWeight([{ symbol: 'C', isotope: 13 }])).toBeNull()
  })
  it('sums configured standard atomic weights', () => {
    expect(calculateMolecularWeight(atoms('O', 'H', 'H'))).toBeCloseTo(18.015, 2)
    expect(calculateMolecularWeight([])).toBe(0)
  })

  it('returns null instead of silently treating unknown element masses as zero', () => {
    expect(getElementConfig('Xx').atomicMass).toBeNull()
    expect(calculateMolecularWeight(atoms('Xx'))).toBeNull()
    expect(calculateMolecularWeight(atoms('C', 'Xx'))).toBeNull()
  })
})
