import { describe, expect, it } from 'vitest'
import { defaultPsi4JobFormValues, psi4JobFormSchema } from './psi4JobSchema'

describe('psi4JobFormSchema', () => {
  it('accepts the supported default frequency calculation', () => {
    expect(psi4JobFormSchema.safeParse(defaultPsi4JobFormValues).success).toBe(true)
  })

  it('rejects unsafe runtime limits before the request reaches Psi4', () => {
    const result = psi4JobFormSchema.safeParse({
      ...defaultPsi4JobFormValues,
      threads: 17,
      memoryMb: 128,
      points: 201,
    })
    expect(result.success).toBe(false)
  })
})
