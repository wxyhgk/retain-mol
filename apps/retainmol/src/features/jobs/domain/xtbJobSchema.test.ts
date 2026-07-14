import { describe, expect, it } from 'vitest'
import { xtbJobFormSchema } from './xtbJobSchema'

describe('xtbJobFormSchema', () => {
  it('accepts valid electronic state and optimization controls', () => {
    expect(xtbJobFormSchema.safeParse({ name: '', charge: -1, multiplicity: 2, optLevel: 'tight', maxSteps: 500 }).success).toBe(true)
  })

  it('rejects fractional charge, zero multiplicity, and excessive steps', () => {
    expect(xtbJobFormSchema.safeParse({ name: '', charge: 0.5, multiplicity: 0, optLevel: 'normal', maxSteps: 1001 }).success).toBe(false)
  })
})
