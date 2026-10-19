import { describe, expect, it } from 'vitest'
import { lookupBondLengthByOrder } from '../../../../config/geometry.config'
import type { Molecule } from '../../../molecule'
import { getFragment } from '../../fragment/registry'
import { distance, type Vec3 } from '../../math'
import { bridgeFragmentBetweenAtoms } from './bridge'

function bridgeHost(distanceBetweenHosts = 2.55): Molecule {
  const half = distanceBetweenHosts / 2
  const bondLength = lookupBondLengthByOrder('C', 'C', 1) ?? 1.54
  const height = Math.sqrt(Math.max(0, bondLength * bondLength - half * half))
  const hBondLength = 1.09
  const firstDirection: Vec3 = [half, height, 0]
  const secondDirection: Vec3 = [-half, height, 0]
  const firstScale = hBondLength / Math.hypot(...firstDirection)
  const secondScale = hBondLength / Math.hypot(...secondDirection)
  return {
    name: 'bridge-host',
    atoms: [
      { id: 'left', symbol: 'C', x: -half, y: 0, z: 0 },
      { id: 'right', symbol: 'C', x: half, y: 0, z: 0 },
      {
        id: 'left-h', symbol: 'H',
        x: -half + firstDirection[0] * firstScale,
        y: firstDirection[1] * firstScale,
        z: 0,
      },
      {
        id: 'right-h', symbol: 'H',
        x: half + secondDirection[0] * secondScale,
        y: secondDirection[1] * secondScale,
        z: 0,
      },
    ],
    bonds: [
      { id: 'left-h-bond', atomId1: 'left', atomId2: 'left-h', order: 1 },
      { id: 'right-h-bond', atomId1: 'right', atomId2: 'right-h', order: 1 },
    ],
  }
}

describe('bridgeFragmentBetweenAtoms', () => {
  it('replaces two target H atoms while preserving hosts and rigid template geometry', () => {
    const fragment = getFragment('fluorene-9h-site-a')
    expect(fragment).toBeDefined()
    if (!fragment) return
    const host = bridgeHost()
    const result = bridgeFragmentBetweenAtoms(host, fragment, 'left-h', 'right-h')

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.molecule.atoms.some(atom => atom.id === 'left-h' || atom.id === 'right-h')).toBe(false)
    expect(result.molecule.bonds.some(bond => (
      bond.id === 'left-h-bond' || bond.id === 'right-h-bond'
    ))).toBe(false)
    expect(result.molecule.atoms.find(atom => atom.id === 'left')).toEqual(host.atoms[0])
    expect(result.molecule.atoms.find(atom => atom.id === 'right')).toEqual(host.atoms[1])

    const addedAtoms = result.molecule.atoms.filter(atom => !host.atoms.some(base => base.id === atom.id))
    expect(addedAtoms).toHaveLength(21)
    const center = addedAtoms[6]
    const firstAdded = addedAtoms[0]
    const secondAdded = addedAtoms[1]
    expect(center?.symbol).toBe('C')
    expect(firstAdded).toBeDefined()
    expect(secondAdded).toBeDefined()
    if (!center || !firstAdded || !secondAdded) return
    const expectedBondLength = lookupBondLengthByOrder('C', 'C', 1) ?? 1.54
    const left = result.molecule.atoms.find(atom => atom.id === 'left')
    const right = result.molecule.atoms.find(atom => atom.id === 'right')
    expect(left && distance([left.x, left.y, left.z], [center.x, center.y, center.z]))
      .toBeCloseTo(expectedBondLength, 6)
    expect(right && distance([right.x, right.y, right.z], [center.x, center.y, center.z]))
      .toBeCloseTo(expectedBondLength, 6)
    expect(distance(
      [firstAdded.x, firstAdded.y, firstAdded.z],
      [secondAdded.x, secondAdded.y, secondAdded.z],
    )).toBeCloseTo(distance(
      [fragment.atoms[0]!.x, fragment.atoms[0]!.y, fragment.atoms[0]!.z],
      [fragment.atoms[1]!.x, fragment.atoms[1]!.y, fragment.atoms[1]!.z],
    ), 8)
    expect(result.molecule.bonds.filter(bond => (
      (bond.atomId1 === center.id && (bond.atomId2 === 'left' || bond.atomId2 === 'right'))
      || (bond.atomId2 === center.id && (bond.atomId1 === 'left' || bond.atomId1 === 'right'))
    ))).toHaveLength(2)
  })

  it('rejects geometrically impossible targets without mutating the input', () => {
    const fragment = getFragment('fluorene-9h-site-a')
    expect(fragment).toBeDefined()
    if (!fragment) return
    const host = bridgeHost(4)
    const before = structuredClone(host)
    const result = bridgeFragmentBetweenAtoms(host, fragment, 'left-h', 'right-h')
    expect(result).toMatchObject({ ok: false })
    expect(host).toEqual(before)
  })

  it('requires explicit bridge metadata instead of guessing a second H', () => {
    const fragment = getFragment('benzene')
    expect(fragment).toBeDefined()
    if (!fragment) return
    const result = bridgeFragmentBetweenAtoms(bridgeHost(), fragment, 'left-h', 'right-h')
    expect(result).toEqual({ ok: false, reason: '模板没有声明 bridgeAttachment 双锚点元数据' })
  })
})
