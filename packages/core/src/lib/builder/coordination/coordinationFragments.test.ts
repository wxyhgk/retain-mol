import { describe, expect, it } from 'vitest'
import { validateFragmentLibrary } from '../kernel/FragmentValidator'
import { FE_COORDINATION_SET } from './elements/fe'
import { TRANSITION_METAL_COORDINATION_SETS } from './elements'
import { TRANSITION_METAL_COORDINATION_GEOMETRY_IDS } from './geometryCatalog'

describe('transition-metal coordination fragments', () => {
  it('defines 17 Fe coordination fragments plus the separate atom mode', () => {
    expect(TRANSITION_METAL_COORDINATION_GEOMETRY_IDS).toHaveLength(17)
    expect(FE_COORDINATION_SET.fragments).toHaveLength(17)
    expect(new Set(FE_COORDINATION_SET.fragments.map(fragment => fragment.id)).size).toBe(17)
  })

  it('keeps every Fe geometry independently owned and valid', () => {
    expect(validateFragmentLibrary(FE_COORDINATION_SET.fragments)).toEqual([])
    const directionArrays = FE_COORDINATION_SET.fragments.map(fragment => fragment.coordination?.directions)
    for (let index = 1; index < directionArrays.length; index++) {
      expect(directionArrays[index]).not.toBe(directionArrays[index - 1])
    }
  })

  it('matches each geometry coordination number to its authored directions', () => {
    for (const fragment of FE_COORDINATION_SET.fragments) {
      expect(fragment.group).toBe('coordination')
      expect(fragment.atoms[0]).toEqual({ symbol: 'Fe', x: 0, y: 0, z: 0 })
      expect(fragment.atoms).toHaveLength((fragment.coordination?.coordinationNumber ?? 0) + 1)
      expect(fragment.atoms.slice(1).every(atom => atom.symbol === 'H')).toBe(true)
      expect(fragment.bonds).toHaveLength(fragment.coordination?.coordinationNumber)
      expect(fragment.attachHIndex).toBe(1)
      expect(fragment.coordination?.directions).toHaveLength(fragment.coordination?.coordinationNumber)
    }
  })

  it('registers an independently owned 17-fragment set for every d-block metal', () => {
    expect(TRANSITION_METAL_COORDINATION_SETS).toHaveLength(38)
    expect(new Set(TRANSITION_METAL_COORDINATION_SETS.map(set => set.symbol)).size).toBe(38)
    for (const set of TRANSITION_METAL_COORDINATION_SETS) {
      expect(set.fragments).toHaveLength(17)
      expect(validateFragmentLibrary(set.fragments)).toEqual([])
      expect(set.fragments.every(fragment => fragment.atoms[0]?.symbol === set.symbol)).toBe(true)
      expect(set.fragments.every(fragment => fragment.atoms.length === (fragment.coordination?.coordinationNumber ?? 0) + 1)).toBe(true)
    }
  })
})
