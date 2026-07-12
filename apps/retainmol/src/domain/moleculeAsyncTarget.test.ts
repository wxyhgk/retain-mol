import { describe, expect, it } from 'vitest'
import type { Molecule } from '@retainmol/mol-viewer/core'
import {
  captureActiveMoleculeTarget,
  isMoleculeTargetCurrent,
} from './moleculeAsyncTarget'

const molecule = (name: string): Molecule => ({ atoms: [], bonds: [], name })

describe('molecule async target', () => {
  it('keeps the original object target when the active object changes', () => {
    const first = molecule('first')
    const second = molecule('second')
    const target = captureActiveMoleculeTarget({
      activeObjectId: 'a',
      objectsById: { a: { molecule: first }, b: { molecule: second } },
    })

    expect(target).toEqual({ objectId: 'a', revision: first })
    expect(isMoleculeTargetCurrent({
      activeObjectId: 'b',
      objectsById: { a: { molecule: first }, b: { molecule: second } },
    }, target!)).toBe(true)
  })

  it('rejects a result after the target molecule is edited', () => {
    const first = molecule('first')
    const target = captureActiveMoleculeTarget({
      activeObjectId: 'a',
      objectsById: { a: { molecule: first } },
    })!

    expect(isMoleculeTargetCurrent({
      activeObjectId: 'a',
      objectsById: { a: { molecule: { ...first } } },
    }, target)).toBe(false)
  })

  it('rejects a result after the target object is removed', () => {
    const first = molecule('first')
    const target = captureActiveMoleculeTarget({
      activeObjectId: 'a',
      objectsById: { a: { molecule: first } },
    })!

    expect(isMoleculeTargetCurrent({
      activeObjectId: null,
      objectsById: {},
    }, target)).toBe(false)
  })
})
