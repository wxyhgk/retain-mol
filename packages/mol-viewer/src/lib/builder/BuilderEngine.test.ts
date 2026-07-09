import { describe, it, expect } from 'vitest'
import { newAtom } from '../molecule'
import { calcBondLength, measureDistance } from './BuilderEngine'

describe('BuilderEngine barrel', () => {
  it('keeps legacy geometry exports available', () => {
    expect(calcBondLength('C', 'H')).toBeCloseTo(1.09, 2)
    expect(measureDistance(newAtom('C', 0, 0, 0), newAtom('C', 3, 4, 0))).toBeCloseTo(5, 5)
  })
})
