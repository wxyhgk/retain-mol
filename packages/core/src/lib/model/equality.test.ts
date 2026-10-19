import { describe, expect, it } from 'vitest'
import type { Molecule } from './types'
import { moleculesEqual } from './equality'

const molecule: Molecule = {
  atoms: [{ id: 'a', symbol: 'C', isotope: 13, label: 'anchor', x: 0, y: 0, z: 0,
    coordinationSites: [{ id: 'site', label: 'axial', direction: [1, 0, 0], bondOrder: 1, equivalenceGroup: 'axial' }],
  }], bonds: [],
}

describe('molecular data equality', () => {
  it('compares data independently of object key insertion order and absent optional fields', () => {
    expect(moleculesEqual(molecule, {
      bonds: [], name: undefined,
      atoms: [{ ...molecule.atoms[0]!, coordinationSites: structuredClone(molecule.atoms[0]!.coordinationSites) }],
    })).toBe(true)
  })

  it('detects identity, properties, tiny coordinate changes and nested metadata changes', () => {
    for (const patch of [
      { id: 'different' }, { isotope: 12 }, { label: 'new' }, { x: 1e-12 }, { chirality: 'R' as const },
      { coordinationSites: [{ ...molecule.atoms[0]!.coordinationSites![0]!, direction: [0, 1, 0] as const }] },
    ]) {
      expect(moleculesEqual(molecule, { ...molecule, atoms: [{ ...molecule.atoms[0]!, ...patch }] })).toBe(false)
    }
    expect(moleculesEqual(molecule, { ...molecule, name: 'renamed' })).toBe(false)
  })
})
