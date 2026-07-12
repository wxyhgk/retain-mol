import { describe, expect, it } from 'vitest'
import { defineTransitionMetalCoordinationSet } from './createTransitionMetalFragments'
import { FE_COORDINATION_SET } from './elements/fe'
import { COORDINATION_GEOMETRY_CATALOG } from './geometryCatalog'
import type { CoordinationGeometryId } from './types'

const GEOMETRIES = [
  ['linear', 2],
  ['trigonal-planar', 3],
  ['t-shaped', 3],
  ['trigonal-pyramidal', 3],
  ['tetrahedral', 4],
  ['square-planar', 4],
  ['trigonal-bipyramidal', 5],
  ['square-pyramidal', 5],
  ['octahedral-d3d', 6],
  ['trigonal-prismatic-d3h', 6],
  ['pentagonal-bipyramidal-d5h', 7],
  ['capped-octahedral-c3v', 7],
  ['square-antiprismatic-d4d', 8],
  ['dodecahedral-d2d', 8],
  ['tricapped-trigonal-prismatic-d3h', 9],
  ['capped-square-antiprismatic-c4v', 9],
  ['pentagonal-prismatic-d5h', 10],
] as const satisfies readonly (readonly [CoordinationGeometryId, number])[]

describe('coordination-site contract', () => {
  it.each(GEOMETRIES)('%s exposes complete, uniquely identified unit-vector sites', (geometryId, coordinationNumber) => {
    const geometry = COORDINATION_GEOMETRY_CATALOG[geometryId]

    expect(geometry.sites).toHaveLength(coordinationNumber)
    expect(new Set(geometry.sites.map(site => site.id)).size).toBe(coordinationNumber)

    for (const site of geometry.sites) {
      expect(site.id.trim()).not.toBe('')
      expect(Math.hypot(...site.direction)).toBeCloseTo(1, 10)
      expect([1, 2, 3]).toContain(site.bondOrder)
      expect(site.equivalenceGroup.trim()).not.toBe('')
    }
  })

  it('uses single bonds for every default Fe coordination site', () => {
    expect(FE_COORDINATION_SET.fragments).toHaveLength(GEOMETRIES.length)

    for (const fragment of FE_COORDINATION_SET.fragments) {
      expect(fragment.bonds).toHaveLength(fragment.coordination?.coordinationNumber)
      expect(fragment.bonds.every(bond => bond.order === 1)).toBe(true)
    }
  })

  it('applies a site override locally without mutating the geometry catalog', () => {
    const geometry = COORDINATION_GEOMETRY_CATALOG['square-planar']
    const [overriddenSite, untouchedSite] = geometry.sites
    const catalogSnapshot = structuredClone(geometry)

    const customSet = defineTransitionMetalCoordinationSet('Fe', [{
      geometryId: geometry.id,
      siteOverrides: {
        [overriddenSite.id]: { bondOrder: 2 },
      },
    }])

    const [fragment] = customSet.fragments
    expect(fragment.bonds[0]?.order).toBe(2)
    expect(fragment.bonds[1]?.order).toBe(1)
    expect(fragment.coordination?.sites.find(site => site.id === overriddenSite.id)?.bondOrder).toBe(2)
    expect(fragment.coordination?.sites.find(site => site.id === untouchedSite.id)?.bondOrder).toBe(1)
    expect(COORDINATION_GEOMETRY_CATALOG['square-planar']).toEqual(catalogSnapshot)
    expect(FE_COORDINATION_SET.fragments.find(item => item.coordination?.geometryId === geometry.id)
      ?.bonds.every(bond => bond.order === 1)).toBe(true)
  })
})
