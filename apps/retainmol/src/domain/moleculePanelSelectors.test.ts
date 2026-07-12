import { describe, expect, it } from 'vitest'
import type { Molecule } from '@retainmol/mol-viewer/core'
import {
  selectActiveMoleculeName,
  selectScenePanelRows,
} from './moleculePanelSelectors'

const molecule = (x: number, bonds: Molecule['bonds'] = []): Molecule => ({
  name: 'M',
  atoms: [
    { id: 'a1', symbol: 'C', x, y: 0, z: 0 },
    { id: 'a2', symbol: 'C', x: x + 1, y: 0, z: 0 },
  ],
  bonds,
})

const state = (mol: Molecule) => ({
  activeObjectId: 'obj',
  objectOrder: ['obj'],
  objectsById: {
    obj: { id: 'obj', name: 'Object', visible: true, locked: false, molecule: mol },
  },
})

describe('molecule panel selectors', () => {
  it('preserves scene rows across coordinate-only updates', () => {
    const first = selectScenePanelRows(state(molecule(0)))
    const second = selectScenePanelRows(state(molecule(5)))

    expect(second).toBe(first)
    expect(second[0]).toBe(first[0])
  })

  it('invalidates scene rows when topology changes', () => {
    const first = selectScenePanelRows(state(molecule(0)))
    const second = selectScenePanelRows(state(molecule(0, [
      { id: 'b1', atomId1: 'a1', atomId2: 'a2', order: 1 },
    ])))

    expect(second).not.toBe(first)
    expect(first[0].componentCount).toBe(2)
    expect(second[0].componentCount).toBe(1)
  })

  it('selects only the active molecule name for inspector chrome', () => {
    expect(selectActiveMoleculeName(state(molecule(0)))).toBe('M')
    expect(selectActiveMoleculeName({ ...state(molecule(0)), activeObjectId: null }))
      .toBe('New Molecule')
  })
})
