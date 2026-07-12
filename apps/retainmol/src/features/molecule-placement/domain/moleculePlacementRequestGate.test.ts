import { describe, expect, it } from 'vitest'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { MoleculePlacementRequestGate } from './moleculePlacementRequestGate'

const molecule = (name: string): Molecule => ({ atoms: [], bonds: [], name })

describe('MoleculePlacementRequestGate', () => {
  it('allows only the latest concurrent replace request to commit', () => {
    const gate = new MoleculePlacementRequestGate()
    const current = molecule('current')
    const state = { activeObjectId: 'a', objectsById: { a: { molecule: current } } }
    const first = gate.begin(state, 'replace', 3)
    const second = gate.begin(state, 'replace', 3)

    expect(gate.canCommit(state, first, 3)).toBe(false)
    expect(gate.canCommit(state, second, 3)).toBe(true)
  })

  it('rejects replace after the active object or its molecule revision changes', () => {
    const gate = new MoleculePlacementRequestGate()
    const current = molecule('current')
    const state = {
      activeObjectId: 'a',
      objectsById: { a: { molecule: current }, b: { molecule: molecule('b') } },
    }
    const request = gate.begin(state, 'replace', 5)

    expect(gate.canCommit({ ...state, activeObjectId: 'b' }, request, 5)).toBe(false)
    expect(gate.canCommit(state, request, 6)).toBe(false)
  })

  it('does not make independent add-to-scene requests compete', () => {
    const gate = new MoleculePlacementRequestGate()
    const state = { activeObjectId: null, objectsById: {} }
    const first = gate.begin(state, 'add-to-scene', 1)
    const second = gate.begin(state, 'add-to-scene', 2)

    expect(gate.canCommit(state, first, 3)).toBe(true)
    expect(gate.canCommit(state, second, 3)).toBe(true)
  })
})
