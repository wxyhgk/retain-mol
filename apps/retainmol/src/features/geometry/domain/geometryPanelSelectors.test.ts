import { describe, expect, it } from 'vitest'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { selectGeometrySelection, selectMoleculeSummary } from './geometryPanelSelectors'

const molecule: Molecule = {
  atoms: [
    { id: 'c1', symbol: 'C', x: 0, y: 0, z: 0 },
    { id: 'o1', symbol: 'O', x: 1, y: 0, z: 0 },
    { id: 'h1', symbol: 'H', x: 0, y: 1, z: 0 },
    { id: 'h2', symbol: 'H', x: 0, y: -1, z: 0 },
  ],
  bonds: [
    { id: 'co', atomId1: 'c1', atomId2: 'o1', order: 2 },
    { id: 'ch', atomId1: 'c1', atomId2: 'h1', order: 1 },
  ],
}

describe('geometry panel selectors', () => {
  it('derives the molecular summary without store state', () => {
    const summary = selectMoleculeSummary(molecule)

    expect(summary.formula).toBe('CH2O')
    expect(summary.molecularWeight).toBeCloseTo(30.026, 6)
  })

  it('uses molecule order for display and selection order for geometry', () => {
    const selection = selectGeometrySelection(molecule, {
      selectedAtomIds: new Set(['h1', 'c1', 'o1']),
      selectedBondIds: new Set(['ch', 'co']),
    })

    expect(selection.selectedAtoms.map(atom => atom.id)).toEqual(['c1', 'o1', 'h1'])
    expect(selection.selectedBonds.map(bond => bond.id)).toEqual(['co', 'ch'])
    expect(selection.orderedAtoms.map(atom => atom.id)).toEqual(['h1', 'c1', 'o1'])
    expect(selection.atomById.get('o1')).toBe(molecule.atoms[1])
  })

  it('drops stale selection ids', () => {
    const selection = selectGeometrySelection(molecule, {
      selectedAtomIds: new Set(['missing', 'h2']),
      selectedBondIds: new Set(['missing']),
    })

    expect(selection.selectedAtoms.map(atom => atom.id)).toEqual(['h2'])
    expect(selection.selectedBonds).toEqual([])
    expect(selection.orderedAtoms.map(atom => atom.id)).toEqual(['h2'])
  })
})
