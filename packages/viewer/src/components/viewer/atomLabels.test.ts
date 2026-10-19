import { describe, expect, it } from 'vitest'
import { buildNumberedAtomLabels } from './atomLabels'

describe('buildNumberedAtomLabels', () => {
  it('uses the molecule-wide atom order for repeated and mixed elements', () => {
    expect(buildNumberedAtomLabels([
      { symbol: 'C' },
      { symbol: 'H' },
      { symbol: 'H' },
      { symbol: 'O' },
    ])).toEqual(['C1', 'H2', 'H3', 'O4'])
  })

  it('returns no labels for an empty molecule', () => {
    expect(buildNumberedAtomLabels([])).toEqual([])
  })
})
