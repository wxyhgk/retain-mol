import { describe, expect, it } from 'vitest'
import {
  createFragmentForAttachmentSite,
  getFragmentAttachmentSites,
  registerFragment,
  unregisterFragment,
} from './fragments'
import { getFragment as getInternalFragment } from '../lib/builder/fragmentLibrary'
import { attachFragmentToAtom, placeFragmentStandalone } from '../lib/builder/editing/fragment'

const groupKeys = (fragmentId: string) => new Set(
  getFragmentAttachmentSites(fragmentId).map(site => `${site.equivalenceGroup}:${site.bondOrder}`),
)

describe('public fragment attachment sites', () => {
  it('collapses carbon sp3 to one chemical equivalence class', () => {
    expect(groupKeys('c-sp3')).toEqual(new Set(['bond-order-1:1']))
  })

  it('exposes distinct single/double and single/triple sites', () => {
    expect(groupKeys('c-sp2')).toEqual(new Set(['bond-order-2:2', 'bond-order-1:1']))
    expect(groupKeys('c-sp')).toEqual(new Set(['bond-order-3:3', 'bond-order-1:1']))
  })

  it('derives a fragment using the selected hybrid site order', () => {
    const singleSite = getFragmentAttachmentSites('c-sp2').find(site => site.bondOrder === 1)
    expect(singleSite).toBeDefined()
    const fragment = createFragmentForAttachmentSite('c-sp2', singleSite!.id)
    expect(fragment).toMatchObject({ attachOrder: 1, attachHIndex: Number(singleSite!.id.slice(5)) })
    expect(fragment.atoms.filter(atom => atom.symbol === 'C')).toHaveLength(2)
    expect(fragment.bonds.some(bond => bond.order === 2)).toBe(true)
  })

  it('materializes the missing triple-bond partner for a carbon sp single site', () => {
    const singleSite = getFragmentAttachmentSites('c-sp').find(site => site.bondOrder === 1)
    const fragment = createFragmentForAttachmentSite('c-sp', singleSite!.id)

    expect(fragment.atoms.filter(atom => atom.symbol === 'C')).toHaveLength(2)
    expect(fragment.bonds.some(bond => bond.order === 3)).toBe(true)
  })

  it('attaches a complete vinyl group through the selected single-bond site', () => {
    const methaneFragment = getInternalFragment('c-sp3')!
    const methane = placeFragmentStandalone({ atoms: [], bonds: [] }, methaneFragment, { x: 0, y: 0, z: 0 })
    const targetHydrogen = methane.atoms.find(atom => atom.symbol === 'H')!
    const singleSite = getFragmentAttachmentSites('c-sp2').find(site => site.bondOrder === 1)!
    const registered = registerFragment(createFragmentForAttachmentSite('c-sp2', singleSite.id))
    const derived = getInternalFragment(registered.id)!

    try {
      const result = attachFragmentToAtom(methane, derived, targetHydrogen.id)
      expect(result.ok).toBe(true)
      if (result.ok === false) throw new Error(result.reason)
      expect(result.molecule.atoms.filter(atom => atom.symbol === 'C')).toHaveLength(3)
      expect(result.molecule.bonds.some(bond => bond.order === 2)).toBe(true)
    } finally {
      unregisterFragment(derived.id)
    }
  })
})
