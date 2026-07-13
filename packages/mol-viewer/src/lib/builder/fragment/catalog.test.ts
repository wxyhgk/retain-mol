import { describe, expect, it } from 'vitest'
import { FRAGMENTS } from './catalog'
import { COORDINATION_FRAGMENTS } from './catalogs/coordination'
import { ORGANIC_STUB_FRAGMENTS } from './catalogs/organicStubs'
import { RING_FRAGMENTS } from './catalogs/rings'
import { getFragment } from './registry'

describe('built-in fragment catalog', () => {
  it('aggregates each catalog in stable order without duplicate ids', () => {
    const expected = [
      ...ORGANIC_STUB_FRAGMENTS,
      ...COORDINATION_FRAGMENTS,
      ...RING_FRAGMENTS,
    ]

    expect(FRAGMENTS).toEqual(expected)
    expect(FRAGMENTS.map(fragment => fragment.id)).toEqual(expected.map(fragment => fragment.id))
    expect(new Set(FRAGMENTS.map(fragment => fragment.id)).size).toBe(FRAGMENTS.length)
  })

  it.each(['c-sp3', COORDINATION_FRAGMENTS[0]!.id, 'benzene'])(
    'preserves getFragment lookup for %s',
    (id) => {
      const catalogFragment = FRAGMENTS.find(fragment => fragment.id === id)
      expect(catalogFragment).toBeDefined()
      expect(getFragment(id)).toEqual(catalogFragment)
      expect(getFragment(id)).not.toBe(catalogFragment)
    },
  )
})
