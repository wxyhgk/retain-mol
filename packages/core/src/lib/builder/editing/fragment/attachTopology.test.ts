import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../../molecule'
import { getFragment } from '../../fragmentLibrary'
import { applyAttachFragmentTopology } from './attachTopology'
import { identityQuat } from '../../math'

describe('applyAttachFragmentTopology', () => {
  it('removes displaced atoms and their bonds before adding the fragment', () => {
    const fragment = getFragment('c-sp3')
    expect(fragment).toBeDefined()
    if (!fragment) return

    const host = newAtom('C', 0, 0, 0)
    const displacedH = newAtom('H', 1, 0, 0)
    const untouchedH = newAtom('H', -1, 0, 0)
    const displacedBond = newBond(host.id, displacedH.id)
    const untouchedBond = newBond(host.id, untouchedH.id)

    const molecule = applyAttachFragmentTopology({
      molecule: { atoms: [host, displacedH, untouchedH], bonds: [displacedBond, untouchedBond] },
      fragment,
      host,
      order: 1,
      attachOrigin: [0, 0, 0],
      rotation: identityQuat(),
      anchor: [2, 0, 0],
      removeAtomIds: new Set([displacedH.id]),
    })

    expect(molecule.atoms.some(atom => atom.id === displacedH.id)).toBe(false)
    expect(molecule.bonds.some(bond => bond.id === displacedBond.id)).toBe(false)
    expect(molecule.atoms.some(atom => atom.id === untouchedH.id)).toBe(true)
    expect(molecule.bonds.some(bond => bond.id === untouchedBond.id)).toBe(true)
  })

  it('adds a link bond from host to the instantiated attach atom', () => {
    const fragment = getFragment('c-sp2')
    expect(fragment).toBeDefined()
    if (!fragment) return

    const host = newAtom('C', 0, 0, 0)
    const molecule = applyAttachFragmentTopology({
      molecule: { atoms: [host], bonds: [] },
      fragment,
      host,
      order: 2,
      attachOrigin: [0, 0, 0],
      rotation: identityQuat(),
      anchor: [1.34, 0, 0],
      removeAtomIds: new Set(),
    })

    const newHeavyAtoms = molecule.atoms.filter(atom => atom.id !== host.id && atom.symbol === 'C')
    expect(newHeavyAtoms).toHaveLength(1)

    const linkBond = molecule.bonds.find(bond =>
      bond.order === 2
      && ((bond.atomId1 === host.id && bond.atomId2 === newHeavyAtoms[0].id)
        || (bond.atomId2 === host.id && bond.atomId1 === newHeavyAtoms[0].id)),
    )
    expect(linkBond).toBeDefined()

    const expectedAtomCount = 1 + fragment.atoms.length - 1
    expect(molecule.atoms).toHaveLength(expectedAtomCount)
  })
})
