import { afterEach, describe, expect, it } from 'vitest'
import {
  computeFragmentDigest,
  getFragment,
  getFragmentByDigest,
  getFragmentDigest,
  listFragments,
  registerFragment,
  unregisterFragment,
  type FragmentDef,
} from './fragmentLibrary'

const valid: FragmentDef = {
  id: 'runtime-valid',
  name: 'Runtime valid',
  short: 'R',
  formula: 'CH4',
  atoms: [
    { symbol: 'C', x: 0, y: 0, z: 0 },
    { symbol: 'H', x: 1, y: 0, z: 0 },
  ],
  bonds: [{ a: 0, b: 1, order: 1 }],
  attachIndex: 0,
  attachHIndex: 1,
}

afterEach(() => {
  unregisterFragment(valid.id)
  unregisterFragment('runtime-invalid')
})

describe('runtime fragment registration', () => {
  it('validates topology before registration', () => {
    expect(() => registerFragment({
      ...valid,
      id: 'runtime-invalid',
      bonds: [{ a: 0, b: 9, order: 1 }],
    })).toThrow(/不存在的原子/)
    expect(getFragment('runtime-invalid')).toBeUndefined()
  })

  it('returns one entry per id when a runtime fragment is replaced', () => {
    registerFragment(valid)
    registerFragment({ ...valid, name: 'Replacement' })
    expect(listFragments().filter(fragment => fragment.id === valid.id)).toHaveLength(1)
    expect(getFragment(valid.id)?.name).toBe('Replacement')
  })

  it('does not expose mutable registry entries to callers', () => {
    const registered = registerFragment(valid)
    registered.name = 'Mutated return value'
    registered.atoms[0].symbol = 'N'

    const firstRead = getFragment(valid.id)!
    firstRead.name = 'Mutated read value'
    firstRead.atoms[0].symbol = 'O'

    expect(getFragment(valid.id)).toMatchObject({
      name: valid.name,
      atoms: [{ symbol: 'C' }, { symbol: 'H' }],
    })
  })

  it('retains immutable content when the same display id is re-registered', () => {
    const original = registerFragment(valid)
    const originalDigest = getFragmentDigest(valid.id)!
    const replacement = {
      ...valid,
      name: 'Replacement geometry',
      atoms: [
        { symbol: 'C', x: 0, y: 0, z: 0 },
        { symbol: 'H', x: 1.2, y: 0, z: 0 },
      ],
    } satisfies FragmentDef
    registerFragment(replacement)
    const replacementDigest = getFragmentDigest(valid.id)!

    expect(originalDigest).toBe(computeFragmentDigest(original))
    expect(replacementDigest).toBe(computeFragmentDigest(replacement))
    expect(replacementDigest).not.toBe(originalDigest)
    expect(getFragmentByDigest(originalDigest)).toMatchObject({
      name: valid.name,
      atoms: [{ symbol: 'C' }, { symbol: 'H', x: 1 }],
    })
    expect(getFragmentByDigest(replacementDigest)).toMatchObject({
      name: replacement.name,
      atoms: [{ symbol: 'C' }, { symbol: 'H', x: 1.2 }],
    })
  })
})
