import { afterEach, describe, expect, it } from 'vitest'
import type { FragmentDef } from './model'
import {
  computeFragmentDigest,
  getFragment,
  getFragmentByDigest,
  registerFragment,
  unregisterFragment,
} from './registry'

const TEST_ID = 'registry-deep-copy'

function createFragment(name = 'Registry deep copy', hydrogenX = 1): FragmentDef {
  return {
    id: TEST_ID,
    name,
    short: 'R',
    formula: 'C2H2',
    atoms: [
      { symbol: 'C', x: 0, y: 0, z: 0 },
      { symbol: 'H', x: hydrogenX, y: 0, z: 0 },
      { symbol: 'H', x: 0, y: 1, z: 0 },
      { symbol: 'C', x: 0, y: 0, z: 1 },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1, coordinationSiteId: 'site-a' },
    ],
    attachIndex: 0,
    attachHIndex: 1,
    attachDirection: [1, 0, 0],
    attachBond: [0, 3],
    bridgeAttachment: {
      centerIndex: 0,
      sites: [
        { leavingHydrogenIndex: 1, order: 1 },
        { leavingHydrogenIndex: 2, order: 1 },
      ],
    },
    group: 'coordination',
    coordination: {
      geometryId: 'registry-test',
      coordinationNumber: 1,
      pointGroup: 'C1',
      directions: [[0, 0, 1]],
      sites: [{
        id: 'site-a',
        label: 'Site A',
        direction: [0, 0, 1],
        bondOrder: 1,
        equivalenceGroup: 'a',
      }],
    },
  }
}

afterEach(() => {
  unregisterFragment(TEST_ID)
})

describe('custom fragment registry', () => {
  it('isolates every nested registry value from caller mutation', () => {
    const input = createFragment()
    const expected = createFragment()
    const digest = computeFragmentDigest(expected)
    const registered = registerFragment(input)

    input.atoms[0]!.symbol = 'N'
    input.bonds[0]!.order = 2
    input.attachDirection![0] = -1
    input.attachBond![0] = 3
    input.bridgeAttachment!.sites[0].leavingHydrogenIndex = 2
    input.coordination!.directions[0]![0] = 1
    const inputSite = input.coordination!.sites[0]! as unknown as {
      label: string
      direction: [number, number, number]
    }
    inputSite.label = 'Mutated input site'
    inputSite.direction[2] = -1

    registered.atoms[1]!.x = 99
    registered.attachDirection![1] = 99
    registered.coordination!.directions[0]![1] = 99

    expect(getFragment(TEST_ID)).toEqual(expected)
    expect(getFragmentByDigest(digest)).toEqual(expected)
  })

  it('preserves replacement history until unregister, then removes id and every digest', () => {
    const original = createFragment('Original')
    registerFragment(original)
    const originalDigest = computeFragmentDigest(original)

    const replacement = createFragment('Replacement', 1.2)
    registerFragment(replacement)
    const replacementDigest = computeFragmentDigest(replacement)

    expect(getFragment(TEST_ID)).toEqual(replacement)
    expect(getFragmentByDigest(originalDigest)).toEqual(original)
    expect(getFragmentByDigest(replacementDigest)).toEqual(replacement)

    expect(unregisterFragment(TEST_ID)).toBe(true)
    expect(getFragment(TEST_ID)).toBeUndefined()
    expect(getFragmentByDigest(originalDigest)).toBeUndefined()
    expect(getFragmentByDigest(replacementDigest)).toBeUndefined()
  })
})
