import { describe, expect, it } from 'vitest'
import {
  createCoordinationFragmentForSite,
  getCoordinationSiteModel,
  listCoordinationFragmentsForElement,
} from './coordination'

describe('public coordination API', () => {
  it('lists the 17 independently registered Fe geometries', () => {
    expect(listCoordinationFragmentsForElement('Fe')).toHaveLength(17)
    expect(listCoordinationFragmentsForElement('C')).toEqual([])
  })

  it('creates a derived fragment whose attachment axis and order match the selected site', () => {
    const fragment = listCoordinationFragmentsForElement('Fe')
      .find(candidate => candidate.coordination?.geometryId === 'square-planar')!
    const model = getCoordinationSiteModel(fragment.id)!
    const selected = model.sites[2]
    const derived = createCoordinationFragmentForSite(fragment.id, selected.id)

    expect(derived.id).not.toBe(fragment.id)
    expect(derived.attachOrder).toBe(selected.bondOrder)
    expect(derived.attachDirection).toEqual(selected.direction)
    expect(derived.bonds.some(bond =>
      bond.coordinationSiteId === selected.id &&
      (bond.a === derived.attachIndex || bond.b === derived.attachIndex) &&
      (bond.a === derived.attachHIndex || bond.b === derived.attachHIndex),
    )).toBe(true)
  })

  it('returns defensive site copies', () => {
    const fragment = listCoordinationFragmentsForElement('Fe')[0]
    const first = getCoordinationSiteModel(fragment.id)!
    const second = getCoordinationSiteModel(fragment.id)!
    expect(first.sites).not.toBe(second.sites)
    expect(first.sites[0]).not.toBe(second.sites[0])
    expect(first.sites[0].direction).not.toBe(second.sites[0].direction)
  })
})
