import { describe, expect, it } from 'vitest'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { buildSelectionInspectorModel } from './selectionInspectorModel'

const molecule: Molecule = {
  name: 'formaldehyde fragment',
  atoms: [
    { id: 'c', symbol: 'C', x: 0, y: 0, z: 0, charge: 1, radical: 1 },
    { id: 'o', symbol: 'O', x: 1.2, y: 0, z: 0 },
    { id: 'h1', symbol: 'H', x: 0, y: 1, z: 0 },
    { id: 'h2', symbol: 'H', x: 0, y: 1, z: 1 },
  ],
  bonds: [
    { id: 'co', atomId1: 'c', atomId2: 'o', order: 2, aromatic: true },
    { id: 'ch', atomId1: 'c', atomId2: 'h1', order: 1 },
  ],
}

describe('buildSelectionInspectorModel', () => {
  it('builds a molecule summary when selection is empty', () => {
    const model = buildSelectionInspectorModel(molecule, [], [])

    expect(model).toMatchObject({
      mode: 'molecule',
      formula: 'CH2O',
      atomCount: 4,
      bondCount: 2,
    })
    expect(model.mode === 'molecule' ? model.molecularWeight : null).toBeCloseTo(30.026, 6)
  })

  it('describes one atom with its number, inferred hybridization and neighbors', () => {
    const model = buildSelectionInspectorModel(molecule, ['c'], [])

    expect(model).toMatchObject({
      mode: 'atom',
      hybridization: 'sp2',
      atom: { number: 1, atom: { id: 'c', charge: 1, radical: 1 } },
      neighbors: [
        { atomNumber: 2, atom: { id: 'o' }, bond: { id: 'co' }, length: 1.2 },
        { atomNumber: 3, atom: { id: 'h1' }, bond: { id: 'ch' }, length: 1 },
      ],
    })
  })

  it('describes one bond and both indexed endpoints', () => {
    const model = buildSelectionInspectorModel(molecule, [], ['co'])

    expect(model).toMatchObject({
      mode: 'bond',
      bond: { id: 'co', order: 2, aromatic: true },
      first: { number: 1, atom: { id: 'c' } },
      second: { number: 2, atom: { id: 'o' } },
      length: 1.2,
    })
  })

  it('preserves selection order when calculating multi-atom geometry', () => {
    const model = buildSelectionInspectorModel(molecule, ['h1', 'c', 'o'], ['ch'])

    expect(model).toMatchObject({
      mode: 'multi',
      selectedAtomCount: 3,
      selectedBondCount: 1,
      atoms: [
        { atom: { id: 'h1' } },
        { atom: { id: 'c' } },
        { atom: { id: 'o' } },
      ],
      geometry: {
        kind: 'angle',
        atomIds: ['h1', 'c', 'o'],
        value: 90,
      },
    })
  })

  it('ignores stale ids instead of exposing missing entities', () => {
    const model = buildSelectionInspectorModel(molecule, ['missing'], ['missing'])

    expect(model.mode).toBe('molecule')
  })
})
