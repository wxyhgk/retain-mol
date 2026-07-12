import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../molecule'
import { instantiate } from '../editing/fragment/instantiate'
import { attachFragmentToAtom, placeFragmentStandalone } from '../editing/fragment'
import { calcAddAtomOnExisting, getGrowGuide } from '../geometry/vsepr'
import { canGrowFrom } from '../queries'
import { maxValence } from '../valence'
import { FE_COORDINATION_SET } from './elements/fe'

describe('authored transition-metal coordination growth', () => {
  it('persists authored geometry and raises the hard capacity for high coordination', () => {
    const fragment = FE_COORDINATION_SET.fragments.find(candidate =>
      candidate.coordination?.geometryId === 'pentagonal-prismatic-d5h')!
    const instance = instantiate(fragment, point => point)
    const iron = instance.atoms[0]

    expect(iron.coordinationGeometry).toBe('pentagonal-prismatic-d5h')
    expect(iron.coordinationDirections).toHaveLength(10)
    expect(maxValence(iron)).toBe(10)
  })

  it('uses remaining authored sites for guides and growth', () => {
    const fragment = FE_COORDINATION_SET.fragments.find(candidate =>
      candidate.coordination?.geometryId === 'square-planar')!
    const iron = instantiate(fragment, point => point).atoms[0]
    const carbon = newAtom('C', iron.x + 1.5, iron.y, iron.z)
    const molecule = { atoms: [iron, carbon], bonds: [newBond(iron.id, carbon.id)] }

    const guide = getGrowGuide(iron, molecule.bonds, molecule.atoms, 'C')
    expect(guide.kind).toBe('points')
    if (guide.kind === 'points') expect(guide.positions).toHaveLength(3)

    const next = calcAddAtomOnExisting(iron, molecule.bonds, molecule.atoms, 'C')
    expect(next.geometry).toBe('square-planar')
    expect(next.availableSlots).toBe(3)
    expect(canGrowFrom(molecule, iron.id)).toBe(true)
  })

  it('places visible H slots and consumes one slot when attached to a host', () => {
    const fragment = FE_COORDINATION_SET.fragments.find(candidate =>
      candidate.coordination?.geometryId === 'tetrahedral')!

    const standalone = placeFragmentStandalone(
      { atoms: [], bonds: [] },
      fragment,
      { x: 4, y: 5, z: 6 },
    )
    const standaloneIron = standalone.atoms.find(atom => atom.symbol === 'Fe')!
    expect(standalone.atoms.filter(atom => atom.symbol === 'H')).toHaveLength(4)
    expect(standalone.bonds).toHaveLength(4)
    expect(standaloneIron).toMatchObject({ x: 4, y: 5, z: 6 })

    const carbon = newAtom('C', 0, 0, 0)
    const slotHydrogen = newAtom('H', 1.09, 0, 0)
    const attached = attachFragmentToAtom(
      { atoms: [carbon, slotHydrogen], bonds: [newBond(carbon.id, slotHydrogen.id)] },
      fragment,
      slotHydrogen.id,
    )
    expect(attached.ok).toBe(true)
    if (!attached.ok) return
    expect(attached.molecule.atoms.filter(atom => atom.symbol === 'Fe')).toHaveLength(1)
    expect(attached.molecule.atoms.filter(atom => atom.symbol === 'H')).toHaveLength(3)
    expect(attached.molecule.bonds).toHaveLength(4)
  })
})
