import { describe, expect, it } from 'vitest'
import type { FragmentDef } from '../../builder/fragment/model'
import {
  freezeFragmentAttachProfile,
  isFragmentAttachProfileSha256,
  serializeCanonicalFragmentAttachProfile,
} from './attachProfile'

function fragment(): FragmentDef {
  return {
    id: 'profile-fixture',
    name: 'Profile fixture',
    short: 'PF',
    formula: 'C4H',
    atoms: [
      { symbol: 'C', x: 0, y: 0, z: 0 },
      { symbol: 'H', x: 1, y: 0, z: 0 },
      { symbol: 'C', x: 0, y: 1, z: 0 },
      { symbol: 'C', x: 0, y: 0, z: 1 },
      { symbol: 'C', x: -1, y: -1, z: -1 },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
      { a: 0, b: 4, order: 1 },
    ],
    attachIndex: 0,
    attachHIndex: 1,
    attachOrder: 1,
    group: 'group',
  }
}

const selection = {
  profileId: 'profile-fixture-v1',
  rigidFrameAxisAtomIndex: 2,
  guestRadialAtomIndex: 3,
  handednessAtomIndex: 4,
} as const

describe('fragment attach profile', () => {
  it('freezes canonical fragment bytes and one policy-owned port frame', () => {
    const frozen = freezeFragmentAttachProfile(fragment(), selection)

    expect(frozen.profile).toMatchObject({
      schemaVersion: 1,
      fragmentId: 'profile-fixture',
      attachAtomIndex: 0,
      authoredAttachHydrogenIndex: 1,
      rigidFrameAxisAtomIndex: 2,
      guestRadialAtomIndex: 3,
      handednessAtomIndex: 4,
      linkBondOrder: 1,
      torsionZero: 'projected-radials-aligned',
      torsionPositiveAxis: 'host-to-guest',
    })
    expect(frozen.profile.fragmentDigest).toBe(
      `fragment-v1-sha256-${frozen.profile.fragmentCanonicalBytesSha256}`,
    )
    expect(frozen.profile.fragmentDigest).toBe(
      'fragment-v1-sha256-9f10fdaff76ae3666e4913067b2c1d3e9234e3b1be16299ebbc82c428822fb0f',
    )
    expect(isFragmentAttachProfileSha256(frozen.profileSha256)).toBe(true)
    expect(frozen.profileCanonicalJson).toBe(
      serializeCanonicalFragmentAttachProfile(frozen.profile),
    )
  })

  it('is deterministic and binds authored coordinates', () => {
    const first = freezeFragmentAttachProfile(fragment(), selection)
    const second = freezeFragmentAttachProfile(fragment(), selection)
    const moved = fragment()
    moved.atoms[4]!.z = -2
    const third = freezeFragmentAttachProfile(moved, selection)

    expect(second).toEqual(first)
    expect(third.profile.fragmentDigest).not.toBe(first.profile.fragmentDigest)
    expect(third.profileSha256).not.toBe(first.profileSha256)
  })

  it('rejects aliased or degenerate port witnesses', () => {
    expect(() => freezeFragmentAttachProfile(fragment(), {
      ...selection,
      guestRadialAtomIndex: selection.rigidFrameAxisAtomIndex,
    })).toThrow(/pairwise distinct/)

    const planar = fragment()
    planar.atoms[4] = { symbol: 'C', x: 0, y: -1, z: -1 }
    expect(() => freezeFragmentAttachProfile(planar, selection)).toThrow(/handedness witness/)

    const quantizedCollapse = fragment()
    quantizedCollapse.atoms[2] = { symbol: 'C', x: 0, y: 0.0004, z: 0 }
    expect(() => freezeFragmentAttachProfile(quantizedCollapse, selection)).toThrow(/degenerate axis/)
  })

  it('requires every rigid-frame witness to survive in the retained component', () => {
    const disconnected = fragment()
    disconnected.bonds = disconnected.bonds.filter(bond => !(
      (bond.a === 0 && bond.b === 4) || (bond.a === 4 && bond.b === 0)
    ))

    expect(() => freezeFragmentAttachProfile(disconnected, selection)).toThrow(
      /handednessAtomIndex must remain connected/,
    )
  })
})
