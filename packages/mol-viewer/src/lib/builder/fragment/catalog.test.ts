import { describe, expect, it } from 'vitest'
import { FRAGMENTS } from './catalog'
import { COORDINATION_FRAGMENTS } from './catalogs/coordination'
import { ORGANIC_STUB_FRAGMENTS } from './catalogs/organicStubs'
import { RIGID_GROUP_FRAGMENTS } from './catalogs/rigidGroups'
import { RING_FRAGMENTS } from './catalogs/rings'
import { getFragment } from './registry'

describe('built-in fragment catalog', () => {
  it('aggregates each catalog in stable order without duplicate ids', () => {
    const expected = [
      ...ORGANIC_STUB_FRAGMENTS,
      ...COORDINATION_FRAGMENTS,
      ...RING_FRAGMENTS,
      ...RIGID_GROUP_FRAGMENTS,
    ]

    expect(FRAGMENTS).toEqual(expected)
    expect(FRAGMENTS.map(fragment => fragment.id)).toEqual(expected.map(fragment => fragment.id))
    expect(new Set(FRAGMENTS.map(fragment => fragment.id)).size).toBe(FRAGMENTS.length)
  })

  it.each(['c-sp3', COORDINATION_FRAGMENTS[0]!.id, 'benzene', 'fluorene-9h-site-a'])(
    'preserves getFragment lookup for %s',
    (id) => {
      const catalogFragment = FRAGMENTS.find(fragment => fragment.id === id)
      expect(catalogFragment).toBeDefined()
      expect(getFragment(id)).toEqual(catalogFragment)
      expect(getFragment(id)).not.toBe(catalogFragment)
    },
  )

  it('keeps the two rigid fluorene sites on the same C9 geometry', () => {
    const siteA = getFragment('fluorene-9h-site-a')
    const siteB = getFragment('fluorene-9h-site-b')

    expect(siteA).toBeDefined()
    expect(siteB).toBeDefined()
    expect(siteA?.atoms).toEqual(siteB?.atoms)
    expect(siteA?.bonds).toEqual(siteB?.bonds)
    expect(siteA?.attachIndex).toBe(6)
    expect(siteB?.attachIndex).toBe(6)
    expect([siteA?.attachHIndex, siteB?.attachHIndex]).toEqual([17, 18])
    expect(siteA?.bridgeAttachment).toEqual({
      centerIndex: 6,
      sites: [
        { leavingHydrogenIndex: 17, order: 1 },
        { leavingHydrogenIndex: 18, order: 1 },
      ],
    })
    expect(siteB?.bridgeAttachment?.sites.map(site => site.leavingHydrogenIndex)).toEqual([18, 17])
  })
})
