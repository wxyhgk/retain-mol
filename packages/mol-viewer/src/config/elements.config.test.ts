import { describe, expect, it } from 'vitest'
import { ELEMENT_CONFIGS, findElementConfig, getElementConfig } from './elements.config'
import { ELEMENT_DATA, findElementData, getElementData } from '../lib/model/elements'
import { calculateMolecularWeight } from '../lib/chemistry'

describe('element compatibility lookup', () => {
  it('preserves stable known-symbol references and strict lookup', () => {
    expect(Object.keys(ELEMENT_CONFIGS)).toEqual(Object.keys(ELEMENT_DATA))
    for (const symbol of Object.keys(ELEMENT_DATA)) {
      expect(getElementConfig(symbol)).toBe(ELEMENT_CONFIGS[symbol])
      expect(findElementConfig(symbol)).toBe(ELEMENT_CONFIGS[symbol])
    }
  })

  it.each(['Xx', '__proto__', 'constructor', 'toString', '', 'c'])('keeps %s fallback distinguishable from valid element data', symbol => {
    expect(findElementData(symbol)).toBeUndefined()
    expect(findElementConfig(symbol)).toBeUndefined()
    expect(getElementData(symbol)).toMatchObject({ symbol, atomicNumber: 0, atomicMass: null })
    expect(getElementConfig(symbol)).toMatchObject({
      symbol, atomicMass: null, covalentRadius: 0.9, cpkRadius: 1.5,
      maxBonds: 4, defaultHybridization: 'sp3', color: 0xff69b4,
    })
    expect(calculateMolecularWeight([{ symbol }])).toBeNull()
  })
})
