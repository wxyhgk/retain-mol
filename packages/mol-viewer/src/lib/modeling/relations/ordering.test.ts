import { describe, expect, it } from 'vitest'
import { sortedStrings } from './ordering'

describe('relation certificate ordering', () => {
  it('uses Unicode code-point order instead of locale or UTF-16 ordering', () => {
    expect(sortedStrings(['😀', '\uE000', 'ascii'])).toEqual(['ascii', '\uE000', '😀'])
  })
})
